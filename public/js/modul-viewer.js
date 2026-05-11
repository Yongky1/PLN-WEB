import * as THREE from 'three';
import { GLTFLoader } from '/scripts/three/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '/scripts/three/jsm/controls/OrbitControls.js';
import { EffectComposer } from '/scripts/three/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/scripts/three/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from '/scripts/three/jsm/postprocessing/OutlinePass.js';
import { OutputPass } from '/scripts/three/jsm/postprocessing/OutputPass.js';

const canvas = document.getElementById('three-canvas');
const container = document.getElementById('viewer-container');
const spinnerEl = document.getElementById('loading-spinner');
const loadingTextEl = document.getElementById('loading-text');
const posterContainer = document.getElementById('poster-container');
const hintText = document.getElementById('hint-text');
const variantNameEl = document.getElementById('viewer-variant-name');
const meshPanel = document.getElementById('mesh-info-panel');
const meshPanelName = document.getElementById('mesh-panel-name');
const meshPanelMatEl = document.getElementById('mesh-panel-material');
const meshPanelClose = document.getElementById('mesh-panel-close');

let currentAssets = [];
let currentIndex = 0;
let currentModel = null;
let selectedMesh = null;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = new OutlinePass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    scene,
    camera
);
outlinePass.visibleEdgeColor.set('#FFD500');
outlinePass.hiddenEdgeColor.set('#FFD500');
outlinePass.edgeStrength = 5.0;
outlinePass.edgeThickness = 2.5;
outlinePass.edgeGlow = 0.8;
outlinePass.pulsePeriod = 2;
composer.addPass(outlinePass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;
controls.minDistance = 0.3;
controls.maxDistance = 50;
controls.autoRotate = true;
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

const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

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

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
}

function setLoadingState(isLoading, message) {
    if (posterContainer) posterContainer.style.display = isLoading ? 'flex' : 'none';
    if (spinnerEl) spinnerEl.style.display = isLoading ? 'block' : 'none';
    if (loadingTextEl && message) loadingTextEl.textContent = message;
    else if (loadingTextEl && isLoading) loadingTextEl.textContent = 'Memuat Skema Spasial...';
}

function clearSelection() {
    selectedMesh = null;
    outlinePass.selectedObjects = [];
}

function closeMeshPanel() {
    if (meshPanel) meshPanel.classList.remove('active');
}

function showMeshPanel(mesh) {
    if (!meshPanel) return;

    if (meshPanelName) {
        meshPanelName.textContent = mesh.name || 'Unnamed Object';
    }

    if (meshPanelMatEl) {
        const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        if (!mat) {
            meshPanelMatEl.innerHTML = '<p class="text-white/40 text-xs">Tidak ada material</p>';
        } else {
            const rows = [];
            rows.push(matRow('Tipe', mat.type || 'Material'));
            if (mat.color) {
                const hex = '#' + mat.color.getHexString().toUpperCase();
                rows.push(matRow('Warna', `<span class="inline-flex items-center gap-1.5"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${hex};border:1px solid rgba(255,255,255,0.2)"></span>${hex}</span>`));
            }
            if (mat.roughness !== undefined) rows.push(matRow('Roughness', mat.roughness.toFixed(2)));
            if (mat.metalness !== undefined) rows.push(matRow('Metalness', mat.metalness.toFixed(2)));
            if (mat.emissive) {
                const emHex = '#' + mat.emissive.getHexString().toUpperCase();
                const emInt = mat.emissiveIntensity !== undefined ? ` ×${mat.emissiveIntensity.toFixed(2)}` : '';
                rows.push(matRow('Emissive', `<span class="inline-flex items-center gap-1.5"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${emHex};border:1px solid rgba(255,255,255,0.2)"></span>${emHex}${emInt}</span>`));
            }
            if (mat.transparent && mat.opacity !== undefined && mat.opacity < 1) {
                rows.push(matRow('Opacity', mat.opacity.toFixed(2)));
            }
            if (mat.side !== undefined) {
                const sideMap = { 0: 'Front', 1: 'Back', 2: 'Double' };
                rows.push(matRow('Side', sideMap[mat.side] ?? mat.side));
            }
            meshPanelMatEl.innerHTML = rows.join('');
        }
    }

    meshPanel.classList.add('active');
}

function matRow(label, value) {
    return `<div class="flex items-start justify-between gap-2 py-2 border-b border-white/5 last:border-0">
        <span class="text-[10px] font-semibold uppercase tracking-wider text-white/40 shrink-0 mt-0.5">${label}</span>
        <span class="text-[12px] text-white/80 font-medium text-right leading-tight">${value}</span>
    </div>`;
}

function disposeModel(model) {
    model.traverse(obj => {
        if (!obj.isMesh) return;
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => {
            if (m.map) m.map.dispose();
            if (m.normalMap) m.normalMap.dispose();
            if (m.roughnessMap) m.roughnessMap.dispose();
            if (m.metalnessMap) m.metalnessMap.dispose();
            m.dispose();
        });
    });
}

function loadVariant(index) {
    if (index < 0 || index >= currentAssets.length) return;
    currentIndex = index;

    closeMeshPanel();
    clearSelection();
    controls.autoRotate = true;

    const asset = currentAssets[index];
    const src = asset.file || '';

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

            const box = new THREE.Box3().setFromObject(currentModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.5 / maxDim;

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

canvas.addEventListener('click', (e) => {
    if (controls.autoRotate === false && !currentModel) return;

    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const meshes = [];
    if (currentModel) {
        currentModel.traverse(obj => { if (obj.isMesh) meshes.push(obj); });
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
            outlinePass.selectedObjects = [hit];
            controls.autoRotate = false;
            showMeshPanel(hit);
        }
    } else {
        clearSelection();
        closeMeshPanel();
        controls.autoRotate = true;
    }
});

if (meshPanelClose) {
    meshPanelClose.addEventListener('click', () => {
        clearSelection();
        closeMeshPanel();
        controls.autoRotate = true;
    });
}

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
