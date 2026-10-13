# FrenchBell Cafe — Development Setup Guide

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18+ | LTS recommended |
| npm | 9+ | Bundled with Node.js |
| PostgreSQL | 13+ | Required for all environments |
| Git | Any | For version control |

---

## 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd FRENCHBELL-Prototype1-main
npm install
```

---

## 2. Environment Configuration

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

### Required Variables

```env
# Server
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:5173

# JWT — generate a random 32+ character secret
JWT_SECRET=replace_with_a_long_random_cryptographic_secret_key_minimum_32_chars

# Database — PostgreSQL connection string
DATABASE_URL=postgresql://frenchbell:your_db_password@localhost:5432/frenchbell_db

# Initial admin account (auto-created on first startup if no admins exist)
ADMIN_EMAIL=manager@frenchbellcafe.com
ADMIN_PASSWORD=replace_with_strong_password_minimum_8_chars
```

---

## 3. Database Setup

### 3a. Create PostgreSQL Database and User

```bash
# Connect as the postgres superuser
psql -U postgres

# Inside psql:
CREATE USER frenchbell WITH PASSWORD 'your_db_password';
CREATE DATABASE frenchbell_db OWNER frenchbell;
GRANT ALL PRIVILEGES ON DATABASE frenchbell_db TO frenchbell;
\q
```

### 3b. Run Schema Migration

Applies all tables, indexes, and constraints. Safe to run multiple times (idempotent).

```bash
npm run migrate
```

Expected output:
```
[Migration] Starting FrenchBell Cafe PostgreSQL schema migration...
[Migration] All tables, indexes, and constraints successfully applied.
[Migration] Schema migration completed successfully.
```

### 3c. (Optional) Import Existing JSON Data

If you have legacy data in `server/frenchbell_db.json`, import it:

```bash
npm run import-json
```

This uses `ON CONFLICT DO NOTHING` / `DO UPDATE` — it will not overwrite records already in the database. Safe to run against a populated database.

### 3d. (Optional) Seed Sample Data

```bash
npm run seed
```

---

## 4. Starting the Application

### Development Mode (Hot Reload)

Starts both the Express API server and the Vite frontend dev server concurrently:

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

### Production Mode

```bash
npm run build        # Build frontend
npm run server       # Start only the backend (serves built frontend from /dist)
```

---

## 5. Development OTP Configuration (Test Mode)

The customer authentication uses mobile OTP. Real SMS is **not configured**. For development and testing, a fixed OTP is used instead.

### How to enable test OTP mode

In `.env`:
```env
TEST_OTP_MODE=true
DEV_FIXED_OTP=1234
```

### How it works

1. Customer enters any 10-digit mobile number on the login screen
2. The server responds with the fixed test OTP (returned in the API response body)
3. Customer enters `1234` to complete verification
4. No SMS is sent. No SMS provider is required.

### Production safety

Setting `TEST_OTP_MODE=true` with `NODE_ENV=production` causes the server to **reject startup immediately**:
```
FATAL: Production startup rejected. TEST_OTP_MODE cannot be enabled in a production environment.
```

### To disable test mode (production)

```env
NODE_ENV=production
TEST_OTP_MODE=false
```

You must configure a real SMS provider (currently undocumented — SMS integration is not implemented).

---

## 6. Dummy Payment Configuration

All payments are **fully simulated**. No real money is charged. No real payment provider is required.

```env
PAYMENT_PROVIDER=dummy
```

The checkout UI clearly identifies the simulated payment with:
- "Simulated Payment Provider (Test Mode)" notice
- "SANDBOX" badge
- "TEST / SIMULATED PAYMENT" on receipts
- `[TEST]` label on the pay button

**To simulate a successful payment:** Select "Simulate Success" in the checkout, then click Pay.  
**To simulate a failed payment:** Select "Simulate Failure" in the checkout. The order is retained; you can retry without creating a duplicate.

### Future Razorpay Integration (not activated)

When ready to enable Razorpay test mode, add to `.env`:
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret_here
```

Only test keys (`rzp_test_...`) should be used in development.

---

## 7. SMTP Setup (Admin Invitations and Password Resets)

Admin invitation emails and password reset emails require SMTP configuration.

```env
EMAIL_PROVIDER=smtp
EMAIL_FROM="FrenchBell Cafe" <your_email@gmail.com>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_gmail_app_password
```

### Gmail App Password

