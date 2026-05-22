'use strict';

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function normalizeText(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

app.post('/api/contact', (req, res) => {
  const { name, contact, service } = req.body || {};
  const n = normalizeText(name, 80);
  const c = normalizeText(contact, 120);
  const s = normalizeText(service, 80);

  if (!n || !c || !s) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log('Contact request received:', { name: n, contact: c, service: s, time: new Date().toISOString() });

  // TODO: integrate with email, booking, or SMS provider here.

  return res.json({ message: 'Contact request received. Connect this endpoint to your backend processor.' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
