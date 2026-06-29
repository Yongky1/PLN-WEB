/**
 * admin/settings.js
 * Logic halaman Pengaturan.
 */
async function saveProfile() {
  const name = document.getElementById('s-name').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const unit = document.getElementById('s-unit').value.trim();

  if (!name || !email) {
    showToast('Nama dan email tidak boleh kosong.', 'error');
    return;
  }

  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, unit }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Gagal menyimpan profil');
    }

    // Update DOM (Card Profil)
    const avatarEl = document.getElementById('profile-card-avatar');
    if (avatarEl) avatarEl.innerText = name[0].toUpperCase();
    
    const nameEl = document.getElementById('profile-card-name');
    if (nameEl) nameEl.innerText = name;
    
    const unitEl = document.getElementById('profile-card-unit');
    if (unitEl) unitEl.innerText = unit;

    // Update DOM (Sidebar)
    const sbAvatar = document.querySelector('.rd-sidebar-footer .rd-avatar');
    if (sbAvatar) sbAvatar.innerText = name[0].toUpperCase();

    const sbName = document.querySelector('.rd-sidebar-footer .uname');
    if (sbName) sbName.innerText = name;

    const sbUnit = document.querySelector('.rd-sidebar-footer .urole');
    if (sbUnit) sbUnit.innerText = unit;

    showToast('Profil berhasil disimpan!', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

async function savePassword() {
  const oldPw = document.getElementById('pw-old').value;
  const newPw = document.getElementById('pw-new').value;
  const confPw = document.getElementById('pw-confirm').value;
  const errEl = document.getElementById('pw-error');

  if (!oldPw || !newPw || !confPw) {
    showToast('Semua field password harus diisi.', 'error');
    return;
  }

  if (newPw !== confPw) {
    errEl.style.display = 'block';
    return;
  }

  if (newPw.length < 8) {
    showToast('Password baru minimal 8 karakter.', 'error');
    return;
  }

  errEl.style.display = 'none';

  try {
    // Panggil proxy di frontend (sama origin) agar cookie dikirim otomatis
    const response = await fetch('/api/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Gagal mengubah password');
    }

    ['pw-old', 'pw-new', 'pw-confirm'].forEach((id) => (document.getElementById(id).value = ''));
    showToast('Password berhasil diubah!', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}
