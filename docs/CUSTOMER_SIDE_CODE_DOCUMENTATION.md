# FrenchBell Cafe — Customer-Side Architecture & Code Documentation

This documentation provides an architectural and technical reference for the customer-facing frontend of **FrenchBell Cafe** (K. Narayanpura, Bengaluru – 560077), detailing the **Magical Food Portal Splash Screen Architecture**, mathematical spiral vortex gravitational physics, vector food illustrations, sequential typography, camera zoom-through transition, and code hygiene.

---

## 1. System Overview

FrenchBell Cafe is a single-page cafe ordering web application built with React 18, Vite 5, Tailwind CSS 3, and Framer Motion 11. It delivers an end-to-end customer journey from introductory branding, dine-in table QR ordering, takeaway/delivery fulfillment, portion/spice customization, mobile OTP verification, sandboxed multi-rail payments, to live order tracking and digital e-receipt generation with WhatsApp dispatch.

---

## 2. Magical Food Portal Splash Screen Architecture

### 2.1 Component & File Locations
- **Splash Screen Component**: `src/components/SplashScreen.jsx`
- **Vector Food Illustrations**: `src/components/FoodIllustrations.jsx`
- **Brand SVG Icons**: `src/components/BrandIcons.jsx`
- **Audio Synthesizer Engine**: `src/utils/audio.js`
- **Root Layout Gate**: `src/App.jsx`
- **Styling Configuration**: `src/index.css`, `tailwind.config.js`
- **Central Brand Logo Asset**: `public/assets/logo.jfif` (and `src/assets/logo.jfif`)

---

### 2.2 Complete Isolation & Navigation Removal
In strict accordance with project requirements:
- **No Navigation Bar**: The splash screen does NOT render any navigation bar, header, hamburger menu, search bar, profile icon, cart counter, or footer.
- **No Skip Button**: The splash screen runs as an immersive, continuous cinematic experience without any skip buttons.
- **Independent Entry Screen**: `src/App.jsx` enforces an explicit conditional rendering gate:
  ```jsx
  // Splash Screen Intro: Completely independent screen with NO navigation bar, header, or footer
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-french-cream font-sans text-french-dark relative">
      <Navbar onNavigate={handleNavigate} currentView={currentView} />
      ...
    </div>
  );
  ```
- The main website's `Navbar`, `Hero`, `MenuPage`, `Footer`, and modals are mounted **only after** the splash screen sequence completes and `showSplash` transitions to `false`.

---

### 2.3 Additional Design Refinements
1. **Wavy Underlines across Headings**:
   - `src/components/CurvedUnderline.jsx` was upgraded to an authentic sinusoidal wavy/squiggly stroke path (`M 2 9 C 14 2, 26 16, 38 9 ...`), enhancing all major section headers across the Hero, Offers, Coupons, About, and Menu pages.
2. **Footer App Icons & Store Badges**:
   - `src/components/Footer.jsx` and `src/components/BrandIcons.jsx` now feature authentic full-color squircle app icons for WhatsApp, Instagram, and Facebook, alongside official **Google Play** and **Apple App Store** download badges.
3. **Receipt Modal Sound & Action Cleanup**:
   - `src/components/EReceiptModal.jsx` has removed all sound effects and removed the "Send to WhatsApp" button, keeping **only** a clean, prominent **Download PDF** action button.
4. **Ultra-Smooth GPU Polar Transforms**:
   - In `src/components/SplashScreen.jsx`, the orbital spiral was converted to continuous parametric polar transforms with hardware-accelerated cubic-bezier curves for fluid 60fps/120fps motion.

---

### 2.3 Visual Theme Parity (FrenchBell Brand Palette)
The splash screen adopts the deep, luxury cafe aesthetic of FrenchBell:
1. **Espresso Cosmic Atmosphere**:
   - Primary surface: `#140804` (deep roasted espresso).
   - Radial vignette: `#241208` to `#0D0402`.
   - Center nebula glow: Radiant golden halo (`rgba(212, 175, 55, 0.45)` with amber undertones).
2. **Rotating Portal Rings**:
   - Concentric vector spiral arcs (`#D4AF37` and `#F8F1D7`) rotating with smooth 32s continuous angular momentum.
   - Counter-rotating inner dashed energy ring (24s cycle).
   - Ambient floating aroma stardust and gold sparkles gently breathing in space.
