import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Tag, Plus, Trash2, CheckCircle2, Sparkles, X, Gift, Check,
  Percent, Calendar, ArrowRight, ShieldCheck, Flame
} from 'lucide-react';

export default function OfferManager({ initialTab = 'coupons' }) {
  const { offers, setOffers, addNotification } = useApp();
  const { token } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState(initialTab === 'promotions' ? 'promotions' : 'coupons');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('20');
  const [minimumOrder, setMinimumOrder] = useState('199');
  const [maxDiscount, setMaxDiscount] = useState('100');
  const [expiryDate, setExpiryDate] = useState('31 Dec 2026');

  useEffect(() => {
    if (initialTab === 'promotions') setActiveSubTab('promotions');
    else if (initialTab === 'coupons') setActiveSubTab('coupons');
  }, [initialTab]);

  // Promotions / Featured Deals State
  const [promotions, setPromotions] = useState([
    {
      id: 1,
      title: 'Monster Burger Feast Combo',
      description: 'Get any Gourmet Burger + Peri Peri Fries + Soft Beverage combo starting at ₹199!',
      badge: 'Bestseller Deal',
      discount: 'Save 25%',
      active: 1
    },
    {
      id: 2,
      title: 'Weekend Momos Carnival',
      description: 'Order 2 Plates of Steamed/Fried Momos and get 1 Signature Dip Platter FREE.',
      badge: 'Weekend Special',
      discount: 'Buy 2 Get 1 Dip',
      active: 1
    },
    {
      id: 3,
      title: 'Student Special Discount',
      description: 'Special 10% flat discount for Kristu Jayanti students with valid student ID.',
      badge: 'Campus Deal',
      discount: 'Flat 10% Off',
      active: 1
    }
  ]);

  const handleGenerateCode = async () => {
    try {
      const res = await fetch('/api/offers/generate-code', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.code) setCouponCode(data.code);
      } else {
        const randomCode = 'FB' + Math.floor(10 + Math.random() * 90) + 'OFF';
        setCouponCode(randomCode);
      }
    } catch (e) {
      const randomCode = 'FB' + Math.floor(10 + Math.random() * 90) + 'OFF';
      setCouponCode(randomCode);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    const newOffer = {
      id: Date.now(),
      title,
      description,
      coupon_code: couponCode.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      minimum_order: Number(minimumOrder),
      max_discount: Number(maxDiscount),
      expiry_date: expiryDate,
      active: 1
    };

    setOffers([newOffer, ...offers]);
    addNotification('Coupon Created', `Coupon ${newOffer.coupon_code} is active for customers!`, 'success');

    try {
      await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newOffer)
      });
    } catch (err) {}

    setShowModal(false);
    setTitle('');
    setCouponCode('');
    setDescription('');
  };

  const handleDeleteOffer = async (id) => {
    setOffers(offers.filter(o => o.id !== id));
    addNotification('Coupon Removed', 'Coupon deactivated from checkout', 'info');

    try {
      await fetch(`/api/offers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <Gift className="w-4 h-4" />
            <span>Promotional Discounts & Coupons</span>
          </div>
          <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-french-gold">
            OFFERS & COUPONS MANAGEMENT
          </h2>
          <p className="text-xs text-french-cream/80 mt-1 max-w-xl">
            Create promotional discount coupons, set minimum spend rules, max discount caps, and publish combo meal deals.
          </p>
        </div>

        <button
          onClick={() => {
            handleGenerateCode();
            setShowModal(true);
          }}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Sub Tabs: Coupons | Promotions */}
      <div className="flex items-center gap-2 border-b border-french-gold/20 pb-3">
        {[
          { id: 'coupons', label: `Coupons (${offers.length})` },
          { id: 'promotions', label: `Promotions & Combos (${promotions.length})` }
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

      {/* TAB 1: COUPONS */}
      {activeSubTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((o) => (
            <div key={o.id} className="p-5 rounded-3xl bg-white border-2 border-french-gold/30 shadow-md space-y-3 relative flex flex-col justify-between hover:border-french-gold transition-all">
              <button
                onClick={() => handleDeleteOffer(o.id)}
                className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors"
                title="Delete Coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-french-dark text-french-gold font-mono font-black text-sm tracking-wider border border-french-gold/40 shadow-sm">
                    {o.coupon_code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base text-french-dark">{o.title}</h4>
                <p className="text-xs text-french-muted leading-relaxed">{o.description}</p>
              </div>

              <div className="text-xs font-bold text-french-dark pt-3 border-t border-french-gold/20 flex justify-between items-center">
                <span className="text-emerald-700 font-extrabold text-sm">
                  {o.discount_type === 'percentage' ? `${o.discount_value}% OFF` : `₹${o.discount_value} OFF`}
                </span>
                <span className="text-french-muted text-[11px]">Min Order: ₹{o.minimum_order}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PROMOTIONS */}
      {activeSubTab === 'promotions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className="p-5 rounded-3xl bg-white border border-french-gold/30 shadow-md space-y-3 relative flex flex-col justify-between hover:border-french-gold transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-french-dark text-french-gold font-bold text-[10px] uppercase tracking-wider">
                    {promo.badge}
                  </span>
                  <span className="font-serif font-black text-sm text-emerald-800">
                    {promo.discount}
                  </span>
                </div>
                <h4 className="font-serif font-black text-base text-french-dark">{promo.title}</h4>
                <p className="text-xs text-french-muted leading-relaxed">{promo.description}</p>
              </div>

              <div className="pt-3 border-t border-french-gold/15 flex items-center justify-between">
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Live on Customer Offers Tab</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-french-card border-2 border-french-gold/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-french-gold/20 pb-3">
              <h3 className="font-serif font-extrabold text-xl text-french-dark">
                Create Promo Coupon
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-french-muted hover:text-french-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-3 text-xs font-bold text-french-dark">
              <div>
                <label className="block mb-1 uppercase">Coupon Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BELL50"
                    className="flex-1 p-2.5 rounded-xl border border-french-gold/30 bg-french-cream font-mono font-bold uppercase text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="px-3 py-2 rounded-xl bg-french-dark text-french-gold font-bold text-[10px] uppercase"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flat ₹50 Off Weekend Special"
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 uppercase">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="20"
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase">Minimum Order (₹)</label>
                  <input
                    type="number"
                    value={minimumOrder}
                    onChange={(e) => setMinimumOrder(e.target.value)}
                    placeholder="199"
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="100"
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase">Description / Customer Terms</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Valid on all orders above minimum order value..."
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-french-gold/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-french-gold/30 hover:bg-french-brown/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-french-gold text-french-dark font-black uppercase tracking-wider"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
