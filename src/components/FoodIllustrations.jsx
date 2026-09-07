import React from 'react';

/**
 * Handcrafted Vector Food Illustrations for FrenchBell Cafe's Magical Portal
 * 10 distinct cafe items: Burger, Fries, Pizza, Croissant, Donut, Coffee, Cake, Sandwich, Cookie, Drink.
 * Pure vector SVG, zero external assets, ultra-crisp at any resolution and 60fps performance.
 */

// 1. BURGER
export function BurgerIcon({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="bunTop" cx="32" cy="18" r="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5B041" />
          <stop offset="1" stopColor="#D35400" />
        </radialGradient>
        <linearGradient id="patty" x1="12" y1="36" x2="52" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5D4037" />
          <stop offset="1" stopColor="#3E2723" />
        </linearGradient>
        <linearGradient id="cheese" x1="14" y1="32" x2="50" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F4D03F" />
          <stop offset="1" stopColor="#F39C12" />
        </linearGradient>
      </defs>
      {/* Top Bun */}
      <path d="M14 26C14 16 22 10 32 10C42 10 50 16 50 26C50 27 49 28 47 28H17C15 28 14 27 14 26Z" fill="url(#bunTop)" />
      {/* Sesame Seeds */}
      <ellipse cx="24" cy="16" rx="1.2" ry="2" transform="rotate(-20 24 16)" fill="#FEF9E7" opacity="0.9" />
      <ellipse cx="32" cy="14" rx="1.2" ry="2" transform="rotate(10 32 14)" fill="#FEF9E7" opacity="0.9" />
      <ellipse cx="40" cy="17" rx="1.2" ry="2" transform="rotate(30 40 17)" fill="#FEF9E7" opacity="0.9" />
      <ellipse cx="28" cy="20" rx="1.2" ry="2" transform="rotate(15 28 20)" fill="#FEF9E7" opacity="0.9" />
      <ellipse cx="37" cy="22" rx="1.2" ry="2" transform="rotate(-15 37 22)" fill="#FEF9E7" opacity="0.9" />
      {/* Tomato Slices */}
      <rect x="16" y="27" width="15" height="4" rx="2" fill="#E74C3C" />
      <rect x="33" y="27" width="15" height="4" rx="2" fill="#C0392B" />
      {/* Lettuce */}
      <path d="M13 31C15 29 17 32 20 30C23 28 25 32 28 30C31 28 34 32 37 30C40 28 42 32 45 30C48 28 50 31 51 31C52 33 50 34 47 33C44 32 41 34 38 33C35 32 32 34 29 33C26 32 23 34 20 33C17 32 14 34 13 31Z" fill="#2ECC71" />
      {/* Melted Cheese */}
      <path d="M15 33H49L47 38L42 35L36 39L32 35L26 38L21 35L17 38L15 33Z" fill="url(#cheese)" />
      {/* Patty */}
      <rect x="13" y="37" width="38" height="8" rx="4" fill="url(#patty)" />
      {/* Bottom Bun */}
      <path d="M16 45H48C49.5 45 50.5 46.5 49.5 48.5C47.5 52 40 54 32 54C24 54 16.5 52 14.5 48.5C13.5 46.5 14.5 45 16 45Z" fill="url(#bunTop)" />
    </svg>
  );
}

