// public/js/scroll.js

document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // GSAP + ScrollTrigger Registration
  // ============================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // GSAP Reveal: All elements with .gsap-reveal
    gsap.utils.toArray('.gsap-reveal').forEach((el, i) => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        y: 0,
        duration: 1,
        delay: i * 0.05,
        ease: 'power3.out',
      });
    });

    // Stats Counter Reveal
    gsap.utils.toArray('.stat-item').forEach((el, i) => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
          onEnter: () => {
            // Trigger counter animation
            const counter = el.querySelector('.counter');
            if (counter && !counter.dataset.counted) {
              animateCounter(counter);
              counter.dataset.counted = 'true';
            }
          },
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.15,
        ease: 'power3.out',
      });
    });
  }

  // ============================================
  // HERO SPLIT-TEXT ANIMATION
  // ============================================
  const splitInners = document.querySelectorAll('.split-inner');
  const heroBadge = document.getElementById('hero-badge');
  const heroDesc = document.getElementById('hero-desc');
  const heroCta = document.getElementById('hero-cta');

  // Stagger each word appearance
  splitInners.forEach((el, i) => {
    setTimeout(
      () => {
        el.classList.add('active');
      },
      400 + i * 120
    );
  });

  // Fade in badge, description, CTA
  setTimeout(() => {
    if (heroBadge) {
      heroBadge.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      heroBadge.style.opacity = '1';
      heroBadge.style.transform = 'translateY(0)';
    }
  }, 200);

  setTimeout(() => {
    if (heroDesc) {
      heroDesc.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      heroDesc.style.opacity = '1';
      heroDesc.style.transform = 'translateY(0)';
    }
  }, 1200);

  setTimeout(() => {
    if (heroCta) {
      heroCta.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      heroCta.style.opacity = '1';
      heroCta.style.transform = 'translateY(0)';
    }
  }, 1400);

  // ============================================
  // COUNTER ANIMATION
  // ============================================
  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * target);
      el.textContent = current.toLocaleString('id-ID');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString('id-ID');
      }
    }
    requestAnimationFrame(update);
  }

  // ============================================
  // 3D TILT CARD EFFECT
  // ============================================
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // VIDEO SCALE-ON-SCROLL + NAVBAR HIDE
  // ============================================
  const spotlightSection = document.getElementById('spotlight-section');
  const videoWrapper = document.getElementById('video-wrapper');
  const mainNav = document.getElementById('main-nav');

  if (spotlightSection && videoWrapper) {
    let isTicking = false;

    const updateScroll = () => {
      const rect = spotlightSection.getBoundingClientRect();

      if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        const scrollDistance = -rect.top;
        const maxScroll = rect.height - window.innerHeight;
        const progress = scrollDistance / maxScroll;

        const scaleProgress = Math.min(1, Math.max(0, progress / 0.6));

        // Hide navbar
        if (mainNav) {
          if (progress > 0.05 && progress < 0.95) {
            mainNav.style.transform = 'translateY(-100%)';
            mainNav.style.opacity = '0';
          } else {
            mainNav.style.transform = 'translateY(0)';
            mainNav.style.opacity = '1';
          }
        }

        const easeOutQuad = scaleProgress * (2 - scaleProgress);
        let currentScale = 0.5 + easeOutQuad * 0.5;

        if (progress > 0.8) {
          const shrinkProgress = Math.min(1, Math.max(0, (progress - 0.8) / 0.2));
          const shrinkEase = shrinkProgress * shrinkProgress;
          currentScale = 1.0 - shrinkEase * 0.3;
          videoWrapper.style.transform = `scale(${currentScale}) translateY(-${shrinkEase * 100}px)`;
        } else {
          videoWrapper.style.transform = `scale(${currentScale})`;
        }
      } else if (rect.top > 0) {
        videoWrapper.style.transform = `scale(0.5)`;
        if (mainNav) {
          mainNav.style.transform = 'translateY(0)';
          mainNav.style.opacity = '1';
        }
      } else if (rect.bottom < window.innerHeight) {
        videoWrapper.style.transform = `scale(0.7) translateY(-100px)`;
        if (mainNav) {
          mainNav.style.transform = 'translateY(0)';
          mainNav.style.opacity = '1';
        }
      }

      isTicking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!isTicking) {
          window.requestAnimationFrame(updateScroll);
          isTicking = true;
        }
      },
      { passive: true }
    );

    window.dispatchEvent(new Event('scroll'));
  }

  // ============================================
  // HIDE SCROLL INDICATOR ON SCROLL
  // ============================================
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 100) {
          scrollIndicator.style.opacity = '0';
        } else {
          scrollIndicator.style.opacity = '1';
        }
      },
      { passive: true }
    );
  }
});
