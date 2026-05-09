document.addEventListener('DOMContentLoaded', () => {
    // Map data-hover attributes to corresponding image containers
    const floatingElements = {
        'float-V1': document.getElementById('float-V1'),
        'float-i': document.getElementById('float-i'),
        'float-v2': document.getElementById('float-v2'),
        'float-e': document.getElementById('float-e'),
        'float-s': document.getElementById('float-s'),
        'float-h': document.getElementById('float-h'),
        'float-G': document.getElementById('float-G')
    };

    const triggers = document.querySelectorAll('.hover-trigger');

    // Variables for smooth mouse following (Linear Interpolation)
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;

    let activeId = null;
    let isTracking = false;

    // Constantly update mouse coordinates
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Mouse tracking logic merged into main renderLoop for performance

    // Attach event listeners to specific letters in the typography
    triggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', (e) => {
            const targetId = trigger.getAttribute('data-hover');

            // Instantly snap position on first hover so it doesn't fly in from afar
            if (!isTracking) {
                currentX = mouseX;
                currentY = mouseY;
            }

            if (floatingElements[targetId]) {
                activeId = targetId;
                isTracking = true;
                floatingElements[targetId].classList.add('visible');
            }
        });

        trigger.addEventListener('mouseleave', (e) => {
            const targetId = trigger.getAttribute('data-hover');
            if (floatingElements[targetId]) {
                floatingElements[targetId].classList.remove('visible');

                // Slight delay before releasing tracking so the exit transition is smooth
                setTimeout(() => {
                    if (!document.querySelector('.hover-trigger:hover')) {
                        activeId = null;
                        isTracking = false;
                    }
                }, 300);
            }
        });
    });

    // SVG Scribble Scroll Animation Observer
    const animatableElements = document.querySelectorAll('.scribble, .me-card');

    // Automatically calculate lengths for all drawing paths securely 
    document.querySelectorAll('.draw-path').forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length; // Hide initially
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('scribble')) {
                    entry.target.classList.add('animate-draw');
                } else {
                    entry.target.classList.add('animate-reveal');
                }
            } else {
                // Re-hides it so the animation draws again when looking back
                if (entry.target.classList.contains('scribble')) {
                    entry.target.classList.remove('animate-draw');
                } else {
                    entry.target.classList.remove('animate-reveal');
                }
            }
        });
    }, { threshold: 0.3 }); // Triggers when 30% of the element hits the viewport

    animatableElements.forEach(el => observer.observe(el));

    // Continuous Scroll Notch Slider Tracker & Parallax Engine
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const slider = document.getElementById('nav-slider');
    const notchNav = document.querySelector('.notch-nav');
    const massiveTitle = document.querySelector('.massive-title');

    // We will structure milestones directly bound to scroll depths
    let milestones = [];

    // Cache absolute layout positions to eliminate native scroll-offset jitter bugs
    let parallaxTargetElements = [];

    // Typewriters mapped to scroll depth
    let scrollTypewriters = [];
    document.querySelectorAll('.typewriter-text').forEach(el => {
        const text = el.textContent;
        el.textContent = '';
        const spans = [];
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            span.style.opacity = '0';
            span.style.transition = 'opacity 0.1s linear';
            el.appendChild(span);
            spans.push(span);
        }
        scrollTypewriters.push({ el, spans, top: 0, lastCharsToShow: -1 });
    });

    const initializeLayoutMaps = () => {
        // Update Scroll Typewriter map
        scrollTypewriters.forEach(data => {
            data.top = data.el.getBoundingClientRect().top + window.scrollY;
        });

        // Build Parallax map (only collage items, project cards use CSS sticky stacking)
        parallaxTargetElements = Array.from(document.querySelectorAll('.collage-item')).map(card => {
            // Strip any live transforms safely before measuring native constraints
            card.style.transform = 'none';
            return {
                el: card,
                top: card.getBoundingClientRect().top + window.scrollY,
                height: card.offsetHeight
            };
        });

        // Build Notch Slider Milestones 
        const sectionsData = navLinks.map(link => {
            const targetId = link.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            return {
                link: link,
                top: targetEl ? targetEl.getBoundingClientRect().top + window.scrollY : 0
            };
        });

        const navRect = notchNav.getBoundingClientRect();

        milestones = sectionsData.map((data, index) => {
            const linkRect = data.link.getBoundingClientRect();
            // Start morphing slightly before the browser reaches the section mathematically
            let triggerY = data.top - 100;
            if (index === 0) triggerY = 0;

            // Critical fail-safe: Ensure the last target link locks in completely when screen hits absolute bottom floor
            const maxScrollPotential = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - window.innerHeight;
            if (index === sectionsData.length - 1) {
                triggerY = maxScrollPotential;
            }

            return {
                y: triggerY,
                left: linkRect.left - navRect.left,
                width: linkRect.width,
                link: data.link
            };
        });
    };

    // Calculate layout mappings
    setTimeout(initializeLayoutMaps, 150);

    // Dynamic resize hook guarantees background notch won't misalign coordinates
    window.addEventListener('resize', initializeLayoutMaps);

    // Linear interpolation baseline
    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    const lerp = (start, end, factor) => start + (end - start) * factor;

    let lastRenderedScrollY = -1;
    let lastRenderedX = -1;
    let lastRenderedY = -1;

    const renderLoop = () => {
        // Step interpolation safely bounds approach
        currentScrollY = lerp(currentScrollY, targetScrollY, 0.08);

        // --- Mouse Tracking ---
        currentX += (mouseX - currentX) * 0.12;
        currentY += (mouseY - currentY) * 0.12;

        const needsMouseUpdate = Math.abs(currentX - lastRenderedX) > 0.05 || Math.abs(currentY - lastRenderedY) > 0.05;
        const needsScrollUpdate = Math.abs(currentScrollY - lastRenderedScrollY) > 0.05;

        if (needsMouseUpdate) {
            if (activeId && floatingElements[activeId]) {
                floatingElements[activeId].style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
            lastRenderedX = currentX;
            lastRenderedY = currentY;
        }

        if (needsScrollUpdate) {
            lastRenderedScrollY = currentScrollY;

            // --- Continuous Notch Slider Matrix ---
            if (milestones.length > 0) {
                let i = 0;
                // Seek which zone the window progress represents 
                while (i < milestones.length - 1 && currentScrollY >= milestones[i + 1].y - 20) {
                    i++;
                }

                if (i >= milestones.length - 1) {
                    // Hard clamped at end of list
                    slider.style.width = `${milestones[i].width}px`;
                    slider.style.left = `${milestones[i].left}px`;

                    navLinks.forEach(l => l.classList.remove('active'));
                    milestones[i].link.classList.add('active');
                } else {
                    // Determine precision fractional progress inside current bounded zone
                    const m1 = milestones[i];
                    const m2 = milestones[i + 1];
                    let progress = (currentScrollY - m1.y) / (m2.y - m1.y);
                    progress = Math.max(0, Math.min(1, progress));

                    // Add minor elastic easing out of bounds
                    const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                    const currentLeft = m1.left + (m2.left - m1.left) * easeProgress;
                    const currentWidth = m1.width + (m2.width - m1.width) * easeProgress;

                    slider.style.width = `${currentWidth}px`;
                    slider.style.left = `${currentLeft}px`;

                    // Toggle active text highlight visually
                    const closestMilestone = easeProgress > 0.5 ? i + 1 : i;
                    navLinks.forEach((l, idx) => {
                        if (idx === closestMilestone) l.classList.add('active');
                        else l.classList.remove('active');
                    });
                }
            }

            // --- Parallax Flight Rendering ---
            // Hero typography speeds up slightly, drifting down as you scroll away
            if (massiveTitle) {
                massiveTitle.style.transform = `translateY(${currentScrollY * 0.15}px)`;
            }

            // Let project layers drift fluidly and fade in against viewport flow
            parallaxTargetElements.forEach((data) => {
                const elementCenter = data.top + (data.height / 2);
                const viewportCenter = currentScrollY + (window.innerHeight / 2);

                // 1. Standard parallax displacement drift offset
                const offset = (elementCenter - viewportCenter) * 0.04;

                // 2. Continuous Parallax Fade-In mapping
                const viewportBottom = currentScrollY + window.innerHeight;

                // The card begins to materialize when it crosses 40px inside the window floor
                const visibleDepth = viewportBottom - data.top - 40;

                // Natively clamp opacity from 0 to 1 over a 300px transition zone
                const opacity = Math.max(0, Math.min(1, visibleDepth / 300));

                // Apply a slight elastic dimensional scaling bound to the scroll depth progress
                const scale = Math.max(0.92, Math.min(1, 0.92 + (opacity * 0.08)));

                data.el.style.transform = `translateY(${offset}px) scale(${scale})`;
                data.el.style.opacity = opacity;
            });

            // --- Mapped Scroll Typewriter ---
            scrollTypewriters.forEach((data) => {
                const viewportBottom = currentScrollY + window.innerHeight;

                // Element begins revealing characters 100px past bottom scroll plane and finishes smoothly over 400px of scrolling
                const typingStart = data.top + 100;
                const typingEnd = data.top + 500;

                let progress = (viewportBottom - typingStart) / (typingEnd - typingStart);
                progress = Math.max(0, Math.min(1, progress));

                const charsToShow = Math.floor(progress * data.spans.length);

                if (data.lastCharsToShow !== charsToShow) {
                    data.spans.forEach((span, index) => {
                        span.style.opacity = index < charsToShow ? '1' : '0';
                    });
                    data.lastCharsToShow = charsToShow;
                }
            });

        } // End if(needsScrollUpdate)

        // Sustain constant 60fps callback hook 
        requestAnimationFrame(renderLoop);
    };

    // Kickoff the loop immediately
    renderLoop();



    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
    }, { passive: true });

});
