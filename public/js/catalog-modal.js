/**
 * public/js/catalog-modal.js
 * Shared modal logic untuk halaman katalog publik (material & tools).
 *
 * @param {object}   ids         - Map ID elemen: overlay, card, modelViewer, canvasWrap, emptyState, spinner, loadingText
 * @param {string}   file3d      - URL GLB/GLTF, boleh kosong atau '-'
 * @param {string}   loadingMsg  - Teks spinner saat memuat
 * @param {Function} populate    - Callback pengisi field teks, dipanggil sebelum model di-load
 */
function openCatalogModal(ids, file3d, loadingMsg, populate) {
  const overlay = document.getElementById(ids.overlay);
  const modelViewer = document.getElementById(ids.modelViewer);
  const emptyState = document.getElementById(ids.emptyState);
  const spinner = document.getElementById(ids.spinner);
  const loadingText = document.getElementById(ids.loadingText);

  populate();

  const hasGlb = file3d && file3d.trim() !== '' && file3d !== '-';

  if (spinner) spinner.style.display = 'block';
  if (loadingText) loadingText.textContent = loadingMsg;

  if (hasGlb) {
    emptyState.style.display = 'none';
    modelViewer.removeAttribute('src');
    setTimeout(() => {
      modelViewer.src = file3d;
    }, 50);
    modelViewer.addEventListener(
      'error',
      () => {
        if (spinner) spinner.style.display = 'none';
        if (loadingText) loadingText.textContent = 'Objek 3D tidak tersedia.';
      },
      { once: true }
    );
  } else {
    modelViewer.removeAttribute('src');
    emptyState.style.display = 'flex';
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