3. **Central Portal Core**:
   - The authentic FrenchBell Cafe logo (`/assets/logo.jfif`) centered horizontally and vertically.
   - Framed in a double golden rim (`#D4AF37`) with golden backlight glow (`gold-glow`).
   - Responds to each arriving food item with gravitational shockwave ripple rings and a playful micro-bounce.
4. **Sequential Storytelling Typography**:
   - **Phase 1** ($0.4\text{s} - 2.0\text{s}$):
     *"Follow the aroma..."* (italic Playfair Display serif in glowing ivory `#F8F1D7` with spinning sparkles).
   - **Phase 2** ($2.0\text{s} - 3.7\text{s}$):
     *"You're entering FrenchBell Cafe ☕✨"* (golden glassmorphic pill badge with bouncing coffee cup and sparkles).
5. **Camera Zoom-Through Transition**:
   - At $t \approx 3.7\text{s}$, the entire portal core smoothly zooms forward (`scale: 14`, with warm golden lens bloom).
   - Dissolves seamlessly into the homepage as the user "enters" the cafe.

---

### 2.4 The 10 Floating Food Items (Vector Illustrations)
All 10 requested food items are crafted as pure vector SVGs in `src/components/FoodIllustrations.jsx`:
1. **Burgers (`BurgerIcon`)**: Gourmet double patty burger with golden sesame bun, melted cheddar cheese drips, lettuce, and tomato.
2. **Fries (`FriesIcon`)**: FrenchBell branded red-and-gold cup with golden crispy fry sticks.
3. **Pizza (`PizzaIcon`)**: Cheesy pizza slice with bubbling crust, molten mozzarella, pepperoni, and basil flecks.
4. **Croissants (`CroissantIcon`)**: Flaky French butter croissant with layered golden crescent folds.
5. **Donuts (`DonutIcon`)**: Round strawberry glazed donut with center hole and multi-colored sprinkles.
6. **Coffee (`CoffeeCupIcon`)**: Espresso cup with golden saucer, latte art heart, and rising steam wisps.
7. **Cakes (`CakeIcon`)**: Layered chocolate & vanilla sponge cake slice with whipped frosting and cherry on top.
8. **Sandwiches (`SandwichIcon`)**: Triangular club sandwich with grilled toast lines, cheese, and crisp greens.
9. **Cookies (`CookieIcon`)**: Freshly baked chocolate chip cookie with melting chocolate chunks.
10. **Drinks (`DrinkCupIcon`)**: Iced cafe drink with dome lid, colorful straw, ice cubes, and splash droplets.

Each item floats inside a dark glassmorphic badge (`from-[#2D170C]/90 to-[#1A0C06]/90 border border-french-gold/60`) with soft gold shadow.

---

## 3. Mathematical Spiral Vortex & Gravitational Wobble Physics

### 3.1 GPU-Accelerated Polar Orbital Transform System
To eliminate piece-wise linear polygonal stepping and achieve buttery, 60fps/120fps hardware-accelerated fluid curvature, the spiral animation utilizes a **nested polar orbital transform hierarchy**:

1. **Outer Rotating Orbital Arm (`rotate`)**:
   - Anchored at the screen center (`(0, 0)` with `transformOrigin: '0 0'`).
   - Smoothly rotates from $\theta_{\text{start}}$ to $\theta_{\text{start}} + \text{turns} \times 360^\circ$ using cubic-bezier curvature `[0.3, 0, 0.2, 1]`.
2. **Inner Radial Gravity Slider (`translateX`)**:
   - Translates along the radial $X$-axis from $R_{\text{start}}$ inward towards $0$ (the center of the logo).
   - Governed by power-law gravitational contraction:
     $$r(t) = R_{\text{start}} \times (1 - t)^{1.35}$$
3. **Compound Mathematical Projection**:
   Because rotation and radial translation execute concurrently on the GPU:
   $$\begin{pmatrix} X(t) \\ Y(t) \end{pmatrix} = \begin{pmatrix} \cos(\theta(t)) & -\sin(\theta(t)) \\ \sin(\theta(t)) & \cos(\theta(t)) \end{pmatrix} \begin{pmatrix} r(t) \\ 0 \end{pmatrix} = \begin{pmatrix} r(t) \cos(\theta(t)) \\ r(t) \sin(\theta(t)) \end{pmatrix}$$
   This produces a mathematically pure, continuous logarithmic spiral path with zero angular jerkiness or polygon stepping.

