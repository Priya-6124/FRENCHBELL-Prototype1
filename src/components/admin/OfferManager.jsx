import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Tag, Plus, Trash2, CheckCircle2, Sparkles, X, Gift, Check } from 'lucide-react';

export default function OfferManager() {
  const { offers, setOffers, addNotification } = useApp();
  const { token } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('20');
  const [minimumOrder, setMinimumOrder] = useState('199');

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
      active: 1
    };

    setOffers([newOffer, ...offers]);
    addNotification('Coupon Code Live', `Coupon ${newOffer.coupon_code} is active for customers!`, 'success');

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
    addNotification('Coupon Removed', 'Coupon code deactivated', 'info');

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
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <Gift className="w-4 h-4" />
            <span>Promotional Discounts & Coupons</span>
          </div>
          <h2 className="font-serif font-extrabold text-2xl text-french-gold">
            Offers & Discount Coupons
          </h2>
          <p className="text-xs text-french-cream/80 mt-1">
            Create promo codes with percentage or flat discounts, minimum order conditions, and broadcast to customer offers page.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow hover:scale-105 transition-all flex items-center justify-center gap-2 gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Grid of Offers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((o) => (
          <div key={o.id} className="p-5 rounded-3xl bg-french-card border-2 border-french-gold/30 shadow-md space-y-3 relative flex flex-col justify-between hover:border-french-gold/70 transition-all">
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

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-french-card border border-french-gold/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-french-gold/20 pb-3">
              <h3 className="font-serif font-extrabold text-xl text-french-dark">
                Create Promo Coupon
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-french-muted hover:text-french-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-3.5 text-xs font-bold text-french-dark">
              <div>
                <label className="block mb-1">Coupon Display Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. 20% Off Momos & Strips"
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 focus:outline-none focus:border-french-gold"
                />
              </div>

              <div>
                <label className="block mb-1">Coupon Code (Promo Code) *</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BELL20"
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono text-sm uppercase focus:outline-none focus:border-french-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Discount Type *</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    placeholder="20"
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  value={minimumOrder}
                  onChange={e => setMinimumOrder(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono"
                />
              </div>

              <div>
                <label className="block mb-1">Promo Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Short explanation visible to customers"
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-french-cream border border-french-gold/30 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-french-dark text-french-gold font-extrabold uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all shadow flex items-center justify-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Save & Publish</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
