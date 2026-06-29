/**
 * admin/overview.js
 * Logic khusus halaman Overview.
 */
function initGreeting() {
  const hour = new Date().getHours();
  const el = document.getElementById('greeting-text');
  const dateEl = document.getElementById('greeting-date');
  if (!el) return;

  let text, color;
  if (hour >= 5 && hour < 11) {
    text = 'Selamat Pagi';
    color = '#FCD34D';
  } else if (hour >= 11 && hour < 15) {
    text = 'Selamat Siang';
    color = '#F59E0B';
  } else if (hour >= 15 && hour < 18) {
    text = 'Selamat Sore';
    color = '#FB923C';
  } else {
    text = 'Selamat Malam';
    color = '#818CF8';
  }

  el.textContent = text;
  el.style.color = color;

  if (dateEl) {
    const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('id-ID', opts);
  }
}
document.addEventListener('DOMContentLoaded', initGreeting);
