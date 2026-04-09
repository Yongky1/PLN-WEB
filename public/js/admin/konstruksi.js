/**
 * admin/konstruksi.js
 * Logic halaman Manajemen Konstruksi — dengan CRUD fungsional ke Backend API.
 */

/* =========================================================
   SUBMIT (CREATE)
   ========================================================= */
async function submitKonstruksi() {
    const name   = document.getElementById('k-name').value.trim();
    const desc   = document.getElementById('k-desc').value.trim();
    const count  = parseInt(document.getElementById('k-count').value || '0', 10);
    const status = document.getElementById('k-status').value;
    const fileInput = document.getElementById('k-file');
    const file = fileInput ? fileInput.files[0] : null;

    if (!name) { showToast('Nama konstruksi tidak boleh kosong.', 'error'); return; }
    if (!file) { showToast('Harap pilih file Model 3D (.glb) terlebih dahulu!', 'error'); return; }

    const btn = document.querySelector('button[onclick="submitKonstruksi()"]');
    try {
        btn.textContent = 'Mengunggah file...';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';

        // 1. Upload File GLB
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetchBackend('/api/upload-file', { method: 'POST', body: formData });
        const fileUrl = uploadRes.publicUrl;

        btn.textContent = 'Menyimpan data...';

        // 2. Buat ID unik dari nama
        const unitId = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.round(Math.random()*1000);

        // 3. Simpan Metadata Modul
        await fetchBackend('/api/modules', {
            method: 'POST',
            body: JSON.stringify({ id: unitId, title: name, description: desc, materialCount: isNaN(count) ? 0 : count, equipmentCount: 0, image: '' })
        });

        // 4. Register Asset 3D
        await fetchBackend('/api/module-assets', {
            method: 'POST',
            body: JSON.stringify({ id: unitId + '-asset', module_id: unitId, name: 'Bentuk 3D ' + name, file: fileUrl })
        });

        showToast('✅ Konstruksi berhasil disimpan ke Supabase!', 'success');
        resetForm('k');
        if (document.getElementById('k-file-text')) {
            document.getElementById('k-file-text').textContent = 'Klik untuk upload 3D (Asset Modul)';
        }
        await loadKonstruksi(); // Reload list dari database

    } catch (err) {
        console.error(err);
        showToast(err.message, 'error');
    } finally {
        if (btn) {
            btn.textContent = 'Simpan Konstruksi';
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        }
    }
}

/* =========================================================
   LOAD (READ)
   ========================================================= */
async function loadKonstruksi() {
    const listContainer = document.getElementById('konstruksi-list');
    if (!listContainer) return;

    try {
        listContainer.innerHTML = '<div style="color:rgba(255,255,255,0.5); font-size:12px; padding:10px;">⏳ Memuat data konstruksi...</div>';
        const data = await fetchBackend('/api/modules', { method: 'GET' });
        listContainer.innerHTML = '';

        if (!data || data.length === 0) {
            listContainer.innerHTML = '<div style="color:rgba(255,255,255,0.4); font-size:12px; padding:16px; text-align:center;">Belum ada data konstruksi. Tambahkan di bawah!</div>';
            return;
        }

        data.forEach(mod => renderKonstruksiItem(listContainer, mod));

    } catch (err) {
        console.error('Gagal mengambil data:', err);
        listContainer.innerHTML = '<div style="color:#EF4444; font-size:12px; padding:10px;">⚠️ Gagal memuat data dari server.</div>';
    }
}

function renderKonstruksiItem(container, mod) {
    const item = document.createElement('div');
    item.className = 'item-row';
    item.dataset.id = mod.id;
    item.dataset.title = mod.title;
    item.dataset.desc = mod.description || '';
    item.dataset.count = mod.materialCount || 0;
    item.innerHTML = `
        <div class="item-icon"><svg style="width:16px;height:16px;color:#00E5FF;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/></svg></div>
        <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;color:#fff;">${mod.title}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">${mod.materialCount || 0} komponen · Aktif</div>
        </div>
        <span class="badge badge-green">Aktif</span>
        <button class="btn-secondary" style="padding:6px 14px;font-size:11px;" onclick="openEditModal(this.closest('.item-row'))">✏️ Edit</button>
        <button class="btn-danger" onclick="deleteKonstruksi(this, '${mod.id}')">Hapus</button>
    `;
    container.appendChild(item);
}

/* =========================================================
   DELETE
   ========================================================= */
