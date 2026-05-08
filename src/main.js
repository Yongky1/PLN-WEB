// ================================================================
// PLN PUSDIKLAT — Main JS
// GSAP ScrollTrigger + Swiper + Interactions
// ================================================================
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Swiper from 'swiper';

gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------------------
// 0. INIT
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHero();
  initMissionStats();
  initFadeUps();
  initProgramTabs();
  initEdgeTabs();
  initSwiper();
  initContactForm();
  initMobileMenu();
  initParallax();
});

// ----------------------------------------------------------------
// 1. NAVBAR  — transparent → frosted glass on scroll
// ----------------------------------------------------------------
function initNavbar() {
  const navbar = document.getElementById('navbar');
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      if (self.progress > 0) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    },
  });

  // Smooth scroll for all anchors
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // close mobile menu
        document.getElementById('mobile-menu').classList.remove('open');
      }
    });
  });
}

// ----------------------------------------------------------------
// 2. MOBILE MENU
// ----------------------------------------------------------------
function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const menu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

// ----------------------------------------------------------------
// 3. HERO — text stagger reveal + parallax on scroll
// ----------------------------------------------------------------
function initHero() {
  // Stagger hero title lines
  const lines = document.querySelectorAll('.hero-line');
  gsap.fromTo(
    lines,
    { y: '100%', opacity: 0 },
    {
      y: '0%',
      opacity: 1,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.18,
      delay: 0.3,
    }
  );

  // Hero subtitle
  gsap.fromTo(
    '#hero-subtitle',
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.9 }
  );

  // Parallax: tower moves up slower as you scroll
  gsap.to('.power-tower-wrap', {
    yPercent: -30,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
  });

  // Parallax: hero title text
  gsap.to('.hero-text', {
    yPercent: 40,
    opacity: 0.3,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });
}

// ----------------------------------------------------------------
// 4. MISSION STAT COUNTERS
// ----------------------------------------------------------------
function initMissionStats() {
  const statNums = document.querySelectorAll('.stat-number');

  statNums.forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(
          { val: 0 },
          {
            val: target,
            duration: 2.5,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.round(this.targets()[0].val).toLocaleString('id-ID');
            },
          }
        );
      },
    });
  });
}

// ----------------------------------------------------------------
// 5. FADE-UP ANIMATIONS (all .fade-up elements)
// ----------------------------------------------------------------
function initFadeUps() {
  gsap.utils.toArray('.fade-up').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });

  // Pillar items stagger
  gsap.utils.toArray('.pillar-item').forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: {
          trigger: '.pillars-section',
          start: 'top 75%',
          once: true,
        },
      }
    );
  });

  // Team cards stagger
  gsap.utils.toArray('.team-card').forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: i * 0.1,
        scrollTrigger: {
          trigger: '.team-strip',
          start: 'top 85%',
          once: true,
        },
      }
    );
  });

  // DaaS cycle SVG — stagger animate each node circle
  const cycleSvg = document.querySelector('.cycle-svg');
  if (cycleSvg) {
    const nodes = cycleSvg.querySelectorAll('circle:not([r="155"]):not([r="1.5"])');
    gsap.fromTo(
      cycleSvg,
      { opacity: 0, scale: 0.85, transformOrigin: 'center' },
      {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.daas-section',
          start: 'top 75%',
          once: true,
        },
      }
    );
    nodes.forEach((node, i) => {
      gsap.fromTo(
        node,
        {
          opacity: 0,
          scale: 0,
          transformOrigin: `${node.getAttribute('cx')}px ${node.getAttribute('cy')}px`,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.6)',
          delay: 0.3 + i * 0.12,
          scrollTrigger: {
            trigger: '.daas-section',
            start: 'top 75%',
            once: true,
          },
        }
      );
    });
  }
}

