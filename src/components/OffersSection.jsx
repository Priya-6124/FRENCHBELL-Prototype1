import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Tag, Sparkles, Copy, Check, Percent, Gift } from 'lucide-react';

export default function OffersSection() {
  const { setAppliedOffer, addNotification, setCartOpen } = useApp();
  const [offers, setOffers] = useState([
    { id: 1, title: 'Ding! 10% Off Cravings', description: 'Get 10% off on all orders above ₹199', coupon_code: 'DING10', discount_type: 'percentage', discount_value: 10, minimum_order: 199 },
    { id: 2, title: 'Flat ₹50 Off Special', description: 'Enjoy flat ₹50 off on orders above ₹299', coupon_code: 'BELLFB', discount_type: 'fixed', discount_value: 50, minimum_order: 299 },
    { id: 3, title: 'Welcome Feast', description: 'Flat ₹30 off for new bell lovers on minimum ₹150', coupon_code: 'WELCOME30', discount_type: 'fixed', discount_value: 30, minimum_order: 150 }
  ]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetch('/api/offers')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setOffers(data); })
      .catch(() => {});
  }, []);

  const handleApplyOffer = (offer) => {
    setAppliedOffer(offer);
    setCopiedCode(offer.coupon_code);
    addNotification('Coupon Applied! 🎉', `Coupon code "${offer.coupon_code}" activated!`, 'success');
    setCartOpen(true);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section id="offers" className="py-16 bg-gradient-to-b from-french-brown to-french-dark text-french-cream relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-french-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-french-gold/20 text-french-gold text-xs font-extrabold uppercase tracking-widest border border-french-gold/30">
            <Gift className="w-4 h-4" />
            <span>Special Promotional Deals</span>
          </div>

          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-french-cream tracking-tight">
            Deals Worth the Craving 🏷️
          </h2>

          <p className="text-french-cream/80 text-sm sm:text-base">
            Apply exclusive coupon codes at checkout for maximum savings on your order.
          </p>
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="relative p-6 rounded-3xl bg-gradient-to-br from-french-dark/90 via-french-brown/80 to-[#2A170F] border border-french-gold/30 shadow-2xl backdrop-blur-md flex flex-col justify-between group hover:border-french-gold transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="space-y-4">
                
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-french-gold/20 text-french-gold text-[11px] font-extrabold uppercase tracking-wider border border-french-gold/30">
                    {offer.discount_type === 'percentage' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                  </span>
                  <Tag className="w-5 h-5 text-french-gold" />
                </div>

                {/* Offer Title & Description */}
                <div>
                  <h3 className="font-serif font-bold text-xl text-french-cream group-hover:text-french-gold transition-colors">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-french-cream/70 mt-1.5 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                {/* Min Order Notice */}
                <div className="text-[11px] text-french-gold/90 font-medium">
                  • Minimum Order: ₹{offer.minimum_order}
                </div>

              </div>

              {/* Coupon Code & Apply Button */}
              <div className="mt-6 pt-4 border-t border-french-gold/20 flex items-center justify-between gap-3">
                <div className="px-3.5 py-2 rounded-xl bg-french-dark border border-dashed border-french-gold/50 font-mono font-bold text-sm text-french-gold tracking-widest">
                  {offer.coupon_code}
                </div>

                <button
                  onClick={() => handleApplyOffer(offer)}
                  className="px-4 py-2 rounded-xl bg-french-gold text-french-dark hover:bg-french-gold-hover font-extrabold text-xs uppercase tracking-wider shadow transition-all flex items-center gap-1.5"
                >
                  {copiedCode === offer.coupon_code ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Apply Offer</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
