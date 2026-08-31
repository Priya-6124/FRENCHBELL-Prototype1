import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Clock, ShoppingBag, Check } from 'lucide-react';

export default function TakeawayModal({ onClose }) {
  const { takeawayDetails, setTakeawayDetails, addNotification } = useApp();
  const [customerName, setCustomerName] = useState(takeawayDetails.customerName || '');
  const [phone, setPhone] = useState(takeawayDetails.phone || '');
  const [pickupTime, setPickupTime] = useState(takeawayDetails.pickupTime || '20-30 mins');
  const [instructions, setInstructions] = useState(takeawayDetails.instructions || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    setTakeawayDetails({ customerName, phone, pickupTime, instructions });
    addNotification('Takeaway Preferences Saved 🛍️', `Estimated pickup in ${pickupTime}!`, 'success');
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-french-card border border-french-gold/30 rounded-3xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-french-cream text-french-dark hover:bg-french-gold/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-french-gold/20 text-french-gold flex items-center justify-center text-2xl font-bold border border-french-gold/40">
            🛍️
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-french-dark">Takeaway Pickup Details</h3>
            <p className="text-xs text-french-muted">Pick up fresh at French Bell Cafe counter</p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-french-gold/10 border border-french-gold/30 text-xs text-french-dark font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 text-french-gold shrink-0" />
          <span>Estimated preparation time: <strong>20–30 minutes</strong></span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name for order pickup"
              className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Preferred Pickup Time
            </label>
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold font-semibold"
            >
              <option value="ASAP (15-20 mins)">ASAP (15–20 mins)</option>
              <option value="20-30 mins">Standard (20–30 mins)</option>
              <option value="In 45 mins">In 45 mins</option>
              <option value="In 1 Hour">In 1 Hour</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Special Pickup Notes
            </label>
            <textarea
              rows="2"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Pack sauces separately"
              className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Confirm Takeaway Pickup</span>
          </button>
        </form>
      </div>
    </div>
  );
}
