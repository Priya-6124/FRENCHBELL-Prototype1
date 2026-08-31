import React from 'react';
import { useApp } from '../context/AppContext';
import { Utensils, ShoppingBag, Bike, CheckCircle2, ChevronRight } from 'lucide-react';

export default function OrderModeToggle({ showDetailsCard = true }) {
  const {
    orderMode, setOrderMode,
    dineInDetails, setDineInDetails,
    takeawayDetails, setTakeawayDetails,
    deliveryDetails, setDeliveryDetails,
    setActiveModal
  } = useApp();

  const modes = [
    { id: 'dine-in', label: 'Dine-In', icon: Utensils, emoji: '🍽️', desc: 'Eating at cafe' },
    { id: 'takeaway', label: 'Takeaway', icon: ShoppingBag, emoji: '🛍️', desc: 'Pick up in 20m' },
    { id: 'delivery', label: 'Delivery', icon: Bike, emoji: '🛵', desc: 'Free under 2km' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto my-4">
      {/* Question Tagline */}
      <p className="text-center font-handwriting text-2xl text-french-gold mb-2 font-bold tracking-wide">
        How are you eating today? ✨
      </p>

      {/* Segmented Control Pill Bar */}
      <div className="relative p-1.5 rounded-full bg-french-dark/80 border border-french-gold/40 shadow-2xl backdrop-blur-md flex items-center justify-between">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = orderMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => setOrderMode(mode.id)}
              className={`relative flex-1 py-3 px-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 z-10 ${
                isSelected
                  ? 'text-french-dark bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] shadow-lg scale-[1.02]'
                  : 'text-french-cream/80 hover:text-french-gold hover:bg-french-brown/50'
              }`}
            >
              <span className="text-base sm:text-lg">{mode.emoji}</span>
              <span className="font-sans uppercase tracking-wider">{mode.label}</span>
              {isSelected && (
                <CheckCircle2 className="w-4 h-4 ml-0.5 text-french-dark hidden sm:inline" />
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Context Card below segmented control */}
      {showDetailsCard && (
        <div className="mt-3 p-4 rounded-2xl bg-french-card border border-french-gold/30 shadow-md backdrop-blur-sm transition-all animate-fadeIn">
          {orderMode === 'dine-in' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-french-gold/10 text-french-gold flex items-center justify-center font-bold font-serif text-lg">
                  {dineInDetails.tableNumber || '04'}
                </div>
                <div>
                  <span className="font-bold text-french-dark block">Table #{dineInDetails.tableNumber || '04'} • {dineInDetails.numPeople || 2} People</span>
                  <span className="text-xs text-french-muted">Food will be served directly to your table!</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('dine-in')}
                className="text-xs font-bold text-french-gold hover:underline flex items-center gap-1 bg-french-dark/90 px-3 py-1.5 rounded-full text-french-gold border border-french-gold/30"
              >
                Change Table Details ➔
              </button>
            </div>
          )}

          {orderMode === 'takeaway' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-french-gold/10 text-french-gold flex items-center justify-center font-bold text-lg">
                  🛍️
                </div>
                <div>
                  <span className="font-bold text-french-dark block">Estimated Pickup: 20–30 Minutes</span>
                  <span className="text-xs text-french-muted">Ready at counter for quick grab & go.</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('takeaway')}
                className="text-xs font-bold text-french-gold hover:underline flex items-center gap-1 bg-french-dark/90 px-3 py-1.5 rounded-full text-french-gold border border-french-gold/30"
              >
                Set Pickup Time ➔
              </button>
            </div>
          )}

          {orderMode === 'delivery' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  🛵
                </div>
                <div>
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <span>You're within 2 km — delivery is FREE 🎉</span>
                  </span>
                  <span className="text-xs text-french-muted block">Delivering to K. Narayanpura & surroundings</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('delivery')}
                className="text-xs font-bold text-french-gold hover:underline flex items-center gap-1 bg-french-dark/90 px-3 py-1.5 rounded-full text-french-gold border border-french-gold/30"
              >
                Edit Address ➔
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
