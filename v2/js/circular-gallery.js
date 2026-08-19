// ─── Circular Gallery — Horizontal Arc Carousel ───
// Spencer Gabor style: flat horizontal track, cards tilt + drop + fade based on distance from center.
// Drag, wheel, or click to interact. Clicking a card navigates to its blog page.

(function () {
  "use strict";

  // Map each featured category to its blog category page.
  var PAGES = [
    "Blog/TUINVOORJOU/index.html",          // TUINVOORJOU
    "Blog/Camperplaats-Zsana/index.html",   // Camperplaats Zsana
    "Blog/Recent-Bakes/index.html",         // Recent Bakes
    "Blog/Video-Projects/index.html",       // Video Projects
    "Blog/Software-Projects/index.html",    // Software Projects
    "Blog/Personal-Projects/index.html"     // Personal Projects
  ];

  function openPage(idx) {
    var page = PAGES[((idx % PAGES.length) + PAGES.length) % PAGES.length];
    if (page) window.location.href = page;
  }

  var CATEGORIES = [
    {
      title: "TUINVOORJOU",
      subtitle: "Garden planning platform",
      badge: "Client",
      cover: "assets/img/TUINVOORJOU%20Logo.png",
      logo: true,
      projects: [
        {
          title: "Plattegrond Generator",
          desc: "An interactive garden plan generator. Visitors lay out their garden and generate a printable plattegrond in minutes.",
          type: "image",
          media: ["assets/img/Plattegrond%20Generator%20Cover.png"]
        }
      ]
    },
    {
      title: "Camperplaats Zsana",
      subtitle: "Landing page & hero video",
      badge: "Client",
      cover: "assets/img/Camperplaats%20Zsana%20Logo.png",
      logo: true,
      projects: [
        {
          title: "Website",
          desc: "A clean, mobile-first landing page for Camperplaats Zsana \u2014 booking information, site highlights, and everything a visitor needs before arriving.",
          type: "image",
          media: ["assets/img/Camperplaats%20Zsana%20Cover.png"]
        },
        {
          title: "Hero Video",
          desc: "A cinematic drone tour of Camperplaats Zsana. Filmed, edited, and delivered as the hero video for the landing page.",
          type: "video",
          media: ["https://camperplaatszsana.nl/Media/Landing%20Page/videos/Camperplaats%20Zsana%20Landing%20Page%20Video%201080p.mp4"]
        }
      ]
    },
    {
      title: "Recent Bakes",
      subtitle: "Fresh from the oven",
      badge: "Taarten van Maarten",
      cover: "assets/img/Worstenbroodjes%20Cover.jpg",
      projects: [
        {
          title: "Worstenbroodjes",
          desc: "Traditional Dutch worstenbroodjes \u2014 soft, golden dough rolled around seasoned minced meat. Baked fresh and best eaten warm.",
          type: "image",
          media: ["assets/img/Worstenbroodjes%20Cover.jpg"]
        },
        {
          title: "Appeltaart",
          desc: "Dutch appeltaart with a buttery crust and cinnamon apple filling. Made from scratch, available for local delivery in Hungary.",
          type: "image",
          media: ["https://images.unsplash.com/photo-1548324215-9133768e4094?auto=format&fit=crop&q=80&w=1080"]
        }
      ]
    },
    {
      title: "Video Projects",
      subtitle: "Film & cinematography",
      badge: "Film",
      cover: "assets/img/Suzhou%20Center%20Cover.png",
      projects: [
        {
          title: "Suzhou Center",
          desc: "A short film about Suzhou Center \u2014 its architecture, atmosphere, and the rhythm of daily life around it.",
          type: "video",
          media: ["https://youtu.be/WarpgMd6R7o?si=vo6uAEt_5GNIkrU4"]
        },
        {
          title: "Zsana Cover Video",
          desc: "A cinematic drone tour of Camperplaats Zsana. Filmed, edited, and delivered as the hero video for the landing page.",
          type: "video",
          media: ["https://camperplaatszsana.nl/Media/Landing%20Page/videos/Camperplaats%20Zsana%20Landing%20Page%20Video%201080p.mp4"]
        }
      ]
    },
    {
      title: "Software Projects",
      subtitle: "Web development & tools",
      badge: "Software",
      cover: "assets/img/Plattegrond%20Generator%20Cover.png",
      projects: [
        {
          title: "Plattegrond Generator",
          desc: "An interactive garden plan generator. Visitors lay out their garden and generate a printable plattegrond in minutes.",
          type: "image",
          media: ["assets/img/Plattegrond%20Generator%20Cover.png"]
        },
        {
          title: "Camperplaats Zsana",
          desc: "A clean, mobile-first landing page \u2014 booking information, site highlights, and everything a visitor needs before arriving.",
          type: "image",
          media: ["assets/img/Camperplaats%20Zsana%20Cover.png"]
        }
      ]
    },
    {
      title: "Personal Projects",
      subtitle: "A mix of everything",
      badge: "Personal",
      cover: "assets/img/Worstenbroodjes%20Cover.jpg",
      projects: [
        {
          title: "Baking",
          desc: "Traditional Dutch recipes passed down through generations. Worstembroodjes, appeltaart, and more \u2014 made with love in Hungary.",
          type: "image",
          media: ["assets/img/Worstenbroodjes%20Cover.jpg", "https://images.unsplash.com/photo-1548324215-9133768e4094?auto=format&fit=crop&q=80&w=1080"]
        },
        {
          title: "Travel & Photography",
          desc: "Moments captured around the world \u2014 from the canals of Suzhou to the puszta of Hungary.",
          type: "image",
          media: ["assets/img/Suzhou%20Center%20Cover.png", "assets/img/Camperplaats%20Zsana%20Cover.png"]
        }
      ]
    }
  ];

  var N = CATEGORIES.length;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function getSlideWidth(container) {
    var w = container.clientWidth;
    return Math.min(420, Math.max(280, w * 0.38));
  }
  function getGap(container) {
    return Math.max(24, container.clientWidth * 0.06);
  }
  function getCardHeight(container) {
    return Math.min(500, Math.max(320, container.clientHeight * 0.82));
  }

  function createCarousel(container, open) {
    var CLONES = 3;
    var TOTAL = N * CLONES;

    var slideWidth = getSlideWidth(container);
    var gap = getGap(container);
    var cardHeight = getCardHeight(container);
    var step = slideWidth + gap;
    var setWidth = N * step;
    var totalWidth = TOTAL * step;

    var track = document.createElement("div");
    track.className = "arc-track";

    var cards = [];
    for (var c = 0; c < CLONES; c++) {
      for (var i = 0; i < N; i++) {
        var catIdx = i;
        var card = document.createElement("button");
        card.type = "button";
        card.className = "arc-card";
        card.setAttribute("aria-label", CATEGORIES[catIdx].title);
        card.dataset.category = String(catIdx);

        var imgWrap = document.createElement("div");
        imgWrap.className = "arc-card__img";
        if (CATEGORIES[catIdx].logo) {
          imgWrap.classList.add("arc-card__img--logo");
        }
        var img = document.createElement("img");
        img.src = CATEGORIES[catIdx].cover;
        img.alt = CATEGORIES[catIdx].title;
        img.draggable = false;
        img.loading = "eager";
        imgWrap.appendChild(img);

        var label = document.createElement("span");
        label.className = "arc-card__label";
        label.textContent = CATEGORIES[catIdx].title;

        card.appendChild(imgWrap);
        card.appendChild(label);
        track.appendChild(card);

        card.style.width = slideWidth + "px";
        card.style.height = cardHeight + "px";

        card.addEventListener("click", (function (idx) {
          return function () {
            if (dragged) return;
            open(idx);
          };
        })(catIdx));

        cards.push(card);
      }
    }

    container.innerHTML = "";
    track.style.gap = gap + "px";
    container.appendChild(track);

    var scrollX = 0;
    var targetScrollX = 0;
    var isDown = false;
    var startX = 0;
    var startScrollX = 0;
    var dragged = false;
    var velocity = 0;
    var lastX = 0;
    var lastTime = 0;
    var raf = null;
    var snapTimer = null;

    function scheduleSnap() {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(function () {
        snapToNearest();
      }, 120);
    }

    function wrap() {
      if (targetScrollX < setWidth * 0.5) {
        targetScrollX += setWidth;
        scrollX += setWidth;
      } else if (targetScrollX > setWidth * (CLONES - 0.5)) {
        targetScrollX -= setWidth;
        scrollX -= setWidth;
      }
    }

    function snapToNearest() {
      var offset = slideWidth / 2 - container.clientWidth / 2;
      var idx = Math.round((targetScrollX - offset) / step);
      targetScrollX = idx * step + offset;
    }

    function update() {
      scrollX = lerp(scrollX, targetScrollX, 0.1);
      if (Math.abs(scrollX - targetScrollX) < 0.5) scrollX = targetScrollX;

      if (!isDown) wrap();

      track.style.transform = "translateX(" + (-scrollX) + "px)";

      var containerCenter = container.clientWidth / 2;
      var viewCenter = scrollX + containerCenter;

      for (var i = 0; i < cards.length; i++) {
        var cardCenter = i * step + slideWidth / 2;
        var dist = cardCenter - viewCenter;
        var nd = dist / (containerCenter * 0.8);

        var absNd = Math.abs(nd);
        var tilt = clamp(nd * 5, -15, 15);
        var yOff = Math.cos(clamp(nd, -1, 1) * Math.PI * 0.5) * -45 + 45;
        var opa = clamp(1 - absNd * 0.6, 0.25, 1);
        var sc = clamp(1 - absNd * 0.1, 0.8, 1);

        cards[i].style.transform = "translateY(" + yOff + "px) rotate(" + tilt + "deg) scale(" + sc + ")";
        cards[i].style.opacity = opa;
      }

      raf = requestAnimationFrame(update);
    }

    function onPointerDown(e) {
      isDown = true;
      dragged = false;
      startX = "touches" in e ? e.touches[0].clientX : e.clientX;
      startScrollX = targetScrollX;
      lastX = startX;
      lastTime = Date.now();
      velocity = 0;
      container.style.cursor = "grabbing";
    }
    function onPointerMove(e) {
      if (!isDown) return;
      var x = "touches" in e ? e.touches[0].clientX : e.clientX;
      var dx = startX - x;
      if (Math.abs(dx) > 5) dragged = true;
      targetScrollX = startScrollX + dx;
      var now = Date.now();
      var dt = now - lastTime;
      if (dt > 0) velocity = (lastX - x) / dt;
      lastX = x;
      lastTime = now;
    }
    function onPointerUp() {
      if (!isDown) return;
      isDown = false;
      container.style.cursor = "grab";
      if (dragged) {
        targetScrollX += velocity * 200;
        snapToNearest();
        wrap();
      }
    }
    function onWheel(e) {
      var rect = container.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var delta = e.deltaY || e.wheelDelta || e.detail;
      if (!delta) return;
      targetScrollX += delta * 0.8;
      scheduleSnap();
      e.preventDefault();
    }
    function onResize() {
      var oldStep = step;
      slideWidth = getSlideWidth(container);
      gap = getGap(container);
      cardHeight = getCardHeight(container);
      step = slideWidth + gap;
      setWidth = N * step;
      totalWidth = TOTAL * step;
      var ratio = oldStep > 0 ? step / oldStep : 1;
      targetScrollX = targetScrollX * ratio + (slideWidth / 2 - container.clientWidth / 2) * (1 - ratio);
      scrollX = targetScrollX;
      track.style.gap = gap + "px";
      for (var i = 0; i < cards.length; i++) {
        cards[i].style.width = slideWidth + "px";
        cards[i].style.height = cardHeight + "px";
      }
    }

    container.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    container.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);
    container.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    targetScrollX = Math.floor(CLONES / 2) * setWidth + slideWidth / 2 - container.clientWidth / 2;
    scrollX = targetScrollX;
    update();

    return function destroy() {
      cancelAnimationFrame(raf);
      clearTimeout(snapTimer);
      container.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      container.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      container.innerHTML = "";
    };
  }

  /* ─── Fallback strip ─── */
  function renderFallback(container) {
    container.classList.add("circular-gallery__fallback-wrap");
    var track = document.createElement("div");
    track.className = "circular-gallery__fallback";
    CATEGORIES.forEach(function (item, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "circular-gallery__card";
      btn.setAttribute("aria-label", item.title);
      btn.style.backgroundImage = "url(" + item.cover + ")";
      btn.addEventListener("click", function () { openPage(i); });
      track.appendChild(btn);
    });
    container.appendChild(track);
    var isDown = false, startX = 0, startLeft = 0;
    track.addEventListener("mousedown", function (e) { isDown = true; startX = e.clientX; startLeft = track.scrollLeft; track.classList.add("is-dragging"); });
    window.addEventListener("mousemove", function (e) { if (!isDown) return; track.scrollLeft = startLeft - (e.clientX - startX); });
    window.addEventListener("mouseup", function () { isDown = false; track.classList.remove("is-dragging"); });
    track.addEventListener("wheel", function (e) {
      if (e.deltaX && Math.abs(e.deltaX) > Math.abs(e.deltaY)) { track.scrollLeft += e.deltaX; }
      else { track.scrollLeft += e.deltaY; }
      e.preventDefault();
    }, { passive: false });
  }

  /* ─── Boot ─── */
  function init() {
    var container = document.getElementById("circular-gallery");
    if (!container) return;
    createCarousel(container, openPage);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
