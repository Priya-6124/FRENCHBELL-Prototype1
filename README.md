# French Bell Cafe — Gourmet Quick Bites & Cafe Management System

> **"Good food. Great mood."**  
> An end-to-end cafe web application and operational management platform for **French Bell Cafe** (K. Narayanpura, Bengaluru – 560077).

---

## Highlights & Key Features

### 1. Spiral Food Illustration Splash Screen
- Independent introductory animation matching the official FrenchBell warm cream design language.
- Clean vector food illustrations (Burger, Fries, Momos, Strips, Sandwich, Kathi Roll, Loaded Fries, and Platter).
- Authentic French Bell logo in the center with smooth spiral vortex animation and micro-bounce eating reaction.
- Golden cafe bell sound effect on launch (`playSplashSound`).
- Zero navigation bar, header, or footer during splash; seamless transition to the main website.

### 2. Mobile-Only OTP Customer Authentication
- Seamless 10-digit Indian mobile number sign-in with 4-digit SMS OTP verification.
- **Order Protection Gate**: Customers cannot place orders without verifying their mobile number.
- Simulated SMS auto-fill notification banner for instant prototype testing.
- Manager direct passcode login (`admin123`) with instant admin token generation.

### 3. Table QR Code Dine-In Ordering Mode
- Seated customers can scan physical table standees (e.g. `/?table=04&mode=dine-in`) to unlock a locked-in table ordering experience.
- Automatic table assignment (`Table #04`), eliminating wait times for servers.
- Orders route directly to the Kitchen Display System (KDS) with table badges.

### 4. 3-Way Order Fulfillment & Dietary Filters
- **Order Fulfillment Switcher**:
  - **Dine-In**: Select Table number & party size.
  - **Takeaway**: Express counter pickup with preparation ETA.
  - **Delivery**: Free delivery within 2 KM radius (Rs.15/km beyond 2km).
- **Dietary Filter Switcher**: One-tap toggle between **All Items**, **Pure Veg**, and **Non-Veg**.

### 5. Rich Food Customization Modal
- Clicking any menu dish opens the culinary customizer:
  - **Portion Sizes**: Regular, Large (+Rs.40), Jumbo (+Rs.80).
  - **Filling Options**: Classic Veg / Crispy Chicken.
  - **Spice Levels**: Mild, Medium, Fiery Spiced.
  - **Add-ons & Dips**: Molten Cheese (+Rs.30), Peri Peri Dip (+Rs.20), Jalapenos (+Rs.15), Garlic Mayo (+Rs.20), Extra Crispy Strip (+Rs.45).
  - **Chef Cooking Notes**: Special instructions box.

### 6. Interactive Payment Sandbox & Success Celebration
- Interactive payment module supporting:
  - **UPI**: Google Pay, PhonePe, Paytm, and Cafe QR scan simulator.
  - **Credit & Debit Cards**: Interactive test card simulator.
  - **NetBanking**: All major banks.
  - **Pay at Counter / Cash on Delivery**.
- Smooth processing animation followed by celebratory confetti explosion and **Payment Success Chime** (`playPaymentSuccessSound`).

### 7. Daily Order Sequence (FB001 - FB999) Resetting at 2:00 AM
- Order numbers follow a clean `FB001`, `FB002`, `FB003` sequence.
- Built-in business day algorithm with **2:00 AM cutoff**:
  - Orders placed between 00:00 and 01:59 belong to the previous day's shift.
  - Every day after 2:00 AM, the sequence resets fresh to `FB001`.

### 8. Comprehensive Cafe Management & Admin Operations
- **Live Kanban Kitchen Display System (KDS)**: Real-time 4-stage pipeline (*Received -> In Kitchen -> Ready to Serve -> Completed*).
- **Table QR Standee Generator**: View all tables (01 to 12) with instant print-ready PNG download for acrylic standees.
- **Menu & Inventory Manager**: Add/edit dishes with device photo upload or food presets, live price updates, and "In Stock / Sold Out" switches.
- **Promotional Offers & Coupons**: Create percentage/flat discount codes with minimum order limits and instant customer broadcast.
- **Advertisement & Banner Manager**: Upload and schedule homepage hero banners and special deal announcements.
- **Analytics Dashboard & Data Export**:
  - KPI cards (Daily Revenue, Total Orders, Average Order Value, Active Customers).
  - Revenue trends and fulfillment type distribution charts.
  - **1-Click CSV / Report Export** for accounting and performance analysis.
- **Cafe Settings**: Configure delivery charges, GST rates, store status, and cafe timings.

---

## Sound Policy
In strict compliance with project specifications:
- **Splash Screen Sound**: `playSplashSound()` (Golden bell chime)
- **Payment Success Sound**: `playPaymentSuccessSound()` (Melodious payment confirmation)
- All other sound triggers have been removed.

---

## Local Image Assets
All images use local assets:
- `public/assets/food/burger.jpg` — Gourmet Double Patty Burger
- `public/assets/food/fries.jpg` — Crispy Peri Peri French Fries
- `public/assets/food/momos.jpg` — Steamed & Fried Gourmet Momos
- `public/assets/food/strips.jpg` — Golden Crispy Chicken Strips
- `public/assets/food/sandwich.jpg` — Grilled Triple Decker Sandwich
- `public/assets/food/rolls.jpg` — Kathi & Shawarma Fusion Rolls
- `public/assets/food/loaded.jpg` — Cheesy Blaster Loaded Bowl
- `public/assets/food/platter.jpg` — Grand Sampler & Special Platters
- `public/assets/logo.jfif` — Official French Bell Cafe Brand Logo

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Run Development Server
```bash
# Runs Express backend (port 5000) and Vite frontend (port 3000) concurrently
npm run dev
```

