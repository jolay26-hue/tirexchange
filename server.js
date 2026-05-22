'use strict';

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const Twilio = require('twilio');
const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendEmail({ subject, html, text }) {
  const provider = process.env.EMAIL_PROVIDER;
  const recipient = process.env.EMAIL_TO;
  const from = process.env.EMAIL_FROM || 'no-reply@example.com';

  if (!provider) {
    throw new Error('EMAIL_PROVIDER must be configured to send email notifications');
  }

  if (!recipient) {
    throw new Error('EMAIL_TO must be configured to send email notifications');
  }

  if (provider === 'sendgrid') {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is required for SendGrid integration');
    }

    return sgMail.send({
      to: recipient,
      from,
      subject,
      text,
      html
    });
  }

  if (provider === 'smtp') {
    const transport = createSmtpTransport();
    if (!transport) {
      throw new Error('SMTP settings missing for nodemailer integration');
    }

    return transport.sendMail({
      from,
      to: recipient,
      subject,
      text,
      html
    });
  }

  throw new Error(`Unsupported EMAIL_PROVIDER: ${provider}`);
}

async function sendSms({ name, contact, service }) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.NOTIFICATION_PHONE;

  if (!sid || !token || !from || !to) {
    throw new Error('Twilio environment variables are required to send SMS');
  }

  const client = Twilio(sid, token);
  const body = `New request from ${name}: ${service} — Reply contact: ${contact}`;

  return client.messages.create({
    body,
    from,
    to
  });
}

app.post('/api/contact', contactLimiter, [
  body('name').trim().isLength({ min: 1, max: 80 }).withMessage('Invalid name'),
  body('contact').trim().isLength({ min: 1, max: 120 }).withMessage('Invalid contact'),
  body('service').trim().isLength({ min: 1, max: 80 }).withMessage('Invalid service'),
  body('message').optional().trim().isLength({ max: 1000 }).withMessage('Invalid message')
], async (req, res) => {
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
    const emailProvider = process.env.EMAIL_PROVIDER;
    if (emailProvider) {
      await sendEmail({ subject, html, text });
      console.log('Notification email sent using', emailProvider);
    } else {
      console.log('No EMAIL_PROVIDER configured; skipping email notification.');
    }

    if (process.env.TWILIO_ACCOUNT_SID) {
      await sendSms(sanitized);
      console.log('Notification SMS sent via Twilio');
    } else {
      console.log('No Twilio credentials configured; skipping SMS notification.');
    }
  } catch (error) {
    console.error('Notification provider error:', error);
    return res.status(500).json({ error: 'Failed to send notification.' });
  }

  return res.json({ message: 'Contact request received. Notification sent successfully.' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
