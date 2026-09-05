import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, ShieldCheck } from 'lucide-react';

export default function Navbar({ onNavigate, currentView }) {
  const { totalItemCount, setCartOpen, cartAnimate, setActiveModal } = useApp();
  const { user, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-french-dark/95 backdrop-blur-md shadow-2xl py-3 border-b border-french-gold/20'
          : 'bg-gradient-to-b from-french-dark/95 via-french-dark/70 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Left: FrenchBell Cafe Logo & Brand */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-french-gold p-0.5 bg-french-dark shadow-lg gold-glow transition-transform duration-300 group-hover:scale-105">
              <img
                src="/assets/logo.jfif"
                alt="FrenchBell Cafe"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg sm:text-xl text-french-cream tracking-wide leading-tight group-hover:text-french-gold transition-colors">
                FRENCHBELL
              </span>
              <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-french-gold opacity-90">
                CAFE • BENGALURU
              </span>
            </div>
          </div>

          {/* Right: Actions (Profile & Cart Badge only - NO Home/Menu/About traditional links) */}
          <div className="flex items-center space-x-3 sm:space-x-4">

            {/* Admin Badge if logged in as admin */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-french-gold/20 text-french-gold border border-french-gold/40 text-xs font-bold uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all"
                title="Open Admin Operations"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            {/* Profile Icon Button */}
            <button
              onClick={() => setActiveModal(user ? 'profile' : 'auth')}
              className="flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 rounded-full border border-french-gold/30 bg-french-brown/80 text-french-cream text-xs sm:text-sm font-medium hover:border-french-gold hover:text-french-gold transition-all duration-300 shadow-md"
              title={user ? `Profile (${user.name})` : "Login / Register"}
              aria-label="Customer Profile"
            >
              <User className="w-4 h-4 sm:w-4 sm:h-4 text-french-gold" />
              <span className="hidden sm:inline font-semibold">
                {user ? (user.name.split(' ')[0] || 'Profile') : 'Login'}
              </span>
            </button>

            {/* Cart Icon Button with Count Badge */}
            <button
              onClick={() => setCartOpen(true)}
              className={`relative p-2.5 rounded-full bg-french-brown/80 border border-french-gold/30 text-french-cream hover:text-french-gold hover:border-french-gold transition-all duration-300 shadow-md ${
                cartAnimate ? 'scale-125 border-french-gold bg-french-gold/20' : ''
              }`}
              title="Shopping Cart"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-french-cream group-hover:text-french-gold" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-french-gold text-french-dark text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-french-dark animate-pulse">
                  {totalItemCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
