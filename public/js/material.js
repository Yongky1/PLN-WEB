/**
 * material.js – Material Catalog Modal Logic
 * Logika modal shared di catalog-modal.js
 */

const materialData = window.__MATERIAL_DATA__;

const MAT_IDS = {
  overlay: 'mat-modal-overlay',
  card: 'mat-modal-card',
  modelViewer: 'mat-model-viewer',
  canvasWrap: 'mat-canvas-wrap',
  emptyState: 'mat-empty-state',
  loadingOverlay: 'mat-loading-overlay',
  spinner: 'mat-loading-spinner',
  loadingText: 'mat-loading-text',
};

let currentMatAssets = [];
let currentVarIdx = 0;

function openModal(id) {
  const mat = materialData.find((m) => m.id === id);
  if (!mat) return;

  currentMatAssets = mat.assets || [];
  currentVarIdx = 0;

  const initialFile = currentMatAssets.length > 0 ? currentMatAssets[0].file : mat.file3d;

  openCatalogModal(MAT_IDS, initialFile, 'Memuat Skema Spasial...', () => {
    // Populate new category tags container
    const tagsContainer = document.getElementById('mat-modal-tags');
    if (tagsContainer) {
      if (mat.categories && mat.categories.length > 0) {
        tagsContainer.innerHTML = mat.categories.map(c => 
          `<span class="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border bg-[var(--color-bg-surface-alt)] border-[var(--color-border)] text-[var(--color-text-secondary)]">${c.name || '-'}</span>`
        ).join('');
      } else {
        tagsContainer.innerHTML = '';
      }
    }
    document.getElementById('mat-modal-name').textContent = mat.name || '';
    document.getElementById('mat-modal-code').textContent = mat.code || '';

    const rawDesc = mat.description || mat.shortDesc || '';
    document.getElementById('mat-modal-desc').textContent = rawDesc;

    // Toggle Variant UI
    const prevBtn = document.getElementById('mat-viewer-prev-btn');
    const nextBtn = document.getElementById('mat-viewer-next-btn');
    const varName = document.getElementById('mat-viewer-variant-name');

    if (currentMatAssets.length > 1) {
      if (prevBtn) prevBtn.style.display = 'flex';
      if (nextBtn) nextBtn.style.display = 'flex';
      if (varName) {
        varName.style.display = 'block';
        varName.textContent = `Varian 1/${currentMatAssets.length}: ${currentMatAssets[0].name || '-'}`;
      }
    } else {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (varName) varName.style.display = 'none';
    }
  });
}

function updateMatVariantUI() {
  const varName = document.getElementById('mat-viewer-variant-name');
  if (varName && currentMatAssets.length > 1) {
    const asset = currentMatAssets[currentVarIdx];
    varName.textContent = `Varian ${currentVarIdx + 1}/${currentMatAssets.length}: ${asset.name || '-'}`;
  }
}

window.prevMatVariant = function () {
  if (currentMatAssets.length <= 1) return;
  currentVarIdx = (currentVarIdx - 1 + currentMatAssets.length) % currentMatAssets.length;
  updateMatVariantUI();
  const mv = document.getElementById(MAT_IDS.modelViewer);
  if (mv) mv.src = currentMatAssets[currentVarIdx].file;
};

window.nextMatVariant = function () {
  if (currentMatAssets.length <= 1) return;
  currentVarIdx = (currentVarIdx + 1) % currentMatAssets.length;
  updateMatVariantUI();
  const mv = document.getElementById(MAT_IDS.modelViewer);
  if (mv) mv.src = currentMatAssets[currentVarIdx].file;
};

document.querySelectorAll('#material-grid .card-elevated[data-id]').forEach((card) => {
  card.addEventListener('click', () => openModal(card.dataset.id));
});

document
  .getElementById('mat-btn-close')
  .addEventListener('click', () => closeCatalogModal(MAT_IDS));
document.getElementById('mat-modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('mat-modal-overlay')) closeCatalogModal(MAT_IDS);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCatalogModal(MAT_IDS);
});

document
  .getElementById('mat-fullscreen-btn')
  .addEventListener('click', () => toggleCatalogFullscreen('mat-canvas-wrap'));
initCatalogFullscreen('mat-canvas-wrap');
