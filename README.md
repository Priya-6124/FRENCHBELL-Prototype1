# FrenchBell Cafe — Full-Stack Cafe Management System

> A production-ready cafe ordering and operations platform built for **FrenchBell Cafe, K. Narayanpura, Bengaluru**.

---

## 1. Overview & Architecture

FrenchBell Cafe is a dual-tier web application serving both customer ordering and comprehensive back-office cafe operations:

| System | Authentication | Core Capabilities |
|--------|----------------|-------------------|
| **Customer App** | Mobile Number + 4-Digit OTP | Menu browsing, item customization, cart, order placement (Dine-In / Takeaway / Doorstep Delivery), Razorpay / Pay at Cafe, eReceipts, live status order tracking |
| **Admin Operations** | Dedicated Email + Password (JWT) | Live kitchen order board, menu & customization manager, customer directory, inventory alerts, table QR codes, coupons, analytics, audit logs, admin invitation management |

### Technology Stack
- **Frontend:** React 18, Vite 5, Tailwind CSS v3, Lucide React icons
- **Backend:** Node.js, Express.js (ES Modules)
- **Database:** PostgreSQL (Neon Serverless PostgreSQL or local PostgreSQL); in-memory `pg-mem` engine for isolated test suite execution
- **Security:** Cryptographic OTP generation (SHA-256 hashed storage), bcrypt password hashing, timing-safe HMAC payment verification, JWT session tokens, advisory transaction locks

---

## 2. Environment Variables

Configure environment variables in `.env` (never commit secrets or real credentials):

| Variable Name | Required | Description |
|---------------|----------|-------------|
| `PORT` | Optional | Express server port (default: `5000`) |
| `NODE_ENV` | Yes | Environment mode (`development`, `production`, `test`) |
| `VERCEL_ENV` | Optional | Set automatically by Vercel (`production` or `preview`) |
| `DATABASE_URL` | Yes (Dev/Prod) | PostgreSQL connection string (`postgresql://user:pass@host/db?sslmode=require`) |
| `JWT_SECRET` | Yes | High-entropy secret key for JWT session tokens |
| `ADMIN_EMAIL` | Yes | Initial primary administrator email for auto-provisioning |
| `ADMIN_PASSWORD` | Yes | Initial primary administrator password |
| `TEST_OTP_MODE` | Optional | Set to `true` in development/testing to display generated OTP in the UI banner. **Strictly rejected in production**. |
| `RAZORPAY_KEY_ID` | Yes (Online Pay) | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Yes (Online Pay) | Razorpay Key Secret for backend HMAC signature validation |
| `APP_URL` | Optional | Base URL of the web application for email invitation links |
| `RECEIPT_DISPATCH_PHONE_NUMBER` | Optional | Dedicated cafe phone number for receipt archival |
| `SMTP_HOST` | Optional | SMTP mail host for admin invitations and password resets |
| `SMTP_PORT` | Optional | SMTP port (e.g. `587` or `465`) |
| `SMTP_USER` | Optional | SMTP username |
| `SMTP_PASSWORD` | Optional | SMTP password / app password |

---

## 3. Customer OTP Verification Flow

- **Secure Backend Generation:** The server generates a cryptographically secure 4-digit code using `crypto.randomInt(1000, 10000)` and stores only its SHA-256 hash.
- **Testing Mode (`TEST_OTP_MODE=true`):** When enabled in non-production environments, the backend returns the generated OTP to the UI, which displays it in a visible banner inside the OTP verification modal. This allows full verification testing without requiring an active third-party SMS gateway.
- **No Universal Hardcoded OTP:** Universal codes (e.g., `1234` or fixed development bypasses) are completely removed.
- **Security Controls:**
  - OTPs expire after 5 minutes.
  - Single-use: Deleted immediately upon successful verification.
  - Rate limiting: Maximum 5 requests per 15 minutes per phone number.
  - Resend cooldown: 60-second enforced timer.
  - Maximum 3 incorrect attempts before invalidation.
  - Production safeguard: The server refuses to boot if `TEST_OTP_MODE=true` is detected in production.

---

## 4. Payments and Receipts

FrenchBell Cafe supports exactly two customer payment flows:

1. **Razorpay Online:**
   - Frontend initializes the checkout using the official Razorpay SDK.
   - The server verifies payment authenticity using constant-time HMAC SHA-256 signature verification against `RAZORPAY_KEY_SECRET`.
   - The server verifies the captured payment amount directly with the Razorpay API.
   - Orders are marked as `successful` only after successful backend verification.
   - The authentic Razorpay Payment ID (`pay_...`) is recorded as `transaction_id` and displayed on customer eReceipts and admin order details.
2. **Pay at Cafe (Cash):**
   - Customer places order without upfront online payment.
   - Order is recorded with `payment_status = 'pending'`.
   - Orders remain unpaid until cafe staff confirms receipt of cash and updates the status.
