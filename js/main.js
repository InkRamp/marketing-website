/* main.js — InkRamp Build Status site */
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
      { threshold: 0.08 }
    );
    revealEls.forEach(el => observer.observe(el));
  } else {
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

  /* ── Checklist: localStorage persistence & live progress ─── */

  const STORAGE_KEY  = 'inkramp_checklist_v1';
  const TOTAL_ITEMS  = 97;

  /* Category totals — must match the HTML */
  const CAT_TOTALS = {
    infra:         9,
    auth:          7,
    catalog:       6,
    intake:        8,
    vision:        5,
    rfq:           5,
    orch:          7,
    'docs-ai':     5,
    analytics:     7,
    security:      8,
    testing:       4,
    documentation: 14,
    deliverables:  12,
  };

  /* Load saved state */
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (_) {
    saved = {};
  }

  /* Restore checkboxes from saved state */
  $$('input[type="checkbox"][data-key]').forEach(cb => {
    if (saved[cb.dataset.key]) cb.checked = true;
  });

  /* Recalculate and render all progress indicators */
  function refreshProgress() {
    let totalDone = 0;

    Object.keys(CAT_TOTALS).forEach(cat => {
      const catTotal = CAT_TOTALS[cat];
      const done = $$(`input[data-key^="${cat}-"]`)
        .filter(cb => cb.checked).length;

      totalDone += done;

      const pct = catTotal > 0 ? Math.round((done / catTotal) * 100) : 0;

      /* Update text badge */
      const badge = $(`[data-cat-progress="${cat}"]`);
      if (badge) badge.textContent = `${done} / ${catTotal}`;

      /* Update mini bar */
      const bar = $(`[data-cat-bar="${cat}"]`);
      if (bar) bar.style.width = pct + '%';
    });

    /* Overall progress */
    const overallPct = Math.round((totalDone / TOTAL_ITEMS) * 100);

    const overallCount = $('#overall-count');
    if (overallCount) overallCount.textContent = `${totalDone} / ${TOTAL_ITEMS} items`;

    const overallBar = $('#overall-bar');
    if (overallBar) overallBar.style.width = overallPct + '%';

    const overallWrapper = $('#overall-bar-wrapper');
    if (overallWrapper) overallWrapper.setAttribute('aria-valuenow', totalDone);

    const statComplete = $('#stat-complete');
    if (statComplete) statComplete.textContent = totalDone;
  }

  /* Save state on change */
  $$('input[type="checkbox"][data-key]').forEach(cb => {
    cb.addEventListener('change', () => {
      saved[cb.dataset.key] = cb.checked;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch (_) { /* storage full — fail silently */ }
      refreshProgress();
    });
  });

  /* Initial render */
  refreshProgress();

})();
