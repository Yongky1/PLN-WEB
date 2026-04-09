/**
 * admin/settings.js
 * Logic halaman Pengaturan.
 * TODO (back end): ganti fetch dummy dengan fetch() ke API endpoint.
 */
function saveProfile() {
    const name  = document.getElementById('s-name').value.trim();
    const email = document.getElementById('s-email').value.trim();
    if (!name || !email) { showToast('Nama dan email tidak boleh kosong.', 'error'); return; }
    showToast('Profil berhasil disimpan!');
}

function savePassword() {
    const oldPw  = document.getElementById('pw-old').value;
    const newPw  = document.getElementById('pw-new').value;
    const confPw = document.getElementById('pw-confirm').value;
    const errEl  = document.getElementById('pw-error');
    if (!oldPw || !newPw || !confPw) { showToast('Semua field password harus diisi.', 'error'); return; }
    if (newPw !== confPw) { errEl.style.display = 'block'; return; }
    errEl.style.display = 'none';
    ['pw-old','pw-new','pw-confirm'].forEach(id => document.getElementById(id).value = '');
    showToast('Password berhasil diubah!');
}
