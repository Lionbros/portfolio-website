// ─── Software Solutions: hero entrance, particle canvas ───
// Vanilla JS, no dependencies. Particle field + grid lines are hand-built
// (not an embed), so there is nothing external to break.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── Hero entrance (same is-in pattern as index.html) ─── */
  function initHeroEntrance() {
    var hero = document.getElementById("soft-hero");
    if (!hero) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add("is-in");
      });
    });
  }

  /* ─── Particle canvas: slow rising dots, matte warm white, no glow ─── */
  function initParticles() {
    var canvas = document.getElementById("soft-particles");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var particles = [];
    var raf = 0;
    var running = false;

    function setSize() {
      var r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width));
      canvas.height = Math.max(1, Math.floor(r.height));
    }

    function make() {
      var fadeDelay = Math.random() * 600 + 100;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() / 5 + 0.1,
        opacity: 0.7,
        fadeStart: Date.now() + fadeDelay,
        fadingOut: false,
        w: 0.6 + Math.random() * 0.8,
        h: 1 + Math.random() * 2
      };
    }

    function reset(p) {
      var fresh = make();
      p.x = fresh.x;
      p.y = fresh.y;
      p.speed = fresh.speed;
      p.opacity = 0.7;
      p.fadeStart = fresh.fadeStart;
      p.fadingOut = false;
    }

    function build() {
      particles = [];
      var n = Math.floor((canvas.width * canvas.height) / 7000);
      n = Math.max(20, Math.min(160, n));
      for (var i = 0; i < n; i++) particles.push(make());
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var now = Date.now();
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y -= p.speed;
        if (p.y < -4) reset(p);
        if (!p.fadingOut && now > p.fadeStart) p.fadingOut = true;
        if (p.fadingOut) {
          p.opacity -= 0.008;
          if (p.opacity <= 0) reset(p);
        }
        ctx.fillStyle = "rgba(244, 243, 239, " + Math.max(0, p.opacity).toFixed(3) + ")";
        ctx.fillRect(p.x, p.y, p.w, p.h);
      }
      raf = requestAnimationFrame(draw);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      raf = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    // Only animate while the hero is actually on screen.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) start();
        else stop();
      }).observe(canvas);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (!reduceMotion) start();
    });

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        setSize();
        build();
      }, 150);
    });

    setSize();
    build();
    start();
  }

  /* ─── Intro carousel: websites ↔ web tools, text swaps with the devices ─── */
  function initIntroCarousel() {
    var region = document.querySelector(".soft-intro");
    if (!region) return;
    var slides = region.querySelectorAll("[data-slide]");
    if (slides.length < 2) return;
    var dots = region.querySelectorAll("[data-goto]");

    var count = 2;
    var idx = 0;
    var timer = null;
    var inView = false;
    var pageVisible = !document.hidden;

    function show(next) {
      idx = next;
      for (var i = 0; i < slides.length; i++) {
        var on = Number(slides[i].getAttribute("data-slide")) === idx;
        slides[i].classList.toggle("is-active", on);
        slides[i].setAttribute("aria-hidden", on ? "false" : "true");
      }
      for (var d = 0; d < dots.length; d++) {
        var active = Number(dots[d].getAttribute("data-goto")) === idx;
        dots[d].classList.toggle("is-active", active);
        if (active) dots[d].setAttribute("aria-current", "true");
        else dots[d].removeAttribute("aria-current");
      }
    }

    function restartFill() {
      var el = region.querySelector(".soft-dot.is-active .soft-dot__fill");
      if (!el) return;
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    }

    function sync() {
      var shouldRun = !reduceMotion && inView && pageVisible;
      region.classList.toggle("is-ticking", shouldRun);
      if (shouldRun && !timer) {
        timer = setInterval(function () {
          show((idx + 1) % count);
        }, 12000);
        restartFill();
      } else if (!shouldRun && timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function goTo(next) {
      show(next);
      if (timer) { clearInterval(timer); timer = null; }
      sync();
    }

    for (var g = 0; g < dots.length; g++) {
      (function (dot) {
        dot.addEventListener("click", function () {
          goTo(Number(dot.getAttribute("data-goto")));
        });
      })(dots[g]);
    }

    document.addEventListener("visibilitychange", function () {
      pageVisible = !document.hidden;
      sync();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        sync();
      }).observe(region);
    } else {
      inView = true;
      sync();
    }

    sync();
  }

  /* ─── Services + guarantees: rows reveal on scroll ───
     Own observer (not the shared one in main.js) so the section still
     works if the GSAP CDN is unreachable. The copy is visible by default:
     only elements still below the fold are "armed" (hidden) so the
     entrance can play, and the arming is dropped the moment the row
     arrives. A missing or broken script therefore hides nothing. */
  function initSectionReveal(sectionSel, targetSel) {
    var section = document.querySelector(sectionSel);
    if (!section) return;

    var targets = section.querySelectorAll(targetSel);
    var i;

    // Arm only what has not been seen yet.
    var fold = (window.innerHeight || 0) * 0.92;
    for (i = 0; i < targets.length; i++) {
      if (targets[i].getBoundingClientRect().top > fold) {
        targets[i].classList.add("is-armed");
      }
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      for (i = 0; i < targets.length; i++) targets[i].classList.add("is-in");
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.remove("is-armed");
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    for (i = 0; i < targets.length; i++) observer.observe(targets[i]);
  }

  /* ─── Read more: reveal a service's second paragraph ───
     The button flips aria-expanded and an .is-open class; the height
     animation is CSS (grid-template-rows). The label swaps between two
     i18n keys so it follows the EN/NL/HU toggle like everything else. */
  function initSvcReadMore() {
    var btns = document.querySelectorAll(".soft-svc__more");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        var open = this.getAttribute("aria-expanded") === "true";
        this.setAttribute("aria-expanded", String(!open));
        this.setAttribute("data-i18n", open ? "soft.svc.more" : "soft.svc.less");
        var panel = document.getElementById(this.getAttribute("aria-controls"));
        if (panel) panel.classList.toggle("is-open", !open);
        if (window.I18N_apply) window.I18N_apply(window.I18N_getLang());
      });
    }
  }

  /* ─── Custom service dropdown ───
     Mirrors videography.html's package dropdown: the real <select> is
     visually hidden but still feeds the form submission; the toggle
     button and listbox drive it. Keyboard support (arrows, Enter,
     Escape) and outside-click close behave the same. A MutationObserver
     re-syncs the toggle label when the i18n layer rewrites the option
     texts, so it follows the EN/NL/HU toggle. */
  function initSoftDd() {
    var dropdown = document.getElementById("service-select");
    var ddToggle = document.getElementById("serviceDdToggle");
    var ddList = document.getElementById("serviceDdList");
    var ddLabel = document.getElementById("serviceDdLabel");
    if (!dropdown || !ddToggle || !ddList || !ddLabel) return;
    function items() {
      return Array.prototype.slice.call(ddList.querySelectorAll('[role="option"]'));
    }
    function syncUi() {
      var label = "";
      items().forEach(function (it) {
        var on = it.getAttribute("data-value") === dropdown.value;
        it.setAttribute("aria-selected", on ? "true" : "false");
        if (on) label = it.textContent;
      });
      ddLabel.textContent = label || dropdown.value;
    }
    function setOpen(open) {
      ddList.hidden = !open;
      ddToggle.classList.toggle("is-open", open);
      ddToggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) items().forEach(function (it) { it.classList.remove("is-active"); });
    }
    ddToggle.addEventListener("click", function () { setOpen(ddList.hidden); });
    items().forEach(function (it) {
      it.addEventListener("click", function () {
        setOpen(false);
        dropdown.value = it.getAttribute("data-value");
        syncUi();
      });
    });
    document.addEventListener("click", function (e) {
      if (!ddList.hidden && !e.target.closest(".soft-dd")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !ddList.hidden) { setOpen(false); ddToggle.focus(); }
    });
    ddToggle.addEventListener("keydown", function (e) {
      var list = items();
      var idx = 0;
      for (var i = 0; i < list.length; i++) {
        if (list[i].getAttribute("data-value") === dropdown.value) idx = i;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (ddList.hidden) { setOpen(true); return; }
        idx = (idx + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
        list.forEach(function (it) { it.classList.remove("is-active"); });
        list[idx].classList.add("is-active");
        list[idx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" || e.key === " ") {
        if (!ddList.hidden) {
          e.preventDefault();
          var active = ddList.querySelector(".is-active");
          setOpen(false);
          if (active) {
            dropdown.value = active.getAttribute("data-value");
            syncUi();
          }
        }
      }
    });
    if (window.MutationObserver) {
      /* i18n rewrites the option texts by replacing their text nodes, so
         watch childList as well as characterData */
      new MutationObserver(syncUi).observe(ddList, { childList: true, characterData: true, subtree: true });
    }
    syncUi();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeroEntrance();
    initParticles();
    initIntroCarousel();
    initSectionReveal(".soft-svc", ".soft-svc__head, .soft-svc__row");
    initSectionReveal(".soft-gua", ".soft-gua__head, .soft-gua__item");
    initSectionReveal(".soft-mnt", ".soft-mnt__head, .soft-mnt__row, .soft-mnt__aside");
    initSectionReveal(".soft-work", ".soft-work__head, .soft-work__card, .soft-work__cta");
    initSectionReveal(".soft-faq", ".soft-faq__head, .soft-faq__item, .soft-faq__foot");
    initSectionReveal(".soft-contact", ".contact-info, .contact-form");
    initSvcReadMore();
    initSoftDd();
  });
})();
