import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Tag, Check, Clock, Sparkles, Percent, ShoppingBag } from 'lucide-react';
import CurvedUnderline from './CurvedUnderline';

export default function CouponsSection({ onExploreClick }) {
  const { offers, setAppliedOffer, addNotification, setCartOpen } = useApp();
  const [copiedCode, setCopiedCode] = useState(null);

  // Available coupons from admin offers system
  const coupons = (offers || []).filter(o => o.active !== 0 && o.coupon_code);

  const defaultCoupons = [
    {
      id: 1,
      coupon_code: 'WELCOME50',
      title: 'Welcome Feast',
      discount_type: 'percentage',
      discount_value: 50,
      minimum_order: 299,
      max_discount: 100,
      expiry_date: '30 Sep 2026',
      applicable_order_type: 'all',
      description: '50% off up to ₹100 on your first delicious order.'
    },
    {
      id: 2,
      coupon_code: 'DING10',
      title: 'Cafe Cravings',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_order: 199,
      max_discount: 60,
      expiry_date: '15 Oct 2026',
      applicable_order_type: 'all',
      description: 'Flat 10% discount on all orders above ₹199.'
    },
    {
      id: 3,
      coupon_code: 'BELL50',
      title: 'Weekend Treat',
      discount_type: 'fixed',
      discount_value: 50,
      minimum_order: 250,
      expiry_date: '31 Oct 2026',
      applicable_order_type: 'delivery',
      description: 'Flat ₹50 off on orders delivered to your doorstep.'
    }
  ];

  const activeCoupons = coupons.length > 0 ? coupons : defaultCoupons;

  const handleApply = (coupon) => {
    setAppliedOffer(coupon);
    setCopiedCode(coupon.coupon_code);
    addNotification('Coupon Applied', `Coupon code "${coupon.coupon_code}" activated!`, 'success');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section id="coupons" className="py-14 sm:py-16 bg-french-cream border-t border-french-gold/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading with Hand-drawn Underline */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-french-gold/15 text-french-dark text-xs font-bold uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5 text-french-gold" />
            <span>Smart Savings</span>
          </div>

          <div>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-french-dark tracking-tight">
              Exclusive Cafe <span className="text-french-warm">Coupons</span>
            </h2>
            <div className="w-40 sm:w-52 mx-auto mt-1">
              <CurvedUnderline className="text-french-caramel h-4 sm:h-5" />
            </div>
          </div>

          <p className="text-french-muted text-xs sm:text-sm">
            Apply active coupons before checkout to maximize your delicious savings.
          </p>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeCoupons.map((c) => {
            const isCopied = copiedCode === c.coupon_code;
            const discountLabel = c.discount_type === 'percentage'
              ? `${c.discount_value}% OFF`
              : `₹${c.discount_value} OFF`;

            return (
              <div
                key={c.id}
                className="relative bg-french-card border-2 border-dashed border-french-gold/40 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-french-gold transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Top Discount & Applicable Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-serif font-black text-2xl sm:text-3xl text-french-dark block leading-none">
                      {discountLabel}
                    </span>
                    <span className="text-[11px] font-bold text-french-gold uppercase tracking-wider block mt-1">
                      Min. order ₹{c.minimum_order || 199}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-french-dark text-french-gold border border-french-gold/30">
                    {c.applicable_order_type || 'All Orders'}
                  </span>
                </div>

                {/* Description & Expiry */}
                <div className="space-y-2 mb-5">
                  <p className="text-xs text-french-dark font-medium leading-relaxed">
                    {c.description || c.title}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-french-muted font-medium">
                    <Clock className="w-3 h-3 text-french-gold" />
                    <span>Valid until {c.expiry_date || c.end_date || '31 Oct 2026'}</span>
                  </div>
                </div>

                {/* Coupon Code & Action Bar */}
                <div className="pt-4 border-t border-french-gold/20 flex items-center justify-between gap-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-french-cream border border-french-gold/40 font-mono font-extrabold text-xs sm:text-sm text-french-dark tracking-wider">
                    {c.coupon_code}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApply(c)}
                    className="px-4 py-2 rounded-xl bg-french-dark text-french-gold font-bold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all duration-200 flex items-center gap-1.5 shadow-sm"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <Tag className="w-3.5 h-3.5" />
                        <span>Apply</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
