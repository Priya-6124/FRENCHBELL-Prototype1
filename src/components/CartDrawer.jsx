import React from 'react';
import { useApp } from '../context/AppContext';
import BrandedFoodImage from './BrandedFoodImage';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Utensils, Bike } from 'lucide-react';

export default function CartDrawer() {
  const {
    cart, cartOpen, setCartOpen,
    removeFromCart, updateCartQty,
    cartSubtotal, discountAmount, deliveryCharge, grandTotal, totalItemCount,
    orderMode, appliedOffer, setAppliedOffer,
    setActiveModal
  } = useApp();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-french-dark/70 backdrop-blur-sm transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-french-card border-l border-french-gold/30 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 bg-french-dark text-french-cream border-b border-french-gold/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-french-gold/20 text-french-gold flex items-center justify-center font-bold">
                🛒
              </div>
              <div>
                <h2 className="font-serif font-extrabold text-xl text-french-cream">
                  Your Craving Cart
                </h2>
                <span className="text-xs text-french-gold font-semibold">
                  Mode: {orderMode === 'dine-in' ? '🍽️ Dine-In Table' : (orderMode === 'takeaway' ? '🛍️ Takeaway Pickup' : '🛵 Home Delivery')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCartOpen(false)}
              className="p-2 rounded-full text-french-cream/70 hover:text-french-gold hover:bg-french-brown transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List or Empty State */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3.5 rounded-2xl bg-french-cream/70 border border-french-gold/20 flex items-center justify-between gap-3 shadow-sm hover:border-french-gold/40 transition-all"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-french-gold/20">
                    <BrandedFoodImage
                      src={item.image_url}
                      name={item.name}
                      category={item.category_slug}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-sm text-french-dark truncate">
                      {item.name}
                    </h4>
                    {item.variant && (
                      <span className="text-[11px] font-bold text-french-gold uppercase tracking-wider block">
                        {item.variant} Variant
                      </span>
                    )}
                    <span className="font-serif font-extrabold text-sm text-french-dark block mt-0.5">
                      ₹{item.price}
                    </span>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-xl bg-french-dark text-french-gold p-0.5 text-xs font-bold">
                      <button
                        onClick={() => updateCartQty(item.cartItemId, -1)}
                        className="p-1 hover:bg-french-brown rounded-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-extrabold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.cartItemId, 1)}
                        className="p-1 hover:bg-french-brown rounded-lg"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))
            ) : (
              /* Prompt Requirement #54 Empty Cart State */
              <div className="py-20 text-center space-y-4 my-auto">
                <div className="w-20 h-20 mx-auto rounded-full bg-french-gold/15 text-french-gold flex items-center justify-center text-4xl">
                  🔔
                </div>
                <h3 className="font-serif font-bold text-2xl text-french-dark">
                  Your cart is feeling lonely.
                </h3>
                <p className="text-french-muted text-sm">
                  Let's fix that with some loaded fries, momos & burgers!
                </p>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    const el = document.getElementById('menu');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-full bg-french-dark text-french-gold font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all gold-glow"
                >
                  Browse Menu ➔
                </button>
              </div>
            )}
          </div>

          {/* Cart Footer Calculation Bar */}
          {cart.length > 0 && (
            <div className="p-5 bg-french-dark text-french-cream border-t border-french-gold/20 space-y-3">
              
              {/* Active Coupon Banner if applied */}
              {appliedOffer && (
                <div className="p-2.5 rounded-xl bg-french-gold/20 border border-french-gold/40 flex items-center justify-between text-xs text-french-gold">
                  <span>Coupon <strong>{appliedOffer.coupon_code}</strong> applied!</span>
                  <button onClick={() => setAppliedOffer(null)} className="underline hover:text-white">Remove</button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-french-cream/80 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-serif font-bold text-french-cream">₹{cartSubtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-serif font-bold">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-serif font-bold text-emerald-400">
                    {orderMode === 'delivery' ? 'FREE (under 2km) 🎉' : '₹0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-french-cream pt-2 border-t border-french-gold/20">
                  <span>Total Payable</span>
                  <span className="font-serif font-extrabold text-lg text-french-gold">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <button
                onClick={() => {
                  setCartOpen(false);
                  setActiveModal('checkout');
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold text-sm uppercase tracking-wider shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 gold-glow"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
