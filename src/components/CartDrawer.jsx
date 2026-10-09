import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  ChevronRight, Trash2, Plus, Minus, ArrowRight, ShoppingCart,
  SlidersHorizontal, Tag, Sparkles, AlertCircle, CheckCircle, Package, Utensils, Bike,
  MoveRight
} from 'lucide-react';

export default function CartDrawer() {
  const {
    currentView,
    cart, cartOpen, setCartOpen,
    removeFromCart, updateCartQty,
    cartSubtotal, discountAmount, taxAmount, deliveryCharge, grandTotal, totalItemCount,
    orderMode, appliedOffer, setAppliedOffer, setUserManuallySelectedCoupon, isAutoCoupon,
    applyCouponByCode,
    offers, setActiveModal, setSelectedFood
  } = useApp();
  const { isAdmin, user } = useAuth();

  // Manual coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Drag / Swipe-to-close state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  // If Admin is logged in or active in Admin operations view, Cart is not needed
  if (!cartOpen || currentView === 'admin' || isAdmin || user?.role === 'admin') {
    return null;
  }

  // Touch Swipe handlers
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = currentXRef.current - startXRef.current;
    if (diff > 80) {
      // Swiped far enough to close
      setCartOpen(false);
      setDragOffset(0);
    } else {
      // Snap back smoothly
      setDragOffset(0);
    }
  };

  // Mouse Drag handlers
  const handleMouseDown = (e) => {
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    setIsDragging(true);

    const onMouseMove = (moveEvent) => {
      currentXRef.current = moveEvent.clientX;
      const diff = currentXRef.current - startXRef.current;
      if (diff > 0) {
        setDragOffset(diff);
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      const diff = currentXRef.current - startXRef.current;
      if (diff > 80) {
        setCartOpen(false);
      }
      setDragOffset(0);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

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
    setCouponFeedback({ type: 'success', message: `Coupon "${coupon.coupon_code}" applied successfully!` });
  };

  const handleRemoveCoupon = () => {
    setUserManuallySelectedCoupon(true);
    setAppliedOffer(null);
    setCouponFeedback(null);
  };

  const handleManualCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = applyCouponByCode(couponCodeInput.trim());
    if (res.success) {
      setCouponFeedback({ type: 'success', message: res.message });
      setCouponCodeInput('');
    } else {
      setCouponFeedback({ type: 'error', message: res.message });
    }
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

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          style={{
            transform: `translateX(${dragOffset}px)`,
            transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="w-screen max-w-md bg-french-card border-l border-french-gold/30 shadow-2xl flex flex-col justify-between"
        >

          {/* Swipe-to-Close Touch & Pull Indicator Bar */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            className="w-full py-2 bg-french-dark border-b border-french-gold/15 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none hover:bg-french-brown/30 transition-colors"
            title="Swipe right or drag to close cart"
          >
            <div className="w-14 h-1.5 rounded-full bg-french-gold/60" />
            <div className="flex items-center gap-1 text-[10px] font-bold text-french-gold/80 mt-1 uppercase tracking-widest">
              <span>Swipe right to close</span>
              <MoveRight className="w-3 h-3 text-french-gold" />
            </div>
          </div>

          {/* Header (No close 'X' symbol - uses swipe pill) */}
          <div className="p-4 sm:p-5 bg-french-dark text-french-cream border-b border-french-gold/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-french-gold/20 text-french-gold flex items-center justify-center font-bold border border-french-gold/30">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-french-cream leading-tight">
                  Your Order Cart
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-french-gold font-semibold">
                  {getOrderModeIcon()}
                  <span>{getOrderModeLabel()}</span>
                </div>
              </div>
            </div>

            {/* Interactive Swipe / Slide Action Pill */}
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-french-brown/90 border border-french-gold/40 hover:border-french-gold hover:bg-french-gold hover:text-french-dark text-french-gold text-xs font-bold transition-all shadow-sm"
              title="Click or swipe to close cart"
            >
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-french-cream group-hover:text-french-dark">
                Close
              </span>
              <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Cart Items List or Empty State */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
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

                      {/* Item Customize Button */}
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

                {/* Coupons & Promo Codes Section */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-french-gold" />
                      <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-french-dark">
                        Offers & Promo Codes
                      </h3>
                    </div>
                    {appliedOffer && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        1 Applied
                      </span>
                    )}
                  </div>

                  {/* Manual Coupon Input Field */}
                  <form onSubmit={handleManualCouponSubmit} className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponCodeInput}
                          onChange={(e) => {
                            setCouponCodeInput(e.target.value.toUpperCase());
                            setCouponFeedback(null);
                          }}
                          placeholder="Have a promo code? (e.g. BELL50)"
                          className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-french-gold/30 bg-french-cream focus:outline-none focus:border-french-gold tracking-wider placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-french-muted shadow-inner"
                        />
                        {couponCodeInput && (
                          <button
                            type="button"
                            onClick={() => setCouponCodeInput('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-french-muted hover:text-french-dark"
                          >
                            CLEAR
                          </button>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={!couponCodeInput.trim()}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm ${
                          couponCodeInput.trim()
                            ? 'bg-french-dark text-french-gold hover:bg-french-gold hover:text-french-dark border border-french-gold'
                            : 'bg-french-muted/20 text-french-muted cursor-not-allowed'
                        }`}
                      >
                        Apply
                      </button>
                    </div>

                    {/* Feedback Alert */}
                    {couponFeedback && (
                      <p className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                        couponFeedback.type === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {couponFeedback.message}
                      </p>
                    )}
                  </form>

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
                                className="px-3 py-1.5 rounded-xl border border-french-gold bg-french-gold/20 text-french-dark font-extrabold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                              >
                                Remove
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
                <p className="text-xs text-french-muted max-w-xs mx-auto">
                  Add fresh gourmet burgers, crispy fries, sizzling momos or platters to get started.
                </p>
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-french-dark text-french-cream border-t border-french-gold/20 space-y-3">
              <div className="space-y-1.5 text-xs text-french-cream/80">
                <div className="flex justify-between">
                  <span>Item Subtotal ({totalItemCount} items)</span>
                  <span className="font-bold text-french-cream">₹{cartSubtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Coupon Discount ({appliedOffer?.coupon_code})
                    </span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>GST Taxes (5%)</span>
                  <span>₹{taxAmount}</span>
                </div>

                {orderMode === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Doorstep Delivery</span>
                    <span>{deliveryCharge > 0 ? `₹${deliveryCharge}` : <span className="text-emerald-400 font-bold">FREE</span>}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-french-gold/20 flex justify-between text-base font-serif font-extrabold text-french-gold">
                  <span>Grand Total</span>
                  <span className="text-xl">₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  setActiveModal('checkout');
                }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 gold-glow"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
