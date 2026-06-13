// ============================================================
// SKYLINE DRONES v2 — Core motion + interactions
// Lenis smooth scroll + scroll reveal + form + nav state
// ============================================================

// ----- Lenis Smooth Scroll -----
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,
  wheelMultiplier: 1,
  touchMultiplier: 2,
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// ----- Nav scroll state -----
const nav = document.querySelector('.nav');
let lastScroll = 0;
lenis.on('scroll', ({ scroll }) => {
  if (nav) nav.classList.toggle('scrolled', scroll > 40);
  lastScroll = scroll;
});

// ----- Mobile menu -----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  }));
}

// ----- Scroll reveal (IntersectionObserver) -----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      // count-up
      e.target.querySelectorAll('[data-countup]').forEach(el => {
        if (el.dataset.done) return;
        el.dataset.done = '1';
        const target = parseFloat(el.dataset.countup);
        const decimals = (el.dataset.countup.split('.')[1] || '').length;
        const dur = 1400;
        const start = performance.now();
        function tick(now) {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = (target * eased);
          el.textContent = decimals ? val.toFixed(decimals) : Math.round(val);
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// ----- Smooth anchor scroll via lenis -----
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -80, duration: 1.4 });
  });
});

// ----- Magnetic CTA hover (subtle) -----
document.querySelectorAll('[data-magnetic]').forEach(el => {
  const strength = parseFloat(el.dataset.magnetic) || 12;
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
    const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

// ----- Contact form (FormSubmit) -----
function handleSkylineForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.form-submit');
  const original = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;
  const fd = new FormData(form);
  fetch('https://formsubmit.co/ajax/skylinedrones.ph@gmail.com', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: fd
  })
  .then(r => r.json())
  .then(() => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = "Message sent. We'll be in touch shortly.";
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4200);
    }
    form.reset();
  })
  .catch(() => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = 'Send failed. Try WhatsApp or email instead.';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4200);
    }
  })
  .finally(() => { btn.textContent = original; btn.disabled = false; });
}
window.handleSkylineForm = handleSkylineForm;
