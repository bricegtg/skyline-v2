/* =====================================================
   Skyline v3 — Enhancement layer
   Sits on top of ../../scripts/core.js (which already handles
   nav, reveals, counters, magnetic, year, FormSubmit, SKYLINE.onGsap).
   Adds:
     - data-stagger-chars / data-stagger-words : split text + IO reveal
     - data-pin-section : GSAP pin + scrub chapter (Variant B/C)
     - enhanced magnetic affordance
   Degrades gracefully when GSAP or IO is unavailable.
   ===================================================== */
(function () {
  "use strict";

  var ready = function (fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  };

  var ROTOR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="M50 50 L46 10 Q60 12 66 26 Q62 40 50 50 Z"/><path d="M50 50 L90 54 Q88 40 74 34 Q60 38 50 50 Z"/><path d="M50 50 L54 90 Q40 88 34 74 Q38 60 50 50 Z"/><path d="M50 50 L10 46 Q12 60 26 66 Q40 62 50 50 Z"/><circle cx="50" cy="50" r="7.5"/></svg>';

  ready(function () {
    injectRotors();
    splitStaggerText();
    initStaggerReveals();
    enhanceMagnetic();
    initHeroVideoRotation();
    initSurfaceCarousel();
  });

  /* ---- v3.3: Rotating hero video (3 clips, ~8s each, no audio) ---- */
  function initHeroVideoRotation() {
    var video = document.querySelector("[data-hero-rotate]");
    if (!video) return;
    var sources;
    try { sources = JSON.parse(video.getAttribute("data-hero-rotate")); }
    catch (e) { sources = []; }
    if (!sources || sources.length < 2) return;
    var idx = 0;
    var swap = function () {
      idx = (idx + 1) % sources.length;
      var srcEl = video.querySelector("source");
      if (srcEl) { srcEl.setAttribute("src", sources[idx]); video.load(); video.play().catch(function(){}); }
    };
    // Advance every ~8s; also advance on ended (in case loop is removed)
    setInterval(swap, 8000);
  }

  /* ---- v3.3: Surface click-arrow carousel (no scroll-jack) ---- */
  function initSurfaceCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(function (root) {
      var slides = Array.prototype.slice.call(root.querySelectorAll(".surface-slide"));
      var dots = Array.prototype.slice.call(root.querySelectorAll(".surface-dot"));
      var prev = root.querySelector(".surface-arrow.prev");
      var next = root.querySelector(".surface-arrow.next");
      if (!slides.length) return;
      var cur = 0;
      var go = function (i) {
        cur = (i + slides.length) % slides.length;
        slides.forEach(function (s, n) { s.classList.toggle("is-active", n === cur); });
        dots.forEach(function (d, n) { d.classList.toggle("is-active", n === cur); });
      };
      if (prev) prev.addEventListener("click", function () { go(cur - 1); });
      if (next) next.addEventListener("click", function () { go(cur + 1); });
      dots.forEach(function (d, n) { d.addEventListener("click", function () { go(n); }); });
      go(0);
    });
  }

  /* ---- Inject inline rotor SVG into [data-rotor] so currentColor works ---- */
  function injectRotors() {
    document.querySelectorAll("[data-rotor]").forEach(function (el) {
      if (el.dataset.rotorDone === "1") return;
      el.innerHTML = ROTOR_SVG;
      el.classList.add("rotor-mark");
      el.dataset.rotorDone = "1";
    });
  }

  /* ---- Split [data-stagger-chars] / [data-stagger-words] into spans ---- */
  function splitStaggerText() {
    document.querySelectorAll("[data-stagger-chars]").forEach(function (el) {
      if (el.dataset.split === "done") return;
      var text = el.textContent;
      el.textContent = "";
      var frag = document.createDocumentFragment();
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch === " ") {
          var sp = document.createElement("span");
          sp.className = "char-space";
          sp.setAttribute("aria-hidden", "true");
          frag.appendChild(sp);
        } else {
          var s = document.createElement("span");
          s.className = "char";
          s.textContent = ch;
          s.style.transitionDelay = (i * (parseFloat(el.dataset.staggerChars) || 28)) + "ms";
          frag.appendChild(s);
        }
      }
      el.appendChild(frag);
      el.dataset.split = "done";
    });

    document.querySelectorAll("[data-stagger-words]").forEach(function (el) {
      if (el.dataset.split === "done") return;
      var words = el.textContent.split(/(\s+)/);
      el.textContent = "";
      var frag = document.createDocumentFragment();
      var wi = 0;
      words.forEach(function (w) {
        if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(" ")); return; }
        if (w === "") return;
        var s = document.createElement("span");
        s.className = "word";
        s.textContent = w;
        s.style.transitionDelay = (wi * (parseFloat(el.dataset.staggerWords) || 60)) + "ms";
        frag.appendChild(s);
        wi++;
      });
      el.appendChild(frag);
      el.dataset.split = "done";
    });
  }

  /* ---- Stagger reveal ---- DISABLED per user request (v3.1)
     No scroll-triggered fade/slide of text. Mark every stagger element
     is-in immediately so split spans render at full opacity on load. */
  function initStaggerReveals() {
    var targets = document.querySelectorAll("[data-stagger-chars], [data-stagger-words]");
    targets.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- Enhanced magnetic affordance (smoother return, scale) ---- */
  function enhanceMagnetic() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.classList.add("cta-magnetic");
    });
  }

  /* ---- Scroll motion (Variant B / C) via GSAP ScrollTrigger ----
     v3.1: The pinned CROSSFADE chapters ([data-pin-group]) and the
     CLIP-PATH hero reveal ([data-clip-reveal]) are DISABLED per user
     request — they faded/clipped content in and out on scroll. The
     horizontal-scroll showcase ([data-hscroll]) is KEPT because the user
     likes that "different pictures of different places" pattern; it is a
     horizontal translate, not an opacity fade. */
  if (window.SKYLINE && window.SKYLINE.onGsap) {
    window.SKYLINE.onGsap(function (gsap, ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      /* [data-pin-group] crossfade chapters — REMOVED (no scroll fade). */
      /* [data-clip-reveal] hero clip-path reveal — REMOVED (no scroll reveal). */
      /* v3.3: [data-hscroll] scroll-pin showcase REMOVED — converted to
         static all-visible grids (firefighting/imaging) and a click-arrow
         carousel (cleaning surfaces). No scroll hijack anywhere. */
    });
  }
})();
