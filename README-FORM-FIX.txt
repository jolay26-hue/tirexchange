Contact form fix for GitHub Pages

What changed:
- The contact form now submits to FormSubmit: https://formsubmit.co/tireexchange424@gmail.com
- This works on GitHub Pages because GitHub Pages cannot run Node.js, PHP, or SMTP code.
- The JavaScript now only validates the form. It no longer uses mailto, which often fails or only opens the visitor's email app.
- The CSP now allows form submissions to https://formsubmit.co.

Important first-time setup:
1. Upload these files to GitHub Pages.
2. Submit one test message from the live website.
3. Check tireexchange424@gmail.com for the FormSubmit activation email.
4. Click the activation link. After activation, future submissions will email you automatically.

Security note:
- Do not upload .env, SMTP passwords, Gmail app passwords, Twilio tokens, or API keys to GitHub Pages.
- If any password or app password was committed or uploaded before, revoke it and create a new one.
