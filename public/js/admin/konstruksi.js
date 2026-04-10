/**
 * admin/konstruksi.js
 * Upload card dinamis — Manajemen Konstruksi
 *
 * TODO (back end): di submitSemuaKonstruksi(), aktifkan fetch() ke API.
 */

let kCardCount = 0;

function createKonstruksiCard(index, removable) {
    const card       = document.createElement('div');
    card.className   = 'upload-card';
    card.dataset.idx = index;
    card.innerHTML   = `
        <div class="upload-card-header">
            <span class="card-label" style="font-size:12px; font-weight:600; color:#00E5FF;">Konstruksi #${index + 1}</span>
            ${removable
                ? `<button class="card-close-btn" onclick="removeCard(this,'konstruksi-cards')" title="Hapus kartu ini">×</button>`
                : ''}
        </div>
        <div class="upload-card-body">
            <div style="display:flex; flex-direction:column; gap:12px;">

                <div>
                    <label class="admin-label">Nama Konstruksi *</label>
                    <input type="text" class="admin-input k-name" placeholder="Contoh: Tower SUTT 150kV">
                </div>

                <div>
                    <label class="admin-label">Deskripsi</label>
                    <textarea class="admin-input k-desc" rows="3" placeholder="Deskripsikan konstruksi ini..." style="resize:vertical;"></textarea>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label class="admin-label">Jumlah Komponen</label>
                        <input type="number" class="admin-input k-count" placeholder="0" min="0">
                    </div>
                    <div>
                        <label class="admin-label">Status</label>
                        <select class="admin-select k-status">
                            <option>Aktif</option>
                            <option>Draft</option>
                            <option>Pengembangan</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="admin-label">File Model 3D (.glb / .gltf)</label>
                    <div class="file-drop-zone">
                        <input type="file" accept=".glb,.gltf"
                               onchange="handleFileSelect(this)"
                               style="display:none;">
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

    // Aktifkan drag & drop
    const zone = card.querySelector('.file-drop-zone');
    initDropZone(zone);

    return card;
}

function addKonstruksiCard() {
    const container = document.getElementById('konstruksi-cards');
    const card      = createKonstruksiCard(kCardCount, kCardCount > 0);
    container.appendChild(card);
    kCardCount++;
}

function submitSemuaKonstruksi() {
    const cards  = document.querySelectorAll('#konstruksi-cards .upload-card');
    const saved  = document.getElementById('konstruksi-saved');
    let hasError = false;

    cards.forEach(card => {
        const nameEl = card.querySelector('.k-name');
        const name   = nameEl.value.trim();
        const desc   = card.querySelector('.k-desc').value.trim();
        const count  = card.querySelector('.k-count').value || '0';
        const status = card.querySelector('.k-status').value;
        const file   = card.querySelector('input[type=file]').files[0];

        if (!name) {
            hasError = true;
            nameEl.style.borderColor = '#EF4444';
            return;
        }
        nameEl.style.borderColor = '';

        /* TODO (back end) — uncomment dan sesuaikan endpoint:
        const formData = new FormData();
        formData.append('name',   name);
        formData.append('desc',   desc);
        formData.append('count',  count);
        formData.append('status', status);
        if (file) formData.append('file', file);
        await fetch('/api/konstruksi', { method: 'POST', body: formData });
        */

        const badgeClass = status === 'Aktif' ? 'badge-green'
                         : status === 'Draft' ? 'badge-yellow'
                         : 'badge-blue';

        const row       = document.createElement('div');
        row.className   = 'item-row';
        row.innerHTML   = `
            <div class="item-icon">
                <svg style="width:16px;height:16px;color:#00E5FF;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
            </div>
            <div style="flex:1;">
                <div style="font-size:13px;font-weight:600;color:#fff;">${name}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">
                    ${file ? file.name : 'Tanpa file'} · ${count} komponen · ${status}
                </div>
            </div>
            <span class="badge ${badgeClass}">${status}</span>
            <button class="btn-danger" onclick="this.closest('.item-row').remove(); showToast('Item dihapus')">Hapus</button>
        `;
        saved.appendChild(row);
    });

    if (hasError) { showToast('Nama konstruksi wajib diisi.', 'error'); return; }
    resetKonstruksiForm();
    showToast('Konstruksi berhasil disimpan!');
}

function resetKonstruksiForm() {
    document.getElementById('konstruksi-cards').innerHTML = '';
    kCardCount = 0;
    addKonstruksiCard();
}

document.addEventListener('DOMContentLoaded', addKonstruksiCard);
