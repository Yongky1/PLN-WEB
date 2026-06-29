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
