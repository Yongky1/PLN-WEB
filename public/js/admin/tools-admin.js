/**
 * admin/tools-admin.js
 * Upload card dinamis — Manajemen Peralatan
 */

let tCardCount = 0;
window.currentEditingId = null;
window.allTools = [];
window.toolCategories = [];

async function loadToolCategories() {
  try {
    const res = await fetchBackend('/api/categories?type=tool');
    window.toolCategories = res;

    // Render dynamic dropdown items using data-attributes
    const ddItems = document.getElementById('tool-cat-dd-items');
    if (ddItems) {
      ddItems.innerHTML = res
        .map(
          (c) =>
            `<div class="rd-dropdown-item" data-cat-id="${c.id}" data-cat-name="${c.name.replace(/"/g, '&quot;')}">${c.name}</div>`
        )
        .join('');
      ddItems.querySelectorAll('.rd-dropdown-item').forEach((el) => {
        el.addEventListener('click', function () {
          setToolFilter(this.dataset.catId, this.dataset.catName);
        });
      });
    }
  } catch (err) {
    console.error('Gagal memuat kategori alat:', err);
  }
}

async function loadToolsSaved(categoryFilter = '') {
  const saved = document.getElementById('tools-saved');
  if (!saved) return;

  saved.innerHTML = getAdminSkeleton(3);
  try {
    // Fetch all once, then filter client-side by category_id
    if (!window.allTools || window.allTools.length === 0) {
      window.allTools = await fetchBackend('/api/tools?all=true');
    }
    const tools = categoryFilter
      ? window.allTools.filter((t) => (t.category_id || t.category?.id) === categoryFilter)
      : window.allTools;

    saved.innerHTML = '';

    if (!tools || tools.length === 0) {
      saved.innerHTML = `<div style="color:rgba(27,43,75,0.4); font-size:12px; text-align:center; padding: 20px 0;">${categoryFilter ? 'Tidak ada peralatan untuk kategori ini' : 'Belum ada data tersimpan'}</div>`;
      return;
    }

    tools.forEach((t) => {
      const catClass = 'badge-blue';
      const catLabel = t.category?.name || '-';
      const hasFile = !!t.file3d;

      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
                <div class="item-icon" style="background:rgba(245,158,11,0.1); width:36px; flex-shrink:0;">
                    <svg style="width:16px;height:16px;color:#F59E0B;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                </div>
                <div style="flex:1; padding-right:16px;">
                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${t.name}</div>
                    <div style="font-size:11px;color:rgba(27,43,75,0.35);margin-top:2px;">
                        ${t.description ? t.description.substring(0, 45) + '...' : '-'}
                    </div>
                </div>
                <div style="width:130px;">
                    <span style="font-size:12px; font-weight:500; color:var(--text-primary);">${catLabel}</span>
                </div>
                <div style="width:110px; text-align:center; font-size:12px; font-weight:500; color:var(--text-primary);">
                    ${t.standard || '-'}
                </div>
                <div style="width:100px; display:flex; justify-content:center;">
                    <div style="font-size:12px; font-weight:500; color:var(--text-primary);">${t.status || 'Wajib'}</div>
                </div>
                <div style="width:80px; text-align:center; font-size:12px; font-weight:500; color:${hasFile ? '#10B981' : 'rgba(255,255,255,0.4)'};">
                    ${hasFile ? 'Ada' : '-'}
                </div>
                <div style="width:130px; display:flex; gap:6px; justify-content:center;">
                    <button class="btn-warning rd-btn-sm" onclick="editTool('${t.id}')">Edit</button>
                    <button class="btn-danger rd-btn-sm" onclick="deleteTool('${t.id}', this)">Hapus</button>
                </div>
            `;
      saved.appendChild(row);
    });
  } catch (err) {
    saved.innerHTML = `<div style="color:#EF4444; font-size: 13px;">Gagal memuat data: ${err.message}</div>`;
  }
}

function editTool(id) {
  const t = window.allTools.find((x) => x.id === id);
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
    card.querySelector('.t-cat').value = t.category_id || (t.category ? t.category.id : '');
    card.querySelector('.t-status').value = t.status || 'Wajib';
    const rawToolDesc = (t.description || '').substring(0, 2000);
    card.querySelector('.t-desc').value = rawToolDesc;
    const tCounter = card.querySelector('.t-desc-counter');
    if (tCounter) tCounter.textContent = rawToolDesc.length + '/2000';

    // Preview Image
    const wrapper = card.querySelector('.t-image-wrapper');
    const imgPreviewContainer = card.querySelector('.t-image-preview-container');
    const imgPreview = card.querySelector('.t-image-preview-img');
    const imgEmpty = card.querySelector('.t-img-empty');
    const imgFilled = card.querySelector('.t-img-filled');
    const dropZone = card.querySelector('.t-image-drop-zone');
    const imgDelFlag = card.querySelector('.t-image-deleted');
    if (imgPreview) {
      if (t.image) {
        imgPreview.src = t.image;
        if (imgPreviewContainer) imgPreviewContainer.style.display = 'block';
        if (wrapper) wrapper.style.gridTemplateColumns = '1fr 1fr';
        if (imgEmpty) imgEmpty.style.display = 'none';
        if (imgFilled) imgFilled.style.display = 'flex';
        if (dropZone) dropZone.style.borderColor = 'rgba(245,158,11,0.3)';
      } else {
        imgPreview.src = '';
        if (imgPreviewContainer) imgPreviewContainer.style.display = 'none';
        if (wrapper) wrapper.style.gridTemplateColumns = '1fr';
        if (imgEmpty) imgEmpty.style.display = 'flex';
        if (imgFilled) imgFilled.style.display = 'none';
        if (dropZone) dropZone.style.borderColor = 'rgba(255,255,255,0.2)';
      }
      if (imgDelFlag) imgDelFlag.value = 'false';
    }

    if (t.file3d && t.file3d !== '-') {
      const dropLabel = card.querySelector('.file-drop-zone:not(.t-image-drop-zone) .drop-label');
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
  const assets = t.file3d && t.file3d !== '-' ? [{ file: t.file3d, name: t.name }] : [];
  refreshAdminPreviewSelector(assets);
}

// ================= LIVE PREVIEW LOGIC =================
window.syncAdminPreviewDropdown = function () {
  const selector = document.getElementById('admin-preview-selector');
  const viewer = document.getElementById('admin-preview-viewer');
  const emptyState = document.getElementById('admin-preview-empty');
  if (!selector || !viewer || !emptyState) return;

  const cards = document.querySelectorAll('#edit-tools-cards .upload-card');
  const currentValue = selector.value;
  selector.innerHTML = '<option value="">-- Pilih File untuk Preview --</option>';

  let hasValidOption = false;
  cards.forEach((card, idx) => {
    const nameEl = card.querySelector('.t-name');
    const nameText = nameEl && nameEl.value.trim() ? nameEl.value.trim() : `Peralatan ${idx + 1}`;
    const fileInput = card.querySelector('input.t-file-3d');

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
    const found =
      currentValue && Array.from(selector.options).find((o) => o.value === currentValue);
    selector.value = found
      ? currentValue
      : selector.options.length > 1
        ? selector.options[selector.options.length - 1].value
        : '';
  } else {
    selector.value = '';
  }
  window.changeAdminPreview();
};

async function deleteTool(id, btn) {
  showConfirmDialog({
    title: 'Hapus Peralatan?',
    message:
      'Tindakan ini permanen dan tidak dapat dibatalkan. File 3D (jika ada) juga akan ikut terhapus dari server.',
    confirmText: 'Ya, Hapus',
    onConfirm: async () => {
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
    },
  });
}

function createToolsCard(index, removable, containerId = 'tools-cards') {
  const card = document.createElement('div');
  card.className = 'upload-card';
  card.dataset.idx = index;
  card.style =
    'flex-shrink: 0; padding: 14px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; margin-bottom: 10px;';
  card.innerHTML = `
        <div class="upload-card-header">
            <span class="card-label" style="font-size:12px; font-weight:600; color:#F59E0B;">Peralatan #${index + 1}</span>
            ${
              removable
                ? `<button class="card-close-btn" onclick="removeCard(this,'${containerId}')" title="Hapus kartu ini">×</button>`
                : ''
            }
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
                            ${
                              window.toolCategories.length > 0
                                ? window.toolCategories
                                    .map((c) => `<option value="${c.id}">${c.name}</option>`)
                                    .join('')
                                : '<option value="">Belum ada kategori</option>'
                            }
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
                    <label class="admin-label">Deskripsi <span class="t-desc-counter" style="font-size:10px; color:rgba(27,43,75,0.3); font-weight:400;">0/2000</span></label>
                    <textarea class="admin-input t-desc" rows="2" maxlength="2000" placeholder="Jelaskan fungsi alat..." style="resize:vertical;" oninput="this.closest('.upload-card').querySelector('.t-desc-counter').textContent = this.value.length + '/2000'"></textarea>
                </div>

                <!-- Cover Gambar -->
                <div>
                    <label class="admin-label">Cover Gambar Peralatan (Opsional)</label>
                    <div class="t-image-wrapper" style="display: grid; grid-template-columns: 1fr; gap: 12px; min-height: 140px;">
                        <div class="file-drop-zone t-image-drop-zone" onclick="this.parentElement.querySelector('.t-image-file').click()" style="cursor: pointer; position: relative; overflow: hidden; padding: 20px; text-align: center; border: 1px dashed rgba(255,255,255,0.2); border-radius: 8px; background: rgba(0,0,0,0.15); transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                            <div class="t-img-empty" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
                                <svg class="drop-icon" style="width:24px;height:24px;color:rgba(27,43,75,0.25); margin-bottom: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <div class="drop-label" style="font-size: 14px; color:rgba(27,43,75,0.6);">Pilih Foto Thumbnail</div>
                                <span style="font-size:11px; color:rgba(27,43,75,0.3); margin-top:4px;">PNG, JPG, WEBP • Maks. 5MB</span>
                            </div>
                            <div class="t-img-filled" style="display:none; flex-direction:column; align-items:center; justify-content:center;">
                                <svg style="width:28px;height:28px;color:#F59E0B; margin-bottom: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <div style="font-size: 14px; color: #F59E0B; font-weight:600;">Thumbnail Terpasang</div>
                                <div style="font-size:12px; color:rgba(27,43,75,0.5); margin-top:4px;">Klik untuk ganti foto</div>
                            </div>
                        </div>

                        <input type="file" class="t-image-file" accept="image/png, image/jpeg, image/jpg" style="display:none;" onchange="previewToolImage(this)">

                        <div class="t-image-preview-container" style="display:none; position: relative; aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                            <img class="t-image-preview-img" src="" style="width: 100%; height: 100%; object-fit: cover;">
                            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0">
                                <div style="display: flex; gap: 10px;">
                                    <button type="button" onclick="this.closest('.t-image-wrapper').querySelector('.t-image-file').click()" style="background: rgba(245, 158, 11, 0.2); border: 1px solid #F59E0B; color: #F59E0B; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; font-weight:600;">Ganti Foto</button>
                                    <button type="button" onclick="clearToolImage(this)" style="background: rgba(239, 68, 68, 0.2); border: 1px solid #EF4444; color: #EF4444; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; font-weight:600;">Hapus Thumbnail</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <input type="hidden" class="t-image-deleted" value="false">
                </div>

                <div>
                    <label class="admin-label">File Model 3D (.glb / .gltf)</label>
                    <div class="file-drop-zone">
                        <input type="file" class="t-file-3d" accept=".glb,.gltf"
                               onchange="handleFileSelect(this)"
                               style="display:none;">
                        <svg class="drop-icon" style="width:22px;height:22px;color:rgba(27,43,75,0.25);"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <span class="drop-label" style="font-size:12px;color:rgba(27,43,75,0.35);">
                            Drag & drop atau klik untuk upload (Timpa file lama)
                        </span>
                        <span style="font-size:11px;color:rgba(27,43,75,0.2);">Format: .glb, .gltf (maks. 50MB)</span>
                    </div>
                </div>

                <!-- Internal 3D Preview (Only for Create Form, Edit Modal has separate large viewer) -->
                ${
                  containerId !== 'edit-tools-cards'
                    ? `
                <div class="card-model-viewer-container" style="display:none; margin-top:4px; height:200px; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); position:relative;">
                    <model-viewer class="internal-viewer" src="" 
                        style="width: 100%; height: 100%; background: radial-gradient(circle at center, #0F1E3A 0%, #030812 100%);" 
                        camera-controls auto-rotate interaction-prompt="none" shadow-intensity="1">
                    </model-viewer>
                </div>
                `
                    : ''
                }

            </div>
        </div>
    `;

  initDropZone(card.querySelector('.file-drop-zone:not(.t-image-drop-zone)'));
  initImageDropZone(card.querySelector('.t-image-drop-zone'));
  return card;
}

function addToolsCard() {
  const container = document.getElementById('tools-cards');
  container.appendChild(createToolsCard(tCardCount, tCardCount > 0, 'tools-cards'));
  tCardCount++;
}

async function processToolSubmission(isEditing) {
  const containerId = isEditing ? 'edit-tools-cards' : 'tools-cards';
  const cards = document.querySelectorAll(`#${containerId} .upload-card`);

  if (cards.length === 0) return;

  // Validate first
  let hasError = false;
  const itemsToUpload = [];

  cards.forEach((card) => {
    const nameEl = card.querySelector('.t-name');
    const name = nameEl.value.trim();
    const std = card.querySelector('.t-standard').value.trim();
    const catEl = card.querySelector('.t-cat');
    const category_id = catEl.value;
    const status = card.querySelector('.t-status').value;
    const desc = card.querySelector('.t-desc').value.trim();
    const file = card.querySelector('.t-file-3d')
      ? card.querySelector('.t-file-3d').files[0]
      : undefined;
    const imageFile = card.querySelector('.t-image-file')
      ? card.querySelector('.t-image-file').files[0]
      : null;

    if (!name) {
      hasError = true;
      nameEl.style.borderColor = '#EF4444';
    } else {
      nameEl.style.borderColor = '';
      itemsToUpload.push({ name, std, category_id, status, desc, file, imageFile, _cardRef: card });
    }
  });

  if (hasError) {
    showToast('Nama alat wajib diisi pada setiap form.', 'error');
    return;
  }

  const saveBtn =
    event.target ||
    (isEditing
      ? document.querySelector('button[onclick="submitEditTool()"]')
      : document.querySelector('button[onclick="submitSemuaTools()"]'));
  const oldText = saveBtn.textContent;
  saveBtn.textContent = 'Menyimpan...';
  saveBtn.disabled = true;

  try {
    for (let i = 0; i < itemsToUpload.length; i++) {
      const item = itemsToUpload[i];
      let assetUrl = null;
      let imgUrl = null;

      if (item.file) {
        const formData = new FormData();
        formData.append('file', item.file);

        const uploadRes = await fetchBackend('/api/upload-file', {
          method: 'POST',
          body: formData,
        });
        assetUrl = uploadRes.publicUrl;
      }

      if (item.imageFile) {
        const formData = new FormData();
        formData.append('file', item.imageFile);

        const imgRes = await fetchBackend('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        imgUrl = imgRes.publicUrl;
      }

      if (isEditing && i === 0) {
        // Mode Edit
        const toolBody = {
          name: item.name,
          standard: item.std,
          category_id: item.category_id,
          status: item.status,
          description: item.desc,
        };
        if (assetUrl) toolBody.file3d = assetUrl;
        if (imgUrl) {
          toolBody.image = imgUrl;
        } else {
          const delFlag = item._cardRef.querySelector('.t-image-deleted');
          if (delFlag && delFlag.value === 'true') {
            toolBody.image = null;
          }
        }

        await fetchBackend(`/api/tools/${window.currentEditingId}`, {
          method: 'PUT',
          body: JSON.stringify(toolBody),
        });
      } else {
        // Mode Create
        const toolBody = {
          // toolBody.id = generateSafeUUID();
          name: item.name,
          standard: item.std,
          category_id: item.category_id,
          status: item.status,
          description: item.desc,
          file3d: assetUrl || '-', // default jika kosong
        };
        if (imgUrl) toolBody.image = imgUrl;

        await fetchBackend('/api/tools', {
          method: 'POST',
          body: JSON.stringify(toolBody),
        });
      }
    }

    if (isEditing) {
      closeEditModal();
      showToast('Peralatan berhasil diperbarui!');
    } else {
      closeAddToolModal();
      resetToolsForm();
      showToast('Semua peralatan berhasil disimpan!');
    }
    window.allTools = []; // invalidate cache
    loadToolsSaved();
  } catch (e) {
    showToast(`Gagal menyimpan: ${e.message}`, 'error');
  } finally {
    if (saveBtn) {
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

document.addEventListener('DOMContentLoaded', async () => {
  await loadToolCategories();
  addToolsCard();
  loadToolsSaved();

  // Search bar — filter from cached allTools by name
  const searchInput = document.getElementById('search-saved-tools');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const q = searchInput.value.trim().toLowerCase();
        const saved = document.getElementById('tools-saved');
        if (!saved) return;
        document.querySelectorAll('#tools-saved .item-row').forEach((row) => {
          const name =
            row.querySelector('div[style*="font-size:13px"]')?.textContent?.toLowerCase() || '';
          row.style.display = !q || name.includes(q) ? '' : 'none';
        });
      }, 200);
    });
  }
});

window.previewToolImage = function (input) {
  const card = input.closest('.upload-card');
  const wrapper = card.querySelector('.t-image-wrapper');
  const previewContainer = card.querySelector('.t-image-preview-container');
  const preview = card.querySelector('.t-image-preview-img');
  const imgEmpty = card.querySelector('.t-img-empty');
  const imgFilled = card.querySelector('.t-img-filled');
  const dropZone = card.querySelector('.t-image-drop-zone');
  const delFlag = card.querySelector('.t-image-deleted');

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      if (preview) {
        preview.src = e.target.result;
      }
      if (previewContainer) {
        previewContainer.style.display = 'block';
      }
      if (wrapper) {
        wrapper.style.gridTemplateColumns = '1fr 1fr';
      }
      if (imgEmpty) {
        imgEmpty.style.display = 'none';
      }
      if (imgFilled) {
        imgFilled.style.display = 'flex';
      }
      if (dropZone) {
        dropZone.style.borderColor = 'rgba(245,158,11,0.3)';
      }
      if (delFlag) delFlag.value = 'false';
    };
    reader.readAsDataURL(input.files[0]);
  }
};

window.clearToolImage = function (btn) {
  const card = btn.closest('.upload-card');
  const wrapper = card.querySelector('.t-image-wrapper');
  const previewContainer = card.querySelector('.t-image-preview-container');
  const preview = card.querySelector('.t-image-preview-img');
  const input = card.querySelector('.t-image-file');
  const imgEmpty = card.querySelector('.t-img-empty');
  const imgFilled = card.querySelector('.t-img-filled');
  const dropZone = card.querySelector('.t-image-drop-zone');
  const delFlag = card.querySelector('.t-image-deleted');

  if (input) input.value = '';
  if (preview) preview.src = '';
  if (previewContainer) previewContainer.style.display = 'none';
  if (wrapper) wrapper.style.gridTemplateColumns = '1fr';
  if (imgEmpty) imgEmpty.style.display = 'flex';
  if (imgFilled) imgFilled.style.display = 'none';
  if (dropZone) dropZone.style.borderColor = 'rgba(255,255,255,0.2)';
  if (delFlag) delFlag.value = 'true';
};
