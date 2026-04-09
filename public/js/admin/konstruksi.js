/**
 * admin/konstruksi.js
 * Logic halaman Manajemen Konstruksi.
 * TODO (back end): ganti fungsi submit* dengan fetch() ke API endpoint.
 */
function submitKonstruksi() {
    const name   = document.getElementById('k-name').value.trim();
    const count  = document.getElementById('k-count').value || '0';
    const status = document.getElementById('k-status').value;
    if (!name) { showToast('Nama konstruksi tidak boleh kosong.', 'error'); return; }

    const item = document.createElement('div');
    item.className = 'item-row';
    item.innerHTML = `
        <div class="item-icon"><svg style="width:16px;height:16px;color:#00E5FF;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/></svg></div>
        <div style="flex:1;"><div style="font-size:13px;font-weight:600;color:#fff;">${name}</div><div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">${count} komponen · ${status}</div></div>
        <span class="badge badge-green">${status}</span>
        <button class="btn-danger" onclick="deleteRow(this)">Hapus</button>
    `;
    document.getElementById('konstruksi-list').appendChild(item);
    resetForm('k');
    showToast('Konstruksi berhasil ditambahkan!');
}

function resetForm(prefix) {
    ['name','desc','count'].forEach(f => {
        const el = document.getElementById(`${prefix}-${f}`);
        if (el) el.value = '';
    });
    const status = document.getElementById(`${prefix}-status`);
    if (status) status.selectedIndex = 0;
}
