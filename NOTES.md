# Notes for tirexchange

- Project: tirexchange
- Purpose: Front-end for a small site — menu toggle, contact form handling, and year auto-update.
- Files of interest: index.html, styles.css, script.js
- Created: 2026-05-22
- Next steps:
  - Connect the contact form to a secure backend (email/booking/SMS).
  - Add server-side validation and spam protection.
  - Run accessibility and cross-browser testing.

Backend skeleton:

- A minimal Node/Express backend skeleton is provided in `server.js`.
- To run locally:

```bash
npm install
npm start
```

- The backend exposes `POST /api/contact` and returns JSON. Hook your email/booking/SMS integration where noted in `server.js`.

Security and validation notes:

- Rate limiting: `express-rate-limit` is enabled for `POST /api/contact` (15-minute window, 10 requests per IP). Adjust settings in `server.js` to taste.
- Validation: `express-validator` performs basic length checks on `name`, `contact`, and `service` and returns `400` with errors on invalid input.
- Further recommendations: add reCAPTCHA, server-side spam scoring, and provider-specific verification before sending emails/SMS.

Client behavior:

- On successful submission the client now redirects to `success.html`.

If you want different notes or a different filename, tell me and I can update this.
