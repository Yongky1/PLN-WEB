/**
 * admin/material-admin.js
 * Upload card dinamis — Manajemen Material
 */

let mCardCount = 0;
window.currentEditingId = null;
window.allMaterials = [];

function generateSafeUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function loadMaterialSaved() {
    const saved = document.getElementById('material-saved');
    if (!saved) return;
    
    saved.innerHTML = getAdminSkeleton(3);
    try {
        const materials = await fetchBackend('/api/materials?all=true');
        window.allMaterials = materials;
        saved.innerHTML = '';
        
        if (!materials || materials.length === 0) {
            saved.innerHTML = '<div style="color:rgba(255,255,255,0.4); font-size:12px;">Belum ada data tersimpan</div>';
            return;
        }

        materials.forEach(m => {
            const badgeClass = m.status === 'Aktif' ? 'badge-green' : m.status === 'Draft' ? 'badge-yellow' : 'badge-blue';
            // Category mapped
            const variantsCount = m.assets ? m.assets.length : 0;
            const cat = m.categoryLabel || '-';

            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <div class="item-icon">
                    <svg style="width:16px;height:16px;color:#818CF8;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                </div>
                <div style="flex:1;">
                    <div style="font-size:13px;font-weight:600;color:#fff;">${m.name} (${m.code || '-'})</div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">
                        ${variantsCount} varian · Kategori: ${cat}
                    </div>
                </div>
                <span class="badge ${badgeClass}">${m.status || 'Aktif'}</span>
                <button class="btn-warning" onclick="editMaterial('${m.id}')" style="margin-right:8px;">Edit</button>
                <button class="btn-danger" onclick="deleteMaterial('${m.id}', this)">Hapus</button>
            `;
            saved.appendChild(row);
        });
    } catch (err) {
        saved.innerHTML = `<div style="color:#EF4444; font-size: 13px;">Gagal memuat data: ${err.message}</div>`;
    }
}

function editMaterial(id) {
    const m = window.allMaterials.find(x => x.id === id);
    if (!m) return;
    
    window.currentEditingId = id;

    // Populasikan Modal Edit
    if(document.getElementById('edit-mat-modul-name')) document.getElementById('edit-mat-modul-name').value = m.name || '';
    if(document.getElementById('edit-mat-modul-code')) document.getElementById('edit-mat-modul-code').value = m.code || '';
    if(document.getElementById('edit-mat-modul-desc')) document.getElementById('edit-mat-modul-desc').value = m.description || '';
    if(document.getElementById('edit-mat-modul-cat')) document.getElementById('edit-mat-modul-cat').value = m.categoryLabel || 'Pengencang';

    const container = document.getElementById('edit-material-cards');
    if (container) {
        container.innerHTML = '';
        mCardCount = 0;
        
        if (m.assets && m.assets.length > 0) {
            m.assets.forEach(a => {
                const card = createMaterialCard(mCardCount, true, 'edit-material-cards');
                card.dataset.assetId = a.id;
                card.dataset.oldFile = a.file;
                card.querySelector('.m-name').value = a.name;
                
                if (a.file && a.file !== '-') {
                    const dropLabel = card.querySelector('.drop-label');
                    const fileName = decodeURIComponent(a.file.split('-3d/').pop());
                    dropLabel.textContent = `Ada File: ${fileName}`;
                    dropLabel.style.color = '#818CF8';
                }
                
                container.appendChild(card);
                mCardCount++;
            });
        } else {
            addEditMaterialCard();
        }
    }

    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.add('active');
}

function closeEditModal() {
    window.currentEditingId = null;
    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.remove('active');
}

async function deleteMaterial(id, btn) {
    if (!confirm('Apakah Anda yakin ingin menghapus material ini permanen? File 3D juga akan ikut terhapus dari server.')) return;
    
    const originalText = btn.textContent;
    btn.textContent = 'Menghapus...';
    btn.disabled = true;

    try {
        await fetchBackend(`/api/materials/${id}`, { method: 'DELETE' });
        showToast('Material berhasil dihapus!');
        btn.closest('.item-row').remove();
        
        if (window.currentEditingId === id) resetMaterialForm();
    } catch (err) {
        showToast(`Gagal menghapus: ${err.message}`, 'error');
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

function createMaterialCard(index, removable, containerId = 'material-cards') {
    const card       = document.createElement('div');
    card.className   = 'upload-card';
    card.dataset.idx = index;
    card.innerHTML   = `
        <div class="upload-card-header">
            <span class="card-label" style="font-size:12px; font-weight:600; color:#818CF8;">Material #${index + 1}</span>
            ${removable
                ? `<button class="card-close-btn" onclick="removeCard(this,'${containerId}')" title="Hapus kartu ini">×</button>`
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
    const card      = createMaterialCard(mCardCount, true, 'material-cards');
    container.appendChild(card);
    mCardCount++;
}

function addEditMaterialCard() {
    const container = document.getElementById('edit-material-cards');
    const card      = createMaterialCard(mCardCount, true, 'edit-material-cards');
    container.appendChild(card);
    mCardCount++;
}

async function processMaterialSubmission(isEditing) {
    // 1. Ambil data Modul Utama
    const prefix = isEditing ? 'edit-' : '';
    const modulName  = document.getElementById(`${prefix}mat-modul-name`) ? document.getElementById(`${prefix}mat-modul-name`).value.trim() : '';
    const modulCode  = document.getElementById(`${prefix}mat-modul-code`) ? document.getElementById(`${prefix}mat-modul-code`).value.trim() : '';
    const modulDesc  = document.getElementById(`${prefix}mat-modul-desc`) ? document.getElementById(`${prefix}mat-modul-desc`).value.trim() : '';
    const catEl      = document.getElementById(`${prefix}mat-modul-cat`);
    const category   = catEl ? catEl.value : 'Lainnya';

    if (!modulName || !modulCode) {
        showToast('Nama Material & Kode wajib diisi!', 'error');
        if(document.getElementById(`${prefix}mat-modul-name`)) document.getElementById(`${prefix}mat-modul-name`).style.borderColor = modulName ? '' : '#EF4444';
        if(document.getElementById(`${prefix}mat-modul-code`)) document.getElementById(`${prefix}mat-modul-code`).style.borderColor = modulCode ? '' : '#EF4444';
        return;
    }
    if(document.getElementById(`${prefix}mat-modul-name`)) document.getElementById(`${prefix}mat-modul-name`).style.borderColor = '';
    if(document.getElementById(`${prefix}mat-modul-code`)) document.getElementById(`${prefix}mat-modul-code`).style.borderColor = '';

    // 2. Kumpulkan Varian (Asset 3D)
    let hasError = false;
    let variants = [];
    const containerId = isEditing ? 'edit-material-cards' : 'material-cards';
    const cards = document.querySelectorAll(`#${containerId} .upload-card`);
    
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

    const saveBtn = event.target || (isEditing ? document.querySelector('button[onclick="submitEditMaterial()"]') : document.querySelector('button[onclick="submitSemuaMaterial()"]'));
    const oldText = saveBtn.textContent;
    saveBtn.textContent = 'Menyimpan...';
    saveBtn.disabled = true;

    try {
        const materialBody = {
            name: modulName,
            code: modulCode,
            description: modulDesc,
            categoryLabel: category
        };
        
        if (isEditing) {
            // -- MODE EDIT --
            const finalAssets = [];
            for (let i = 0; i < variants.length; i++) {
                const variant = variants[i];
                const card = cards[i]; 
                let assetUrl = card.dataset.oldFile || '-';
                
                if (variant.file) {
                     const formData = new FormData();
                     formData.append('file', variant.file);
                     const uploadRes = await fetchBackend('/api/upload-file', { method: 'POST', body: formData });
                     assetUrl = uploadRes.publicUrl;
                }
                
                finalAssets.push({
                    id: card.dataset.assetId || generateSafeUUID(),
                    name: variant.name,
                    file: assetUrl
                });
            }
            materialBody.assets = finalAssets;

            await fetchBackend(`/api/materials/${window.currentEditingId}`, {
                method: 'PUT',
                body: JSON.stringify(materialBody)
            });
            showToast('Material beserta sinkronisasi varian berhasil diperbarui!');
        } else {
            // -- MODE CREATE --
            materialBody.id = generateSafeUUID();
            await fetchBackend('/api/materials', { 
                method: 'POST', 
                body: JSON.stringify(materialBody) 
            });
            
            for(let variant of variants) {
                let assetUrl = '';
                if(variant.file) {
                     const formData = new FormData();
                     formData.append('file', variant.file);
                     
                     const uploadRes = await fetchBackend('/api/upload-file', {
                         method: 'POST',
                         body: formData
                     });
                     assetUrl = uploadRes.publicUrl;
                }

                await fetchBackend('/api/material-assets', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: generateSafeUUID(),
                        material_id: materialBody.id,
                        name: variant.name,
                        file: assetUrl || '-'
                    })
                });
            }
            showToast('Material beserta varian berhasil disimpan!');
        }

        if (isEditing) {
            closeEditModal();
        } else {
            resetMaterialForm();
        }
        loadMaterialSaved();

    } catch(e) {
        showToast(`Gagal menyimpan: ${e.message}`, 'error');
    } finally {
        if(saveBtn) {
            saveBtn.textContent = oldText;
            saveBtn.disabled = false;
        }
    }
}

async function submitSemuaMaterial() {
    return processMaterialSubmission(false);
}

async function submitEditMaterial() {
    return processMaterialSubmission(true);
}

function resetMaterialForm() {
    window.currentEditingId = null;
    if(document.getElementById('mat-modul-name')) document.getElementById('mat-modul-name').value = '';
    if(document.getElementById('mat-modul-code')) document.getElementById('mat-modul-code').value = '';
    if(document.getElementById('mat-modul-desc')) document.getElementById('mat-modul-desc').value = '';
    if(document.getElementById('mat-modul-cat')) document.getElementById('mat-modul-cat').value = 'Pengencang';

    const container = document.getElementById('material-cards');
    if(container) container.innerHTML = '';
    mCardCount = 0;
    addMaterialCard();
    
    const saveBtn = document.querySelector('button[onclick="submitSemuaMaterial()"]');
    if (saveBtn) saveBtn.textContent = 'Simpan Semua';
}

document.addEventListener('DOMContentLoaded', () => {
    addMaterialCard();
    loadMaterialSaved();
});
