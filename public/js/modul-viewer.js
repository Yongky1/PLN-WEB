import * as THREE from 'three';
import { GLTFLoader } from '/scripts/three/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '/scripts/three/jsm/controls/OrbitControls.js';
import { EffectComposer } from '/scripts/three/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/scripts/three/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from '/scripts/three/jsm/postprocessing/OutlinePass.js';
import { OutputPass } from '/scripts/three/jsm/postprocessing/OutputPass.js';
import { DRACOLoader } from '/scripts/three/jsm/loaders/DRACOLoader.js';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const canvas          = document.getElementById('three-canvas');
const container       = document.getElementById('viewer-container');
const spinnerEl       = document.getElementById('loading-spinner');
const loadingTextEl   = document.getElementById('loading-text');
const posterContainer = document.getElementById('poster-container');
const hintText        = document.getElementById('hint-text');
const variantNameEl   = document.getElementById('viewer-variant-name');
const meshPanel       = document.getElementById('mesh-info-panel');
const meshPanelName   = document.getElementById('mesh-panel-name');
const meshPanelClose  = document.getElementById('mesh-panel-close');

let currentAssets = [];
let currentIndex  = 0;
let currentModel  = null;
let selectedMesh  = null;
let hoveredMesh   = null;
let _focusAnim    = null; // { fromPos, fromTarget, toPos, toTarget, t, duration }

// ── Module data (mesh_name → DB materials/tools) ──────────────────────────────
let moduleMaterials = [];
let moduleTools     = [];
let moduleId        = null;
let mappedMeshSet      = null; // null = belum di-fetch, Set = sudah (bisa kosong)
let meshDisplayNameMap = {}; // mesh_original_name → mesh_display_name
try {
    const _d    = JSON.parse(document.getElementById('module-data').textContent);
    moduleMaterials = _d.materials || [];
    moduleTools     = _d.tools     || [];
    moduleId        = _d.id        || null;
} catch (_) {}

// ── Three.js ──────────────────────────────────────────────────────────────────
const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace    = THREE.SRGBColorSpace;
renderer.toneMapping         = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled   = true;
renderer.shadowMap.type      = THREE.PCFSoftShadowMap;

const composer   = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = new OutlinePass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    scene,
    camera
);
outlinePass.visibleEdgeColor.set('#f59e0b');
outlinePass.hiddenEdgeColor.set('#f59e0b');
outlinePass.edgeStrength  = 5.0;
outlinePass.edgeThickness = 2.5;
outlinePass.edgeGlow      = 0.8;
outlinePass.pulsePeriod   = 2;
composer.addPass(outlinePass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping   = true;
controls.dampingFactor   = 0.05;
controls.enablePan       = true;
controls.minDistance     = 0.3;
controls.maxDistance     = 50;
controls.autoRotate      = true;
controls.autoRotateSpeed = 0.8;

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
dirLight.position.set(3, 5, 3);
dirLight.castShadow = true;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x8899cc, 0.6);
fillLight.position.set(-2, -1, -3);
scene.add(fillLight);

const loader    = new GLTFLoader();

// Konfigurasi DRACOLoader untuk decompresi file GLB yang dikompres (seperti buatan Google model-viewer/blender draco)
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/scripts/three/jsm/libs/draco/gltf/');
loader.setDRACOLoader(dracoLoader);

const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();

// ── Resize ────────────────────────────────────────────────────────────────────
function updateSize() {
    if (!container || !canvas) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    outlinePass.resolution.set(w, h);
}

function focusCameraOnMesh(mesh) {
    const box    = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 0.5;

    const fov      = camera.fov * (Math.PI / 180);
    const distance = Math.max((maxDim / 2) / Math.tan(fov / 2) * 2.0, controls.minDistance + 0.1);

    // Pertahankan arah kamera sekarang, cukup geser target & jarak
    const dir    = camera.position.clone().sub(controls.target).normalize();
    const toPos  = center.clone().add(dir.multiplyScalar(distance));

    _focusAnim = {
        fromPos:    camera.position.clone(),
        fromTarget: controls.target.clone(),
        toPos,
        toTarget:   center,
        t:          0,
        duration:   55, // frames ≈ 0.9 detik @ 60fps
    };
}

