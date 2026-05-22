'use strict';
'/*
Project notes:
- Simple front-end behaviours: menu toggle, year updater, contact form handling.
- Created: 2026-05-22
- Next: connect form to backend; run accessibility audit.
*/
'use strict';
window.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  const year = document.getElementById('year');

  if (year) year.textContent = String(new Date().getFullYear());

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (form && note) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = new FormData(form);
      if (String(data.get('website') || '').trim() !== '') return;

      const name = normalizeText(data.get('name'), 80);
      const contact = normalizeText(data.get('contact'), 120);
      const service = normalizeText(data.get('service'), 80);

      if (!name || !contact || !service) {
        note.textContent = 'Please complete your name, contact information, and service needed.';
        return;
      }

      note.textContent = 'Sending...';

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, contact, service })
        });

        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const json = await res.json();
        note.textContent = json.message || `Thanks, ${name}. Your request was submitted.`;
        form.reset();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        note.textContent = 'Sorry — failed to send your request. Please try again later.';
      }
    });
  }
});

function normalizeText(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}
