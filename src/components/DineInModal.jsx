import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Utensils, Users, Check } from 'lucide-react';

export default function DineInModal({ onClose }) {
  const { dineInDetails, setDineInDetails, addNotification } = useApp();
  const [tableNumber, setTableNumber] = useState(dineInDetails.tableNumber || '04');
  const [numPeople, setNumPeople] = useState(dineInDetails.numPeople || 2);
  const [customerName, setCustomerName] = useState(dineInDetails.customerName || '');
  const [instructions, setInstructions] = useState(dineInDetails.instructions || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    setDineInDetails({ tableNumber, numPeople: Number(numPeople), customerName, instructions });
    addNotification('Dine-In Updated 🍽️', `Table #${tableNumber} configured for your order!`, 'success');
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
            🍽️
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-french-dark">Dine-In Table Details</h3>
            <p className="text-xs text-french-muted">Which table are you seated at?</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Table Number *
            </label>
            <input
              type="text"
              required
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 04 or T-12"
              className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 font-semibold focus:outline-none focus:border-french-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Number of People
            </label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 6, 8].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setNumPeople(num)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                    numPeople === num
                      ? 'bg-french-gold text-french-dark border-french-gold shadow'
                      : 'bg-french-cream text-french-dark border-french-gold/20 hover:border-french-gold'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Customer Name (Optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name for table callout"
              className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Special Instructions
            </label>
            <textarea
              rows="2"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Bring extra tissue, non-spicy"
              className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Confirm Table #{tableNumber}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
