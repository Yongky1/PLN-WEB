// public/js/scroll.js

document.addEventListener('DOMContentLoaded', () => {
    // Basic Reveal on Scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(section => {
        observer.observe(section);
    });

    // TODO: Future expansion for Advanced Scrollytelling
    // - Connect GSAP ScrollTrigger for pinned sections
    // - Tie scroll position to 3D camera path in scene.js
    // - Create sticky content overlapping the 3D canvas
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // ----------------------------------------------------
    // Video Scale-on-Scroll Logic (Antigravity Reference)
    // ----------------------------------------------------
    const spotlightSection = document.getElementById('spotlight-section');
    const videoWrapper = document.getElementById('video-wrapper');
    const mainNav = document.getElementById('main-nav');

    if (spotlightSection && videoWrapper) {
        let isTicking = false;

        const updateScroll = () => {
            const rect = spotlightSection.getBoundingClientRect();
            
            if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
                // Section is currently scrolling/pinned via CSS sticky
                const scrollDistance = -rect.top;
                const maxScroll = rect.height - window.innerHeight;
                let progress = scrollDistance / maxScroll; // 0 to 1
                
                // Scale from 0.2 to 1.0
                let scaleProgress = Math.min(1, Math.max(0, progress / 0.6));
                
                // Hide navbar for full immersion
                if (mainNav) {
                    if (progress > 0.05 && progress < 0.95) {
                        mainNav.style.transform = 'translateY(-100%)';
                        mainNav.style.opacity = '0';
                    } else {
                        mainNav.style.transform = 'translateY(0)';
                        mainNav.style.opacity = '1';
                    }
                }

                // Easing out equation for smoother feel
                const easeOutQuad = scaleProgress * (2 - scaleProgress);
                let currentScale = 0.2 + (easeOutQuad * 0.8);
                
                // Shrink back down slightly as user passes it
                if (progress > 0.8) {
                    let shrinkProgress = Math.min(1, Math.max(0, (progress - 0.8) / 0.2));
                    const shrinkEase = shrinkProgress * shrinkProgress; // ease in
                    currentScale = 1.0 - (shrinkEase * 0.3); 
                    videoWrapper.style.transform = `scale(${currentScale}) translateY(-${shrinkEase * 100}px)`;
                } else {
                    videoWrapper.style.transform = `scale(${currentScale})`;
                }

            } else if (rect.top > 0) {
                // Above the section
                videoWrapper.style.transform = `scale(0.2)`;
                if (mainNav) {
                    mainNav.style.transform = 'translateY(0)';
                    mainNav.style.opacity = '1';
                }
            } else if (rect.bottom < window.innerHeight) {
                // Below the section
                videoWrapper.style.transform = `scale(0.7) translateY(-100px)`;
                if (mainNav) {
                    mainNav.style.transform = 'translateY(0)';
                    mainNav.style.opacity = '1';
                }
            }
            
            isTicking = false;
        };

        window.addEventListener('scroll', () => {
            if (!isTicking) {
                window.requestAnimationFrame(updateScroll);
                isTicking = true;
            }
        }, { passive: true });
        
        // Initial call to set correct transform on load
        window.dispatchEvent(new Event('scroll'));
    }
});