function animate() {
    requestAnimationFrame(animate);

    if (_focusAnim) {
        _focusAnim.t += 1;
        const raw   = Math.min(_focusAnim.t / _focusAnim.duration, 1);
        const eased = 1 - Math.pow(1 - raw, 3); // ease-out cubic

        camera.position.lerpVectors(_focusAnim.fromPos, _focusAnim.toPos, eased);
        controls.target.lerpVectors(_focusAnim.fromTarget, _focusAnim.toTarget, eased);

        if (raw >= 1) _focusAnim = null;
    }

    controls.update();
    composer.render();
}

// ── Loading state ─────────────────────────────────────────────────────────────
function setLoadingState(isLoading, message) {
    if (posterContainer) posterContainer.style.display = isLoading ? 'flex' : 'none';
    if (spinnerEl) spinnerEl.style.display = isLoading ? 'block' : 'none';
    if (loadingTextEl && message) loadingTextEl.textContent = message;
    else if (loadingTextEl && isLoading) loadingTextEl.textContent = 'Memuat Skema Spasial...';
}

// ── Outline management ────────────────────────────────────────────────────────
function updateOutlineObjects() {
    const objs = [];
    if (selectedMesh) objs.push(selectedMesh);
    if (hoveredMesh && hoveredMesh !== selectedMesh) objs.push(hoveredMesh);
    outlinePass.selectedObjects = objs;
}

// ── Selection ─────────────────────────────────────────────────────────────────
function clearSelection() {
    selectedMesh = null;
    _focusAnim = null;
    updateOutlineObjects();
}

function closeMeshPanel() {
    if (meshPanel) meshPanel.classList.remove('active');
}

// ── Panel card builders ───────────────────────────────────────────────────────
function buildMatCard(row) {
    const m   = row.material || {};
    const qty = row.quantity  || 1;
    const thumb = m.image
        ? `<img src="${m.image}" alt="" style="width:100%;height:100%;object-fit:cover;">`
        : `<span>📦</span>`;
    const qtyBadge = qty > 1
        ? `<span class="card-qty">× ${qty}</span>`
        : '';
    return `<div class="panel-item-card" data-item-id="${m.id}" data-item-type="material">
        <div class="card-thumb">${thumb}</div>
        <div class="card-info">
            <p class="card-name">${m.name || '-'}</p>
            ${qtyBadge}
        </div>
        <svg class="card-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="13" height="13">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
    </div>`;
}

function buildToolCard(row) {
    const t        = row.tool || {};
    const catClass = t.category === 'k3' ? 'k3' : t.category === 'teknis' ? 'teknis' : 'other';
    const thumb    = t.image
        ? `<img src="${t.image}" alt="" style="width:100%;height:100%;object-fit:cover;">`
        : `<span>🔧</span>`;
    return `<div class="panel-item-card" data-item-id="${t.id}" data-item-type="tool">
        <div class="card-thumb">${thumb}</div>
        <div class="card-info">
            <p class="card-name">${t.name || '-'}</p>
            <span class="card-cat ${catClass}">${t.category || ''}</span>
        </div>
        <svg class="card-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="13" height="13">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
    </div>`;
}

