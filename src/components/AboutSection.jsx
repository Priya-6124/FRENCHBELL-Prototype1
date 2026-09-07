import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Clock, Phone, Sparkles, Heart, ShieldCheck } from 'lucide-react';
import CurvedUnderline from './CurvedUnderline';

export default function AboutSection() {
  const { settings } = useApp();
  const aboutImage = settings?.about_image_url || settings?.aboutImage || '/assets/logo.jfif';

  return (
    <section id="about" className="py-20 bg-french-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Authentic Cafe Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-french-gold/30 shadow-2xl group bg-french-dark flex items-center justify-center p-2">
              <img
                src={aboutImage}
                alt="FrenchBell Cafe"
                className="w-full h-full object-contain sm:object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/logo.jfif';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-french-dark/90 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-french-dark/95 text-french-cream backdrop-blur-md border border-french-gold/30">
                <span className="font-serif font-bold text-lg text-french-gold block">
                  Warm Ambience & Fresh Kitchen
                </span>
                <span className="text-xs text-french-cream/80">
                  Dine-In • Takeaway • Free 2 KM Doorstep Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Cafe Introduction, Philosophy & Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-french-gold/15 text-french-dark text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-french-gold" />
              <span>Authentic Cafe Experience</span>
            </div>

            {/* Heading with Curved Underline */}
            <div>
              <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-french-dark tracking-tight leading-tight">
                About <span className="text-french-warm">FrenchBell Cafe</span>
              </h2>
              <div className="w-56 sm:w-72 mt-1">
                <CurvedUnderline className="text-french-caramel h-4 sm:h-5" />
              </div>
            </div>

            <p className="text-french-muted text-sm sm:text-base leading-relaxed">
              At <strong>FrenchBell Cafe</strong>, we believe every meal should be a memorable moment. Founded with a passion for bringing gourmet craftsmanship into casual dining, our kitchen pairs French culinary techniques with beloved street-food favorites.
            </p>

            <p className="text-french-muted text-sm sm:text-base leading-relaxed">
              Whether you are savoring our crispy zinger burgers, relishing wok-tossed peri peri momos, sharing a loaded fries bowl, or enjoying freshly rolled shawarmas, every plate is prepared fresh to order with zero compromises on hygiene, freshness, and authentic spices.
            </p>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

              {/* Location Card */}
              <div className="p-4 rounded-2xl bg-french-card border border-french-gold/25 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-french-dark font-bold text-xs uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-french-gold" />
                  <span>Cafe Location</span>
                </div>
                <p className="text-xs text-french-dark font-semibold leading-normal">
                  K. Narayanpura, Bengaluru – 560077, Karnataka
                </p>
                <span className="text-[11px] text-french-muted block">
                  K. Narayanpura Main Junction
                </span>
              </div>

              {/* Timing Card */}
              <div className="p-4 rounded-2xl bg-french-card border border-french-gold/25 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-french-dark font-bold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-french-gold" />
                  <span>Opening Hours</span>
                </div>
                <p className="text-xs text-french-dark font-semibold leading-normal">
                  Open Daily: 11:00 AM – 11:30 PM
                </p>
                <span className="text-[11px] text-emerald-600 font-bold block">
                  Kitchen Active & Serving
                </span>
              </div>

              {/* Contact Card */}
              <div className="p-4 rounded-2xl bg-french-card border border-french-gold/25 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-french-dark font-bold text-xs uppercase tracking-wider">
                  <Phone className="w-4 h-4 text-french-gold" />
                  <span>Contact & Support</span>
                </div>
                <p className="text-xs text-french-dark font-semibold leading-normal font-mono">
                  +91 98765 43210
                </p>
                <span className="text-[11px] text-french-muted block">
                  Table bookings & WhatsApp inquiries
                </span>
              </div>

              {/* Quality & Delivery Statement Card */}
              <div className="p-4 rounded-2xl bg-french-card border border-french-gold/25 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-french-dark font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-french-gold" />
                  <span>Quality Guarantee</span>
                </div>
                <p className="text-xs text-french-dark font-semibold leading-normal">
                  Free delivery within 2 KM radius
                </p>
                <span className="text-[11px] text-french-muted block">
                  Piping hot food delivered fresh
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