// 2. FRIES
export function FriesIcon({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="fryGold1" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#F9E79F" />
          <stop offset="1" stopColor="#F39C12" />
        </linearGradient>
        <linearGradient id="fryGold2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#F7DC6F" />
          <stop offset="1" stopColor="#E67E22" />
        </linearGradient>
        <linearGradient id="cupRed" x1="16" y1="30" x2="48" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C0392B" />
          <stop offset="1" stopColor="#922B21" />
        </linearGradient>
      </defs>
      {/* Fry Sticks */}
      <rect x="18" y="14" width="4.5" height="24" rx="2" transform="rotate(-15 18 14)" fill="url(#fryGold2)" />
      <rect x="25" y="10" width="4.5" height="28" rx="2" transform="rotate(-6 25 10)" fill="url(#fryGold1)" />
      <rect x="32" y="8" width="5" height="30" rx="2" transform="rotate(2 32 8)" fill="url(#fryGold2)" />
      <rect x="39" y="11" width="4.5" height="27" rx="2" transform="rotate(10 39 11)" fill="url(#fryGold1)" />
      <rect x="45" y="16" width="4.5" height="22" rx="2" transform="rotate(20 45 16)" fill="url(#fryGold2)" />
      <rect x="22" y="18" width="4.5" height="20" rx="2" transform="rotate(-3 22 18)" fill="url(#fryGold1)" />
      <rect x="36" y="17" width="4.5" height="21" rx="2" transform="rotate(6 36 17)" fill="url(#fryGold2)" />
      {/* FrenchBell Cafe Fries Box */}
      <path d="M17 32L21 54C21.5 56 23 57 25 57H39C41 57 42.5 56 43 54L47 32C41 35 37 34 32 34C27 34 23 35 17 32Z" fill="url(#cupRed)" />
      <path d="M17 32C23 35 27 34 32 34C37 34 41 35 47 32" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="32" cy="45" r="4.5" fill="#D4AF37" opacity="0.9" />
      <path d="M30 46C30.5 43.5 33.5 43.5 34 46" stroke="#1F110A" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// 3. PIZZA SLICE
export function PizzaIcon({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="crustGrad" x1="12" y1="12" x2="52" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E59866" />
          <stop offset="1" stopColor="#BA4A00" />
        </linearGradient>
        <radialGradient id="cheeseGrad" cx="32" cy="24" r="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9E79F" />
          <stop offset="0.7" stopColor="#F4D03F" />
          <stop offset="1" stopColor="#F39C12" />
        </radialGradient>
      </defs>
      {/* Outer Golden Crust */}
      <path d="M14 16C25 11 39 11 50 16C51.5 16.7 52 18.5 51 20L34 54C33 56 31 56 30 54L13 20C12 18.5 12.5 16.7 14 16Z" fill="url(#crustGrad)" />
      {/* Molten Cheese Surface */}
      <path d="M16 20C26 16 38 16 48 20L32 51L16 20Z" fill="url(#cheeseGrad)" />
      {/* Pepperoni Slices */}
      <circle cx="32" cy="26" r="4" fill="#C0392B" />
      <circle cx="33" cy="25" r="3.2" fill="#E74C3C" />
      <circle cx="25" cy="35" r="3.5" fill="#C0392B" />
      <circle cx="26" cy="34" r="2.8" fill="#E74C3C" />
      <circle cx="38" cy="37" r="3.2" fill="#C0392B" />
      <circle cx="39" cy="36" r="2.5" fill="#E74C3C" />
      {/* Fresh Basil & Oregano Flecks */}
      <ellipse cx="28" cy="24" rx="2" ry="1.2" transform="rotate(-30 28 24)" fill="#27AE60" />
      <ellipse cx="36" cy="30" rx="1.8" ry="1" transform="rotate(40 36 30)" fill="#27AE60" />
      <ellipse cx="31" cy="42" rx="1.5" ry="0.8" transform="rotate(15 31 42)" fill="#27AE60" />
      {/* Cheese drip at tip */}
      <path d="M30 51C31 53 32 55 32 55C32 55 33 53 34 51Z" fill="#F4D03F" />
    </svg>
  );
}

// 4. CROISSANT
export function CroissantIcon({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="croissantGrad" x1="12" y1="20" x2="52" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FAD7A0" />
          <stop offset="0.4" stopColor="#F5B041" />
          <stop offset="0.8" stopColor="#D35400" />
          <stop offset="1" stopColor="#873600" />
        </linearGradient>
      </defs>
      {/* Crescent Base Body */}
      <path
        d="M10 38C12 28 22 18 32 18C42 18 52 28 54 38C55 42 51 44 48 41C42 35 38 34 32 34C26 34 22 35 16 41C13 44 9 42 10 38Z"
        fill="url(#croissantGrad)"
      />
      {/* Main Flaky Center Roll */}
      <ellipse cx="32" cy="27" rx="11" ry="8" fill="#F8C471" />
      <path d="M21 27C21 23 26 20 32 20C38 20 43 23 43 27C43 32 38 35 32 35C26 35 21 32 21 27Z" fill="#E59866" opacity="0.85" />
      {/* Left Segment */}
      <path d="M16 34C18 30 22 26 26 25C24 29 23 34 20 37C18 36 17 35 16 34Z" fill="#D35400" opacity="0.7" />
      {/* Right Segment */}
      <path d="M48 34C46 30 42 26 38 25C40 29 41 34 44 37C46 36 47 35 48 34Z" fill="#BA4A00" opacity="0.7" />
      {/* Golden Baked Texture Crust Ribs */}
      <path d="M26 21C28 26 28 31 27 34" stroke="#873600" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M32 19C33 25 33 30 32 35" stroke="#873600" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M38 21C37 26 37 31 38 34" stroke="#873600" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// 5. DONUT
export function DonutIcon({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="doughGrad" cx="32" cy="30" r="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8C471" />
          <stop offset="1" stopColor="#D35400" />
        </radialGradient>
        <radialGradient id="glazeGrad" cx="30" cy="26" r="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7675" />
          <stop offset="0.7" stopColor="#E84393" />
          <stop offset="1" stopColor="#D63031" />
        </radialGradient>
      </defs>
      {/* Golden Fried Dough Body */}
      <circle cx="32" cy="32" r="24" fill="url(#doughGrad)" />
      {/* Wavy Strawberry/Berry Glaze */}
      <path
        d="M32 10C44 10 54 19 54 31C54 36 50 36 49 39C48 42 51 44 49 47C47 50 43 47 41 50C38 54 35 52 32 52C29 52 27 54 24 51C21 48 18 51 16 48C14 45 17 42 16 39C14 36 10 36 10 31C10 19 20 10 32 10Z"
        fill="url(#glazeGrad)"
      />
      {/* Center Donut Hole */}
      <circle cx="32" cy="32" r="8" fill="#1F110A" />
      <circle cx="32" cy="32" r="8.5" stroke="#D35400" strokeWidth="1.5" />
      {/* Fun Sprinkles */}
      <rect x="20" y="20" width="4.5" height="1.8" rx="0.9" transform="rotate(25 20 20)" fill="#F9CA24" />
      <rect x="36" y="16" width="4.5" height="1.8" rx="0.9" transform="rotate(-15 36 16)" fill="#FFFFFF" />
      <rect x="44" y="24" width="4.5" height="1.8" rx="0.9" transform="rotate(45 44 24)" fill="#00CEC9" />
      <rect x="42" y="38" width="4.5" height="1.8" rx="0.9" transform="rotate(-30 42 38)" fill="#F9CA24" />
      <rect x="34" y="44" width="4.5" height="1.8" rx="0.9" transform="rotate(10 34 44)" fill="#FFFFFF" />
      <rect x="22" y="40" width="4.5" height="1.8" rx="0.9" transform="rotate(-40 22 40)" fill="#6C5CE7" />
      <rect x="16" y="28" width="4.5" height="1.8" rx="0.9" transform="rotate(60 16 28)" fill="#00CEC9" />
      <rect x="28" y="15" width="4.5" height="1.8" rx="0.9" transform="rotate(5 28 15)" fill="#6C5CE7" />
    </svg>
  );
}

// 6. COFFEE CUP
export function CoffeeCupIcon({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="coffeeCupGrad" x1="18" y1="22" x2="42" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4A2810" />
          <stop offset="1" stopColor="#2A1406" />
        </linearGradient>
      </defs>
      {/* Saucer */}
      <ellipse cx="30" cy="52" rx="18" ry="4" fill="#D4AF37" opacity="0.9" />
      {/* Cup Body */}
      <path d="M16 24H44L41 46C41 49 37 51 30 51C23 51 19 49 19 46L16 24Z" fill="url(#coffeeCupGrad)" stroke="#D4AF37" strokeWidth="1.5" />
      {/* Cup Handle */}
      <path d="M43 28C48 28 50 32 49 37C48 41 44 42 41 42" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
      {/* Coffee Surface */}
      <ellipse cx="30" cy="25" rx="13" ry="3.5" fill="#6F4E37" />
      {/* Latte Art Heart */}
      <ellipse cx="30" cy="25" rx="8" ry="2" fill="#C4A482" />
      <path d="M28 24C28 23 29 22 30 23C31 22 32 23 32 24C32 25 30 26 30 26C30 26 28 25 28 24Z" fill="#FFFDF9" />
      {/* Rising Steam */}
      <path d="M26 18C25 15 27 13 26 10" stroke="#FAF5ED" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
      <path d="M33 19C34 16 32 14 34 11" stroke="#FAF5ED" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

// 7. CAKE SLICE
export function CakeIcon({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="frosting" x1="12" y1="18" x2="52" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFDF9" />
          <stop offset="1" stopColor="#F9EBEA" />
        </linearGradient>
        <linearGradient id="spongeDark" x1="12" y1="28" x2="48" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5D4037" />
          <stop offset="1" stopColor="#3E2723" />
        </linearGradient>
      </defs>
      {/* Triangular Cake Slice Base */}
      <path d="M12 44L48 20L48 38L12 52Z" fill="url(#spongeDark)" />
      {/* Middle Vanilla Cream Layer */}
      <path d="M12 40L48 16L48 22L12 45Z" fill="#FADBD8" />
      {/* Top Sponge Layer */}
      <path d="M12 34L48 12L48 18L12 39Z" fill="url(#spongeDark)" />
      {/* Top Cream Frosting Slant */}
      <path d="M12 34L32 12L52 14L48 18L12 34Z" fill="url(#frosting)" />
      {/* Back Frosting Wall */}
      <path d="M48 12C52 14 53 17 53 38L48 40L48 12Z" fill="#F5EEF8" />
      {/* Wavy Whipped Cream Border */}
      <circle cx="16" cy="33" r="2.5" fill="#FFFDF9" />
      <circle cx="23" cy="28" r="2.5" fill="#FFFDF9" />
      <circle cx="30" cy="23" r="2.5" fill="#FFFDF9" />
      <circle cx="37" cy="18" r="2.5" fill="#FFFDF9" />
      <circle cx="44" cy="14" r="2.5" fill="#FFFDF9" />
      {/* Cherry on Top */}
      <circle cx="38" cy="10" r="4.5" fill="#C0392B" />
      <circle cx="37" cy="9" r="1.5" fill="#F1948A" />
      <path d="M38 7C40 3 44 3 45 2" stroke="#27AE60" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 8. SANDWICH
export function SandwichIcon({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="toastCrust" x1="12" y1="18" x2="52" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5B041" />
          <stop offset="1" stopColor="#B9770E" />
        </linearGradient>
      </defs>
      {/* Triangular Bread Slice */}
      <path d="M12 44L48 14C50 12 53 14 53 17L44 48C43 51 40 52 38 51L14 47C12 47 11 45 12 44Z" fill="url(#toastCrust)" />
      {/* Inner Fillings */}
      <path d="M14 43L46 16L42 45L16 45Z" fill="#FEF9E7" />
      {/* Lettuce green */}
      <path d="M13 41L47 14" stroke="#2ECC71" strokeWidth="3.5" strokeLinecap="round" />
      {/* Cheddar cheese layer */}
      <path d="M15 43L49 17" stroke="#F1C40F" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tomato slices */}
      <circle cx="28" cy="32" r="3" fill="#E74C3C" />
      <circle cx="36" cy="25" r="3" fill="#C0392B" />
      {/* Grill marks */}
      <line x1="22" y1="36" x2="28" y2="42" stroke="#7E5109" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="30" y1="28" x2="38" y2="36" stroke="#7E5109" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="38" y1="20" x2="44" y2="26" stroke="#7E5109" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// 9. COOKIE
export function CookieIcon({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="cookieDough" cx="30" cy="28" r="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5CBA7" />
          <stop offset="0.6" stopColor="#E59866" />
          <stop offset="1" stopColor="#BA4A00" />
        </radialGradient>
      </defs>
      {/* Cookie Body with organic bite-friendly contour */}
      <path
        d="M32 10C44 10 52 18 53 30C54 36 51 43 47 48C42 53 35 54 28 54C17 54 10 45 10 32C10 19 19 10 32 10Z"
        fill="url(#cookieDough)"
      />
      {/* Dark Chocolate Chips */}
      <ellipse cx="24" cy="22" rx="3.5" ry="3" transform="rotate(-15 24 22)" fill="#3E2723" />
      <ellipse cx="24" cy="21.5" rx="1.5" ry="1" transform="rotate(-15 24 21.5)" fill="#5D4037" />

      <ellipse cx="38" cy="20" rx="3.2" ry="2.8" transform="rotate(20 38 20)" fill="#3E2723" />
      <ellipse cx="38" cy="19.5" rx="1.2" ry="0.9" transform="rotate(20 38 19.5)" fill="#5D4037" />

      <ellipse cx="31" cy="32" rx="4" ry="3.5" transform="rotate(5 31 32)" fill="#3E2723" />
      <ellipse cx="31" cy="31.2" rx="1.6" ry="1.1" transform="rotate(5 31 31.2)" fill="#5D4037" />

      <ellipse cx="42" cy="36" rx="3.2" ry="2.6" transform="rotate(-25 42 36)" fill="#3E2723" />

      <ellipse cx="20" cy="38" rx="3.5" ry="3" transform="rotate(30 20 38)" fill="#3E2723" />

      <ellipse cx="32" cy="46" rx="3" ry="2.5" transform="rotate(10 32 46)" fill="#3E2723" />

      {/* Baked Crackle Lines */}
      <path d="M28 17C29 19 32 18 34 20" stroke="#873600" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M37 26C39 28 38 31 40 32" stroke="#873600" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M21 30C23 31 23 34 25 35" stroke="#873600" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// 10. DRINKS / ICED BEVERAGE
export function DrinkCupIcon({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="cupLiquid" x1="20" y1="26" x2="44" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F39C12" />
          <stop offset="0.5" stopColor="#E67E22" />
          <stop offset="1" stopColor="#D35400" />
        </linearGradient>
      </defs>
      {/* Straw */}
      <path d="M35 6L33 22" stroke="#2ECC71" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M33 6L31 22" stroke="#27AE60" strokeWidth="1.5" strokeLinecap="round" />
      {/* Clear Dome Lid */}
      <path d="M20 22C20 15 25 12 32 12C39 12 44 15 44 22H20Z" fill="#E8F8F5" opacity="0.8" stroke="#D4AF37" strokeWidth="1" />
      {/* Cup Rim */}
      <rect x="18" y="21" width="28" height="3" rx="1.5" fill="#D4AF37" />
      {/* Cup Body */}
      <path d="M20 24L24 55C24.5 57 26 58 28 58H36C38 58 39.5 57 40 55L44 24H20Z" fill="url(#cupLiquid)" />
      {/* Ice Cubes inside */}
      <rect x="25" y="30" width="6" height="6" rx="1.5" transform="rotate(15 25 30)" fill="#FEF9E7" opacity="0.6" />
      <rect x="33" y="38" width="6" height="6" rx="1.5" transform="rotate(-20 33 38)" fill="#FEF9E7" opacity="0.6" />
      {/* FrenchBell Cafe Cup Sleeve */}
      <path d="M21.5 36L22.5 45H41.5L42.5 36H21.5Z" fill="#1F110A" />
      <circle cx="32" cy="40.5" r="3.5" fill="#D4AF37" />
      {/* Whipped Cream Top */}
      <path d="M23 23C25 18 31 16 34 18C37 17 41 20 41 23H23Z" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}
