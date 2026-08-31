import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, Menu as MenuIcon, X, Bell, Clock, Search, ShieldCheck } from 'lucide-react';

export default function Navbar({ onNavigate, activeSection }) {
  const { totalItemCount, setCartOpen, cartAnimate, setActiveModal, orderMode, setOrderMode } = useApp();
  const { user, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-french-dark/95 backdrop-blur-md shadow-2xl py-3 border-b border-french-gold/20'
          : 'bg-gradient-to-b from-french-dark/90 via-french-dark/60 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-french-gold p-0.5 bg-french-dark shadow-lg gold-glow transition-transform duration-300 group-hover:scale-105">
              <img
                src="/assets/logo.jfif"
                alt="French Bell Cafe"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg sm:text-xl text-french-cream tracking-wide leading-tight group-hover:text-french-gold transition-colors">
                FRENCH BELL
              </span>
              <span className="text-[10px] uppercase font-sans font-semibold tracking-widest text-french-gold opacity-90">
                CAFE • BENGALURU
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => handleNavClick('hero')}
              className={`text-sm font-medium transition-colors hover:text-french-gold ${
                activeSection === 'hero' ? 'text-french-gold font-semibold' : 'text-french-cream/90'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('menu')}
              className={`text-sm font-medium transition-colors hover:text-french-gold ${
                activeSection === 'menu' ? 'text-french-gold font-semibold' : 'text-french-cream/90'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => handleNavClick('offers')}
              className={`text-sm font-medium transition-colors hover:text-french-gold ${
                activeSection === 'offers' ? 'text-french-gold font-semibold' : 'text-french-cream/90'
              }`}
            >
              Offers
            </button>
            <button
              onClick={() => handleNavClick('track-order')}
              className={`text-sm font-medium transition-colors hover:text-french-gold ${
                activeSection === 'track-order' ? 'text-french-gold font-semibold' : 'text-french-cream/90'
              }`}
            >
              Track Order
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`text-sm font-medium transition-colors hover:text-french-gold ${
                activeSection === 'about' ? 'text-french-gold font-semibold' : 'text-french-cream/90'
              }`}
            >
              About Us
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-french-gold/20 text-french-gold border border-french-gold/40 text-xs font-bold uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Operations
              </button>
            )}
          </nav>

          {/* Desktop Right Action Area: Cart, Login, CTA */}
          <div className="hidden lg:flex items-center space-x-5">
            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className={`relative p-2.5 rounded-full bg-french-brown/80 border border-french-gold/30 text-french-cream hover:text-french-gold hover:border-french-gold transition-all duration-300 ${
                cartAnimate ? 'scale-125 border-french-gold bg-french-gold/20' : ''
              }`}
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-french-gold text-french-dark text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-french-dark">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* Profile / Auth Button */}
            <button
              onClick={() => setActiveModal(user ? 'profile' : 'auth')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-french-gold/30 bg-french-brown/60 text-french-cream text-sm font-medium hover:border-french-gold transition-colors"
            >
              <User className="w-4 h-4 text-french-gold" />
              <span>{user ? user.name.split(' ')[0] : 'Sign In'}</span>
            </button>

            {/* Order Now CTA */}
            <button
              onClick={() => handleNavClick('menu')}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold text-sm uppercase tracking-wider shadow-lg hover:shadow-french-gold/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Order Now</span>
            </button>
          </div>

          {/* Mobile Right Controls: Cart & Hamburger */}
          <div className="flex items-center space-x-3 lg:hidden">
            {/* Mobile Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-full bg-french-brown/80 border border-french-gold/30 text-french-cream"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-french-gold text-french-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-french-brown/80 border border-french-gold/30 text-french-cream focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-french-dark/98 border-b border-french-gold/30 backdrop-blur-xl px-6 py-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => handleNavClick('hero')}
              className="text-left font-serif font-semibold text-lg text-french-cream hover:text-french-gold"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('menu')}
              className="text-left font-serif font-semibold text-lg text-french-cream hover:text-french-gold"
            >
              Menu
            </button>
            <button
              onClick={() => handleNavClick('offers')}
              className="text-left font-serif font-semibold text-lg text-french-cream hover:text-french-gold"
            >
              Offers & Coupons
            </button>
            <button
              onClick={() => handleNavClick('track-order')}
              className="text-left font-serif font-semibold text-lg text-french-cream hover:text-french-gold"
            >
              Track Order
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left font-serif font-semibold text-lg text-french-cream hover:text-french-gold"
            >
              About Us
            </button>

            {isAdmin && (
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('admin'); }}
                className="text-left font-serif font-semibold text-lg text-french-gold flex items-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                Admin Dashboard
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-french-gold/20 flex flex-col space-y-3">
            <button
              onClick={() => { setMobileMenuOpen(false); setActiveModal(user ? 'profile' : 'auth'); }}
              className="w-full py-2.5 rounded-xl border border-french-gold/30 bg-french-brown text-french-cream font-medium text-sm flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-french-gold" />
              <span>{user ? `Account: ${user.name}` : 'Login / Register'}</span>
            </button>

            <button
              onClick={() => handleNavClick('menu')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Start Order Now</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