- **Customer Website**: http://localhost:3000
- **Table QR Dine-In Test**: http://localhost:3000/?table=04&mode=dine-in
- **Backend API**: http://localhost:5000

### 4. Admin Access
- Click **"Admin Portal"** in the top navigation bar or footer.
- Quick login passcode: `admin123` or use registered manager phone `9876543210`.

---

## Project Architecture

```
FrenchBell_Prototype/
├── docs/
│   └── CUSTOMER_SIDE_CODE_DOCUMENTATION.md # Customer architecture documentation
├── public/
│   └── assets/
│       ├── logo.jfif              # French Bell Cafe Official Logo
│       ├── food/                  # AI Food Photography Assets
│       │   ├── burger.jpg
│       │   ├── fries.jpg
│       │   ├── momos.jpg
│       │   ├── strips.jpg
│       │   ├── sandwich.jpg
│       │   ├── rolls.jpg
│       │   ├── loaded.jpg
│       │   └── platter.jpg
│       └── uploads/               # Admin uploaded images directory
├── server/
│   ├── index.js                   # Express server & REST API routes
│   ├── db.js                      # PureDb engine with 2 AM FB001 reset logic
│   └── frenchbell_db.json         # Persisted database store
├── src/
│   ├── assets/                    # Local brand assets
│   ├── components/
│   │   ├── SplashScreen.jsx       # Spiral vector food animation splash
│   │   ├── FoodIllustrations.jsx  # Polished SVG vector food icons
│   │   ├── BrandIcons.jsx         # Custom SVG Brand Icons (WhatsApp, Instagram, etc.)
│   │   ├── Navbar.jsx             # Top bar with Cart, Profile & Admin links
│   │   ├── Hero.jsx               # Hero section & table scan banner
│   │   ├── OrderModeToggle.jsx    # Dine-In / Takeaway / Delivery toggle
│   │   ├── FoodCard.jsx           # Interactive food cards with customizer trigger
│   │   ├── FoodDetailsModal.jsx   # Portion, spice, variant & add-on customizer
│   │   ├── CartDrawer.jsx         # Live sliding cart with customized breakdown
│   │   ├── CheckoutModal.jsx      # Mobile OTP gate & payment sandbox
│   │   ├── ConfirmationModal.jsx  # Order success modal with FB001 reference
│   │   ├── OrderTracker.jsx       # Real-time order preparation tracker
│   │   ├── EReceiptModal.jsx      # Printable receipt & WhatsApp dispatcher
│   │   ├── AuthModal.jsx          # Customer 4-digit mobile OTP verification
│   │   ├── ProfileDrawer.jsx      # Order history & user profile
│   │   └── admin/
│   │       ├── AdminDashboard.jsx     # Master cafe operations center
│   │       ├── AdminSidebar.jsx       # Operations navigation
│   │       ├── LiveOrderBoard.jsx     # Real-time KDS Kanban board
│   │       ├── TableQRManager.jsx     # Table QR standee generator & PNG export
│   │       ├── MenuManager.jsx        # Menu CRUD with device image upload
│   │       ├── OfferManager.jsx       # Coupon creator & active broadcaster
│   │       ├── AdvertManager.jsx      # Promo banner manager
│   │       ├── AnalyticsDashboard.jsx # Revenue charts & sales metrics
│   │       └── ExportModal.jsx        # CSV, Excel & PDF report exporter
│   ├── context/
│   │   ├── AppContext.jsx         # Cart, dietary filter, and cafe state
│   │   └── AuthContext.jsx        # Mobile OTP & manager auth state
│   ├── data/
│   │   └── menuData.js            # Seed catalog with French Bell dishes
│   ├── utils/
│   │   └── audio.js               # Web Audio synth (Splash & Payment chime)
│   ├── App.jsx                    # Root application component
│   └── main.jsx                   # React entry point
├── package.json                   # Scripts & dependency definitions
├── tailwind.config.js             # French Bell color scheme & typography
└── README.md                      # Documentation
```

---

## API Reference Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/send-otp` | Sends 4-digit OTP to mobile number |
| `POST` | `/api/auth/verify-otp` | Verifies OTP and returns customer auth token |
| `POST` | `/api/auth/admin-login` | Authenticates operations manager (`admin123`) |
| `GET` | `/api/menu` | Fetches active categorized menu |
| `POST` | `/api/upload` | Uploads local base64 images to `/assets/uploads/` |
| `POST` | `/api/orders` | Places order with daily sequential `FB001` numbering |
| `GET` | `/api/orders` | Retrieves live orders with status/type filters |
| `PUT` | `/api/orders/:id/status` | Updates order stage in KDS Kanban |
| `GET` | `/api/offers` | Fetches active discount coupons |
| `GET` | `/api/advertisements` | Fetches active promo banners |
| `GET` | `/api/tables` | Generates table QR URLs for Tables 1 to 12 |
| `GET` | `/api/analytics/summary`| Aggregated revenue and order analytics |
| `GET` | `/api/analytics/export` | Downloads complete sales CSV report |

---

## French Bell Cafe Details
- **Location**: K. Narayanpura, Bengaluru – 560077, Karnataka
- **Hours**: 11:00 AM – 11:30 PM (Daily)
- **Hotline**: +91 98765 43210
