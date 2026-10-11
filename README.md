# FrenchBell Cafe — Full-Stack Cafe Management System

> A real-world cafe ordering and management platform built for **FrenchBell Cafe, K. Narayanpura, Bengaluru**.

---

## Overview

FrenchBell Cafe is a production-ready web application with two clearly separated systems:

| System | Access |
|--------|--------|
| **Customer App** | Mobile OTP → Browse menu → Cart → Order → Payment → Receipt |
| **Admin Panel** | Email + Password → Operations Dashboard → Full cafe management |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS v3 |
| Backend | Node.js, Express.js |
| Database | JSON flat-file store (`server/frenchbell_db.json`) |
| Auth | JWT (admin), Mobile OTP (customer) |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Email | Nodemailer (SMTP) |
| Image Upload | Multer / Base64 → `public/assets/uploads/` |
| Payments | Dummy payment (production-extensible) |
| WhatsApp | WhatsApp deep link for receipt sharing |

---

## Features

### Customer Side
- **Splash screen** with animated food portal
- **Hero section** with live advertisement carousel (admin-managed)
- **Menu** with categories, veg/non-veg filter, search, and real-time stock status
- **Cart** with coupon application and live discount calculation
- **Order modes**: Dine-In (table scan), Takeaway, Delivery
- **Mobile OTP authentication** — no passwords for customers
- **Checkout** with UPI, Card, Net Banking, and Cash payment options
- **Order confirmation** with confetti and order number
- **Order tracker** — live order status updates
- **E-Receipt** downloadable receipt after order
- **WhatsApp receipt** sharing
- **Offers & Coupons** section with admin-created deals
- **About & Contact** section with Google Maps embed

### Admin Panel
- **Dashboard** — 9 live KPI cards, sales graph (today/weekly/monthly), popular items, inventory alerts, recent orders
- **Orders** — All, New, Preparing, Ready, Out for Delivery, Completed, Cancelled with strict status workflow
- **Order Detail Drawer** — full order info, status timeline, action buttons
- **Menu Management** — Add/Edit/Delete items, image upload, stock management, customizations
- **Category Management** — Add/Edit/Delete categories
- **Availability & Stock** — inline stock editing, auto out-of-stock trigger
- **Customer Directory** — spending profiles, order history, Excel export
- **Customer Orders Register** — all orders filterable by channel
- **Offers & Coupons** — create coupons with full validation rules
- **Advertisements** — upload banners, schedule active period, auto-expires
- **Delivery Management** — delivery area, radius, fee, and order settings
- **Payments** — transaction log
- **Receipts** — view, print, WhatsApp send
- **Analytics & Reports** — sales, orders, fulfillment mix, top products, Excel/CSV export
- **Notifications** — real-time admin notification feed with unread badge
- **Settings** — cafe info, business hours, order settings, delivery settings, payment settings
- **Admin Users** — invite admins by email, manage active/pending/suspended accounts
- **Activity Logs** — full audit trail of all admin actions
- **Admin Profile** — change name, change password, view account details

### Admin Authentication
- Email + password login (separate from customer OTP auth)
- Forgot password → real email reset link
- Admin invitation → real invitation email with secure token
- Invitation tokens: cryptographically secure, single-use, 48–72 hour expiry
- Last-admin protection — cannot remove/suspend the final active admin
- Secure password hashing (bcrypt)
- JWT session tokens

---

## Project Structure

