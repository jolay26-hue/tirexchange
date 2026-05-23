/*
Project notes:
- Menu toggle, year updater, and light contact-form validation.
- The contact form posts directly to FormSubmit so it works on GitHub Pages.
- Do not add mailto or fetch here; let the browser submit the form normally.
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
    form.addEventListener('submit', (event) => {
      const data = new FormData(form);

      // Spam trap: real users will not fill this hidden field.
      if (String(data.get('_honey') || '').trim() !== '') {
        event.preventDefault();
        return;
      }

      const name = normalizeText(data.get('name'), 80);
      const contact = normalizeText(data.get('Phone or Email'), 120);
      const service = normalizeText(data.get('Service Needed'), 80);

      if (!name || !contact || !service) {
        event.preventDefault();
        note.textContent = 'Please complete your name, contact information, and service needed.';
        return;
      }

      note.textContent = 'Sending your request...';
      // Let the browser submit normally to https://formsubmit.co/...
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
