// ─── Lenis Smooth Scroll ───
const lenis = new Lenis({
    duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 2
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// ─── GSAP ───
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
ScrollTrigger.normalizeScroll(true);
ScrollTrigger.config({ ignoreMobileResize: true });

// ─── Themed Loader ───
function initLoader() {
    const loader = document.getElementById('site-loader');
    const text = loader.querySelector('.loader-text');
    const bar = loader.querySelector('.loader-bar');
    gsap.set(loader, { opacity: 1, pointerEvents: 'all' });
    gsap.set(bar, { x: 0 });
    gsap.set(text, { y: '100%' });
    const tl = gsap.timeline({
        onComplete: () => { gsap.set(loader, { pointerEvents: 'none', opacity: 0 }); ScrollTrigger.refresh(); }
    });
    tl.to(text, { y: 0, duration: 0.8, ease: 'power4.out', delay: 0.2 })
        .to(loader, { opacity: 0, duration: 0.4, ease: 'power1.inOut' }, '+=0.1');
}
initLoader();

// ─── Hero Shrink-to-Header ───
const heroTextGroup = document.getElementById('hero-text-group');
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
const finalScale = () => isMobile() ? 0.3 : 0.15;
const headerH = () => isMobile() ? '60px' : '80px';

const heroTl = gsap.timeline({
    scrollTrigger: {
        trigger: '.spacer', start: 'top top', end: 'bottom top',
        scrub: 0.8, invalidateOnRefresh: true,
        onLeave: () => gsap.set('#hero-container', { pointerEvents: 'auto' }),
        onEnterBack: () => gsap.set('#hero-container', { pointerEvents: 'none' })
    }
});

heroTl.to('.slogan-line-1', { opacity: 1, duration: 0.3, ease: 'power2.out' })
    .to('.slogan-line-2', { opacity: 1, duration: 0.3, ease: 'power2.out' }, '+=0.1')
    .to('#hero-button-wrapper', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out',
        onStart: () => gsap.set('#hero-button-wrapper', { pointerEvents: 'auto' }),
        onReverseComplete: () => gsap.set('#hero-button-wrapper', { pointerEvents: 'none' })
    }, '+=0.2')
    .to('#hero-lang-toggle', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '<')
    .to(heroTextGroup, { scale: finalScale, transformOrigin: 'center center', ease: 'power2.inOut', duration: 0.3 }, '+=0.1')
    .to(['#hero-slogan', '#hero-button-wrapper', '#hero-lang-toggle'], { opacity: 0, display: 'none', duration: 0.3, ease: 'power2.inOut' }, '<')
    .to('#hero-container', { height: headerH, duration: 0.3, ease: 'power2.inOut' }, '<')
    .to('#header-bg', { opacity: 1, duration: 0.3, ease: 'power2.inOut' }, '<')
    .to('#main-nav', { opacity: 1, duration: 0.3, ease: 'power2.inOut' }, '<');

// ─── Gateway Reveal ───
document.querySelectorAll('.gateway').forEach((gw, i) => {
    gsap.to(gw, {
        scrollTrigger: { trigger: '#gateways-section', start: 'top 80%' },
        opacity: 1, y: 0, duration: 1, delay: i * 0.15, ease: 'power3.out'
    });
});

// ─── Process Steps Reveal ───
document.querySelectorAll('.process-step').forEach((step, i) => {
    gsap.to(step, {
        scrollTrigger: { trigger: '#process-section', start: 'top 70%' },
        opacity: 1, y: 0, duration: 0.8, delay: i * 0.15, ease: 'power3.out'
    });
});

// ─── Stats Counter Animation ───
function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
        const target = parseInt(el.dataset.target);
        if (!target) return;
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const obj = { val: 0 };
        gsap.to(obj, {
            val: target,
            duration: 2, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
            onUpdate: () => { el.textContent = prefix + Math.floor(obj.val).toLocaleString() + suffix; }
        });
    });
}

// ─── Trust Section Reveals ───
document.querySelectorAll('.stat-item').forEach((item, i) => {
    gsap.to(item, {
        scrollTrigger: { trigger: '#trust-section', start: 'top 75%' },
        opacity: 1, y: 0, duration: 0.7, delay: i * 0.1, ease: 'power3.out'
    });
});
gsap.to('.claim-splash', {
    scrollTrigger: { trigger: '.claim-splash', start: 'top 85%' },
    opacity: 1, y: 0, duration: 1, ease: 'power3.out'
});
document.querySelectorAll('.testimonial-card').forEach((card, i) => {
    gsap.to(card, {
        scrollTrigger: { trigger: '#trust-section', start: 'top 70%' },
        opacity: 1, y: 0, duration: 0.8, delay: i * 0.15 + 0.3, ease: 'power3.out'
    });
});

// ─── About Section Reveal ───
gsap.from('.about-portrait', {
    scrollTrigger: { trigger: '#about-section', start: 'top 70%' },
    opacity: 0, x: -40, duration: 1, ease: 'power3.out'
});
gsap.from('.about-bio > *', {
    scrollTrigger: { trigger: '#about-section', start: 'top 70%' },
    opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power3.out'
});
document.querySelectorAll('.personal-widget').forEach((w, i) => {
    gsap.from(w, {
        scrollTrigger: { trigger: '#about-section', start: 'top 60%' },
        opacity: 0, y: 15, duration: 0.5, delay: i * 0.1 + 0.5, ease: 'back.out(1.7)'
    });
});

