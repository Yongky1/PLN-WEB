/**
 * admin/tools-admin.js
 * Logic halaman Manajemen Peralatan.
 * TODO (back end): ganti fungsi submit* dengan fetch() ke API endpoint.
 */
function submitTools() {
    const name   = document.getElementById('t-name').value.trim();
    const icon   = document.getElementById('t-icon').value || '🔧';
    const catEl  = document.getElementById('t-cat');
    const catTxt = catEl.options[catEl.selectedIndex].text;
    const std    = document.getElementById('t-standard').value;
    const status = document.getElementById('t-status').value;
    if (!name) { showToast('Nama alat tidak boleh kosong.', 'error'); return; }

    const badgeMap = { 'Alat K3':'badge-red', 'Alat Teknis':'badge-blue', 'Pengukuran':'badge-yellow' };
    const item = document.createElement('div');
    item.className = 'item-row';
    item.innerHTML = `
        <div style="font-size:24px;flex-shrink:0;">${icon}</div>
        <div style="flex:1;"><div style="font-size:13px;font-weight:600;color:#fff;">${name}</div><div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">${catTxt}${std ? ' · ' + std : ''} · ${status}</div></div>
        <span class="badge ${badgeMap[catTxt]||'badge-blue'}">${catTxt}</span>
        <button class="btn-danger" onclick="deleteRow(this)">Hapus</button>
    `;
    document.getElementById('tools-list').appendChild(item);
    resetForm('t');
    showToast('Alat berhasil ditambahkan!');
}

function resetForm(prefix) {
    ['name','icon','standard','desc'].forEach(f => {
        const el = document.getElementById(`${prefix}-${f}`);
        if (el) el.value = '';
    });
    ['cat','status'].forEach(f => {
        const el = document.getElementById(`${prefix}-${f}`);
        if (el) el.selectedIndex = 0;
    });
}
