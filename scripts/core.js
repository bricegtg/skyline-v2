/* =====================================================
   Skyline Drones v2 — Core interactions
   - JS-enabled flag (gates reveal animations so content always renders)
   - Sticky nav state
   - Mobile menu
   - IntersectionObserver reveals
   - Count-up numbers
   - Magnetic CTAs
   - GSAP/ScrollTrigger init helpers
   - FormSubmit AJAX handler
   ===================================================== */
(function () {
  "use strict";

  // Mark JS available so reveal rules engage (content stays visible if JS fails)
  document.documentElement.classList.add("js");

  const ready = (fn) => {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  };

  ready(() => {
    initNav();
    initReveals();
    initCounters();
    initMagnetic();
    initYear();
    initForm();
  });

  /* ----- Nav ----- */
  function initNav() {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const toggle = nav.querySelector(".nav-toggle");
    const links  = nav.querySelectorAll(".nav-link, .nav-cta");

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 24);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle) {
      toggle.addEventListener("click", () => {
        nav.classList.toggle("is-open");
        document.body.style.overflow = nav.classList.contains("is-open") ? "hidden" : "";
      });
    }
    // Close mobile menu on nav-link tap
    links.forEach((l) => l.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        document.body.style.overflow = "";
      }
    }));
  }

  /* ----- Reveals ----- */
  function initReveals() {
    const targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => io.observe(el));
  }

  /* ----- Counters ----- */
  function initCounters() {
    const els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split(".")[1] || "").length;
      const dur = parseInt(el.dataset.countDuration || "1600", 10);
      const prefix = el.dataset.countPrefix || "";
      const suffix = el.dataset.countSuffix || "";
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const v = target * eased;
        el.textContent = prefix + v.toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = prefix + target.toFixed(decimals) + suffix;
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    els.forEach((el) => io.observe(el));
  }

  /* ----- Magnetic CTAs ----- */
  function initMagnetic() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const els = document.querySelectorAll("[data-magnetic]");
    els.forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.25;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ----- Year ----- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ----- FormSubmit handler ----- */
  function initForm() {
    const forms = document.querySelectorAll("form[data-formsubmit]");
    forms.forEach((form) => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const toast = form.querySelector(".form-toast");
        const btn = form.querySelector("[type='submit']");
        const btnText = btn ? btn.innerHTML : "";
        if (btn) { btn.disabled = true; btn.innerHTML = "Sending…"; }
        if (toast) { toast.classList.remove("is-show", "is-error"); }

        const data = new FormData(form);
        const payload = Object.fromEntries(data.entries());
        payload._captcha = "false";

        try {
          const res = await fetch("https://formsubmit.co/ajax/skylinedrones.ph@gmail.com", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(payload),
          });
          const ok = res.ok;
          if (toast) {
            toast.textContent = ok
              ? "Brief received. We respond within 24 hours."
              : "Something went wrong. Please email skylinedrones.ph@gmail.com directly.";
            toast.classList.add("is-show");
            if (!ok) toast.classList.add("is-error");
          }
          if (ok) form.reset();
        } catch (err) {
          if (toast) {
            toast.textContent = "Network error. Please email skylinedrones.ph@gmail.com directly.";
            toast.classList.add("is-show", "is-error");
          }
        } finally {
          if (btn) { btn.disabled = false; btn.innerHTML = btnText; }
        }
      });
    });
  }

  /* ----- Helper: register a GSAP-style scroll callback (graceful no-op if GSAP missing) ----- */
  window.SKYLINE = window.SKYLINE || {};
  window.SKYLINE.onGsap = function (cb) {
    const tryRun = () => {
      if (window.gsap && window.ScrollTrigger) {
        try { cb(window.gsap, window.ScrollTrigger); } catch (e) { console.warn("[skyline gsap]", e); }
        return true;
      }
      return false;
    };
    if (!tryRun()) {
      let tries = 0;
      const id = setInterval(() => {
        if (tryRun() || ++tries > 40) clearInterval(id);
      }, 100);
    }
  };
})();
