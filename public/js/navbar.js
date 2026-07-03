document.addEventListener("DOMContentLoaded", () => {
  // ── Elements ──
  const wrap       = document.getElementById('jl-nav-wrap');
  const navbar     = document.getElementById('jl-navbar');
  const toggle     = document.getElementById('jl-menu-toggle');
  const overlay    = document.getElementById('jl-overlay');
  const progressBar= document.getElementById('jl-nav-progress');
  const linkPill   = document.getElementById('jl-link-pill');
  const navLinks   = document.querySelectorAll('.jl-nav-link');

  let menuOpen = false;
  let lastScrollY = window.scrollY;
  let ticking = false;

  // ── SLIDING PILL on nav links ──
  function movePill(target) {
    if (!linkPill || !target) return;
    const rect = target.getBoundingClientRect();
    const parentRect = target.parentElement.getBoundingClientRect();
    linkPill.style.width = rect.width + 'px';
    linkPill.style.left = (rect.left - parentRect.left) + 'px';
    linkPill.style.opacity = '1';
  }

  function resetPill() {
    const activeLink = document.querySelector('.jl-nav-link.is-active');
    if (activeLink) {
      movePill(activeLink);
    } else if (linkPill) {
      linkPill.style.opacity = '0';
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => movePill(link));
    link.addEventListener('mouseleave', resetPill);
  });

  // Initialize pill on active link after layout
  requestAnimationFrame(() => {
    setTimeout(resetPill, 350); // Wait for entry animation
  });

  // ── MAGNETIC EFFECT (desktop only) ──
  if (window.matchMedia('(pointer: fine)').matches) {
    const magneticEls = document.querySelectorAll('[data-magnetic]');
    magneticEls.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const strength = 0.12;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => { el.style.transition = ''; }, 600);
      });
    });
  }

  // ── MENU TOGGLE ──
  function openMenu() {
    menuOpen = true;
    toggle.classList.add('is-active');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    wrap.style.zIndex = '110';
  }

  function closeMenu() {
    menuOpen = false;
    toggle.classList.remove('is-active');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      wrap.style.zIndex = '100';
    }, 800);
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menuOpen) closeMenu(); else openMenu();
  });

  // Close overlay on nav link click
  document.querySelectorAll('.jl-overlay-link, .jl-overlay-cta').forEach(l => {
    l.addEventListener('click', () => {
      if (menuOpen) closeMenu();
    });
  });

  // Close on click outside content (on overlay background)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('jl-overlay-bg-layer')) {
      closeMenu();
    }
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  // ── SCROLL BEHAVIOR ──
  function handleScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Progress bar
    if (progressBar && docHeight > 0) {
      const progress = Math.min((scrollY / docHeight) * 100, 100);
      progressBar.style.width = progress + '%';
    }

    // Scrolled state
    if (scrollY > 50) {
      wrap.classList.add('is-scrolled');
      navbar.style.background = 'rgba(255, 255, 255, 0.88)';
      navbar.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)';
    } else {
      wrap.classList.remove('is-scrolled');
      navbar.style.background = 'rgba(255, 255, 255, 0.72)';
      navbar.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.05), 0 12px 48px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)';
    }

    // Auto-hide
    if (!menuOpen) {
      if (scrollY <= 80) {
        wrap.classList.remove('is-hidden');
      } else if (scrollY > lastScrollY && scrollY > 300) {
        wrap.classList.add('is-hidden');
      } else if (scrollY < lastScrollY) {
        wrap.classList.remove('is-hidden');
      }
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });

  // Recalculate pill on resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resetPill, 100);
  });

  // Initial
  handleScroll();
});