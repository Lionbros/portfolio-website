// ─── Soft hero FX: dotted-matrix story (hand-built, no embeds) ───
// A laptop draws itself in dots, its screen scrolls through a website,
// Start → Run → End nodes and a booking screen, the lid closes, and
// dotted words cycle forever. Technique: each frame the scene is drawn
// as plain vectors on a tiny offscreen canvas, sampled on a grid, and
// repainted as dots sized by brightness — the dotted-poster look.
//
// Vanilla JS, no dependencies. Pauses off-screen and on hidden tabs.
// prefers-reduced-motion: one static laptop+website frame, no timers.

(function () {
  "use strict";

  /* ─── Grid + timing ─── */
  var OW = 120;          // scene size in logical units
  var OH = 100;
  var SS = 3;            // supersample the offscreen scene (crisp text/shapes)
  var BW = OW * SS;      // offscreen bitmap width  (360)
  var BH = OH * SS;      // offscreen bitmap height (420)
  var PITCH = 3.6;       // target device px between dot centres
  var RATIO = 0.54;      // dot radius as a fraction of the on-screen cell

  // Display-derived (set by sizeCanvas): dot grid + radius in device px.
  var COLS = 160, ROWS = 187, cellX = 4, cellY = 4, MAX_R = 1.7, DOT_MIN = 0.3;
  var zoom = 1; // scene scale (narrow screens scale up to keep in-screen text readable; wide screens scale down so the bigger canvas only enlarges the resting words)

  // Pointer interaction: dots part around the cursor on springs and warm
  // toward the accent as they leave home (device px, sized by canvas).
  var st = null;             // per-dot spring state: ox, oy, vx, vy
  var px = -1e5, py = -1e5;  // pointer in canvas device px
  var pointerIn = false;
  var R_PUSH = 92, R_PUSH2 = R_PUSH * R_PUSH, WARM = 30;
  var PUSH = 2.4, STIFF = 0.05, DAMP = 0.84;

  // Story timeline (ms)
  var T_REVEAL = 2200;   // laptop draws in, top-to-bottom wipe
  var T_SCROLL1 = 3600;  // begin scroll to nodes
  var T_SCROLL1_END = 4700;
  var T_PULSE = 4700;    // orange pulse travels the connectors
  var T_PULSE_END = 6300;
  var T_SCROLL2 = 6800;  // begin scroll to booking
  var T_SCROLL2_END = 7900;
  var T_CLOSE = 9800;    // lid closes (screen squashes into base)
  var T_CLOSE_END = 10900;
  var T_BASE_OUT = 11400; // base bar fades, words begin
  var WORD_HOLD = 2000;
  var WORD_FADE = 450;

  // Laptop geometry (logical scene units)
  var SCR = { x: 16, y: 15, w: 88, h: 64 };
  var INNER = { x: 19, y: 18, w: 82, h: 58 };
  var PAGE = 58; // screen content page height (= INNER.h)

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function lang() {
    if (typeof window.I18N_getLang === "function") return window.I18N_getLang();
    return "en";
  }
  function T(key, fallback) {
    try {
      var l = lang();
      if (window.I18N && window.I18N[l] && window.I18N[l][key] !== undefined) return window.I18N[l][key];
      if (window.I18N && window.I18N.en && window.I18N.en[key] !== undefined) return window.I18N.en[key];
    } catch (e) {}
    return fallback;
  }
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  function clamp01(t) {
    return t < 0 ? 0 : t > 1 ? 1 : t;
  }

  /* ═══════════ Scene painters (white art, #BC4B23 accents) ═══════════ */
  var ACCENT = "#BC4B23";
  var WHITE = "#FFFFFF";

  function roundRect(o, x, y, w, h, r) {
    o.beginPath();
    o.moveTo(x + r, y);
    o.arcTo(x + w, y, x + w, y + h, r);
    o.arcTo(x + w, y + h, x, y + h, r);
    o.arcTo(x, y + h, x, y, r);
    o.arcTo(x, y, x + w, y, r);
    o.closePath();
  }

  // Page 0: simple website (browser bar, hero block, text lines, button)
  function paintSite(o, y0) {
    o.fillStyle = WHITE;
    // browser dots
    for (var i = 0; i < 3; i++) {
      o.beginPath();
      o.arc(INNER.x + 5 + i * 6, y0 + 5, 1.6, 0, 7);
      o.fill();
    }
    // address bar
    o.fillRect(INNER.x + 22, y0 + 3, 56, 4);
    // hero block
    o.fillRect(INNER.x + 4, y0 + 12, 74, 20);
    // text lines
    o.fillRect(INNER.x + 4, y0 + 36, 60, 2.5);
    o.fillRect(INNER.x + 4, y0 + 41, 48, 2.5);
    // button (accent = the action)
    o.fillStyle = ACCENT;
    roundRect(o, INNER.x + 4, y0 + 47, 26, 8, 2);
    o.fill();
  }

  // Page 1: automation nodes — icon squares + big labels, vertical flow
  function paintNodes(o, y0, pulseY) {
    var labels = [T("soft.fx.start", "Start"), T("soft.fx.run", "Run"), T("soft.fx.end", "End")];
    var rows = [y0 + 8, y0 + 26, y0 + 44];
    o.strokeStyle = WHITE;
    o.lineWidth = 1.6;
    // connector line through the icon column
    o.beginPath();
    o.moveTo(INNER.x + 12, rows[0] + 5);
    o.lineTo(INNER.x + 12, rows[2] + 5);
    o.stroke();
    o.fillStyle = WHITE;
    o.font = "700 10px 'Space Grotesk', sans-serif";
    o.textBaseline = "middle";
    for (var i = 0; i < 3; i++) {
      o.strokeRect(INNER.x + 7, rows[i], 10, 10);
      o.fillText(labels[i], INNER.x + 22, rows[i] + 5.5);
    }
    // traveling pulse (accent)
    if (pulseY !== null) {
      o.fillStyle = ACCENT;
      o.beginPath();
      o.arc(INNER.x + 12, pulseY, 2.6, 0, 7);
      o.fill();
    }
  }

  // Page 2: booking screen — field rows (label left, value right) + button
  function paintBooking(o, y0) {
    var rows = [
      [T("soft.fx.arrival", "Arrival"), "12 JUN"],
      [T("soft.fx.departure", "Departure"), "15 JUN"],
      [T("soft.fx.guests", "Guests"), "2"]
    ];
    o.fillStyle = WHITE;
    o.textBaseline = "middle";
    for (var i = 0; i < 3; i++) {
      var ry = y0 + 6 + i * 14;
      o.strokeRect(INNER.x + 4, ry, 74, 11);
      o.font = "700 7px 'Space Grotesk', sans-serif";
      o.textAlign = "left";
      o.fillText(rows[i][0], INNER.x + 8, ry + 5.5);
      o.textAlign = "right";
      o.fillText(rows[i][1], INNER.x + 74, ry + 5.5);
    }
    o.textAlign = "left";
    o.fillStyle = ACCENT;
    roundRect(o, INNER.x + 21, y0 + 49, 40, 9, 2);
    o.fill();
    o.fillStyle = WHITE;
    o.font = "700 7px 'Space Grotesk', sans-serif";
    o.textAlign = "center";
    o.fillText(T("soft.fx.book", "Book"), INNER.x + 41, y0 + 53.5);
    o.textAlign = "left";
  }

  /* ═══════════ Engine ═══════════ */
  function init() {
    var canvas = document.getElementById("soft-fx");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var off = document.createElement("canvas");
    off.width = BW;
    off.height = BH;
    var o = off.getContext("2d", { willReadFrequently: true });
    if (!o) return;

    // Size the visible bitmap to the real display resolution (so the dots
    // stay crisp and dense instead of being upscaled/blurred), and pick a
    // dot grid whose cells are ~PITCH device px apart.
    function sizeCanvas() {
      var cssW = canvas.clientWidth || 480;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(cssW * dpr));
      var h = Math.max(1, Math.round(w * OH / OW));
      canvas.width = w;
      canvas.height = h;
      COLS = Math.max(120, Math.min(320, Math.round(w / PITCH)));
      ROWS = Math.max(1, Math.round(COLS * OH / OW));
      cellX = w / COLS;
      cellY = h / ROWS;
      MAX_R = RATIO * (cellX + cellY) / 2;
      DOT_MIN = Math.max(0.3, (cellX + cellY) / 2 * 0.10);
      // Narrow canvases shrink the whole scene; scale it back up (the base
      // bar is the widest element, so 120/100 is the safe ceiling). Wide
      // canvases exist only so the resting words can span further, so the
      // laptop is scaled back down to keep its on-screen size unchanged.
      zoom = cssW > 500 ? 500 / cssW : Math.min(1.18, Math.max(1, 420 / cssW));
      // Spring state rides along with the grid: one slot per cell.
      st = new Float32Array(COLS * ROWS * 4);
      // Push radius/heat track the canvas so the feel stays the same.
      R_PUSH = Math.max(46, Math.round(w * 0.1));
      R_PUSH2 = R_PUSH * R_PUSH;
      WARM = R_PUSH * 0.34;
    }
    sizeCanvas();

    // Pointer → device-px position; parks far away on leave so dots spring home.
    // Touch is excluded: it has no hover, and a scroll drag shouldn't scatter dots.
    canvas.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var b = canvas.getBoundingClientRect();
      if (!b.width) return;
      px = (e.clientX - b.left) * (canvas.width / b.width);
      py = (e.clientY - b.top) * (canvas.height / b.height);
      pointerIn = true;
    }, { passive: true });
    canvas.addEventListener("pointerleave", function () {
      pointerIn = false;
      px = -1e5; py = -1e5;
    });

    var running = false;
    var raf = 0;
    var t0 = null;
    var wordIdx = 0;

    function words() {
      return [T("soft.fx.w1", "websites"), T("soft.fx.w2", "automations"), T("soft.fx.w3", "web tools")];
    }

    // Language swap mid-story: restart the resting words from word 1.
    document.addEventListener("mvdl:lang", function () {
      wordIdx = 0;
      if (reduceMotion) renderStatic();
    });

    function renderStatic() {
      drawFrame({
        frameA: 1, offset: 0, squash: 1, pulseY: null,
        baseA: 1, wipe: OH, word: null, wordA: 0
      });
    }

    // Fit a word in the full canvas width (the lid is closed, the
    // whole stage is free), return px size.
    function fitWord(text) {
      var size = 30;
      o.font = "700 " + size + "px 'Space Grotesk', sans-serif";
      var w = o.measureText(text).width;
      if (w > 112) size = Math.max(10, Math.floor((size * 112) / w));
      return size;
    }

    function drawFrame(p) {
      // Paint the scene in logical units on the supersampled buffer.
      o.setTransform(SS, 0, 0, SS, 0, 0);
      o.clearRect(0, 0, OW, OH);

      // On narrow canvases, scale the laptop about its own centre so the
      // on-screen text stays big enough to read once rasterised to dots.
      if (zoom !== 1) {
        o.save();
        o.translate(60, 49.5);
        o.scale(zoom, zoom);
        o.translate(-60, -49.5);
      }

      // Laptop frame + base bar
      if (p.frameA > 0) {
        o.globalAlpha = p.frameA;
        o.strokeStyle = WHITE;
        o.lineWidth = 2;
        o.strokeRect(SCR.x, SCR.y, SCR.w, SCR.h);
        o.globalAlpha = p.frameA * p.baseA;
        o.fillStyle = WHITE;
        roundRect(o, 10, 79, 100, 5, 2);
        o.fill();
        o.globalAlpha = 1;
      }

      // Screen content (clipped, scrolled, squashed on close)
      if (p.frameA > 0 && p.squash > 0.02) {
        o.save();
        o.beginPath();
        o.rect(INNER.x, INNER.y, INNER.w, INNER.h);
        o.clip();
        o.globalAlpha = p.frameA;
        // squash toward the bottom edge (lid closing down into the base)
        var anchor = INNER.y + INNER.h;
        o.translate(0, anchor);
        o.scale(1, p.squash);
        o.translate(0, -anchor);
        var top = INNER.y - p.offset;
        paintSite(o, top);
        paintNodes(o, top + PAGE, p.pulseY === null ? null : p.pulseY);
        paintBooking(o, top + PAGE * 2);
        o.restore();
        o.globalAlpha = 1;
      }

      if (zoom !== 1) o.restore(); // end laptop zoom

      // Resting words (after the lid closes)
      if (p.word && p.wordA > 0) {
        o.globalAlpha = p.wordA;
        o.fillStyle = WHITE;
        o.font = "700 " + fitWord(p.word) + "px 'Space Grotesk', sans-serif";
        o.textAlign = "center";
        o.textBaseline = "middle";
        o.fillText(p.word, OW / 2, OH / 2 + 2);
        o.textAlign = "left";
        o.globalAlpha = 1;
      }

      // Sample → dots
      var img;
      try {
        img = o.getImageData(0, 0, BW, BH).data;
      } catch (e) {
        return; // tainted or unavailable: leave last frame
      }
      o.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var wipePx = p.wipe * SS; // logical → offscreen px
      var f = p.fade === undefined ? 1 : p.fade;
      if (f <= 0.02) f = 0; // fade kills the frame entirely
      for (var gy = 0; gy < ROWS; gy++) {
        var sy0 = (gy * OH / ROWS * SS) | 0;
        var sy1 = Math.min(BH - 1, (((gy + 1) * OH / ROWS) * SS) | 0);
        if (sy0 > wipePx) continue; // top-to-bottom reveal wipe
        var cy = (gy + 0.5) * cellY;
        for (var gx = 0; gx < COLS; gx++) {
          // Pointer springs: push away from the cursor, ease back home.
          // Runs for every cell (even empty ones) so displaced dots always
          // settle, and skips itself entirely once everything is at rest.
          var si = (gy * COLS + gx) * 4;
          var ox = st[si], oy = st[si + 1], vx = st[si + 2], vy = st[si + 3];
          if (pointerIn || ox !== 0 || oy !== 0 || vx !== 0 || vy !== 0) {
            var hx = (gx + 0.5) * cellX;
            if (pointerIn) {
              var pdx = hx + ox - px, pdy = cy + oy - py;
              var pd2 = pdx * pdx + pdy * pdy;
              if (pd2 < R_PUSH2 && pd2 > 0.0001) {
                var pd = Math.sqrt(pd2);
                var pf = (1 - pd / R_PUSH) * PUSH;
                vx += (pdx / pd) * pf;
                vy += (pdy / pd) * pf;
              }
            }
            vx = (vx - ox * STIFF) * DAMP;
            vy = (vy - oy * STIFF) * DAMP;
            ox += vx; oy += vy;
            if (!pointerIn && Math.abs(vx) + Math.abs(vy) < 0.02 &&
                Math.abs(ox) + Math.abs(oy) < 0.05) {
              ox = oy = vx = vy = 0; // settled: stop touching this cell
            }
            st[si] = ox; st[si + 1] = oy; st[si + 2] = vx; st[si + 3] = vy;
          }
          var sx0 = (gx * OW / COLS * SS) | 0;
          var sx1 = Math.min(BW - 1, (((gx + 1) * OW / COLS) * SS) | 0);
          // Reduce the offscreen block to one dot: accent wins if present,
          // otherwise the brightest pixel — so thin strokes don't vanish.
          var accA = 0, whtB = 0;
          for (var yy = sy0; yy <= sy1; yy++) {
            var row = yy * BW;
            for (var xx = sx0; xx <= sx1; xx++) {
              var k = (row + xx) * 4;
              var a = img[k + 3];
              if (a < 40) continue;
              var r = img[k], g = img[k + 1], b = img[k + 2];
              if (r > 140 && r - g > 80) { if (a > accA) accA = a; }
              else { var br = (r + g + b) / 3; if (br > whtB) whtB = br; }
            }
          }
          var accent = accA > 0;
          var bright = whtB / 255;
          if (!accent && bright < 0.11) continue;
          if (f <= 0) continue;
          // p.fade carries alpha transitions (word crossfades, base fade-out)
          // into dot size + opacity so nothing pops.
          var rad = MAX_R * Math.pow(accent ? 0.85 : bright, 0.8) * (0.35 + 0.65 * f);
          if (rad < DOT_MIN) continue;
          ctx.beginPath();
          ctx.arc((gx + 0.5) * cellX + ox, cy + oy, rad, 0, 7);
          if (accent) {
            ctx.fillStyle = "#E07A52";
          } else {
            var alpha = (0.35 + 0.65 * bright) * f;
            // Warm toward the accent as a dot is pushed off home.
            var disp = Math.sqrt(ox * ox + oy * oy);
            var warm = disp >= WARM ? 1 : disp / WARM;
            ctx.fillStyle = warm > 0.02
              ? "rgba(" + Math.round(244 + (224 - 244) * warm) + "," +
                Math.round(243 + (122 - 243) * warm) + "," +
                Math.round(239 + (82 - 239) * warm) + "," + alpha.toFixed(2) + ")"
              : "rgba(244, 243, 239," + alpha.toFixed(2) + ")";
          }
          ctx.fill();
        }
      }
    }

    function paramsAt(t) {
      var p = { frameA: 1, offset: 0, squash: 1, pulseY: null, baseA: 1, wipe: OH, word: null, wordA: 0, fade: 1 };
      if (t < T_REVEAL) {
        var k = easeInOut(t / T_REVEAL);
        p.frameA = k;
        p.wipe = k * OH;
        p.fade = Math.max(k, 0.001);
        return p;
      }
      if (t < T_SCROLL1) return p; // website holds
      if (t < T_SCROLL1_END) {
        p.offset = easeInOut((t - T_SCROLL1) / (T_SCROLL1_END - T_SCROLL1)) * PAGE;
        return p;
      }
      p.offset = PAGE;
      if (t < T_PULSE) return p; // nodes settle
      if (t < T_PULSE_END) {
        var pk = (t - T_PULSE) / (T_PULSE_END - T_PULSE);
        var rows = [INNER.y + 8 + 5, INNER.y + 26 + 5, INNER.y + 44 + 5];
        p.pulseY = rows[0] + (rows[2] - rows[0]) * pk;
        return p;
      }
      if (t < T_SCROLL2) { p.offset = PAGE; return p; } // nodes hold
      if (t < T_SCROLL2_END) {
        p.offset = PAGE + easeInOut((t - T_SCROLL2) / (T_SCROLL2_END - T_SCROLL2)) * PAGE;
        return p;
      }
      p.offset = PAGE * 2;
      if (t < T_CLOSE) return p; // booking holds
      if (t < T_CLOSE_END) {
        p.squash = 1 - easeInOut((t - T_CLOSE) / (T_CLOSE_END - T_CLOSE)) * 0.95;
        return p;
      }
      p.squash = 0.05;
      if (t < T_BASE_OUT) { p.baseA = 1 - (t - T_CLOSE_END) / (T_BASE_OUT - T_CLOSE_END); p.fade = Math.max(p.baseA, 0.001); return p; }
      // Resting words, cycling forever
      p.frameA = 0;
      var list = words();
      var cycle = WORD_HOLD + WORD_FADE;
      var wt = (t - T_BASE_OUT) % (cycle * list.length);
      var idx = Math.floor(wt / cycle);
      var lt = wt - idx * cycle;
      wordIdx = idx;
      p.word = list[idx];
      p.wordA = lt < WORD_FADE ? lt / WORD_FADE : lt > cycle - WORD_FADE ? Math.max(0, (cycle - lt) / WORD_FADE) : 1;
      p.fade = Math.max(p.wordA, 0.001);
      return p;
    }

    function loop(now) {
      if (!running) return;
      if (t0 === null) t0 = now;
      drawFrame(paramsAt(now - t0));
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (running || reduceMotion) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    if (reduceMotion) {
      renderStatic();
      return;
    }

    // Start the story the first time the hero is visible.
    if ("IntersectionObserver" in window) {
      var hero = document.getElementById("soft-hero");
      var started = false;
      new IntersectionObserver(function (entries) {
        if (!started && entries[0].isIntersecting) {
          started = true;
          start();
        } else if (started) {
          if (entries[0].isIntersecting) start();
          else stop();
        }
      }).observe(hero || canvas);
    } else {
      start();
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    // Re-map the canvas to the new display size/DPR on resize or zoom.
    var rT = 0;
    window.addEventListener("resize", function () {
      clearTimeout(rT);
      rT = setTimeout(function () {
        sizeCanvas();
        if (reduceMotion) renderStatic();
      }, 150);
    });
  }

  // Single entry, guarded: fonts.ready gives Space Grotesk to the
  // dotted words; DOMContentLoaded covers browsers without it.
  var booted = false;
  function bootOnce() {
    if (booted) return;
    booted = true;
    init();
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(bootOnce);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootOnce);
  } else {
    bootOnce();
  }
})();