// ── Panel rendering ───────────────────────────────────────────────────────────
function showMeshPanel(mesh) {
    if (!meshPanel) return;

    const meshName = mesh.name || '';
    const displayName = (meshDisplayNameMap[meshName] || '').trim() || meshName;
    if (meshPanelName) meshPanelName.textContent = displayName || 'Unnamed Object';

    const mats  = moduleMaterials.filter((r) => r.mesh_name === meshName);
    const tools = moduleTools.filter((r) => r.mesh_name === meshName);

    const panelEmpty        = document.getElementById('panel-empty');
    const panelMatsSection  = document.getElementById('panel-mats-section');
    const panelToolsSection = document.getElementById('panel-tools-section');
    const panelMaterials    = document.getElementById('panel-materials');
    const panelTools        = document.getElementById('panel-tools');

    const hasData = mats.length > 0 || tools.length > 0;
    if (panelEmpty)        panelEmpty.style.display        = hasData ? 'none' : 'flex';
    if (panelMatsSection)  panelMatsSection.style.display  = mats.length  > 0 ? 'block' : 'none';
    if (panelToolsSection) panelToolsSection.style.display = tools.length > 0 ? 'block' : 'none';

    if (panelMaterials) {
        panelMaterials.innerHTML = mats.map(buildMatCard).join('');
        panelMaterials.querySelectorAll('.panel-item-card').forEach((card) => {
            card.addEventListener('click', () => {
                if (window.openModal) window.openModal(card.dataset.itemId, card.dataset.itemType);
            });
        });
    }

    if (panelTools) {
        panelTools.innerHTML = tools.map(buildToolCard).join('');
        panelTools.querySelectorAll('.panel-item-card').forEach((card) => {
            card.addEventListener('click', () => {
                if (window.openModal) window.openModal(card.dataset.itemId, card.dataset.itemType);
            });
        });
    }

    meshPanel.classList.add('active');
}

// ── Mapped meshes + display names ─────────────────────────────────────────────
async function fetchMappedMeshes() {
    if (!moduleId) return;
    try {
        const [meshRes, configRes] = await Promise.all([
            fetch(`/api/modules/${moduleId}/mapped-meshes`),
            fetch(`/api/modules/${moduleId}/mesh-config`),
        ]);
        if (meshRes.ok) {
            const names = await meshRes.json();
            mappedMeshSet = new Set(Array.isArray(names) ? names : []);
        }
        if (configRes.ok) {
            const configs = await configRes.json();
            meshDisplayNameMap = {};
            (configs || []).forEach(row => {
                if (row.mesh_original_name) {
                    meshDisplayNameMap[row.mesh_original_name] = row.mesh_display_name || '';
                }
            });
        }
    } catch (_) {}
}

// ── Model disposal ────────────────────────────────────────────────────────────
function disposeModel(model) {
    model.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
            if (m.map)          m.map.dispose();
            if (m.normalMap)    m.normalMap.dispose();
            if (m.roughnessMap) m.roughnessMap.dispose();
            if (m.metalnessMap) m.metalnessMap.dispose();
            m.dispose();
        });
    });
}

// ── Variant loading ───────────────────────────────────────────────────────────
function loadVariant(index) {
    if (index < 0 || index >= currentAssets.length) return;
    currentIndex = index;

    closeMeshPanel();
    clearSelection();
    controls.autoRotate = true;

    const asset = currentAssets[index];
    const src   = asset.file || '';

    if (variantNameEl) {
        variantNameEl.textContent = `Varian ${index + 1}/${currentAssets.length} : ${asset.name}`;
    }

    if (currentModel) {
        scene.remove(currentModel);
        disposeModel(currentModel);
        currentModel = null;
    }

    if (!src) {
        setLoadingState(false, 'Belum ada file 3D yang diunggah.');
        return;
    }

    setLoadingState(true);

    loader.load(
        src,
        (gltf) => {
            currentModel = gltf.scene;

            const box    = new THREE.Box3().setFromObject(currentModel);
            const size   = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale  = 2.5 / maxDim;

            currentModel.scale.setScalar(scale);
            currentModel.position.sub(center.multiplyScalar(scale));

            scene.add(currentModel);

            const dist = maxDim * scale * 1.6;
            camera.position.set(0, size.y * scale * 0.3, dist);
            controls.target.set(0, 0, 0);
            controls.update();

            setLoadingState(false);
            if (hintText) hintText.style.opacity = '0.7';
        },
        undefined,
        () => {
            setLoadingState(false, 'Objek 3D Tidak Tersedia');
            if (hintText) hintText.style.display = 'none';
        }
    );
}

