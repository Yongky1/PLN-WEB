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
    // The Interactive Power Line (Scroll storytelling)
    // ----------------------------------------------------
    const timelineContainer = document.getElementById('timeline-container');
    const timelineProgress = document.getElementById('timeline-progress');
    const nodes = document.querySelectorAll('.timeline-node');

    if (timelineContainer && timelineProgress) {
        window.addEventListener('scroll', () => {
            const rect = timelineContainer.getBoundingClientRect();
            // Start filling when the top of container passes middle of the viewport
            const triggerPoint = window.innerHeight * 0.6;
            
            if (rect.top < triggerPoint) {
                // Calculate percentage of timeline scrolled
                const totalScrollable = rect.height;
                const scrolledAmount = triggerPoint - rect.top;
                let percentage = (scrolledAmount / totalScrollable) * 100;
                
                // Clamp between 0 and 100
                percentage = Math.max(0, Math.min(percentage, 100));
                timelineProgress.style.height = `${percentage}%`;

                // Highlight nodes as the line hits them
                nodes.forEach(node => {
                    const nodeTopRelativeToContainer = node.offsetTop;
                    const fillHeightPixels = (percentage / 100) * totalScrollable;
                    
                    if (fillHeightPixels >= nodeTopRelativeToContainer) {
                        node.classList.add('active');
                    } else {
                        node.classList.remove('active');
                    }
                });
            } else {
                timelineProgress.style.height = '0%';
                nodes.forEach(node => node.classList.remove('active'));
            }
        }, { passive: true });
    }
});
