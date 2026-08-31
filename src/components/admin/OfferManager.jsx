import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tag, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function OfferManager() {
  const { addNotification } = useApp();
  const [offers, setOffers] = useState([
    { id: 1, title: 'Ding! 10% Off Cravings', description: 'Get 10% off on all orders above ₹199', coupon_code: 'DING10', discount_type: 'percentage', discount_value: 10, minimum_order: 199, active: 1 },
    { id: 2, title: 'Flat ₹50 Off Special', description: 'Enjoy flat ₹50 off on orders above ₹299', coupon_code: 'BELLFB', discount_type: 'fixed', discount_value: 50, minimum_order: 299, active: 1 },
    { id: 3, title: 'Welcome Feast', description: 'Flat ₹30 off for new bell lovers on minimum ₹150', coupon_code: 'WELCOME30', discount_type: 'fixed', discount_value: 30, minimum_order: 150, active: 1 }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('199');

  const handleCreateOffer = (e) => {
    e.preventDefault();
    const newOffer = {
      id: Date.now(),
      title,
      description,
      coupon_code: couponCode.toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      minimum_order: Number(minimumOrder),
      active: 1
    };

    setOffers([newOffer, ...offers]);
    addNotification('Offer Created 🏷️', `Coupon ${newOffer.coupon_code} is now live!`, 'success');
    setShowModal(false);
  };

  const handleDeleteOffer = (id) => {
    setOffers(offers.filter(o => o.id !== id));
    addNotification('Offer Deleted', 'Offer removed.', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-french-dark text-french-cream border border-french-gold/30 flex items-center justify-between">
        <div>
          <h3 className="font-serif font-extrabold text-2xl text-french-gold">
            Offer & Coupon Manager
          </h3>
          <p className="text-xs text-french-cream/80">
            Create promotional discount codes and manage minimum order requirements.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-french-gold text-french-dark font-extrabold text-xs uppercase tracking-wider shadow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Offer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((o) => (
          <div key={o.id} className="p-5 rounded-3xl bg-french-card border border-french-gold/30 shadow-md space-y-3 relative">
            <button onClick={() => handleDeleteOffer(o.id)} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>

            <span className="px-2.5 py-0.5 rounded-md bg-french-gold text-french-dark font-mono font-bold text-xs uppercase">
              {o.coupon_code}
            </span>

            <h4 className="font-serif font-bold text-lg text-french-dark">{o.title}</h4>
            <p className="text-xs text-french-muted">{o.description}</p>
            
            <div className="text-xs font-bold text-french-dark pt-2 border-t border-french-gold/15 flex justify-between">
              <span>Discount: {o.discount_type === 'percentage' ? `${o.discount_value}%` : `₹${o.discount_value}`}</span>
              <span>Min: ₹{o.minimum_order}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-french-card border border-french-gold/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-extrabold text-xl text-french-dark">Create New Coupon Offer</h3>

            <form onSubmit={handleCreateOffer} className="space-y-3 text-xs font-bold text-french-dark">
              <div>
                <label className="block mb-1">Offer Title *</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekend Feast 15% OFF" className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
              </div>
              <div>
                <label className="block mb-1">Coupon Code *</label>
                <input type="text" required value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="e.g. DING15" className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Discount Type *</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Discount Value *</label>
                  <input type="number" required value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="15 or 50" className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
                </div>
              </div>
              <div>
                <label className="block mb-1">Minimum Order (₹)</label>
                <input type="number" value={minimumOrder} onChange={e => setMinimumOrder(e.target.value)} className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short promo details" className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-french-cream">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-french-dark text-french-gold font-extrabold uppercase">Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
