# Configuration Guide

## SendGrid Email Integration

Two methods available:

### Method 1: REST API with CURL (Recommended - Currently Implemented) ✅

**Best for:** Shared hosting, no Composer/dependencies
- No additional setup needed
- Works on Infinityfree, GoDaddy, etc.
- Direct SendGrid API calls
- Lightweight

**Current Implementation:**
Your `contact.php` uses this method. Just set the environment variable with your API key.

---

### Method 2: SendGrid PHP Library (Cleaner Code)

**Best for:** Control Panel hosting with Composer support

#### Installation (requires SSH/Composer):
```bash
composer require sendgrid/sendgrid-php
```

#### Usage in contact.php:
```php
require 'vendor/autoload.php';
use SendGrid\Mail\Mail;

$email = new Mail();
$email->setFrom($senderEmail, "Tire Xchange");
$email->setSubject($emailSubject);
$email->addTo($recipientEmail);
$email->addContent("text/plain", $emailBody);
$email->setReplyTo($contact);

$sendgrid = new \SendGrid($sendgrid_api_key);
$response = $sendgrid->send($email);
$email_sent = ($response->statusCode() == 202);
```

---

## SendGrid API Key Setup

The `contact.php` file requires a SendGrid API key to send emails. The key is retrieved from an environment variable for security.

### Setting Environment Variable on Your Hosting Provider

#### **Infinityfree.net** (Option B - Free Host)
1. Log into your Infinityfree account
2. Go to **Manage → Tools → PHP Configuration** (if available)
3. Or use `.htaccess` method (see below)

#### Using .htaccess (Works on Most Hosts)
Create a `.htaccess` file in your project root with:

```apache
SetEnv SENDGRID_API_KEY "YOUR_SENDGRID_API_KEY_HERE"
```

#### GoDaddy Hosting
1. Log into GoDaddy hosting control panel
2. Go to **Hosting → Environment Variables**
3. Add new variable:
   - Name: `SENDGRID_API_KEY`
   - Value: `YOUR_SENDGRID_API_KEY_HERE`
4. Save and apply

#### Other PHP Hosts
Check your hosting provider's documentation for:
- cPanel: Environment Variables in Advanced section
- Plesk: Environment Variables in Tools & Settings
- Direct PHP config: Edit `php.ini` or use `.htaccess`

---

## Twilio SMS Setup (Optional)

If you want SMS notifications enabled, update `contact.php`:

```php
$twilio_enabled = true;
$twilio_account_sid = 'YOUR_TWILIO_ACCOUNT_SID';
$twilio_auth_token = 'YOUR_TWILIO_AUTH_TOKEN';
$twilio_from_number = 'YOUR_TWILIO_PHONE_NUMBER';
```

Get credentials from: https://www.twilio.com/console

---

## Local Testing

To test locally with environment variables, create a `.env.php` file:

```php
<?php
putenv('SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY_HERE');
```

Then in `contact.php`, add at the top:
```php
<?php
if (file_exists('.env.php')) {
    require '.env.php';
}
```

---

## Deployment Checklist

- [ ] Set SendGrid API key as environment variable on host
- [ ] Upload all files to hosting provider
- [ ] Test contact form submission
- [ ] Verify email arrives at `tirexchangemobile@gmail.com`
- [ ] Check error responses in browser console if something fails
- [ ] Optional: Enable Twilio SMS and set credentials

---

## Troubleshooting

**"SendGrid API key not configured"** error?
- Ensure environment variable `SENDGRID_API_KEY` is set on your host
- Verify `.htaccess` file syntax if using that method
- Check hosting provider's environment variable settings

**Email not sending?**
- Check browser console for error messages (F12 → Console)
- Verify SendGrid API key is valid
- Confirm SendGrid account has credits remaining
- Check that `tirexchangemobile@gmail.com` is a verified recipient (if using SendGrid sandbox)

**SMS not sending?**
- Verify Twilio credentials are correct
- Ensure Twilio account has active phone number
- Check that phone number to send to is in correct format: `+1XXXXXXXXXX`
