/* Variant B — editorial micro-interactions */
(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  /* Year stamp */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal, .reveal-text');
  if (revealEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    revealEls.forEach(el => io.observe(el));
  }

  /* Masthead — invert on dark sections */
  const masthead = document.getElementById('masthead');
  if (masthead) {
    const darkSections = document.querySelectorAll('.section.dark, .section.ember');
    const onScroll = () => {
      let isDark = false;
      const mastH = masthead.offsetHeight;
      darkSections.forEach(sec => {
        const r = sec.getBoundingClientRect();
        if (r.top <= mastH && r.bottom > mastH) isDark = true;
      });
      masthead.classList.toggle('is-dark', isDark);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* FormSubmit — AJAX */
  document.querySelectorAll('form[data-formsubmit]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      const submit = form.querySelector('[type="submit"]');
      const orig = submit?.textContent || '';
      if (submit) { submit.disabled = true; submit.textContent = 'Transmitting…'; }
      if (status) status.textContent = '';

      const data = new FormData(form);
      data.append('_captcha', 'false');
      data.append('_template', 'table');

      try {
        const res = await fetch('https://formsubmit.co/ajax/skylinedrones.ph@gmail.com', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data,
        });
        if (res.ok) {
          form.reset();
          if (status) status.textContent = 'Received. We respond inside 24 hours.';
        } else {
          if (status) status.textContent = 'Could not submit — please email skylinedrones.ph@gmail.com directly.';
        }
      } catch (err) {
        if (status) status.textContent = 'Network error — please email or WhatsApp us directly.';
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = orig; }
      }
    });
  });
})();
