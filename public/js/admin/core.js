/**
 * admin/core.js
 * Shared utilities untuk semua halaman admin PLN Pusdiklat.
 * Back end dapat extend fungsi ini sesuai kebutuhan API.
 */

/* ---- Security Guard (Otentikasi JWT) ---- */
const token = localStorage.getItem('auth_token');
if (!token) {
    window.location.href = '/login';
}

/* ---- Fetch Backend Helper ---- */
async function fetchBackend(endpoint, options = {}) {
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    
    // Merge headers kustom
    if (options.headers) {
        Object.assign(headers, options.headers);
    }
    
    // Set Content-Type otomatis kecuali untuk FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`http://localhost:4000${endpoint}`, {
        ...options,
        headers
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || 'Network Error');
    return data;
}

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

/* ---- Topbar: Tanggal ---- */
function initTopbarDate() {
    const el = document.getElementById('topbar-date');
    if (!el) return;
    const now  = new Date();
    const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    el.textContent = now.toLocaleDateString('id-ID', opts);
}

/* ---- Delete Row Helper (front-end only) ---- */
function deleteRow(btn, listId) {
    const row = btn.closest('.item-row');
    if (row) row.remove();
    showToast('Item berhasil dihapus');
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

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
    initTopbarDate();
    initPeriodFilter();
});
