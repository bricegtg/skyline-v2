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
  });

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

      /* Horizontal scroll showcase: [data-hscroll] wraps a [data-hscroll-track] */
      document.querySelectorAll("[data-hscroll]").forEach(function (wrap) {
        var track = wrap.querySelector("[data-hscroll-track]");
        if (!track) return;
        var getScroll = function () { return track.scrollWidth - wrap.offsetWidth; };
        gsap.to(track, {
          x: function () { return -getScroll(); },
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: function () { return "+=" + getScroll(); },
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true
          }
        });
      });
    });
  }
})();