// ── Click / raycasting ────────────────────────────────────────────────────────
canvas.addEventListener('click', (e) => {
    if (controls.autoRotate === false && !currentModel) return;

    const rect = canvas.getBoundingClientRect();
    mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const meshes = [];
    if (currentModel) {
        currentModel.traverse((obj) => {
            if (!obj.isMesh) return;
            // null = belum ter-fetch (izinkan semua), Set = filter hanya yang terhubung
            if (mappedMeshSet === null || mappedMeshSet.has(obj.name)) meshes.push(obj);
        });
    }

    const hits = raycaster.intersectObjects(meshes, false);

    if (hits.length > 0) {
        const hit = hits[0].object;
        if (hit === selectedMesh) {
            clearSelection();
            closeMeshPanel();
            controls.autoRotate = true;
        } else {
            selectedMesh = hit;
            updateOutlineObjects();
            controls.autoRotate = false;
            focusCameraOnMesh(hit);
            showMeshPanel(hit);
        }
    } else {
        clearSelection();
        closeMeshPanel();
        controls.autoRotate = true;
    }
});

// ── Hover / pointer cursor ────────────────────────────────────────────────────
canvas.addEventListener('mousemove', (e) => {
    if (!currentModel) return;

    const rect = canvas.getBoundingClientRect();
    mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const meshes = [];
    currentModel.traverse((obj) => {
        if (!obj.isMesh) return;
        if (mappedMeshSet === null || mappedMeshSet.has(obj.name)) meshes.push(obj);
    });

    const hit = raycaster.intersectObjects(meshes, false)[0]?.object ?? null;
    if (hit !== hoveredMesh) {
        hoveredMesh = hit;
        canvas.style.cursor = hoveredMesh ? 'pointer' : 'grab';
        updateOutlineObjects();
    }
});

canvas.addEventListener('mouseleave', () => {
    if (hoveredMesh) {
        hoveredMesh = null;
        canvas.style.cursor = 'grab';
        updateOutlineObjects();
    }
});

if (meshPanelClose) {
    meshPanelClose.addEventListener('click', () => {
        clearSelection();
        closeMeshPanel();
        controls.autoRotate = true;
    });
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
    const assetsEl = document.getElementById('module-assets-data');
    if (assetsEl) {
        try { currentAssets = JSON.parse(assetsEl.textContent) || []; } catch (_) { currentAssets = []; }
    }

    const prevBtn = document.getElementById('viewer-prev-btn');
    const nextBtn = document.getElementById('viewer-next-btn');

    updateSize();
    animate();

    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    fetchMappedMeshes();

    if (currentAssets.length === 0) {
        setLoadingState(false, 'Belum ada file 3D yang diunggah.');
        if (spinnerEl) spinnerEl.style.display = 'none';
    } else {
        loadVariant(0);
        if (currentAssets.length > 1) {
            if (prevBtn) prevBtn.style.display = 'flex';
            if (nextBtn) nextBtn.style.display = 'flex';
            if (variantNameEl) variantNameEl.style.display = 'block';
        }
    }

    window.prevVariant = () => {
        if (currentAssets.length <= 1) return;
        loadVariant((currentIndex - 1 + currentAssets.length) % currentAssets.length);
    };
    window.nextVariant = () => {
        if (currentAssets.length <= 1) return;
        loadVariant((currentIndex + 1) % currentAssets.length);
    };

    if ('ontouchstart' in window && hintText) {
        const span = hintText.querySelector('span');
        if (span) span.textContent = 'Geser untuk Rotasi · Pinch to Zoom · Ketuk untuk Pilih';
    }
}

document.addEventListener('DOMContentLoaded', init);
