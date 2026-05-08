/**
 * material.js – Material Catalog Modal Logic
 * Logika modal shared di catalog-modal.js
 */

const materialData = window.__MATERIAL_DATA__;

const MAT_IDS = {
    overlay:     'mat-modal-overlay',
    card:        'mat-modal-card',
    modelViewer: 'mat-model-viewer',
    canvasWrap:  'mat-canvas-wrap',
    emptyState:  'mat-empty-state',
    spinner:     'mat-loading-spinner',
    loadingText: 'mat-loading-text',
};

function openModal(id) {
    const mat = materialData.find(m => m.id === id);
    if (!mat) return;

    openCatalogModal(MAT_IDS, mat.file3d, 'Memuat Skema Spasial...', () => {
        const catEl = document.getElementById('mat-modal-category');
        catEl.innerHTML = `<span class="w-1 h-1 rounded-full bg-[var(--color-pln-yellow)] opacity-70 animate-pulse"></span>${mat.categoryLabel || ''}`;
        document.getElementById('mat-modal-name').textContent = mat.name       || '';
        document.getElementById('mat-modal-code').textContent = mat.code       || '';
        document.getElementById('mat-modal-icon').textContent = mat.icon       || '';
        const rawDesc = mat.description || mat.shortDesc || '';
        document.getElementById('mat-modal-desc').textContent =
            rawDesc.length > 200 ? rawDesc.substring(0, 200).trimEnd() + '...' : rawDesc;
    });
}

document.querySelectorAll('#material-grid .v3-card[data-id]').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
});

document.getElementById('mat-btn-close').addEventListener('click',    ()  => closeCatalogModal(MAT_IDS));
document.getElementById('mat-modal-overlay').addEventListener('click', e   => { if (e.target === document.getElementById('mat-modal-overlay')) closeCatalogModal(MAT_IDS); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCatalogModal(MAT_IDS); });

document.getElementById('mat-fullscreen-btn').addEventListener('click', () => toggleCatalogFullscreen('mat-canvas-wrap'));
initCatalogFullscreen('mat-canvas-wrap');
