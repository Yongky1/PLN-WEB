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
});
