/**
 * admin/material-admin.js
 * Upload card dinamis — Manajemen Material
 *
 * TODO (back end): di submitSemuaMaterial(), aktifkan fetch() ke API.
 */

let mCardCount = 0;

function createMaterialCard(index, removable) {
    const card       = document.createElement('div');
    card.className   = 'upload-card';
    card.dataset.idx = index;
    card.innerHTML   = `
        <div class="upload-card-header">
            <span class="card-label" style="font-size:12px; font-weight:600; color:#818CF8;">Material #${index + 1}</span>
            ${removable
                ? `<button class="card-close-btn" onclick="removeCard(this,'material-cards')" title="Hapus kartu ini">×</button>`
                : ''}
        </div>
        <div class="upload-card-body">
            <div style="display:flex; flex-direction:column; gap:12px;">

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label class="admin-label">Nama Material *</label>
                        <input type="text" class="admin-input m-name" placeholder="Contoh: Baut M24 HDG">
                    </div>
                    <div>
                        <label class="admin-label">Kode Material *</label>
                        <input type="text" class="admin-input m-code" placeholder="Contoh: BT-M24-HDG">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label class="admin-label">Kategori</label>
                        <select class="admin-select m-cat">
                            <option>Pengencang</option>
                            <option>Insulasi</option>
                            <option>Kabel</option>
                            <option>Penyangga</option>
                            <option>Lainnya</option>
                        </select>
                    </div>
                    <div>
                        <label class="admin-label">Status</label>
                        <select class="admin-select m-status">
                            <option>Aktif</option>
                            <option>Draft</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="admin-label">Deskripsi Singkat</label>
                    <input type="text" class="admin-input m-desc" placeholder="Deskripsi singkat untuk kartu...">
                </div>

                <div>
                    <label class="admin-label">File Model 3D (.glb / .gltf)</label>
                    <div class="file-drop-zone">
                        <input type="file" accept=".glb,.gltf"
                               onchange="handleFileSelect(this)"
                               style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;">
                        <svg class="drop-icon" style="width:22px;height:22px;color:rgba(255,255,255,0.25);"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <span class="drop-label" style="font-size:12px;color:rgba(255,255,255,0.35);">
                            Drag & drop atau klik untuk upload
                        </span>
                        <span style="font-size:11px;color:rgba(255,255,255,0.2);">Format: .glb, .gltf (maks. 50MB)</span>
                    </div>
                </div>

            </div>
        </div>
    `;

    initDropZone(card.querySelector('.file-drop-zone'));
    return card;
}

function addMaterialCard() {
    const container = document.getElementById('material-cards');
    container.appendChild(createMaterialCard(mCardCount, mCardCount > 0));
    mCardCount++;
}

function submitSemuaMaterial() {
    const cards  = document.querySelectorAll('#material-cards .upload-card');
    const saved  = document.getElementById('material-saved');
    let hasError = false;

    cards.forEach(card => {
        const nameEl = card.querySelector('.m-name');
        const codeEl = card.querySelector('.m-code');
        const name   = nameEl.value.trim();
        const code   = codeEl.value.trim();
        const cat    = card.querySelector('.m-cat').value;
        const status = card.querySelector('.m-status').value;
        const file   = card.querySelector('input[type=file]').files[0];

        if (!name || !code) {
            hasError = true;
            if (!name) nameEl.style.borderColor = '#EF4444';
            if (!code) codeEl.style.borderColor = '#EF4444';
            return;
        }
        nameEl.style.borderColor = '';
        codeEl.style.borderColor = '';

        /* TODO (back end):
        const formData = new FormData();
        formData.append('name',     name);
        formData.append('code',     code);
        formData.append('category', cat);
        formData.append('status',   status);
        if (file) formData.append('file', file);
        await fetch('/api/material', { method: 'POST', body: formData });
        */

        const row     = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <div class="item-icon" style="background:rgba(129,140,248,0.1);">
                <svg style="width:16px;height:16px;color:#818CF8;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
            </div>
            <div style="flex:1;">
                <div style="font-size:13px;font-weight:600;color:#fff;">${name}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">
                    ${code} · ${file ? file.name : 'Tanpa file'} · ${cat}
                </div>
            </div>
            <span class="badge badge-${status === 'Aktif' ? 'green' : 'yellow'}">${status}</span>
            <button class="btn-danger" onclick="this.closest('.item-row').remove(); showToast('Item dihapus')">Hapus</button>
        `;
        saved.appendChild(row);
    });

    if (hasError) { showToast('Nama dan kode material wajib diisi.', 'error'); return; }
    resetMaterialForm();
    showToast('Material berhasil disimpan!');
}

function resetMaterialForm() {
    document.getElementById('material-cards').innerHTML = '';
    mCardCount = 0;
    addMaterialCard();
}

document.addEventListener('DOMContentLoaded', addMaterialCard);
