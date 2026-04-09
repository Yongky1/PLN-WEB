/**
 * admin/material-admin.js
 * Logic halaman Manajemen Material.
 * TODO (back end): ganti fungsi submit* dengan fetch() ke API endpoint.
 */
function submitMaterial() {
    const name = document.getElementById('m-name').value.trim();
    const code = document.getElementById('m-code').value.trim();
    const cat  = document.getElementById('m-cat').value;
    const icon = document.getElementById('m-icon').value || '🔩';
    if (!name || !code) { showToast('Nama dan kode material wajib diisi.', 'error'); return; }

    const item = document.createElement('div');
    item.className = 'item-row';
    item.innerHTML = `
        <div style="font-size:24px;flex-shrink:0;">${icon}</div>
        <div style="flex:1;"><div style="font-size:13px;font-weight:600;color:#fff;">${name}</div><div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">${code} · ${cat}</div></div>
        <span class="badge badge-green">Aktif</span>
        <button class="btn-danger" onclick="deleteRow(this)">Hapus</button>
    `;
    document.getElementById('material-list').appendChild(item);
    resetForm('m');
    showToast('Material berhasil ditambahkan!');
}

function resetForm(prefix) {
    ['name','code','shortdesc','desc','icon'].forEach(f => {
        const el = document.getElementById(`${prefix}-${f}`);
        if (el) el.value = '';
    });
    const cat = document.getElementById(`${prefix}-cat`);
    if (cat) cat.selectedIndex = 0;
    const container = document.getElementById('spec-container');
    if (container) container.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 32px;gap:8px;align-items:center;">
            <input type="text" class="admin-input" placeholder="Nama spek" style="padding:9px 12px;font-size:12px;">
            <input type="text" class="admin-input" placeholder="Nilai"     style="padding:9px 12px;font-size:12px;">
            <button type="button" onclick="this.parentElement.remove()" class="btn-danger" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;">×</button>
        </div>`;
}
