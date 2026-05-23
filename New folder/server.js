'use strict';

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const Twilio = require('twilio');
const app = express();
const PORT = process.env.PORT || 3000;
const RECIPIENT_EMAIL = 'tireexchange424@gmail.com';
const enforceHttps = process.env.ENFORCE_HTTPS === 'true';

if (enforceHttps) {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    const forwardedProto = req.headers['x-forwarded-proto'];
    if (req.secure || forwardedProto === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
      return next();
    }
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  });
}

app.use(cors());
app.use(express.json());

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

function sanitizeText(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function createSmtpTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    connectionTimeout: 10000,
    socketTimeout: 10000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendEmail({ subject, html, text }) {
  const transport = createSmtpTransport();
  if (!transport) {
    throw new Error('SMTP settings are not fully configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error('EMAIL_FROM must be configured when using SMTP.');
  }

  return transport.sendMail({
    from,
    to: RECIPIENT_EMAIL,
    subject,
    text,
    html
  });
}

async function sendSms({ name, contact, service }) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.OWNER_PHONE;

  if (!sid || !token || !from || !to) {
    return; // SMS is optional; silently skip if not configured
  }

  const client = Twilio(sid, token);
  const body = `New Tire Xchange request from ${name}: ${service} — Contact: ${contact}`;

  return client.messages.create({
    body,
    from,
    to
  });
}

app.post(
  '/api/contact',
  contactLimiter,
  [
    body('name').trim().isLength({ min: 1, max: 80 }).withMessage('Invalid name'),
    body('contact').trim().isLength({ min: 1, max: 120 }).withMessage('Invalid contact'),
    body('service').trim().isLength({ min: 1, max: 80 }).withMessage('Invalid service'),
    body('message').optional().trim().isLength({ max: 1000 }).withMessage('Invalid message')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sanitized = {
      name: sanitizeText(req.body.name, 80),
      contact: sanitizeText(req.body.contact, 120),
      service: sanitizeText(req.body.service, 80),
      message: sanitizeText(req.body.message, 1000)
    };

    console.log('Contact request received:', { ...sanitized, time: new Date().toISOString() });

    const subject = `Tire Xchange request from ${sanitized.name}`;
    const text = `New request from ${sanitized.name}\nService: ${sanitized.service}\nContact: ${sanitized.contact}\nMessage: ${sanitized.message || 'None'}`;
    const html = `
      <p><strong>Name:</strong> ${sanitized.name}</p>
      <p><strong>Service:</strong> ${sanitized.service}</p>
      <p><strong>Contact:</strong> ${sanitized.contact}</p>
      <p><strong>Message:</strong> ${sanitized.message || 'None'}</p>
    `;

    try {
      await sendEmail({ subject, html, text });
      console.log('Email sent to', RECIPIENT_EMAIL);

      try {
        await sendSms(sanitized);
        console.log('SMS sent to owner at', process.env.OWNER_PHONE);
      } catch (smsError) {
        console.warn('SMS send failed (optional):', smsError.message);
      }
    } catch (error) {
      console.error('Email send error:', error);
      return res.status(500).json({ error: 'Failed to send email notification.' });
    }

    return res.json({ message: 'Contact request received and emailed successfully.' });
  }
);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
