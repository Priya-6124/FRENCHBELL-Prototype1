import React, { useState } from 'react';

export default function BrandedFoodImage({ src, name, category, className = '', alt = '' }) {
  const [hasError, setHasError] = useState(false);

  // Category Icon SVG generator for styled placeholders
  const getCategoryIllustration = () => {
    const catLower = (category || name || '').toLowerCase();

    if (catLower.includes('burger')) {
      return (
        <svg class="w-12 h-12 text-french-gold opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 10c0-3.3 3.6-6 8-6s8 2.7 8 6v1H4v-1zM4 14h16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM4 11h16" />
        </svg>
      );
    }
    if (catLower.includes('momo')) {
      return (
        <svg class="w-12 h-12 text-french-gold opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 3a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      );
    }
    if (catLower.includes('fries') || catLower.includes('starter') || catLower.includes('loaded')) {
      return (
        <svg class="w-12 h-12 text-french-gold opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 5l-2 14H7L5 5m0 0h14M9 3v2m6-2v2" />
        </svg>
      );
    }
    if (catLower.includes('roll') || catLower.includes('sandwich')) {
      return (
        <svg class="w-12 h-12 text-french-gold opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 8h10M7 12h10M7 16h10M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      );
    }
    // Default Bell / Dish Illustration
    return (
      <svg class="w-12 h-12 text-french-gold opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    );
  };

  if (!src || hasError) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-french-dark via-french-brown to-french-warm flex flex-col items-center justify-center p-4 text-center border border-french-gold/20 ${className}`}>
        {/* Subtle background Bell Emblem watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src="/assets/logo.jfif" alt="Watermark" className="w-3/4 object-contain filter grayscale" />
        </div>
        
        {/* Category Illustration */}
        <div className="mb-2 p-3 rounded-full bg-french-gold/10 border border-french-gold/30 gold-glow">
          {getCategoryIllustration()}
        </div>

        {/* Item Name & Tag */}
        <span className="font-serif font-bold text-french-cream text-sm line-clamp-1">
          {name || 'French Bell Specialty'}
        </span>
        <span className="font-sans text-[10px] tracking-wider uppercase text-french-gold/80 mt-1 font-semibold">
          French Bell Cafe 🔔
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name}
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
}
