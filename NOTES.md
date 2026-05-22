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

Provider configuration examples:

- Use SendGrid:
  - `EMAIL_PROVIDER=sendgrid`
  - `SENDGRID_API_KEY=your_sendgrid_api_key`
  - `EMAIL_TO=you@example.com`
  - `EMAIL_FROM=no-reply@example.com`

- Use SMTP/nodemailer:
  - `EMAIL_PROVIDER=smtp`
  - `SMTP_HOST=smtp.example.com`
  - `SMTP_PORT=587`
  - `SMTP_USER=your_smtp_user`
  - `SMTP_PASS=your_smtp_password`
  - `EMAIL_TO=you@example.com`
  - `EMAIL_FROM=no-reply@example.com`

- Use Twilio SMS notifications:
  - `TWILIO_ACCOUNT_SID=your_sid`
  - `TWILIO_AUTH_TOKEN=your_auth_token`
  - `TWILIO_FROM_NUMBER=+1234567890`
  - `NOTIFICATION_PHONE=+19876543210`

Security and validation notes:

- Rate limiting: `express-rate-limit` is enabled for `POST /api/contact` (15-minute window, 10 requests per IP). Adjust settings in `server.js` to taste.
- Validation: `express-validator` performs basic length checks on `name`, `contact`, and `service` and returns `400` with errors on invalid input.
- Further recommendations: add reCAPTCHA, server-side spam scoring, and provider-specific verification before sending emails/SMS.

Client behavior:

- On successful submission the client now redirects to `success.html`.

If you want different notes or a different filename, tell me and I can update this.
