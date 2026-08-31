import React from 'react';
import BrandedFoodImage from './BrandedFoodImage';
import { MapPin, Clock, Phone, Mail, Sparkles } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-french-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Branded Cafe Interior Image Container */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-french-gold/30 shadow-2xl group">
              <BrandedFoodImage
                src="/assets/food/platter.jpg"
                name="French Bell Cafe Kitchen"
                category="cafe"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="French Bell Cafe"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-french-dark/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-french-dark/90 text-french-cream backdrop-blur-md border border-french-gold/30">
                <span className="font-handwriting text-2xl text-french-gold font-bold block">
                  Warm Ambience & Fresh Food 🔔
                </span>
                <span className="text-xs text-french-cream/80">
                  Dine-In • Takeaway • Free 2 KM Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Brand Text & Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-french-gold/15 text-french-warm text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-french-gold" />
              <span>Authentic Cafe Experience</span>
            </div>

            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-french-dark tracking-tight">
              Small Cafe. Big Cravings. ☕
            </h2>

            <p className="text-french-muted text-base leading-relaxed">
              At <strong>French Bell Cafe</strong>, we combine French culinary flair with street-food passion. Whether you are stopping by for a hot cup of brewed coffee, sharing loaded fries with friends, or ordering delivery straight to your room, we prepare every single item fresh with zero compromises.
            </p>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* Location Card */}
              <div className="p-4 rounded-2xl bg-french-card border border-french-gold/25 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-french-gold font-bold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Cafe Location</span>
                </div>
                <p className="text-xs text-french-dark font-medium leading-normal">
                  K. Narayanpura, Bengaluru – 560077, Karnataka
                </p>
                <span className="text-[11px] text-french-muted block">
                  Near K. Narayanpura Main Junction
                </span>
              </div>

              {/* Timing Card */}
              <div className="p-4 rounded-2xl bg-french-card border border-french-gold/25 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-french-gold font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Cafe Hours</span>
                </div>
                <p className="text-xs text-french-dark font-medium leading-normal">
                  Open Every Day: 11:00 AM – 11:30 PM
                </p>
                <span className="text-[11px] text-emerald-600 font-bold block">
                  ● Kitchen Active & Cooking
                </span>
              </div>

              {/* Phone Card */}
              <div className="p-4 rounded-2xl bg-french-card border border-french-gold/25 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-french-gold font-bold text-sm">
                  <Phone className="w-4 h-4" />
                  <span>Direct Hotline</span>
                </div>
                <p className="text-xs text-french-dark font-medium leading-normal font-mono">
                  +91 98765 43210
                </p>
                <span className="text-[11px] text-french-muted block">
                  Table bookings & WhatsApp support
                </span>
              </div>

              {/* Delivery Zone Card */}
              <div className="p-4 rounded-2xl bg-french-card border border-french-gold/25 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-french-gold font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Free Delivery</span>
                </div>
                <p className="text-xs text-french-dark font-medium leading-normal">
                  Free delivery within 2 KM radius
                </p>
                <span className="text-[11px] text-french-muted block">
                  Nominal ₹15/km beyond 2km
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
