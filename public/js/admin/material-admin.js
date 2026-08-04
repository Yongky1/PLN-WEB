/**
 * admin/material-admin.js
 * Upload card dinamis — Manajemen Material
 */

let mCardCount = 0;
window.currentEditingId = null;
window.allMaterials = [];
window.matCategories = [];
async function loadMatCategories() {
  try {
    const res = await fetchBackend('/api/categories?type=material');
    window.matCategories = res;

    const checkboxHtml = res.length > 0
      ? res.map(c => `
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; padding: 4px 0;">
          <input type="checkbox" value="${c.id}" class="mat-cat-checkbox" style="cursor:pointer; accent-color: var(--primary);">
          <span style="font-size:13px; color:var(--text-primary);">${c.name}</span>
        </label>
      `).join('')
      : '<span style="color:var(--text-muted); font-size:13px;">Belum ada kategori</span>';
      
    const catContainer1 = document.getElementById('mat-modul-cat-container');
    const catContainer2 = document.getElementById('edit-mat-modul-cat-container');
    if (catContainer1) catContainer1.innerHTML = checkboxHtml;
    if (catContainer2) catContainer2.innerHTML = checkboxHtml.replace(/mat-cat-checkbox/g, 'edit-mat-cat-checkbox');

    // Render dynamic dropdown items using data-attributes (avoids quote escaping issues)
    const ddItems = document.getElementById('mat-cat-dd-items');
    if (ddItems) {
      ddItems.innerHTML = res
        .map(
          (c) =>
            `<div class="rd-dropdown-item" data-cat-id="${c.id}" data-cat-name="${c.name.replace(/"/g, '&quot;')}">${c.name}</div>`
        )
        .join('');
      // Attach click handlers via JS (avoids all quoting issues)
      ddItems.querySelectorAll('.rd-dropdown-item').forEach((el) => {
        el.addEventListener('click', function () {
          setMatFilter(this.dataset.catId, this.dataset.catName);
        });
      });
    }
  } catch (err) {
    console.error('Gagal memuat kategori material:', err);
  }
}

