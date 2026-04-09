/**
 * admin/material-admin.js
 * Logic halaman Manajemen Material.
 * TODO (back end): ganti fungsi submit* dengan fetch() ke API endpoint.
 */
async function submitMaterial() {
    const name = document.getElementById('m-name').value.trim();
    const code = document.getElementById('m-code').value.trim();
    const catEl = document.getElementById('m-cat');
    const cat  = catEl.value;
    const catTxt = catEl.options[catEl.selectedIndex].text;
    const icon = document.getElementById('m-icon').value || '🔩';
    const shortdesc = document.getElementById('m-shortdesc') ? document.getElementById('m-shortdesc').value : '';
    const desc = document.getElementById('m-desc') ? document.getElementById('m-desc').value : '';

    if (!name || !code) { showToast('Nama dan kode material wajib diisi.', 'error'); return; }

    try {
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.round(Math.random()*1000);
        
        await fetchBackend('/api/materials', {
            method: 'POST',
            body: JSON.stringify({
                id: id,
                name: name,
                code: code,
                categoryLabel: catTxt,
                icon: icon,
                shortDesc: shortdesc,
                description: desc
            })
        });

        const item = document.createElement('div');
        item.className = 'item-row';
        item.innerHTML = `
            <div style="font-size:24px;flex-shrink:0;">${icon}</div>
            <div style="flex:1;"><div style="font-size:13px;font-weight:600;color:#fff;">${name}</div><div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">${code} · ${catTxt}</div></div>
            <span class="badge badge-green">Aktif</span>
            <button class="btn-danger" onclick="deleteRow(this)">Hapus</button>
        `;
        document.getElementById('material-list').appendChild(item);
        resetForm('m');
        showToast('Terkirim ke Supabase! Material ditambahkan.', 'success');

    } catch (err) {
        console.error(err);
        showToast(err.message, 'error');
    }
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
