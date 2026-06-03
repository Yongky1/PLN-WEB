
  import { GLTFLoader } from '/scripts/three/jsm/loaders/GLTFLoader.js';
  import { OrbitControls } from '/scripts/three/jsm/controls/OrbitControls.js';
  import { DRACOLoader } from '/scripts/three/jsm/loaders/DRACOLoader.js';

  /* ── Parse module data ── */
  const moduleData = JSON.parse(document.getElementById('mapping-module-data').textContent);
  const assets = moduleData.assets || [];

  /* ── DOM refs ── */
  const canvas = document.getElementById('mp-canvas');
  const canvasWrap = document.getElementById('mp-canvas-wrap');
  const loadingEl = document.getElementById('mp-loading');
  const loadingTextEl = document.getElementById('mp-loading-text');
  const assetNavEl = document.getElementById('mp-asset-nav');
  const assetLabelEl = document.getElementById('mp-asset-label');
  const meshNameEl = document.getElementById('mp-selected-mesh-name');
  const applyBtn = document.getElementById('mp-apply-btn');
  const datalist = document.getElementById('mp-mesh-datalist');

  const toggleRotateBtn = document.getElementById('mp-toggle-rotate-btn');
  const iconPause = document.getElementById('mp-icon-pause');
  const iconPlay = document.getElementById('mp-icon-play');
  let isManuallyPaused = false;

  /* ── Scene setup ── */
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

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;

  function updateRotateButtonState() {
    if (!iconPause || !iconPlay) return;
    if (!isManuallyPaused) {
      iconPause.style.display = 'block';
      iconPlay.style.display = 'none';
    } else {
      iconPause.style.display = 'none';
      iconPlay.style.display = 'block';
    }
  }

  if (toggleRotateBtn) {
    toggleRotateBtn.addEventListener('click', () => {
      isManuallyPaused = !isManuallyPaused;
      if (!selectedMesh) {
        controls.autoRotate = !isManuallyPaused;
      }
      updateRotateButtonState();
    });
  }

  /* ── Lighting ── */
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const dir = new THREE.DirectionalLight(0xffffff, 2.0);
  dir.position.set(3, 5, 3);
  dir.castShadow = true;
  scene.add(dir);
  const fill = new THREE.DirectionalLight(0x8899cc, 0.6);
  fill.position.set(-2, -1, -3);
  scene.add(fill);

  /* ── State ── */
  let currentModel = null;
  let currentIndex = 0;
  let selectedMesh = null;
  let hoveredMesh = null;
  let _isMouseDown = false;
  const origEmissive = new Map(); // mesh → [{color, intensity}]

  /* ── Resize ── */
  function updateSize() {
    const w = canvasWrap.clientWidth;
    const h = canvasWrap.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  new ResizeObserver(updateSize).observe(canvasWrap);

  /* ── Animate ── */
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  /* ── Highlight helpers ── */
  function storeEmissive(mesh) {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    origEmissive.set(mesh, mats.map(m => ({
      color: m.emissive ? m.emissive.clone() : new THREE.Color(0, 0, 0),
      intensity: m.emissiveIntensity ?? 0,
    })));
  }

  function restoreEmissive(mesh) {
    const orig = origEmissive.get(mesh);
    if (!orig) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((m, i) => {
      if (!orig[i]) return;
      if (m.emissive) m.emissive.copy(orig[i].color);
      m.emissiveIntensity = orig[i].intensity;
    });
  }

  function setHighlight(mesh, colorHex, intensity) {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach(m => {
      if (!m.emissive) return; // skip MeshBasicMaterial etc.
      m.emissive.set(colorHex);
      m.emissiveIntensity = intensity;
    });
  }

  function applyHoverHighlight(mesh) {
    if (!mesh || mesh === selectedMesh) return;
    setHighlight(mesh, 0x6699ff, 0.30);
  }

  function removeHoverHighlight(mesh) {
    if (!mesh || mesh === selectedMesh) return;
    restoreEmissive(mesh);
  }

  function updateCursor() {
    canvas.style.cursor = _isMouseDown ? 'grabbing' : (hoveredMesh ? 'pointer' : 'grab');
  }

  function clearHighlight() {
    if (selectedMesh) {
      restoreEmissive(selectedMesh);
      if (selectedMesh === hoveredMesh) applyHoverHighlight(hoveredMesh);
    }
    selectedMesh = null;
    controls.autoRotate = !isManuallyPaused;
    updateRotateButtonState();
    meshNameEl.textContent = 'Klik mesh untuk memilih';
    meshNameEl.classList.remove('has-selection');
    applyBtn.classList.remove('visible');
    window.mpSelectedMeshName = null;
    if (typeof window.mpOnMeshClick === 'function') window.mpOnMeshClick('');
  }

  /* ── Mesh name datalist ── */
  function populateDatalist(names) {
    // Hapus hanya opsi nama asli mesh; pertahankan opsi display name (data-dn)
    [...datalist.options].filter(o => !o.dataset.dn).forEach(o => o.remove());
    [...new Set(names.filter(n => n && n.trim()))].sort().forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      datalist.appendChild(opt);
    });
    // Sync ulang display names agar nama rename langsung tersedia di input material
    if (typeof window.mpSyncDatalistWithDisplayNames === 'function') {
      window.mpSyncDatalistWithDisplayNames();
    }
  }

  /* ── Dispose ── */
  function disposeModel(model) {
    model.traverse(obj => {
      if (!obj.isMesh) return;
      obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(m => {
        ['map', 'normalMap', 'roughnessMap', 'metalnessMap'].forEach(k => { if (m[k]) m[k].dispose(); });
        m.dispose();
      });
    });
  }

  /* ── Load GLB ── */
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/scripts/three/jsm/libs/draco/gltf/');
  loader.setDRACOLoader(dracoLoader);

  function loadAsset(index) {
    if (index < 0 || index >= assets.length) return;
    currentIndex = index;

    clearHighlight();
    hoveredMesh = null;
    origEmissive.clear();

    const asset = assets[index];
    const url = asset.file || '';

    if (assetLabelEl) assetLabelEl.textContent = `${index + 1} / ${assets.length} · ${asset.name || ''}`;

    if (currentModel) {
      scene.remove(currentModel);
      disposeModel(currentModel);
      currentModel = null;
    }

    if (!url) {
      loadingEl.style.display = 'flex';
      loadingTextEl.textContent = 'Belum ada file 3D.';
      return;
    }

    loadingEl.style.display = 'flex';
    loadingTextEl.textContent = 'Memuat model 3D...';

    loader.load(url, gltf => {
      currentModel = gltf.scene;

      const box = new THREE.Box3().setFromObject(currentModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = 2.5 / Math.max(size.x, size.y, size.z);

      currentModel.scale.setScalar(scale);
      currentModel.position.sub(center.multiplyScalar(scale));
      scene.add(currentModel);

      const dist = Math.max(size.x, size.y, size.z) * scale * 1.6;
      camera.position.set(0, size.y * scale * 0.3, dist);
      controls.target.set(0, 0, 0);
      controls.update();

      /* Collect mesh names + store emissive originals */
      const names = [];
      currentModel.traverse(obj => {
        if (!obj.isMesh) return;
        if (obj.name) names.push(obj.name);

        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => {
          // ── FIX: Tampilkan warna asli dengan menonaktifkan pantulan metalik ──
          // Jika metalness = 1 dan tidak ada environment map (HDRI), 
          // model akan memantulkan warna hitam (gelap/hilang warna aslinya).
          if (m.isMeshStandardMaterial) {
            m.metalness = 0.1;
            m.roughness = 0.8;
            m.needsUpdate = true;
          }
        });

        storeEmissive(obj);
      });
      populateDatalist(names);

      if (typeof window.mpOnMeshesLoaded === 'function') {
        window.mpOnMeshesLoaded(names);
      }

      loadingEl.style.display = 'none';
    }, undefined, () => {
      loadingTextEl.textContent = 'File 3D tidak tersedia.';
    });
  }

  /* ── Raycasting click ── */
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  canvas.addEventListener('click', e => {
    if (!currentModel) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const meshes = [];
    currentModel.traverse(obj => { if (obj.isMesh) meshes.push(obj); });
    const hits = raycaster.intersectObjects(meshes, false);

    if (hits.length === 0) {
      clearHighlight();
      return;
    }

    const hit = hits[0].object;

    if (hit === selectedMesh) {
      clearHighlight();
      return;
    }

    /* Deselect previous */
    if (selectedMesh) restoreEmissive(selectedMesh);

    /* Select new */
    selectedMesh = hit;
    controls.autoRotate = false;
    updateRotateButtonState();
    setHighlight(hit, 0xf59e0b, 0.7);

    const name = hit.name || '';
    meshNameEl.textContent = name || '(tanpa nama)';
    meshNameEl.classList.toggle('has-selection', !!name);

    window.mpSelectedMeshName = name;
    if (typeof window.mpOnMeshClick === 'function') window.mpOnMeshClick(name);

    /* Show "apply to empty" button if there are empty items */
    const hasEmpty = [...document.querySelectorAll('.mp-mesh-input')].some(i => !i.value.trim());
    applyBtn.classList.toggle('visible', !!name && hasEmpty);
  });

  /* ── Hover highlighting ── */
  canvas.addEventListener('mousedown', () => { _isMouseDown = true; updateCursor(); });
  canvas.addEventListener('mouseup', () => { _isMouseDown = false; updateCursor(); });

  canvas.addEventListener('mousemove', e => {
    if (!currentModel || _isMouseDown) return;

    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const meshes = [];
    currentModel.traverse(obj => { if (obj.isMesh) meshes.push(obj); });
    const hit = raycaster.intersectObjects(meshes, false)[0]?.object ?? null;

    if (hit !== hoveredMesh) {
      removeHoverHighlight(hoveredMesh);
      hoveredMesh = hit;
      applyHoverHighlight(hoveredMesh);
      updateCursor();
    }
  });

  canvas.addEventListener('mouseleave', () => {
    _isMouseDown = false;
    removeHoverHighlight(hoveredMesh);
    hoveredMesh = null;
    updateCursor();
  });

  /* ── Select mesh by name (dipanggil dari panel klik) ── */
  window.mpSelectMeshByName = function (name) {
    if (!currentModel || !name) { clearHighlight(); return; }

    let target = null;
    currentModel.traverse(obj => { if (obj.isMesh && obj.name === name) target = obj; });
    if (!target) return;

    if (target === selectedMesh) { clearHighlight(); return; }

    if (selectedMesh) restoreEmissive(selectedMesh);
    selectedMesh = target;
    controls.autoRotate = false;
    updateRotateButtonState();
    setHighlight(target, 0xf59e0b, 0.7);

    meshNameEl.textContent = name || '(tanpa nama)';
    meshNameEl.classList.toggle('has-selection', !!name);
    window.mpSelectedMeshName = name;
    if (typeof window.mpOnMeshClick === 'function') window.mpOnMeshClick(name);

    const hasEmpty = [...document.querySelectorAll('.mp-mesh-input')].some(i => !i.value.trim());
    applyBtn.classList.toggle('visible', !!name && hasEmpty);
  };

  /* ── Asset navigation ── */
  window.mpPrevAsset = () => { loadAsset((currentIndex - 1 + assets.length) % assets.length); };
  window.mpNextAsset = () => { loadAsset((currentIndex + 1) % assets.length); };

  /* ── Init ── */
  updateSize();

  if (assets.length === 0) {
    loadingTextEl.textContent = 'Belum ada file 3D yang diunggah.';
  } else {
    loadAsset(0);
    if (assets.length > 1) {
      assetNavEl.style.display = 'flex';
    }
  }
