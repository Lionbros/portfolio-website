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
    if (!section) return;
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
        const t = (key, fb) => {
            const lang = typeof window.I18N_getLang === 'function' ? window.I18N_getLang() : 'en';
            const dict = (window.I18N && (window.I18N[lang] || window.I18N.en)) || {};
            return dict[key] || fb;
        };
        btn.disabled = true;
        btn.textContent = t('form.sending', 'Sending...');

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
                alert(t('form.error', 'Something went wrong. Please try again.'));
                btn.disabled = false;
                btn.textContent = original;
            }
        } catch (err) {
            alert(t('form.error', 'Something went wrong. Please try again.'));
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

// ─── Language Toggle (EN / NL / HU via js/i18n.js) ───
function initLangToggle() {
    const buttons = document.querySelectorAll('.lang-btn');
    if (!buttons.length) return;

    const apply = (lang) => {
        if (typeof window.I18N_apply === 'function') {
            window.I18N_apply(lang);
        } else {
            buttons.forEach((b) => b.classList.remove('active'));
            const match = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
            if (match) match.classList.add('active');
        }
    };

    // Apply saved language (or English) on load, before user clicks.
    const initial = typeof window.I18N_getLang === 'function' ? window.I18N_getLang() : 'en';
    apply(initial);

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const lang = (btn.getAttribute('data-lang') || btn.textContent || 'en').trim().toLowerCase();
            apply(lang);
        });
    });
}

// ─── Mobile Nav (right-side drawer) ───
function initNavToggle() {
    const burger = document.querySelector('.nav-burger');
    const overlay = document.querySelector('.nav-overlay');
    if (!burger || !overlay) return;
    const panel = overlay.querySelector('.nav-overlay__inner');

    // drawer chrome: small "Menu" label + close button
    if (panel && !panel.querySelector('.nav-drawer__head')) {
        const head = document.createElement('div');
        head.className = 'nav-drawer__head';
        head.innerHTML =
            '<span>Menu</span>' +
            '<button type="button" class="nav-drawer__close" aria-label="Close menu">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
            '<path d="M6 6l12 12M18 6L6 18"/></svg></button>';
        panel.prepend(head);
    }
    const closeBtn = overlay.querySelector('.nav-drawer__close');

    const setOpen = (open) => {
        const wasOpen = document.documentElement.classList.contains('nav-open');
        document.documentElement.classList.toggle('nav-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
            if (closeBtn) setTimeout(() => closeBtn.focus({ preventScroll: true }), 120);
        } else if (wasOpen) {
            burger.focus({ preventScroll: true });
        }
    };

    burger.addEventListener('click', () => {
        setOpen(!document.documentElement.classList.contains('nav-open'));
    });

    if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false));

    // tap the dimmed page behind the drawer to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) setOpen(false);
    });

    document.querySelectorAll('.nav-overlay a, .nav-overlay .lang-btn').forEach((el) => {
        el.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setOpen(false);
    });

    // never leave the page locked if the window grows past the mobile nav
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1100 && document.documentElement.classList.contains('nav-open')) {
            setOpen(false);
        }
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

// ─── Hero Portrait Scroll Fade ───
function initHeroPortraitFade() {
    const portrait = document.querySelector('.hero-portrait');
    const hero = document.getElementById('hero-container');
    if (!portrait || !hero) return;

    function startFade() {
        gsap.set(portrait, { clearProps: 'opacity,transform' });
        gsap.to(portrait, {
            opacity: 0,
            y: -60,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.3,
            },
        });
    }

    if (hero.classList.contains('is-in')) {
        startFade();
    } else {
        hero.addEventListener('transitionend', function handler(e) {
            if (e.target === hero || e.target.classList?.contains('hero-portrait')) {
                hero.removeEventListener('transitionend', handler);
                startFade();
            }
        });
    }
}

