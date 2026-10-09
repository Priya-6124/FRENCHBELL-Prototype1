import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Store, Clock, ToggleLeft, ToggleRight, MapPin, Phone, Mail,
  CheckCircle2, Save, Bike, Utensils, ShoppingBag, ShieldCheck
} from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CafeSettingsManager({ initialTab = 'cafe-info' }) {
  const { settings, setSettings, addNotification } = useApp();
  const { token } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // 1. Cafe Information Form State
  const [cafeName, setCafeName] = useState(settings.cafe_name || 'FrenchBell Cafe');
  const [cafePhone, setCafePhone] = useState(settings.cafe_phone || '+91 98765 43210');
  const [cafeEmail, setCafeEmail] = useState(settings.cafe_email || 'manager@frenchbellcafe.com');
  const [cafeAddress, setCafeAddress] = useState(settings.cafe_address || 'K. Narayanpura, Bengaluru – 560077, Karnataka');
  const [mapUrl, setMapUrl] = useState(settings.map_url || 'https://maps.app.goo.gl/w4z22NYUUiSxUxiJ6');

  // 2. Business Hours Form State
  const [businessHours, setBusinessHours] = useState(() => {
    try {
      if (settings.business_hours) {
        return typeof settings.business_hours === 'string'
          ? JSON.parse(settings.business_hours)
          : settings.business_hours;
      }
    } catch (e) {}

    const defaults = {};
    DAYS_OF_WEEK.forEach(day => {
      defaults[day] = { open: '11:00 AM', close: '11:30 PM', closed: false };
    });
    return defaults;
  });

  // 3. Order Settings Form State
  const [takeawayEnabled, setTakeawayEnabled] = useState(settings.takeaway_enabled !== '0');
  const [dineInEnabled, setDineInEnabled] = useState(settings.dine_in_enabled !== '0');
  const [deliveryEnabled, setDeliveryEnabled] = useState(settings.delivery_enabled !== '0');
  const [minOrderAmount, setMinOrderAmount] = useState(settings.min_order_amount || '99');
  const [defaultPrepTime, setDefaultPrepTime] = useState(settings.default_prep_time_mins || '15');

  // 4. Delivery Settings Form State
  const [freeKm, setFreeKm] = useState(settings.free_delivery_km || '2');
  const [deliveryFeePerKm, setDeliveryFeePerKm] = useState(settings.delivery_fee_per_km || '15');
  const [minOrderDelivery, setMinOrderDelivery] = useState(settings.min_order_delivery || '120');

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updated = {
      cafe_name: cafeName,
      cafe_phone: cafePhone,
      cafe_email: cafeEmail,
      cafe_address: cafeAddress,
      map_url: mapUrl,
      business_hours: JSON.stringify(businessHours),
      takeaway_enabled: takeawayEnabled ? '1' : '0',
      dine_in_enabled: dineInEnabled ? '1' : '0',
      delivery_enabled: deliveryEnabled ? '1' : '0',
      min_order_amount: String(minOrderAmount),
      default_prep_time_mins: String(defaultPrepTime),
      free_delivery_km: String(freeKm),
      delivery_fee_per_km: String(deliveryFeePerKm),
      min_order_delivery: String(minOrderDelivery)
    };

    setSettings(prev => ({ ...prev, ...updated }));
    addNotification('Settings Saved', 'Operational configurations saved successfully.', 'success');

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
    } catch (err) {}
    setLoading(false);
  };

  const handleToggleDayClosed = (day) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day]?.closed
      }
    }));
  };

  const handleTimeChange = (day, field, val) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: val
      }
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-widest mb-1.5">
            <Store className="w-4 h-4 text-french-gold" />
            <span>Operational Master Settings</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-french-cream">
            CAFE SETTINGS
          </h2>
          <p className="text-xs text-french-cream/80 mt-1 max-w-xl">
            Configure cafe brand details, 7-day operating schedule, fulfillment toggles, and delivery logistics rules.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 gold-glow disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-french-gold/20 pb-2">
        {[
          { id: 'cafe-info', label: 'Cafe Information', icon: Store },
          { id: 'business-hours', label: 'Business Hours', icon: Clock },
          { id: 'order-settings', label: 'Order Settings', icon: ShoppingBag },
          { id: 'delivery-settings', label: 'Delivery Settings', icon: Bike }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-french-dark text-french-gold border border-french-gold shadow'
                  : 'bg-french-card text-french-dark hover:bg-french-cream border border-french-gold/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* 1. CAFE INFORMATION */}
        {activeSubTab === 'cafe-info' && (
          <div className="bg-french-card p-6 rounded-3xl border border-french-gold/30 shadow-lg space-y-4">
            <h3 className="font-serif font-bold text-lg text-french-dark border-b border-french-gold/20 pb-2">
              Cafe Brand & Location Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-french-dark">
              <div>
                <label className="block mb-1 uppercase tracking-wider">Cafe Name *</label>
                <input
                  type="text"
                  required
                  value={cafeName}
                  onChange={(e) => setCafeName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark font-medium focus:outline-none focus:border-french-gold"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={cafePhone}
                  onChange={(e) => setCafePhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark font-medium focus:outline-none focus:border-french-gold"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Official Email *</label>
                <input
                  type="email"
                  required
                  value={cafeEmail}
                  onChange={(e) => setCafeEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark font-medium focus:outline-none focus:border-french-gold"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Google Maps Link</label>
                <input
                  type="url"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark font-medium focus:outline-none focus:border-french-gold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 uppercase tracking-wider">Physical Cafe Address *</label>
                <textarea
                  rows={2}
                  required
                  value={cafeAddress}
                  onChange={(e) => setCafeAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark font-medium focus:outline-none focus:border-french-gold"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. BUSINESS HOURS */}
        {activeSubTab === 'business-hours' && (
          <div className="bg-french-card p-6 rounded-3xl border border-french-gold/30 shadow-lg space-y-4">
            <h3 className="font-serif font-bold text-lg text-french-dark border-b border-french-gold/20 pb-2">
              Weekly Operating Schedule (Monday – Sunday)
            </h3>

            <div className="divide-y divide-french-gold/15">
              {DAYS_OF_WEEK.map(day => {
                const config = businessHours[day] || { open: '11:00 AM', close: '11:30 PM', closed: false };

                return (
                  <div key={day} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="w-32 font-serif font-bold text-sm text-french-dark">
                      {day}
                    </div>

                    <div className="flex items-center gap-4 flex-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!config.closed}
                          onChange={() => handleToggleDayClosed(day)}
                          className="w-4 h-4 accent-french-gold"
                        />
                        <span className={`font-extrabold uppercase text-[10px] ${!config.closed ? 'text-emerald-800' : 'text-red-600'}`}>
                          {!config.closed ? 'Open' : 'Closed'}
                        </span>
                      </label>

                      {!config.closed && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={config.open}
                            onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                            placeholder="11:00 AM"
                            className="w-24 p-2 rounded-lg border border-french-gold/30 bg-french-cream/60 font-mono text-center text-xs"
                          />
                          <span className="text-french-muted">to</span>
                          <input
                            type="text"
                            value={config.close}
                            onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                            placeholder="11:30 PM"
                            className="w-24 p-2 rounded-lg border border-french-gold/30 bg-french-cream/60 font-mono text-center text-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. ORDER SETTINGS */}
        {activeSubTab === 'order-settings' && (
          <div className="bg-french-card p-6 rounded-3xl border border-french-gold/30 shadow-lg space-y-4">
            <h3 className="font-serif font-bold text-lg text-french-dark border-b border-french-gold/20 pb-2">
              Fulfillment Modes & Order Rules
            </h3>

            <div className="space-y-3">
              {/* Takeaway toggle */}
              <div className="p-4 rounded-2xl bg-french-cream/70 border border-french-gold/20 flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-sm text-french-dark block">Takeaway Orders</span>
                  <span className="text-xs text-french-muted">Allow customers to order for quick counter pickup</span>
                </div>
                <input
                  type="checkbox"
                  checked={takeawayEnabled}
                  onChange={(e) => setTakeawayEnabled(e.target.checked)}
                  className="w-5 h-5 accent-french-gold cursor-pointer"
                />
              </div>

              {/* Dine-In toggle */}
              <div className="p-4 rounded-2xl bg-french-cream/70 border border-french-gold/20 flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-sm text-french-dark block">Dine-In Table Orders</span>
                  <span className="text-xs text-french-muted">Allow table QR scanning and dine-in kitchen dispatch</span>
                </div>
                <input
                  type="checkbox"
                  checked={dineInEnabled}
                  onChange={(e) => setDineInEnabled(e.target.checked)}
                  className="w-5 h-5 accent-french-gold cursor-pointer"
                />
              </div>

              {/* Delivery toggle */}
              <div className="p-4 rounded-2xl bg-french-cream/70 border border-french-gold/20 flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-sm text-french-dark block">Home Delivery Service</span>
                  <span className="text-xs text-french-muted">Allow doorstep delivery orders within configured radius</span>
                </div>
                <input
                  type="checkbox"
                  checked={deliveryEnabled}
                  onChange={(e) => setDeliveryEnabled(e.target.checked)}
                  className="w-5 h-5 accent-french-gold cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-bold text-french-dark">
              <div>
                <label className="block mb-1 uppercase tracking-wider">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Default Kitchen Preparation Time (Minutes)</label>
                <input
                  type="number"
                  value={defaultPrepTime}
                  onChange={(e) => setDefaultPrepTime(e.target.value)}
                  className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. DELIVERY SETTINGS */}
        {activeSubTab === 'delivery-settings' && (
          <div className="bg-french-card p-6 rounded-3xl border border-french-gold/30 shadow-lg space-y-4">
            <h3 className="font-serif font-bold text-lg text-french-dark border-b border-french-gold/20 pb-2">
              Delivery Area & Radius Logistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-french-dark">
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
                  Current FrenchBell specification: <strong>2 km free delivery radius</strong>
                </span>
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Delivery Charge Beyond Free Radius (₹/km)</label>
                <input
                  type="number"
                  value={deliveryFeePerKm}
                  onChange={(e) => setDeliveryFeePerKm(e.target.value)}
                  className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Minimum Order For Delivery (₹)</label>
                <input
                  type="number"
                  value={minOrderDelivery}
                  onChange={(e) => setMinOrderDelivery(e.target.value)}
                  className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-full bg-french-dark text-french-gold font-black text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all gold-glow shadow-md disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>

      </form>

    </div>
  );
}
