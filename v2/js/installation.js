/* installation.js — hero photo rotation
   Crossfades the two hero photos every 6s with a slow Ken Burns drift
   (CSS handles both; this only flips .is-active) and mirrors the active
   slide onto the section's data-active attribute so the card thumb, card
   text and pill tags swap with it. Skipped entirely under
   prefers-reduced-motion and paused while the tab is hidden. */
(function () {
  var ROTATE_MS = 6000;
  var hero = document.querySelector(".inst-hero");
  var imgs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-img]"));
  if (imgs.length < 2) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var current = 0;
  function show(next) {
    imgs[current].classList.remove("is-active");
    imgs[next].classList.add("is-active");
    if (hero) hero.setAttribute("data-active", imgs[next].getAttribute("data-slide") || "starlink");
    current = next;
  }
  var timer = window.setInterval(function () {
    show((current + 1) % imgs.length);
  }, ROTATE_MS);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      window.clearInterval(timer);
    } else {
      timer = window.setInterval(function () {
        show((current + 1) % imgs.length);
      }, ROTATE_MS);
    }
  });
})();
