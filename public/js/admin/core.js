/**
 * admin/core.js
 * Shared utilities untuk semua halaman admin PLN Pusdiklat.
 * Back end dapat extend fungsi ini sesuai kebutuhan API.
 */

/* ---- Toast Notification ---- */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent   = message;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    toast.style.background = type === 'error' ? '#EF4444' : '#00E5FF';
    toast.style.color      = type === 'error' ? '#fff'    : '#05101E';
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 2800);
}

/* ---- Confirm Dialog ---- */
function showConfirmDialog({ title, message, confirmText = 'Ya, Hapus', iconColor = '#EF4444', onConfirm }) {
    const overlay = document.getElementById('confirm-dialog-overlay');
    if (!overlay) return;

    document.getElementById('confirm-dialog-title').textContent = title;
    document.getElementById('confirm-dialog-message').textContent = message;

    const icon = document.getElementById('confirm-dialog-icon');
    if (icon) {
        icon.style.background = `rgba(${iconColor === '#EF4444' ? '239,68,68' : '245,158,11'}, 0.13)`;
        const svg = icon.querySelector('svg');
        if (svg) svg.setAttribute('stroke', iconColor);
    }

    const okBtn = document.getElementById('confirm-dialog-ok');
    okBtn.textContent = confirmText;
    okBtn.style.background = `rgba(${iconColor === '#EF4444' ? '239,68,68' : '245,158,11'}, 0.13)`;
    okBtn.style.color = iconColor;
    okBtn.style.borderColor = iconColor;
    okBtn.onmouseover = () => { okBtn.style.background = `rgba(${iconColor === '#EF4444' ? '239,68,68' : '245,158,11'}, 0.22)`; };
    okBtn.onmouseout  = () => { okBtn.style.background = `rgba(${iconColor === '#EF4444' ? '239,68,68' : '245,158,11'}, 0.13)`; };

    const fresh = okBtn.cloneNode(true);
    fresh.style.cssText = okBtn.style.cssText;
    fresh.onmouseover = okBtn.onmouseover;
    fresh.onmouseout  = okBtn.onmouseout;
    okBtn.parentNode.replaceChild(fresh, okBtn);
    fresh.addEventListener('click', () => { dismissConfirmDialog(); if (onConfirm) onConfirm(); });

    overlay.style.display = 'flex';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.15s';
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
}

function dismissConfirmDialog() {
    const overlay = document.getElementById('confirm-dialog-overlay');
    if (!overlay) return;
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 160);
}

/* ---- Fetch Backend (Sistem Otentikasi & Penghubung API) ---- */
async function fetchBackend(endpoint, options = {}) {
    // Gunakan port 4000 untuk menembak node backend
    const apiBase = `http://${window.location.hostname}:4000`;
    const token = localStorage.getItem('auth_token');
    
    // Siapkan headers
    const headers = { ...options.headers };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Jangan set Content-Type jika body adalah FormData (agar browser auto-set boundary)
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${apiBase}${endpoint}`, { ...options, headers });
    
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        throw new Error('Sesi Anda telah berakhir, silakan login kembali.');
    }
    
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || result.message || 'Error fetch backend');
    return result;
}


/* ---- Topbar: Tanggal ---- */
function initTopbarDate() {
    const el = document.getElementById('topbar-date');
    if (!el) return;
    const now  = new Date();
    const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    el.textContent = now.toLocaleDateString('id-ID', opts);
}

/* ---- Delete Row Helper (front-end only) ---- */
/**
 * Hanya menghapus baris dari tampilan DOM.
 * Tidak melakukan request ke backend.
 * Gunakan hanya untuk elemen UI sementara (bukan data tersimpan).
 */
function removeRowFromDOM(btn, listId) {
    const row = btn.closest('.item-row');
    if (row) row.remove();
}

/* ---- Period Filter ---- */
function initPeriodFilter() {
    document.querySelectorAll('.filter-period').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-period').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // TODO (back end): fetch data sesuai periode btn.dataset.period
        });
    });
}

/* ---- Add / Remove Dynamic Rows ---- */
function addSpecRow(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'spec-row-wrap';
    row.style.cssText = 'display:grid; grid-template-columns:1fr 1fr 32px; gap:8px; align-items:center;';
    row.innerHTML = `
        <input type="text" placeholder="Nama spek" class="admin-input" style="padding:9px 12px; font-size:12px;">
        <input type="text" placeholder="Nilai"     class="admin-input" style="padding:9px 12px; font-size:12px;">
        <button type="button" onclick="this.parentElement.remove()" class="btn-danger" style="width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:16px;">×</button>
    `;
    container.appendChild(row);
}

function addProcRow(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const num = container.children.length + 1;
    const row = document.createElement('div');
    row.style.cssText = 'display:grid; grid-template-columns:24px 1fr 32px; gap:8px; align-items:center;';
    row.innerHTML = `
        <span style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.3); text-align:center;">${num}</span>
        <input type="text" placeholder="Langkah prosedur..." class="admin-input" style="padding:9px 12px; font-size:12px;">
        <button type="button" onclick="this.parentElement.remove()" class="btn-danger" style="width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:16px;">×</button>
    `;
    container.appendChild(row);
}

/* ---- Logout ---- */
async function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        localStorage.removeItem('auth_token');
        // Hapus session di server (Cookie)
        try {
            await fetch('/clear-session');
        } catch (e) {
            console.error('Gagal menghapus sesi server:', e);
        }
        window.location.href = '/login';
    }
}

/* ---- Skeleton Loader ---- */
function getAdminSkeleton(count = 3) {
    let html = '';
    for(let i=0; i<count; i++) {
        html += `
        <div class="item-row skeleton-box" style="gap:14px; padding:16px; border:1px solid rgba(255,255,255,0.03); background:transparent;">
            <div class="skeleton-box skel-avatar"></div>
            <div style="flex:1;">
                <div class="skeleton-box skel-title"></div>
                <div class="skeleton-box skel-desc"></div>
            </div>
            <div class="skeleton-box skel-btn"></div>
            <div class="skeleton-box skel-btn" style="width:40px;"></div>
        </div>`;
    }
    return html;
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
    initTopbarDate();
    initPeriodFilter();
});
