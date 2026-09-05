import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X, Trash2, Plus, Minus, ArrowRight, ShoppingCart,
  SlidersHorizontal, Tag, Sparkles, AlertCircle, CheckCircle, Package, Utensils, Bike
} from 'lucide-react';

export default function CartDrawer() {
  const {
    cart, cartOpen, setCartOpen,
    removeFromCart, updateCartQty,
    cartSubtotal, discountAmount, taxAmount, deliveryCharge, grandTotal, totalItemCount,
    orderMode, appliedOffer, setAppliedOffer, setUserManuallySelectedCoupon, isAutoCoupon,
    offers, setActiveModal, setSelectedFood
  } = useApp();

  if (!cartOpen) return null;

  // Open item in FoodDetailsModal for customization edit
  const handleOpenCustomize = (item) => {
    setSelectedFood({
      ...item,
      isCartEdit: true
    });
    setActiveModal('foodDetails');
  };

  const handleApplyCoupon = (coupon) => {
    setUserManuallySelectedCoupon(true);
    setAppliedOffer(coupon);
  };

  const handleRemoveCoupon = () => {
    setUserManuallySelectedCoupon(true);
    setAppliedOffer(null);
  };

  const getOrderModeLabel = () => {
    if (orderMode === 'dine-in') return 'Dine-In Table';
    if (orderMode === 'takeaway') return 'Takeaway Counter';
    return 'Doorstep Delivery';
  };

  const getOrderModeIcon = () => {
    if (orderMode === 'dine-in') return <Utensils className="w-4 h-4 text-french-gold" />;
    if (orderMode === 'takeaway') return <Package className="w-4 h-4 text-french-gold" />;
    return <Bike className="w-4 h-4 text-french-gold" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-french-dark/75 backdrop-blur-sm transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-french-card border-l border-french-gold/30 shadow-2xl flex flex-col justify-between">

          {/* Header */}
          <div className="p-5 bg-french-dark text-french-cream border-b border-french-gold/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-french-gold/20 text-french-gold flex items-center justify-center font-bold border border-french-gold/30">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-extrabold text-xl text-french-cream">
                  Your Order Cart
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-french-gold font-semibold">
                  {getOrderModeIcon()}
                  <span>{getOrderModeLabel()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCartOpen(false)}
              className="p-2 rounded-full text-french-cream/70 hover:text-french-gold hover:bg-french-brown transition-colors"
              aria-label="Close cart"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List or Empty State */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {cart.length > 0 ? (
              <>
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-3.5 rounded-2xl bg-french-cream/70 border border-french-gold/20 flex flex-col gap-2.5 shadow-sm hover:border-french-gold/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-french-gold/20 bg-french-brown/20">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-sm text-french-dark truncate">
                            {item.name}
                          </h4>

                          {item.variant && (
                            <span className="text-[10px] font-bold text-french-warm uppercase tracking-wider block">
                              {item.variant} Variant
                            </span>
                          )}

                          {item.specialInstructions && (
                            <p className="text-[11px] text-french-muted italic truncate mt-0.5">
                              "{item.specialInstructions}"
                            </p>
                          )}

                          <span className="font-serif font-extrabold text-sm text-french-dark block mt-0.5">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>

                        {/* Quantity Controls & Remove */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center rounded-xl bg-french-dark text-french-gold p-0.5 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.cartItemId, -1)}
                              className="p-1 hover:bg-french-brown rounded-lg"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 font-extrabold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.cartItemId, 1)}
                              className="p-1 hover:bg-french-brown rounded-lg"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Remove Item"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Requirement 24: Cart Item Customize Button */}
                      <div className="pt-2 border-t border-french-gold/15 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleOpenCustomize(item)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-french-dark hover:text-french-warm transition-colors"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-french-gold" />
                          <span>Customize Item</span>
                        </button>

                        <span className="text-[11px] text-french-muted">
                          ₹{item.price} each
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Requirement 25: Offers & Coupons inside Cart */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-french-gold" />
                    <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-french-dark">
                      Offers & Coupons
                    </h3>
                  </div>

                  {/* Auto-applied banner if active */}
                  {appliedOffer && isAutoCoupon && (
                    <div className="p-3 rounded-2xl bg-emerald-900/10 border border-emerald-600/30 text-emerald-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Best offer <strong>{appliedOffer.coupon_code}</strong> applied automatically!</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[11px] font-bold text-emerald-900 hover:underline shrink-0 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Coupons list */}
                  <div className="space-y-2">
                    {(offers || []).filter(o => o.active !== 0 && o.coupon_code).map(coupon => {
                      const isApplied = appliedOffer?.coupon_code === coupon.coupon_code;
                      const isEligible = cartSubtotal >= (coupon.minimum_order || 0);
                      const minShort = (coupon.minimum_order || 0) - cartSubtotal;

                      return (
                        <div
                          key={coupon.id}
                          className={`p-3 rounded-2xl border transition-all text-xs flex items-center justify-between gap-2 ${
                            isApplied
                              ? 'bg-french-gold/15 border-french-gold shadow-sm'
                              : 'bg-french-cream/60 border-french-gold/20'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-french-dark tracking-wider">
                                {coupon.coupon_code}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-french-dark text-french-gold text-[10px] font-bold">
                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                              </span>
                            </div>

                            <p className="text-[11px] text-french-muted mt-0.5">
                              {isEligible
                                ? `Valid on orders above ₹${coupon.minimum_order || 0}`
                                : `Add ₹${minShort} more to apply this coupon`}
                            </p>
                          </div>

                          <div>
                            {isApplied ? (
                              <button
                                type="button"
                                onClick={handleRemoveCoupon}
                                className="px-3 py-1.5 rounded-xl border border-french-gold text-french-dark font-bold text-xs hover:bg-french-gold/20 transition-all"
                              >
                                Applied
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!isEligible}
                                onClick={() => handleApplyCoupon(coupon)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                                  isEligible
                                    ? 'bg-french-dark text-french-gold hover:bg-french-gold hover:text-french-dark shadow-sm'
                                    : 'bg-french-muted/20 text-french-muted cursor-not-allowed'
                                }`}
                              >
                                Apply
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Empty Cart State */
              <div className="py-24 text-center space-y-4 my-auto">
                <div className="w-16 h-16 mx-auto rounded-full bg-french-gold/15 text-french-gold flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-french-gold" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-french-dark">
                  Your cart is empty
                </h3>
                <p className="text-french-muted text-xs sm:text-sm max-w-xs mx-auto">
                  Explore our handcrafted burgers, loaded fries, crispy momos, and rolls!
                </p>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    const el = document.getElementById('menu');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-full bg-french-dark text-french-gold font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all gold-glow"
                >
                  Browse Full Menu
                </button>
              </div>
            )}
          </div>

          {/* Cart Footer & Price Breakdown */}
          {cart.length > 0 && (
            <div className="p-5 bg-french-dark text-french-cream border-t border-french-gold/20 space-y-3.5">

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-french-cream/80 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-serif font-bold text-french-cream">₹{cartSubtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Coupon Discount ({appliedOffer?.coupon_code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Taxes (5% GST)</span>
                  <span>₹{taxAmount}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{orderMode === 'delivery' ? (deliveryCharge > 0 ? `₹${deliveryCharge}` : 'FREE (Under 2km)') : '₹0 (Counter)'}</span>
                </div>

                <div className="pt-2 border-t border-french-gold/20 flex justify-between text-sm font-extrabold text-french-cream">
                  <span>Final Total</span>
                  <span className="font-serif text-xl text-french-gold">₹{grandTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  setActiveModal('checkout');
                }}
                className="w-full py-4 rounded-full bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-black text-sm uppercase tracking-wider shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 gold-glow"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
