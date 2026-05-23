# Deployment Guide: GitHub + GoDaddy

## Architecture

```
GitHub (Source Code)
    ↓
    └─→ You push code here for version control
    
GoDaddy Hosting (Live Website)
    ↑
    └─→ You pull/upload files from GitHub
```

---

## Step 1: Prepare GoDaddy Environment

### 1a. Set SendGrid API Key

**Via cPanel (Recommended):**
1. Log into GoDaddy hosting → **cPanel**
2. Search for **"Environment Variables"**
3. Click **"New Environment Variable"**
4. Enter:
   - **Name:** `SENDGRID_API_KEY`
   - **Value:** `YOUR_SENDGRID_API_KEY` (paste your actual key here)
5. Click **"Save"**

**Alternative: Using .htaccess**
If Environment Variables not available, create `.htaccess` in `public_html`:
```apache
SetEnv SENDGRID_API_KEY "YOUR_SENDGRID_API_KEY"
```

### 1b. Get FTP Credentials
1. Go to GoDaddy Hosting → **Manage**
2. Find **"FTP"** or **"FTP/SFTP"** section
3. Note down:
   - FTP Host
   - FTP Username
   - FTP Password
4. Keep these handy for uploading files

---

## Step 2: Upload Project Files to GoDaddy

### Option A: Using File Manager (Web-based - Easiest)
1. In cPanel, open **"File Manager"**
2. Navigate to **"public_html"**
3. Upload these files:
   ```
   ✅ index.html
   ✅ script.js
   ✅ styles.css
   ✅ success.html
   ✅ contact.php
   ✅ .htaccess (if using for API key)
   ✅ Logo_dark_tirexchange.png
   ✅ Logo_light_tirexchange.png
   ✅ logo_round_dark_tirexchange.png
   ✅ CNAME (optional)
   
   ❌ Do NOT upload:
   ❌ .git/ (version control)
   ❌ .github/ (GitHub actions)
   ❌ .gitignore
   ❌ server.js
   ❌ package.json
   ❌ node_modules/
   ❌ CONFIG.md (documentation only)
   ❌ DEPLOYMENT.md (documentation only)
   ❌ NOTES.md (optional - keep for reference)
   ```

### Option B: Using FTP Client (More Control)
1. Download [FileZilla](https://filezilla-project.org/) (free)
2. Open FileZilla
3. Go to **File → Site Manager → New Site**
4. Enter GoDaddy FTP credentials:
   - Host: (from GoDaddy)
   - Username: (from GoDaddy)
   - Password: (from GoDaddy)
   - Protocol: FTP
5. Click **Connect**
6. Navigate to `public_html` folder on right side
7. Drag files from your computer to the server

### Option C: Clone on Server (Advanced - For Developers)
If your GoDaddy plan has SSH access:
```bash
cd public_html
git clone https://github.com/jolay26-hue/tirexchange.git .
```
Then remove `node_modules`, `server.js`, `.git` if present.

---

## Step 3: Update Domain DNS

Your domain `tirexchangemobile.ca` is currently pointing to GitHub Pages. Change it to GoDaddy:

### Update Nameservers (Best Method)
1. Log into GoDaddy → **Domains**
2. Select **tirexchangemobile.ca**
3. Go to **DNS → Nameservers**
4. Set to GoDaddy's nameservers:
   ```
   ns1.secureserver.net
   ns2.secureserver.net
   ns3.secureserver.net
   ns4.secureserver.net
   ```
5. **Wait 24 hours** for DNS to propagate

### Or: Update A Record (If keeping other DNS)
1. In GoDaddy DNS settings
2. Find A record for `@` (root domain)
3. Change IP to your GoDaddy server's IP:
   - Go to GoDaddy Hosting → Manage → **Server & Account Info**
   - Find **Shared IP Address** or **Dedicated IP**
   - Use that IP in A record
4. **Wait 2-4 hours** for propagation

---

## Step 4: Test Your Site

### After DNS Propagates:
1. Visit: **https://tirexchangemobile.ca**
2. Verify you see your website
3. Fill out contact form:
   - Name: "Test"
   - Contact: "test@example.com"
   - Service: Select any
   - Message: "Test message"
4. Click **Submit**
5. Check `tirexchangemobile@gmail.com` for email

**Expected result:** Email arrives within 5-10 seconds ✅

---

## Step 5: Ongoing Workflow

### When You Update Code:

1. **Update locally** in your editor
   ```bash
   # Make changes to index.html, script.js, etc.
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Upload to GoDaddy** (choose one):
   
   **Option A (Easiest - One-time):**
   - Use File Manager to re-upload changed files
   
   **Option B (SSH - For frequent updates):**
   ```bash
   ssh user@godaddy-server.com
   cd public_html
   git pull origin main
   ```
   
   **Option C (Manual FTP - Via FileZilla):**
   - Connect to FTP
   - Drag updated files to public_html

---

## Troubleshooting

### Contact form not sending email?
1. Check browser console (F12 → Console)
2. Look for error messages
3. Verify SendGrid API key is set in GoDaddy (Environment Variables or .htaccess)
4. Check that SendGrid account has credits

### Domain not pointing to GoDaddy?
1. Check DNS propagation: https://www.whatsmydns.net/?q=tirexchangemobile.ca
2. Verify nameservers are set correctly (check in GoDaddy)
3. Wait up to 24 hours for full propagation
4. Try clearing browser cache (Ctrl+Shift+Delete)

### Files not showing up?
1. Verify files uploaded to `public_html` (not subdirectory)
2. Check file permissions (should be 644 for files, 755 for folders)
3. Reload page in browser (Ctrl+F5 for hard refresh)

### PHP script not working?
1. Verify `contact.php` is in `public_html` root
2. Check that `.htaccess` (if used) is in same directory
3. Ensure GoDaddy plan supports PHP (it should)
4. Check error logs in cPanel → Error Log

---

## File Structure on GoDaddy

```
public_html/
├── index.html
├── script.js
├── styles.css
├── success.html
├── contact.php
├── .htaccess (if using for API key)
├── Logo_dark_tirexchange.png
├── Logo_light_tirexchange.png
└── logo_round_dark_tirexchange.png
```

---

## Security Notes

✅ **API Key Protection:**
- Stored in GoDaddy environment variable (secure)
- NOT in version control (not in GitHub)
- NOT hardcoded in PHP files

✅ **Code on GitHub:**
- Public repository is fine (no secrets exposed)
- Good for backup and version history
- Can be shared with team

✅ **Live on GoDaddy:**
- PHP executes server-side (safe)
- Input sanitized before processing
- CORS enabled for your domain only

---

## Summary

| Component | Where | Purpose |
|-----------|-------|---------|
| Code | GitHub | Version control, backup, collaboration |
| Live Site | GoDaddy | Public website for users |
| SendGrid Key | GoDaddy (env var) | Secret, never exposed |
| Domain | GoDaddy DNS | Points to your live site |

---

## Next Steps

1. ✅ Set SendGrid API key in GoDaddy
2. ✅ Upload files to public_html
3. ✅ Update domain DNS
4. ✅ Test contact form
5. ✅ Monitor email delivery

**Ready to deploy?**
