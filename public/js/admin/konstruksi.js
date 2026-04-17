/**
 * admin/konstruksi.js
 * Upload card dinamis — Manajemen Konstruksi
 */

let kCardCount = 0;
window.currentEditingId = null;
window.allModules = [];
window._allMaterialsGlobal = [];
window._allToolsGlobal = [];

// ================================================================
// Fungsi Render Checklist Material & Tools di Panel Pilih
// ================================================================
async function loadAndRenderMaterialToolLists() {
    try {
        const [mats, tools] = await Promise.all([
            fetchBackend('/api/materials'),
            fetchBackend('/api/tools')
        ]);
        window._allMaterialsGlobal = mats || [];
        window._allToolsGlobal    = tools || [];
        renderMaterialList('modul-materials-list', mats, [], false);
        renderToolList('modul-tools-list', tools, [], false);
    } catch(e) {
        console.error('Gagal memuat material/tools:', e);
    }
}

// Global Filter State
let globalSearchQuery = '';
let moduleSearchQuery = '';

function renderMaterialList(containerId, allMaterials, selected, isEdit, filter = '') {
    const el = document.getElementById(containerId);
    if (!el) return;
    
    // Filter logic
    const filtered = filter 
        ? allMaterials.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()))
        : allMaterials;

    if (!filtered || filtered.length === 0) {
        el.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:6px;">
            <span style="font-size:22px;">📦</span>
            <span style="font-size:11px;color:rgba(255,255,255,0.3);text-align:center;">${filter ? 'Tidak ada hasil' : 'Belum ada material<br>tersedia'}</span>
        </div>`;
        return;
    }
    const selectedMap = {};
    if (selected && selected.length) {
        selected.forEach(s => { selectedMap[s.material_id || (s.material && s.material.id)] = s.quantity || 1; });
    }
    el.innerHTML = filtered.map(m => {
        const mid = m.id;
        const qty = selectedMap[mid] || 1;
        const isChecked = selectedMap[mid] !== undefined;
        const icon = m.icon || '📦';
        const activeStyle = isChecked
            ? 'background:rgba(129,140,248,0.12);border-color:rgba(129,140,248,0.35);'
            : 'background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.07);';
        return `<div class="mat-item" style="display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:10px;border:1px solid;${activeStyle}cursor:pointer;transition:all .15s;" onclick="toggleMatItem(this,'${mid}')">
            <input type="checkbox" class="mat-checkbox" data-id="${mid}" ${isChecked ? 'checked' : ''} style="display:none;">
            <span style="font-size:16px;flex-shrink:0;line-height:1;display:flex;align-items:center;justify-content:center;">${icon}</span>
            <span style="flex:1;font-size:11.5px;font-weight:500;color:rgba(255,255,255,${isChecked ? '0.9' : '0.55'});white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.name || mid}</span>
            <div class="mat-qty-wrap" style="display:${isChecked ? 'flex' : 'none'};align-items:center;gap:6px;flex-shrink:0;">
                <button type="button" onclick="event.stopPropagation();stepQty(this,-1,'${mid}')" style="width:20px;height:20px;border-radius:50%;background:rgba(129,140,248,0.2);border:none;color:#818CF8;font-size:14px;padding:0 0 1px 0;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:0;">-</button>
                <input type="number" class="mat-qty" data-id="${mid}" value="${qty}" min="1" onclick="event.stopPropagation()" oninput="this.value=Math.max(1,parseInt(this.value)||1)" style="width:36px;height:20px;padding:0;margin:0;box-sizing:border-box;background:rgba(0,0,0,0.3);border:1px solid rgba(129,140,248,0.3);border-radius:6px;color:#818CF8;font-size:11px;font-weight:700;text-align:center;line-height:18px;outline:none;">
                <button type="button" onclick="event.stopPropagation();stepQty(this,1,'${mid}')" style="width:20px;height:20px;border-radius:50%;background:rgba(129,140,248,0.2);border:none;color:#818CF8;font-size:14px;padding:0 0 1px 0;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:0;">+</button>
            </div>
            <span class="mat-check-badge" style="width:18px;height:18px;border-radius:50%;background:${isChecked ? '#818CF8' : 'rgba(255,255,255,0.08)'};border:1.5px solid ${isChecked ? '#818CF8' : 'rgba(255,255,255,0.15)'};flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s;">
                ${isChecked ? '<svg width="10" height="10" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24" style="display:block;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
            </span>
        </div>`;
    }).join('');
}

window.toggleMatItem = function(el, mid) {
    const cb = el.querySelector('.mat-checkbox');
    const badge = el.querySelector('.mat-check-badge');
    const nameEl = el.querySelector('span:nth-child(3)');
    const qtyWrap = el.querySelector('.mat-qty-wrap');
    cb.checked = !cb.checked;
    if (cb.checked) {
        el.style.background = 'rgba(129,140,248,0.12)';
        el.style.borderColor = 'rgba(129,140,248,0.35)';
        if(nameEl) nameEl.style.color = 'rgba(255,255,255,0.9)';
        badge.style.background = '#818CF8';
        badge.style.borderColor = '#818CF8';
        badge.innerHTML = '<svg width="10" height="10" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';
        if(qtyWrap) qtyWrap.style.display = 'flex';
    } else {
        el.style.background = 'rgba(255,255,255,0.03)';
        el.style.borderColor = 'rgba(255,255,255,0.07)';
        if(nameEl) nameEl.style.color = 'rgba(255,255,255,0.55)';
        badge.style.background = 'rgba(255,255,255,0.08)';
        badge.style.borderColor = 'rgba(255,255,255,0.15)';
        badge.innerHTML = '';
        if(qtyWrap) qtyWrap.style.display = 'none';
    }
};

window.stepQty = function(btn, delta, mid) {
    const input = btn.parentElement.querySelector('.mat-qty[data-id="'+mid+'"]');
    if (!input) return;
    input.value = Math.max(1, (parseInt(input.value) || 1) + delta);
};

function renderToolList(containerId, allTools, selected, isEdit, filter = '') {
    const el = document.getElementById(containerId);
    if (!el) return;

    // Filter logic
    const filtered = filter 
        ? allTools.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()))
        : allTools;

    if (!filtered || filtered.length === 0) {
        el.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:6px;">
            <span style="font-size:22px;">🔧</span>
            <span style="font-size:11px;color:rgba(255,255,255,0.3);text-align:center;">${filter ? 'Tidak ada hasil' : 'Belum ada peralatan<br>tersedia'}</span>
        </div>`;
        return;
    }
    const selectedIds = new Set();
    if (selected && selected.length) {
        selected.forEach(s => selectedIds.add(s.tool_id || (s.tool && s.tool.id)));
    }
    el.innerHTML = filtered.map(t => {
        const tid = t.id;
        const isChecked = selectedIds.has(tid);
        const icon = t.icon || '🔧';
        const activeStyle = isChecked
            ? 'background:rgba(245,158,11,0.1);border-color:rgba(245,158,11,0.35);'
            : 'background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.07);';
        return `<div class="tool-item" style="display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:10px;border:1px solid;${activeStyle}cursor:pointer;transition:all .15s;" onclick="toggleToolItem(this,'${tid}')">
            <input type="checkbox" class="tool-checkbox" data-id="${tid}" ${isChecked ? 'checked' : ''} style="display:none;">
            <span style="font-size:16px;flex-shrink:0;line-height:1;display:flex;align-items:center;justify-content:center;">${icon}</span>
            <span style="flex:1;font-size:11.5px;font-weight:500;color:rgba(255,255,255,${isChecked ? '0.9' : '0.55'});white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.name || tid}</span>
            <span class="tool-check-badge" style="width:18px;height:18px;border-radius:50%;background:${isChecked ? '#F59E0B' : 'rgba(255,255,255,0.08)'};border:1.5px solid ${isChecked ? '#F59E0B' : 'rgba(255,255,255,0.15)'};flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s;">
                ${isChecked ? '<svg width="10" height="10" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24" style="display:block;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
            </span>
        </div>`;
    }).join('');
}

