// ============================================================
// SKYLINE | CINEMATIC — interactions
// ============================================================
document.documentElement.classList.add('js');

// Year stamp
document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});

// ----- REVEAL OBSERVER -----
const revealEls = document.querySelectorAll('.reveal, .reveal-text, .reveal-clip, .process-rail');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
revealEls.forEach(el => io.observe(el));

// ----- NAV — scroll state + ground awareness -----
const nav = document.querySelector('.nav');
if (nav) {
  // Sections marked with data-ground="dark|light"
  const grounds = document.querySelectorAll('[data-ground]');
  const groundIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
        const ground = entry.target.dataset.ground;
        nav.classList.remove('on-dark', 'on-light');
        nav.classList.add(ground === 'light' ? 'on-light' : 'on-dark');
      }
    });
  }, { threshold: [0.3, 0.6] });
  grounds.forEach(el => groundIo.observe(el));

  // Scroll for backdrop
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    lastScroll = y;
  }, { passive: true });
}

// ----- NUMBER COUNTERS -----
const counters = document.querySelectorAll('[data-counter]');
const counterIo = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.counter);
      const duration = 1400;
      const start = performance.now();
      const initial = 0;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value = initial + (target - initial) * ease(progress);
        if (target % 1 === 0) {
          el.textContent = Math.round(value).toLocaleString();
        } else {
          el.textContent = value.toFixed(1);
        }
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterIo.unobserve(el);
    }
  });
}, { threshold: 0.4 });
counters.forEach(el => counterIo.observe(el));

// ----- HERO PARALLAX (light, GPU-only) -----
const parallaxEls = document.querySelectorAll('[data-parallax]');
if (parallaxEls.length && window.matchMedia('(min-width: 900px)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });
  }, { passive: true });
}

// ----- FORM SUBMIT (FormSubmit AJAX) -----
document.querySelectorAll('form[data-formsubmit]').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'TRANSMITTING…';
    submitBtn.disabled = true;
    const formData = new FormData(form);
    try {
      const res = await fetch('https://formsubmit.co/ajax/skylinedrones.ph@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });
      if (res.ok) {
        form.innerHTML = `
          <div style="text-align:center;padding:48px 24px;">
            <div style="font-family:var(--f-mono);font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:var(--ember-700);margin-bottom:16px;">Brief received</div>
            <h3 style="font-family:var(--f-display);font-weight:700;font-size:32px;letter-spacing:-0.025em;margin:0 0 12px;">We have you.</h3>
            <p style="color:var(--text-on-light-muted);margin:0;">We respond inside 24 hours, Manila time.</p>
          </div>
        `;
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      submitBtn.textContent = 'TRY AGAIN';
      submitBtn.disabled = false;
      alert('Submission failed. Please email us directly: skylinedrones.ph@gmail.com');
    }
  });
});

// ----- BROCHURE DOWNLOAD with email gate -----
document.querySelectorAll('[data-brochure]').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt('Enter your email to receive the IND-160-F spec sheet:');
    if (!email || !email.includes('@')) return;
    const fd = new FormData();
    fd.append('email', email);
    fd.append('_subject', 'IND-160-F brochure download request');
    fd.append('product', 'IND-160-F Firefighting Drone');
    fd.append('source', 'Brochure download');
    try {
      await fetch('https://formsubmit.co/ajax/skylinedrones.ph@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: fd,
      });
      btn.textContent = 'CHECK YOUR INBOX';
      btn.style.background = 'var(--ember-700)';
    } catch (err) {
      alert('Request failed. Please email us: skylinedrones.ph@gmail.com');
    }
  });
});
