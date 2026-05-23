/*
Project notes:
- Front-end behaviours: menu toggle, year updater, AJAX contact form handling.
- Contact form uses FormSubmit because GitHub Pages is static and cannot run SMTP/server code.
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

      const submitButton = form.querySelector('button[type="submit"]');
      const formData = new FormData(form);

      // Honeypot spam protection. Real users will not fill this hidden field.
      if (String(formData.get('website') || '').trim() !== '') {
        return;
      }

      const name = normalizeText(formData.get('name'), 80);
      const contact = normalizeText(formData.get('contact'), 120);
      const service = normalizeText(formData.get('service'), 80);
      const message = normalizeText(formData.get('message'), 1000);

      if (!name || !contact || !service) {
        showNote(note, 'Please complete your name, contact information, and service needed.', 'error');
        return;
      }

      formData.set('name', name);
      formData.set('contact', contact);
      formData.set('service', service);
      formData.set('message', message || 'None');
      formData.set('_subject', `New Tire Xchange Request - ${service}`);
      formData.set('_cc', 'tirexchangemobile@gmail.com');
      formData.set('_captcha', 'false');
      formData.set('_template', 'table');

      showNote(note, 'Sending your request...', 'info');
      if (submitButton) submitButton.disabled = true;

      try {
        const response = await fetch('https://formsubmit.co/ajax/tireexchange424@gmail.com', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData
        });

        let result = {};
        try {
          result = await response.json();
        } catch (_) {
          result = {};
        }

        if (!response.ok) {
          const reason = result.message || result.error || `FormSubmit returned ${response.status}.`;
          throw new Error(reason);
        }

        form.reset();
        showNote(note, 'Success! Your message was sent. We will contact you shortly.', 'success');
      } catch (error) {
        const reason = error && error.message ? error.message : 'Unable to send the message.';
        showNote(note, `Failed to send message: ${reason}`, 'error');
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }
});

if (form && note) {
  // Clear message when user interacts with form
  form.addEventListener('focusin', () => {
    note.textContent = '';
    note.className = ''; // remove success/error styles if any
  });

  form.addEventListener('input', () => {
    note.textContent = '';
    note.className = '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    note.textContent = 'Sending...';

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        note.textContent = '✅ Message sent successfully!';
        note.className = 'success';
        form.reset();
      } else {
        const data = await response.json();
        note.textContent = data.error || '❌ Failed to send message.';
        note.className = 'error';
      }
    } catch (error) {
      note.textContent = '❌ Network error. Please try again.';
      note.className = 'error';
    }
  });
}

function normalizeText(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function showNote(element, message, type) {
  element.textContent = message;
  element.dataset.status = type;
}
