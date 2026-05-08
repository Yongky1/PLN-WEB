/**
 * tools.js – Tools Catalog Modal Logic
 * Logika modal shared di catalog-modal.js
 */

const toolsData = window.__TOOLS_DATA__;

const TOOLS_IDS = {
  overlay: 'modal-overlay',
  card: 'modal-card',
  modelViewer: 'modal-model-viewer',
  canvasWrap: 'modal-canvas-wrap',
  emptyState: 'modal-empty-state',
  spinner: 'modal-loading-spinner',
  loadingText: 'modal-loading-text',
};

function openDetail(id) {
  const tool = toolsData.find((t) => t.id === id);
  if (!tool) return;

  openCatalogModal(TOOLS_IDS, tool.file3d, 'Memuat Model 3D...', () => {
    const catLabel = document.getElementById('modal-category-label');
    catLabel.className =
      'text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 cat-badge-teknis';
    catLabel.innerHTML = `<span class="w-1 h-1 rounded-full opacity-70 animate-pulse bg-current"></span>${tool.categoryLabel}`;

    document.getElementById('modal-icon').textContent = tool.icon || '🔧';
    document.getElementById('modal-name').textContent = tool.name;

    document.getElementById('modal-standard').textContent = tool.standard || '-';

    const statusEl = document.getElementById('modal-status');
    statusEl.textContent = tool.status || '-';
    statusEl.className =
      'text-[11px] font-bold ' + (tool.status === 'Wajib' ? 'text-red-400' : 'text-emerald-400');

    const rawDesc = tool.description || 'Deskripsi belum tersedia.';
    document.getElementById('modal-desc').textContent =
      rawDesc.length > 200 ? rawDesc.substring(0, 200).trimEnd() + '...' : rawDesc;
  });
}

document.querySelectorAll('#tools-grid .v3-card[data-id]').forEach((card) => {
  card.addEventListener('click', () => openDetail(card.dataset.id));
});

const _toolsBtnClose = document.getElementById('modal-btn-close');
if (_toolsBtnClose) _toolsBtnClose.addEventListener('click', () => closeCatalogModal(TOOLS_IDS));
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) closeCatalogModal(TOOLS_IDS);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCatalogModal(TOOLS_IDS);
});

const _toolsBtnFullscreen = document.getElementById('modal-fullscreen-btn');
if (_toolsBtnFullscreen)
  _toolsBtnFullscreen.addEventListener('click', () => toggleCatalogFullscreen('modal-canvas-wrap'));
initCatalogFullscreen('modal-canvas-wrap');
