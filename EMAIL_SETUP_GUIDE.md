# 📧 Email Monitoring Setup Guide

## Step 1: Create .env File

Create a `.env` file in your project root with your email credentials:

```env
# Email Account 1 (Gmail example)
EMAIL_USER_1=your-email@gmail.com
EMAIL_PASS_1=your-app-password

# Email Account 2 (Outlook example) 
EMAIL_USER_2=your-email@outlook.com
EMAIL_PASS_2=your-password
```

## Step 2: Gmail Setup (Important!)

For Gmail, you **MUST** use App Passwords:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable **2-Factor Authentication** if not already enabled
3. Go to **Security** → **App Passwords**
4. Generate an app password for "Mail"
5. Use this app password (not your regular password) in `.env`

## Step 3: Outlook Setup

For Outlook/Hotmail:
- You can use your regular password
- Or enable App Passwords for better security

## Step 4: Test Your Setup

```bash
# Test email connections
npm run test-email

# Setup Elasticsearch (if not done already)
npm run setup
```

## Step 5: Start Email Monitoring

```bash
# Start monitoring and indexing emails
npm start
```

## Step 6: Search Your Emails

```bash
# Search all emails
npm run search "important meeting"

# Search by sender
npm run search "from:boss@company.com"

# Search by subject
npm run search "subject:invoice"
```

## Troubleshooting

### Gmail Issues
- Make sure 2FA is enabled
- Use App Password, not regular password
- Check if "Less secure app access" is enabled (if not using App Passwords)

### Outlook Issues
- Try enabling App Passwords
- Check if IMAP is enabled in Outlook settings
- Some corporate accounts may block IMAP

### Connection Issues
- Check your internet connection
- Verify email credentials are correct
- Check if your email provider allows IMAP access

## What Happens When You Run `npm start`

1. ✅ Connects to Elasticsearch
2. ✅ Creates email index
3. ✅ Connects to your email accounts
4. ✅ Fetches last 30 days of emails
5. ✅ Indexes all emails in Elasticsearch
6. ✅ Listens for new incoming emails
7. ✅ Automatically indexes new emails in real-time

## Available Commands

```bash
npm run setup          # Setup Elasticsearch
npm run test-email     # Test email connections
npm run test-storage   # Test with sample data
npm start             # Start real email monitoring
npm run search        # Search your emails
npm run dev           # Development mode with auto-restart
```

