const PAGE_META = {
    overview:        { title: 'Overview',              subtitle: 'Selamat datang di panel administrator' },
    users:           { title: 'Manajemen User',         subtitle: 'Kelola akun dan akses pengguna' },
    modules:         { title: 'Modul Konten',           subtitle: 'Kelola modul pembelajaran dan konten' },
    'add-konstruksi':{ title: 'Tambah Konstruksi',      subtitle: 'Tambah dan kelola data konstruksi jaringan' },
    'add-material':  { title: 'Tambah Material',        subtitle: 'Tambah dan kelola katalog material jaringan' },
    'add-tools':     { title: 'Tambah Tools & Alat K3', subtitle: 'Tambah dan kelola katalog alat lapangan' },
    reports:         { title: 'Laporan',                subtitle: 'Statistik dan laporan penggunaan platform' },
    settings:        { title: 'Pengaturan',             subtitle: 'Konfigurasi sistem dan preferensi admin' },
};

function navigate(pageId) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));

    const targetPage = document.getElementById('page-' + pageId);
    const targetLink = document.querySelector('[data-page="' + pageId + '"]');
    if (targetPage) targetPage.classList.add('active');
    if (targetLink) targetLink.classList.add('active');

    const meta = PAGE_META[pageId];
    if (meta) {
        document.getElementById('page-title').textContent    = meta.title;
        document.getElementById('page-subtitle').textContent = meta.subtitle;
    }
}

document.querySelectorAll('.sidebar-link').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
});

function toggleSwitch(el) {
    const dot    = el.querySelector('div');
    const isOn   = dot.style.left === '20px';
    dot.style.left      = isOn ? '3px' : '20px';
    el.style.background = isOn ? 'rgba(255,255,255,0.12)' : '#00E5FF';
}

function updateDate() {
    const now  = new Date();
    const opts = { weekday:'long', day:'numeric', month:'long', year:'numeric' };
    const el   = document.getElementById('current-date');
    if (el) el.textContent = now.toLocaleDateString('id-ID', opts);
}
updateDate();

function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:28px;right:28px;z-index:9999;background:#00E5FF;color:#05101E;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:700;font-family:inherit;box-shadow:0 8px 24px rgba(0,229,255,0.3);animation:fadeIn 0.2s ease;';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2800);
}

function deleteRow(btn) {
    btn.closest('[style*="border-radius:14px"]').remove();
    showToast('Item berhasil dihapus');
}

function addKonstruksi() {
    const name  = document.getElementById('konstruksi-name').value.trim();
    const count = document.getElementById('konstruksi-count').value || '0';
    const status = document.getElementById('konstruksi-status').value;
    if (!name) { alert('Nama konstruksi tidak boleh kosong.'); return; }

    const item = document.createElement('div');
    item.style.cssText = 'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px 20px;display:flex;align-items:center;gap:16px;';
    item.innerHTML = `
        <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,229,255,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg style="width:16px;height:16px;color:#00E5FF;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/></svg>
        </div>
        <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;color:#fff;">${name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">${count} komponen · ${status}</div>
        </div>
        <span style="font-size:11px;padding:3px 10px;border-radius:999px;background:rgba(0,200,100,0.12);color:#00C864;font-weight:600;">${status}</span>
        <button onclick="deleteRow(this)" style="padding:6px 12px;border-radius:8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#EF4444;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;">Hapus</button>
    `;
    document.getElementById('konstruksi-list').appendChild(item);
    resetForm('konstruksi');
    showToast('Konstruksi berhasil ditambahkan!');
}

function addMaterial() {
    const name = document.getElementById('material-name').value.trim();
    const code = document.getElementById('material-code').value.trim();
    const cat  = document.getElementById('material-category').value;
    const icon = document.getElementById('material-icon').value || '🔩';
    if (!name || !code) { alert('Nama dan kode material tidak boleh kosong.'); return; }

    const item = document.createElement('div');
    item.style.cssText = 'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px 20px;display:flex;align-items:center;gap:16px;';
    item.innerHTML = `
        <div style="font-size:24px;flex-shrink:0;">${icon}</div>
        <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;color:#fff;">${name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">${code} · ${cat}</div>
        </div>
        <span style="font-size:11px;padding:3px 10px;border-radius:999px;background:rgba(0,200,100,0.12);color:#00C864;font-weight:600;">Aktif</span>
        <button onclick="deleteRow(this)" style="padding:6px 12px;border-radius:8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#EF4444;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;">Hapus</button>
    `;
    document.getElementById('material-list').appendChild(item);
    resetForm('material');
    showToast('Material berhasil ditambahkan!');
}

