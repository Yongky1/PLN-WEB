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
  loadingOverlay: 'modal-loading-overlay',
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

    document.getElementById('modal-name').textContent = tool.name;

    document.getElementById('modal-standard').textContent = tool.standard || '-';

    const statusEl = document.getElementById('modal-status');
    statusEl.textContent = tool.status || '-';
    statusEl.className =
      'text-[11px] font-bold ' + (tool.status === 'Wajib' ? 'text-red-400' : 'text-emerald-400');

    const rawDesc = tool.description || 'Deskripsi belum tersedia.';
    document.getElementById('modal-desc').textContent = rawDesc;
  });
}

document.querySelectorAll('#tools-grid .mv-card[data-id]').forEach((card) => {
  card.addEventListener('click', () => openModal(card.dataset.id));
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

var _toolsActiveFilter = 'all';
        var _toolsSort = 'none';
        (function() { var cards = document.getElementById('tools-grid').querySelectorAll('.v3-card-item'); cards.forEach(function(c, i) { c.dataset.origIdx = i; }); })();

        function v3ToggleToolsSort() {
            var lbl = document.getElementById('tools-sort-label');
            if (_toolsSort === 'none' || _toolsSort === 'desc') { _toolsSort = 'asc'; lbl.textContent = 'A→Z'; } else { _toolsSort = 'desc'; lbl.textContent = 'Z→A'; }
            v3SortToolsGrid();
        }
        function v3SortToolsGrid() {
            var grid = document.getElementById('tools-grid');
            var cards = Array.from(grid.querySelectorAll('.v3-card-item'));
            if (_toolsSort === 'none') { cards.sort(function(a, b) { return a.dataset.origIdx - b.dataset.origIdx; }); }
            else { cards.sort(function(a, b) { var na = (a.dataset.name || ''); var nb = (b.dataset.name || ''); return _toolsSort === 'asc' ? na.localeCompare(nb, 'id') : nb.localeCompare(na, 'id'); }); }
            cards.forEach(function(c) { grid.appendChild(c); });
        }
        function v3ToggleToolsFilter() { document.getElementById('tools-filter-menu').classList.toggle('hidden'); }
        function v3SelectToolsFilter(value, label) {
            _toolsActiveFilter = value;
            document.getElementById('tools-filter-label').textContent = label;
            document.getElementById('tools-filter-menu').classList.add('hidden');
            v3FilterTools();
        }
        document.addEventListener('click', function(e) { var dd = document.getElementById('tools-filter-dd'); if (dd && !dd.contains(e.target)) document.getElementById('tools-filter-menu').classList.add('hidden'); });
        function v3FilterTools() {
            var q = (document.getElementById('v3-tools-search').value || '').toLowerCase().trim();
            var grid = document.getElementById('tools-grid');
            var cards = grid.querySelectorAll('.v3-card-item');
            var noResults = document.getElementById('v3-tools-no-results');
            var visible = 0;
            cards.forEach(function(card) {
                var matchCat = _toolsActiveFilter === 'all' || card.dataset.category === _toolsActiveFilter;
                var matchQ = q === '' || (card.dataset.name || '').includes(q);
                if (matchCat && matchQ) { card.style.display = ''; visible++; } else { card.style.display = 'none'; }
            });
            noResults.style.display = visible === 0 ? 'flex' : 'none';
        }
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                gsap.to('.gsap-reveal', { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.1 });
                gsap.from('.gsap-stagger-item', { scrollTrigger: { trigger: '#tools-grid', start: 'top 85%' }, y: 50, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
            }
        });
