const materialData = window.__MATERIAL_DATA__;

let scene, camera, renderer;
let mesh         = null;
let rafId        = null;
let isAutoRotate = true;
let isDragging   = false;
let prevMouse    = { x: 0, y: 0 };

const overlay   = document.getElementById('modal-overlay');
const canvas    = document.getElementById('modal-canvas');
const btnRotate = document.getElementById('btn-rotate');
const btnReset  = document.getElementById('btn-reset');
const btnClose  = document.getElementById('btn-close');

function buildThree() {
    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const amb = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(amb);

    const key = new THREE.DirectionalLight(0xffeedd, 1.2);
    key.position.set(4, 8, 6);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x00e5ff, 0.3);
    fill.position.set(-4, -2, -4);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x4488ff, 0.25);
    rim.position.set(0, -6, -6);
    scene.add(rim);

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        prevMouse  = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging || !mesh) return;
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        mesh.rotation.y += dx * 0.012;
        mesh.rotation.x  = Math.max(-0.8, Math.min(0.8, mesh.rotation.x + dy * 0.012));
        prevMouse = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('wheel', (e) => {
        camera.position.z = Math.max(1.5, Math.min(10, camera.position.z + e.deltaY * 0.005));
    }, { passive: true });
}

function syncSize() {
    const wrap = document.getElementById('canvas-wrap');
    const w    = wrap.clientWidth;
    const h    = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

function startLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    function tick() {
        rafId = requestAnimationFrame(tick);
        syncSize();
        if (isAutoRotate && mesh && !isDragging) mesh.rotation.y += 0.006;
        renderer.render(scene, camera);
    }
    tick();
}

function stopLoop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

function clearMesh() {
    if (!mesh) return;
    scene.remove(mesh);
    mesh.traverse(c => {
        if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); }
    });
    mesh = null;
}

function buildMesh(shape, color) {
    clearMesh();
    const mat = new THREE.MeshPhongMaterial({ color, shininess: 80 });

    if (shape === 'bolt') {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6), mat));
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.28, 6), mat.clone());
        head.position.y = 0.74;
        g.add(head);
        mesh = g;
    } else if (shape === 'torus') {
        mesh = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.22, 14, 48), mat);
    } else if (shape === 'insulator') {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 1.6, 16), mat));
        [-0.55, -0.15, 0.25, 0.65].forEach(y => {
            const d = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.07, 8, 28), mat.clone());
            d.rotation.x = Math.PI / 2;
            d.position.y = y;
            g.add(d);
        });
        mesh = g;
    } else {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32), mat);
    }
    scene.add(mesh);
}

function resetCamera() {
    camera.position.set(0, 0, 4);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    if (mesh) mesh.rotation.set(0, 0, 0);
}

function setRotate(val) {
    isAutoRotate = val;
    if (val) {
        btnRotate.className = 'ctrl-pill ctrl-on';
        btnRotate.innerHTML = `<svg style="width:14px;height:14px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Auto Putar: ON`;
    } else {
        btnRotate.className = 'ctrl-pill ctrl-off';
        btnRotate.innerHTML = `<svg style="width:14px;height:14px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Auto Putar: OFF`;
    }
}

function openModal(id) {
    const mat = materialData.find(m => m.id === id);
    if (!mat) return;

    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    document.body.style.overflow = 'hidden';

    if (!scene) buildThree();

    buildMesh(mat.shape, mat.color3d);
    resetCamera();
    setRotate(true);
    startLoop();

    document.getElementById('modal-category').textContent = mat.categoryLabel;
    document.getElementById('modal-icon').textContent     = mat.icon;
    document.getElementById('modal-code').textContent     = mat.code;
    document.getElementById('modal-name').textContent     = mat.name;
    document.getElementById('modal-desc').textContent     = mat.description;

    document.getElementById('modal-specs').innerHTML = Object.entries(mat.specs).map(([k, v]) => `
        <div class="spec-row">
            <span style="font-size:13px;color:rgba(255,255,255,0.5);">${k}</span>
            <span style="font-size:13px;font-weight:700;color:#00E5FF;font-family:monospace;">${v}</span>
        </div>
    `).join('');
}

function closeModal() {
    stopLoop();
    clearMesh();
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
    document.body.style.overflow = '';
}

document.querySelectorAll('.mat-card').forEach(c => c.addEventListener('click', () => openModal(c.dataset.id)));
btnRotate.addEventListener('click', () => setRotate(!isAutoRotate));
btnReset.addEventListener('click', resetCamera);
btnClose.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
