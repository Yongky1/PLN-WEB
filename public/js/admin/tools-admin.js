/**
 * admin/tools-admin.js
 * Upload card dinamis — Manajemen Peralatan
 */

let tCardCount = 0;
window.currentEditingId = null;
window.allTools = [];

async function loadToolsSaved() {
    const saved = document.getElementById('tools-saved');
    if (!saved) return;
    
    saved.innerHTML = '<div style="color:white; font-size: 13px;">Memuat data...</div>';
    try {
        const tools = await fetchBackend('/api/tools?all=true');
        window.allTools = tools;
        saved.innerHTML = '';
        
        if (!tools || tools.length === 0) {
            saved.innerHTML = '<div style="color:rgba(255,255,255,0.4); font-size:12px;">Belum ada data tersimpan</div>';
            return;
        }

        tools.forEach(t => {
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
        card.querySelector('.t-desc').value = t.description || '';
        
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
}

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
                    <label class="admin-label">Deskripsi</label>
                    <textarea class="admin-input t-desc" rows="2" placeholder="Jelaskan fungsi alat..." style="resize:vertical;"></textarea>
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
                     id: crypto.randomUUID(),
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
});
