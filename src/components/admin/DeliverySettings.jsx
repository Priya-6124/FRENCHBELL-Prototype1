import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Bike, CheckCircle2 } from 'lucide-react';

export default function DeliverySettings() {
  const { settings, setSettings, addNotification } = useApp();
  const { token } = useAuth();

  const [freeKm, setFreeKm] = useState(settings.free_delivery_km || '2');
  const [feePerKm, setFeePerKm] = useState(settings.delivery_fee_per_km || '15');
  const [minOrder, setMinOrder] = useState(settings.min_order_delivery || '120');
  const [deliveryEnabled, setDeliveryEnabled] = useState(settings.delivery_enabled === '1');

  const handleSave = async (e) => {
    e.preventDefault();
    const updated = {
      free_delivery_km: String(freeKm),
      delivery_fee_per_km: String(feePerKm),
      min_order_delivery: String(minOrder),
      delivery_enabled: deliveryEnabled ? '1' : '0'
    };

    setSettings(prev => ({ ...prev, ...updated }));
    addNotification('Delivery Settings Saved 🛵', 'Radius & charges updated!', 'success');

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
    } catch (e) {}
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="p-4 rounded-2xl bg-french-dark text-french-cream border border-french-gold/30 flex items-center gap-3">
        <Bike className="w-8 h-8 text-french-gold" />
        <div>
          <h3 className="font-serif font-extrabold text-2xl text-french-gold">
            Delivery & Logistics Settings
          </h3>
          <p className="text-xs text-french-cream/80">
            Configure free delivery radius, per km rates, and minimum order rules.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-french-card border border-french-gold/30 shadow-lg space-y-4 text-xs font-bold text-french-dark">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-french-cream border border-french-gold/20">
          <div>
            <span className="text-sm font-bold block">Enable Home Delivery Service</span>
            <span className="text-french-muted">Allow customers to place delivery orders</span>
          </div>
          <input
            type="checkbox"
            checked={deliveryEnabled}
            onChange={(e) => setDeliveryEnabled(e.target.checked)}
            className="w-5 h-5 accent-french-gold cursor-pointer"
          />
        </div>

        <div>
          <label className="block mb-1 uppercase tracking-wider">Free Delivery Radius (KM) *</label>
          <input
            type="number"
            required
            value={freeKm}
            onChange={(e) => setFreeKm(e.target.value)}
            className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono text-sm"
          />
          <span className="text-[11px] text-french-muted font-normal mt-1 block">
            Default requirement: <strong>2 km free delivery</strong>
          </span>
        </div>

        <div>
          <label className="block mb-1 uppercase tracking-wider">Delivery Charge Beyond Free Radius (₹/km)</label>
          <input
            type="number"
            value={feePerKm}
            onChange={(e) => setFeePerKm(e.target.value)}
            className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block mb-1 uppercase tracking-wider">Minimum Order Amount For Delivery (₹)</label>
          <input
            type="number"
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-french-dark text-french-gold font-extrabold uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all gold-glow"
        >
          Save Delivery Configuration
        </button>
      </form>
    </div>
  );
}
