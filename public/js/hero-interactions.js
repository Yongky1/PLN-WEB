document.addEventListener('DOMContentLoaded', () => {
  const texts = [
    'load_model("trafo_distribusi.glb")',
    'inspect_material("kabel_tm")',
    'init_simulation(3d_view)',
    'jelajahi_katalog()'
  ];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  function type() {
    const currentText = texts[textIndex];
    if (isDeleting) {
      el.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 30 : 80;

    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = 2500; // Jeda saat teks selesai diketik
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      typeSpeed = 600; // Jeda sebelum mengetik kata baru
    }

    setTimeout(type, typeSpeed);
  }
  
  // Mulai animasi
  setTimeout(type, 1200);
});
