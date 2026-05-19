/**
 * public/js/catalog-modal.js
 * Shared modal logic untuk halaman katalog publik (material & tools).
 *
 * @param {object}   ids         - Map ID elemen: overlay, card, modelViewer, canvasWrap, emptyState, loadingOverlay, spinner, loadingText
 * @param {string}   file3d      - URL GLB/GLTF, boleh kosong atau '-'
 * @param {string}   loadingMsg  - Teks spinner saat memuat
 * @param {Function} populate    - Callback pengisi field teks, dipanggil sebelum model di-load
 */

(function injectCatalogModalStyles() {
  if (document.getElementById('_catalog-modal-styles')) return;
  const s = document.createElement('style');
  s.id = '_catalog-modal-styles';
  s.textContent = `
    .pln-3d-loading {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: #030812;
    }
    .pln-3d-loader {
      position: relative; width: 64px; height: 64px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 18px;
    }
    .pln-3d-ring {
      position: absolute; border-radius: 50%;
      border: 1.5px solid transparent;
    }
    .pln-3d-ring.r1 {
      width: 64px; height: 64px;
      border-top-color: #FFD500;
      border-right-color: rgba(255,213,0,0.2);
      animation: pln3dSpin 1s ease-in-out infinite;
    }
    .pln-3d-ring.r2 {
      width: 46px; height: 46px;
      border-bottom-color: rgba(255,213,0,0.55);
      border-left-color: rgba(255,213,0,0.15);
      animation: pln3dSpin 1.5s linear infinite reverse;
    }
    .pln-3d-ring.r3 {
      width: 28px; height: 28px;
      border-top-color: rgba(0,229,255,0.45);
      animation: pln3dSpin 0.75s linear infinite;
    }
    .pln-3d-core {
      width: 6px; height: 6px; border-radius: 50%;
      background: #FFD500;
      animation: pln3dPulse 1.2s ease-in-out infinite;
    }
    .pln-3d-label {
      font-size: 9.5px; text-transform: uppercase;
      letter-spacing: 0.2em; font-weight: 500;
      color: rgba(255,255,255,0.3);
      font-family: 'JetBrains Mono', monospace;
    }
    @keyframes pln3dSpin { to { transform: rotate(360deg); } }
    @keyframes pln3dPulse {
      0%, 100% { opacity: 0.5; transform: scale(0.8); box-shadow: 0 0 6px #FFD500; }
      50%       { opacity: 1;   transform: scale(1.4); box-shadow: 0 0 14px #FFD500, 0 0 28px rgba(255,213,0,0.45); }
    }
  `;
  document.head.appendChild(s);
})();
function openCatalogModal(ids, file3d, loadingMsg, populate) {
  const overlay = document.getElementById(ids.overlay);
  const modelViewer = document.getElementById(ids.modelViewer);
  const emptyState = document.getElementById(ids.emptyState);
  const loadingOverlay = ids.loadingOverlay ? document.getElementById(ids.loadingOverlay) : null;
  const spinner = document.getElementById(ids.spinner);
  const loadingText = document.getElementById(ids.loadingText);

  // Clear old model immediately before populating new data
  modelViewer.removeAttribute('src');

  populate();

  const hasGlb = file3d && file3d.trim() !== '' && file3d !== '-';

  if (hasGlb) {
    emptyState.style.display = 'none';
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    if (spinner) spinner.style.display = 'block';
    if (loadingText) loadingText.textContent = loadingMsg;

    setTimeout(() => { modelViewer.src = file3d; }, 50);

    modelViewer.addEventListener('load', () => {
      if (loadingOverlay) loadingOverlay.style.display = 'none';
    }, { once: true });

    modelViewer.addEventListener('error', () => {
      if (spinner) spinner.style.display = 'none';
      if (loadingText) loadingText.textContent = 'Objek 3D tidak tersedia.';
    }, { once: true });
  } else {
    modelViewer.removeAttribute('src');
    emptyState.style.display = 'flex';
    if (loadingOverlay) loadingOverlay.style.display = 'none';
    if (spinner) spinner.style.display = 'none';
    if (loadingText) loadingText.textContent = '';
  }

  overlay.style.display = 'flex';
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (typeof gsap !== 'undefined') {
    gsap.fromTo(
      `#${ids.card}`,
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
    );
  }
}

function closeCatalogModal(ids) {
  const overlay = document.getElementById(ids.overlay);
  const modelViewer = document.getElementById(ids.modelViewer);
  if (modelViewer) modelViewer.removeAttribute('src');
  overlay.classList.remove('active');
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function toggleCatalogFullscreen(canvasWrapId) {
  const target = document.getElementById(canvasWrapId);
  if (!target) return;
  if (!document.fullscreenElement) {
    if (target.requestFullscreen) target.requestFullscreen().catch((err) => console.error(err));
    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
    else if (target.msRequestFullscreen) target.msRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }
}

function initCatalogFullscreen(canvasWrapId) {
  const canvasWrap = document.getElementById(canvasWrapId);
  if (!canvasWrap) return;
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === canvasWrap) {
      canvasWrap.style.borderRadius = '0px';
      canvasWrap.style.border = 'none';
    } else {
      canvasWrap.style.borderRadius = '';
      canvasWrap.style.border = '';
    }
  });
}
