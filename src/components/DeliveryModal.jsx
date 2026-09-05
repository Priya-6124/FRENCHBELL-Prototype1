import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, MapPin, Bike, Check, Sparkles } from 'lucide-react';

export default function DeliveryModal({ onClose }) {
  const { deliveryDetails, setDeliveryDetails, addNotification } = useApp();
  const [customerName, setCustomerName] = useState(deliveryDetails.customerName || '');
  const [phone, setPhone] = useState(deliveryDetails.phone || '');
  const [address, setAddress] = useState(deliveryDetails.address || 'K. Narayanpura, Main Rd');
  const [landmark, setLandmark] = useState(deliveryDetails.landmark || 'Near SBI ATM');
  const [pincode, setPincode] = useState(deliveryDetails.pincode || '560077');
  const [instructions, setInstructions] = useState(deliveryDetails.instructions || '');
  const [distanceKm, setDistanceKm] = useState(1.5);

  const handleSubmit = (e) => {
    e.preventDefault();
    setDeliveryDetails({ customerName, phone, address, landmark, pincode, instructions });
    addNotification('Delivery Address Saved', 'Delivery details updated!', 'success');
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-french-card border border-french-gold/30 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-french-cream text-french-dark hover:bg-french-gold/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center border border-emerald-500/30">
            <Bike className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-french-dark">Delivery Address</h3>
            <p className="text-xs text-french-muted">Hot & fresh directly to your doorstep</p>
          </div>
        </div>

        {/* Free Delivery Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-yellow-300 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-sm">You are within 2 km — delivery is free</p>
            <p className="opacity-90">K. Narayanpura, Bengaluru – 560077 Zone</p>
          </div>
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
              placeholder="Full Name"
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
              Full Delivery Address *
            </label>
            <textarea
              rows="2"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Flat No., Building Name, Street"
              className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
                Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Bank"
                className="w-full px-3.5 py-2 rounded-xl border border-french-gold/30 bg-french-cream/60 text-xs focus:outline-none focus:border-french-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="560077"
                className="w-full px-3.5 py-2 rounded-xl border border-french-gold/30 bg-french-cream/60 text-xs focus:outline-none focus:border-french-gold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Delivery Drop Instructions
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Leave at door, don't ring bell"
              className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Save Delivery Address</span>
          </button>
        </form>
      </div>
    </div>
  );
}
