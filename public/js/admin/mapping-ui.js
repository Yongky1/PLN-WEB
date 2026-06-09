/**
 * mapping-ui.js
 * UI & API logic untuk halaman Admin Mapping.
 * Diekstrak dari views/admin/mapping.ejs (blok <script> pertama, baris 1180–1876).
 *
 * Fungsi publik (dipanggil dari luar / template HTML):
 *   window.mpOnMeshesLoaded, window.mpOnMeshClick, window.mpRefreshMeshOverview,
 *   window.mpToggleMatItem, window.mpStepQty, window.mpPrevAsset, window.mpNextAsset
 *
 * Semua fungsi internal terkapsulasi di dalam IIFE dan tidak mencemari scope global.
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════
   * Search / Filter
   * ══════════════════════════════════════════════ */

  function mpFilterMaterials(query) {
    const q = (query || '').toLowerCase().trim();
    document.querySelectorAll('.mp-col .mp-item[data-type="material"]').forEach(function (item) {
      const nameEl = item.querySelector('.mp-item-name');
      const name = nameEl ? nameEl.textContent.toLowerCase() : '';
      const subEl = item.querySelector('.mp-item-sub');
      const sub = subEl ? subEl.textContent.toLowerCase() : '';
      item.classList.toggle('mp-hidden', q !== '' && !name.includes(q) && !sub.includes(q));
    });
  }

  function mpFilterMeshes(query) {
    if (query === undefined) {
      const searchInput = document.getElementById('mp-mesh-search');
      query = searchInput ? searchInput.value : '';
    }
    const q = (query || '').toLowerCase().trim();
    const body = document.getElementById('mp-mesh-overview-body');
    if (!body) return;

    // Filter each mesh row
    body.querySelectorAll('.mp-mesh-row[data-mesh-overview]').forEach(function (row) {
      const meshName = (row.dataset.meshOverview || '').toLowerCase();

      // Sub text (connected material names)
      const subEl = row.querySelector('.mp-mesh-row-sub');
      const sub = subEl ? subEl.textContent.toLowerCase() : '';

      // Display name / rename value from input
      const displayInput = row.querySelector('.mp-display-name-input');
      const displayVal = displayInput ? (displayInput.value || '').toLowerCase() : '';
      const displayPlaceholder = displayInput ? (displayInput.placeholder || '').toLowerCase() : '';

      // Mesh name label text
      const nameEl = row.querySelector('.mp-mesh-row-name');
      const nameText = nameEl ? nameEl.textContent.toLowerCase() : '';

      const matches =
        q === '' ||
        meshName.includes(q) ||
        sub.includes(q) ||
        displayVal.includes(q) ||
        displayPlaceholder.includes(q) ||
        nameText.includes(q);

      row.classList.toggle('mp-hidden', !matches);
    });

    // Hide group labels if ALL rows under them are hidden
    body.querySelectorAll('.mp-mesh-group-label').forEach(function (label) {
      let sibling = label.nextElementSibling;
      let allHidden = true;
      while (sibling && !sibling.classList.contains('mp-mesh-group-label')) {
        if (sibling.classList.contains('mp-mesh-row') && !sibling.classList.contains('mp-hidden')) {
          allHidden = false;
          break;
        }
        sibling = sibling.nextElementSibling;
      }
      label.classList.toggle('mp-hidden', allHidden && q !== '');
    });
  }

  /* ══════════════════════════════════════════════
   * Toast helper (pakai #toast dari layout)
   * ══════════════════════════════════════════════ */

  function mpToast(message, type) {
    const el = document.getElementById('toast');
    if (!el) return;
    const styles = {
      success: {
        bg: 'rgba(34,197,94,0.13)',
        border: '1px solid rgba(34,197,94,0.28)',
        color: '#4ade80',
      },
      error: {
        bg: 'rgba(239,68,68,0.13)',
        border: '1px solid rgba(239,68,68,0.28)',
        color: '#f87171',
      },
      info: {
        bg: 'rgba(96,165,250,0.13)',
        border: '1px solid rgba(96,165,250,0.28)',
        color: '#60a5fa',
      },
    };
    const s = styles[type] || styles.info;
    Object.assign(el.style, {
      background: s.bg,
      border: s.border,
      color: s.color,
      display: 'block',
      opacity: '1',
    });
    el.textContent = message;
    clearTimeout(el._t);
    el._t = setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.display = 'none';
      }, 280);
    }, 3200);
  }

  /* ══════════════════════════════════════════════
   * Status badge
   * ══════════════════════════════════════════════ */

  function mpUpdateStatus(id, hasMeshName) {
    const badge = document.getElementById('mp-status-' + id);
    if (!badge) return;
    badge.textContent = hasMeshName ? '✓' : '✗';
    badge.className = 'mp-status-badge ' + (hasMeshName ? 'ok' : 'empty');
  }

  /* ══════════════════════════════════════════════
   * Mesh row management
   * ══════════════════════════════════════════════ */

  function mpAddMeshRow(btn) {
    const list = btn.closest('.mp-item-control').querySelector('.mp-mesh-list');
    const row = document.createElement('div');
    row.className = 'mp-mesh-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mp-mesh-input';
    input.setAttribute('list', 'mp-mesh-datalist');
    input.placeholder = 'Pilih atau ketik nama mesh...';
    input.autocomplete = 'off';
    input.spellcheck = false;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'mp-mesh-remove-btn';
    removeBtn.title = 'Hapus baris ini';
    removeBtn.textContent = '−';
    removeBtn.setAttribute('onclick', 'mpRemoveMeshRow(this)');
    row.appendChild(input);
    row.appendChild(removeBtn);
    list.appendChild(row);
  }

  function mpRemoveMeshRow(btn) {
    const list = btn.closest('.mp-mesh-list');
    const rows = list.querySelectorAll('.mp-mesh-row');
    if (rows.length <= 1) {
      const inp = btn.previousElementSibling;
      if (inp) inp.value = '';
      return;
    }
    btn.closest('.mp-mesh-row').remove();
  }

  /* ══════════════════════════════════════════════
   * Cancel item — reset to last saved state
   * ══════════════════════════════════════════════ */

  function mpCancelItem(btn) {
    const item = btn.closest('.mp-item');
    const type = item.dataset.type;

    if (type === 'material') {
      const list = item.querySelector('.mp-mesh-list');
      if (!list) return;
      let originals = [];
      try {
        originals = JSON.parse(list.dataset.originals || '[]');
      } catch (_) {}
      list.innerHTML = '';
      const toRender = originals.length > 0 ? originals : [''];
      toRender.forEach(function (meshName) {
        const row = document.createElement('div');
        row.className = 'mp-mesh-row';
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'mp-mesh-input';
        input.setAttribute('list', 'mp-mesh-datalist');
        input.value = meshName;
        input.placeholder = 'Pilih atau ketik nama mesh...';
        input.autocomplete = 'off';
        input.spellcheck = false;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'mp-mesh-remove-btn';
        removeBtn.title = 'Hapus baris ini';
        removeBtn.textContent = '−';
        removeBtn.setAttribute('onclick', 'mpRemoveMeshRow(this)');
        row.appendChild(input);
        row.appendChild(removeBtn);
        list.appendChild(row);
      });
    } else {
      const input = item.querySelector('.mp-mesh-input');
      if (input) input.value = input.dataset.original || '';
    }
  }

  /* ══════════════════════════════════════════════
   * Display Name helpers
   * ══════════════════════════════════════════════ */

  async function mpSaveDisplayName(btn) {
    const wrap = btn.closest('.mp-display-name-wrap');
    const input = wrap.querySelector('.mp-display-name-input');
    const meshName = input.dataset.meshName;
    const displayName = input.value.trim();

    btn.disabled = true;
    btn.textContent = '...';
    const cancelBtn = wrap.querySelector('.mp-display-name-actions .mp-dn-cancel-btn');
    if (cancelBtn) cancelBtn.disabled = true;

    try {
      const modId = JSON.parse(document.getElementById('mapping-module-data').textContent).id;
      const res = await fetch(`/api/modules/${modId}/mesh-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { mesh_original_name: meshName, mesh_display_name: displayName || null },
        ]),
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      mpDisplayNameMap[meshName] = displayName;
      mpSyncDatalistWithDisplayNames();
      input.dataset.original = displayName;
      mpToast('Nama tampilan berhasil disimpan', 'success');
    } catch (err) {
      mpToast('Gagal: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Simpan';
      if (cancelBtn) cancelBtn.disabled = false;
    }
  }

  function mpCancelDisplayName(btn) {
    const wrap = btn.closest('.mp-display-name-wrap');
    const input = wrap.querySelector('.mp-display-name-input');
    if (input) input.value = input.dataset.original || '';
  }

  /* ══════════════════════════════════════════════
   * Save single item
   * ══════════════════════════════════════════════ */

  async function mpSaveItem(btn) {
    const item = btn.closest('.mp-item');
    const id = item.dataset.id;
    const type = item.dataset.type;

    btn.disabled = true;
    btn.textContent = '...';

    try {
      if (type === 'material') {
        const list = item.querySelector('.mp-mesh-list');
        const meshNames = [...list.querySelectorAll('.mp-mesh-input')]
          .map((inp) => mpResolveToOriginalMeshName(inp.value.trim()))
          .filter(Boolean);
        list.querySelectorAll('.mp-mesh-input').forEach((inp) => {
          const resolved = mpResolveToOriginalMeshName(inp.value.trim());
          if (inp.value.trim() !== resolved) inp.value = resolved;
        });

        const res = await fetch(`/api/module-materials/${id}/mesh-names`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mesh_names: meshNames }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Gagal menyimpan');
        }
        list.dataset.originals = JSON.stringify(meshNames);
        mpUpdateStatus(id, meshNames.length > 0);
      } else {
        const input = item.querySelector('.mp-mesh-input');
        const meshName = mpResolveToOriginalMeshName(input ? input.value.trim() : '');
        if (input && input.value.trim() !== meshName) input.value = meshName;

        const res = await fetch(`/api/module-tools/${id}/mesh-name`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mesh_name: meshName || null }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Gagal menyimpan');
        }
        mpUpdateStatus(id, !!meshName);
        if (input) input.dataset.original = meshName;
      }

      if (typeof window.mpRefreshMeshOverview === 'function') window.mpRefreshMeshOverview();
      mpToast('mesh berhasil disimpan', 'success');
    } catch (err) {
      mpToast('Gagal: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Simpan';
    }
  }

  /* ══════════════════════════════════════════════
   * Save All
   * ══════════════════════════════════════════════ */

  function initSaveAllBtn() {
    const btn = document.getElementById('mp-save-all-btn');
    if (!btn) return;
    btn.addEventListener('click', async function () {
      const self = this;
      const items = document.querySelectorAll('.mp-item');
      if (items.length === 0) return;

      self.disabled = true;
      self.textContent = 'Menyimpan...';

      const results = await Promise.allSettled(
        [...items].map(async (item) => {
          const id = item.dataset.id;
          const type = item.dataset.type;

          if (type === 'material') {
            const list = item.querySelector('.mp-mesh-list');
            const meshNames = [...list.querySelectorAll('.mp-mesh-input')]
              .map((inp) => mpResolveToOriginalMeshName(inp.value.trim()))
              .filter(Boolean);
            list.querySelectorAll('.mp-mesh-input').forEach((inp) => {
              const resolved = mpResolveToOriginalMeshName(inp.value.trim());
              if (inp.value.trim() !== resolved) inp.value = resolved;
            });
            const res = await fetch(`/api/module-materials/${id}/mesh-names`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mesh_names: meshNames }),
            });
            if (!res.ok) {
              const d = await res.json();
              throw new Error(d.error || 'Gagal');
            }
            list.dataset.originals = JSON.stringify(meshNames);
            mpUpdateStatus(id, meshNames.length > 0);
          } else {
            const input = item.querySelector('.mp-mesh-input');
            const meshName = mpResolveToOriginalMeshName(input ? input.value.trim() : '');
            if (input && input.value.trim() !== meshName) input.value = meshName;
            const res = await fetch(`/api/module-tools/${id}/mesh-name`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mesh_name: meshName || null }),
            });
            if (!res.ok) {
              const d = await res.json();
              throw new Error(d.error || 'Gagal');
            }
            mpUpdateStatus(id, !!meshName);
            if (input) input.dataset.original = meshName;
          }
        })
      );

      const failed = results.filter((r) => r.status === 'rejected').length;

      // Save display names
      const displayInputs = [...document.querySelectorAll('.mp-display-name-input')];
      if (displayInputs.length > 0) {
        const modId = JSON.parse(document.getElementById('mapping-module-data').textContent).id;
        const configItems = displayInputs.map((input) => ({
          mesh_original_name: input.dataset.meshName,
          mesh_display_name: input.value.trim() || null,
        }));
        try {
          const cfgRes = await fetch(`/api/modules/${modId}/mesh-config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(configItems),
          });
          if (cfgRes.ok) {
            configItems.forEach((c) => {
              mpDisplayNameMap[c.mesh_original_name] = c.mesh_display_name || '';
            });
            mpSyncDatalistWithDisplayNames();
          }
        } catch (_) {}
      }

      if (failed === 0) {
        if (typeof window.mpRefreshMeshOverview === 'function') window.mpRefreshMeshOverview();
        mpToast(`Semua ${items.length} item berhasil disimpan`, 'success');
      } else {
        mpToast(`${failed} item gagal disimpan`, 'error');
      }

      self.disabled = false;
      self.textContent = 'Simpan Semua';
    });
  }

  /* ══════════════════════════════════════════════
   * Apply selected mesh to all empty inputs
   * ══════════════════════════════════════════════ */

  function initApplyBtn() {
    const btn = document.getElementById('mp-apply-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const meshName = window.mpSelectedMeshName;
      if (!meshName) return;

      const emptyInputs = [...document.querySelectorAll('.mp-mesh-input')].filter(
        (i) => !i.value.trim()
      );
      if (emptyInputs.length === 0) {
        mpToast('Tidak ada item yang kosong', 'info');
        return;
      }

      emptyInputs.forEach((input) => {
        input.value = meshName;
        const parentItem = input.closest('.mp-item');
        if (parentItem) mpUpdateStatus(parentItem.dataset.id, true);
      });
      mpToast(`"${meshName}" diisi ke ${emptyInputs.length} item kosong`, 'info');
    });
  }

  /* ══════════════════════════════════════════════
   * Add Material Modal
   * ══════════════════════════════════════════════ */

  let mpAllMaterialsData = [];
  let mpExistingMatMap = {};

  async function mpOpenAddMaterialModal() {
    const modal = document.getElementById('mp-add-mat-modal');
    modal.classList.add('active');
    document.getElementById('mp-add-mat-search').value = '';

    const moduleDataRaw = document.getElementById('mapping-module-data').textContent;
    const moduleData = moduleDataRaw ? JSON.parse(moduleDataRaw) : {};
    
    mpExistingMatMap = {};
    (moduleData.materials || []).forEach(m => {
       if (m.material && m.material.id) {
           mpExistingMatMap[m.material.id] = m.quantity || 1;
       }
    });

    if (mpAllMaterialsData.length === 0) {
      try {
        const res = await fetch('/api/materials');
        mpAllMaterialsData = await res.json();
      } catch (err) {
        document.getElementById('mp-add-mat-list').innerHTML =
          '<div style="color:#ef4444; font-size:12px; text-align:center;">Gagal memuat data</div>';
        return;
      }
    }
    mpRenderAddMatList(mpAllMaterialsData);
  }

  function mpFilterAddMatList(query) {
    const q = (query || '').toLowerCase().trim();
    const filtered = q
      ? mpAllMaterialsData.filter(
          (m) => m.name.toLowerCase().includes(q) || (m.code && m.code.toLowerCase().includes(q))
        )
      : mpAllMaterialsData;
    mpRenderAddMatList(filtered);
  }

  function mpRenderAddMatList(materials) {
    const list = document.getElementById('mp-add-mat-list');
    if (!materials || materials.length === 0) {
      list.innerHTML =
        '<div style="color:rgba(27,43,75,0.5); font-size:12px; text-align:center; padding:20px 0;">Tidak ada hasil</div>';
      return;
    }
    list.innerHTML = materials
      .map((m) => {
        const mid = m.id;
        const icon = m.icon || '📦';
        const isExisting = (mid in mpExistingMatMap);
        const qty = isExisting ? mpExistingMatMap[mid] : 1;
        
        const bg = isExisting ? 'var(--accent-soft)' : 'var(--bg-surface)';
        const bd = isExisting ? 'var(--accent)' : 'transparent';
        const badgeBg = isExisting ? 'var(--accent)' : 'var(--bg-surface-2)';
        const badgeBd = isExisting ? 'var(--accent)' : 'var(--border-default)';
        const badgeSvg = isExisting ? `<svg width="10" height="10" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24" style="display:block;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>` : '';
        const qtyDisp = isExisting ? 'flex' : 'none';
        const chk = isExisting ? 'checked' : '';

        return `<div class="mat-item" style="display:flex;align-items:center;gap:9px;padding:8px 12px;border-bottom:1px solid var(--border-subtle);background:${bg};border:1px solid ${bd};cursor:pointer;transition:all .15s;" onclick="mpToggleMatItem(this)">
          <input type="checkbox" class="mat-checkbox" data-id="${mid}" style="display:none;" ${chk}>
          <span style="font-size:16px;flex-shrink:0;line-height:1;display:flex;align-items:center;justify-content:center;">${icon}</span>
          <span style="flex:1;font-size:12px;font-weight:500;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.name}</span>
          <div class="mat-qty-wrap" style="display:${qtyDisp};align-items:center;gap:6px;flex-shrink:0;">
              <button type="button" onclick="event.stopPropagation();mpStepQty(this,-1)" style="width:20px;height:20px;border-radius:50%;background:var(--bg-surface-3);border:none;color:var(--accent-strong);font-size:14px;padding:0 0 1px 0;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:0;">-</button>
              <input type="number" class="mat-qty" value="${qty}" min="1" onclick="event.stopPropagation()" oninput="this.value=Math.max(1,parseInt(this.value)||1)" style="width:36px;height:20px;padding:0;margin:0;box-sizing:border-box;background:var(--bg-surface);border:1px solid var(--border-default);border-radius:6px;color:var(--text-primary);font-size:11px;font-weight:700;text-align:center;line-height:18px;outline:none;">
              <button type="button" onclick="event.stopPropagation();mpStepQty(this,1)" style="width:20px;height:20px;border-radius:50%;background:var(--bg-surface-3);border:none;color:var(--accent-strong);font-size:14px;padding:0 0 1px 0;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:0;">+</button>
          </div>
          <span class="mat-check-badge" style="width:18px;height:18px;border-radius:50%;background:${badgeBg};border:1px solid ${badgeBd};flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s;">${badgeSvg}</span>
      </div>`;
      })
      .join('');
  }

  /* Public: dipanggil dari onclick di template */
  window.mpToggleMatItem = function (el) {
    const cb = el.querySelector('.mat-checkbox');
    const badge = el.querySelector('.mat-check-badge');
    const nameEl = el.querySelector('span:nth-child(3)');
    const qtyWrap = el.querySelector('.mat-qty-wrap');
    cb.checked = !cb.checked;
    if (cb.checked) {
      el.style.background = 'var(--accent-soft)';
      el.style.borderColor = 'var(--accent)';
      nameEl.style.color = 'var(--text-primary)';
      badge.style.background = 'var(--accent)';
      badge.style.borderColor = 'var(--accent)';
      badge.innerHTML =
        '<svg width="10" height="10" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24" style="display:block;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';
      qtyWrap.style.display = 'flex';
    } else {
      el.style.background = 'var(--bg-surface)';
      el.style.borderColor = 'transparent';
      el.style.borderBottomColor = 'var(--border-subtle)';
      nameEl.style.color = 'var(--text-secondary)';
      badge.style.background = 'var(--bg-surface-2)';
      badge.style.borderColor = 'var(--border-default)';
      badge.innerHTML = '';
      qtyWrap.style.display = 'none';
    }
  };

  /* Public: dipanggil dari onclick di template */
  window.mpStepQty = function (btn, delta) {
    const input = btn.parentElement.querySelector('.mat-qty');
    if (!input) return;
    input.value = Math.max(1, (parseInt(input.value) || 1) + delta);
  };

  async function mpSubmitAddMaterial() {
    const selectedCbs = document.querySelectorAll('#mp-add-mat-list .mat-checkbox:checked');
    if (selectedCbs.length === 0) {
      mpToast('Pilih minimal satu material', 'error');
      return;
    }

    const btn = document.getElementById('mp-add-mat-submit');
    btn.disabled = true;
    btn.textContent = 'Menambahkan...';

    const modId = JSON.parse(document.getElementById('mapping-module-data').textContent).id;
    let successCount = 0;

    try {
      const requests = Array.from(selectedCbs).map((cb) => {
        const matId = cb.dataset.id;
        const qtyEl = cb.closest('.mat-item').querySelector('.mat-qty');
        const qty = qtyEl ? parseInt(qtyEl.value) || 1 : 1;

        return fetch('/api/module-materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ module_id: modId, material_id: matId, quantity: qty }),
        }).then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Gagal');
          }
          successCount++;
        });
      });

      await Promise.allSettled(requests);

      if (successCount > 0) {
        mpToast(`${successCount} material berhasil ditambahkan!`, 'success');
        setTimeout(() => location.reload(), 800);
      } else {
        throw new Error('Gagal menambahkan material');
      }
    } catch (err) {
      mpToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Tambahkan';
    }
  }

  /* ══════════════════════════════════════════════
   * Mesh Overview
   * ══════════════════════════════════════════════ */

  let mpMeshNames = []; // semua nama mesh dari GLB
  let mpDisplayNameMap = {}; // mesh_original_name → mesh_display_name

  /** Resolve a value that may be a display name back to the original mesh name */
  function mpResolveToOriginalMeshName(value) {
    if (!value) return value;

    const valTrim = value.trim();
    // Check if value is already an original mesh name
    if (mpMeshNames.includes(valTrim)) return valTrim;

    // Ensure we have the absolute latest display names from the right panel DOM
    const body = document.getElementById('mp-mesh-overview-body');
    if (body) {
      body.querySelectorAll('.mp-display-name-input').forEach((input) => {
        if (input.dataset.meshName) {
          mpDisplayNameMap[input.dataset.meshName] = input.value.trim();
        }
      });
    }

    // Otherwise search for a display name match (case-insensitive)
    const lowerValue = valTrim.toLowerCase();
    const entry = Object.entries(mpDisplayNameMap).find(
      ([, disp]) => (disp || '').toLowerCase() === lowerValue
    );

    return entry ? entry[0] : valTrim;
  }

  /** Add display names as datalist options so they appear as suggestions in material inputs */
  function mpSyncDatalistWithDisplayNames() {
    const datalist = document.getElementById('mp-mesh-datalist');
    if (!datalist) return;
    datalist.querySelectorAll('[data-dn]').forEach((o) => o.remove());
    Object.entries(mpDisplayNameMap).forEach(([orig, disp]) => {
      if (!disp || disp === orig) return;
      const opt = document.createElement('option');
      opt.value = disp;
      opt.dataset.dn = orig;
      datalist.appendChild(opt);
    });
  }
  /* Expose to module script (Three.js) */
  window.mpSyncDatalistWithDisplayNames = mpSyncDatalistWithDisplayNames;

  async function mpLoadMeshConfig() {
    const modId = JSON.parse(document.getElementById('mapping-module-data').textContent).id;
    try {
      const res = await fetch(`/api/modules/${modId}/mesh-config`);
      if (!res.ok) return;
      const data = await res.json();
      mpDisplayNameMap = {};
      (data || []).forEach((row) => {
        if (row.mesh_original_name)
          mpDisplayNameMap[row.mesh_original_name] = row.mesh_display_name || '';
      });
      mpSyncDatalistWithDisplayNames();
      if (mpMeshNames.length > 0) mpRenderMeshOverview();
    } catch (_) {}
  }

  /** Baca assignment saat ini dari nilai input di DOM */
  function mpBuildAssignmentMap() {
    const map = {};
    document.querySelectorAll('.mp-item[data-type="material"]').forEach((item) => {
      const name = (item.querySelector('.mp-item-name') || {}).textContent || '?';
      item.querySelectorAll('.mp-mesh-input').forEach((input) => {
        const mn = input.value.trim();
        if (!mn) return;
        if (!map[mn]) map[mn] = { materials: [] };
        map[mn].materials.push(name.trim());
      });
    });
    return map;
  }

  /** Render 2 grup mesh di panel kanan */
  function mpRenderMeshOverview() {
    const body = document.getElementById('mp-mesh-overview-body');
    const count = document.getElementById('mp-mesh-overview-count');
    const hint = document.getElementById('mp-overview-hint');
    if (!body) return;

    /* Preserve any unsaved display name values already typed in the DOM */
    body.querySelectorAll('.mp-display-name-input').forEach((input) => {
      if (input.dataset.meshName) mpDisplayNameMap[input.dataset.meshName] = input.value.trim();
    });

    if (mpMeshNames.length === 0) {
      if (hint) hint.textContent = 'Tidak ada mesh ditemukan.';
      return;
    }
    if (hint) hint.style.display = 'none';
    if (count) count.textContent = mpMeshNames.length;

    const assignMap = mpBuildAssignmentMap();
    const connected = mpMeshNames.filter((n) => assignMap[n]);
    const unconnected = mpMeshNames.filter((n) => !assignMap[n]);

    let html = '';

    if (connected.length > 0) {
      html += `<div class="mp-mesh-group-label">Sudah Terhubung (${connected.length})</div>`;
      connected.forEach((name) => {
        const conn = assignMap[name];
        const subtitle = (conn.materials || []).join(', ');
        const safe = name.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        const displayVal = (mpDisplayNameMap[name] || '')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;');
        html += `<div class="mp-mesh-row" data-mesh-overview="${safe}">
          <span class="mp-mesh-dot connected"></span>
          <div class="mp-mesh-row-info">
            <div class="mp-mesh-row-name">${safe}</div>
            <div class="mp-mesh-row-sub connected">${subtitle.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</div>
            <div class="mp-display-name-wrap">
              <span class="mp-display-name-label">Nama tampilan</span>
              <div class="mp-display-name-row">
                <input type="text" class="mp-display-name-input" data-mesh-name="${name.replace(/"/g, '&quot;')}" data-original="${displayVal}" placeholder="${safe}" value="${displayVal}" autocomplete="off" spellcheck="false" />
                <div class="mp-display-name-actions">
                  <button class="mp-dn-save-btn" onclick="mpSaveDisplayName(this)">Simpan</button>
                  <button class="mp-dn-cancel-btn" onclick="mpCancelDisplayName(this)">Batal</button>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      });
    }

    if (unconnected.length > 0) {
      html += `<div class="mp-mesh-group-label" style="${connected.length ? 'margin-top:8px;' : ''}">Belum Terhubung (${unconnected.length})</div>`;
      unconnected.forEach((name) => {
        const safe = name.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        const displayVal = (mpDisplayNameMap[name] || '')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;');
        html += `<div class="mp-mesh-row" data-mesh-overview="${safe}">
          <span class="mp-mesh-dot unconnected"></span>
          <div class="mp-mesh-row-info">
            <div class="mp-mesh-row-name">${safe}</div>
            <div class="mp-mesh-row-sub">Klik mesh di 3D untuk assign</div>
            <div class="mp-display-name-wrap">
              <span class="mp-display-name-label">Nama tampilan</span>
              <div class="mp-display-name-row">
                <input type="text" class="mp-display-name-input" data-mesh-name="${name.replace(/"/g, '&quot;')}" data-original="${displayVal}" placeholder="${safe}" value="${displayVal}" autocomplete="off" spellcheck="false" />
                <div class="mp-display-name-actions">
                  <button class="mp-dn-save-btn" onclick="mpSaveDisplayName(this)">Simpan</button>
                  <button class="mp-dn-cancel-btn" onclick="mpCancelDisplayName(this)">Batal</button>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      });
    }

    body.innerHTML = html;

    // Re-apply mesh search filter jika sedang aktif
    const meshSearchEl = document.getElementById('mp-mesh-search');
    if (meshSearchEl && meshSearchEl.value.trim()) {
      mpFilterMeshes(meshSearchEl.value);
    }
  }

  /* ══════════════════════════════════════════════
   * Public API — dipanggil dari script type="module" (Three.js)
   * ══════════════════════════════════════════════ */

  /** Dipanggil dari module script saat GLB selesai dimuat */
  window.mpOnMeshesLoaded = function (meshNames) {
    mpMeshNames = meshNames;
    mpRenderMeshOverview();
  };

  /** Dipanggil dari module script saat mesh diklik di 3D (atau dikosongkan) */
  window.mpOnMeshClick = function (meshName) {
    const body = document.getElementById('mp-mesh-overview-body');
    if (!body) return;
    body.querySelectorAll('.mp-mesh-row').forEach((r) => r.classList.remove('is-focused'));
    if (!meshName) return;
    const row = [...body.querySelectorAll('.mp-mesh-row')].find(
      (r) => r.dataset.meshOverview === meshName
    );
    if (row) {
      row.classList.add('is-focused');
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  /** Re-render overview setelah save berhasil */
  window.mpRefreshMeshOverview = function () {
    mpRenderMeshOverview();
  };

  /*
   * window.mpPrevAsset / window.mpNextAsset
   * Didefinisikan oleh script type="module" (Three.js viewer).
   * Dipanggil dari onclick di template; di sini hanya pastikan tidak undefined saat file ini dimuat lebih dulu.
   */
  if (!window.mpPrevAsset) window.mpPrevAsset = null;
  if (!window.mpNextAsset) window.mpNextAsset = null;

  /* ══════════════════════════════════════════════
   * Event Listeners — Mesh Overview Body
   * ══════════════════════════════════════════════ */

  function initMeshOverviewListeners() {
    const body = document.getElementById('mp-mesh-overview-body');
    if (!body) return;

    /* Klik mesh row → highlight di 3D viewer */
    body.addEventListener('click', function (e) {
      if (e.target.closest('.mp-display-name-wrap')) return;
      const row = e.target.closest('.mp-mesh-row');
      if (!row) return;
      if (typeof window.mpSelectMeshByName === 'function') {
        window.mpSelectMeshByName(row.dataset.meshOverview);
      }
    });

    /* Input pada display name input → perbarui filter pencarian */
    body.addEventListener('input', function (e) {
      if (e.target.classList.contains('mp-display-name-input')) {
        mpFilterMeshes();
      }
    });
  }

  /* ══════════════════════════════════════════════
   * Bootstrap — jalankan setelah DOM siap
   * ══════════════════════════════════════════════ */

  function initEventDelegation() {
    document.addEventListener('click', function (e) {
      const addMatBtn = e.target.closest('.mp-add-mat-btn');
      const addMatSubmit = e.target.closest('#mp-add-mat-submit');
      const meshRemoveBtn = e.target.closest('.mp-mesh-remove-btn');
      const meshAddBtn = e.target.closest('.mp-mesh-add-btn');
      const saveItemBtn = e.target.closest('.mp-save-item-btn');
      const cancelItemBtn = e.target.closest('.mp-cancel-item-btn');
      const dnSaveBtn = e.target.closest('.mp-dn-save-btn');
      const dnCancelBtn = e.target.closest('.mp-dn-cancel-btn');

      if (addMatBtn) {
        mpOpenAddMaterialModal();
      } else if (addMatSubmit) {
        mpSubmitAddMaterial();
      } else if (meshRemoveBtn) {
        mpRemoveMeshRow(meshRemoveBtn);
      } else if (meshAddBtn) {
        mpAddMeshRow(meshAddBtn);
      } else if (saveItemBtn) {
        mpSaveItem(saveItemBtn);
      } else if (cancelItemBtn) {
        mpCancelItem(cancelItemBtn);
      } else if (dnSaveBtn) {
        mpSaveDisplayName(dnSaveBtn);
      } else if (dnCancelBtn) {
        mpCancelDisplayName(dnCancelBtn);
      }
    });

    document.addEventListener('input', function (e) {
      if (e.target.id === 'mp-add-mat-search') {
        mpFilterAddMatList(e.target.value);
      } else if (e.target.id === 'mp-material-search') {
        mpFilterMaterials(e.target.value);
      } else if (e.target.id === 'mp-mesh-search') {
        mpFilterMeshes(e.target.value);
      }
    });
  }
  function init() {
    initEventDelegation();
    initSaveAllBtn();
    initApplyBtn();
    initMeshOverviewListeners();
    mpLoadMeshConfig();

    // Expose fungsi yang dipanggil lewat onclick="" di template
    // (diperlukan karena onclick="" mencari di scope global)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