4. **Living Food Wobble & Micro-Tilts**:
   - The innermost child div applies organic harmonic floating oscillations:
     $$\text{rot}(t) = \text{tilt} \times \sin(4\pi t) \qquad y(t) = 8\text{px} \times \cos(4\pi t)$$
   - Creates a natural feeling of weightlessness in zero-gravity space before being pulled into the central portal core.

### 3.2 Viewport Distribution & Timeline

| # | Item | Starting Direction | Angle ($\theta_{\text{start}}$) | Turns | Wobble Freq / Amp | Delay | Travel Duration | Arrival at Logo |
|---|---|---|---|---|---|---|---|---|
| 1 | Gourmet Burger | Top | $-75^\circ$ | 1.45 | 3 / 14px | 0.00s | 2.25s | ~2.10s |
| 2 | Butter Croissant | Top-Right | $-35^\circ$ | 1.35 | 4 / 18px | 0.15s | 2.20s | ~2.25s |
| 3 | Crispy Fries | Right | $+15^\circ$ | 1.50 | 3 / 12px | 0.30s | 2.30s | ~2.45s |
| 4 | Berry Donut | Bottom-Right | $+55^\circ$ | 1.40 | 5 / 16px | 0.45s | 2.20s | ~2.55s |
| 5 | Cheesy Pizza | Bottom | $+105^\circ$ | 1.45 | 3 / 15px | 0.60s | 2.25s | ~2.75s |
| 6 | Espresso Latte | Bottom-Left | $+150^\circ$ | 1.38 | 4 / 17px | 0.75s | 2.20s | ~2.85s |
| 7 | Chocolate Cake | Left | $+195^\circ$ | 1.52 | 3 / 14px | 0.90s | 2.30s | ~3.05s |
| 8 | Club Sandwich | Top-Left | $+240^\circ$ | 1.42 | 4 / 16px | 1.05s | 2.20s | ~3.15s |
| 9 | Choco Cookie | Upper-Left | $+285^\circ$ | 1.46 | 5 / 15px | 1.20s | 2.25s | ~3.35s |
| 10 | Iced Drink | Upper-Right | $+335^\circ$ | 1.36 | 3 / 13px | 1.35s | 2.20s | ~3.45s |

### 3.3 Dynamic Scale & Tilting Oscillations
- **Scale Breathing**:
  - Starts at $0.35$ during cosmic emergence.
  - Scales up to $1.0$ by $p = 0.12$.
  - Gently breathes ($1.0 \pm 0.07$) during orbital travel.
  - Plunges rapidly from $0.6$ down to $0.05$ as it gets pulled into the center core ($p > 0.88$).
- **Rotational Wobble**:
  - Combines progressive orbital spin with sinusoidal tilt:
    $$\text{rot}(p) = 300^\circ \cdot p + 20^\circ \cdot \sin(5\pi \cdot p)$$
  - Gives individual food items natural weightlessness and organic personality.

---

## 4. Verification Checklist

- [x] **Theme matches the FrenchBell website**: Deep espresso `#1F110A`, luxury gold `#D4AF37`, and warm cream accents.
- [x] **Magical food portal concept**: Concentric rotating portal rings, golden stardust nebula, luminous core.
- [x] **All 10 food items included**: Burgers, Fries, Pizza, Croissants, Donuts, Coffee, Cakes, Sandwiches, Cookies, and Drinks.
- [x] **Vector illustrations**: Clean vector SVGs in `FoodIllustrations.jsx` with zero external raster images or emojis.
- [x] **Gravity pulls everything toward the logo**: Power-law inward contraction with acceleration into the center.
- [x] **Wobble, rotate, bounce**: Harmonic sinusoidal oscillations simulate weightlessness and organic motion.
- [x] **Sequential typography**:
  - *"Follow the aroma..."* (Phase 1)
  - *"You're entering FrenchBell Cafe ☕✨"* (Phase 2)
- [x] **No navigation bar on splash screen**: Enforced via isolated rendering gate in `App.jsx`.
- [x] **Smooth zoom through center logo**: Camera zooms smoothly through the central portal core into the homepage.
- [x] **Accessibility & reduced-motion**: `prefers-reduced-motion` supported with graceful fallback.
- [x] **Zero errors**: Production build (`vite build`) succeeds with 0 errors.
