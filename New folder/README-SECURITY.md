# Tire Xchange Static Website - Security Fixes

Reviewed the first static website version and applied these fixes:

- Added a strict Content Security Policy to reduce XSS and unauthorized third-party loading risk.
- Removed Google Fonts external calls to reduce privacy and supply-chain exposure.
- Added Referrer Policy, Permissions Policy, frame protection, and nosniff headers.
- Added a `_headers` file for hosts like Netlify/Cloudflare Pages that support security headers.
- Added `rel="noopener noreferrer external"` to external Facebook links.
- Updated JavaScript to run after DOMContentLoaded and fail safely if elements are missing.
- Added form input length limits and safe text normalization.
- Kept user-provided form text rendered with `textContent`, not `innerHTML`.
- Added a hidden honeypot field to reduce basic spam submissions.

Important deployment notes:

- This is still a static contact form. It does not send emails or SMS by itself.
- Do not put API keys, SMS tokens, passwords, or private business credentials in frontend JavaScript.
- If you connect the form to SMS/email later, use a backend route with rate limiting, input validation, CSRF/spam protection, and secret environment variables.
- Make sure your hosting provider serves HTTPS only and applies the headers from `_headers` or equivalent server config.
