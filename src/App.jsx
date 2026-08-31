import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedFood from './components/FeaturedFood';
import MenuSection from './components/MenuSection';
import OffersSection from './components/OffersSection';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';

// Modals
import DineInModal from './components/DineInModal';
import TakeawayModal from './components/TakeawayModal';
import DeliveryModal from './components/DeliveryModal';
import FoodDetailsModal from './components/FoodDetailsModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import ConfirmationModal from './components/ConfirmationModal';
import OrderTracker from './components/OrderTracker';
import EReceiptModal from './components/EReceiptModal';
import AuthModal from './components/AuthModal';
import ProfileDrawer from './components/ProfileDrawer';
import NotificationsToast from './components/NotificationsToast';

// Admin Operations System
import AdminDashboard from './components/admin/AdminDashboard';

function MainSiteContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState('customer'); // 'customer' | 'admin'
  const [activeSection, setActiveSection] = useState('hero');

  const { activeModal, setActiveModal, selectedFood, activeOrder, setActiveOrder } = useApp();
  const { user } = useAuth();

  const handleOrderPlaced = (order) => {
    setActiveOrder(order);
    setActiveModal('confirmation');
  };

  const handleNavigate = (target) => {
    if (target === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('customer');
      setActiveSection(target);
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If Admin view is selected, render full cafe management operations system!
  if (currentView === 'admin') {
    return (
      <AdminDashboard onBackToSite={() => setCurrentView('customer')} />
    );
  }

  return (
    <div className="min-h-screen bg-french-cream font-sans text-french-dark relative">
      
      {/* Animated Splash Screen Intro */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* Sticky Responsive Navigation Bar */}
      <Navbar onNavigate={handleNavigate} activeSection={activeSection} />

      {/* Main Page Sections */}
      <main>
        <Hero onExploreClick={() => handleNavigate('menu')} />
        <FeaturedFood />
        <MenuSection />
        <OffersSection />

        <section id="track-order" className="py-12 bg-french-cream border-t border-french-gold/15 text-center">
          <div className="max-w-4xl mx-auto px-4 space-y-4">
            <span className="font-handwriting text-3xl text-french-gold font-bold block">
              Follow Your Delicious Journey 🔔
            </span>
            <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-french-dark">
              Track Active Cafe Order
            </h3>
            <p className="text-xs sm:text-sm text-french-muted max-w-md mx-auto">
              Check real-time preparation status from kitchen to serving table or delivery doorstep.
            </p>
            <button
              onClick={() => setActiveModal('tracker')}
              className="px-6 py-3 rounded-full bg-french-dark text-french-gold font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all gold-glow"
            >
              Open Live Order Tracker 🛵
            </button>
          </div>
        </section>

        <AboutSection />
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Toast Notifications */}
      <NotificationsToast />

      {/* Modals & Slide Drawers */}
      {activeModal === 'dine-in' && <DineInModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'takeaway' && <TakeawayModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'delivery' && <DeliveryModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'foodDetails' && <FoodDetailsModal onClose={() => setActiveModal(null)} />}
      <CartDrawer />
      {activeModal === 'checkout' && (
        <CheckoutModal
          onClose={() => setActiveModal(null)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
      {activeModal === 'confirmation' && (
        <ConfirmationModal
          order={activeOrder}
          onClose={() => setActiveModal(null)}
          onTrackOrder={() => setActiveModal('tracker')}
          onViewReceipt={() => setActiveModal('receipt')}
        />
      )}
      {activeModal === 'tracker' && (
        <OrderTracker
          order={activeOrder}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'receipt' && (
        <EReceiptModal
          order={activeOrder}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'auth' && <AuthModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'profile' && (
        <ProfileDrawer
          onClose={() => setActiveModal(null)}
          onViewReceipt={(o) => {
            setActiveOrder(o);
            setActiveModal('receipt');
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainSiteContent />
      </AppProvider>
    </AuthProvider>
  );
}