window.toggleToolItem = function(el, tid) {
    const cb = el.querySelector('.tool-checkbox');
    const badge = el.querySelector('.tool-check-badge');
    const nameEl = el.querySelector('span:nth-child(3)');
    cb.checked = !cb.checked;
    if (cb.checked) {
        el.style.background = 'rgba(245,158,11,0.1)';
        el.style.borderColor = 'rgba(245,158,11,0.35)';
        if(nameEl) nameEl.style.color = 'rgba(255,255,255,0.9)';
        badge.style.background = '#F59E0B';
        badge.style.borderColor = '#F59E0B';
        badge.innerHTML = '<svg width="10" height="10" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';
    } else {
        el.style.background = 'rgba(255,255,255,0.03)';
        el.style.borderColor = 'rgba(255,255,255,0.07)';
        if(nameEl) nameEl.style.color = 'rgba(255,255,255,0.55)';
        badge.style.background = 'rgba(255,255,255,0.08)';
        badge.style.borderColor = 'rgba(255,255,255,0.15)';
        badge.innerHTML = '';
    }
};

function collectSelectedMaterials(listId) {
    const result = [];
    document.querySelectorAll(`#${listId} .mat-checkbox:checked`).forEach(cb => {
        const mid = cb.dataset.id;
        const qtyEl = document.querySelector(`#${listId} .mat-qty[data-id="${mid}"]`);
        result.push({ material_id: mid, quantity: qtyEl ? parseInt(qtyEl.value) || 1 : 1 });
    });
    return result;
}

