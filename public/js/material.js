/**
 * material.js – Material Catalog Modal Logic
 * 3D area menggunakan <model-viewer> identik dengan ModulViewer.ejs
 */

const materialData = window.__MATERIAL_DATA__;

// ---- DOM Refs ----
const overlay        = document.getElementById('mat-modal-overlay');
const btnClose       = document.getElementById('mat-btn-close');
const btnFullscreen  = document.getElementById('mat-fullscreen-btn');
const modelViewer    = document.getElementById('mat-model-viewer');
const canvasWrap     = document.getElementById('mat-canvas-wrap');
const emptyState     = document.getElementById('mat-empty-state');

// =============================================
// Open Modal
// =============================================
function openModal(id) {
    const mat = materialData.find(m => m.id === id);
    if (!mat) return;

    // ---- Populate Header ----
    // Category: preserve inner pulse dot, append label text after it
    const catEl = document.getElementById('mat-modal-category');
    catEl.innerHTML = `<span class="w-1 h-1 rounded-full bg-[var(--color-pln-yellow)] opacity-70 animate-pulse"></span>${mat.categoryLabel || ''}`;

    document.getElementById('mat-modal-name').textContent = mat.name       || '';
    document.getElementById('mat-modal-code').textContent = mat.code       || '';
    document.getElementById('mat-modal-icon').textContent = mat.icon       || '';
    // Truncate description: max 200 chars
    const rawDesc = mat.description || mat.shortDesc || '';
    const truncDesc = rawDesc.length > 200 ? rawDesc.substring(0, 200).trimEnd() + '...' : rawDesc;
    document.getElementById('mat-modal-desc').textContent = truncDesc;

    // ---- Specs (Apple-style rows) ----
    const specsEl = document.getElementById('mat-modal-specs');
    if (mat.specs && typeof mat.specs === 'object' && Object.keys(mat.specs).length) {
        specsEl.innerHTML = Object.entries(mat.specs).map(([k, v]) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                <span style="font-size:12px; color:rgba(255,255,255,0.4); font-family:'Inter',sans-serif;">${k}</span>
                <span style="font-size:12px; font-weight:700; color:#FFD500; font-family:monospace; letter-spacing:0.04em;">${v}</span>
            </div>
        `).join('');
    } else {
        specsEl.innerHTML = `<p style="font-size:12px; color:rgba(255,255,255,0.25); font-style:italic; padding: 8px 0;">Spesifikasi belum tersedia.</p>`;
    }

    // ---- 3D: menggunakan model-viewer persis seperti ModulViewer ----
    const hasGlb = mat.file3d && mat.file3d.trim() !== '';

    // Reset loading state
    const spinner = document.getElementById('mat-loading-spinner');
    const txt     = document.getElementById('mat-loading-text');
    if (spinner) spinner.style.display = 'block';
    if (txt)     txt.textContent = 'Memuat Skema Spasial...';

    if (hasGlb) {
        // Ada file GLB — tampilkan model-viewer, sembunyikan empty state
        emptyState.style.display = 'none';
        modelViewer.removeAttribute('src');           // reset dulu supaya poster re-trigger
        setTimeout(() => { modelViewer.src = mat.file3d; }, 50);

        modelViewer.addEventListener('error', () => {
            if (spinner) spinner.style.display = 'none';
            if (txt)     txt.textContent = 'Objek 3D tidak tersedia.';
        }, { once: true });

    } else {
        // Tidak ada GLB — sembunyikan poster, tampilkan empty state
        modelViewer.removeAttribute('src');
        emptyState.style.display   = 'flex';
        // Sembunyikan spinner (karena tidak ada yang perlu diload)
        if (spinner) spinner.style.display = 'none';
        if (txt)     txt.textContent = '';
    }

    // ---- Show overlay ----
    overlay.style.display = 'flex';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // ---- GSAP entrance animation ----
    if (typeof gsap !== 'undefined') {
        gsap.fromTo('#mat-modal-card',
            { y: 50, opacity: 0, scale: 0.95 },
            { y: 0,  opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
        );
    }
}

// =============================================
// Close Modal
// =============================================
function closeModal() {
    // Reset model-viewer — identik dengan closePreviewModal di ModulKonstruksi
    if (modelViewer) {
        modelViewer.removeAttribute('src');
    }

    overlay.classList.remove('active');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

// =============================================
// Fullscreen Toggle — identik dengan ModulViewer toggleFullscreen()
// =============================================
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        const target = canvasWrap;
        if (target.requestFullscreen)       target.requestFullscreen().catch(err => console.error(err));
        else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
        else if (target.msRequestFullscreen)     target.msRequestFullscreen();
    } else {
        if (document.exitFullscreen)             document.exitFullscreen();
        else if (document.webkitExitFullscreen)  document.webkitExitFullscreen();
        else if (document.msExitFullscreen)      document.msExitFullscreen();
    }
}

// Handle fullscreen styling — identik ModulViewer
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === canvasWrap) {
        canvasWrap.style.borderRadius = '0px';
        canvasWrap.style.border       = 'none';
    } else {
        canvasWrap.style.borderRadius = '';
        canvasWrap.style.border       = '';
    }
});

// =============================================
// Event Listeners
// =============================================
document.querySelectorAll('.mat-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
});

if (btnClose)      btnClose.addEventListener('click', closeModal);
if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);

overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
