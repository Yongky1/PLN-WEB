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

                <div>
                    <label class="admin-label">Nama Varian Material (Asset) *</label>
                    <input type="text" class="admin-input m-name" placeholder="Contoh: Baut HDG Ukuran M16">
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

    const zone = card.querySelector('.file-drop-zone');
    initDropZone(zone);

    return card;
}

function addMaterialCard() {
    const container = document.getElementById('material-cards');
    const card      = createMaterialCard(mCardCount, mCardCount > 0);
    container.appendChild(card);
    mCardCount++;
}

async function submitSemuaMaterial() {
    const saved = document.getElementById('material-saved');
    
    // 1. Ambil data Modul Utama
    const modulName  = document.getElementById('mat-modul-name') ? document.getElementById('mat-modul-name').value.trim() : '';
    const modulCode  = document.getElementById('mat-modul-code') ? document.getElementById('mat-modul-code').value.trim() : '';
    const modulDesc  = document.getElementById('mat-modul-desc') ? document.getElementById('mat-modul-desc').value.trim() : '';
    const catEl      = document.getElementById('mat-modul-cat');
    const category   = catEl ? catEl.value : 'Lainnya';
    const statusEl   = document.getElementById('mat-modul-status');
    const status     = statusEl ? statusEl.value : 'Aktif';

    if (!modulName || !modulCode) {
        showToast('Nama Material & Kode wajib diisi!', 'error');
        if(document.getElementById('mat-modul-name')) document.getElementById('mat-modul-name').style.borderColor = modulName ? '' : '#EF4444';
        if(document.getElementById('mat-modul-code')) document.getElementById('mat-modul-code').style.borderColor = modulCode ? '' : '#EF4444';
        return;
    }
    if(document.getElementById('mat-modul-name')) document.getElementById('mat-modul-name').style.borderColor = '';
    if(document.getElementById('mat-modul-code')) document.getElementById('mat-modul-code').style.borderColor = '';

    // 2. Kumpulkan Varian (Asset 3D)
    let hasError = false;
    let variants = [];
    const cards = document.querySelectorAll('#material-cards .upload-card');
    
    if (cards.length === 0) {
        showToast('Harus ada minimal 1 varian.', 'error');
        return;
    }

    cards.forEach(card => {
        const nameEl = card.querySelector('.m-name');
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
        const moduleFormData = new FormData();
        moduleFormData.append('title', modulName);
        moduleFormData.append('code', modulCode);
        moduleFormData.append('description', modulDesc);
        moduleFormData.append('category', category);
        moduleFormData.append('status', status);
        moduleFormData.append('categoryId', 'material');
        
        const moduleRes = await fetch('/api/modules', { method: 'POST', body: moduleFormData });
        const moduleData = await moduleRes.json();
        
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

    const badgeClass = status === 'Aktif' ? 'badge-green' : status === 'Draft' ? 'badge-yellow' : 'badge-blue';
    const row       = document.createElement('div');
    row.className   = 'item-row';
    row.innerHTML   = `
        <div class="item-icon">
            <svg style="width:16px;height:16px;color:#818CF8;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
        </div>
        <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;color:#fff;">${modulName}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">
                ${variants.length} varian · Kategori: ${category}
            </div>
        </div>
        <span class="badge ${badgeClass}">${status}</span>
        <button class="btn-danger" onclick="this.closest('.item-row').remove(); showToast('Item dihapus')">Hapus</button>
    `;
    if(saved) saved.appendChild(row);

    resetMaterialForm();
    showToast('Material beserta varian berhasil disimpan!');
}

function resetMaterialForm() {
    if(document.getElementById('mat-modul-name')) document.getElementById('mat-modul-name').value = '';
    if(document.getElementById('mat-modul-code')) document.getElementById('mat-modul-code').value = '';
    if(document.getElementById('mat-modul-desc')) document.getElementById('mat-modul-desc').value = '';
    if(document.getElementById('mat-modul-cat')) document.getElementById('mat-modul-cat').value = 'Pengencang';
    if(document.getElementById('mat-modul-status')) document.getElementById('mat-modul-status').value = 'Aktif';

    const container = document.getElementById('material-cards');
    if(container) container.innerHTML = '';
    mCardCount = 0;
    addMaterialCard();
}

document.addEventListener('DOMContentLoaded', addMaterialCard);