async function deleteKonstruksi(btn, id) {
    if (!confirm(`Yakin ingin menghapus konstruksi ini secara permanen dari database?`)) return;

    try {
        btn.textContent = '...';
        btn.style.pointerEvents = 'none';
        await fetchBackend(`/api/modules/${id}`, { method: 'DELETE' });
        btn.closest('.item-row').remove();
        showToast('🗑️ Konstruksi berhasil dihapus dari Supabase!', 'success');
    } catch (err) {
        console.error(err);
        showToast(err.message, 'error');
        btn.textContent = 'Hapus';
        btn.style.pointerEvents = 'auto';
    }
}

/* =========================================================
   EDIT (UPDATE) — Modal Pop-up
   ========================================================= */
function openEditModal(row) {
    const id    = row.dataset.id;
    const title = row.dataset.title;
    const desc  = row.dataset.desc;
    const count = row.dataset.count;

    // Buat modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'edit-modal-overlay';
    overlay.style.cssText = `
        position:fixed; inset:0; z-index:1000;
        background:rgba(0,0,0,0.7); backdrop-filter:blur(4px);
        display:flex; align-items:center; justify-content:center;
    `;
    overlay.innerHTML = `
        <div style="background:#071525; border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:32px; width:100%; max-width:480px; position:relative;">
            <button onclick="closeEditModal()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:rgba(255,255,255,0.5);font-size:20px;cursor:pointer;line-height:1;">×</button>
            <h3 style="font-size:15px;font-weight:700;color:#fff;margin:0 0 6px;">✏️ Edit Konstruksi</h3>
            <p style="font-size:11px;color:rgba(255,255,255,0.35);margin:0 0 24px;">ID: ${id}</p>
            <div style="display:flex;flex-direction:column;gap:14px;">
                <div>
                    <label class="admin-label">Nama Konstruksi *</label>
                    <input id="edit-k-name" type="text" class="admin-input" value="${title}">
                </div>
                <div>
                    <label class="admin-label">Deskripsi</label>
                    <textarea id="edit-k-desc" class="admin-input" rows="3" style="resize:vertical;">${desc}</textarea>
                </div>
                <div>
                    <label class="admin-label">Jumlah Komponen</label>
                    <input id="edit-k-count" type="number" class="admin-input" value="${count}" min="0">
                </div>
                <div style="display:flex;gap:10px;margin-top:8px;">
                    <button id="edit-save-btn" class="btn-primary" onclick="saveEdit('${id}', this.closest('[id]').parentElement.closest('div').parentElement)">Simpan Perubahan</button>
                    <button class="btn-secondary" onclick="closeEditModal()">Batal</button>
                </div>
                <div id="edit-error" style="color:#EF4444;font-size:12px;display:none;"></div>
            </div>
        </div>
    `;
    // Simpan ref ke row yang sedang diedit
    overlay.dataset.targetId = id;
    document.body.appendChild(overlay);
}

function closeEditModal() {
    const el = document.getElementById('edit-modal-overlay');
    if (el) el.remove();
}

async function saveEdit(id) {
    const overlay = document.getElementById('edit-modal-overlay');
    const name  = document.getElementById('edit-k-name').value.trim();
    const desc  = document.getElementById('edit-k-desc').value.trim();
    const count = parseInt(document.getElementById('edit-k-count').value || '0', 10);
    const errEl = document.getElementById('edit-error');
    const btn   = document.getElementById('edit-save-btn');

    if (!name) { errEl.textContent = 'Nama tidak boleh kosong.'; errEl.style.display = 'block'; return; }

    try {
        btn.textContent = 'Menyimpan...';
        btn.style.pointerEvents = 'none';
        errEl.style.display = 'none';

        await fetchBackend(`/api/modules/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title: name, description: desc, materialCount: isNaN(count) ? 0 : count })
        });

        showToast('✅ Konstruksi berhasil diperbarui!', 'success');
        closeEditModal();
        await loadKonstruksi(); // Reload dari database

    } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = 'block';
        btn.textContent = 'Simpan Perubahan';
        btn.style.pointerEvents = 'auto';
    }
}

/* =========================================================
   RESET FORM
   ========================================================= */
function resetForm(prefix) {
    ['name','desc','count'].forEach(f => {
        const el = document.getElementById(`${prefix}-${f}`);
        if (el) el.value = '';
    });
    const status = document.getElementById(`${prefix}-status`);
    if (status) status.selectedIndex = 0;
    const fileInput = document.getElementById(`${prefix}-file`);
    if (fileInput) fileInput.value = '';
}

// Muat data saat halaman siap
document.addEventListener('DOMContentLoaded', () => {
    loadKonstruksi();
});