// ─── Contact Card ───
gsap.fromTo('.contact-card-simple', {
    rotateX: 8, scale: 1.02, y: 60
}, {
    rotateX: 0, scale: 1, y: 0,
    scrollTrigger: { trigger: '#contact-section', start: 'top bottom', end: 'center center', scrub: 1 }
});

// ─── Projects Carousel ───
function initProjectsCarousel() {
    const viewport = document.querySelector('.embla__viewport');
    const prevBtn = document.getElementById('projects-prev');
    const nextBtn = document.getElementById('projects-next');
    const bar = document.querySelector('.projects-progress-bar');
    if (!viewport || !window.EmblaCarousel) return;
    const embla = window.EmblaCarousel(viewport, {
        align: 'start', containScroll: 'trimSnaps', dragFree: true
    });
    const update = () => {
        if (prevBtn) prevBtn.disabled = !embla.canScrollPrev();
        if (nextBtn) nextBtn.disabled = !embla.canScrollNext();
        if (bar) bar.style.width = `${Math.max(0, Math.min(1, embla.scrollProgress())) * 100}%`;
    };
    if (prevBtn) prevBtn.addEventListener('click', () => embla.scrollPrev());
    if (nextBtn) nextBtn.addEventListener('click', () => embla.scrollNext());
    embla.on('select', update);
    embla.on('scroll', update);
    embla.on('init', update);
    update();
}

// ─── Project Modal ───
function initProjectModal() {
    const modal = document.querySelector('.project-modal');
    const cards = document.querySelectorAll('.project-card');
    const closeBtn = document.querySelector('.modal-close');
    const overlay = document.querySelector('.modal-overlay');
    if (!modal || !cards.length) return;
    const mImg = document.querySelector('#modal-img');
    const mTitle = document.querySelector('#modal-title');
    const mDesc = document.querySelector('#modal-desc');
    const open = (card) => {
        const a = card.tagName === 'A' ? card : card.querySelector('a');
        const img = card.querySelector('img')?.src || '';
        const title = card.querySelector('.project-item-title')?.textContent || '';
        const desc = card.querySelector('.project-description')?.textContent || '';
        mImg.src = img;
        mTitle.textContent = title;
        mDesc.textContent = desc;
        modal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
        lenis.stop();
    };
    const close = () => {
        modal.classList.remove('is-active');
        document.body.style.overflow = '';
        lenis.start();
    };
    cards.forEach(c => c.addEventListener('click', (e) => { e.preventDefault(); open(c); }));
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

// ─── Contact Form ───
function initContactForm() {
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('.submit-btn');
        const orig = btn.textContent;
        btn.disabled = true; btn.textContent = 'Sending...';
        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST', body: new FormData(form)
            });
            const data = await res.json();
            if (data.success) {
                gsap.to(form, { opacity: 0, y: -10, duration: 0.4,
                    onComplete: () => {
                        form.classList.add('hidden');
                        success.classList.remove('hidden');
                        gsap.fromTo(success, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
                    }
                });
            } else {
                alert('Something went wrong. Please try again.');
                btn.disabled = false; btn.textContent = orig;
            }
        } catch (err) {
            alert('Something went wrong. Please try again.');
            btn.disabled = false; btn.textContent = orig;
        }
    });
}

// ─── Custom Cursor (Desktop only, enhancement) ───
function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const cursor = document.querySelector('#custom-cursor');
    const dot = document.querySelector('.cursor-dot');
    const circle = document.querySelector('.cursor-circle');
    const text = document.querySelector('.cursor-text');
    if (!cursor) return;
    const xSet = gsap.quickSetter(cursor, 'x', 'px');
    const ySet = gsap.quickSetter(cursor, 'y', 'px');
    window.addEventListener('mousemove', (e) => {
        xSet(e.clientX);
        ySet(e.clientY);
    });
    document.querySelectorAll('a, button, .project-card, .gateway').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    });
    document.addEventListener('mouseleave', () => gsap.to(cursor, { opacity: 0, duration: 0.3 }));
    document.addEventListener('mouseenter', () => gsap.to(cursor, { opacity: 1, duration: 0.3 }));
}

// ─── Language Toggle ───
function initLangToggle() {
    const btns = document.querySelectorAll('.lang-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Future: switch language content here
        });
    });
}

// ─── Home Link (scroll to top) ───
document.getElementById('home-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    lenis.scrollTo(0, { duration: 2, ease: (t) => 1 - Math.pow(1 - t, 4) });
});

// ─── Floating CTA ───
// Handled in HTML with simple scroll link

// ─── Init Everything ───
document.addEventListener('DOMContentLoaded', () => {
    initProjectsCarousel();
    initProjectModal();
    initContactForm();
    initCustomCursor();
    initLangToggle();
    animateCounters();
    ScrollTrigger.refresh();
});

window.addEventListener('load', () => { ScrollTrigger.refresh(); });
