// ─── GSAP Setup ───
gsap.registerPlugin(ScrollTrigger);

// ─── Section title / hero entrance (is-in class) ───
function initSectionReveals() {
    const sections = document.querySelectorAll('section[id], .section');
    sections.forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 75%',
            once: true,
            onEnter: () => section.classList.add('is-in'),
        });
    });
}

// ─── Reveal Observer ───
function initRevealObserver() {
    const targets = document.querySelectorAll(
        '[data-reveal], .gateway, .timeline-item, .stat-item, .claim-splash, .testimonial-card, .gallery-item, .blog-article'
    );

    if (!('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('revealed'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
}

// ─── Process Timeline (scroll-linked fill) ───
function initTimeline() {
    const section = document.getElementById('process-section');
    const fill = section.querySelector('.timeline-track-fill');
    if (!fill) return;

    const items = Array.from(section.querySelectorAll('.timeline-item'));
    const timeline = section.querySelector('.timeline');

    const updateStatus = () => {
        if (!timeline) return;
        const trackRect = timeline.getBoundingClientRect();
        const fillPct = parseFloat(fill.style.height) || 0;
        const fillTop = trackRect.top + (trackRect.height * fillPct) / 100;

        items.forEach((item) => {
            const itemRect = item.getBoundingClientRect();
            const mid = itemRect.top + itemRect.height / 2;
            if (mid <= fillTop + 1) {
                item.dataset.status = 'completed';
            } else if (mid <= fillTop + 16) {
                item.dataset.status = 'active';
            } else {
                item.dataset.status = 'pending';
            }
        });
    };

    ScrollTrigger.create({
        trigger: section,
        start: 'top 70%',
        end: 'bottom 70%',
        scrub: 1,
        onUpdate: (self) => {
            fill.style.height = `${self.progress * 100}%`;
            updateStatus();
        },
    });
}

// ─── Stats Counters ───
function initStats() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;

    const animate = (el) => {
        const target = parseFloat(el.dataset.target) || 0;
        const suffix = el.dataset.suffix || '';
        const duration = 1600;
        const start = performance.now();

        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animate(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.4 }
    );

    counters.forEach((el) => observer.observe(el));
}

// ─── Lightbox ───
function initGallery() {
    const lightbox = document.getElementById('lightbox');
    const items = document.querySelectorAll('.gallery-item');
    if (!lightbox || !items.length) return;

    const img = document.getElementById('lightbox-img');
    const videoWrap = document.getElementById('lightbox-video-wrap');
    const badge = document.getElementById('lightbox-badge');
    const title = document.getElementById('lightbox-title');
    const desc = document.getElementById('lightbox-desc');
    const year = document.getElementById('lightbox-year');
    const category = document.getElementById('lightbox-category');
    const close = document.getElementById('lightbox-close');
    const prev = document.getElementById('lightbox-prev');
    const next = document.getElementById('lightbox-next');
    const overlay = lightbox.querySelector('.lightbox-overlay');

    let current = 0;
    let activeVideo = null;

    const stopVideo = () => {
        if (!activeVideo) return;
        if (activeVideo.tagName === 'VIDEO') activeVideo.pause();
        activeVideo.remove();
        activeVideo = null;
    };

    const setVideo = (src) => {
        videoWrap.style.display = 'none';
        if (!src) return;

        const isYoutube = /youtube\.com|youtu\.be/i.test(src);
        if (isYoutube) {
            const videoId = src.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
            const frame = document.createElement('iframe');
            frame.src = videoId
                ? `https://www.youtube-nocookie.com/embed/${videoId[1]}?autoplay=1&rel=0`
                : src;
            frame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            frame.setAttribute('allowfullscreen', '');
            videoWrap.appendChild(frame);
        } else {
            const video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.muted = false;
            videoWrap.appendChild(video);
        }
        activeVideo = videoWrap.firstElementChild;
        videoWrap.style.display = 'flex';
    };

    const show = (index) => {
        current = (index + items.length) % items.length;
        const el = items[current];

        stopVideo();
        img.style.display = 'block';
        videoWrap.style.display = 'none';

        const cover = el.querySelector('.project-media img');
        img.src = cover ? cover.src : '';
        img.alt = el.dataset.title || '';

        badge.textContent = el.dataset.badge || '';
        title.textContent = el.dataset.title || '';
        desc.textContent = el.dataset.desc || '';
        year.textContent = el.dataset.year || '';
        category.textContent = el.dataset.category || '';

        if (el.dataset.video) {
            img.style.display = 'none';
            setVideo(el.dataset.video);
        }

        lightbox.style.display = 'flex';
        document.body.classList.add('lightbox-open');
        document.body.style.overflow = 'hidden';
    };

    const hide = () => {
        stopVideo();
        img.style.display = 'block';
        videoWrap.style.display = 'none';
        lightbox.style.display = 'none';
        document.body.classList.remove('lightbox-open');
        document.body.style.overflow = '';
    };

    items.forEach((el, i) => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('a')) e.preventDefault();
            show(i);
        });
    });

    close.addEventListener('click', hide);
    overlay.addEventListener('click', hide);
    prev.addEventListener('click', (e) => { e.stopPropagation(); show(current - 1); });
    next.addEventListener('click', (e) => { e.stopPropagation(); show(current + 1); });
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display !== 'flex') return;
        if (e.key === 'Escape') hide();
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
    });
}

// ─── Project Cards (hover parallax + image shift) ───
function initProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length || window.matchMedia('(pointer: coarse)').matches) return;

    cards.forEach((card) => {
        const img = card.querySelector('.project-media img');
        const xTo = gsap.quickTo(card, 'x', { duration: 0.5, ease: 'power3.out' });
        const yTo = gsap.quickTo(card, 'y', { duration: 0.5, ease: 'power3.out' });
        const rotTo = gsap.quickTo(card, 'rotation', { duration: 0.5, ease: 'power3.out' });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
            const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
            xTo(dx * 10);
            yTo(dy * 10);
            rotTo(dx * 2.5);
            if (img) {
                img.style.transform = `scale(1.06) translate(${dx * -8}px, ${dy * -8}px)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            xTo(0);
            yTo(0);
            rotTo(0);
            if (img) img.style.transform = '';
        });
    });
}

// ─── Contact Form ───
function initContactForm() {
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    if (!form || !success) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('.submit-btn');
        const original = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: new FormData(form),
            });
            const data = await res.json();
            if (data.success) {
                gsap.to(form, {
                    opacity: 0,
                    y: -10,
                    duration: 0.4,
                    onComplete: () => {
                        form.classList.add('hidden');
                        success.classList.remove('hidden');
                        gsap.fromTo(success, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
                    },
                });
            } else {
                alert('Something went wrong. Please try again.');
                btn.disabled = false;
                btn.textContent = original;
            }
        } catch (err) {
            alert('Something went wrong. Please try again.');
            btn.disabled = false;
            btn.textContent = original;
        }
    });
}

// ─── Back to Top ───
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ─── Language Toggle ───
function initLangToggle() {
    const buttons = document.querySelectorAll('.lang-btn');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            buttons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// ─── Smooth anchor scrolling ───
function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id.length < 2) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// ─── Init Everything ───
document.addEventListener('DOMContentLoaded', () => {
    initSectionReveals();
    initRevealObserver();
    initTimeline();
    initStats();
    initGallery();
    initProjectCards();
    initContactForm();
    initBackToTop();
    initLangToggle();
    initAnchors();
    ScrollTrigger.refresh();
    document.fonts.ready.then(() => ScrollTrigger.refresh());
});

window.addEventListener('load', () => ScrollTrigger.refresh());
