'use strict';

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.post('/api/contact', contactLimiter, [
  body('name').trim().isLength({ min: 1, max: 80 }).withMessage('Invalid name'),
  body('contact').trim().isLength({ min: 1, max: 120 }).withMessage('Invalid contact'),
  body('service').trim().isLength({ min: 1, max: 80 }).withMessage('Invalid service')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, contact, service } = req.body;
  const sanitized = {
    name: String(name).replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 80),
    contact: String(contact).replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 120),
    service: String(service).replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 80)
  };

  console.log('Contact request received:', { ...sanitized, time: new Date().toISOString() });

  // TODO: integrate with email, booking, or SMS provider here.

  return res.json({ message: 'Contact request received. Connect this endpoint to your backend processor.' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