// ─── Hero Portrait: dynamic placement (narrow screens) ───
// On narrow screens the headline spans the full viewport width, so a fixed-size
// photo swallows the title. Instead we measure the headline and slot the photo
// into the column to the right of it: the body may graze the last line, the head
// always stays clear of the text. Recomputed on resize, so it holds at any ratio.
function initHeroPortraitLayout() {
    const portrait = document.querySelector('.hero-portrait');
    const hero = document.getElementById('hero-container');
    const title = document.querySelector('.hero-title');
    const lastWord = document.querySelector('.hero-title em');
    if (!portrait || !hero || !title || !lastWord) return;

    // Geometry of assets/img/Maarten-Photos/portrait-hero-802.webp
    const HEAD_X = 0.2781;  // head left edge, as a fraction of the image width
    const HEAD_R = 0.6471;  // head right edge, as a fraction of the image width
    const HEAD_Y = 0.1252;  // head top edge, as a fraction of the image height
    const ASPECT = 1254 / 802;
    const NARROW = 768;     // must match the mobile breakpoint in main.css

    // Bounding box of an element's own text (ignores block-level children)
    function textBox(el) {
        const range = document.createRange();
        let box = null;
        for (const node of el.childNodes) {
            if (node.nodeType !== Node.TEXT_NODE) continue;
            range.selectNodeContents(node);
            const b = range.getBoundingClientRect();
            if (!b.width && !b.height) continue;
            box = box
                ? { left: Math.min(box.left, b.left), right: Math.max(box.right, b.right),
                    top: Math.min(box.top, b.top), bottom: Math.max(box.bottom, b.bottom) }
                : { left: b.left, right: b.right, top: b.top, bottom: b.bottom };
        }
        return box;
    }

    function layout() {
        const vw = document.documentElement.clientWidth;

        if (vw > NARROW) {
            portrait.style.width = '';
            portrait.style.height = '';
            portrait.style.left = '';
            portrait.style.right = '';
            portrait.style.top = '';
            portrait.style.bottom = '';
            return;
        }

        // The head reaches over the widest line of the headline
        const lastBox = textBox(lastWord);
        if (!lastBox) return;

        let widestRight = lastBox.right;
        title.querySelectorAll('.line .inner').forEach((inner) => {
            const b = textBox(inner);
            if (b) widestRight = Math.max(widestRight, b.right);
        });

        const heroBox = hero.getBoundingClientRect();
        const fs = parseFloat(getComputedStyle(title).fontSize) || 16;

        // The headline is top-aligned on mobile. The head starts level with the
        // "Dutch Quality / Based in Hungary" line and the body grows down from
        // there, bottom flush with the hero so the next section crops the body.
        // offsetTop ignores the entrance transform, so this stays correct even
        // if layout runs mid-animation.
        const meta = document.querySelector('.hero-meta');
        const headTop = meta ? meta.offsetTop : 0;

        // The head's left edge just catches the tail of the widest headline line.
        const headLeft = widestRight - heroBox.left - 0.20 * fs;

        let height = Math.max(0, (heroBox.height - headTop) / (1 - HEAD_Y));
        let width = height / ASPECT;

        // Allow the photo to bleed slightly off the right edge (as on desktop)
        // rather than shrink it and leave a gap under the crop.
        const headSpan = (HEAD_R - HEAD_X) * width;
        const maxHeadRight = vw * 1.08 - heroBox.left;
        if (width > 0 && headLeft + headSpan > maxHeadRight) {
            width = (maxHeadRight - headLeft) / (HEAD_R - HEAD_X);
            height = width * ASPECT;
        }
        if (width <= 0 || height <= 0) return;

        portrait.style.width = width + 'px';
        portrait.style.height = 'auto';
        portrait.style.left = (headLeft - HEAD_X * width) + 'px';
        portrait.style.right = 'auto';
        portrait.style.top = (headTop - HEAD_Y * height) + 'px';
        portrait.style.bottom = 'auto';
    }

    layout();
    window.addEventListener('resize', layout);
    window.addEventListener('load', layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    hero.addEventListener('transitionend', layout);
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
    initNavToggle();
    initAnchors();
    initHeroPortraitFade();
    initHeroPortraitLayout();
    ScrollTrigger.refresh();
    document.fonts.ready.then(() => ScrollTrigger.refresh());
});

window.addEventListener('load', () => ScrollTrigger.refresh());