// ----------------------------------------------------------------
// 6. PARALLAX ON APPLICATIONS SECTION
// ----------------------------------------------------------------
function initParallax() {
  const appImg1 = document.getElementById('app-img-1');
  const appImg2 = document.getElementById('app-img-2');

  if (appImg1) {
    gsap.to(appImg1.querySelector('.app-img-inner'), {
      yPercent: -15,
      ease: 'none',
      scrollTrigger: {
        trigger: '.applications',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  }
  if (appImg2) {
    gsap.to(appImg2.querySelector('.app-img-inner'), {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: { trigger: '.applications', start: 'top bottom', end: 'bottom top', scrub: 2 },
    });
  }
}

// ----------------------------------------------------------------
// 7. PROGRAM TABS
// ----------------------------------------------------------------
function initProgramTabs() {
  const tabs = document.querySelectorAll('.prog-tab');
  const panels = document.querySelectorAll('.prog-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      panels.forEach((p) => {
        if (p.dataset.panel === idx) {
          gsap.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    });
  });

  // Auto-cycle on scroll through programs section
  ScrollTrigger.create({
    trigger: '.programs-section',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    onUpdate: (self) => {
      const prog = Math.floor(self.progress * 3);
      const idx = Math.min(prog, 2).toString();
      const currentActive = document.querySelector('.prog-tab.active');
      if (currentActive?.dataset.tab !== idx) {
        tabs[parseInt(idx)].click();
      }
    },
  });
}

// ----------------------------------------------------------------
// 8. EDGE TABS
// ----------------------------------------------------------------
function initEdgeTabs() {
  const eTabs = document.querySelectorAll('.edge-tab');
  const ePanels = document.querySelectorAll('.edge-panel');

  eTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = tab.dataset.etab;

      eTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      ePanels.forEach((p) => {
        if (p.dataset.epanel === idx) {
          gsap.fromTo(
            p,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
          );
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    });
  });
}

// ----------------------------------------------------------------
// 9. SWIPER
// ----------------------------------------------------------------
function initSwiper() {
  new Swiper('#sector-swiper', {
    slidesPerView: 1.2,
    spaceBetween: 16,
    centeredSlides: false,
    grabCursor: true,
    loop: false,
    pagination: {
      el: '#sector-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '#swiper-next',
      prevEl: '#swiper-prev',
    },
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      900: { slidesPerView: 3, spaceBetween: 24 },
      1200: { slidesPerView: 3.5, spaceBetween: 24 },
    },
  });
}

// ----------------------------------------------------------------
// 10. CONTACT FORM
// ----------------------------------------------------------------
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successEl = document.getElementById('form-success');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.querySelector('.btn-label').textContent = 'Mengirim...';
    btn.disabled = true;

    const data = {
      name: document.getElementById('form-name').value,
      email: document.getElementById('form-email').value,
      message: document.getElementById('form-msg').value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        form.reset();
        successEl.classList.add('visible');
        gsap.fromTo(successEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
      }
    } catch {
      btn.querySelector('.btn-label').textContent = 'Kirim Pesan';
      btn.disabled = false;
    }
  });
}

// ----------------------------------------------------------------
// 11. VIGNETTE BORDER PULSE ON SCROLL
// ----------------------------------------------------------------
ScrollTrigger.create({
  trigger: '.applications',
  start: 'top 60%',
  end: 'bottom 40%',
  onEnter: () => {
    gsap.to('.vignette-border', {
      boxShadow: 'inset 0 0 120px rgba(74, 159, 213, 0.65)',
      duration: 1.2,
      ease: 'power2.out',
    });
  },
  onLeave: () => {
    gsap.to('.vignette-border', {
      boxShadow: 'inset 0 0 80px rgba(100, 174, 220, 0.3)',
      duration: 0.8,
      ease: 'power2.out',
    });
  },
  onEnterBack: () => {
    gsap.to('.vignette-border', {
      boxShadow: 'inset 0 0 120px rgba(74, 159, 213, 0.65)',
      duration: 0.8,
      ease: 'power2.out',
    });
  },
  onLeaveBack: () => {
    gsap.to('.vignette-border', {
      boxShadow: 'inset 0 0 80px rgba(100, 174, 220, 0.3)',
      duration: 0.8,
      ease: 'power2.out',
    });
  },
});
