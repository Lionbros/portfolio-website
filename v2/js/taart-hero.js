/* ═══════════════════════════════════════════
   TAART HERO — autoplay arched title + scroll-bound bake turntable.
   Title "Taarten van Maarten" reveals once on load (outside-in).
   Scroll drives rotation + crossfade pie → crumb → cookie only;
   sand, arch and heading stay static. A bottom-anchored valley dip
   crosses the lower pie, with the heading under it.
   ═══════════════════════════════════════════ */
(function () {
    'use strict';

    var TEXT = 'Taarten van Maarten';
    var SVGNS = 'http://www.w3.org/2000/svg';

    var track = document.getElementById('taartTrack');
    if (!track) return;

    var arch = document.getElementById('taartArch');
    var charLayer = document.getElementById('taartChars');
    var spinner = document.getElementById('taartSpinner');
    var heroArt = document.getElementById('taartHeroArt');
    var stage = document.getElementById('taartStage');
    var caption = document.querySelector('.taart-caption');
    var valley = document.getElementById('taartValley');
    var tail = document.getElementById('taartValleyTail');
    var wingL = document.querySelector('.taart-wing--left');
    var wingR = document.querySelector('.taart-wing--right');
    var bakes = [
        document.getElementById('taartBake1'),
        document.getElementById('taartBake2'),
        document.getElementById('taartBake3')
    ];
    if (!arch || !charLayer || !spinner) return;
    bakes = bakes.filter(Boolean);
    if (!bakes.length) return;

    function clamp01(v) { return Math.min(1, Math.max(0, v)); }

    /* ---- lay each character along the arch, sized to fit ---- */
    var chars = [];
    function layout() {
        while (charLayer.firstChild) charLayer.removeChild(charLayer.firstChild);
        chars = [];
        var meas = [];
        var total = 0;
        var tracking = 17;
        Array.from(TEXT).forEach(function (ch) {
            var t = document.createElementNS(SVGNS, 'text');
            t.setAttribute('font-size', '100');
            t.textContent = ch === ' ' ? '\u00A0' : ch;
            charLayer.appendChild(t);
            var w = 0;
            try { w = t.getComputedTextLength(); } catch (e) { w = 60; }
            meas.push(w);
            total += w;
        });
        total += tracking * (TEXT.length - 1);
        /* arch geometry, solved from the pie: square bake photo shown at
           72% of the 1000-unit box (x 140..860, bottom at 750).
           Pie circle: center (500, 391), radius 330.
           Big badge ring: R = 350 + fs, wide SPAN so large type fits. */
        var SPAN = 3.1;
        /* solve the font size so the text exactly fills the arc:
           total·fs/100 = (350+fs)·SPAN  →  fs = 350·SPAN / (total/100 − SPAN) */
        var fs = (350 * SPAN) / Math.max(0.1, total / 100 - SPAN);
        fs = Math.min(160, Math.max(60, fs));
        var R = 350 + fs;
        var cx = 500, cy = 391;
        var arcLen = R * SPAN;
        var startAngle = -Math.PI / 2 - SPAN / 2;
        var dist = 0;
        var nodes = Array.prototype.slice.call(charLayer.childNodes);
        var mid = Math.max(TEXT.length - 1, 1) / 2;
        nodes.forEach(function (t, i) {
            var w = meas[i] * (fs / 100);
            var center = dist + w / 2;
            dist += w + tracking * (fs / 100);
            var a = startAngle + (center / arcLen) * SPAN;
            var bx = cx + R * Math.cos(a);
            var by = cy + R * Math.sin(a);
            var rot = a * 180 / Math.PI + 90;
            t.setAttribute('font-size', fs.toFixed(1));
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('transform', 'translate(' + bx.toFixed(1) + ',' + by.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')');
            var fromCenter = mid <= 0 ? 0 : Math.abs(i - mid) / mid;
            chars.push({
                el: t, bx: bx, by: by, rot: rot, w: w,
                fromCenter: fromCenter,
                side: i < TEXT.length / 2 ? 1 : -1
            });
        });
        fitRing();
    }

    /* Keep the arch ring clear of the screen edges. The side letters
       overshoot the 1000-unit box (the svg overflows visible), which is
       harmless on desktop but touches the phone edges. Measure the real
       ink (getBBox) and uniformly shrink ring + type about the pie
       center until MIN_EDGE px of screen margin remains on both sides.
       No-op wherever margins are already wide. */
    var MIN_EDGE = 10;
    function fitRing() {
        if (!heroArt) return;
        var pass, k;
        for (pass = 0; pass < 2; pass++) {
            var rect = heroArt.getBoundingClientRect();
            if (!rect.width) return;
            var vw = window.innerWidth || 0;
            var unit = rect.width / 1000;
            var bb;
            try { bb = charLayer.getBBox(); } catch (e) { return; }
            var overL = (0 - bb.x) * unit;
            var overR = (bb.x + bb.width - 1000) * unit;
            var allowL = Math.max(0, rect.left) - MIN_EDGE;
            var allowR = Math.max(0, vw - rect.right) - MIN_EDGE;
            var s = 1;
            if (overL > allowL) s = Math.min(s, allowL <= 0 ? 0.7 : allowL / overL);
            if (overR > allowR) s = Math.min(s, allowR <= 0 ? 0.7 : allowR / overR);
            if (s >= 0.999) return;
            s = Math.max(0.6, s);
            for (k = 0; k < chars.length; k++) {
                var c = chars[k];
                c.bx = 500 + (c.bx - 500) * s;
                c.by = 391 + (c.by - 391) * s;
                var cur = parseFloat(c.el.getAttribute('font-size')) || 100;
                c.el.setAttribute('font-size', (cur * s).toFixed(1));
            }
        }
    }

    function charT(tp, fromCenter) {
        var start = fromCenter * 0.55;
        var end = Math.min(1, start + 0.38);
        return clamp01((tp - start) / Math.max(0.001, end - start));
    }

    /* Title only — driven by autoplay time, never scroll. */
    function paintTitle(tp) {
        for (var i = 0; i < chars.length; i++) {
            var t = charT(tp, chars[i].fromCenter);
            var y = (1 - t) * (18 + chars[i].fromCenter * 24);
            var x = (1 - t) * (chars[i].fromCenter > 0.01 ? chars[i].fromCenter * 16 * chars[i].side : 0);
            chars[i].el.style.opacity = t.toFixed(3);
            chars[i].el.setAttribute('transform',
                'translate(' + (chars[i].bx + x).toFixed(1) + ',' + (chars[i].by + y).toFixed(1) + ') rotate(' + chars[i].rot.toFixed(1) + ')');
        }
    }

    function setBake(el, opacity) {
        var o = clamp01(opacity);
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o <= 0.01 ? 'hidden' : 'visible';
    }

    /* ---- collision-box fit: glue the caption under the pie ----
       The bakes are round and fill their square box, and the spinner is
       bottom-anchored in the art — so the painted pie bottom equals the
       art's layout bottom edge (rotation-proof: a circle's silhouette
       never changes when it spins, and offset* values ignore the
       spinner's transform). The caption is pinned GAP px below that
       edge. Text-vs-houses collision boxes keep the caption out of the
       canal-house silhouettes: wings shorten first, otherwise the
       caption narrows into the clear zone so lines wrap instead of
       touch. On short screens the art shrinks by the exact overflow
       (direct solve, no magic loop count), with caption type-scale as
       the fallback stage — the button can never be clipped off-screen.
       The valley dip is glued to the pie the same way (dip center =
       pie bottom − DIP_DROP, valley capped at VALLEY_CAP so 1080p is
       pixel-identical), and the cream tail absorbs the rest down to the
       stage bottom: text always sits on cream, sand bands are
       structurally impossible. Runs on load/resize only — scrolling
       still only spins the turntable. */
    var GAP = 10;
    var SAFE = 12;
    var MIN_ART = 150;
    var VALLEY_CAP = 504;
    var DIP_DROP = 48;
    var DIP_RATIO = 0.244;
    var MIN_WING_H = 70;
    var BREATHE = 8;
    /* Painted content box of a wing in frame coordinates. The svg uses
       meet scaling, so the viewBox is mapped through the real
       letterbox (conservative: full viewBox incl. transparent sky). */
    function wingInk(wing, fr) {
        var r = wing.getBoundingClientRect();
        if (!r.width || !r.height) return null;
        var vb = wing.querySelector('svg').viewBox.baseVal;
        if (!vb || !vb.width || !vb.height) return null;
        var s = Math.min(r.width / vb.width, r.height / vb.height);
        var cw = s * vb.width, ch = s * vb.height;
        var right = wing.classList.contains('taart-wing--right');
        var x = r.left + (right ? r.width - cw : 0);
        return {
            left: x - fr.left,
            right: x + cw - fr.left,
            top: r.top + (r.height - ch) - fr.top,
            bottom: r.top + r.height - fr.top
        };
    }
    function hit(a, b, pad) {
        return !(a.right + pad <= b.left || b.right + pad <= a.left ||
                 a.bottom + pad <= b.top || b.bottom + pad <= a.top);
    }
    /* Union of the caption's real text LINES in frame coordinates, via
       Range rects (one box per wrapped line — block boxes would span
       the full width and false-trigger everywhere). Range rects include
       reveal-animation transforms, so callers must run settled(). */
    function lineInk(fr) {
        var els = [caption.querySelector('.taart-heroH2'),
                   caption.querySelector('.taart-sub p'),
                   caption.querySelector('.taart-sub .menu-order')].filter(Boolean);
        var out = [], e, w, n, r, j, list, b;
        for (e = 0; e < els.length; e++) {
            w = document.createTreeWalker(els[e], NodeFilter.SHOW_TEXT);
            while ((n = w.nextNode())) {
                if (!n.textContent.trim()) continue;
                r = document.createRange();
                r.selectNodeContents(n);
                list = r.getClientRects();
                for (j = 0; j < list.length; j++) {
                    b = list[j];
                    if (b.width > 0 && b.height > 0) {
                        out.push({ left: b.left - fr.left, top: b.top - fr.top,
                                   right: b.right - fr.left, bottom: b.bottom - fr.top });
                    }
                }
            }
        }
        return out;
    }
    /* First paint may run mid-reveal (translateY offsets would skew ink
       measurement). Defer while transforms are live, but never lock out:
       after 5s proceed anyway. */
    var liveSince = 0;
    function transformsLive() {
        var els = [caption.querySelector('.taart-heroH2'),
                   caption.querySelector('.taart-sub p'),
                   caption.querySelector('.taart-sub .menu-order')];
        for (var i = 0; i < els.length; i++) {
            if (!els[i]) continue;
            var t = getComputedStyle(els[i]).transform;
            if (t && t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)') return true;
        }
        return false;
    }
    function fitHero() {
        if (!heroArt || !caption || !stage) return;
        heroArt.style.width = '';
        caption.style.top = '';
        caption.style.bottom = '';
        caption.style.zoom = '';
        caption.style.maxWidth = '';
        if (wingL) wingL.style.height = '';
        if (wingR) wingR.style.height = '';
        if (valley) { valley.style.top = ''; valley.style.bottom = ''; valley.style.height = ''; }
        if (tail) tail.style.top = '';
        var H = stage.clientHeight;
        if (!H) return;
        /* Range ink includes reveal transforms — wait them out (bounded). */
        if (transformsLive()) {
            var nowMs = Date.now();
            if (!liveSince) liveSince = nowMs;
            if (nowMs - liveSince < 5000) { setTimeout(fitHero, 150); return; }
        }
        liveSince = 0;
        var frame = document.querySelector('.taart-frame');
        /* Caption/art are measured in frame coordinates, but the budget
           (stage height) lives in stage coordinates — frame starts at
           the stage padding-top, so translate. */
        var frameTop = frame ? frame.offsetTop : 0;
        var pass, settled = false, artW, pieB, capH;
        for (pass = 0; pass < 3 && !settled; pass++) {
            settled = true;
            artW = heroArt.offsetWidth;
            pieB = heroArt.offsetTop + heroArt.offsetHeight;
            capH = caption.offsetHeight;
            if (!artW || !capH) return;
            caption.style.bottom = 'auto';
            caption.style.top = (pieB + GAP) + 'px';
            /* text-vs-houses collision: wrap instead of touch. Stage 1
               narrows the caption into the clear zone so lines wrap;
               stage 2 (clear zone too small) shortens the wings below
               the caption instead. */
            if (frame && wingL && wingR) {
                var fr = frame.getBoundingClientRect();
                var lines = lineInk(fr);
                var wl = wingInk(wingL, fr), wr = wingInk(wingR, fr);
                var touch = false, li;
                if (wl && wr) {
                    for (li = 0; li < lines.length; li++) {
                        if (hit(lines[li], wl, 0) || hit(lines[li], wr, 0)) { touch = true; break; }
                    }
                }
                if (touch) {
                        /* stage 1: narrow the caption into the clear zone
                           so lines wrap instead of touch. */
                        var clear = wr.left - wl.right - 24;
                        if (clear >= 300) {
                            caption.style.maxWidth = Math.floor(clear) + 'px';
                            capH = caption.offsetHeight;
                        } else {
                            /* stage 2: clear zone too small — shorten the
                               wings below the caption instead (stage
                               coords: add frameTop). */
                            var capBottom = frameTop + caption.offsetTop + caption.offsetHeight;
                            var shortH = Math.floor(H - capBottom - BREATHE);
                            wingL.style.height = Math.max(MIN_WING_H, shortH) + 'px';
                            wingR.style.height = Math.max(MIN_WING_H, shortH) + 'px';
                        }
                        settled = false;
                    }
            }
            /* vertical fit: direct solve, then type scale as fallback.
               Budget translated to frame coordinates (see frameTop). */
            var budget = (H - SAFE - frameTop);
            var overflow = (pieB + GAP + capH) - budget;
            if (overflow > 0) {
                artW = Math.max(MIN_ART, artW - Math.ceil(overflow / 0.76) - 2);
                heroArt.style.width = artW + 'px';
                pieB = heroArt.offsetTop + heroArt.offsetHeight;
                capH = caption.offsetHeight;
                settled = false;
            }
            var over2 = (pieB + GAP + capH) - budget;
            if (over2 > 0 && capH > 0) {
                caption.style.zoom = Math.max(0.72, (budget - pieB - GAP) / capH).toFixed(3);
                capH = caption.offsetHeight;
                settled = false;
            }
        }
        pieB = heroArt.offsetTop + heroArt.offsetHeight;
        caption.style.bottom = 'auto';
        caption.style.top = (pieB + GAP) + 'px';
        /* valley dip glued to the pie; tail fills valley bottom to
           stage bottom. Coordinates are frame-relative for caption/art
           but stage-relative here — frame starts at stage padding-top,
           so translate. (Stage has no border; offsetParent chain is
           exact for absolutely positioned children.) */
        if (valley && tail) {
            var frameTop = heroArt.offsetParent === stage ? 0 : heroArt.offsetParent.offsetTop;
            var pieBstage = frameTop + pieB;
            var Hv = VALLEY_CAP;
            var vTop = pieBstage - DIP_DROP - DIP_RATIO * Hv;
            if (vTop + Hv > H) Hv = Math.max(160, H - vTop);
            vTop = pieBstage - DIP_DROP - DIP_RATIO * Hv;
            valley.style.bottom = 'auto';
            valley.style.top = Math.round(vTop) + 'px';
            valley.style.height = Math.round(Hv) + 'px';
            tail.style.top = Math.round(vTop + Hv) + 'px';
        }
    }

    /* Scroll only — rotation + crossfade. Nothing else moves. */
    function applyScroll(p) {
        spinner.style.transform = 'translateX(-50%) rotate(' + (p * 360).toFixed(2) + 'deg)';
        var o1 = 1 - clamp01((p - 0.32) / 0.16);
        var o2 = clamp01((p - 0.32) / 0.16) * (1 - clamp01((p - 0.62) / 0.16));
        var o3 = clamp01((p - 0.62) / 0.16);
        if (bakes[0]) setBake(bakes[0], o1);
        if (bakes[1]) setBake(bakes[1], o2);
        if (bakes[2]) setBake(bakes[2], o3);
    }

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
        layout();
        fitHero();
        if (stage) stage.classList.add('is-fitted');
        paintTitle(1);
        applyScroll(1);
        return;
    }

    function progress() {
        var vh = window.innerHeight || 1;
        var total = track.offsetHeight - vh;
        if (total <= 0) return 1;
        return clamp01(-track.getBoundingClientRect().top / total);
    }

    /* Boot: compose everything while the stage is still hidden, then
       fade in once — no load-time jumping. The arch is painted
       directly in its final position (no intro animation).
       Waits for real font metrics; 2.5s fallback if fonts hang. */
    var booted = false;
    function boot() {
        if (booted) return;
        booted = true;
        layout();
        fitHero();
        if (stage) stage.classList.add('is-fitted');
        paintTitle(1);
        target = progress();
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(boot);
    }
    setTimeout(boot, 2500);

    /* Smooth scroll follower for spin + swaps. */
    var target = progress();
    var current = target;
    var ticking = false;
    applyScroll(current);

    function loop() {
        var delta = target - current;
        current += Math.abs(delta) > 0.35 ? delta * 0.22 : delta * 0.14;
        if (Math.abs(delta) < 0.0008) current = target;
        applyScroll(current);
        requestAnimationFrame(loop);
    }
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            ticking = false;
            target = progress();
        });
    }

    requestAnimationFrame(loop);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', fitHero);
    /* Refit when reveal classes land (class-only: fitHero never touches
       class, so this cannot loop). Catches late font/observer timing. */
    if ('MutationObserver' in window && caption) {
        var moT = null;
        new MutationObserver(function () {
            if (moT) clearTimeout(moT);
            moT = setTimeout(fitHero, 120);
        }).observe(caption, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }
    var resizeTimer = null;
    window.addEventListener('resize', function () {
        layout();
        paintTitle(1);
        target = progress();
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { layout(); paintTitle(1); fitHero(); }, 150);
    });
})();
