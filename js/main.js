// Initialize Lenis Smooth Scroll
// Global helpers removed in favor of robust CSS Flexbox centering

const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Setup GSAP
gsap.registerPlugin(ScrollTrigger);

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
});

gsap.ticker.lagSmoothing(0);

// Optimize scroll sync and prevent overlap issues
ScrollTrigger.normalizeScroll(true);
ScrollTrigger.config({ ignoreMobileResize: true });

// --- THEMED LOADER LOGIC ---
function initLoader() {
    const loader = document.getElementById('site-loader');
    const text = loader.querySelector('.loader-text');
    const bar = loader.querySelector('.loader-bar');

    // Initial state: Loader is already visible and bar is full from the previous page
    gsap.set(loader, { opacity: 1, pointerEvents: 'all' });
    gsap.set(bar, { x: 0 });
    gsap.set(text, { y: '100%' });

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.set(loader, { pointerEvents: 'none', opacity: 0 });
            ScrollTrigger.refresh(); // Refresh triggers after loader is gone
        }
    });

    // Intro sequence: Just reveal the text and fade away
    tl.to(text, { y: 0, duration: 0.8, ease: "power4.out", delay: 0.2 })
        .to(loader, { opacity: 0, duration: 0.5, ease: "power1.inOut" }, "+=0.1");
}

function triggerThemedRedirect(url) {
    const loader = document.getElementById('site-loader');
    const text = loader.querySelector('.loader-text');
    const bar = loader.querySelector('.loader-bar');

    // Reset Outro state
    gsap.set(text, { y: '100%' });
    gsap.set(bar, { x: '-100%' });
    gsap.set(loader, { pointerEvents: 'all' });

    const tl = gsap.timeline({
        onComplete: () => {
            window.location.href = url;
        }
    });

    // Outro sequence: Fade in background and fill the bar
    tl.to(loader, { opacity: 1, duration: 0.3, ease: "power1.out" })
        .to(bar, { x: 0, duration: 0.7, ease: "power2.inOut" }, "-=0.1");
}

// Start loader immediately
initLoader();

// --- Phase A: The "Maarten" Intro & Navigation ---

const heroContainer = document.getElementById('hero-container');
const headerBg = document.getElementById('header-bg');
const heroTextGroup = document.getElementById('hero-text-group');

// Initial positioning and resize listener
window.addEventListener('resize', () => {
    // Update philosophy offset if it exists
    const philContainer = document.getElementById('philosophy-container');
    if (philContainer && typeof getPhilHeaderOffset === 'function') {
        gsap.set(philContainer, { y: getPhilHeaderOffset() });
    }
    ScrollTrigger.refresh();
});

// Calculate responsive values for header
const initialIsMobile = window.matchMedia("(max-width: 768px)").matches;
const is4K = window.innerWidth > 2500;

const finalScale = () => {
    const isMob = window.matchMedia("(max-width: 768px)").matches;
    return isMob ? 0.25 : 0.15;
};

const headerHeight = () => {
    const isMob = window.matchMedia("(max-width: 768px)").matches;
    const is4K = window.innerWidth > 2500;
    return isMob ? '60px' : (is4K ? '120px' : '80px');
};

const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".spacer",
        start: "top top",
        end: "bottom top",
        scrub: 1, // Smooth scrub
        invalidateOnRefresh: true,
        onLeave: () => gsap.set(heroContainer, { pointerEvents: "auto" }),
        onEnterBack: () => gsap.set(heroContainer, { pointerEvents: "none" })
    }
});

// 1. Fade in first slogan (Dutch) quickly
tl.to('.slogan-line-1', {
    opacity: 1,
    duration: 0.3, // Increased from 0.15
    ease: "power2.out"
});

// 2. Fade in second slogan (Hungary) slightly later
tl.to('.slogan-line-2', {
    opacity: 1,
    duration: 0.3,
    ease: "power2.out"
}, "+=0.1"); // Tightened from 0.15 since spacer is now longer

