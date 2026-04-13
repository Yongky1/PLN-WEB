/**
 * admin/konstruksi.js
 * Upload card dinamis — Manajemen Konstruksi
 */

let kCardCount = 0;
window.currentEditingId = null;
window.allModules = [];

async function loadKonstruksiSaved() {
    const saved = document.getElementById('konstruksi-saved');
    if (!saved) return;
    
    saved.innerHTML = '<div style="color:white; font-size: 13px;">Memuat data...</div>';
    try {
        const modules = await fetchBackend('/api/modules?all=true');
        window.allModules = modules;
        saved.innerHTML = '';
        
        if (!modules || modules.length === 0) {
            saved.innerHTML = '<div style="color:rgba(255,255,255,0.4); font-size:12px;">Belum ada data tersimpan</div>';
            return;
        }

        modules.forEach(m => {
            const badgeClass = m.status === 'Aktif' ? 'badge-green' : m.status === 'Draft' ? 'badge-yellow' : 'badge-blue';
            const variantsCount = m.assets ? m.assets.length : 0;
            const matCount = m.materialCount || 0;
            const eqCount = m.equipmentCount || 0;

            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <div class="item-icon">
                    <svg style="width:16px;height:16px;color:#00E5FF;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                </div>
                <div style="flex:1;">
                    <div style="font-size:13px;font-weight:600;color:#fff;">${m.title}</div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">
                        ${variantsCount} varian · ${matCount} Material · ${eqCount} Peralatan
                    </div>
                </div>
                <span class="badge ${badgeClass}">${m.status || 'Aktif'}</span>
                <button class="btn-warning" onclick="editKonstruksi('${m.id}')" style="margin-right:8px;">Edit</button>
                <button class="btn-danger" onclick="deleteKonstruksi('${m.id}', this)">Hapus</button>
            `;
            saved.appendChild(row);
        });
    } catch (err) {
        saved.innerHTML = `<div style="color:#EF4444; font-size: 13px;">Gagal memuat data: ${err.message}</div>`;
    }
}

function editKonstruksi(id) {
    const m = window.allModules.find(x => x.id === id);
    if (!m) return;
    
    window.currentEditingId = id;

    // Populasikan Modal
    document.getElementById('edit-modul-name').value = m.title || '';
    document.getElementById('edit-modul-desc').value = m.description || '';
    document.getElementById('edit-modul-mat-count').value = m.materialCount || '';
    document.getElementById('edit-modul-eq-count').value = m.equipmentCount || '';
    document.getElementById('edit-modul-status').value = m.status || 'Aktif';

    const container = document.getElementById('edit-konstruksi-cards');
    if (container) {
        container.innerHTML = '';
        kCardCount = 0;
        
        if (m.assets && m.assets.length > 0) {
            m.assets.forEach(a => {
                const card = createKonstruksiCard(kCardCount, true, 'edit-konstruksi-cards');
                card.dataset.assetId = a.id;
                card.dataset.oldFile = a.file;
                card.querySelector('.k-name').value = a.name;
                
                if (a.file && a.file !== '-') {
                    const dropLabel = card.querySelector('.drop-label');
                    const fileName = decodeURIComponent(a.file.split('-3d/').pop());
                    dropLabel.textContent = `Ada File: ${fileName}`;
                    dropLabel.style.color = '#00E5FF';
                }
                
                container.appendChild(card);
                kCardCount++;
            });
        } else {
            addEditKonstruksiCard();
        }
    }

    // Tampilkan Modal
    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.add('active');
    
    // Inisialisasi Live Preview Dropdown
    refreshAdminPreviewSelector(m.assets);
}

// ================= LIVE PREVIEW LOGIC =================
function refreshAdminPreviewSelector(assets) {
    const selector = document.getElementById('admin-preview-selector');
    const viewer = document.getElementById('admin-preview-viewer');
    const emptyState = document.getElementById('admin-preview-empty');
    if(!selector || !viewer || !emptyState) return;

    // Bersihkan dropdown
    selector.innerHTML = '<option value="">-- Pilih Varian untuk Preview --</option>';

    if(assets && assets.length > 0) {
        assets.forEach((a, idx) => {
            if(a.file && a.file !== '-') {
                const opt = document.createElement('option');
                opt.value = a.file;
                opt.textContent = `Varian ${idx+1}: ${a.name}`;
                selector.appendChild(opt);
            }
        });
        
        // Auto select first file if available
        if(selector.options.length > 1) {
            selector.selectedIndex = 1;
            changeAdminPreview();
        } else {
            viewer.style.display = 'none';
            emptyState.style.display = 'flex';
        }
    } else {
        viewer.style.display = 'none';
        emptyState.style.display = 'flex';
    }
}

window.changeAdminPreview = function() {
    const selector = document.getElementById('admin-preview-selector');
    const viewer = document.getElementById('admin-preview-viewer');
    const emptyState = document.getElementById('admin-preview-empty');
    if(!selector || !viewer || !emptyState) return;
    
    if(selector.value) {
        viewer.setAttribute('src', selector.value);
        viewer.style.display = 'block';
        emptyState.style.display = 'none';
        viewer.dismissPoster && viewer.dismissPoster();
    } else {
        viewer.removeAttribute('src');
        viewer.style.display = 'none';
        emptyState.style.display = 'flex';
    }
};

window.syncAdminPreviewDropdown = function() {
    const selector = document.getElementById('admin-preview-selector');
    const viewer = document.getElementById('admin-preview-viewer');
    const emptyState = document.getElementById('admin-preview-empty');
    if(!selector || !viewer || !emptyState) return;

    const cards = document.querySelectorAll('#edit-konstruksi-cards .upload-card');
    const currentValue = selector.value;
    
    selector.innerHTML = '<option value="">-- Pilih Varian untuk Preview --</option>';
    
    let hasValidOption = false;

    cards.forEach((card, idx) => {
        const nameEl = card.querySelector('.k-name');
        const nameText = nameEl ? nameEl.value.trim() || `Varian ${idx+1}` : `Varian ${idx+1}`;
        const fileInput = card.querySelector('input[type="file"]');
        
        let fileUrl = '';
        let isLocal = false;
        
        if (fileInput && fileInput.files && fileInput.files[0]) {
            fileUrl = URL.createObjectURL(fileInput.files[0]);
            isLocal = true;
        } else if (card.dataset.oldFile && card.dataset.oldFile !== '-') {
            fileUrl = card.dataset.oldFile;
        }

        if (fileUrl) {
            const opt = document.createElement('option');
            opt.value = fileUrl;
            opt.textContent = isLocal ? `[Baru] ${nameText}` : nameText;
            selector.appendChild(opt);
            hasValidOption = true;
        }
    });

    if (hasValidOption) {
        // Jika opsi sebelumnya masih ada, pertahankan. Jika tidak, pilih yang pertama (index 1)
        let found = Array.from(selector.options).find(o => o.value === currentValue);
        selector.value = found ? currentValue : (selector.options.length > 1 ? selector.options[1].value : "");
    } else {
        selector.value = "";
    }
    
    window.changeAdminPreview();
};

window.previewLocalFile = function(file) {
    if(file && file.name.endsWith('.glb')) {
        window.syncAdminPreviewDropdown();
    }
};
// ======================================================

function closeEditModal() {
    window.currentEditingId = null;
    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.remove('active');
}

async function deleteKonstruksi(id, btn) {
    if (!confirm('Apakah Anda yakin ingin menghapus module konstruksi ini permanen? File 3D juga akan ikut terhapus dari server.')) return;
    
    // Tampilkan loading di tombol
    const originalText = btn.textContent;
    btn.textContent = 'Menghapus...';
    btn.disabled = true;

    try {
        await fetchBackend(`/api/modules/${id}`, { method: 'DELETE' });
        showToast('Module berhasil dihapus!');
        btn.closest('.item-row').remove();
        
        // Bersihkan edit state jika yg dihapus sedang di-edit
        if (window.currentEditingId === id) resetKonstruksiForm();
        
    } catch (err) {
        showToast(`Gagal menghapus: ${err.message}`, 'error');
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

function createKonstruksiCard(index, removable, containerId = 'konstruksi-cards') {
    const card       = document.createElement('div');
    card.className   = 'upload-card';
    card.dataset.idx = index;
    card.style       = 'flex-shrink: 0; padding: 14px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; margin-bottom: 10px;';
    card.innerHTML   = `
        <div class="upload-card-header">
            <span class="card-label" style="font-size:12px; font-weight:600; color:#00E5FF;">Konstruksi #${index + 1}</span>
            ${removable
                ? `<button class="card-close-btn" onclick="removeCard(this,'${containerId}')" title="Hapus kartu ini">×</button>`
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
                            Drag & drop atau klik untuk upload (Timpa file lama)
                        </span>
                        <span style="font-size:11px;color:rgba(255,255,255,0.2);">Format: .glb, .gltf (maks. 50MB)</span>
                    </div>
                </div>

            </div>
        </div>
    `;

    const zone = card.querySelector('.file-drop-zone');
    initDropZone(zone);
    
    // Binding event keyup pada input nama agar sync ke dropdown
    const nameInput = card.querySelector('.k-name');
    if (nameInput) {
        nameInput.addEventListener('keyup', () => {
            if(containerId === 'edit-konstruksi-cards') {
                if(typeof window.syncAdminPreviewDropdown === 'function') {
                    window.syncAdminPreviewDropdown();
                }
            }
        });
    }

    return card;
}

function addKonstruksiCard() {
    const container = document.getElementById('konstruksi-cards');
    const card      = createKonstruksiCard(kCardCount, true, 'konstruksi-cards');
    container.appendChild(card);
    kCardCount++;
}

function addEditKonstruksiCard() {
    const container = document.getElementById('edit-konstruksi-cards');
    const card      = createKonstruksiCard(kCardCount, true, 'edit-konstruksi-cards');
    container.appendChild(card);
    kCardCount++;
    if(typeof window.syncAdminPreviewDropdown === 'function') {
        window.syncAdminPreviewDropdown();
    }
}

async function processKonstruksiSubmission(isEditing) {
    // 1. Ambil data Modul Utama
    const prefix = isEditing ? 'edit-' : '';
    const modulName  = document.getElementById(`${prefix}modul-name`) ? document.getElementById(`${prefix}modul-name`).value.trim() : '';
    const modulDesc  = document.getElementById(`${prefix}modul-desc`) ? document.getElementById(`${prefix}modul-desc`).value.trim() : '';
    const matCount   = document.getElementById(`${prefix}modul-mat-count`) ? document.getElementById(`${prefix}modul-mat-count`).value || '0' : '0';
    const eqCount    = document.getElementById(`${prefix}modul-eq-count`) ? document.getElementById(`${prefix}modul-eq-count`).value || '0' : '0';
    const statusEl   = document.getElementById(`${prefix}modul-status`);
    const status     = statusEl ? statusEl.value : 'Aktif';

    if (!modulName) {
        showToast('Nama Modul Konstruksi wajib diisi!', 'error');
        if(document.getElementById(`${prefix}modul-name`)) document.getElementById(`${prefix}modul-name`).style.borderColor = '#EF4444';
        return;
    }
    if(document.getElementById(`${prefix}modul-name`)) document.getElementById(`${prefix}modul-name`).style.borderColor = '';

    // 2. Kumpulkan Varian (Asset 3D)
    let hasError = false;
    let variants = [];
    const containerId = isEditing ? 'edit-konstruksi-cards' : 'konstruksi-cards';
    const cards = document.querySelectorAll(`#${containerId} .upload-card`);
    
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

// Hapus penggunaan event global yang bisa error di browser tertentu
    const isEditBtn = isEditing ? document.querySelector('button[onclick="submitEditKonstruksi()"]') : document.querySelector('button[onclick="submitSemuaKonstruksi()"]');
    const saveBtn = isEditBtn;
    const oldText = saveBtn ? saveBtn.textContent : 'Simpan';
    
    if (saveBtn) {
        saveBtn.textContent = 'Menyimpan...';
        saveBtn.disabled = true;
    }

    try {
        const moduleBody = {
            title: modulName,
            description: modulDesc,
            materialCount: parseInt(matCount, 10),
            equipmentCount: parseInt(eqCount, 10),
            status: status
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
                    id: card.dataset.assetId || crypto.randomUUID(),
                    name: variant.name,
                    file: assetUrl
                });
            }
            moduleBody.assets = finalAssets;

            await fetchBackend(`/api/modules/${window.currentEditingId}`, {
                method: 'PUT',
                body: JSON.stringify(moduleBody)
            });
            showToast('Konstruksi beserta sinkronisasi varian berhasil diperbarui!');
        } else {
            // -- MODE CREATE --
            moduleBody.id = crypto.randomUUID();
            await fetchBackend('/api/modules', { 
                method: 'POST', 
                body: JSON.stringify(moduleBody) 
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

                await fetchBackend('/api/module-assets', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: crypto.randomUUID(),
                        module_id: moduleBody.id,
                        name: variant.name,
                        file: assetUrl || '-'
                    })
                });
            }
            showToast('Konstruksi beserta varian berhasil disimpan!');
        }

        if (isEditing) {
            closeEditModal();
        } else {
            resetKonstruksiForm();
        }
        loadKonstruksiSaved();

    } catch(e) {
        console.error("DEBUG ERROR SIMPAN:", e);
        // Alert berguna untuk nge-freeze browser sesaat agar user 100% bisa membaca pesan error
        alert(`Gagal menyimpan: ${e.message}\n(Lihat console/F12 untuk detail)`);
        showToast(`Gagal menyimpan: ${e.message}`, 'error');
        // Jangan pernah closeEditModal() di sini. Modal akan tetap terbuka.
    } finally {
        if(saveBtn) {
            saveBtn.textContent = oldText;
            saveBtn.disabled = false;
        }
    }
}

async function submitSemuaKonstruksi() {
    return processKonstruksiSubmission(false);
}

async function submitEditKonstruksi() {
    return processKonstruksiSubmission(true);
}

function resetKonstruksiForm() {
    window.currentEditingId = null;
    if(document.getElementById('modul-name')) document.getElementById('modul-name').value = '';
    if(document.getElementById('modul-desc')) document.getElementById('modul-desc').value = '';
    if(document.getElementById('modul-mat-count')) document.getElementById('modul-mat-count').value = '';
    if(document.getElementById('modul-eq-count')) document.getElementById('modul-eq-count').value = '';
    if(document.getElementById('modul-status')) document.getElementById('modul-status').value = 'Aktif';

    const container = document.getElementById('konstruksi-cards');
    if(container) container.innerHTML = '';
    kCardCount = 0;
    addKonstruksiCard();
    
    const saveBtn = document.querySelector('button[onclick="submitSemuaKonstruksi()"]');
    if (saveBtn) saveBtn.textContent = 'Simpan Semua';
}

document.addEventListener('DOMContentLoaded', () => {
    addKonstruksiCard();
    loadKonstruksiSaved();
});
