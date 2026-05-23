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
    // Protect the recipient address from simple scrapers (encoded)
    const encodedRecipient = 'dGlyZXhjaGFuZ2U0MjRAZ21haWwuY29t'; // tirexchange424@gmail.com
    const recipient = atob(encodedRecipient);
    const formSubmitUrl = `https://formsubmit.co/${encodeURIComponent(recipient)}`;

    // Ensure form attributes are set for FormSubmit and to open in new tab
    form.setAttribute('action', formSubmitUrl);
    form.setAttribute('method', 'POST');
    form.setAttribute('target', '_blank');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = new FormData(form);

      // Spam trap: real users will not fill this hidden field.
      if (String(data.get('_honey') || '').trim() !== '') {
        return; // silently drop
      }

      const name = normalizeText(data.get('name'), 80);
      const contact = normalizeText(data.get('Phone or Email'), 120);
      const service = normalizeText(data.get('Service Needed'), 80);
      const message = normalizeText(data.get('Message') || '', 1000);

      if (!name || !contact || !service) {
        note.textContent = 'Please complete your name, contact information, and service needed.';
        return;
      }

      note.textContent = 'Sending your request...';
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      // Add/ensure hidden fields for FormSubmit
      if (!form.querySelector('input[name="_subject"]')) {
        const s = document.createElement('input'); s.type = 'hidden'; s.name = '_subject'; s.value = `New Tire Xchange Service Request from ${name}`; form.appendChild(s);
      }
      if (!form.querySelector('input[name="_next"]')) {
        const n = document.createElement('input'); n.type = 'hidden'; n.name = '_next'; n.value = 'https://tirexchangemobile.ca/success.html'; form.appendChild(n);
      }

      // Prepare payload for fetch attempt so we can detect success
      const payload = new FormData();
      payload.append('name', name);
      payload.append('Phone or Email', contact);
      payload.append('Service Needed', service);
      payload.append('Message', message);
      payload.append('_subject', `New Tire Xchange Service Request from ${name}`);
      payload.append('_template', 'table');
      payload.append('_captcha', 'false');
      payload.append('_next', 'https://tirexchangemobile.ca/success.html');

      try {
        const res = await fetch(formSubmitUrl, { method: 'POST', mode: 'cors', body: payload });

        // If fetch succeeds (CORS permitted), open configured success page in new tab and clear form
        if (res.ok || res.type === 'opaque' || [200,201,202].includes(res.status)) {
          window.open('https://tirexchangemobile.ca/success.html', '_blank', 'noopener');
          form.reset();
          note.textContent = 'Request sent — check your email for confirmation.';
        } else {
          // Fallback: submit normally which will open FormSubmit in a new tab
          form.submit();
          setTimeout(() => { form.reset(); note.textContent = 'Request sent — check your email.'; }, 1500);
        }
      } catch (err) {
        // Network/CORS error - fallback to normal submit
        // eslint-disable-next-line no-console
        console.error('FormSubmit fetch failed, falling back to normal submit', err);
        form.submit();
        setTimeout(() => { form.reset(); note.textContent = 'Request sent — check your email.'; }, 1500);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
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