function collectSelectedTools(listId) {
    const result = [];
    document.querySelectorAll(`#${listId} .tool-checkbox:checked`).forEach(cb => {
        result.push({ tool_id: cb.dataset.id });
    });
    return result;
}

function generateSafeUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function loadKonstruksiSaved(filter = '') {
    const saved = document.getElementById('konstruksi-saved');
    if (!saved) return;
    
    saved.innerHTML = getAdminSkeleton(3);
    try {
        if (!window.allModules || window.allModules.length === 0 || filter === '') {
            const modules = await fetchBackend('/api/modules?all=true');
            window.allModules = modules;
        }

        const filtered = filter 
            ? window.allModules.filter(m => m.title.toLowerCase().includes(filter.toLowerCase()))
            : window.allModules;

        saved.innerHTML = '';
        
        if (!filtered || filtered.length === 0) {
            saved.innerHTML = `<div style="color:rgba(255,255,255,0.4); font-size:12px; text-align:center; padding: 20px 0;">
                ${filter ? 'Tidak ada konstruksi ditemukan' : 'Belum ada data tersimpan'}
            </div>`;
            return;
        }

        filtered.forEach(m => {
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
    document.getElementById('edit-modul-status').value = m.status || 'Aktif';
    // Render checklist dengan preselected based on current relasi
    renderMaterialList('edit-modul-materials-list', window._allMaterialsGlobal, m.materials || [], true);
    renderToolList('edit-modul-tools-list', window._allToolsGlobal, m.tools || [], true);

    // Preview Image Modal
    const imgPreviewContainer = document.getElementById('edit-modul-image-preview-container');
    const imgPreview = document.getElementById('edit-modul-image-preview');
    const emptyState = document.getElementById('edit-img-empty');
    const filledState = document.getElementById('edit-img-filled');
    const dropZone = document.getElementById('edit-modul-image-drop-zone');
    const imgWrapper = document.getElementById('edit-modul-image-wrapper');
    const delFlag = document.getElementById('edit-modul-image-deleted');
    if (delFlag) delFlag.value = 'false';
    
    if (imgPreview && imgPreviewContainer) {
        if (m.image) {
            imgPreview.src = m.image;
            imgPreviewContainer.style.display = 'block';
            if (imgWrapper) imgWrapper.style.gridTemplateColumns = '1fr 1fr';
            if (emptyState) emptyState.style.display = 'none';
            if (filledState) filledState.style.display = 'flex';
            if (dropZone) dropZone.style.borderColor = 'rgba(0,229,255,0.3)';
        } else {
            imgPreview.src = '';
            imgPreviewContainer.style.display = 'none';
            if (imgWrapper) imgWrapper.style.gridTemplateColumns = '1fr';
            if (emptyState) emptyState.style.display = 'flex';
            if (filledState) filledState.style.display = 'none';
            if (dropZone) dropZone.style.borderColor = 'rgba(255,255,255,0.2)';
        }
    }

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
                    
                    // Populate inline model viewer
                    const viewerContainer = card.querySelector('.card-model-viewer-container');
                    const internalViewer = card.querySelector('.internal-viewer');
                    if (viewerContainer && internalViewer) {
                        internalViewer.src = a.file;
                        viewerContainer.style.display = 'block';
                        // Fix for some browsers needing manual dismiss
                        if (internalViewer.dismissPoster) internalViewer.dismissPoster();
                    }
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
                        <input type="file" class="k-file-3d" accept=".glb,.gltf"
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
                ${containerId !== 'edit-konstruksi-cards' ? `
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
    const statusEl   = document.getElementById(`${prefix}modul-status`);
    const status     = statusEl ? statusEl.value : 'Aktif';
    const imageInput = document.getElementById(`${prefix}modul-image`);
    const imageFile  = imageInput && imageInput.files ? imageInput.files[0] : null;

    // Kumpulkan Material & Tools yang dipilih via checkbox
    const matListId  = isEditing ? 'edit-modul-materials-list' : 'modul-materials-list';
    const toolListId = isEditing ? 'edit-modul-tools-list' : 'modul-tools-list';
    const selectedMaterials = collectSelectedMaterials(matListId);
    const selectedTools     = collectSelectedTools(toolListId);

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
        const fileInput = card.querySelector('.k-file-3d');
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
        let uploadedImageUrl = null;
        if (imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);
            const imgRes = await fetchBackend('/api/upload-image', { method: 'POST', body: formData });
            uploadedImageUrl = imgRes.publicUrl;
        }

        const moduleBody = {
            title: modulName,
            description: modulDesc,
            materialCount: selectedMaterials.length,
            equipmentCount: selectedTools.length,
            status: status,
            materials: selectedMaterials,
            tools: selectedTools
        };

        if (uploadedImageUrl) {
            moduleBody.image = uploadedImageUrl;
        } else if (isEditing) {
            const delFlag = document.getElementById('edit-modul-image-deleted');
            if (delFlag && delFlag.value === 'true') {
                moduleBody.image = null;
            }
        }

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
            moduleBody.assets = finalAssets;

            await fetchBackend(`/api/modules/${window.currentEditingId}`, {
                method: 'PUT',
                body: JSON.stringify(moduleBody)
            });
            showToast('Konstruksi beserta sinkronisasi varian berhasil diperbarui!');
        } else {
            // -- MODE CREATE --
            moduleBody.id = generateSafeUUID();
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
                        id: generateSafeUUID(),
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
    loadAndRenderMaterialToolLists();

    // Search Material Selection
    const searchMat = document.getElementById('search-select-material');
    if (searchMat) {
        searchMat.addEventListener('input', (e) => {
            renderMaterialList('modul-materials-list', window._allMaterialsGlobal, [], false, e.target.value);
        });
    }

    // Search Tool Selection
    const searchTool = document.getElementById('search-select-tools');
    if (searchTool) {
        searchTool.addEventListener('input', (e) => {
            renderToolList('modul-tools-list', window._allToolsGlobal, [], false, e.target.value);
        });
    }

    // Search Saved Data
    const searchSaved = document.getElementById('search-saved-konstruksi');
    if (searchSaved) {
        searchSaved.addEventListener('input', (e) => {
            loadKonstruksiSaved(e.target.value);
        });
    }
});
