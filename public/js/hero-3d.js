/**
 * ═══════════════════════════════════════════════════════
 * HERO 3D — Scroll-Driven GLB Assembly
 * Cap Pelindung (Bagian Atas) → (Full) saat scroll.
 * Model berputar mengikuti scroll lalu transisi menjadi terpasang.
 * ═══════════════════════════════════════════════════════
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

(function () {
  'use strict';

  if (!document.body.classList.contains('landing-page')) return;

  const canvas = document.getElementById('hero-3d-canvas');
  const container = document.getElementById('scroll-video-container');
  if (!canvas || !container) return;

  // Hormati preferensi reduce-motion: model tetap tampil tapi tanpa idle-spin.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Model sources ──────────────────────────────────────────────────────────
  const MODEL_TOP = encodeURI('/videos/Cap Pelindung (Bagian Atas).glb');
  const MODEL_FULL = encodeURI('/videos/Cap Pelindung (Full).glb');

  // ── Renderer ────────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0); // transparan → gradient CSS terlihat di belakang
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 6);
  camera.lookAt(0, 0, 0);

  // ── Lighting (studio terang, cocok tema light) ───────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const hemi = new THREE.HemisphereLight(0xffffff, 0x9fb4cc, 0.9);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd4ff, 0.7);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  // ── Pivot yang berputar ──────────────────────────────────────────────────────
  const pivot = new THREE.Group();
  scene.add(pivot);

  let capTop = null;
  let capFull = null;
  let modelsReady = false;

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function smoothstep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  // Normalisasi model: center ke origin + scale agar muat radius target.
  function normalizeModel(root, targetSize) {
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = targetSize / maxDim;
    root.scale.setScalar(scale);
    // re-center setelah scale
    root.position.sub(center.multiplyScalar(scale));
  }

  function setOpacity(root, o) {
    if (!root) return;
    root.visible = o > 0.001;
    root.traverse((n) => {
      if (n.isMesh && n.material) {
        const mats = Array.isArray(n.material) ? n.material : [n.material];
        mats.forEach((m) => {
          m.transparent = o < 0.999;
          m.opacity = o;
          m.depthWrite = o > 0.98;
        });
      }
    });
  }

  // ── Layout: model kecil, di tengah, di belakang teks ─────────────
  function applyLayout() {
    const aspect = container.clientWidth / container.clientHeight;
    const isMobile = window.innerWidth < 900;
    const dist = camera.position.z;
    const visH = 2 * dist * Math.tan((camera.fov * Math.PI) / 180 / 2);

    if (isMobile) {
      // mobile: tetap di tengah, sedikit lebih kecil
      pivot.position.x = 0;
      pivot.position.y = -visH * 0.02;
      pivot.scale.setScalar(0.8);
    } else {
      // desktop: center, sebagai elemen latar kecil di belakang teks
      pivot.position.x = 0;
      pivot.position.y = 0;
      pivot.scale.setScalar(1);
    }
  }

  // ── Load kedua model ───────────────────────────────────────────────────────────
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/scripts/three/jsm/libs/draco/gltf/');
  loader.setDRACOLoader(dracoLoader);

  function load(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
    });
  }

  Promise.all([load(MODEL_TOP), load(MODEL_FULL)])
    .then(([top, full]) => {
      capTop = top;
      capFull = full;
      const TARGET = 1.5; // ukuran dunia model (kecil, di belakang teks)
      // Model bawaan "tidur" menyamping → putar dulu agar berdiri tegak (ujung ke atas),
      // BARU di-normalisasi/center supaya tidak terlempar keluar layar.
      // Ubah sumbu/nilai bila arah belum pas: coba .z, atau ganti tanda (-Math.PI/2).
      const UPRIGHT_AXIS = 'x';
      const UPRIGHT_ANGLE = -Math.PI / 2;
      capTop.rotation[UPRIGHT_AXIS] = UPRIGHT_ANGLE;
      capFull.rotation[UPRIGHT_AXIS] = UPRIGHT_ANGLE;
      normalizeModel(capTop, TARGET);
      normalizeModel(capFull, TARGET);
      pivot.add(capTop);
      pivot.add(capFull);
      setOpacity(capTop, 1);
      setOpacity(capFull, 0);
      applyLayout();
      modelsReady = true;
      // Sembunyikan placeholder gradient setelah model siap
      const ph = container.querySelector('.video-placeholder');
      if (ph) ph.style.opacity = '0';
    })
    .catch((err) => {
      // Bila gagal: biarkan placeholder gradient sebagai latar (graceful fallback)
      console.error('[hero-3d] Gagal memuat model:', err);
    });

  // ── Progress scroll (selaras dgn landing.js) ────────────────────────────────────
  function getProgress() {
    const vh = window.innerHeight;
    const start = vh * 0.5;
    const end = document.documentElement.scrollHeight - vh;
    const range = end - start;
    if (range <= 0) return 0;
    return clamp((window.scrollY - start) / range, 0, 1);
  }

  // ── Resize ───────────────────────────────────────────────────────────────────
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    applyLayout();
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Render loop ─────────────────────────────────────────────────────────────────
  let smoothP = 0;
  let idle = 0;
  const TURNS = Math.PI * 2 * 1.25; // 1.25 putaran sepanjang scroll
  const FADE_START = 0.4;
  const FADE_END = 0.62;

  function tick() {
    requestAnimationFrame(tick);
    if (!modelsReady) {
      renderer.render(scene, camera);
      return;
    }

    // Smoothing scroll → scrub halus
    const targetP = getProgress();
    smoothP += (targetP - smoothP) * 0.12;

    if (!reduceMotion) idle += 0.0016;

    // Rotasi: idle drift + scroll (putar pada sumbu Y saja → tetap lurus ke atas)
    pivot.rotation.y = idle + smoothP * TURNS;
    pivot.rotation.x = 0;

    // Crossfade Atas → Full
    const t = smoothstep((smoothP - FADE_START) / (FADE_END - FADE_START));
    setOpacity(capTop, 1 - t);
    setOpacity(capFull, t);

    renderer.render(scene, camera);
  }
  tick();
})();
