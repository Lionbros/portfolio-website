/* Under-construction page behaviour:
   mobile drawer, back-to-top and the notify-me form.
   Kept separate from main.js so this page needs no GSAP. */
(function () {
    'use strict';

    /* ─── mobile drawer (same behaviour as the rest of the site) ─── */
    var burger = document.querySelector('.nav-burger');
    var overlay = document.querySelector('.nav-overlay');
    var panel = overlay ? overlay.querySelector('.nav-overlay__inner') : null;

    if (panel && !panel.querySelector('.nav-drawer__head')) {
        var head = document.createElement('div');
        head.className = 'nav-drawer__head';
        head.innerHTML = '<span>Menu</span>' +
            '<button type="button" class="nav-drawer__close" aria-label="Close menu">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
            '<path d="M6 6l12 12M18 6L6 18"/></svg></button>';
        panel.insertBefore(head, panel.firstChild);
    }
    var closeBtn = overlay ? overlay.querySelector('.nav-drawer__close') : null;

    function setOpen(open) {
        if (!overlay) return;
        var wasOpen = document.documentElement.classList.contains('nav-open');
        document.documentElement.classList.toggle('nav-open', open);
        if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open && closeBtn) setTimeout(function () { closeBtn.focus({ preventScroll: true }); }, 120);
        else if (!open && wasOpen && burger) burger.focus({ preventScroll: true });
    }

    if (burger) burger.addEventListener('click', function () {
        setOpen(!document.documentElement.classList.contains('nav-open'));
    });
    if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
    if (overlay) overlay.addEventListener('click', function (e) {
        if (e.target === overlay) setOpen(false);
    });
    document.querySelectorAll('.nav-overlay a, .nav-overlay .lang-btn').forEach(function (el) {
        el.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function () {
        if (window.innerWidth > 1100) setOpen(false);
    });

    /* ─── back to top ─── */
    var toTop = document.getElementById('back-to-top');
    if (toTop) toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ─── notify form ─── */
    var form = document.querySelector('.uc-form');
    if (!form) return;

    var input = form.querySelector('input[type="email"]');
    var note = document.getElementById('uc-note');
    var success = document.getElementById('uc-success');

    function showNote(message, isError) {
        if (!note) return;
        note.textContent = message;
        note.classList.toggle('is-error', !!isError);
        note.hidden = false;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = (input && input.value ? input.value : '').trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showNote('Please enter a valid email address.', true);
            if (input) input.focus();
            return;
        }

        var payload = new URLSearchParams();
        payload.set('form-name', form.getAttribute('name') || 'uc-notify');
        payload.set('email', email);

        fetch(window.location.pathname, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload.toString()
        }).then(function (res) {
            if (!res.ok) throw new Error('status ' + res.status);
            form.hidden = true;
            if (success) success.hidden = false;
        }).catch(function () {
            /* no form backend here — fall back to a pre-filled email draft */
            window.location.href = 'mailto:hello@maartenvanderleeuw.com' +
                '?subject=' + encodeURIComponent('Notify me when this page is live') +
                '&body=' + encodeURIComponent('Please let me know when this page is live.\n\nEmail: ' + email);
            showNote('Your email app should open. If it does not, write to hello@maartenvanderleeuw.com.', false);
        });
    });
})();
