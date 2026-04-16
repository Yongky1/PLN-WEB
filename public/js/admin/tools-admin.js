/**
 * admin/tools-admin.js
 * Upload card dinamis — Manajemen Peralatan
 */

let tCardCount = 0;
window.currentEditingId = null;
window.allTools = [];

function generateSafeUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function loadToolsSaved(filter = '') {
    const saved = document.getElementById('tools-saved');
    if (!saved) return;
    
    saved.innerHTML = getAdminSkeleton(3);
    try {
        if (!window.allTools || window.allTools.length === 0 || filter === '') {
            const tools = await fetchBackend('/api/tools?all=true');
            window.allTools = tools;
        }

        const filtered = filter
            ? window.allTools.filter(t =>
                t.name.toLowerCase().includes(filter.toLowerCase()) ||
                (t.standard && t.standard.toLowerCase().includes(filter.toLowerCase()))
              )
            : window.allTools;

        saved.innerHTML = '';
        
        if (!filtered || filtered.length === 0) {
            saved.innerHTML = `<div style="color:rgba(255,255,255,0.4); font-size:12px; text-align:center; padding: 20px 0;">${filter ? 'Tidak ada peralatan ditemukan' : 'Belum ada data tersimpan'}</div>`;
            return;
        }

        filtered.forEach(t => {
            const catClass = t.category === 'k3' ? 'badge-red' : t.category === 'teknis' ? 'badge-blue' : 'badge-yellow';
            const catLabel = t.categoryLabel || t.category || '-';
            const hasFile = !!t.file3d;

            const row = document.createElement('div');
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
                    <div style="font-size:13px;font-weight:600;color:#fff;">${t.name}</div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">
                        ${catLabel}${t.standard ? ' · ' + t.standard : ''} · ${hasFile ? 'Ada file 3D' : 'Tanpa file 3D'} · ${t.status || 'Wajib'}
                    </div>
                </div>
                <span class="badge ${catClass}">${catLabel}</span>
                <button class="btn-warning" onclick="editTool('${t.id}')" style="margin-right:8px;">Edit</button>
                <button class="btn-danger" onclick="deleteTool('${t.id}', this)">Hapus</button>
            `;
            saved.appendChild(row);
        });
    } catch (err) {
        saved.innerHTML = `<div style="color:#EF4444; font-size: 13px;">Gagal memuat data: ${err.message}</div>`;
    }
}

function editTool(id) {
    const t = window.allTools.find(x => x.id === id);
    if (!t) return;
    
    window.currentEditingId = id;

    const container = document.getElementById('edit-tools-cards');
    if (container) {
        container.innerHTML = '';
        tCardCount = 0;
        
        // Modal Edit Tools tidak butuh multiple card, cukup 1 edit card karena satu Peralatan adalah 1 row mandiri
        const card = createToolsCard(tCardCount, false, 'edit-tools-cards');
        card.dataset.oldFile = t.file3d;
        
        card.querySelector('.t-name').value = t.name;
        card.querySelector('.t-standard').value = t.standard || '';
        card.querySelector('.t-cat').value = t.category || 'teknis';
        card.querySelector('.t-status').value = t.status || 'Wajib';
        const rawToolDesc = (t.description || '').substring(0, 200);
        card.querySelector('.t-desc').value = rawToolDesc;
        const tCounter = card.querySelector('.t-desc-counter');
        if (tCounter) tCounter.textContent = rawToolDesc.length + '/200';
        
        if (t.file3d && t.file3d !== '-') {
            const dropLabel = card.querySelector('.drop-label');
            const fn = decodeURIComponent(t.file3d.split('-3d/').pop());
            dropLabel.textContent = `Ada File: ${fn}`;
            dropLabel.style.color = '#F59E0B';
        }
        
        container.appendChild(card);
        tCardCount++;
    }

    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.add('active');

    // Inisialisasi Live Preview
    const assets = (t.file3d && t.file3d !== '-') ? [{ file: t.file3d, name: t.name }] : [];
    refreshAdminPreviewSelector(assets);
}

// ================= LIVE PREVIEW LOGIC =================
function refreshAdminPreviewSelector(assets) {
    const selector = document.getElementById('admin-preview-selector');
    const viewer = document.getElementById('admin-preview-viewer');
    const emptyState = document.getElementById('admin-preview-empty');
    if(!selector || !viewer || !emptyState) return;

    selector.innerHTML = '<option value="">-- Pilih File untuk Preview --</option>';

    if(assets && assets.length > 0) {
        assets.forEach((a, idx) => {
            if(a.file && a.file !== '-') {
                const opt = document.createElement('option');
                opt.value = a.file;
                opt.textContent = a.name || `File ${idx+1}`;
                selector.appendChild(opt);
            }
        });
        
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

    const cards = document.querySelectorAll('#edit-tools-cards .upload-card');
    const currentValue = selector.value;
    selector.innerHTML = '<option value="">-- Pilih File untuk Preview --</option>';
    
    let hasValidOption = false;
    cards.forEach((card, idx) => {
        const nameEl = card.querySelector('.t-name');
        const nameText = nameEl && nameEl.value.trim() ? nameEl.value.trim() : `Peralatan ${idx+1}`;
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
        let found = Array.from(selector.options).find(o => o.value === currentValue);
        selector.value = found ? currentValue : (selector.options.length > 1 ? selector.options[selector.options.length - 1].value : "");
    } else {
        selector.value = "";
    }
    window.changeAdminPreview();
};

window.previewLocalFile = function(file) {
    if(file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
        window.syncAdminPreviewDropdown();
    }
};

function closeEditModal() {
    window.currentEditingId = null;
    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.remove('active');
}

async function deleteTool(id, btn) {
    if (!confirm('Apakah Anda yakin ingin menghapus peralatan ini permanen? File 3D (jika ada) juga akan ikut terhapus dari server.')) return;
    
    const originalText = btn.textContent;
    btn.textContent = 'Menghapus...';
    btn.disabled = true;

    try {
        await fetchBackend(`/api/tools/${id}`, { method: 'DELETE' });
        showToast('Peralatan berhasil dihapus!');
        btn.closest('.item-row').remove();
        
        if (window.currentEditingId === id) resetToolsForm();
    } catch (err) {
        showToast(`Gagal menghapus: ${err.message}`, 'error');
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

function createToolsCard(index, removable, containerId = 'tools-cards') {
    const card       = document.createElement('div');
    card.className   = 'upload-card';
    card.dataset.idx = index;
    card.style       = 'flex-shrink: 0; padding: 14px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; margin-bottom: 10px;';
    card.innerHTML   = `
        <div class="upload-card-header">
            <span class="card-label" style="font-size:12px; font-weight:600; color:#F59E0B;">Peralatan #${index + 1}</span>
            ${removable
                ? `<button class="card-close-btn" onclick="removeCard(this,'${containerId}')" title="Hapus kartu ini">×</button>`
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
                    <label class="admin-label">Deskripsi <span class="t-desc-counter" style="font-size:10px; color:rgba(255,255,255,0.3); font-weight:400;">0/200</span></label>
                    <textarea class="admin-input t-desc" rows="2" maxlength="200" placeholder="Jelaskan fungsi alat..." style="resize:vertical;" oninput="this.closest('.upload-card').querySelector('.t-desc-counter').textContent = this.value.length + '/200'"></textarea>
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

                <!-- Internal 3D Preview (Only for Create Form, Edit Modal has separate large viewer) -->
                ${containerId !== 'edit-tools-cards' ? `
                <div class="card-model-viewer-container" style="display:none; margin-top:4px; height:200px; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); position:relative;">
                    <model-viewer class="internal-viewer" src="" 
                        style="width: 100%; height: 100%; background: radial-gradient(circle at center, #0F1E3A 0%, #030812 100%);" 
                        camera-controls auto-rotate interaction-prompt="none" shadow-intensity="1">
                    </model-viewer>
                </div>
                ` : ''}

            </div>
        </div>
    `;

    initDropZone(card.querySelector('.file-drop-zone'));
    return card;
}

function addToolsCard() {
    const container = document.getElementById('tools-cards');
    container.appendChild(createToolsCard(tCardCount, tCardCount > 0, 'tools-cards'));
    tCardCount++;
}

async function processToolSubmission(isEditing) {
    const containerId = isEditing ? 'edit-tools-cards' : 'tools-cards';
    const cards  = document.querySelectorAll(`#${containerId} .upload-card`);
    
    if (cards.length === 0) return;

    // Validate first
    let hasError = false;
    const itemsToUpload = [];

    cards.forEach(card => {
        const nameEl  = card.querySelector('.t-name');
        const name    = nameEl.value.trim();
        const std     = card.querySelector('.t-standard').value.trim();
        const catEl   = card.querySelector('.t-cat');
        const catVal  = catEl.value;
        const catTxt  = catEl.options[catEl.selectedIndex].text;
        const status  = card.querySelector('.t-status').value;
        const desc    = card.querySelector('.t-desc').value.trim();
        const file    = card.querySelector('input[type=file]').files[0];

        if (!name) {
            hasError = true;
            nameEl.style.borderColor = '#EF4444';
        } else {
            nameEl.style.borderColor = '';
            itemsToUpload.push({ name, std, catVal, catTxt, status, desc, file, _cardRef: card });
        }
    });

    if (hasError) { 
        showToast('Nama alat wajib diisi pada setiap form.', 'error'); 
        return; 
    }

    const saveBtn = event.target || (isEditing ? document.querySelector('button[onclick="submitEditTool()"]') : document.querySelector('button[onclick="submitSemuaTools()"]'));
    const oldText = saveBtn.textContent;
    saveBtn.textContent = 'Menyimpan...';
    saveBtn.disabled = true;

    try {

        for (let i = 0; i < itemsToUpload.length; i++) {
            const item = itemsToUpload[i];
            let assetUrl = null;

            if (item.file) {
                 const formData = new FormData();
                 formData.append('file', item.file);
                 
                 const uploadRes = await fetchBackend('/api/upload-file', {
                     method: 'POST',
                     body: formData
                 });
                 assetUrl = uploadRes.publicUrl;
            }

            if (isEditing && i === 0) {
                 // Mode Edit (Hanya card pertama yang meng-update data lama, card sisanya dibuat baru)
                 const toolBody = {
                     name: item.name,
                     standard: item.std,
                     category: item.catVal,
                     categoryLabel: item.catTxt,
                     status: item.status,
                     description: item.desc
                 };
                 // Jika ada upload gambar baru, sertakan file barunya. Jika tidak, backend tidak akan merubah data file yang lama.
                 if (assetUrl) toolBody.file3d = assetUrl;

                 await fetchBackend(`/api/tools/${window.currentEditingId}`, {
                     method: 'PUT',
                     body: JSON.stringify(toolBody)
                 });

            } else {
                 // Mode Create
                 const toolBody = {
                     id: generateSafeUUID(),
                     name: item.name,
                     standard: item.std,
                     category: item.catVal,
                     categoryLabel: item.catTxt,
                     status: item.status,
                     description: item.desc,
                     file3d: assetUrl || '-' // default jika kosong
                 };
                 await fetchBackend('/api/tools', {
                     method: 'POST',
                     body: JSON.stringify(toolBody)
                 });
            }
        }

        if (isEditing) {
            closeEditModal();
            showToast('Peralatan berhasil diperbarui!');
        } else {
            resetToolsForm();
            showToast('Semua peralatan berhasil disimpan!');
        }
        loadToolsSaved();

    } catch (e) {
        showToast(`Gagal menyimpan: ${e.message}`, 'error');
    } finally {
        if(saveBtn) {
            saveBtn.textContent = oldText;
            saveBtn.disabled = false;
        }
    }
}

async function submitSemuaTools() {
    return processToolSubmission(false);
}

async function submitEditTool() {
    return processToolSubmission(true);
}

function resetToolsForm() {
    window.currentEditingId = null;
    document.getElementById('tools-cards').innerHTML = '';
    tCardCount = 0;
    addToolsCard();
    
    const saveBtn = document.querySelector('button[onclick="submitSemuaTools()"]');
    if (saveBtn) saveBtn.textContent = 'Simpan Semua';
}

document.addEventListener('DOMContentLoaded', () => {
    addToolsCard();
    loadToolsSaved();

    // Search bar untuk Data Tersimpan
    const searchInput = document.getElementById('search-saved-tools');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadToolsSaved(searchInput.value.trim());
            }, 300);
        });
    }
});
