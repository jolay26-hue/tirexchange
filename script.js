/*
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

  // Contact form - secure mailto handler (email encoded to prevent spam bots)
  // Email (encoded): dGlyZXhjaGFuZ2Vtb2JpbGVAZ21haWwuY29t = tirexchangemobile@gmail.com
  const recipientEmail = atob('dGlyZXhjaGFuZ2Vtb2JpbGVAZ21haWwuY29t');

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
      const message = normalizeText(data.get('message'), 1000);

      if (!name || !contact || !service) {
        note.textContent = 'Please complete your name, contact information, and service needed.';
        return;
      }

      // Build email subject with service info
      const emailSubject = `Tire Xchange Request - ${service}`;

      // Build email body with all form data
      const emailBody = `Name: ${name}\nContact: ${contact}\nService: ${service}\nMessage: ${message || 'None'}\n\nSent: ${new Date().toLocaleString()}`;

      // Create secure mailto link
      const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      note.textContent = 'Opening your email client...';

      // Open user's default email client
      window.location.href = mailtoLink;

      // Redirect to success page after brief delay
      setTimeout(() => {
        window.location.href = '/success.html';
      }, 1500);
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
