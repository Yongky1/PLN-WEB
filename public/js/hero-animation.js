/**
 * Hero Canvas Sequence Animation
 * Premium, scroll-scrubbed frame-sequence player for the Hero Section.
 */

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("hero-scroll-container");
    const canvas = document.getElementById("hero-canvas");
    const ctx = canvas.getContext("2d");
    const fallback = document.getElementById("hero-fallback");
    
    // Configuration
    const config = {
        frameCount: 240,
        path: index => `/images/hero/frames/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
    };
    
    // State
    const images = new Array(config.frameCount + 1); // 1-indexed
    let playIndex = 1;         // Currently displayed frame
    let loadIndex = 1;         // Frame currently being fetched
    let sequenceFailed = false;

    // --- Rendering Logic ---

    // Resize observer to keep canvas full bleed and maintain proportions
    function resizeCanvas() {
        // Set actual size in memory
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Redraw current frame immediately to fill the new dimensions
        if (images[playIndex] && images[playIndex].complete) {
            drawImageCover(images[playIndex]);
        }
    }

    // Mimic 'object-fit: cover' behavior on canvas
    function drawImageCover(img) {
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

        if (canvasRatio > imgRatio) {
            sHeight = img.width / canvasRatio;
            sy = (img.height - sHeight) / 2;
        } else {
            sWidth = img.height * canvasRatio;
            sx = (img.width - sWidth) / 2;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, drawWidth, drawHeight);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // Initial Setup

    // --- Loading Strategy ---

    // Sequentially load frames to avoid network congestion
    function loadNextFrame() {
        if (loadIndex > config.frameCount || sequenceFailed) return;

        const img = new Image();
        const currentIndex = loadIndex;

        img.onload = () => {
            images[currentIndex] = img;
            
            // Special handling for the very first frame
            if (currentIndex === 1) {
                // Reveal canvas and hide fallback image
                canvas.classList.remove("opacity-0");
                canvas.classList.add("opacity-100");
                setTimeout(() => fallback.classList.add("opacity-0"), 1000);
                
                // Draw initial frame immediately
                drawImageCover(img);
            }

            // Fetch the next frame in sequence
            loadIndex++;
            loadNextFrame();
        };

        img.onerror = () => {
            if (currentIndex === 1) {
                console.warn("Hero frame sequence not found. Using static fallback image.");
                sequenceFailed = true;
            } else {
                console.warn(`Frame ${currentIndex} failed to load. Stopping preload sequence.`);
                config.frameCount = currentIndex - 1; // Cap the max frames
            }
        };

        img.src = config.path(currentIndex);
    }

    // --- Scroll Playback Logic ---
    
    let currentFrameInfo = {
        current: 1,
        target: 1
    };

    function updateScrollTarget() {
        if (sequenceFailed || !container) return;
        
        // Calculate the scroll progress inside the container
        const scrollTop = window.scrollY - container.offsetTop;
        const maxScroll = container.offsetHeight - window.innerHeight;
        
        // Clamp and map fraction
        let scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
        
        // Target frame based on scroll percentage
        let target = (scrollFraction * (config.frameCount - 1)) + 1;
        
        // Prevent going past the actually loaded frames
        currentFrameInfo.target = Math.min(target, Math.max(1, loadIndex - 1));
    }

    // Capture precise scroll data
    window.addEventListener("scroll", updateScrollTarget, { passive: true });

    // Smooth physics loop
    function renderLoop() {
        if (!sequenceFailed) {
            // Lerp (Linear Interpolation) for smoothness!
            // Easing factor 0.04 for an extremely heavy, cinematic Apple-like tracking glide
            currentFrameInfo.current += (currentFrameInfo.target - currentFrameInfo.current) * 0.04;
            
            let roundedFrame = Math.round(currentFrameInfo.current);
            roundedFrame = Math.max(1, Math.min(roundedFrame, config.frameCount));
            
            // Only draw if the frame has actually changed integer steps and is ready
            if (roundedFrame !== playIndex && images[roundedFrame] && images[roundedFrame].complete) {
                playIndex = roundedFrame;
                drawImageCover(images[playIndex]);
            }
        }
        
        // Loop infinitely while tab is active
        requestAnimationFrame(renderLoop);
    }

    // --- Initialization ---

    loadNextFrame(); // Kickoff the sequential loader
    requestAnimationFrame(renderLoop); // Kickoff smooth render loop
});
