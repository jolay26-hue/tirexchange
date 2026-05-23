/**
 * AWS Lambda Function - Contact Form Email Handler
 * Receives form submissions and sends emails via SendGrid
 * 
 * Environment Variables Required:
 * - SENDGRID_API_KEY: Your SendGrid API key
 * 
 * Deploy:
 * 1. Create new Lambda function in AWS Console
 * 2. Copy this code into the function
 * 3. Set environment variable: SENDGRID_API_KEY
 * 4. Create Lambda Function URL for public access
 * 5. Enable CORS
 */

const https = require('https');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_URL = 'api.sendgrid.com';
const RECIPIENT_EMAIL = 'tirexchangemobile@gmail.com';
const SENDER_EMAIL = 'noreply@tirexchangemobile.ca';

exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.requestContext.http.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  // Only allow POST
  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    let body;
    if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else {
      body = event.body;
    }

    // Validate input
    const { name, contact, service, message } = body;

    if (!name || !contact || !service) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields: name, contact, service' })
      };
    }

    // Sanitize input
    const sanitize = (str, maxLen = 1000) => {
      return String(str || '')
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .slice(0, maxLen);
    };

    const sanitizedName = sanitize(name, 80);
    const sanitizedContact = sanitize(contact, 120);
    const sanitizedService = sanitize(service, 80);
    const sanitizedMessage = sanitize(message, 1000);

    // Build email body
    const emailBody = `New request from ${sanitizedName}\n\nService: ${sanitizedService}\nContact: ${sanitizedContact}\n\nMessage: ${sanitizedMessage || 'None'}\n\nSent at: ${new Date().toISOString()}`;

    // Send via SendGrid
    await sendEmail(
      RECIPIENT_EMAIL,
      `Tire Xchange request from ${sanitizedName}`,
      emailBody,
      sanitizedContact
    );

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Contact request received and emailed successfully.' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to send email' })
    };
  }
};

/**
 * Send email via SendGrid API
 */
function sendEmail(to, subject, text, replyTo) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject
        }
      ],
      from: { email: SENDER_EMAIL },
      content: [
        {
          type: 'text/plain',
          value: text
        }
      ],
      replyTo: { email: replyTo }
    });

    const options = {
      hostname: SENDGRID_URL,
      port: 443,
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 202) {
          resolve({ statusCode: 202 });
        } else {
          reject(new Error(`SendGrid returned ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}
