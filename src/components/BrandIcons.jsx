import React from 'react';

/**
 * Official Brand & Mobile App SVG Icons for FrenchBell Cafe
 * Accurate high-fidelity vector icons for WhatsApp, Instagram, Facebook, Google Maps,
 * as well as official Google Play & Apple App Store badges.
 */

// Official WhatsApp App Icon
export function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#25D366" />
      <path
        d="M24 10C16.3 10 10 16.3 10 24C10 26.6 10.7 29 12 31.2L10 38L17.1 36.1C19.2 37.3 21.5 38 24 38C31.7 38 38 31.7 38 24C38 16.3 31.7 10 24 10ZM30.4 28.5C30.1 29.3 28.9 30 28.1 30.1C27.5 30.2 26.8 30.3 24 29.1C20.4 27.6 18.1 23.9 17.9 23.6C17.7 23.4 16.5 21.8 16.5 20.1C16.5 18.4 17.4 17.5 17.7 17.2C18 16.9 18.4 16.8 18.8 16.8C18.9 16.8 19.1 16.8 19.2 16.8C19.6 16.8 19.8 16.9 20 17.4C20.3 18.1 21 19.8 21.1 20C21.2 20.2 21.2 20.4 21.1 20.6C21 20.8 20.9 21 20.7 21.2C20.5 21.4 20.3 21.6 20.1 21.8C19.9 22 19.7 22.2 19.9 22.6C20.1 23 21 24.5 22.3 25.7C24 27.2 25.4 27.7 25.8 27.9C26.2 28.1 26.5 28 26.7 27.8C27 27.5 27.6 26.8 27.9 26.4C28.2 26 28.5 26.1 28.8 26.2C29.1 26.3 30.8 27.1 31.1 27.3C31.4 27.5 31.6 27.6 31.7 27.8C31.7 28 31.7 28.1 30.4 28.5Z"
        fill="white"
      />
    </svg>
  );
}

// Official Instagram App Icon with Authentic Gradient
export function InstagramIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="instaGrad" cx="15%" cy="100%" r="110%">
          <stop offset="0%" stopColor="#FFD600" />
          <stop offset="35%" stopColor="#FF0100" />
          <stop offset="60%" stopColor="#D800B9" />
          <stop offset="100%" stopColor="#405DE6" />
        </radialGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#instaGrad)" />
      <rect x="12" y="12" width="24" height="24" rx="7" stroke="white" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="5.5" stroke="white" strokeWidth="2.5" />
      <circle cx="30.5" cy="17.5" r="1.5" fill="white" />
    </svg>
  );
}

// Official Facebook App Icon
export function FacebookIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#1877F2" />
      <path
        d="M29.5 25H25.5V37H20.5V25H18V20.5H20.5V17.5C20.5 14.5 22.2 12.5 25.8 12.5C27.3 12.5 28.5 12.8 28.5 12.8L28.1 16.8C27.4 16.7 26.6 16.6 25.8 16.6C24.4 16.6 24 17.3 24 18.6V20.5H29.1L29.5 25Z"
        fill="white"
      />
    </svg>
  );
}

// Official Google Maps App Pin Icon
export function GoogleMapsIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#FFFFFF" />
      <path d="M24 10C17.4 10 12 15.4 12 22C12 30.5 24 38 24 38C24 38 36 30.5 36 22C36 15.4 30.6 10 24 10Z" fill="#EA4335" />
      <circle cx="24" cy="21" r="5" fill="#FFFFFF" />
      <circle cx="24" cy="21" r="3" fill="#1A73E8" />
    </svg>
  );
}

// Official Google Play Store Download Badge
export function GooglePlayBadge({ className = "h-10" }) {
  return (
    <a
      href="https://play.google.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-black border border-french-gold/30 hover:border-french-gold text-white hover:scale-105 transition-all shadow-md group ${className}`}
      aria-label="Get it on Google Play"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none">
        <path d="M3.6 1.8C3.3 2.1 3.1 2.6 3.1 3.2V20.8C3.1 21.4 3.3 21.9 3.6 22.2L3.7 22.3L13.7 12.3V12L3.7 1.7L3.6 1.8Z" fill="#00D7FF" />
        <path d="M17.1 15.7L13.7 12.3V11.7L17.1 8.3L17.2 8.4L21.1 10.6C22.2 11.2 22.2 12.2 21.1 12.8L17.2 15.1L17.1 15.7Z" fill="#FFC900" />
        <path d="M17.2 15.7L13.7 12.2L3.6 22.3C4 22.7 4.7 22.7 5.6 22.2L17.2 15.7Z" fill="#FF3A44" />
        <path d="M17.2 8.3L5.6 1.8C4.7 1.3 4 1.3 3.6 1.7L13.7 11.8L17.2 8.3Z" fill="#00E676" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="text-[9px] uppercase tracking-wider text-gray-300 font-medium">GET IT ON</span>
        <span className="text-xs font-bold tracking-tight text-white mt-0.5">Google Play</span>
      </div>
    </a>
  );
}

// Official Apple App Store Download Badge
export function AppStoreBadge({ className = "h-10" }) {
  return (
    <a
      href="https://apple.com/app-store"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-black border border-french-gold/30 hover:border-french-gold text-white hover:scale-105 transition-all shadow-md group ${className}`}
      aria-label="Download on the App Store"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-current text-white">
        <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.13 16.69C20.07 16.86 19.68 18.23 18.71 19.5ZM15.03 4.54C15.69 3.73 16.14 2.61 16.02 1.5C15.05 1.54 13.85 2.15 13.16 2.96C12.55 3.67 12.01 4.81 12.16 5.91C13.25 6 14.38 5.35 15.03 4.54Z" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="text-[9px] text-gray-300 font-medium">Download on the</span>
        <span className="text-xs font-bold tracking-tight text-white mt-0.5">App Store</span>
      </div>
    </a>
  );
}
