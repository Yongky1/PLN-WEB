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
      'text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 bg-sky-50 border-sky-200 text-sky-600 cat-badge-teknis';
    catLabel.innerHTML = `<span class="w-1 h-1 rounded-full opacity-70 animate-pulse bg-sky-500"></span>${tool.categoryLabel}`;

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

document.querySelectorAll('#tools-grid .v3-card-item[data-id]').forEach((card) => {
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

var _toolsActiveFilter = 'all';
var _toolsSort = 'none';
var _toolsCurrentPage = 1;
var _toolsItemsPerPage = 40;
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
            _toolsCurrentPage = 1;
            v3FilterTools();
        }
        function v3ToggleToolsFilter() { document.getElementById('tools-filter-menu').classList.toggle('hidden'); }
        function v3SelectToolsFilter(value, label) {
            _toolsActiveFilter = value;
            document.getElementById('tools-filter-label').textContent = label;
            document.getElementById('tools-filter-menu').classList.add('hidden');
            _toolsCurrentPage = 1;
            v3FilterTools();
        }
        document.addEventListener('click', function(e) { var dd = document.getElementById('tools-filter-dd'); if (dd && !dd.contains(e.target)) document.getElementById('tools-filter-menu').classList.add('hidden'); });
        function v3GoToToolsPage(page) {
            _toolsCurrentPage = page;
            v3FilterTools();
            window.scrollTo({ top: document.getElementById('tools-grid').offsetTop - 120, behavior: 'smooth' });
        }

        function v3FilterTools() {
            var q = (document.getElementById('v3-tools-search').value || '').toLowerCase().trim();
            var grid = document.getElementById('tools-grid');
            var cards = grid.querySelectorAll('.v3-card-item');
            var noResults = document.getElementById('v3-tools-no-results');
            var matchedItems = [];
            cards.forEach(function(card) {
                var matchCat = _toolsActiveFilter === 'all' || card.dataset.category === _toolsActiveFilter;
                var matchQ = q === '' || (card.dataset.name || '').includes(q);
                if (matchCat && matchQ) { 
                    card.style.display = ''; 
                    matchedItems.push(card); 
                } else { 
                    card.style.display = 'none'; 
                }
            });

            var totalItems = matchedItems.length;
            var totalPages = Math.ceil(totalItems / _toolsItemsPerPage);
            if (_toolsCurrentPage > totalPages && totalPages > 0) _toolsCurrentPage = totalPages;
            if (_toolsCurrentPage < 1) _toolsCurrentPage = 1;

            var startIndex = (_toolsCurrentPage - 1) * _toolsItemsPerPage;
            var endIndex = startIndex + _toolsItemsPerPage;

            matchedItems.forEach(function (item, index) {
                if (index >= startIndex && index < endIndex) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });

            noResults.style.display = totalItems === 0 ? 'flex' : 'none';

            // Render Pagination
            var pagContainer = document.getElementById('tools-pagination-controls');
            if (pagContainer) {
                pagContainer.innerHTML = '';
                if (totalPages > 1) {
                    var prevBtn = document.createElement('button');
                    prevBtn.className = 'px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm font-medium transition-colors ' + (_toolsCurrentPage === 1 ? 'opacity-50 cursor-not-allowed text-[var(--color-text-muted)] bg-gray-50' : 'hover:bg-gray-50 text-[var(--color-text-primary)] bg-white cursor-pointer');
                    prevBtn.textContent = 'Sebelumnya';
                    if (_toolsCurrentPage > 1) prevBtn.onclick = function () { v3GoToToolsPage(_toolsCurrentPage - 1); };
                    pagContainer.appendChild(prevBtn);

                    for (var i = 1; i <= totalPages; i++) {
                        if (totalPages > 7) {
                            if (i !== 1 && i !== totalPages && Math.abs(i - _toolsCurrentPage) > 1) {
                                if (i === 2 && _toolsCurrentPage > 3 || i === totalPages - 1 && _toolsCurrentPage < totalPages - 2) {
                                    if (pagContainer.lastChild && pagContainer.lastChild.textContent !== '...') {
                                        var dots = document.createElement('span');
                                        dots.className = 'px-2 py-1.5 text-[var(--color-text-muted)] font-medium';
                                        dots.textContent = '...';
                                        pagContainer.appendChild(dots);
                                    }
                                }
                                continue;
                            }
                        }
                        var btn = document.createElement('button');
                        if (i === _toolsCurrentPage) {
                            btn.className = 'px-3.5 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-bold shadow-sm';
                        } else {
                            btn.className = 'px-3.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-text-primary)] text-sm font-medium transition-colors cursor-pointer';
                        }
                        btn.textContent = i;
                        var pg = i;
                        btn.onclick = (function (p) { return function () { v3GoToToolsPage(p); }; })(pg);
                        pagContainer.appendChild(btn);
                    }

                    var nextBtn = document.createElement('button');
                    nextBtn.className = 'px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm font-medium transition-colors ' + (_toolsCurrentPage === totalPages ? 'opacity-50 cursor-not-allowed text-[var(--color-text-muted)] bg-gray-50' : 'hover:bg-gray-50 text-[var(--color-text-primary)] bg-white cursor-pointer');
                    nextBtn.textContent = 'Selanjutnya';
                    if (_toolsCurrentPage < totalPages) nextBtn.onclick = function () { v3GoToToolsPage(_toolsCurrentPage + 1); };
                    pagContainer.appendChild(nextBtn);
                }
            }
        }

        document.getElementById('v3-tools-search').addEventListener('input', function() {
            _toolsCurrentPage = 1;
            v3FilterTools();
        });

        document.addEventListener('DOMContentLoaded', function() {
            v3FilterTools(); // init pagination
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                gsap.to('.gsap-reveal', { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.1 });
                gsap.from('.gsap-stagger-item', { scrollTrigger: { trigger: '#tools-grid', start: 'top 85%' }, y: 50, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
            }
        });
