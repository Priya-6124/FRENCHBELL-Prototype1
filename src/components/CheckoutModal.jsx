import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { playPaymentSuccessSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  X, CheckCircle2, CreditCard, Smartphone, DollarSign, ArrowLeft,
  ShieldCheck, Sparkles, QrCode, Building, Lock, Loader2, ArrowRight
} from 'lucide-react';

export default function CheckoutModal({ onClose, onOrderPlaced }) {
  const {
    cart, cartSubtotal, discountAmount, taxAmount, deliveryCharge, grandTotal,
    orderMode, dineInDetails, takeawayDetails, deliveryDetails,
    clearCart, addNotification
  } = useApp();
  const { user, sendOtp, verifyOtp } = useAuth();

  // If user is not logged in, prompt Mobile OTP inside checkout!
  const [authStep, setAuthStep] = useState(user ? 'ready' : 'phone'); // 'ready' | 'phone' | 'otp'
  const [otpPhone, setOtpPhone] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'cash'
  const [upiApp, setUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'qr'
  const [cardDetails, setCardDetails] = useState({ number: '4532 •••• •••• 8821', expiry: '12/28', cvv: '•••', name: user?.name || 'French Bell Customer' });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Handle OTP submission for Guest Customer before ordering
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    const cleanPhone = otpPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setAuthError('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsSendingOtp(true);
    try {
      const code = await sendOtp(cleanPhone);
      setSimulatedOtp(code);
      setAuthStep('otp');
      setIsSendingOtp(false);
    } catch (err) {
      setIsSendingOtp(false);
      setAuthError(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    if (!otpCode || otpCode.length !== 4) {
      setAuthError('Please enter the 4-digit OTP code');
      return;
    }
    setIsSendingOtp(true);
    try {
      await verifyOtp(otpPhone, otpCode, otpName);
      setIsSendingOtp(false);
      setAuthStep('ready');
      addNotification('Mobile Verified 📱', 'You are logged in and ready to place your order!', 'success');
    } catch (err) {
      setIsSendingOtp(false);
      setAuthError(err.message || 'Invalid OTP code');
    }
  };

  // Process Dummy Payment and Place Order
  const handleExecutePayment = async () => {
    setIsProcessingPayment(true);

    const customerName = user?.name || otpName || 'Valued Foodie';
    const customerPhone = user?.phone || otpPhone || '9876543210';

    const payload = {
      user_id: user?.id || null,
      order_type: orderMode,
      table_number: orderMode === 'dine-in' ? (dineInDetails.tableNumber || '04') : null,
      num_people: orderMode === 'dine-in' ? (dineInDetails.numPeople || 2) : null,
      customer_name: customerName,
      phone: customerPhone,
      pickup_time: orderMode === 'takeaway' ? (takeawayDetails.pickupTime || '20 mins') : null,
      delivery_address: orderMode === 'delivery' ? (deliveryDetails.address || 'K. Narayanpura') : null,
      landmark: orderMode === 'delivery' ? deliveryDetails.landmark : null,
      pincode: orderMode === 'delivery' ? deliveryDetails.pincode : null,
      subtotal: cartSubtotal,
      discount: discountAmount,
      delivery_charge: deliveryCharge,
      total: grandTotal,
      payment_method: paymentMethod === 'cash' ? 'cash' : `dummy_${paymentMethod}_${upiApp}`,
      special_instructions: orderMode === 'dine-in' ? dineInDetails.instructions : (orderMode === 'takeaway' ? takeawayDetails.instructions : deliveryDetails.instructions),
      items: cart.map(i => ({
        menu_item_id: i.id,
        item_name: i.name,
        variant: i.variant,
        quantity: i.quantity,
        unit_price: i.price,
        total_price: i.price * i.quantity
      }))
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      setTimeout(() => {
        setIsProcessingPayment(false);
        setPaymentSuccess(true);
        playPaymentSuccessSound(); // Play payment success sound!

        // Confetti explosion
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D4AF37,', '#FFF8DC', '#8B5A2B', '#10B981']
          });
        } catch (e) {}

        setTimeout(() => {
          clearCart();
          if (onClose) onClose();
          if (onOrderPlaced) {
            onOrderPlaced(data.order || { ...payload, order_number: data.order_number || 'FB001', id: Date.now() });
          }
        }, 1200);
      }, 1500);

    } catch (err) {
      // Fallback offline order generation
      setTimeout(() => {
        setIsProcessingPayment(false);
        setPaymentSuccess(true);
        playPaymentSuccessSound();

        const fallbackNum = 'FB' + String(Math.floor(1 + Math.random() * 50)).padStart(3, '0');
        const mockOrder = { ...payload, id: Date.now(), order_number: fallbackNum, created_at: new Date().toISOString() };

        setTimeout(() => {
          clearCart();
          if (onClose) onClose();
          if (onOrderPlaced) onOrderPlaced(mockOrder);
        }, 1200);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-french-card border border-french-gold/35 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-french-dark via-[#28150B] to-french-dark text-french-cream border-b border-french-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-french-gold/20 text-french-gold flex items-center justify-center font-bold text-lg">
              💳
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-xl text-french-cream">
                Secure Checkout
              </h3>
              <p className="text-xs text-french-gold font-medium">
                {orderMode === 'dine-in' ? `🍽️ Dine-In Table #${dineInDetails.tableNumber || '04'}` : (orderMode === 'takeaway' ? '🛍️ Takeaway Counter Pickup' : '🛵 Doorstep Delivery')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-french-cream/80 hover:text-french-gold hover:bg-french-brown transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-french-dark">
          
          {/* REQUIREMENT: If customer is not logged in, enforce Mobile OTP Verification first! */}
          {authStep !== 'ready' && !user ? (
            <div className="p-6 rounded-3xl bg-french-cream border border-french-gold/30 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full mx-auto bg-french-gold/20 text-french-gold flex items-center justify-center text-2xl border border-french-gold/40 shadow">
                📱
              </div>
              <h4 className="font-serif font-bold text-xl text-french-dark">
                Customer Mobile Verification
              </h4>
              <p className="text-xs text-french-muted max-w-sm mx-auto">
                Please verify your 10-digit mobile number with OTP to confirm your order and receive live status updates.
              </p>

              {authError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-semibold">
                  {authError}
                </div>
              )}

              {authStep === 'phone' ? (
                <form onSubmit={handleRequestOtp} className="space-y-3 max-w-sm mx-auto">
                  <input
                    type="text"
                    value={otpName}
                    onChange={(e) => setOtpName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-card text-sm focus:outline-none focus:border-french-gold"
                  />
                  <div className="flex items-center rounded-xl border border-french-gold/30 bg-french-card overflow-hidden">
                    <span className="px-3 py-2.5 text-xs font-bold text-french-dark bg-french-gold/15">🇮🇳 +91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2.5 text-sm font-mono font-bold focus:outline-none bg-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingOtp || otpPhone.length < 10}
                    className="w-full py-3 rounded-xl bg-french-dark text-french-gold font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{isSendingOtp ? 'Sending OTP...' : 'Send OTP & Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3 max-w-sm mx-auto">
                  {simulatedOtp && (
                    <div
                      onClick={() => setOtpCode(simulatedOtp)}
                      className="p-2 rounded-xl bg-french-dark text-french-gold text-xs font-mono cursor-pointer border border-french-gold/40 hover:border-french-gold"
                    >
                      📲 Simulated SMS OTP: <strong>{simulatedOtp}</strong> (Tap to fill)
                    </div>
                  )}
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 4-digit OTP"
                    className="w-full px-4 py-3 rounded-xl border-2 border-french-gold text-center text-xl font-mono font-black tracking-widest focus:outline-none"
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSendingOtp || otpCode.length !== 4}
                    className="w-full py-3 rounded-xl bg-french-gold text-french-dark font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Unlock Checkout</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthStep('phone')}
                    className="text-xs text-french-muted hover:underline block mx-auto"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Order Breakdown Summary */}
              <div className="p-4 rounded-2xl bg-french-cream/60 border border-french-gold/25 space-y-3">
                <div className="flex items-center justify-between border-b border-french-gold/20 pb-2">
                  <span className="font-serif font-bold text-sm text-french-dark">Order Items ({cart.length})</span>
                  <span className="text-xs font-bold text-french-gold uppercase">{orderMode}</span>
                </div>
                
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-french-dark/90">
                      <span className="truncate pr-2">
                        {item.quantity}x {item.name} {item.size ? `(${item.size})` : ''} {item.variant ? `• ${item.variant}` : ''}
                      </span>
                      <span className="font-mono font-bold shrink-0">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-french-gold/20 space-y-1 text-xs text-french-muted">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-french-dark">₹{cartSubtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Offer Discount</span>
                      <span className="font-mono">-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="font-mono font-bold text-french-dark">₹{taxAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-french-dark pt-1 border-t border-french-gold/20">
                    <span>Grand Total</span>
                    <span className="font-serif text-lg text-french-gold">₹{grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* DUMMY PAYMENT METHOD SELECTOR */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-french-gold" />
                  <span>Choose Payment Method (Dummy Simulation)</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'upi', name: 'UPI Pay', icon: Smartphone, desc: 'GPay / PhonePe / QR' },
                    { id: 'card', name: 'Card', icon: CreditCard, desc: 'Credit / Debit' },
                    { id: 'netbanking', name: 'NetBanking', icon: Building, desc: 'All Banks' },
                    { id: 'cash', name: 'Pay at Cafe', icon: DollarSign, desc: 'Counter / Cash' }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-french-dark text-french-gold border-french-gold shadow-md'
                            : 'bg-french-cream/70 text-french-dark border-french-gold/25 hover:border-french-gold'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-bold text-xs">{m.name}</span>
                        <span className="text-[9px] text-french-muted">{m.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UPI Sub-options (if UPI selected) */}
              {paymentMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-french-cream border border-french-gold/30 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-french-dark block">
                    Select UPI Provider
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'gpay', label: 'Google Pay', icon: '🟢' },
                      { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
                      { id: 'paytm', label: 'Paytm UPI', icon: '🔵' },
                      { id: 'qr', label: 'Scan Cafe QR', icon: '📱' }
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setUpiApp(app.id)}
                        className={`py-2 px-2 rounded-xl text-center border text-xs font-bold transition-all ${
                          upiApp === app.id
                            ? 'bg-french-gold text-french-dark border-french-dark shadow'
                            : 'bg-french-card border-french-gold/20 text-french-dark hover:border-french-gold'
                        }`}
                      >
                        <div>{app.icon}</div>
                        <div className="text-[10px] mt-0.5">{app.label}</div>
                      </button>
                    ))}
                  </div>

                  {upiApp === 'qr' && (
                    <div className="p-3 rounded-xl bg-french-card border border-french-gold/30 text-center space-y-2">
                      <div className="w-24 h-24 mx-auto bg-white p-2 rounded-lg border border-french-gold/40 flex items-center justify-center">
                        <QrCode className="w-20 h-20 text-french-dark" />
                      </div>
                      <span className="text-[11px] text-french-muted block font-mono">frenchbell@upi • ₹{grandTotal}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Card Form Simulation */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-french-cream border border-french-gold/30 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-french-dark block">
                    Card Information (Dummy Sandbox)
                  </span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={cardDetails.number}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl border border-french-gold/30 bg-french-card font-mono text-xs font-bold"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        readOnly
                        className="px-3 py-2 rounded-xl border border-french-gold/30 bg-french-card font-mono text-xs"
                      />
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        readOnly
                        className="px-3 py-2 rounded-xl border border-french-gold/30 bg-french-card font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleExecutePayment}
                disabled={isProcessingPayment || paymentSuccess}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold text-sm uppercase tracking-wider shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 gold-glow disabled:opacity-60"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment (₹{grandTotal})...</span>
                  </>
                ) : paymentSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-800" />
                    <span>Payment Confirmed! 🎉</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pay ₹{grandTotal} & Place Order</span>
                  </>
                )}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
