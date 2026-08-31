import React from 'react';
import { Bell, Heart, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const scrollTo = (id) => {
    if (onNavigate) onNavigate(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-french-dark text-french-cream pt-16 pb-12 border-t border-french-gold/25 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-french-gold/20">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-french-gold p-0.5 bg-french-dark gold-glow">
                <img src="/assets/logo.jfif" alt="French Bell Cafe" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-2xl text-french-cream tracking-wide">
                  FRENCH BELL
                </h3>
                <span className="text-[10px] uppercase tracking-widest text-french-gold font-bold">
                  CAFE • BENGALURU
                </span>
              </div>
            </div>

            <p className="text-xs text-french-cream/80 leading-relaxed max-w-sm font-normal">
              Your favorite local cafe for loaded fries, crispy momos, gourmet burgers, sushi rolls & specialty platters. Served hot for Dine-In, Takeaway & Delivery!
            </p>

            <div className="font-handwriting text-3xl text-french-gold font-bold pt-2">
              "Ding. Eat. Repeat." 🔔
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-french-gold uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-french-cream/80">
              <li><button onClick={() => scrollTo('hero')} className="hover:text-french-gold transition-colors">Home</button></li>
              <li><button onClick={() => scrollTo('menu')} className="hover:text-french-gold transition-colors">Complete Menu</button></li>
              <li><button onClick={() => scrollTo('offers')} className="hover:text-french-gold transition-colors">Deals & Offers</button></li>
              <li><button onClick={() => scrollTo('track-order')} className="hover:text-french-gold transition-colors">Track Order</button></li>
              <li><button onClick={() => scrollTo('about')} className="hover:text-french-gold transition-colors">About Us</button></li>
            </ul>
          </div>

          {/* Col 3: Legal Policies */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-french-gold uppercase tracking-wider">
              Policies
            </h4>
            <ul className="space-y-2 text-xs text-french-cream/80">
              <li><a href="#privacy" onClick={e => e.preventDefault()} className="hover:text-french-gold">Privacy Policy</a></li>
              <li><a href="#terms" onClick={e => e.preventDefault()} className="hover:text-french-gold">Terms of Service</a></li>
              <li><a href="#refund" onClick={e => e.preventDefault()} className="hover:text-french-gold">Refund & Cancellation</a></li>
              <li><a href="#shipping" onClick={e => e.preventDefault()} className="hover:text-french-gold">Delivery Policy</a></li>
              <li><a href="#hygiene" onClick={e => e.preventDefault()} className="hover:text-french-gold">Hygiene Standard</a></li>
            </ul>
          </div>

          {/* Col 4: Location & Social */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-french-gold uppercase tracking-wider">
              Cafe Address
            </h4>
            <p className="text-xs text-french-cream/80 leading-relaxed">
              K. Narayanpura, Bengaluru – 560077, Karnataka
            </p>
            <div className="pt-2 flex items-center space-x-3 text-french-gold text-lg">
              <span className="cursor-pointer hover:scale-110 transition-transform">📸</span>
              <span className="cursor-pointer hover:scale-110 transition-transform">📱</span>
              <span className="cursor-pointer hover:scale-110 transition-transform">📍</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-french-cream/60 gap-4">
          <p>© 2026 FRENCH BELL CAFE. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-french-gold fill-current" />
            <span>for food lovers</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