// 2b. Reveal the "View my Work" button (Sequentially after slogans, on scroll)
tl.to('#hero-button-wrapper', {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out",
    onStart: () => gsap.set('#hero-button-wrapper', { pointerEvents: "auto" }),
    onReverseComplete: () => gsap.set('#hero-button-wrapper', { pointerEvents: "none" })
}, "+=0.25"); // Tightened from 0.5 since spacer is now longer

// Gateway Reveal Animation
const gateways = document.querySelectorAll(".gateway");
gateways.forEach((gateway, index) => {
    gsap.to(gateway, {
        scrollTrigger: {
            trigger: "#gateways-container",
            start: "top 80%", // Reveal when container is 20% in view
        },
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay: index * 0.2, // stagger effect
        ease: "power3.out"
    });
});



// 3. Zoom the entire group to header slot
tl.to(heroTextGroup, {
    scale: finalScale,
    transformOrigin: 'center center',
    ease: "power2.inOut",
    duration: 0.3
}, "+=0.1");

// Fade out slogan and button during zoom out
tl.to(['#hero-slogan', '#hero-button-wrapper'], {
    opacity: 0,
    display: 'none',
    duration: 0.3,
    ease: "power2.inOut"
}, "<");

// Bring container height up to the header size synchronously with zoom
tl.to(heroContainer, {
    height: headerHeight,
    duration: 0.4,
    ease: "power2.inOut"
}, "<");

// Fade in the white glassmorphic background synchronously with zoom
tl.to(headerBg, {
    opacity: 1,
    duration: 0.4,
    ease: "power2.inOut"
}, "<");

// Fade in the main navigation
tl.to('#main-nav', {
    opacity: 1,
    duration: 0.4,
    ease: "power2.inOut"
}, "<");

// 4. Tightened buffer to keep the transition crisp
tl.to({}, { duration: 0.1 });

// --- Phase D: Parallax Film Dust (Canvas) ---
const dustCanvas = document.getElementById('dust-canvas');
const ctx = dustCanvas?.getContext('2d');
const particleCount = is4K ? 100 : 50;
const particles = [];
const overdraw = 150;
let dustColor = '#000000';

function initDust() {
    if (!dustCanvas || !ctx) return;
    dustCanvas.width = window.innerWidth;
    dustCanvas.height = window.innerHeight;
    particles.length = 0;

    // Cache the color once to avoid performance hits in the loop
    dustColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#000000';

    for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 2.5 + 1.2;
        const totalH = dustCanvas.height + overdraw * 2;
        particles.push({
            x: Math.random() * dustCanvas.width,
            y: Math.random() * totalH - overdraw,
            size: size,
            speed: size * (Math.random() * 0.6 + 0.4),
            opacity: Math.random() * 0.25 + 0.15,
            blur: Math.random() > 0.6 ? Math.random() * 2 + 0.5 : 0
        });
    }
}

function drawDust() {
    if (!ctx || !dustCanvas) return;
    ctx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);

    const scrollY = (typeof lenis !== 'undefined') ? lenis.scroll : window.scrollY;
    const totalH = dustCanvas.height + overdraw * 2;

    ctx.fillStyle = dustColor;

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const offset = scrollY * p.speed * 0.25;
        let currentY = p.y - offset;

        currentY = (((currentY + overdraw) % totalH) + totalH) % totalH - overdraw;

        ctx.globalAlpha = p.opacity;
        if (p.blur > 0) {
            ctx.filter = `blur(${p.blur}px)`;
        } else {
            ctx.filter = 'none';
        }

        ctx.beginPath();
        ctx.arc(p.x, currentY, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(drawDust);
}

// Initial setup
initDust();
requestAnimationFrame(drawDust);
window.addEventListener('resize', initDust);

// Parallax dust activation in timeline
const dustEl = document.getElementById('dust-canvas');
tl.to(dustEl, {
    opacity: 1,
    duration: 0.15,
    ease: "power2.out"
}, 0);

