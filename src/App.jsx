import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuPage from './components/MenuPage';
import OffersSection from './components/OffersSection';
import CouponsSection from './components/CouponsSection';
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
import { Bell, Clock, Bike, UtensilsCrossed } from 'lucide-react';

function MainSiteContent() {
  const [showSplash, setShowSplash] = useState(true);
  const {
    currentView,
    setCurrentView,
    activeModal,
    setActiveModal,
    activeOrder,
    setActiveOrder
  } = useApp();
  const { user } = useAuth();

  const handleOrderPlaced = (order) => {
    setActiveOrder(order);
    setActiveModal('confirmation');
  };

  const handleNavigate = (target) => {
    if (target === 'admin') {
      setCurrentView('admin');
    } else if (target === 'menu') {
      setCurrentView('menu');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'home') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  // If Admin view is selected, render full cafe management operations system
  if (currentView === 'admin') {
    return (
      <AdminDashboard onBackToSite={() => setCurrentView('home')} />
    );
  }

  return (
    <div className="min-h-screen bg-french-cream font-sans text-french-dark relative">

      {/* Animated Splash Screen Intro */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* Sticky Responsive Navigation Bar */}
      <Navbar onNavigate={handleNavigate} currentView={currentView} />

      {/* Main Page View Routing */}
      {currentView === 'menu' ? (
        <main>
          <MenuPage onBackToHome={() => handleNavigate('home')} />
        </main>
      ) : (
        <main>
          <Hero onExploreClick={() => handleNavigate('menu')} />
          <OffersSection onExploreClick={() => handleNavigate('menu')} />
          <CouponsSection onExploreClick={() => handleNavigate('menu')} />
          <AboutSection />
        </main>
      )}

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
          onTrackOrder={(o) => {
            setActiveOrder(o);
            setActiveModal('tracker');
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
