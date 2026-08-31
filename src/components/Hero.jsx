import React from 'react';
import { motion } from 'framer-motion';
import OrderModeToggle from './OrderModeToggle';
import BrandedFoodImage from './BrandedFoodImage';
import { Bell, Flame, Compass, Sparkles } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section id="hero" className="relative min-h-[92vh] pt-24 sm:pt-28 pb-12 bg-gradient-to-b from-french-dark via-[#2B170E] to-french-brown overflow-hidden flex flex-col justify-center">
      {/* Decorative Gold & Steam Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-french-gold/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-french-amber/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Hero Left Content Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

            {/* Tag Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-french-gold/20 border border-french-gold/40 text-french-gold text-xs font-extrabold uppercase tracking-widest gold-glow"
            >
              <Sparkles className="w-3.5 h-3.5 text-french-gold animate-spin" />
              <span>K. Narayanpura's Favorite Cafe 🔔</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif font-extrabold text-4xl sm:text-5xl lg:text-6xl text-french-cream leading-[1.15] tracking-tight"
            >
              Good food. <br className="hidden sm:inline" />
              Great mood.{' '}
              <span className="font-handwriting text-5xl sm:text-6xl lg:text-7xl text-french-gold font-bold inline-block animate-pulse">
                Ding! 🔔
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-french-cream/85 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed"
            >
              Freshly loaded, rolled, fried and brewed for your cravings. Enjoy authentic French Bell signature burgers, momos, rolls & loaded fries!
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <button
                onClick={onExploreClick}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold text-sm uppercase tracking-wider shadow-2xl hover:scale-105 hover:shadow-french-gold/50 transition-all duration-300 flex items-center gap-2.5 gold-glow"
              >
                <Compass className="w-5 h-5 text-french-dark" />
                <span>Explore Menu</span>
              </button>

              <button
                onClick={onExploreClick}
                className="px-7 py-3.5 rounded-full bg-french-brown/80 border border-french-gold/40 text-french-cream font-bold text-sm uppercase tracking-wider hover:bg-french-gold/20 hover:border-french-gold transition-all duration-300 flex items-center gap-2"
              >
                <Bell className="w-4 h-4 text-french-gold" />
                <span>Order Now</span>
              </button>
            </motion.div>

            {/* Integrated Order Mode Toggle Bar */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="pt-4"
            >
              <OrderModeToggle showDetailsCard={true} />
            </motion.div>

          </div>

          {/* Hero Right Visual Column: Food Showcase Card + Interactive Elements */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Interactive Floating Food Card Sticker 1 */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-2 z-20 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-french-dark/90 border border-french-gold/40 text-french-cream shadow-2xl backdrop-blur-md"
            >
              <span className="text-2xl">🍟</span>
              <div>
                <span className="font-bold text-xs block text-french-gold">Loaded Peri Peri</span>
                <span className="text-[10px] text-french-cream/80">Starting at ₹70</span>
              </div>
            </motion.div>

            {/* Interactive Floating Card Sticker 2 */}
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -right-2 z-20 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-french-dark/90 border border-french-gold/40 text-french-cream shadow-2xl backdrop-blur-md"
            >
              <span className="text-2xl">🥟</span>
              <div>
                <span className="font-bold text-xs block text-french-gold">Fried & Peri Peri Momos</span>
                <span className="text-[10px] text-french-cream/80">From ₹70</span>
              </div>
            </motion.div>

            {/* Central Hero Food Image Slot */}
            <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden border-2 border-french-gold/40 shadow-2xl group">
              <BrandedFoodImage
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
                name="Cheesy Blaster Burger & Loaded Feast"
                category="burgers"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="[ HERO FOOD IMAGE ]"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-french-dark via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-french-dark/85 backdrop-blur-md border border-french-gold/30 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-french-gold font-bold block">
                    Chef's Masterpiece
                  </span>
                  <span className="font-serif font-bold text-french-cream text-lg">
                    Cheesy Blaster Loaded
                  </span>
                </div>
                <div className="font-serif font-bold text-french-gold text-xl">
                  ₹179
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
