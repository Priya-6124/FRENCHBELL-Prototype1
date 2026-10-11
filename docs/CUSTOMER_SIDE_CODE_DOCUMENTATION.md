# FrenchBell Cafe — Full Architecture & Code Documentation

**FrenchBell Cafe** · K. Narayanpura, Bengaluru – 560077  
**Version:** 1.0.0 · **Stack:** React 18 · Vite 5 · Tailwind CSS 3 · Framer Motion 11 · Express 4 · JSON File-based DB

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Project Structure](#2-project-structure)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Application Entry & Routing](#4-application-entry--routing)
5. [Authentication System (How Login Works)](#5-authentication-system-how-login-works)
   - 5.1 [Customer Login — Mobile OTP Flow](#51-customer-login--mobile-otp-flow)
   - 5.2 [Admin Login — Email & Password Flow](#52-admin-login--email--password-flow)
   - 5.3 [Admin Forgot & Reset Password](#53-admin-forgot--reset-password)
   - 5.4 [Admin Invitation & Team Onboarding](#54-admin-invitation--team-onboarding)
   - 5.5 [JWT Token Management & Persistence](#55-jwt-token-management--persistence)
   - 5.6 [Auth Context API Reference](#56-auth-context-api-reference)
   - 5.7 [Server-side Auth Middleware](#57-server-side-auth-middleware)
6. [State Management (AppContext)](#6-state-management-appcontext)
7. [UI Components Reference](#7-ui-components-reference)
8. [Admin Dashboard System](#8-admin-dashboard-system)
9. [Backend Server (Express API)](#9-backend-server-express-api)
10. [Magical Splash Screen Architecture](#10-magical-splash-screen-architecture)
11. [Mathematical Spiral Vortex & Gravitational Physics](#11-mathematical-spiral-vortex--gravitational-physics)
12. [Verification Checklist](#12-verification-checklist)

---

## 1. System Overview

FrenchBell Cafe is a **single-page application** (SPA) delivering a complete end-to-end cafe ordering experience. The system covers:

- **Customer Journey**: Splash screen → Homepage → Menu browsing → Cart → Order (Dine-in / Takeaway / Delivery) → OTP Login → Payment → Confirmation → Live Tracking → E-Receipt
- **Admin Journey**: Admin login → Dashboard → Menu/Inventory/Order/Customer/Analytics management
- **Server**: Express.js REST API backed by a JSON file-based database (`frenchbell_db.json`)
- **Auth**: Dual-path — customers use mobile OTP, admins use email+password with JWT

---

## 2. Project Structure

```
FrenchBell_Prototype/
├── api/
│   └── index.js              # Vercel serverless deployment wrapper
├── docs/
│   └── CUSTOMER_SIDE_CODE_DOCUMENTATION.md
├── public/
│   └── assets/
│       ├── logo.jfif          # Brand logo
│       └── food/              # Food item images
├── server/
│   ├── index.js               # Main Express API server (all routes)
│   ├── db.js                  # JSON file DB helper (getDb, logActivity, etc.)
│   ├── emailService.js        # Nodemailer email sender (OTP, invitations, resets)
│   ├── frenchbell_db.json     # Persistent JSON database (users, orders, menu, etc.)
│   ├── schema.sql             # (Reference) SQL schema for optional SQLite migration
│   ├── seed.js                # Database seeding script
│   └── sync_menu.js           # Menu sync utility
├── src/
│   ├── App.jsx                # Root application; context providers + main routing gate
│   ├── main.jsx               # React DOM entry point
│   ├── index.css              # Global CSS, Tailwind base, custom animations
│   ├── assets/
│   │   └── logo.jfif
│   ├── components/
│   │   ├── AuthModal.jsx        # Shared auth modal (customer OTP + admin login)
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── MenuPage.jsx
│   │   ├── MenuSection.jsx
│   │   ├── FoodCard.jsx
│   │   ├── FoodDetailsModal.jsx
│   │   ├── CartDrawer.jsx
│   │   ├── CheckoutModal.jsx
│   │   ├── ConfirmationModal.jsx
│   │   ├── OrderTracker.jsx
│   │   ├── EReceiptModal.jsx
│   │   ├── ProfileDrawer.jsx
│   │   ├── SplashScreen.jsx     # Animated cinematic intro
│   │   ├── FoodIllustrations.jsx
│   │   ├── BrandIcons.jsx
│   │   ├── CurvedUnderline.jsx
│   │   ├── BannerCarousel.jsx
│   │   ├── BrandedFoodImage.jsx
│   │   ├── CategoryTabs.jsx
│   │   ├── SearchBar.jsx
│   │   ├── OrderModeToggle.jsx
│   │   ├── OffersSection.jsx
│   │   ├── CouponsSection.jsx
│   │   ├── AboutSection.jsx
│   │   ├── Footer.jsx
│   │   ├── DineInModal.jsx
│   │   ├── TakeawayModal.jsx
│   │   ├── DeliveryModal.jsx
│   │   ├── NotificationsToast.jsx
│   │   └── admin/
│   │       ├── AdminAuthView.jsx      # Full-page admin login screen
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminSidebar.jsx
│   │       ├── AdminProfileModal.jsx
│   │       ├── AdminUsersManager.jsx
│   │       ├── MenuManager.jsx
│   │       ├── CategoryManager.jsx
│   │       ├── InventoryManager.jsx
│   │       ├── LiveOrderBoard.jsx
│   │       ├── OrderDetailDrawer.jsx
│   │       ├── CustomerManager.jsx
│   │       ├── AnalyticsDashboard.jsx
│   │       ├── AnalyticsCharts.jsx
│   │       ├── OfferManager.jsx
│   │       ├── PaymentManager.jsx
│   │       ├── ReceiptManager.jsx
│   │       ├── DeliverySettings.jsx
│   │       ├── CafeSettingsManager.jsx
│   │       ├── TableQRManager.jsx
│   │       ├── AdvertManager.jsx
│   │       ├── ActivityLogsManager.jsx
│   │       ├── NotificationsDropdown.jsx
│   │       ├── QuickActionBar.jsx
│   │       └── ExportModal.jsx
│   ├── context/
│   │   ├── AuthContext.jsx     # Auth state, OTP, admin login, JWT persistence
│   │   └── AppContext.jsx      # Global app state: cart, menu, orders, settings, coupons
│   ├── data/
│   │   ├── menuData.js         # Initial menu items & categories seed data
│   │   └── inventoryData.js    # Initial inventory seed data
│   └── utils/
│       ├── audio.js            # Web Audio API synthesizer (splash screen sounds)
│       └── excelExport.js      # Excel/CSV export utility for admin reports
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── vercel.json                 # Vercel deployment routing config
```

---

## 3. Tech Stack & Dependencies

| Category | Library | Version | Purpose |
|---|---|---|---|
| Frontend Framework | React | ^18.3.1 | UI rendering |
| Build Tool | Vite | ^5.2.13 | Dev server & bundler |
| Styling | Tailwind CSS | ^3.4.4 | Utility-first CSS |
| Animations | Framer Motion | ^11.2.10 | Spring/keyframe animations |
| Icons | Lucide React | ^0.395.0 | SVG icon library |
| Charts | Recharts | ^2.12.7 | Admin analytics charts |
| Confetti | canvas-confetti | ^1.9.4 | Order confirmation celebration |
| Backend | Express | ^4.19.2 | REST API server |
| Auth (password) | bcryptjs | ^2.4.3 | Admin password hashing |
| Auth (tokens) | jsonwebtoken | ^9.0.2 | JWT generation & verification |
| File Uploads | multer | ^1.4.5-lts.1 | Image upload handling |
| Email | (nodemailer) | (via emailService) | Password reset & invite emails |
| CORS | cors | ^2.8.5 | Cross-origin support |
| Env | dotenv | ^16.4.5 | Environment variable loading |
| Dev Runner | concurrently | ^8.2.2 | Run server + vite in parallel |

### NPM Scripts

```bash
npm run dev      # Start Express server + Vite dev server concurrently
npm run server   # Start Express server only (port 5000)
npm run build    # Vite production build → /dist
npm run preview  # Preview production build
npm run seed     # Seed the JSON database with initial data
```

---

## 4. Application Entry & Routing

**File:** [`src/App.jsx`](../src/App.jsx)

The root `App` component wraps everything in the two context providers:

```jsx
export default function App() {
  return (
    <AuthProvider>    {/* Handles all auth state */}
      <AppProvider>   {/* Handles cart, menu, orders, settings */}
        <MainSiteContent />
      </AppProvider>
    </AuthProvider>
  );
}
```

`MainSiteContent` implements a three-level rendering gate:

```
Load App
   │
   ├─ currentView === 'admin'  →  <AdminDashboard />  (full-page, no navbar)
   │
   ├─ showSplash === true      →  <SplashScreen />    (full-page, no navbar/footer)
   │
   └─ else (main site)         →  <Navbar> + <main> + <Footer> + all Modals
          │
          ├─ currentView === 'menu'  →  <MenuPage />
          └─ currentView === 'home'  →  <Hero> + <OffersSection> + <CouponsSection> + <AboutSection>
```

**Modal system** — all customer modals are controlled by `activeModal` string in `AppContext`:

| `activeModal` value | Component rendered |
|---|---|
| `'dine-in'` | `<DineInModal />` |
| `'takeaway'` | `<TakeawayModal />` |
| `'delivery'` | `<DeliveryModal />` |
| `'foodDetails'` | `<FoodDetailsModal />` |
| `'checkout'` | `<CheckoutModal />` |
| `'confirmation'` | `<ConfirmationModal />` |
| `'tracker'` | `<OrderTracker />` |
| `'receipt'` | `<EReceiptModal />` |
| `'auth'` | `<AuthModal />` |
| `'profile'` | `<ProfileDrawer />` |

---

## 5. Authentication System (How Login Works)

FrenchBell uses **two completely separate authentication paths** — one for customers (mobile OTP) and one for admin/staff (email + password). Both paths share the same `AuthContext` and produce a JWT stored in `localStorage`.

---

### 5.1 Customer Login — Mobile OTP Flow

**Files involved:**
- UI: [`src/components/AuthModal.jsx`](../src/components/AuthModal.jsx) — views `customer_phone` → `customer_otp`
- Context: [`src/context/AuthContext.jsx`](../src/context/AuthContext.jsx) — `sendOtp()`, `verifyOtp()`
- Server: [`server/index.js`](../server/index.js) — `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`

#### Complete Flow Diagram

```
Customer opens AuthModal
        │
        ▼
  [View: customer_phone]
  Enter name (optional) + 10-digit mobile + WhatsApp opt-in checkbox
        │
        ▼ Submit "Get 4-Digit OTP"
        │
  AuthContext.sendOtp(phone)
        │
        ├──► POST /api/auth/send-otp  { phone }
        │         │
        │         ├─ Normalize phone (strip country code, ensure 10 digits)
        │         ├─ Rate limit: max 5 requests per 10 minutes per number
        │         ├─ Invalidate any existing OTP for this number
        │         ├─ Generate crypto.randomInt(1000, 9999)  →  4-digit OTP
        │         ├─ SHA-256 hash stored in otpStore Map (in-memory)
        │         ├─ OTP expires in 5 minutes
        │         └─ Response: { otp (dev only), phone, message }
        │
        ├─ (fallback if server offline) → generate client-side 4-digit OTP
        │
        ▼
  [View: customer_otp]
  Shows SMS Code Simulator banner (dev mode) with the OTP + "Tap to Autofill"
  4 individual digit input boxes; auto-advances focus, auto-submits on last digit
        │
        ▼ User enters/taps 4-digit code
        │
  AuthContext.verifyOtp(phone, otp, name, whatsapp_opt_in)
        │
        ├──► POST /api/auth/verify-otp  { phone, otp, name, whatsapp_opt_in }
        │         │
        │         ├─ Normalize phone; validate OTP is exactly 4 digits
        │         ├─ Look up otpStore: check expiry + max 5 attempts
        │         ├─ SHA-256 hash comparison
        │         ├─ On match: delete OTP from store
        │         ├─ DB: lookup user by phone
        │         │     ├─ Not found → INSERT new customer user (role='customer')
        │         │     │              → Send "New Customer Registered" admin notification
        │         │     └─ Found → use existing user record
        │         ├─ Sign JWT: { id, role, name, phone }, expires in 30 days
        │         └─ Response: { token, user: { id, name, phone, email, role, whatsapp_opt_in } }
        │
        ├─ (fallback if server offline) → validate against locally stored OTP
        │                                  create local user object + local token
        │
        ▼
  setToken(data.token) + setUser(data.user)
  Both persisted to localStorage keys: fb_token, fb_user
  AuthModal closes → "Welcome to FrenchBell Cafe" toast notification
```

#### OTP Security Details

| Property | Value |
|---|---|
| OTP length | 4 digits |
| Storage | In-memory `Map` (server restart clears all OTPs) |
| Hash | SHA-256 of the OTP stored, not plaintext |
| Expiry | 5 minutes |
| Max wrong attempts | 5 per OTP request |
| Rate limit | 5 requests per 10 minutes per phone number |
| Token type | JWT, expires in 30 days |

> [!NOTE]
> In development, the OTP is returned in the API response and displayed in the SMS Simulator banner inside the modal. In production (`NODE_ENV=production`), the OTP is NOT returned in the response — it would need an actual SMS gateway integration (e.g., Twilio, MSG91) to deliver the code.

---

### 5.2 Admin Login — Email & Password Flow

There are **two separate admin login UIs** that share the same backend and AuthContext methods:

| Component | When used |
|---|---|
| [`AuthModal.jsx`](../src/components/AuthModal.jsx) views `admin_login` / `admin_forgot` / `admin_reset` | When customer taps "Admin & Operations Login" in the shared auth modal |
| [`AdminAuthView.jsx`](../src/components/admin/AdminAuthView.jsx) | Full-page login screen rendered when `currentView === 'admin'` |

#### Admin Login Flow

```
Admin opens AdminAuthView (or AuthModal admin tab)
        │
        ▼
  Enter email + password → Submit
        │
  AuthContext.adminEmailLogin(email, password)
        │
  ┌─────┴──────────────────────────────────────────────────────┐
  │  Fast-path (hardcoded passcodes — no server call needed)   │
  │  Accepts:  password === 'admin123'                         │
  │            password === 'admin'                            │
  │            password === 'FrenchBell@2026!'                 │
  │            email    === 'admin' or 'admin123'              │
  │  Returns local admin user object + local token immediately │
  └─────┬──────────────────────────────────────────────────────┘
        │  (if not a hardcoded passcode)
        ▼
  POST /api/auth/admin-login  { email, password }
        │
        ├─ Normalize email to lowercase
        ├─ Fast-path server check for passcodes (admin123, admin, FrenchBell@2026!)
        │     → finds/auto-creates default admin in DB
        │     → signs JWT { id, role, name, email }, expires 7 days
        │
        ├─ Else: find admin user by email in DB (role === 'admin')
        │     ├─ Not found + email matches .env ADMIN_EMAIL → auto-provision admin
        │     ├─ Status check: suspended → 403 error
        │     ├─ bcrypt.compare(password, password_hash)
        │     ├─ If env credentials rotated → sync hash
        │     ├─ Update last_login timestamp
        │     ├─ Log activity: "Admin Logged In"
        │     └─ Sign JWT { id, role, name, email }, expires 7 days
        │
        ▼
  setToken(data.token) + setUser(data.user)
  Persisted to localStorage: fb_token, fb_user
  AdminDashboard renders
```

#### Hardcoded Dev Credentials

| Email | Password | Notes |
|---|---|---|
| `manager@frenchbellcafe.com` | `admin123` | Default dev passcode |
| `manager@frenchbellcafe.com` | `FrenchBell@2026!` | Environment variable password |
| `admin` | `admin123` | Shorthand passcode (no real email) |
| *(any)* | `admin` | Passcode alias |

> [!CAUTION]
> The hardcoded passcodes (`admin123`, `admin`) are intentionally kept for prototype development and testing. **These must be removed or disabled before production deployment.**

---

### 5.3 Admin Forgot & Reset Password

```
Admin clicks "Forgot Password?" in AdminAuthView or AuthModal
        │
        ▼
  Enter registered admin email → Submit
        │
  POST /api/auth/admin-forgot-password  { email }
        │
        ├─ Find admin user by email in DB
        ├─ Generate crypto.randomBytes(32) → 64-char hex reset token
        ├─ Store in db.admin_password_resets: { email, token, expires_at (30 min), used: 0 }
        ├─ Build reset URL: https://<host>/?view=admin-reset-password&token=<token>
        └─ emailService.sendPasswordReset({ to, resetUrl, expiresInMinutes: 30 })
                │
                ▼
        Admin receives email with "Reset My Password" link
                │
                ▼
        Admin clicks link → AdminAuthView detects ?view=admin-reset-password&token=...
        → verifyResetToken() calls GET /api/auth/verify-reset-token?token=...
        → if valid, shows Create New Password form
                │
                ▼
        Admin enters new password + confirm password
        POST /api/auth/admin-reset-password  { token, newPassword, confirmPassword }
                │
                ├─ Validate token (not expired, not used)
                ├─ Find admin by email from reset record
                ├─ bcrypt.hash(newPassword, 10) → update password_hash
                ├─ Mark reset token as used (used: 1)
                ├─ Log activity: "Password Reset Completed"
                └─ Redirect back to login form
```

---

### 5.4 Admin Invitation & Team Onboarding

Existing admins can invite new team members to join as admins:

```
Admin → AdminUsersManager → "Invite Admin" button
        │
        ▼
  POST /api/admin/invite  { email }  (requires admin JWT)
        │
        ├─ Validate email format
        ├─ Check: email already an admin? → error
        ├─ Check: pending invitation exists? → error (or resend)
        ├─ Generate crypto.randomBytes(32) → 64-char hex invite token
        ├─ Store in db.admin_invitations: { email, token, expires_at (72h), status: 'pending', invited_by }
        ├─ Build invite URL: https://<host>/?view=accept-invitation&token=<token>
        └─ emailService.sendAdminInvitation({ to, invitationUrl, invitedByName, expiresInHours: 72 })
                │
                ▼
        Invitee receives email with invitation link
                │
                ▼
        Invitee clicks link → AdminAuthView detects ?view=accept-invitation&token=...
        → verifyInvitationToken() calls GET /api/admin/invite-info?token=...
        → if valid, shows Create Admin Account form (name + password)
                │
                ▼
        POST /api/admin/accept-invitation  { token, name, password, confirmPassword }
                │
                ├─ Validate token (not expired, status === 'pending')
                ├─ bcrypt.hash(password, 10)
                ├─ INSERT new user: { name, email, role: 'admin', status: 'active' }
                ├─ Mark invitation: status: 'accepted'
                ├─ Log activity: "Admin Account Created"
                ├─ Email all other active admins: "New Admin Joined"
                └─ Redirect to login form
```

---

### 5.5 JWT Token Management & Persistence

**File:** [`src/context/AuthContext.jsx`](../src/context/AuthContext.jsx)

Tokens and user objects are persisted in `localStorage` so users stay logged in across page refreshes:

| Key | Content |
|---|---|
| `fb_token` | Raw JWT string (or `fb_local_*` for offline/hardcoded logins) |
| `fb_user` | JSON-serialized user object `{ id, name, phone, email, role, whatsapp_opt_in }` |

```js
// Initialization (runs once on mount — reads from localStorage)
const [user, setUser] = useState(() => {
  const saved = localStorage.getItem('fb_user');
  return saved ? JSON.parse(saved) : null;
});
const [token, setToken] = useState(() => localStorage.getItem('fb_token') || null);

// Auto-persist on change (useEffect)
useEffect(() => {
  if (token) localStorage.setItem('fb_token', token);
  else localStorage.removeItem('fb_token');
}, [token]);
```

**Logout** clears both keys and resets both state values to `null`:

```js
const logout = () => {
  setToken(null);
  setUser(null);
  localStorage.removeItem('fb_token');
  localStorage.removeItem('fb_user');
};
```

**Local tokens** (prefix `fb_local_`) — generated for hardcoded admin passcodes or when the server is offline — are accepted by the server middleware without database verification, making them useful for prototype testing.

---

### 5.6 Auth Context API Reference

All of these are available via `const { ... } = useAuth()`:

| Method / Value | Type | Description |
|---|---|---|
| `user` | `Object \| null` | Current logged-in user |
| `token` | `string \| null` | JWT or local token |
| `isAdmin` | `boolean` | `true` if `user.role === 'admin'` |
| `loading` | `boolean` | Auth operation in progress |
| `sendOtp(phone)` | `async fn` | Send 4-digit OTP to phone; returns OTP in dev |
| `verifyOtp(phone, otp, name?, whatsapp_opt_in?)` | `async fn` | Verify OTP, creates user, returns `{ token, user }` |
| `updateProfile({ name, whatsapp_opt_in })` | `async fn` | Update logged-in customer's profile |
| `adminEmailLogin(email, password)` | `async fn` | Admin email+password login |
| `adminLogin(passcode)` | `async fn` | Legacy passcode wrapper (`adminEmailLogin` shorthand) |
| `adminForgotPassword(email)` | `async fn` | Request password reset email |
| `adminResetPassword(email, token, newPw, confirmPw)` | `async fn` | Execute password reset |
| `logout()` | `fn` | Clear user + token from state + localStorage |
| `lastGeneratedOtp` | `string \| null` | Last OTP from sendOtp (for offline fallback) |

---

### 5.7 Server-side Auth Middleware

**File:** [`server/index.js`](../server/index.js)

#### `authenticateToken` middleware

Applied to all protected routes. Extracts JWT from `Authorization: Bearer <token>` header:

```js
const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  // Accept local/prototype tokens without DB verification
  if (token?.startsWith('fb_local_') || token?.startsWith('admin_jwt_')) {
    req.user = { id: 1, role: 'admin', ... };
    return next();
  }

  // Verify real JWT
  const payload = jwt.verify(token, JWT_SECRET);
  const user = await db.get('SELECT * FROM users WHERE id = ?', [payload.id]);
  // Check user exists + not suspended
  req.user = { ...payload, ...user };
  next();
};
```

#### `requireAdmin` middleware

Stacked after `authenticateToken` on admin-only routes:

```js
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Administrator access required.' });
  }
  next();
};
```

#### Customer Profile Update

```
PUT /api/auth/profile          (requires authenticateToken)
Body: { name, whatsapp_opt_in }
→ Updates user in DB, returns updated user object
```

---

## 6. State Management (AppContext)

**File:** [`src/context/AppContext.jsx`](../src/context/AppContext.jsx)

All global customer-facing state lives in `AppContext`. Accessed via `const { ... } = useApp()`.

### Key State Slices

| State | Type | Persisted? | Description |
|---|---|---|---|
| `currentView` | `'home' \| 'menu' \| 'admin'` | No | Active page view |
| `orderMode` | `'takeaway' \| 'dine-in' \| 'delivery'` | `fb_order_mode` | Selected order type |
| `lockedTableNumber` | `string \| null` | No | Table number from QR scan |
| `cart` | `Array` | `fb_cart` | Cart items array |
| `menuItems` | `Array` | `fb_menu_items` | Active menu items |
| `categories` | `Array` | No | Menu categories |
| `offers` | `Array` | `fb_offers` | Active coupons/offers |
| `advertisements` | `Array` | `fb_advertisements` | Banner advertisements |
| `inventory` | `Array` | `fb_inventory` | Raw ingredient inventory |
| `settings` | `Object` | No | Cafe config (hours, fees, URLs) |
| `activeModal` | `string \| null` | No | Currently open modal |
| `activeOrder` | `Object \| null` | No | Last placed order |
| `notifications` | `Array` | No | Active toast notifications |

### Cart Item Schema

```js
{
  cartItemId: string,       // Unique key: `${id}-${variant}-${instructions.slice(0, 20)}`
  id: number,               // Menu item ID
  name: string,
  variant: string | null,   // 'Veg', 'Chicken', or null
  specialInstructions: string,
  price: number,
  quantity: number,
  image_url: string,
  category_slug: string,
  veg_type: 'veg' | 'non-veg'
}
```

### Pricing Calculation

```
cartSubtotal   = sum(item.price × item.quantity)
discountAmount = computeDiscount(appliedOffer, cartSubtotal)
taxAmount      = round((cartSubtotal - discountAmount) × taxRate)   // taxRate = 5% GST by default
deliveryCharge = (orderMode === 'delivery' && cartSubtotal < 199) ? 25 : 0
grandTotal     = cartSubtotal - discountAmount + taxAmount + deliveryCharge
```

### Auto Best-Coupon Logic

On every cart change, the context automatically finds and applies the coupon giving the **maximum savings** from all active eligible offers, unless the user has manually selected a coupon themselves.

### QR Table Scan

On page load, `AppContext` reads URL parameters `?table=<n>&mode=<mode>`. If `table` is present, it auto-sets `orderMode = 'dine-in'` and locks the table number — customers scanned via QR code go directly into dine-in ordering for their table.

### Data Sync

On app init, `AppContext` fetches live data from the server:

```
GET /api/menu          → setMenuItems()
GET /api/categories    → setCategories()
GET /api/offers        → setOffers()
GET /api/advertisements → setAdvertisements()
GET /api/settings      → setSettings()
```

Falls back to localStorage-cached or static seed data if the server is unavailable.

---

## 7. UI Components Reference

| Component | File | Purpose |
|---|---|---|
| `Navbar` | `Navbar.jsx` | Sticky top bar: logo, nav links, order mode toggle, search, cart badge, user avatar |
| `Hero` | `Hero.jsx` | Homepage hero with banner carousel, order mode selector, featured items |
| `MenuPage` | `MenuPage.jsx` | Full menu with category tabs, search, dietary filter, food cards |
| `MenuSection` | `MenuSection.jsx` | Menu grid section (used in hero) |
| `FoodCard` | `FoodCard.jsx` | Individual food item card with add-to-cart |
| `FoodDetailsModal` | `FoodDetailsModal.jsx` | Full-screen food detail: portion/spice options, quantity picker |
| `CartDrawer` | `CartDrawer.jsx` | Slide-out cart with item controls, coupon input, totals |
| `CheckoutModal` | `CheckoutModal.jsx` | Checkout form + sandbox payment rail (UPI/Card/COD) |
| `ConfirmationModal` | `ConfirmationModal.jsx` | Order placed success + confetti animation |
| `OrderTracker` | `OrderTracker.jsx` | Live order status timeline tracker |
| `EReceiptModal` | `EReceiptModal.jsx` | Digital e-receipt with PDF download |
| `ProfileDrawer` | `ProfileDrawer.jsx` | Customer profile, order history, settings |
| `AuthModal` | `AuthModal.jsx` | Shared auth modal: customer OTP + admin login |
| `DineInModal` | `DineInModal.jsx` | Dine-in order details form (table, people, instructions) |
| `TakeawayModal` | `TakeawayModal.jsx` | Takeaway form (name, phone, pickup time) |
| `DeliveryModal` | `DeliveryModal.jsx` | Delivery form (address, landmark, pincode) |
| `BannerCarousel` | `BannerCarousel.jsx` | Auto-sliding hero advertisement carousel |
| `OffersSection` | `OffersSection.jsx` | Promotional offers/deals section |
| `CouponsSection` | `CouponsSection.jsx` | Coupon code cards with claim action |
| `AboutSection` | `AboutSection.jsx` | About the cafe with map embed |
| `Footer` | `Footer.jsx` | Footer with social links, app store badges, contact |
| `NotificationsToast` | `NotificationsToast.jsx` | Auto-dismissing toast notifications (4.5s) |
| `SplashScreen` | `SplashScreen.jsx` | Cinematic animated intro portal |
| `CurvedUnderline` | `CurvedUnderline.jsx` | Sinusoidal wavy SVG underline for headings |

---

## 8. Admin Dashboard System

**Entry:** When `currentView === 'admin'`, `App.jsx` renders `<AdminDashboard onBackToSite={...} />` full-page.

`AdminDashboard` internally checks `isAdmin` from `useAuth()`. If not logged in, it renders `<AdminAuthView />`. Once authenticated, it shows the full management system with `<AdminSidebar />`.

### Admin Modules

| Tab / Module | Component | Capabilities |
|---|---|---|
| Live Orders | `LiveOrderBoard` | Real-time order board with status update controls |
| Menu Manager | `MenuManager` | Add/edit/delete menu items, toggle availability, image upload |
| Categories | `CategoryManager` | Manage food categories, icons, display order |
| Inventory | `InventoryManager` | Track raw ingredients, restock, low-stock alerts |
| Customers | `CustomerManager` | View all customers, search, suspend accounts |
| Analytics | `AnalyticsDashboard` + `AnalyticsCharts` | Revenue charts, best sellers, order trends |
| Offers | `OfferManager` | Create/edit/deactivate coupons and promotional offers |
| Payments | `PaymentManager` | View payment records, reconcile orders |
| Receipts | `ReceiptManager` | Browse and download all e-receipts |
| Delivery | `DeliverySettings` | Configure delivery zones, fees, zones |
| Cafe Settings | `CafeSettingsManager` | Update cafe info, hours, GST rate, social links |
| QR Codes | `TableQRManager` | Generate and print QR codes for each table |
| Advertisements | `AdvertManager` | Manage banner carousel advertisements |
| Activity Logs | `ActivityLogsManager` | Full audit trail of all admin actions |
| Team | `AdminUsersManager` | Invite/manage/suspend admin accounts |

---

## 9. Backend Server (Express API)

**File:** [`server/index.js`](../server/index.js) · Port: `5000` (configurable via `PORT` env var)

### API Route Groups

#### Auth Routes
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/send-otp` | None | Send 4-digit OTP to customer phone |
| POST | `/api/auth/verify-otp` | None | Verify OTP, create/login customer |
| PUT | `/api/auth/profile` | JWT | Update customer profile |
| POST | `/api/auth/admin-login` | None | Admin email+password login |
| POST | `/api/auth/admin-forgot-password` | None | Send password reset email |
| GET | `/api/auth/verify-reset-token` | None | Validate reset token |
| POST | `/api/auth/admin-reset-password` | None | Execute password reset |
| GET | `/api/auth/me` | JWT | Get current user info |

#### Admin Invitation Routes
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/invite` | Admin JWT | Invite new admin by email |
| GET | `/api/admin/invite-info` | None | Get invitation details by token |
| POST | `/api/admin/accept-invitation` | None | Accept invite, create admin account |
| POST | `/api/admin/invitations/:id/resend` | Admin JWT | Resend an invitation |
| DELETE | `/api/admin/invitations/:id` | Admin JWT | Cancel an invitation |

#### Menu & Category Routes
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/menu` | None | Get all active menu items |
| POST | `/api/menu` | Admin JWT | Create menu item |
| PUT | `/api/menu/:id` | Admin JWT | Update menu item |
| DELETE | `/api/menu/:id` | Admin JWT | Delete menu item |
| GET | `/api/categories` | None | Get all categories |
| POST | `/api/categories` | Admin JWT | Create category |
| PUT | `/api/categories/:id` | Admin JWT | Update category |
| DELETE | `/api/categories/:id` | Admin JWT | Delete category |

#### Orders, Customers, Settings, etc.
Additional routes handle: orders, customers, offers, advertisements, inventory, settings, payments, receipts, analytics, activity logs, and admin notifications.

### Database

The server uses a **JSON file-based database** (`server/frenchbell_db.json`) via the custom `db.js` helper. This makes the prototype easy to run without external DB setup.

Main collections in the JSON store:
- `users` — customers and admins
- `menu_items`, `categories`
- `orders`
- `offers`, `advertisements`
- `inventory`
- `settings`
- `admin_invitations`, `admin_password_resets`
- `activity_logs`, `admin_notifications`
- `payments`, `receipts`

> [!TIP]
> For production, consider migrating to PostgreSQL or MySQL using the reference `server/schema.sql`. The `db.js` abstraction layer makes this migration straightforward.

---

## 10. Magical Splash Screen Architecture

**File:** [`src/components/SplashScreen.jsx`](../src/components/SplashScreen.jsx)

### Component Isolation

The splash screen runs as a completely independent screen — no `Navbar`, `Footer`, or any other UI. `App.jsx` enforces this with:

```jsx
if (showSplash) {
  return <SplashScreen onComplete={() => setShowSplash(false)} />;
}
```

### Visual Theme (FrenchBell Brand Palette)

1. **Espresso Cosmic Atmosphere**: Primary surface `#140804`, radial vignette `#241208` → `#0D0402`, center nebula glow with amber undertones.
2. **Rotating Portal Rings**: Concentric spiral arcs in `#D4AF37` and `#F8F1D7`, rotating at 32s and 24s cycles.
3. **Central Portal Core**: FrenchBell logo in a double golden rim with shockwave ripple rings on food arrivals.

### Sequential Typography

- **Phase 1** (0.4s – 2.0s): *"Follow the aroma..."* — italic Playfair Display serif in glowing ivory
- **Phase 2** (2.0s – 3.7s): *"You're entering FrenchBell Cafe ☕✨"* — golden glassmorphic pill badge
- **Camera Zoom** (~3.7s): Full portal core zooms to `scale: 14` dissolving into the homepage

### The 10 Floating Food Items

All crafted as pure vector SVGs in [`src/components/FoodIllustrations.jsx`](../src/components/FoodIllustrations.jsx):

| # | Icon | Description |
|---|---|---|
| 1 | `BurgerIcon` | Gourmet double patty with golden sesame bun, cheddar drips, lettuce, tomato |
| 2 | `CroissantIcon` | Flaky French butter croissant with layered golden crescent folds |
| 3 | `FriesIcon` | FrenchBell branded red-and-gold cup with crispy golden fry sticks |
| 4 | `DonutIcon` | Strawberry glazed donut with multi-colored sprinkles |
| 5 | `PizzaIcon` | Cheesy slice with molten mozzarella, pepperoni, and basil |
| 6 | `CoffeeCupIcon` | Espresso cup with latte art heart and steam wisps |
| 7 | `CakeIcon` | Layered chocolate & vanilla sponge with whipped frosting and cherry |
| 8 | `SandwichIcon` | Triangular club sandwich with grilled toast lines |
| 9 | `CookieIcon` | Freshly baked chocolate chip cookie with melting chunks |
| 10 | `DrinkCupIcon` | Iced cafe drink with dome lid, colorful straw, and ice splash |

---

## 11. Mathematical Spiral Vortex & Gravitational Physics

### GPU-Accelerated Polar Orbital Transform

Each food item uses a **nested polar orbital transform hierarchy** for butter-smooth 60fps/120fps motion:

1. **Outer Rotating Arm**: Rotates from `θ_start` to `θ_start + turns × 360°` with cubic-bezier `[0.3, 0, 0.2, 1]`
2. **Inner Radial Gravity Slider**: Translates along X-axis from `R_start` → `0` (center logo) following power-law:

$$r(t) = R_{\text{start}} \times (1 - t)^{1.35}$$

3. **Compound Projection**: Because rotation and translation execute concurrently on the GPU:

$$\begin{pmatrix} X(t) \\ Y(t) \end{pmatrix} = r(t) \begin{pmatrix} \cos\theta(t) \\ \sin\theta(t) \end{pmatrix}$$

This produces a mathematically pure, continuous logarithmic spiral with zero polygon stepping.

4. **Living Wobble**: Harmonic sinusoidal oscillations simulate weightlessness:
$$\text{rot}(t) = \text{tilt} \times \sin(4\pi t) \qquad y(t) = 8\text{px} \times \cos(4\pi t)$$

### Viewport Distribution & Timeline

| # | Item | Direction | `θ_start` | Turns | Delay | Duration |
|---|---|---|---|---|---|---|
| 1 | Gourmet Burger | Top | −75° | 1.45 | 0.00s | 2.25s |
| 2 | Butter Croissant | Top-Right | −35° | 1.35 | 0.15s | 2.20s |
| 3 | Crispy Fries | Right | +15° | 1.50 | 0.30s | 2.30s |
| 4 | Berry Donut | Bottom-Right | +55° | 1.40 | 0.45s | 2.20s |
| 5 | Cheesy Pizza | Bottom | +105° | 1.45 | 0.60s | 2.25s |
| 6 | Espresso Latte | Bottom-Left | +150° | 1.38 | 0.75s | 2.20s |
| 7 | Chocolate Cake | Left | +195° | 1.52 | 0.90s | 2.30s |
| 8 | Club Sandwich | Top-Left | +240° | 1.42 | 1.05s | 2.20s |
| 9 | Choco Cookie | Upper-Left | +285° | 1.46 | 1.20s | 2.25s |
| 10 | Iced Drink | Upper-Right | +335° | 1.36 | 1.35s | 2.20s |

### Scale & Rotation Breathing

- Starts at scale `0.35` (cosmic emergence) → grows to `1.0` → breathes `1.0 ± 0.07` → plunges to `0.05` at center pull-in
- Rotational wobble: $\text{rot}(p) = 300° \cdot p + 20° \cdot \sin(5\pi \cdot p)$

---

## 12. Verification Checklist

- [x] **Dual auth paths**: Customer OTP + Admin email/password, fully independent
- [x] **JWT persistence**: Token + user stored in `localStorage`, survive page refresh
- [x] **OTP security**: SHA-256 hashed storage, 5-min expiry, 5 attempt limit, rate limited
- [x] **Admin password reset**: Real email dispatch with 30-min expiry token
- [x] **Admin invitation flow**: 72-hour invite tokens with email notification to existing admins
- [x] **Hardcoded dev passcodes**: `admin123`, `admin`, `FrenchBell@2026!` for easy prototype testing
- [x] **Offline fallback**: Both OTP and admin login have local fallbacks when server is offline
- [x] **QR table scan**: `?table=<n>` auto-sets dine-in mode and locks table number
- [x] **Auto best-coupon**: Automatically applies the maximum-saving eligible coupon
- [x] **Cart persistence**: Cart survives page refresh via `localStorage`
- [x] **Theme matches FrenchBell brand**: Espresso `#1F110A`, gold `#D4AF37`, cream accents
- [x] **Magical splash screen**: Concentric portal rings, golden stardust, gravitational spiral food vortex
- [x] **All 10 vector food items**: Pure SVG, no raster images or emojis
- [x] **No navigation on splash**: Enforced by isolated rendering gate in `App.jsx`
- [x] **Smooth zoom-through transition**: Portal core zooms `scale: 14` into the homepage
- [x] **Reduced-motion support**: `prefers-reduced-motion` media query respected
- [x] **Zero build errors**: `vite build` completes with 0 errors
