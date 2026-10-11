import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bike, CheckCircle2, MapPin, Navigation, Compass,
  DollarSign, Clock, ShieldCheck, Save, RefreshCw
} from 'lucide-react';

export default function DeliverySettings({ initialTab = 'settings' }) {
  const { settings, setSettings, addNotification } = useApp();
  const { token } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState(initialTab === 'area' ? 'area' : 'settings');
  const [freeKm, setFreeKm] = useState(settings.free_delivery_km || '2');
  const [feePerKm, setFeePerKm] = useState(settings.delivery_fee_per_km || '15');
  const [minOrder, setMinOrder] = useState(settings.min_order_delivery || '120');
  const [deliveryEnabled, setDeliveryEnabled] = useState(settings.delivery_enabled !== '0');
  const [testDistance, setTestDistance] = useState('3.5');

  useEffect(() => {
    if (initialTab === 'area') setActiveSubTab('area');
    else if (initialTab === 'settings') setActiveSubTab('settings');
  }, [initialTab]);

  const handleSave = async (e) => {
    e.preventDefault();
    const updated = {
      free_delivery_km: String(freeKm),
      delivery_fee_per_km: String(feePerKm),
      min_order_delivery: String(minOrder),
      delivery_enabled: deliveryEnabled ? '1' : '0'
    };

    setSettings(prev => ({ ...prev, ...updated }));
    addNotification('Delivery Settings Saved', 'Delivery radius, fees, and rules saved successfully!', 'success');

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

  // Distance calculator test helper
  const calcDeliveryCharge = (km) => {
    const numKm = Number(km) || 0;
    const freeZone = Number(freeKm) || 2;
    if (numKm <= freeZone) return 0;
    const extraKm = numKm - freeZone;
    return Math.round(extraKm * (Number(feePerKm) || 15));
  };

  // Covered localities around K. Narayanpura
  const coveredZones = [
    { name: 'K. Narayanpura Main Hub', distance: '0 - 1.0 km', status: 'Free Delivery', tier: 'Primary' },
    { name: 'Kristu Jayanti College Campus', distance: '0.8 - 1.5 km', status: 'Free Delivery', tier: 'Primary' },
    { name: 'Geddalahalli & Kothanur Junction', distance: '1.8 - 2.5 km', status: 'Within Service Zone', tier: 'Tier 1' },
    { name: 'Hennur Cross & Outer Ring Rd', distance: '2.5 - 4.0 km', status: '₹15/km Service Charge', tier: 'Tier 2' },
    { name: 'Horamavu & Kalkere Lake Rd', distance: '4.0 - 6.0 km', status: 'Special Extended Radius', tier: 'Tier 3' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <Bike className="w-4 h-4" />
            <span>Doorstep Logistics Management</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-french-cream">
            DELIVERY & RADIUS OPERATIONS
          </h2>
          <p className="text-xs text-french-cream/80 mt-1 max-w-xl">
            Configure delivery perimeter around K. Narayanpura, Bengaluru. Control free radius thresholds and calculate automated customer delivery fees.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-2 gold-glow"
        >
          <Save className="w-4 h-4" />
          <span>Save Logistics</span>
        </button>
      </div>

      {/* Sub Tabs: Delivery Area | Delivery Settings */}
      <div className="flex items-center gap-2 border-b border-french-gold/20 pb-3">
        {[
          { id: 'area', label: 'Delivery Area & Radius' },
          { id: 'settings', label: 'Delivery Rules & Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeSubTab === tab.id
                ? 'bg-french-gold text-french-dark shadow gold-glow'
                : 'bg-french-card text-french-dark/80 hover:bg-french-cream border border-french-gold/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-VIEW 1: DELIVERY AREA & COVERAGE MAP */}
      {activeSubTab === 'area' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Visual Coverage Zones (Left 7) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-french-gold/25 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-french-gold/15 pb-3">
              <div>
                <h3 className="font-serif font-black text-base text-french-dark">
                  Coverage Neighborhoods & Radius Tiers
                </h3>
                <p className="text-xs text-french-muted">
                  Centered at FrenchBell Cafe, K. Narayanpura (Pin: 560077)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                {freeKm} km Free Zone
              </span>
            </div>

            <div className="space-y-2.5">
              {coveredZones.map((zone, idx) => (
                <div
                  key={zone.name}
                  className="p-3.5 rounded-2xl bg-french-cream/60 border border-french-gold/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-french-dark text-french-gold flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-french-dark text-sm">{zone.name}</h4>
                      <span className="text-french-muted text-[11px] font-mono">{zone.distance}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      zone.status.includes('Free') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {zone.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Embedded Google Map */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-french-dark block mb-2">
                Live Store Geographic Coordinates
              </span>
              <div className="w-full h-48 rounded-2xl overflow-hidden border border-french-gold/30">
                <iframe
                  title="Cafe Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.6346914561876!2d77.6416629!3d13.0600021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1700505cef43%3A0xc792bc75b8cb8b90!2sFrench%20Bell%2C%20Kristu%20Jayanti%20College!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Interactive Fee Simulator (Right 5) */}
          <div className="lg:col-span-5 bg-french-dark p-6 rounded-3xl border border-french-gold/40 shadow-xl text-french-cream space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-french-gold block mb-1">
                Fee Simulator & Logistics Rules
              </span>
              <h4 className="font-serif font-black text-lg text-french-cream">
                Automated Rider Dispatch Fee
              </h4>
              <p className="text-xs text-french-cream/70 mt-1">
                Enter an address distance to preview the exact fee billed to customer checkout.
              </p>
            </div>

            {/* Simulator Box */}
            <div className="p-4 rounded-2xl bg-french-brown/80 border border-french-gold/30 space-y-3">
              <label className="block text-xs font-bold uppercase text-french-gold">
                Simulate Delivery Distance (KM):
              </label>
              <input
                type="number"
                step="0.1"
                value={testDistance}
                onChange={(e) => setTestDistance(e.target.value)}
                className="w-full p-3 rounded-xl bg-french-dark text-french-cream border border-french-gold/40 font-mono text-base font-bold"
              />

              <div className="p-3 rounded-xl bg-french-dark/90 border border-french-gold/20 flex items-center justify-between">
                <span className="text-xs text-french-cream/80">Calculated Charge:</span>
                <span className="font-serif font-black text-xl text-french-gold">
                  {calcDeliveryCharge(testDistance) === 0 ? 'FREE (₹0)' : `₹${calcDeliveryCharge(testDistance)}`}
                </span>
              </div>

              <div className="text-[11px] text-french-cream/70 space-y-1">
                <p>&bull; First <strong>{freeKm} km:</strong> 100% Free Doorstep Delivery</p>
                <p>&bull; Beyond {freeKm} km: <strong>₹{feePerKm}/km</strong> billed incrementally</p>
                <p>&bull; Minimum Order Threshold: <strong>₹{minOrder}</strong></p>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('settings')}
              className="w-full py-3 rounded-2xl bg-french-gold text-french-dark font-black text-xs uppercase tracking-wider shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2"
            >
              <span>Edit Delivery Rates & Thresholds</span>
            </button>
          </div>

        </div>
      )}

      {/* SUB-VIEW 2: DELIVERY RULES & SETTINGS FORM */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white border border-french-gold/30 shadow-lg space-y-5 text-xs font-bold text-french-dark max-w-2xl">
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-french-cream border border-french-gold/20">
            <div>
              <span className="text-sm font-bold block">Enable Home Delivery Service</span>
              <span className="text-french-muted font-normal text-xs">Allow customers to choose doorstep delivery at checkout</span>
            </div>
            <input
              type="checkbox"
              checked={deliveryEnabled}
              onChange={(e) => setDeliveryEnabled(e.target.checked)}
              className="w-5 h-5 accent-french-gold cursor-pointer"
            />
          </div>

          <div>
            <label className="block mb-1.5 uppercase tracking-wider text-xs">Free Delivery Radius (KM) *</label>
            <input
              type="number"
              required
              value={freeKm}
              onChange={(e) => setFreeKm(e.target.value)}
              className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono text-sm"
            />
            <span className="text-[11px] text-french-muted font-normal mt-1 block">
              Default specification: <strong>2 km free zone</strong> centered at K. Narayanpura
            </span>
          </div>

          <div>
            <label className="block mb-1.5 uppercase tracking-wider text-xs">Delivery Fee Beyond Free Zone (₹/km) *</label>
            <input
              type="number"
              required
              value={feePerKm}
              onChange={(e) => setFeePerKm(e.target.value)}
              className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono text-sm"
            />
            <span className="text-[11px] text-french-muted font-normal mt-1 block">
              Charged per additional kilometer over the free delivery radius.
            </span>
          </div>

          <div>
            <label className="block mb-1.5 uppercase tracking-wider text-xs">Minimum Order Amount for Delivery (₹) *</label>
            <input
              type="number"
              required
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono text-sm"
            />
            <span className="text-[11px] text-french-muted font-normal mt-1 block">
              Customer carts below this minimum cannot select delivery.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-french-dark text-french-gold font-extrabold uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all gold-glow"
          >
            Save Delivery Configuration
          </button>
        </form>
      )}

    </div>
  );
}