function addTools() {
    const name  = document.getElementById('tools-name').value.trim();
    const icon  = document.getElementById('tools-icon').value || '🔧';
    const cat   = document.getElementById('tools-category');
    const std   = document.getElementById('tools-standard').value;
    const status = document.getElementById('tools-status').value;
    const catLabel = cat.options[cat.selectedIndex].text;
    if (!name) { alert('Nama alat tidak boleh kosong.'); return; }

    const badgeColor = cat.value === 'k3' ? 'rgba(239,68,68,0.1)' : cat.value === 'teknis' ? 'rgba(0,229,255,0.1)' : 'rgba(168,110,221,0.12)';
    const badgeText  = cat.value === 'k3' ? '#EF4444' : cat.value === 'teknis' ? '#00E5FF' : '#A86EDD';

    const item = document.createElement('div');
    item.style.cssText = 'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px 20px;display:flex;align-items:center;gap:16px;';
    item.innerHTML = `
        <div style="font-size:24px;flex-shrink:0;">${icon}</div>
        <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;color:#fff;">${name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">${catLabel}${std ? ' · ' + std : ''} · ${status}</div>
        </div>
        <span style="font-size:11px;padding:3px 10px;border-radius:999px;background:${badgeColor};color:${badgeText};font-weight:600;">${catLabel}</span>
        <button onclick="deleteRow(this)" style="padding:6px 12px;border-radius:8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#EF4444;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;">Hapus</button>
    `;
    document.getElementById('tools-list').appendChild(item);
    resetForm('tools');
    showToast('Alat berhasil ditambahkan!');
}

function resetForm(type) {
    if (type === 'konstruksi') {
        document.getElementById('konstruksi-name').value  = '';
        document.getElementById('konstruksi-desc').value  = '';
        document.getElementById('konstruksi-count').value = '';
        document.getElementById('konstruksi-status').selectedIndex = 0;
    } else if (type === 'material') {
        ['material-name','material-code','material-shortdesc','material-desc','material-icon'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('material-category').selectedIndex = 0;
    } else if (type === 'tools') {
        ['tools-name','tools-icon','tools-standard','tools-desc'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('tools-category').selectedIndex = 0;
        document.getElementById('tools-status').selectedIndex   = 0;
    }
}

function addSpecRow() {
    const container = document.getElementById('spec-rows');
    const row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 32px;gap:8px;align-items:center;';
    row.innerHTML = `
        <input type="text" placeholder="Nama spek" style="padding:9px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff;font-size:12px;font-family:inherit;outline:none;">
        <input type="text" placeholder="Nilai" style="padding:9px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff;font-size:12px;font-family:inherit;outline:none;">
        <button onclick="removeSpecRow(this)" style="width:32px;height:32px;border-radius:8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#EF4444;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">×</button>
    `;
    container.appendChild(row);
}

function removeSpecRow(btn) {
    const rows = document.getElementById('spec-rows').children;
    if (rows.length > 1) btn.parentElement.remove();
}

function addProcRow() {
    const container = document.getElementById('procedure-rows');
    const num = container.children.length + 1;
    const row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:24px 1fr 32px;gap:8px;align-items:center;';
    row.innerHTML = `
        <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);text-align:center;">${num}</span>
        <input type="text" placeholder="Langkah prosedur..." style="padding:9px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff;font-size:12px;font-family:inherit;outline:none;">
        <button onclick="removeProcRow(this)" style="width:32px;height:32px;border-radius:8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#EF4444;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">×</button>
    `;
    container.appendChild(row);
}

function removeProcRow(btn) {
    const rows = document.getElementById('procedure-rows').children;
    if (rows.length > 1) btn.parentElement.remove();
}

