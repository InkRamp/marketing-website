/* main.js — i17e static site */
(function () {
  'use strict';

  /* ── Helpers ──────────────────────────────────────────────── */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

  /* ── Sticky header ────────────────────────────────────────── */
  const header = $('#site-header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile nav ───────────────────────────────────────────── */
  const hamburger = $('#hamburger');
  const mainNav   = $('#main-nav');

  hamburger.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* Close nav on link click (mobile) */
  $$('.nav-link', mainNav).forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Close nav on outside click */
  document.addEventListener('click', e => {
    if (mainNav.classList.contains('open') &&
        !mainNav.contains(e.target) &&
        e.target !== hamburger &&
        !hamburger.contains(e.target)) {
      mainNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* ── Active nav link on scroll ────────────────────────────── */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  const updateActiveLink = () => {
    const scrollY = window.scrollY + 100;
    let current = '';

    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === '#' + current);
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* ── Scroll-reveal ────────────────────────────────────────── */
  const revealEls = $$('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(el => observer.observe(el));
  } else {
    /* Fallback: show all immediately */
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ── Back-to-top button ───────────────────────────────────── */
  const btt = $('#back-to-top');

  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btt.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Footer year ──────────────────────────────────────────── */
  const yearEl = $('#footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Contact form validation & submit ────────────────────────── */
  const contactSection = $('#contact');
  const form           = $('#contact-form');
  const submitBtn      = $('#submit-btn');
  const successPanel   = $('#contact-success-panel');

  if (!form) return;

  /* Restore submitted state from sessionStorage (same browser session) */
  if (sessionStorage.getItem('i17e_contact_sent') === '1') {
    contactSection.classList.add('contact--sent');
    successPanel.setAttribute('aria-hidden', 'false');
  }

  const rules = {
    name: {
      validate: v => v.trim().length >= 2,
      message:  'Please enter your full name (at least 2 characters).'
    },
    email: {
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message:  'Please enter a valid email address.'
    },
    subject: {
      validate: v => v !== '',
      message:  'Please select a topic.'
    },
    message: {
      validate: v => v.trim().length >= 10,
      message:  'Please enter a message (at least 10 characters).'
    }
  };

  const showError = (name, msg) => {
    const input = form.elements[name];
    const error = $('#' + name + '-error');
    if (!input || !error) return;
    input.classList.add('error');
    error.textContent = msg;
    input.setAttribute('aria-describedby', name + '-error');
  };

  const clearError = (name) => {
    const input = form.elements[name];
    const error = $('#' + name + '-error');
    if (!input || !error) return;
    input.classList.remove('error');
    error.textContent = '';
    input.removeAttribute('aria-describedby');
  };

  /* Live validation on blur */
  Object.keys(rules).forEach(name => {
    const input = form.elements[name];
    if (!input) return;
    input.addEventListener('blur', () => {
      if (!rules[name].validate(input.value)) {
        showError(name, rules[name].message);
      } else {
        clearError(name);
      }
    });
    input.addEventListener('input', () => {
      if (input.classList.contains('error') && rules[name].validate(input.value)) {
        clearError(name);
      }
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    /* Client-side validation */
    let valid = true;
    Object.keys(rules).forEach(name => {
      const input = form.elements[name];
      if (!input) return;
      if (!rules[name].validate(input.value)) {
        showError(name, rules[name].message);
        valid = false;
      } else {
        clearError(name);
      }
    });

    if (!valid) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    /* Submit — CSS handles the button loading label via aria-busy */
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');

    try {
      const endpoint = form.dataset.action;

      /* Warn developers if the Formspree endpoint hasn't been configured yet */
      if (endpoint.includes('REPLACE_WITH_YOUR_FORM_ID')) {
        console.warn('i17e: Set your Formspree form ID in index.html (data-action attribute).');
      }

      const res = await fetch(endpoint, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) throw new Error('Network response was not ok');

      /* Persist success across refreshes for this browser session */
      sessionStorage.setItem('i17e_contact_sent', '1');

      /* CSS transitions take over: form fades out, success panel fades in */
      contactSection.classList.add('contact--sent');
      successPanel.setAttribute('aria-hidden', 'false');
      successPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (err) {
      /* Re-enable the button so the user can retry */
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      console.error('Form submission failed:', err);

      /* Surface a simple inline error without showing the panel */
      const existingErr = form.querySelector('.submit-error');
      if (!existingErr) {
        const errMsg = document.createElement('p');
        errMsg.className = 'form-error submit-error';
        errMsg.setAttribute('role', 'alert');
        errMsg.textContent = 'Something went wrong — please try again or reach out via GitHub.';
        submitBtn.insertAdjacentElement('afterend', errMsg);
      }
    }
  });

})();