```
FrenchBell_Prototype/
├── public/
│   └── assets/
│       ├── food/            # Static food images
│       ├── uploads/         # Admin-uploaded images (auto-created)
│       └── logo.jfif        # Cafe logo
├── server/
│   ├── index.js             # Express API server
│   ├── db.js                # JSON database layer (PureDb)
│   ├── frenchbell_db.json   # Live database file
│   ├── emailService.js      # Nodemailer email service
│   └── seed.js              # Database seeder
├── src/
│   ├── components/
│   │   ├── admin/           # All admin panel components
│   │   └── ...              # Customer-facing components
│   ├── context/
│   │   ├── AppContext.jsx   # Global customer state
│   │   └── AuthContext.jsx  # Auth state (customer OTP + admin JWT)
│   ├── utils/
│   │   ├── excelExport.js   # Excel report generator
│   │   └── audio.js         # No-op stubs (sound removed)
│   └── App.jsx              # Root app routing
├── .env                     # Local environment variables (not committed)
├── .env.example             # Environment variable template
├── package.json
└── vite.config.js
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_here

# Admin Email (SMTP)
EMAIL_FROM=noreply@frenchbellcafe.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASSWORD=your_app_password

# App URL (for email links)
APP_URL=http://localhost:5173
```

> **Never commit your `.env` file.** It is already in `.gitignore`.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/yourusername/frenchbell-cafe.git
cd frenchbell-cafe
npm install
```

### Setup Environment

```bash
cp .env.example .env
# Edit .env with your SMTP credentials and JWT secret
```

### Seed the Database

```bash
npm run seed
```

This creates the initial database with sample menu items, categories, and a default admin account.

**Default Admin Login:**
```
Email:    admin@frenchbellcafe.com
Password: admin123
```
> Change this immediately after first login.

### Run Development Server

```bash
npm run dev
```

This starts both the Vite frontend (`http://localhost:5173`) and the Express API (`http://localhost:3001`) concurrently.

### Production Build

```bash
npm run build
npm run server
```

---

## Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/admin-login` | Admin email/password login |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Confirm password reset |
| POST | `/api/auth/invite-admin` | Send admin invitation email |
| POST | `/api/auth/accept-invitation` | Accept invite and create account |
| GET | `/api/menu` | Get all menu items |
| POST | `/api/menu` | Create menu item (admin) |
| PUT | `/api/menu/:id` | Update menu item (admin) |
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders` | Place customer order |
| PUT | `/api/orders/:id/status` | Update order status (admin) |
| GET | `/api/customers` | Get customer directory (admin) |
| GET | `/api/analytics/summary` | Dashboard analytics |
| POST | `/api/upload` | Upload image (admin) |
| GET | `/api/offers` | Get active coupons |
| GET | `/api/advertisements` | Get active advertisements |
| GET | `/api/settings` | Get cafe settings |

---

## Admin Panel Navigation

```
Dashboard
Orders           → All / New / Preparing / Ready / Out for Delivery / Completed / Cancelled
Menu             → Menu Items / Categories / Availability
Customers        → All Customers / Customer Orders
Offers & Coupons → Coupons / Promotions
Advertisements   → Active / Scheduled / Add Advertisement
Delivery         → Orders / Delivery Area / Delivery Settings
Transactions     (Payments)
Receipts
Analytics        → Sales / Orders / Customers / Products / Export Reports
Notifications
Settings         → Cafe Info / Business Hours / Order Settings / Delivery / Payment / Admin Users / Activity Logs
```

---

## Order Status Workflow

```
Normal / Takeaway / Dine-In:
  New → Accepted → Preparing → Ready → Completed

Delivery:
  New → Accepted → Preparing → Ready → Out for Delivery → Delivered
```

Invalid backward transitions are rejected by the backend.

---

## Data Consistency

All admin changes instantly propagate to the customer side:

- **Menu image upload** → customer sees it on next page load
- **Item disabled / out of stock** → customer cannot add to cart
- **Coupon created** → customer can apply at checkout
- **Advertisement activated** → appears on homepage carousel
- **Price changed** → customer sees new price
- **Delivery settings changed** → customer checkout reflects updated rules

---

## Security

- Admin routes protected by JWT middleware (`authenticateToken + requireAdmin`)
- Customer OTP auth is completely separate from admin auth
- Passwords hashed with bcrypt (cost factor 10)
- Invitation tokens are cryptographically secure, single-use, time-limited
- Password reset tokens expire and are invalidated after use
- No secrets committed to repository
- Input validated on both client and server

---

## License

Private — FrenchBell Cafe. All rights reserved.
