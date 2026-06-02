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
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 20px;
    }
    .pln-dot {
      display: inline-block;
      width: 11px; height: 11px; border-radius: 50%;
      background: #FFD500;
      animation: plnDotWave 1.4s cubic-bezier(0.45,0.05,0.55,0.95) infinite;
    }
    .pln-dot:nth-child(2) { animation-delay: 0.18s; }
    .pln-dot:nth-child(3) { animation-delay: 0.36s; }
    .pln-3d-label {
      font-size: 9.5px; text-transform: uppercase;
      letter-spacing: 0.2em; font-weight: 500;
      color: rgba(255,255,255,0.3);
      font-family: 'JetBrains Mono', monospace;
    }
    @keyframes plnDotWave {
      0%, 60%, 100% { transform: translateY(0) scale(0.75); opacity: 0.35; }
      30%            { transform: translateY(-10px) scale(1.15); opacity: 1;
                       box-shadow: 0 0 10px #FFD500, 0 0 22px rgba(255,213,0,0.35); }
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

  populate();

  const hasGlb = file3d && file3d.trim() !== '' && file3d !== '-';

  if (hasGlb) {
    emptyState.style.display = 'none';
    
    // Check if it's the exact same model URL (resolving relative to absolute for comparison)
    const currentSrc = modelViewer.src || '';
    const targetSrc = new URL(file3d, window.location.origin).href;
    
    if (currentSrc !== targetSrc) {
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        if (spinner) spinner.style.display = 'flex';
        if (loadingText) loadingText.textContent = loadingMsg;
        
        // Use a named function to easily remove previous listeners if any
        const onLoad = () => {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            modelViewer.removeEventListener('load', onLoad);
        };
        const onError = () => {
            if (spinner) spinner.style.display = 'none';
            if (loadingText) loadingText.textContent = 'Objek 3D tidak tersedia.';
            modelViewer.removeEventListener('error', onError);
        };
        
        modelViewer.addEventListener('load', onLoad);
        modelViewer.addEventListener('error', onError);
        
        modelViewer.src = file3d;
    } else {
        // Already loaded this exact model
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
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
