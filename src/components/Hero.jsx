import React from 'react';
import { useApp } from '../context/AppContext';
import BannerCarousel from './BannerCarousel';
import CurvedUnderline from './CurvedUnderline';
import { Compass, Sparkles, ArrowRight, Utensils, Bike } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  const { advertisements, lockedTableNumber, orderMode, setOrderMode } = useApp();

  return (
    <section id="hero" className="pt-20 sm:pt-24 pb-6 sm:pb-8 bg-gradient-to-b from-french-dark via-[#221208] to-french-cream relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-french-gold/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">

        {/* Table QR Alert if customer scanned table QR */}
        {lockedTableNumber && (
          <div className="p-3.5 rounded-2xl bg-french-dark/95 border-2 border-french-gold shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-french-cream gold-glow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-french-gold text-french-dark flex items-center justify-center font-bold shadow">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-extrabold text-sm sm:text-base text-french-gold block">
                  Seated at Table #{lockedTableNumber}
                </span>
                <span className="text-xs text-french-cream/80">
                  Dine-in ordering active. Orders route straight to the cafe kitchen.
                </span>
              </div>
            </div>

            <button
              onClick={onExploreClick}
              className="px-4 py-2 rounded-full bg-french-gold text-french-dark font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold-hover transition-all flex items-center gap-1.5 shadow"
            >
              <span>Order for Table #{lockedTableNumber}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Customer-Attracting Welcome Marketing Message */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pt-1">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-french-gold/20 border border-french-gold/30 text-french-gold text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-french-gold" />
              <span>Gourmet Cafe & Kitchen • Bengaluru</span>
            </div>

            <h1 className="font-serif font-extrabold text-2xl sm:text-4xl lg:text-[42px] text-french-cream tracking-tight leading-[1.15]">
              Your cravings called.{' '}
              <span className="text-french-gold inline-block">FrenchBell answered.</span>
            </h1>

            <div className="w-48 sm:w-60">
              <CurvedUnderline className="text-french-gold h-2.5 sm:h-3.5" />
            </div>

            <p className="text-xs sm:text-sm text-french-cream/80 leading-relaxed pt-1">
              Discover crispy favourites, loaded creations and delicious comfort food made just the way you like it.
            </p>
          </div>

          {/* Prominent Explore Menu CTA Button */}
          <div className="shrink-0 pt-1 md:pt-0">
            <button
              type="button"
              onClick={onExploreClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:scale-105 hover:shadow-french-gold/40 transition-all duration-300 flex items-center justify-center gap-2.5 gold-glow"
            >
              <Compass className="w-4 h-4 text-french-dark" />
              <span>Explore Complete Menu</span>
              <ArrowRight className="w-4 h-4 text-french-dark" />
            </button>
          </div>
        </div>

        {/* Compact Responsive Advertisement Carousel */}
        <div className="pt-1">
          <BannerCarousel
            banners={advertisements}
            onExploreClick={onExploreClick}
          />
        </div>

      </div>
    </section>
  );
}