async function loadMaterialSaved(categoryFilter = '') {
  const saved = document.getElementById('material-saved');
  if (!saved) return;

  saved.innerHTML = getAdminSkeleton(3);
  try {
    // Always fetch all data; filter client-side by category_id
    if (!window.allMaterials || window.allMaterials.length === 0) {
      window.allMaterials = await fetchBackend('/api/materials?all=true');
    }
    const materials = categoryFilter
      ? window.allMaterials.filter((m) => {
          if (m.categories && m.categories.length > 0) {
             return m.categories.some(c => c.id === categoryFilter);
          }
          return false;
        })
      : window.allMaterials;

    saved.innerHTML = '';

    if (!materials || materials.length === 0) {
      saved.innerHTML =
        '<div style="color:rgba(27,43,75,0.4); font-size:12px; text-align:center; padding:20px 0;">Belum ada data tersimpan</div>';
      return;
    }

    materials.forEach((m) => {
      const variantsCount = m.assets ? m.assets.length : 0;
      const cat = (m.categories && m.categories.length > 0) ? m.categories.map(c => c.name).join(', ') : '-';

      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
                <div class="item-icon" style="width:36px; flex-shrink:0;">
                    <svg style="width:16px;height:16px;color:#818CF8;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                </div>
                <div style="flex:1; padding-right:16px;">
                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${m.name}</div>
                    <div style="font-size:11px;color:rgba(27,43,75,0.4);margin-top:2px;font-family:monospace;">
                        ${m.code || '-'}
                    </div>
                </div>
                <div style="width:140px;">
                    <span style="font-size:12px; font-weight:500; color:var(--text-primary);">${cat}</span>
                </div>
                <div style="width:100px; text-align:center; font-size:13px; font-weight:600; color:var(--text-primary);">
                    ${variantsCount}
                </div>
                <div style="width:130px; display:flex; gap:6px; justify-content:center;">
                    <button class="btn-soft-edit" onclick="editMaterial('${m.id}')">Edit</button>
                    <button class="btn-soft-delete" onclick="deleteMaterial('${m.id}', this)">Hapus</button>
                </div>
            `;
      saved.appendChild(row);
    });
  } catch (err) {
    saved.innerHTML = `<div style="color:#EF4444; font-size: 13px;">Gagal memuat data: ${err.message}</div>`;
  }
}

async function editMaterial(id) {
  window.currentEditingId = id;

  let m;
  try {
    m = await fetchBackend(`/api/materials/${id}`);
  } catch (e) {
    showToast('Gagal memuat data material', 'error');
    window.currentEditingId = null;
    return;
  }
  if (!m) return;

  // Populasikan Modal Edit
  if (document.getElementById('edit-mat-modul-name'))
    document.getElementById('edit-mat-modul-name').value = m.name || '';
  if (document.getElementById('edit-mat-modul-code'))
    document.getElementById('edit-mat-modul-code').value = m.code || '';
  if (document.getElementById('edit-mat-modul-desc')) {
    const desc = m.description || '';
    document.getElementById('edit-mat-modul-desc').value = desc;
    const counter = document.getElementById('desc-char-count');
    if (counter) counter.textContent = desc.length + '/2000';
  }
  
  const catContainer = document.getElementById('edit-mat-modul-cat-container');
  if (catContainer) {
    const checkboxes = catContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    if (m.categories && m.categories.length > 0) {
      const selectedIds = m.categories.map(c => c.id);
      checkboxes.forEach(cb => {
        if (selectedIds.includes(cb.value)) cb.checked = true;
      });
    }
  }

  const imgPreviewContainer = document.getElementById('edit-mat-modul-image-preview-container');
  const imgPreview = document.getElementById('edit-mat-modul-image-preview');
  const emptyState = document.getElementById('edit-mat-img-empty');
  const filledState = document.getElementById('edit-mat-img-filled');
  const dropZone = document.getElementById('edit-mat-modul-image-drop-zone');
  const imgWrapper = document.getElementById('edit-mat-modul-image-wrapper');
  const delFlag = document.getElementById('edit-mat-modul-image-deleted');
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

  const container = document.getElementById('edit-material-cards');
  if (container) {
    container.innerHTML = '';
    mCardCount = 0;

    if (m.assets && m.assets.length > 0) {
      m.assets.forEach((a) => {
        const card = createMaterialCard(mCardCount, true, 'edit-material-cards');
        card.dataset.assetId = a.id;
        card.dataset.oldFile = a.file;
        card.querySelector('.m-name').value = a.name;

        if (a.file && a.file !== '-') {
          const dropLabel = card.querySelector('.drop-label');
          const fileName = decodeURIComponent(a.file.split('-3d/').pop());
          dropLabel.textContent = `Ada File: ${fileName}`;
          dropLabel.style.color = '#2563eb';

          const viewerContainer = card.querySelector('.card-model-viewer-container');
          const internalViewer = card.querySelector('.internal-viewer');
          if (viewerContainer && internalViewer) {
            internalViewer.src = a.file;
            viewerContainer.style.display = 'block';
            if (internalViewer.dismissPoster) internalViewer.dismissPoster();
          }
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

  // Inisialisasi Live Preview Dropdown
  refreshAdminPreviewSelector(m.assets);
}

// ================= LIVE PREVIEW LOGIC =================
window.syncAdminPreviewDropdown = function () {
  const selector = document.getElementById('admin-preview-selector');
  const viewer = document.getElementById('admin-preview-viewer');
  const emptyState = document.getElementById('admin-preview-empty');
  if (!selector || !viewer || !emptyState) return;

  const cards = document.querySelectorAll('#edit-material-cards .upload-card');
  const currentValue = selector.value;

  selector.innerHTML = '<option value="">-- Pilih Varian untuk Preview --</option>';

  let hasValidOption = false;

  cards.forEach((card, idx) => {
    const nameEl = card.querySelector('.m-name');
    const nameText = nameEl && nameEl.value.trim() ? nameEl.value.trim() : `Varian ${idx + 1}`;
    const fileInput = card.querySelector('input[type="file"]');

    let fileUrl = '';
    let isLocal = false;

    const localFile =
      fileInput && (fileInput._confirmedFile || (fileInput.files && fileInput.files[0]));
    if (localFile) {
      fileUrl = URL.createObjectURL(localFile);
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
    // Jika opsi sebelumnya masih ada, pertahankan. Jika tidak, pilih yang pertama/terakhir
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

async function deleteMaterial(id, btn) {
  showConfirmDialog({
    title: 'Hapus Material?',
    message:
      'Tindakan ini permanen dan tidak dapat dibatalkan. File 3D terkait juga akan ikut terhapus dari server.',
    confirmText: 'Ya, Hapus',
    onConfirm: async () => {
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
    },
  });
}

function createMaterialCard(index, removable, containerId = 'material-cards') {
  const card = document.createElement('div');
  card.className = 'upload-card';
  card.dataset.idx = index;
  card.style =
    'flex-shrink: 0; padding: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 10px;';
  card.innerHTML = `
        <div class="upload-card-header">
            <span class="card-label" style="font-size:12px; font-weight:600; color:#2563eb;">Material #${index + 1}</span>
            ${
              removable
                ? `<button class="card-close-btn" onclick="removeCard(this,'${containerId}')" title="Hapus kartu ini">×</button>`
                : ''
            }
        </div>
        <div class="upload-card-body">
            <div style="display:flex; flex-direction:column; gap:12px;">

                <div>
                    <label class="admin-label" style="color: #1b2b4b; font-weight: 600;">Nama Varian Material (Asset) *</label>
                    <input type="text" class="admin-input m-name" placeholder="Contoh: Baut HDG Ukuran M16" style="background: #ffffff; color: #1b2b4b; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; width: 100%; box-sizing: border-box; outline: none;">
                </div>

                <div>
                    <label class="admin-label" style="color: #1b2b4b; font-weight: 600;">File Media (.glb / .gltf / .png / .jpg / .webp)</label>
                    <div class="file-drop-zone" style="background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 8px;">
                        <input type="file" class="m-file-3d" accept=".glb,.gltf,.png,.jpg,.jpeg,.webp"
                               onchange="handleFileSelect(this)"
                               style="display:none;">
                        <svg class="drop-icon" style="width:22px;height:22px;color:rgba(27,43,75,0.6);"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <span class="drop-label" style="font-size:12px;color:rgba(27,43,75,0.7);">
                            Drag & drop atau klik untuk upload
                        </span>
                        <span style="font-size:11px;color:rgba(27,43,75,0.5);">Format: .glb, .gltf, .png, .jpg, .webp (maks. 100MB)</span>
                    </div>
                </div>

                <!-- Internal 3D Preview (Only for Create Form, Edit Modal has separate large viewer) -->
                ${
                  containerId !== 'edit-material-cards'
                    ? `
                <div class="card-model-viewer-container" style="display:none; margin-top:4px; height:200px; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); position:relative;">
                    <model-viewer class="internal-viewer" src="" orientation="-90deg 0 0" 
                        style="width: 100%; height: 100%; background: #ffffff;" 
                        camera-controls auto-rotate interaction-prompt="none" shadow-intensity="1">
                    </model-viewer>
                </div>
                `
                    : ''
                }

            </div>
        </div>
    `;

  const zone = card.querySelector('.file-drop-zone');
  initDropZone(zone);

  return card;
}

function addMaterialCard() {
  const container = document.getElementById('material-cards');
  const card = createMaterialCard(mCardCount, true, 'material-cards');
  container.appendChild(card);
  mCardCount++;
}

function addEditMaterialCard() {
  const container = document.getElementById('edit-material-cards');
  const card = createMaterialCard(mCardCount, true, 'edit-material-cards');
  container.appendChild(card);
  mCardCount++;
}

async function processMaterialSubmission(isEditing) {
  // 1. Ambil data Modul Utama
  const prefix = isEditing ? 'edit-' : '';
  const modulName = document.getElementById(`${prefix}mat-modul-name`)
    ? document.getElementById(`${prefix}mat-modul-name`).value.trim()
    : '';
  const modulCode = document.getElementById(`${prefix}mat-modul-code`)
    ? document.getElementById(`${prefix}mat-modul-code`).value.trim()
    : '';
  const modulDesc = document.getElementById(`${prefix}mat-modul-desc`)
    ? document.getElementById(`${prefix}mat-modul-desc`).value.trim()
    : '';
  
  const catContainer = document.getElementById(`${prefix}mat-modul-cat-container`);
  const selectedCategories = [];
  if (catContainer) {
    const checked = catContainer.querySelectorAll('input[type="checkbox"]:checked');
    checked.forEach(cb => selectedCategories.push(cb.value));
  }

  const imageInput = document.getElementById(`${prefix}mat-modul-image`);
  const imageFile = imageInput && imageInput.files ? imageInput.files[0] : null;

  if (!modulName || !modulCode) {
    showToast('Nama Material & Kode wajib diisi!', 'error');
    if (document.getElementById(`${prefix}mat-modul-name`))
      document.getElementById(`${prefix}mat-modul-name`).style.borderColor = modulName
        ? ''
        : '#EF4444';
    if (document.getElementById(`${prefix}mat-modul-code`))
      document.getElementById(`${prefix}mat-modul-code`).style.borderColor = modulCode
        ? ''
        : '#EF4444';
    return;
  }
  if (document.getElementById(`${prefix}mat-modul-name`))
    document.getElementById(`${prefix}mat-modul-name`).style.borderColor = '';
  if (document.getElementById(`${prefix}mat-modul-code`))
    document.getElementById(`${prefix}mat-modul-code`).style.borderColor = '';

  // 2. Kumpulkan Varian (Asset 3D)
  let hasError = false;
  const variants = [];
  const containerId = isEditing ? 'edit-material-cards' : 'material-cards';
  const cards = document.querySelectorAll(`#${containerId} .upload-card`);

  if (cards.length === 0) {
    showToast('Harus ada minimal 1 varian.', 'error');
    return;
  }

  cards.forEach((card) => {
    const nameEl = card.querySelector('.m-name');
    const name = nameEl ? nameEl.value.trim() : '';
    const fileInput = card.querySelector('.m-file-3d');
    const file = fileInput ? fileInput._confirmedFile || fileInput.files[0] : null;

    if (!name) {
      hasError = true;
      if (nameEl) nameEl.style.borderColor = '#EF4444';
    } else {
      if (nameEl) nameEl.style.borderColor = '';
      variants.push({ name, file });
    }
  });

  if (hasError) {
    showToast('Semua nama varian harus diisi!', 'error');
    return;
  }

  const saveBtn = isEditing
    ? document.querySelector('button[onclick="submitEditMaterial()"]')
    : document.getElementById('add-m-next-btn');
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

    const materialBody = {
      name: modulName,
      code: modulCode,
      description: modulDesc,
      categories: selectedCategories,
    };

    if (uploadedImageUrl) {
      materialBody.image = uploadedImageUrl;
    } else if (isEditing) {
      const delFlag = document.getElementById('edit-mat-modul-image-deleted');
      if (delFlag && delFlag.value === 'true') {
        materialBody.image = null;
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
          const uploadRes = await fetchBackend('/api/upload-file', {
            method: 'POST',
            body: formData,
          });
          assetUrl = uploadRes.publicUrl;
        }

        const assetEntry = { name: variant.name, file: assetUrl };
        if (card.dataset.assetId) assetEntry.id = card.dataset.assetId;
        finalAssets.push(assetEntry);
      }
      materialBody.assets = finalAssets;

      await fetchBackend(`/api/materials/${window.currentEditingId}`, {
        method: 'PUT',
        body: JSON.stringify(materialBody),
      });
      showToast('Material beserta sinkronisasi varian berhasil diperbarui!');
    } else {
      // -- MODE CREATE --
      const createRes = await fetchBackend('/api/materials', {
        method: 'POST',
        body: JSON.stringify(materialBody),
      });
      const newMaterialId = createRes.data.id;

      for (const variant of variants) {
        let assetUrl = '';
        if (variant.file) {
          const formData = new FormData();
          formData.append('file', variant.file);

          const uploadRes = await fetchBackend('/api/upload-file', {
            method: 'POST',
            body: formData,
          });
          assetUrl = uploadRes.publicUrl;
        }

        await fetchBackend('/api/material-assets', {
          method: 'POST',
          body: JSON.stringify({
            material_id: newMaterialId,
            name: variant.name,
            file: assetUrl || '-',
          }),
        });
      }
      showToast('Material beserta varian berhasil disimpan!');
    }

    if (isEditing) {
      closeEditModal();
    } else {
      closeAddMatModal();
    }
    window.allMaterials = []; // invalidate cache
    await loadMaterialSaved();
  } catch (e) {
    showToast(`Gagal menyimpan: ${e.message}`, 'error');
  } finally {
    if (saveBtn) {
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
  if (document.getElementById('mat-modul-name'))
    document.getElementById('mat-modul-name').value = '';
  if (document.getElementById('mat-modul-code'))
    document.getElementById('mat-modul-code').value = '';
  if (document.getElementById('mat-modul-desc'))
    document.getElementById('mat-modul-desc').value = '';
    
  const catContainer = document.getElementById('mat-modul-cat-container');
  if (catContainer) {
    const checkboxes = catContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
  }

  const imgInput = document.getElementById('mat-modul-image');
  if (imgInput) {
    imgInput.value = '';
    const previewImg = document.getElementById('mat-modul-image-preview-img');
    if (previewImg) previewImg.src = '';
    const previewContainer = document.getElementById('mat-modul-image-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';
    const emptyState = document.getElementById('mat-add-img-empty');
    if (emptyState) emptyState.style.display = '';
    const filledState = document.getElementById('mat-add-img-filled');
    if (filledState) filledState.style.display = 'none';
    const dropZone = document.getElementById('mat-modul-image-drop-zone');
    if (dropZone) {
      dropZone.classList.remove('has-file');
      dropZone.style.borderColor = '';
    }
  }

  const container = document.getElementById('material-cards');
  if (container) container.innerHTML = '';
  mCardCount = 0;
  addMaterialCard();

  const saveBtn = document.querySelector('button[onclick="submitSemuaMaterial()"]');
  if (saveBtn) saveBtn.textContent = 'Simpan Semua';
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadMatCategories();
  addMaterialCard();
  loadMaterialSaved();

  // Search bar — filter rendered rows by name/code
  const searchInput = document.getElementById('search-saved-material');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const q = searchInput.value.trim().toLowerCase();
        const saved = document.getElementById('material-saved');
        if (!saved) return;
        saved.querySelectorAll('.item-row').forEach((row) => {
          const name =
            row.querySelector('div[style*="font-size:13px"]')?.textContent?.toLowerCase() || '';
          row.style.display = !q || name.includes(q) ? '' : 'none';
        });
      }, 200);
    });
  }
});
