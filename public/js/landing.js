/**
 * ═══════════════════════════════════════════════════════
 * JALA LANDING — Light Theme Engine
 * Particles + Hero Fade + Fixed Cards + Section Reveal
 * (Background 3D ditangani oleh hero-3d.js)
 * ═══════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // Only run on landing page
  if (!document.body.classList.contains('landing-page')) return;

  // Selaras dengan hero-3d.js
  function getScrollBounds() {
    const vh = window.innerHeight;
    return { start: vh * 0.5, end: document.documentElement.scrollHeight - vh };
  }
  function getProgress() {
    const { start, end } = getScrollBounds();
    const range = end - start;
    if (range <= 0) return 0;
    return Math.max(0, Math.min(1, (window.scrollY - start) / range));
  }

  // ===================== PARTICLES =====================
  const pCanvas = document.getElementById('particles-canvas');
  if (pCanvas) {
    const pCtx = pCanvas.getContext('2d');
    let particles = [];
    const particleColors = [
      'rgba(0, 82, 163, ',     // PLN blue
      'rgba(0, 150, 180, ',    // cyan dark
      'rgba(120, 145, 180, ',  // blue-gray
    ];

    function resizeParticles() {
      pCanvas.width = window.innerWidth;
      pCanvas.height = window.innerHeight;
      createParticles();
    }

    function createParticles() {
      particles = [];
      const count = Math.floor((pCanvas.width * pCanvas.height) / 16000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * pCanvas.width,
          y: Math.random() * pCanvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: Math.random() * 1.4 + 0.4,
          opacity: Math.random() * 0.22 + 0.08,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
        });
      }
    }

    function animateParticles() {
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = pCanvas.width;
        if (p.x > pCanvas.width) p.x = 0;
        if (p.y < 0) p.y = pCanvas.height;
        if (p.y > pCanvas.height) p.y = 0;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fillStyle = p.color + p.opacity + ')';
        pCtx.fill();
      }
      requestAnimationFrame(animateParticles);
    }

    resizeParticles();
    window.addEventListener('resize', resizeParticles);
    animateParticles();
  }

  // ===================== HERO FADE =====================
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    window.addEventListener(
      'scroll',
      () => {
        const fade = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.3));
        heroEl.style.opacity = fade;
      },
      { passive: true }
    );
  }

  // ===================== FIXED CARDS =====================
  const fixedCards = document.getElementById('fixed-cards');
  const cardsGrid = fixedCards ? fixedCards.querySelector('.grid') : null;

  function tickCards() {
    if (!fixedCards || !cardsGrid) return;

    const trigger = document.getElementById('cards-trigger');
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const triggerTop = rect.top + window.scrollY;
    const triggerHeight = rect.height;
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    const start = triggerTop - vh * 0.5;
    const end = triggerTop + triggerHeight - vh * 0.3;
    const range = end - start;

    let progress = range > 0 ? (scrollY - start) / range : 0;
    progress = Math.max(0, Math.min(1, progress));

    const isActive = scrollY >= start - vh * 0.2 && scrollY <= end + vh * 0.3;
    const fadeIn = Math.min(1, Math.max(0, (scrollY - (start - vh * 0.2)) / (vh * 0.2)));
    const fadeOut = Math.min(1, Math.max(0, (end + vh * 0.3 - scrollY) / (vh * 0.3)));
    const containerOpacity = isActive ? Math.min(fadeIn, fadeOut) : 0;

    fixedCards.style.opacity = containerOpacity;
    fixedCards.style.pointerEvents = containerOpacity > 0.1 ? 'auto' : 'none';

    const isMobile = window.innerWidth < 768;
    const revealPct = progress * 130;
    if (isMobile) {
      cardsGrid.style.maskImage = `linear-gradient(to bottom, black ${revealPct}%, transparent ${revealPct + 20}%)`;
      cardsGrid.style.webkitMaskImage = `linear-gradient(to bottom, black ${revealPct}%, transparent ${revealPct + 20}%)`;
    } else {
      cardsGrid.style.maskImage = `linear-gradient(to right, black ${revealPct}%, transparent ${revealPct + 15}%)`;
      cardsGrid.style.webkitMaskImage = `linear-gradient(to right, black ${revealPct}%, transparent ${revealPct + 15}%)`;
    }

    requestAnimationFrame(tickCards);
  }
  requestAnimationFrame(tickCards);

  // ===================== SECTION 3 INTERSECTION =====================
  const sectionThreeInner = document.getElementById('section-three-inner');
  if (sectionThreeInner) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sectionThreeInner.classList.add('visible');
          observer.unobserve(sectionThreeInner);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(sectionThreeInner);
  }

  // Navigation handled by unified awwwards nav in navbar.ejs
})();


/* === LANDING ANIMATIONS === */

