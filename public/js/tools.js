const toolsData = window.__TOOLS_DATA__;

// ---- DOM Refs ----
const overlay       = document.getElementById('modal-overlay');
const btnClose      = document.getElementById('modal-btn-close');
const btnFullscreen = document.getElementById('modal-fullscreen-btn');
const modelViewer   = document.getElementById('modal-model-viewer');
const canvasWrap    = document.getElementById('modal-canvas-wrap');
const emptyState    = document.getElementById('modal-empty-state');

// ============ OPEN DETAIL MODAL ============
document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => openDetail(card.dataset.id));
});

function openDetail(id) {
    const tool = toolsData.find(t => t.id === id);
    if (!tool) return;

    // ---- Populate Header ----
    // Category: preserve inner pulse dot, append label text after it
    const catLabel = document.getElementById('modal-category-label');
    catLabel.className = 'text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ';
    catLabel.className += 'cat-badge-teknis';
    catLabel.innerHTML = `<span class="w-1 h-1 rounded-full opacity-70 animate-pulse bg-current"></span>${tool.categoryLabel}`;

    document.getElementById('modal-icon').textContent = tool.icon || '🔧';
    document.getElementById('modal-name').textContent = tool.name;
    
    // Status and Standard
    document.getElementById('modal-standard').textContent = tool.standard || '-';
    const statusEl = document.getElementById('modal-status');
    statusEl.textContent = tool.status || '-';
    statusEl.className   = 'text-[11px] font-bold ' + (tool.status === 'Wajib' ? 'text-red-400' : 'text-emerald-400');

    // Truncate description max 200 chars
    const rawDesc = tool.description || 'Deskripsi belum tersedia.';
    const truncDesc = rawDesc.length > 200 ? rawDesc.substring(0, 200).trimEnd() + '...' : rawDesc;
    document.getElementById('modal-desc').textContent = truncDesc;



    // ---- 3D: menggunakan model-viewer ----
    const hasGlb = tool.file3d && tool.file3d.trim() !== '' && tool.file3d !== '-';

    // Reset loading state
    const spinner = document.getElementById('modal-loading-spinner');
    const txt     = document.getElementById('modal-loading-text');
    if (spinner) spinner.style.display = 'block';
    if (txt)     txt.textContent = 'Memuat Model 3D...';

    if (hasGlb) {
        // Ada file GLB — tampilkan model-viewer, sembunyikan empty state
        emptyState.style.display = 'none';
        modelViewer.removeAttribute('src');           // reset dulu supaya poster re-trigger
        setTimeout(() => { modelViewer.src = tool.file3d; }, 50);

        modelViewer.addEventListener('error', () => {
            if (spinner) spinner.style.display = 'none';
            if (txt)     txt.textContent = 'Objek 3D tidak tersedia.';
        }, { once: true });

    } else {
        // Tidak ada GLB — sembunyikan poster, tampilkan empty state
        modelViewer.removeAttribute('src');
        emptyState.style.display   = 'flex';
        // Sembunyikan spinner
        if (spinner) spinner.style.display = 'none';
        if (txt)     txt.textContent = '';
    }

    // Show modal
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // GSAP entrance animation
    if (typeof gsap !== 'undefined') {
        gsap.fromTo('#modal-card',
            { y: 50, opacity: 0, scale: 0.95 },
            { y: 0,  opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
        );
    }
}

// ============ CLOSE DETAIL MODAL ============
function closeDetail() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

if (btnClose) btnClose.addEventListener('click', closeDetail);
overlay.addEventListener('click', e => { if (e.target === overlay) closeDetail(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

// Fullscreen button
if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            canvasWrap.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });
}