1. Go to Google Account → Security → 2-Step Verification → App passwords
2. Create an app password for "Mail"
3. Copy the 16-character password to `SMTP_PASSWORD`

### Alternative Providers

```env
# Resend
# RESEND_API_KEY=re_your_resend_api_key_here

# SendGrid
# SENDGRID_API_KEY=SG.your_sendgrid_api_key_here

# Brevo / Sendinblue
# BREVO_API_KEY=xkeysib-your_brevo_api_key_here
```

### Development without SMTP

If SMTP is not configured, invitation links are printed to the server console log. Copy the URL from the log and open it in a browser to test the invitation acceptance flow.

---

## 8. Receipt Destination Number

Receipts are currently retained in the customer account and available for download/print. No SMS or WhatsApp delivery provider is active.

```env
# Optional — pre-configure for when a messaging provider is connected
RECEIPT_DISPATCH_PHONE_NUMBER=+91XXXXXXXXXX
```

---

## 9. Health Check

Verify the server and database are connected:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "testOtpMode": true,
  "serverless": false
}
```

---

## 10. Test Commands

### Frontend Build Test
```bash
npm run build
```

### Backend Syntax Check
```bash
node --check server/index.js
node --check server/db/index.js
node --check server/payment/index.js
```

### Manual API Tests (curl)

**OTP test (development only):**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
# Response includes testOtp: "1234"

curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "1234", "name": "Test User"}'
# Response includes JWT token
```

**Admin login (first startup auto-provisions using ADMIN_EMAIL/ADMIN_PASSWORD):**
```bash
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@frenchbellcafe.com", "password": "FrenchBell@2026!"}'
```

**Health check:**
```bash
curl http://localhost:5000/api/health
```

---

## 11. SMTP Diagnostic

Test SMTP configuration without sending a real email:

```bash
curl http://localhost:5000/api/admin/smtp-diagnostic \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---

## 12. Database Inspection

### psql CLI
```bash
psql -U frenchbell -d frenchbell_db

\dt             # List tables
\d orders       # Describe orders table
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM users WHERE role = 'admin';
SELECT * FROM admin_invitations WHERE status = 'pending';
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 20;
```

### pgAdmin (GUI)
1. Download from https://www.pgadmin.org/download/
2. Add a new server: `localhost:5432`, database `frenchbell_db`
3. Use Query Tool to run SQL queries

### TablePlus / DBeaver
Connect using the `DATABASE_URL` from your `.env` file.

---

## 13. Deployment Environment Variables

For production deployment (e.g., Railway, Render, Heroku), set these in your hosting platform's environment settings:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Full PostgreSQL connection string |
| `JWT_SECRET` | ✅ | 32+ random chars — never reuse dev secret |
| `NODE_ENV` | ✅ | Set to `production` |
| `ADMIN_EMAIL` | ✅ | Initial superadmin email |
| `ADMIN_PASSWORD` | ✅ | Strong password (8+ chars) |
| `APP_URL` | ✅ | Your public domain, e.g. `https://frenchbell.vercel.app` |
| `EMAIL_PROVIDER` | Recommended | `smtp`, `resend`, `sendgrid` |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` | If using SMTP | Gmail App Password |
| `RESEND_API_KEY` | If using Resend | |
| `TEST_OTP_MODE` | ❌ | **Must NOT be set to `true` in production** |
| `PAYMENT_PROVIDER` | Optional | `dummy` (current default) |
| `RECEIPT_DISPATCH_PHONE_NUMBER` | Optional | For future messaging integration |

---

## 14. Troubleshooting

### Database connection error on startup
- Ensure PostgreSQL is running: `pg_isready -h localhost -p 5432`
- Check `DATABASE_URL` in `.env` is correct
- Verify the database and user exist (see section 3a)

### SMTP errors on invitations
- Run the SMTP diagnostic endpoint (section 11)
- For Gmail, ensure you are using an App Password, not your account password
- Check that "Less secure app access" is not the method being used

### OTP always fails
- Confirm `TEST_OTP_MODE=true` in `.env`
- Confirm `DEV_FIXED_OTP=1234` is set (or check the server log for the fixed OTP)
- Verify the server is running (`curl http://localhost:5000/api/health`)

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version: `node --version` (requires 18+)

### Missing admin account on first login
- Ensure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `.env`
- The auto-provision happens only when there are zero admin accounts in the database
- If the database already has an admin account, the provisioning step is skipped