3. **Simulated Payment Safeguard:**
   - The simulated payment endpoint (`/api/payment/simulate`) is restricted exclusively to testing/development environments.
   - Any attempt to access payment simulation in production returns HTTP 403 Forbidden.

---

## 5. Order Management & Numbering

- **Daily Order Numbering:** Generates sequences starting from `FB001`, `FB002`, etc.
- **2:00 AM Reset:** The business day boundary resets at **2:00 AM IST (Asia/Kolkata)**. Orders placed between midnight and 01:59 belong to the previous day's shift.
- **Concurrency Protection:** PostgreSQL advisory transaction locks prevent race conditions during simultaneous order placement.
- **Status Lifecycle Workflow:**
  - Normal/Dine-In/Takeaway: `received` → `accepted` → `preparing` → `ready` → `completed`
  - Delivery: `received` → `accepted` → `preparing` → `ready` → `out_for_delivery` → `completed`
  - Backward status transitions are strictly prohibited by the backend.

---

## 6. Item Customization

- **Menu Configuration:** Admins can configure customization options per item (e.g., `Extra Cheese (+₹30), Peri Peri Drizzle (+₹20)`).
- **Customer Selection:** Customers select options in the food detail modal with live price recalculation.
- **Persistence & Propagation:** Selected options are validated against server-side menu rules, saved in `order_items.customizations`, and displayed in the cart, checkout modal, order tracker, admin order detail drawer, and digital receipts.

---

## 7. Customer Directory & Order History

- **Admin All Customers Page:** Real customer accounts from the PostgreSQL database with aggregated metrics (`total_orders`, `total_spent`, `last_order_date`), search filters, and Excel export.
- **Customer Order History:** Authenticated endpoint (`/api/customer/orders`) strictly scoped to the logged-in user's identity and verified phone number.
- **Order Tracking:** Accessible at `/api/orders/:orderNumber/track` with authorization verification (JWT customer/admin token or verified phone number matching the order). Hardcoded/mock orders are excluded.

---

## 8. Development & Build Commands

### Prerequisites
- Node.js 18+ (tested on Node.js 20 and Node.js 24)
- npm 9+
- PostgreSQL database (Neon or local)

### Installation
```bash
npm install
```

### Database Migration
Run safe database schema migrations (creates missing tables and indexes idempotently without dropping data):
```bash
node server/db/migrate.js
```

### Start Development Server
Starts the Express API server and Vite frontend concurrently:
```bash
npm run dev
```

### Run Comprehensive Automated Test Suite
Runs all 31 backend integration tests against the isolated in-memory PostgreSQL engine (`pg-mem`), completely isolated from the live production database:
```bash
node --experimental-vm-modules scripts/test-suite.js
```

### Frontend Production Build
Validates JSX, bundle dependencies, and generates minified static assets in `dist/`:
```bash
npm run build
```

### Run Production Server
Serves static assets and runs the API server:
```bash
npm run server
```

---

## 9. Deployment Guidance (Vercel)

1. Connect the repository to Vercel.
2. Configure Environment Variables in Project Settings:
   - `DATABASE_URL`: Connection string to Neon PostgreSQL database.
   - `JWT_SECRET`: Secret string for authentication tokens.
   - `ADMIN_EMAIL` & `ADMIN_PASSWORD`: Primary admin credentials.
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Production Razorpay keys.
   - `TEST_OTP_MODE`: Set to `false` (or omit) in Production.
3. The root `vercel.json` routes `/api/*` to the serverless entry point and serves frontend static assets for client-side routing.

---

## 10. Database Schema Overview

The database consists of 17 active relational tables (all actively utilized by the application):

| Table | Purpose |
|-------|---------|
| `users` | Customers (phone auth) and administrators (email/password auth) |
| `menu_categories` | Menu classification hierarchy |
| `menu_items` | Dishes, variants, pricing, stock quantities, and customizations |
| `customer_otps` | Mobile OTP hash store with expiry and rate limiting |
| `orders` | Order headers, business days, totals, payment and order status |
| `order_items` | Order item details, variants, selected customizations, and notes |
| `order_status_history` | Audit trail of all order lifecycle status transitions |
| `payments` | Transaction logs, Razorpay payment IDs, and provider responses |
| `receipts` | Digital tax invoice records and delivery statuses |
| `admin_invitations` | Administrator invitation tokens, expiration, and acceptance state |
| `activity_logs` | Tamper-evident admin audit trail (suspensions, edits, logins) |
| `settings` | Cafe metadata, operating hours, delivery fees, and tax rates |
| `offers` | Coupons and promotional deals |
| `advertisements` | Scheduled promotional hero banner carousel items |
| `inventory` | Raw ingredient stocks, reorder thresholds, and unit costs |
| `admin_notifications` | Real-time back-office notification feed |
| `tables` | Dine-in tables and generated QR codes |

> **Note:** All tables contain active application data or support active administrative functionality. No tables should be dropped.