// --- Phase E: Philosophy Section Scroll Animation ---
const liquidText = document.getElementById('liquid-philosophy-text');
if (liquidText) {
    // Initial liquid state - target ONLY the first span
    const morphText1 = document.querySelector('.morph-text-1');
    const morphText2 = document.querySelector('.morph-text-2');

    gsap.set(morphText1, {
        filter: "blur(12px)",
        opacity: 0,
        y: 30,
        duration: 4
    });

    // Explicitly hide the second morph text (About Me)
    gsap.set(morphText2, {
        opacity: 0,
        filter: "blur(15px)"
    });

    // --- Phase E: The Hybrid Editorial Reveal ---
    const philContainer = document.querySelector('#philosophy-container');
    const cardWrapper = document.querySelector('#editorial-card-wrapper');
    const cardPortrait = document.querySelector('.card-portrait-box');
    const cardInfo = document.querySelector('.card-info-box');

    // 1. Unified Pinning and Multi-Phase Timeline
    let mainPhilTl;

    ScrollTrigger.create({
        trigger: "#philosophy-section",
        start: "top top",
        end: "+=750%",
        pin: true,
        pinSpacing: true,
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate: (self) => {
            // Force refresh of specific values if needed
        }
    });

    // Use matchMedia for responsive animation values
    let mm = gsap.matchMedia();

    mm.add({
        isDesktop: "(min-width: 1025px)",
        isTablet: "(min-width: 769px) and (max-width: 1024px)",
        isMobile: "(max-width: 768px)"
    }, (context) => {
        let { isDesktop, isTablet, isMobile } = context.conditions;

        const wingWidth = isDesktop ? "300px" : (isTablet ? "150px" : "0px");
        const cardY = isMobile ? 0 : 70;

        mainPhilTl = gsap.timeline({
            scrollTrigger: {
                trigger: "#philosophy-section",
                start: "top top",
                end: "+=750%",
                scrub: 1.2,
            }
        });

        // Initialize state
        gsap.set(morphText1, {
            xPercent: -50, yPercent: -50, top: '50%', left: '50%',
            filter: "blur(20px)", opacity: 0, y: 30
        });
        gsap.set(morphText2, {
            xPercent: -50, yPercent: -50, top: '50%', left: '50%',
            filter: "blur(20px)", opacity: 0, y: 0
        });

        if (isMobile) {
            gsap.set(cardWrapper, { xPercent: 0, yPercent: 0, y: 0, left: 0, top: 0, position: 'relative' });
        } else {
            gsap.set(cardWrapper, { xPercent: -50, yPercent: -50, y: cardY, left: '50%', top: '50%', position: 'absolute' });
        }

        gsap.set(".philosophy-line-1, .philosophy-line-2", { opacity: 0, y: 20 });

        // Build Timeline
        mainPhilTl
            .to(morphText1, { filter: "blur(0px)", opacity: 1, y: 0, duration: 4, ease: "power2.out" }, 0)
            .to(".philosophy-line-1", { opacity: 1, y: 0, duration: 4, ease: "power2.out" }, "+=0.8")
            .to(".philosophy-line-1 .accent-word", { "--accent-width": "100%", duration: 2.5, ease: "power1.inOut" }, "-=0.5")
            .to(".philosophy-line-2", { opacity: 1, y: 0, duration: 4, ease: "power2.out" }, "+=0.5")
            .to(".philosophy-line-2 .accent-word", { "--accent-width": "100%", duration: 2.5, ease: "power1.inOut" }, "-=0.5")
            .to({}, { duration: 2 })
            .addLabel("morphStart")
            .to(morphText1, { filter: "blur(20px)", opacity: 0, duration: 6, ease: "power2.inOut" }, "morphStart")
            .to(morphText2, { opacity: 1, filter: "blur(0px)", duration: 6, ease: "power2.inOut" }, "morphStart")
            .to("#philosophy-subtext", { opacity: 0, y: -50, duration: 6, ease: "power2.inOut" }, "morphStart")
            .to({}, { duration: 2 })
            .addLabel("contentReveal")
            .to([".about-sidebar", ".about-narrative"], { flexBasis: wingWidth, opacity: isMobile ? 0 : 1, duration: 5, ease: "power3.inOut" }, "contentReveal")
            .to(morphText2, { opacity: 0, filter: "blur(20px)", duration: 6.25, ease: "power2.inOut" }, "contentReveal")
            .to(cardWrapper, { opacity: 1, y: 0, duration: 9.6, ease: "power3.inOut" }, "contentReveal+=3.68")
            .from(cardPortrait, { opacity: 0, scale: 0.95, y: 70, duration: 9.6, ease: "power3.out" }, "contentReveal+=3.68")
            .from(cardInfo, { opacity: 0, x: isMobile ? 0 : 60, y: isMobile ? 30 : 0, duration: 9.6, ease: "power3.out" }, "contentReveal+=4.86")
            .to(".s1-bold", { fontWeight: 800, opacity: 1, duration: 3.75, stagger: 2.5, ease: "power2.inOut" }, "contentReveal+=8.125")
            .to(".s2-bold", { fontWeight: 800, opacity: 1, duration: 5, stagger: 2.5, ease: "power2.inOut" }, "contentReveal+=12.5");

        return () => {
            // Clean up if needed
        };
    });
}

