import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Tag, Flame, Compass } from 'lucide-react';
import CurvedUnderline from './CurvedUnderline';

export default function BannerCarousel({ banners = [], onExploreClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Fallback banners if admin has not uploaded any
  const displayBanners = banners && banners.length > 0 ? banners : [
    {
      id: 1,
      type: 'Weekend Offer',
      title: 'Monster Crispy Burgers & Sizzling Momos',
      description: 'Handcrafted fresh with secret French spices and gooey molten cheese.',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
      cta: 'Explore Menu'
    },
    {
      id: 2,
      type: 'Combo Offer',
      title: 'Grand Cafe Platters for Friends & Family',
      description: 'Loaded sampler plates with fries, strips, momos and signature dips.',
      image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
      cta: 'View Platters'
    },
    {
      id: 3,
      type: 'Special Discount',
      title: 'Flat 20% Off Weekend Feast',
      description: 'Enjoy fast doorstep delivery across Bengaluru with special savings.',
      image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80',
      cta: 'Order Now'
    }
  ];

  const total = displayBanners.length;

  // Auto-play timer (paused when hovered)
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, total]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % total);
  };

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const currentBanner = displayBanners[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-french-gold/30 bg-french-dark shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Showcase Slides - Compact responsive viewport-friendly height */}
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[340px] max-h-[340px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id || currentIndex}
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute inset-0 cursor-pointer"
            onClick={onExploreClick}
          >
            {/* Background Image with Dark Vignette */}
            <img
              src={currentBanner.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80'}
              alt={currentBanner.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-french-dark/95 via-french-dark/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-french-dark/80 via-transparent to-transparent" />

            {/* Banner Text Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-10 md:px-14 max-w-xl space-y-2 sm:space-y-3">
              
              {/* Type Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-french-gold/25 border border-french-gold/40 text-french-gold text-[10px] sm:text-xs font-extrabold uppercase tracking-wider backdrop-blur-md w-fit gold-glow">
                <Sparkles className="w-3 h-3 text-french-gold" />
                <span>{currentBanner.type || 'Special Promotion'}</span>
              </div>

              {/* Title with Hand-drawn Underline */}
              <div>
                <h2 className="font-serif font-extrabold text-lg sm:text-2xl md:text-3xl text-french-cream leading-tight tracking-tight drop-shadow-md">
                  {currentBanner.title}
                </h2>
                <div className="w-32 sm:w-44 mt-0.5">
                  <CurvedUnderline className="text-french-gold h-2 sm:h-3" />
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] sm:text-xs md:text-sm text-french-cream/85 leading-relaxed line-clamp-2 max-w-md">
                {currentBanner.description}
              </p>

              {/* Click CTA Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onExploreClick) onExploreClick();
                  }}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-french-gold via-french-gold-hover to-[#B38F29] text-french-dark font-extrabold text-[11px] sm:text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-1.5 gold-glow"
                >
                  <Compass className="w-3.5 h-3.5 text-french-dark" />
                  <span>{currentBanner.cta || 'Explore Menu'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-french-dark/80 text-french-cream border border-french-gold/30 hover:bg-french-gold hover:text-french-dark transition-all duration-200 z-20 shadow-lg backdrop-blur-sm"
            aria-label="Previous Banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-french-dark/80 text-french-cream border border-french-gold/30 hover:bg-french-gold hover:text-french-dark transition-all duration-200 z-20 shadow-lg backdrop-blur-sm"
            aria-label="Next Banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {displayBanners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? 'w-7 bg-french-gold shadow-md'
                  : 'w-2 bg-french-cream/40 hover:bg-french-cream/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
