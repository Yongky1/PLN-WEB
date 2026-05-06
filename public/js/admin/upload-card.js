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
    let dragCounter = 0;

    zone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        zone.classList.add('dragover');
    });
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => {
        dragCounter--;
        if (dragCounter <= 0) {
            dragCounter = 0;
            zone.classList.remove('dragover');
        }
    });
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
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
        input._confirmedFile = file;
        setFileSuccess(zone, file.name);

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

function initImageDropZone(zone) {
    if (!zone) return;
    let dragCounter = 0;

    zone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        zone.classList.add('dragover');
    });
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => {
        dragCounter--;
        if (dragCounter <= 0) {
            dragCounter = 0;
            zone.classList.remove('dragover');
        }
    });
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        zone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (!file) return;
        if (!file.type.match(/^image\/(png|jpeg)$/i) && !file.name.match(/\.(png|jpg|jpeg)$/i)) {
            showToast('Format file harus PNG atau JPG', 'error');
            return;
        }
        const wrapper = zone.closest('.t-image-wrapper');
        const input = wrapper ? wrapper.querySelector('.t-image-file') : null;
        if (!input) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change'));
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
    input._confirmedFile = file;
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
    const doRemove = () => {
        btn.closest('.upload-card').remove();
        renumberCards(containerId);
        if (containerId.startsWith('edit-') && typeof window.syncAdminPreviewDropdown === 'function') {
            window.syncAdminPreviewDropdown();
        }
    };

    if (containerId.startsWith('edit-')) {
        showConfirmDialog({
            title: 'Hapus Varian Ini?',
            message: 'Varian akan dihapus dari daftar. Perubahan berlaku permanen saat kamu klik "Simpan Perubahan".',
            confirmText: 'Hapus Varian',
            iconColor: '#F59E0B',
            onConfirm: doRemove
        });
    } else {
        doRemove();
    }
}

function renumberCards(containerId) {
    let prefix = 'Item';
    if(containerId.includes('konstruksi')) prefix = 'Konstruksi';
    else if(containerId.includes('material')) prefix = 'Material';
    else if(containerId.includes('tools')) prefix = 'Peralatan';
    
    document.querySelectorAll(`#${containerId} .upload-card`).forEach((card, i) => {
        const label = card.querySelector('.card-label');
        if (label) label.textContent = `${prefix} #${i + 1}`;
    });
}
