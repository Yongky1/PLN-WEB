/**
 * admin/upload-card.js
 * Shared logic untuk upload card dinamis.
 * Dipakai oleh konstruksi.js, material-admin.js, tools-admin.js
 *
 * Fitur:
 * - Drag & drop file
 * - Klik untuk browse
 * - Preview nama file setelah dipilih
 * - Validasi format .glb / .gltf
 */

/**
 * Aktifkan drag & drop pada semua .file-drop-zone di dalam container.
 * Dipanggil setiap kali card baru dibuat.
 */
function initDropZone(zone) {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (!file) return;
        if (!file.name.match(/\.(glb|gltf)$/i)) {
            showToast('Format file harus .glb atau .gltf', 'error');
            return;
        }
        const input    = zone.querySelector('input[type=file]');
        const dt       = new DataTransfer();
        dt.items.add(file);
        input.files    = dt.files;
        setFileSuccess(zone, file.name);

        // Jika fungsi preview tersedia (untuk edit konstruksi), panggil
        if (typeof window.previewLocalFile === 'function') {
            window.previewLocalFile(file);
        }
    });

    // Handle click pada drop zone untuk trigger file input
    zone.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
            const input = zone.querySelector('input[type=file]');
            if (input) input.click();
        }
    });
}

/**
 * Dipanggil saat user memilih file via browser
 */
function handleFileSelect(input) {
    const zone = input.closest('.file-drop-zone');
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (!file.name.match(/\.(glb|gltf)$/i)) {
        showToast('Format file harus .glb atau .gltf', 'error');
        input.value = '';
        return;
    }
    setFileSuccess(zone, file.name);

    // Jika fungsi preview tersedia, panggil
    if (typeof window.previewLocalFile === 'function') {
        window.previewLocalFile(file);
    }
}

function setFileSuccess(zone, fileName) {
    zone.classList.add('has-file');
    zone.classList.remove('dragover');
    zone.querySelector('.drop-icon').style.color = '#00C864';
    const label = zone.querySelector('.drop-label');
    label.textContent      = '✓ ' + fileName;
    label.style.color      = '#00C864';
    label.style.fontWeight = '600';
    
    // Auto-preview inside card (for inline previews)
    const card = zone.closest('.upload-card');
    if (card) {
        const viewerContainer = card.querySelector('.card-model-viewer-container');
        const internalViewer = card.querySelector('.internal-viewer');
        const input = zone.querySelector('input[type=file]');
        if (viewerContainer && internalViewer && input && input.files && input.files[0]) {
            const file = input.files[0];
            if (file.name.match(/\.(glb|gltf)$/i)) {
                // Free old URL if exists
                if (internalViewer._objectUrl) {
                    URL.revokeObjectURL(internalViewer._objectUrl);
                }
                const url = URL.createObjectURL(file);
                internalViewer._objectUrl = url;
                internalViewer.src = url;
                viewerContainer.style.display = 'block';
                if (internalViewer.dismissPoster) internalViewer.dismissPoster();
            }
        }
    }
}

/**
 * Hapus card dan renumber sisanya
 */
function removeCard(btn, containerId) {
    btn.closest('.upload-card').remove();
    renumberCards(containerId);
    
    // Sinkronisasikan dropdown jika card dihapus saat di Edit Modal
    if(containerId === 'edit-konstruksi-cards' && typeof window.syncAdminPreviewDropdown === 'function') {
        window.syncAdminPreviewDropdown();
    }
}

function renumberCards(containerId) {
    const prefixMap = {
        'konstruksi-cards': 'Konstruksi',
        'material-cards':   'Material',
        'tools-cards':      'Peralatan',
    };
    const prefix = prefixMap[containerId] || 'Item';
    document.querySelectorAll(`#${containerId} .upload-card`).forEach((card, i) => {
        const label = card.querySelector('.card-label');
        if (label) label.textContent = `${prefix} #${i + 1}`;
    });
}