// --- Phase F: Contact Card 3D Scroll ---
gsap.fromTo(".contact-card",
    {
        rotateX: 20,
        scale: 1.05,
        y: 100
    },
    {
        rotateX: 0,
        scale: 1,
        y: 0,
        scrollTrigger: {
            trigger: "#contact-section",
            start: "top bottom", // Starts when top of section hits bottom of screen
            end: "center center", // Reaches flat state when section is centered
            scrub: 1,
        }
    }
);

// --- Phase G: Contact Form Interaction ---
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        gsap.to(contactForm, {
            opacity: 0,
            y: -20,
            duration: 0.4,
            onComplete: () => {
                contactForm.classList.add('hidden');
                formSuccess.classList.remove('hidden');
                gsap.fromTo(formSuccess,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
                );
            }
        });
    });
}

// --- Auto-Reload / Smart Layout Trigger (Mobile Switch) ---
const originalViewportWidth = window.innerWidth;
let resizeDebounceTimer;

function checkMobileRedirect() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const isMobileWidth = w < 768;
    const isNarrowOrSquare = w <= h * 1.25; // Catches side-snapping (half screen vertical)
    const isDrasticShrink = w <= (originalViewportWidth * 0.55); // Catches corner-snapping (50% scale)

    // Redirect to static mobile layout if it's mobile width, a narrow aspect ratio, or a snapped/tiny window
    if (isMobileWidth || isNarrowOrSquare || isDrasticShrink) {
        if (!window.location.pathname.includes('mobile-landing-page.html')) {
            return true;
        }
    }
    return false;
}


// Check immediately on load
if (checkMobileRedirect()) {
    window.location.href = 'mobile-landing-page.html';
}

window.addEventListener('resize', () => {
    clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
        if (checkMobileRedirect()) {
            triggerThemedRedirect('mobile-landing-page.html');
        } else if (window.innerWidth >= originalViewportWidth * 1.5) {
            // If they drastically increase size back to full screen from a snap, soft reload to reset GSAP
            triggerThemedRedirect('index.html');
        }
    }, 200);
});

// --- Phase G: Projects Carousel Initialization ---
function initProjectsCarousel() {
    const viewportNode = document.querySelector('.embla-projects .embla__viewport');
    const prevBtnNode = document.getElementById('projects-prev');
    const nextBtnNode = document.getElementById('projects-next');
    const progressBarNode = document.querySelector('.projects-progress-bar');

    if (!viewportNode || !window.EmblaCarousel) return;

    const emblaApi = window.EmblaCarousel(viewportNode, {
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: true,
        breakpoints: {
            '(max-width: 768px)': { dragFree: true }
        }
    });

    // Navigation
    if (prevBtnNode) prevBtnNode.addEventListener('click', () => emblaApi.scrollPrev(), false);
    if (nextBtnNode) nextBtnNode.addEventListener('click', () => emblaApi.scrollNext(), false);

    // Progress Bar & Button States
    const updateUI = () => {
        // Update Progress Bar
        const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
        if (progressBarNode) {
            progressBarNode.style.width = `${progress * 100}%`;
        }

        // Update Nav Buttons
        if (prevBtnNode) prevBtnNode.disabled = !emblaApi.canScrollPrev();
        if (nextBtnNode) nextBtnNode.disabled = !emblaApi.canScrollNext();
    };

    emblaApi.on('select', updateUI);
    emblaApi.on('scroll', updateUI);
    emblaApi.on('init', updateUI);

    // Initial call
    updateUI();

}