/**
 * JALA PREMIUM INTERACTIONS
 * Includes: Typewriter, Magnetic Hover, and 3D Tilt Effects
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. TYPEWRITER EFFECT FOR TERMINAL HERO
  // ==========================================
  const codeBox = document.querySelector('#hero .code-box code');
  if (codeBox) {
    const originalText = codeBox.textContent.trim();
    codeBox.textContent = ''; // Clear it initially
    
    // Add a blinking cursor element
    const cursor = document.createElement('span');
    cursor.textContent = '|';
    cursor.style.animation = 'blink 1s step-end infinite';
    cursor.style.fontWeight = 'bold';
    
    // Add keyframes dynamically if not exists
    if (!document.getElementById('cursor-blink-css')) {
      const style = document.createElement('style');
      style.id = 'cursor-blink-css';
      style.textContent = `
        @keyframes blink { 50% { opacity: 0; } }
      `;
      document.head.appendChild(style);
    }

    codeBox.appendChild(cursor);

    let i = 0;
    // Delay start slightly for effect
    setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (i < originalText.length) {
          // Insert text before the cursor
          cursor.insertAdjacentText('beforebegin', originalText.charAt(i));
          i++;
        } else {
          clearInterval(typeInterval);
          // Keep cursor blinking at the end
        }
      }, 70); // typing speed
    }, 1000);
  }

  // ==========================================
  // 2. MAGNETIC HOVER EFFECT (Buttons)
  // ==========================================
  const magneticElements = document.querySelectorAll('.cta-btn, .nav-cta, .btn-primary');
  
  magneticElements.forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
      const rect = btn.getBoundingClientRect();
      const h = rect.width / 2;
      const v = rect.height / 2;
      const x = e.clientX - rect.left - h;
      const y = e.clientY - rect.top - v;

      // Move button slightly towards cursor (magnetic pull)
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', function() {
      // Reset position
      btn.style.transform = 'translate(0px, 0px)';
      // Smooth reset transition
      btn.style.transition = 'transform 0.3s ease-out';
      setTimeout(() => {
        // Remove inline transition to allow CSS hover transitions to work again
        btn.style.transition = '';
      }, 300);
    });
  });

  // ==========================================
  // 3. 3D TILT EFFECT (For Cards)
  // ==========================================
  const tiltCards = document.querySelectorAll('.category-card, .card-elevated, .v3-card-item > div');
  
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const multiplier = 10;
      
      // Calculate rotation based on cursor position relative to center
      const xRotation = multiplier * ((y - rect.height / 2) / rect.height);
      const yRotation = -1 * multiplier * ((x - rect.width / 2) / rect.width);
      
      card.style.transform = `perspective(1000px) scale(1.02) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
    });

    card.addEventListener('mouseleave', function() {
      card.style.transform = 'perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)';
      card.style.transition = 'transform 0.5s ease-out';
      setTimeout(() => {
        card.style.transition = '';
      }, 500);
    });
    
    card.addEventListener('mouseenter', function() {
      card.style.transition = 'none'; // Disable transition during hover for instant mouse tracking
    });
  });

});

// ==========================================
// 4. LOADING SCREEN (Global)
// ==========================================
window.addEventListener('load', () => {
  const loader = document.getElementById('jala-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500); // Wait for CSS transition
  }
});
