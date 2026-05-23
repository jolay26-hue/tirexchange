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

- The backend exposes `POST /api/contact` and sends every contact request as email to `tirexchangemobile@gmail.com`.

- If the front-end is deployed as a static site (for example GitHub Pages), `/api/contact` will not work on that host. Set `apiBaseUrl` in `script.js` to the backend URL (for example `https://your-backend.example.com`) and ensure CORS is enabled on the backend.
- To enforce HTTPS on the backend, set `ENFORCE_HTTPS=true` in your environment and deploy behind a proxy that forwards `x-forwarded-proto`.

SMTP / Gmail settings:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER=your-gmail-address@gmail.com`
- `SMTP_PASS=your-gmail-app-password`
- `EMAIL_FROM=your-gmail-address@gmail.com`

If you want, you can also use another SMTP provider instead of Gmail by updating `SMTP_HOST`, `SMTP_PORT`, and `SMTP_SECURE`.

Security and validation notes:

- Rate limiting: `express-rate-limit` is enabled for `POST /api/contact` (15-minute window, 10 requests per IP). Adjust settings in `server.js` to taste.
- Validation: `express-validator` performs basic length checks on `name`, `contact`, and `service` and returns `400` with errors on invalid input.
- Further recommendations: add reCAPTCHA, server-side spam scoring, and provider-specific verification before sending emails/SMS.

Client behavior:

- On successful submission the client now redirects to `success.html`.
