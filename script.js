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

      note.textContent = `Thanks, ${name}. Your request is ready. Please connect this form to your secure email, booking, or SMS backend before going live.`;
      form.reset();
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
