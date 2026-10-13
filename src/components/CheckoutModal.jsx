import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { playPaymentSuccessSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  CreditCard,
  Smartphone,
  DollarSign,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  QrCode,
  Building,
  Lock,
  Loader2,
  ArrowRight,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Phone,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export default function CheckoutModal({ onClose, onOrderPlaced }) {
  const {
    cart,
    cartSubtotal,
    discountAmount,
    taxAmount,
    deliveryCharge,
    grandTotal,
    orderMode,
    appliedOffer,
    dineInDetails,
    takeawayDetails,
    deliveryDetails,
    clearCart,
    addNotification
  } = useApp();
  const { user, token, sendOtp, verifyOtp } = useAuth();

  // If user is not logged in, prompt Mobile OTP inside checkout
  const [authStep, setAuthStep] = useState(user ? 'ready' : 'phone'); // 'ready' | 'phone' | 'otp'
  const [otpPhone, setOtpPhone] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [authError, setAuthError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'cash'
  const [upiApp, setUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'qr'
  const [simulatedOutcome, setSimulatedOutcome] = useState('success'); // 'success' | 'failure'
  const [createdOrder, setCreatedOrder] = useState(null); // Prevents duplicate order creation on retry
  const [paymentError, setPaymentError] = useState('');
  const [cardDetails] = useState({
    number: '4532 •••• •••• 8821',
    expiry: '12/28',
    cvv: '•••',
    name: user?.name || 'FrenchBell Customer'
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Handle OTP request for Guest Customer before ordering
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    const cleanPhone = otpPhone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsSendingOtp(true);
    try {
      await sendOtp(cleanPhone);
      setOtpCode(['', '', '', '']);
      setAuthStep('otp');
      setIsSendingOtp(false);
    } catch (err) {
      setIsSendingOtp(false);
      setAuthError(err.message || 'Failed to send verification code. Check SMS gateway configuration.');
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    const fullOtp = otpCode.join('');
    if (fullOtp.length < 4) {
      setAuthError('Please enter the complete 4-digit verification code.');
      return;
    }
    setIsSendingOtp(true);
    try {
      await verifyOtp(otpPhone, fullOtp, otpName, whatsappOptIn);
      setIsSendingOtp(false);
      setAuthStep('ready');
      addNotification('Mobile Verified', 'You are verified and ready to place your order!', 'success');
    } catch (err) {
      setIsSendingOtp(false);
      setAuthError(err.message || 'The verification code is incorrect. Please try again.');
    }
  };

  // Process Payment and Place Order (Guards against duplicate clicks and duplicate orders)
  const handleExecutePayment = async () => {
    if (isProcessingPayment) return;

    if (!user || !user.phone) {
      setAuthStep('phone');
      setAuthError('Please verify your mobile number with OTP before placing an order.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      let activeOrder = createdOrder;

      // 1. Create order in database if not already created (prevents duplicate orders upon retry)
      if (!activeOrder) {
        const customerName = (user.name || otpName || 'Valued Foodie').trim();
        const customerPhone = user.phone;

        const payload = {
          user_id: user.id || null,
          order_type: orderMode,
          table_number: orderMode === 'dine-in' ? (dineInDetails.tableNumber || '04') : null,
          num_people: orderMode === 'dine-in' ? (dineInDetails.numPeople || 2) : null,
          customer_name: customerName,
          phone: customerPhone,
          pickup_time: orderMode === 'takeaway' ? (takeawayDetails.pickupTime || '20 mins') : null,
          delivery_address: orderMode === 'delivery' ? (deliveryDetails.address || 'K. Narayanpura') : null,
          landmark: orderMode === 'delivery' ? deliveryDetails.landmark : null,
          pincode: orderMode === 'delivery' ? deliveryDetails.pincode : null,
          delivery_distance_km: 1.5,
          subtotal: cartSubtotal,
          discount: discountAmount,
          coupon_code: appliedOffer?.coupon_code || null,
          delivery_charge: deliveryCharge,
          total: grandTotal,
          payment_method: paymentMethod === 'cash' ? 'cash' : `simulated_${paymentMethod}_${upiApp}`,
          special_instructions: orderMode === 'dine-in'
            ? dineInDetails.instructions
            : (orderMode === 'takeaway' ? takeawayDetails.instructions : deliveryDetails.instructions),
          items: cart.map(i => ({
            menu_item_id: i.id,
            item_name: i.name,
            variant: i.variant,
            quantity: i.quantity,
            unit_price: i.price,
            total_price: i.price * i.quantity,
            special_instructions: i.special_instructions || i.specialInstructions || ''
          }))
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });

        const orderData = await res.json();
        if (!res.ok) {
          throw new Error(orderData.error || 'Failed to place order.');
        }

        activeOrder = orderData.order;
        if (!activeOrder) {
          throw new Error('Order creation could not be confirmed by the server.');
        }
        setCreatedOrder(activeOrder);
      }

      // 2. Server-side payment simulation (records attempt, status, and outcome in database)
      const simRes = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          order_number: activeOrder.order_number,
          outcome: simulatedOutcome,
          method: paymentMethod === 'cash' ? 'cash' : `simulated_${paymentMethod}_${upiApp}`
        })
      });

      const simData = await simRes.json();

      if (!simRes.ok || simData.success === false) {
        setIsProcessingPayment(false);
        const errMsg = simData.message || simData.error || 'Simulated payment failed as requested.';
        setPaymentError(`Payment Failed (Simulation): ${errMsg}`);
        addNotification(
          'Simulated Payment Failed',
          `Order #${activeOrder.order_number} marked as failed. Switch to "Simulate Success" and click Retry.`,
          'error'
        );
        return;
      }

      // 3. Dispatch receipt confirmation if opted in
      if (whatsappOptIn) {
        try {
          await fetch('/api/receipts/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: activeOrder.order_number,
              phone: user.phone
            })
          });
        } catch (waErr) {
          console.warn('Receipt dispatch notice:', waErr);
        }
      }

      // 4. Success UI sequence
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      playPaymentSuccessSound();

      // Confetti explosion
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#FFF8DC', '#8B5A2B', '#10B981']
        });
      } catch (e) {}

      setTimeout(() => {
        clearCart();
        if (onClose) onClose();
        if (onOrderPlaced) {
          onOrderPlaced({
            ...activeOrder,
            payment_status: 'successful',
            payment_method: paymentMethod === 'cash' ? 'cash' : `simulated_${paymentMethod}_${upiApp}`
          });
        }
      }, 1200);

    } catch (err) {
      setIsProcessingPayment(false);
      setPaymentError(err.message || 'Payment processing error');
      addNotification('Order Failed', err.message || 'Unable to place order. Please try again.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-french-card border border-french-gold/35 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-french-dark via-[#28150B] to-french-dark text-french-cream border-b border-french-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-french-gold/20 text-french-gold flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-xl text-french-cream">
                Secure Checkout
              </h3>
              <p className="text-xs text-french-gold font-medium flex items-center gap-1.5 mt-0.5">
                {orderMode === 'dine-in' && (
                  <>
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>Dine-In Table #{dineInDetails.tableNumber || '04'}</span>
                  </>
                )}
                {orderMode === 'takeaway' && (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Takeaway Counter Pickup</span>
                  </>
                )}
                {orderMode === 'delivery' && (
                  <>
                    <Bike className="w-3.5 h-3.5" />
                    <span>Doorstep Delivery</span>
                  </>
                )}
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

          {/* Customer verification gate if not logged in */}
          {authStep !== 'ready' && !user ? (
            <div className="p-6 rounded-3xl bg-french-cream border border-french-gold/30 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full mx-auto bg-french-gold/20 text-french-gold flex items-center justify-center border border-french-gold/40 shadow">
                <Phone className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-xl text-french-dark">
                Mobile Verification Required
              </h4>
              <p className="text-xs text-french-muted max-w-sm mx-auto">
                Please verify your 10-digit mobile number to confirm your order, receive your digital receipt, and get live preparation updates.
              </p>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-semibold text-center">
                ⚠️ <strong>Development Notice:</strong> Test OTP mode active. Fixed code is <span className="font-mono bg-amber-200 px-1.5 py-0.5 rounded text-french-dark font-black">1234</span>. Real SMS is disabled.
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-semibold flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authStep === 'phone' ? (
                <form onSubmit={handleRequestOtp} className="space-y-3.5 max-w-sm mx-auto text-left">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
                      Your Name <span className="text-french-muted font-normal text-[11px]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={otpName}
                      onChange={(e) => setOtpName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-card text-sm focus:outline-none focus:border-french-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
                      Mobile Number *
                    </label>
                    <div className="flex items-center rounded-xl border border-french-gold/30 bg-french-card overflow-hidden">
                      <span className="px-3 py-2.5 text-xs font-bold text-french-dark bg-french-gold/15 border-r border-french-gold/20">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile"
                        className="w-full px-3 py-2.5 text-sm font-mono font-bold focus:outline-none bg-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="checkout-wa-optin"
                      checked={whatsappOptIn}
                      onChange={(e) => setWhatsappOptIn(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-french-gold accent-french-gold"
                    />
                    <label htmlFor="checkout-wa-optin" className="text-xs text-french-muted leading-tight cursor-pointer">
                      Send receipt and order status updates to my WhatsApp.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp || otpPhone.length < 10}
                    className="w-full py-3 rounded-xl bg-french-dark text-french-gold font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{isSendingOtp ? 'Sending Code...' : 'Send Verification Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5 max-w-sm mx-auto">
                  <p className="text-xs text-center text-french-muted mb-2">
                    Enter the 4-digit SMS verification code sent to <strong>+91 {otpPhone}</strong>
                  </p>

                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        value={otpCode[idx]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const copy = [...otpCode];
                          copy[idx] = val;
                          setOtpCode(copy);
                          if (val && e.target.nextSibling) {
                            e.target.nextSibling.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otpCode[idx] && e.target.previousSibling) {
                            e.target.previousSibling.focus();
                          }
                        }}
                        className="w-10 h-13 text-center text-xl font-mono font-bold rounded-xl border-2 border-french-gold/40 bg-white focus:border-french-gold focus:outline-none"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp || otpCode.join('').length < 4}
                    className="w-full py-3 rounded-xl bg-french-gold text-french-dark font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue Checkout</span>
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
              {/* Order Items Breakdown */}
              <div className="p-4 rounded-2xl bg-french-cream/60 border border-french-gold/25 space-y-3">
                <div className="flex items-center justify-between border-b border-french-gold/20 pb-2">
                  <span className="font-serif font-bold text-sm text-french-dark">Order Items ({cart.length})</span>
                  <span className="text-xs font-bold text-french-gold uppercase tracking-wider">{orderMode}</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-french-dark/90">
                      <div className="truncate pr-2">
                        <span>{item.quantity}x {item.name}</span>
                        {item.variant && <span className="text-french-muted"> • {item.variant}</span>}
                        {item.special_instructions && (
                          <div className="text-[10px] text-french-muted italic">
                            Note: {item.special_instructions}
                          </div>
                        )}
                      </div>
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
                      <span>Applied Coupon Discount</span>
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
                  <div className="flex justify-between text-sm font-black text-french-dark pt-1.5 border-t border-french-gold/20">
                    <span>Total Amount Payable</span>
                    <span className="font-serif text-lg text-french-gold">₹{grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Payment Failure Error Banner */}
              {paymentError && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">{paymentError}</p>
                    <p className="text-[11px] text-red-600/90 mt-0.5">
                      {createdOrder ? `Order #${createdOrder.order_number} is recorded as "failed". Select "Simulate Success" below to retry payment safely without creating a duplicate order.` : 'Payment was rejected.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Simulated Test Payment Sandbox Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] text-amber-800">
                  <Sparkles className="w-3.5 h-3.5 text-french-gold shrink-0" />
                  <span>Simulated Payment Provider (Test Mode)</span>
                </div>
                <p className="text-[11px] text-french-dark/80">
                  This checkout is running in dummy test mode. No real money or bank accounts will be charged. Sensitive credentials (card numbers, CVVs, UPI PINs) are never collected.
                </p>
              </div>

              {/* Simulation Outcome Controls */}
              <div className="p-3.5 rounded-2xl bg-french-cream border border-french-gold/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-french-dark">
                    Test Mode: Simulate Payment Outcome
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-french-dark text-french-gold">
                    SANDBOX
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulatedOutcome('success')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      simulatedOutcome === 'success'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow'
                        : 'bg-french-card text-french-dark border-french-gold/25 hover:border-emerald-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulate Success</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedOutcome('failure')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      simulatedOutcome === 'failure'
                        ? 'bg-red-700 text-white border-red-800 shadow'
                        : 'bg-french-card text-french-dark border-french-gold/25 hover:border-red-600'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Simulate Failure</span>
                  </button>
                </div>
                {createdOrder && (
                  <div className="text-[11px] text-french-dark/70 font-mono pt-1">
                    Retrying on existing Order <strong>#{createdOrder.order_number}</strong> (prevents duplicate orders).
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-french-gold" />
                  <span>Simulated Payment Instrument</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'upi', name: 'UPI Pay', icon: Smartphone, desc: 'GPay / PhonePe / QR' },
                    { id: 'card', name: 'Card', icon: CreditCard, desc: 'Debit / Credit' },
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

              {/* UPI Options */}
              {paymentMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-french-cream border border-french-gold/30 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-french-dark block">
                    Choose UPI Option
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'gpay', label: 'Google Pay' },
                      { id: 'phonepe', label: 'PhonePe' },
                      { id: 'paytm', label: 'Paytm' },
                      { id: 'qr', label: 'Scan QR' }
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
                        {app.label}
                      </button>
                    ))}
                  </div>

                  {upiApp === 'qr' && (
                    <div className="p-3 rounded-xl bg-french-card border border-french-gold/30 text-center space-y-2">
                      <div className="w-24 h-24 mx-auto bg-white p-2 rounded-lg border border-french-gold/40 flex items-center justify-center">
                        <QrCode className="w-20 h-20 text-french-dark" />
                      </div>
                      <span className="text-[11px] text-french-muted block font-mono">
                        frenchbell@upi • ₹{grandTotal}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Card Simulation */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-french-cream border border-french-gold/30 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-french-dark block">
                    Card Information (Sandbox Verification)
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

              {/* WhatsApp Opt-in Reminder */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Receipt will be available for download after payment. Digital copy retained in your account.
                </span>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleExecutePayment}
                disabled={isProcessingPayment || paymentSuccess}
                className={`w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                  simulatedOutcome === 'failure'
                    ? 'bg-red-700 text-white hover:bg-red-800'
                    : 'bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark gold-glow'
                }`}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{createdOrder ? 'Retrying Payment...' : 'Placing Order...'}</span>
                  </>
                ) : paymentSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-800" />
                    <span>Payment Confirmed ✓ [TEST/SIMULATED]</span>
                  </>
                ) : simulatedOutcome === 'failure' ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    <span>{createdOrder ? 'Retry with Failure Simulation' : `Test Failure — ₹${grandTotal}`}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>{createdOrder ? `Retry Payment — ₹${grandTotal} [TEST]` : `Pay ₹${grandTotal} — Simulated [TEST]`}</span>
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
