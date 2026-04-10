/**
 * admin/tools-admin.js
 * Upload card dinamis — Manajemen Peralatan
 *
 * TODO (back end): di submitSemuaTools(), aktifkan fetch() ke API.
 */

let tCardCount = 0;

function createToolsCard(index, removable) {
    const card       = document.createElement('div');
    card.className   = 'upload-card';
    card.dataset.idx = index;
    card.innerHTML   = `
        <div class="upload-card-header">
            <span class="card-label" style="font-size:12px; font-weight:600; color:#F59E0B;">Peralatan #${index + 1}</span>
            ${removable
                ? `<button class="card-close-btn" onclick="removeCard(this,'tools-cards')" title="Hapus kartu ini">×</button>`
                : ''}
        </div>
        <div class="upload-card-body">
            <div style="display:flex; flex-direction:column; gap:12px;">

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label class="admin-label">Nama Alat *</label>
                        <input type="text" class="admin-input t-name" placeholder="Contoh: Kunci Torsi">
                    </div>
                    <div>
                        <label class="admin-label">Standar</label>
                        <input type="text" class="admin-input t-standard" placeholder="SNI / IEC / ISO">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label class="admin-label">Kategori</label>
                        <select class="admin-select t-cat">
                            <option value="k3">Alat K3</option>
                            <option value="teknis">Alat Teknis</option>
                            <option value="pengukuran">Pengukuran</option>
                        </select>
                    </div>
                    <div>
                        <label class="admin-label">Status Penggunaan</label>
                        <select class="admin-select t-status">
                            <option>Wajib</option>
                            <option>Situasional</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="admin-label">Deskripsi</label>
                    <textarea class="admin-input t-desc" rows="2" placeholder="Jelaskan fungsi alat..." style="resize:vertical;"></textarea>
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

function addToolsCard() {
    const container = document.getElementById('tools-cards');
    container.appendChild(createToolsCard(tCardCount, tCardCount > 0));
    tCardCount++;
}

function submitSemuaTools() {
    const cards  = document.querySelectorAll('#tools-cards .upload-card');
    const saved  = document.getElementById('tools-saved');
    let hasError = false;

    cards.forEach(card => {
        const nameEl  = card.querySelector('.t-name');
        const name    = nameEl.value.trim();
        const std     = card.querySelector('.t-standard').value.trim();
        const catEl   = card.querySelector('.t-cat');
        const catVal  = catEl.value;
        const catTxt  = catEl.options[catEl.selectedIndex].text;
        const status  = card.querySelector('.t-status').value;
        const file    = card.querySelector('input[type=file]').files[0];

        if (!name) {
            hasError = true;
            nameEl.style.borderColor = '#EF4444';
            return;
        }
        nameEl.style.borderColor = '';

        /* TODO (back end):
        const formData = new FormData();
        formData.append('name',     name);
        formData.append('standard', std);
        formData.append('category', catVal);
        formData.append('status',   status);
        if (file) formData.append('file', file);
        await fetch('/api/tools', { method: 'POST', body: formData });
        */

        const badgeClass = catVal === 'k3'        ? 'badge-red'
                         : catVal === 'teknis'     ? 'badge-blue'
                         : 'badge-yellow';

        const row     = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <div class="item-icon" style="background:rgba(245,158,11,0.1);">
                <svg style="width:16px;height:16px;color:#F59E0B;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            </div>
            <div style="flex:1;">
                <div style="font-size:13px;font-weight:600;color:#fff;">${name}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">
                    ${catTxt}${std ? ' · ' + std : ''} · ${file ? file.name : 'Tanpa file'} · ${status}
                </div>
            </div>
            <span class="badge ${badgeClass}">${catTxt}</span>
            <button class="btn-danger" onclick="this.closest('.item-row').remove(); showToast('Item dihapus')">Hapus</button>
        `;
        saved.appendChild(row);
    });

    if (hasError) { showToast('Nama alat wajib diisi.', 'error'); return; }
    resetToolsForm();
    showToast('Peralatan berhasil disimpan!');
}

function resetToolsForm() {
    document.getElementById('tools-cards').innerHTML = '';
    tCardCount = 0;
    addToolsCard();
}

document.addEventListener('DOMContentLoaded', addToolsCard);