// --- Phase G.1: Projects Reveal Animation ---
function initProjectReveal() {
    const section = document.querySelector('#projects-section');
    if (!section) return;

    gsap.fromTo(section,
        { opacity: 0, y: 60 },
        {
            scrollTrigger: {
                trigger: section,
                start: "top 70%",
                toggleActions: "play none none none",
                refreshPriority: 1
            },
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out"
        }
    );
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
    initProjectsCarousel();
    initProjectReveal();
    initCustomCursor();
    initProjectModal();
});

window.addEventListener('load', () => {
    // Final refresh once all images/assets are in place
    ScrollTrigger.refresh();
});

// --- Phase H: Custom Reactive Cursor ---
function initCustomCursor() {
    // Only run on desktop/pointing devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = document.querySelector('#custom-cursor');
    const dot = document.querySelector('.cursor-dot');
    const circle = document.querySelector('.cursor-circle');

    if (!cursor) return;

    // Use GSAP quickSetter for high performance tracking
    const xSetter = gsap.quickSetter(cursor, "x", "px");
    const ySetter = gsap.quickSetter(cursor, "y", "px");

    window.addEventListener('mousemove', (e) => {
        xSetter(e.clientX);
        ySetter(e.clientY);

        // Circle follows with a smooth lag
        gsap.to(circle, {
            x: 0, // Since it's inside the moving cursor container, we reset relative pos
            y: 0,
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto"
        });
    });

    // Interactivity Listeners
    const interactives = document.querySelectorAll('a, button, .project-card, .gateway, .nav-link, #home-link');

    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (el.classList.contains('project-card') || el.classList.contains('gateway')) {
                cursor.classList.add('is-hovering');
            } else {
                cursor.classList.add('is-link');
            }
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('is-hovering');
            cursor.classList.remove('is-link');
        });
    });

    // Special listener for Logo/Home Link
    const homeLink = document.querySelector('#home-link');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            lenis.scrollTo(0, { duration: 2, ease: (t) => 1 - Math.pow(1 - t, 4) });
        });
    }

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        gsap.to(cursor, { opacity: 0, duration: 0.3 });
    });
    document.addEventListener('mouseenter', () => {
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
    });
}

// --- Phase K: Project Quick-View Modal ---
function initProjectModal() {
    const modal = document.querySelector('#project-modal');
    const cards = document.querySelectorAll('.project-card');
    const closeBtn = document.querySelector('.modal-close');
    const overlay = document.querySelector('.modal-overlay');

    if (!modal || !cards.length) return;

    const modalImg = document.querySelector('#modal-img');
    const modalTitle = document.querySelector('#modal-title');
    const modalDesc = document.querySelector('#modal-desc');
    const modalLink = document.querySelector('#modal-link');

    const openModal = (card) => {
        const img = card.querySelector('img').src;
        const title = card.querySelector('.project-item-title').textContent;
        const desc = card.querySelector('.project-description').textContent;
        const link = card.getAttribute('href');

        modalImg.src = img;
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        if (modalLink) {
            modalLink.setAttribute('href', link);
        }

        modal.classList.add('is-active');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    };

    const closeModal = () => {
        modal.classList.remove('is-active');
        document.body.style.overflow = '';
    };

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(card);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Close on ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-active')) {
            closeModal();
        }
    });
}

// --- Phase L: Contact Form Handler (Web3Forms) ---
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');
    
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const submitBtn = form.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Success animation
                gsap.to(form, { 
                    opacity: 0, 
                    y: -20, 
                    duration: 0.5, 
                    onComplete: () => {
                        form.classList.add('hidden');
                        if(successMsg) {
                            successMsg.classList.remove('hidden');
                            gsap.fromTo(successMsg, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
                        }
                    } 
                });
            } else {
                alert('Something went wrong. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initProjectReveal();
    initCustomCursor();
    initProjectModal();
    initContactForm();
});
