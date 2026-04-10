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
                    <label class="admin-label">Nama Varian Konstruksi (Asset) *</label>
                    <input type="text" class="admin-input k-name" placeholder="Contoh: Tower SUTT Tipe AA">
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

async function submitSemuaKonstruksi() {
    const saved = document.getElementById('konstruksi-saved');
    
    // 1. Ambil data Modul Utama
    const modulName  = document.getElementById('modul-name') ? document.getElementById('modul-name').value.trim() : '';
    const modulDesc  = document.getElementById('modul-desc') ? document.getElementById('modul-desc').value.trim() : '';
    const matCount   = document.getElementById('modul-mat-count') ? document.getElementById('modul-mat-count').value || '0' : '0';
    const eqCount    = document.getElementById('modul-eq-count') ? document.getElementById('modul-eq-count').value || '0' : '0';
    const statusEl   = document.getElementById('modul-status');
    const status     = statusEl ? statusEl.value : 'Aktif';

    if (!modulName) {
        showToast('Nama Modul Konstruksi wajib diisi!', 'error');
        if(document.getElementById('modul-name')) document.getElementById('modul-name').style.borderColor = '#EF4444';
        return;
    }
    if(document.getElementById('modul-name')) document.getElementById('modul-name').style.borderColor = '';

    // 2. Kumpulkan Varian (Asset 3D)
    let hasError = false;
    let variants = [];
    const cards = document.querySelectorAll('#konstruksi-cards .upload-card');
    
    if (cards.length === 0) {
        showToast('Harus ada minimal 1 varian.', 'error');
        return;
    }

    cards.forEach(card => {
        const nameEl = card.querySelector('.k-name');
        const name   = nameEl ? nameEl.value.trim() : '';
        const fileInput = card.querySelector('input[type=file]');
        const file   = fileInput ? fileInput.files[0] : null;

        if (!name) {
            hasError = true;
            if(nameEl) nameEl.style.borderColor = '#EF4444';
        } else {
            if(nameEl) nameEl.style.borderColor = '';
            variants.push({ name, file });
        }
    });

    if (hasError) {
        showToast('Semua nama varian harus diisi!', 'error');
        return;
    }

    /* TODO (back end) — uncomment dan sesuaikan endpoint:
    try {
        // A. Kirim Modul Induk
        const moduleFormData = new FormData();
        moduleFormData.append('title', modulName);
        moduleFormData.append('description', modulDesc);
        moduleFormData.append('materialCount', matCount);
        moduleFormData.append('equipmentCount', eqCount);
        moduleFormData.append('status', status);
        moduleFormData.append('categoryId', 'konstruksi'); // Asumsi sesuai db
        
        const moduleRes = await fetch('/api/modules', { method: 'POST', body: moduleFormData });
        const moduleData = await moduleRes.json();
        
        // B. Kirim setiap variant ke module_assets
        for(let variant of variants) {
            if(variant.file) {
                 const assetFormData = new FormData();
                 assetFormData.append('name', variant.name);
                 assetFormData.append('file', variant.file);
                 assetFormData.append('moduleId', moduleData.id);
                 await fetch('/api/module-assets', { method: 'POST', body: assetFormData });
            }
        }
    } catch(e) {
        showToast('Gagal menyimpan ke server', 'error');
        return;
    }
    */

    // UI Update - Tampilkan Modul Induk (pura-pura sukses)
    const badgeClass = status === 'Aktif' ? 'badge-green' : status === 'Draft' ? 'badge-yellow' : 'badge-blue';
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
            <div style="font-size:13px;font-weight:600;color:#fff;">${modulName}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">
                ${variants.length} varian · ${matCount} Material · ${eqCount} Peralatan
            </div>
        </div>
        <span class="badge ${badgeClass}">${status}</span>
        <button class="btn-danger" onclick="this.closest('.item-row').remove(); showToast('Item dihapus')">Hapus</button>
    `;
    if(saved) saved.appendChild(row);

    resetKonstruksiForm();
    showToast('Konstruksi beserta varian berhasil disimpan!');
}

function resetKonstruksiForm() {
    if(document.getElementById('modul-name')) document.getElementById('modul-name').value = '';
    if(document.getElementById('modul-desc')) document.getElementById('modul-desc').value = '';
    if(document.getElementById('modul-mat-count')) document.getElementById('modul-mat-count').value = '';
    if(document.getElementById('modul-eq-count')) document.getElementById('modul-eq-count').value = '';
    if(document.getElementById('modul-status')) document.getElementById('modul-status').value = 'Aktif';

    const container = document.getElementById('konstruksi-cards');
    if(container) container.innerHTML = '';
    kCardCount = 0;
    addKonstruksiCard();
}

document.addEventListener('DOMContentLoaded', addKonstruksiCard);
