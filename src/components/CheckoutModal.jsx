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

function loadRazorpayCheckout() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => {
      reject(new Error('Unable to load Razorpay Checkout. Check your internet connection.'));
    };

    document.body.appendChild(script);
  });
}

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
    setDeliveryDetails,
    clearCart,
    addNotification
  } = useApp();
  const { user, token, sendOtp, verifyOtp, lastGeneratedOtp } = useAuth();

  // If user is not logged in, prompt Mobile OTP inside checkout
  const [authStep, setAuthStep] = useState(user ? 'ready' : 'phone'); // 'ready' | 'phone' | 'otp'
  const [otpPhone, setOtpPhone] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [authError, setAuthError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);

  // Payment Selection: Razorpay and Pay at Cafe only
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cash'
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

    // Validate delivery details when orderMode is delivery
    if (orderMode === 'delivery') {
      if (!deliveryDetails.address || !deliveryDetails.address.trim()) {
        setPaymentError('Please enter your full delivery address (house/flat no., building, street) before placing your order.');
        return;
      }
      if (!deliveryDetails.pincode || !deliveryDetails.pincode.trim()) {
        setPaymentError('Please enter your 6-digit delivery area pincode.');
        return;
      }
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
          delivery_address: orderMode === 'delivery' ? deliveryDetails.address.trim() : null,
          landmark: orderMode === 'delivery' ? (deliveryDetails.landmark?.trim() || null) : null,
          pincode: orderMode === 'delivery' ? (deliveryDetails.pincode?.trim() || null) : null,
          delivery_distance_km: 1.5,
          subtotal: cartSubtotal,
          discount: discountAmount,
          coupon_code: appliedOffer?.coupon_code || null,
          delivery_charge: deliveryCharge,
          total: grandTotal,
          
          payment_method: paymentMethod === 'razorpay' ? 'razorpay' : 'cash',
          special_instructions: orderMode === 'dine-in'
            ? dineInDetails.instructions
            : (orderMode === 'takeaway' ? takeawayDetails.instructions : deliveryDetails.instructions),
          items: cart.map(i => ({
            menu_item_id: i.id,
            item_name: i.name,
            variant: i.variant || null,
            customizations: i.customizations || (Array.isArray(i.selectedCustomizations) ? i.selectedCustomizations.join(', ') : null),
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

      
      // Razorpay Test Mode: use the existing order, then verify payment on the server.
      if (paymentMethod === 'razorpay') {
        const razorpayOrderRes = await fetch('/api/payment/razorpay/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            order_id: activeOrder.id
          })
        });

        const razorpayOrderData = await razorpayOrderRes.json();

        if (!razorpayOrderRes.ok) {
          throw new Error(
            razorpayOrderData.error || 'Could not create Razorpay test order.'
          );
        }

        await loadRazorpayCheckout();

        // Wait for payment success, failure, or checkout cancellation.
        const result = await new Promise((resolve, reject) => {
          let completed = false;

          const checkout = new window.Razorpay({
            key: razorpayOrderData.key_id,
            amount: razorpayOrderData.amount,
            currency: razorpayOrderData.currency || 'INR',
            name: 'FrenchBell Cafe',
            description: `Order ${activeOrder.order_number}`,
            order_id: razorpayOrderData.razorpay_order_id,

            handler: async (response) => {
              try {
                const verifyRes = await fetch('/api/payment/razorpay/verify', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                  },
                  body: JSON.stringify({
                    order_id: activeOrder.id,
                    order_number: activeOrder.order_number,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                  })
                });

                const verifyData = await verifyRes.json();

                if (!verifyRes.ok || !verifyData.success) {
                  throw new Error(
                    verifyData.error || 'Razorpay payment verification failed.'
                  );
                }

                completed = true;
                resolve(verifyData);
              } catch (error) {
                completed = true;
                reject(error);
              }
            },

            modal: {
              ondismiss: () => {
                if (!completed) {
                  completed = true;
                  reject(new Error('Razorpay checkout was cancelled.'));
                }
              }
            },

            theme: {
              color: '#D4AF37'
            }
          });

          checkout.on('payment.failed', (response) => {
            if (!completed) {
              completed = true;
              reject(
                new Error(
                  response.error?.description || 'Razorpay payment failed.'
                )
              );
            }
          });

          checkout.open();
        });

        // Send the receipt after server-side payment verification succeeds.
        if (whatsappOptIn) {
          try {
            await fetch('/api/receipts/whatsapp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                order_id: activeOrder.id,
                orderNumber: activeOrder.order_number,
                phone: user.phone
              })
            });
          } catch (waErr) {
            console.warn('Receipt dispatch notice:', waErr);
          }
        }

        setIsProcessingPayment(false);
        setPaymentSuccess(true);
        playPaymentSuccessSound();

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
              payment_method: 'razorpay'
            });
          }
        }, 1200);

        return;
      }

      // 2. Pay at Cafe: order is placed, payment recorded as pending until admin confirms
      if (paymentMethod === 'cash') {
        setIsProcessingPayment(false);
        setPaymentSuccess(true);
        playPaymentSuccessSound();

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
              payment_status: 'pending',
              payment_method: 'cash'
            });
          }
        }, 1200);

        return;
      }

      // 3. This path should not be reached for supported methods (razorpay / cash handled above)
      throw new Error('Unsupported payment method. Please select Razorpay or Pay at Cafe.');

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

              {lastGeneratedOtp && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-semibold text-center">
                  ⚠️ <strong>Testing Mode:</strong> Enter{' '}
                  <span className="font-mono bg-amber-200 px-1.5 py-0.5 rounded text-french-dark font-black">{lastGeneratedOtp}</span>{' '}
                  — real SMS is disabled.
                </div>
              )}

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
                        {item.customizations && (
                          <div className="text-[10px] text-french-gold font-semibold truncate">
                            + {item.customizations}
                          </div>
                        )}
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

              {/* Delivery Address Form (Required when Order Mode is Delivery) */}
              {orderMode === 'delivery' && (
                <div className="p-4 rounded-2xl bg-french-cream/80 border border-french-gold/30 space-y-3">
                  <div className="flex items-center gap-2 border-b border-french-gold/20 pb-2">
                    <Bike className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-serif font-bold text-sm text-french-dark">Doorstep Delivery Details *</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-french-dark mb-1">
                        Full Delivery Address * <span className="text-french-muted font-normal">(House/Flat, Building, Street)</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={deliveryDetails.address || ''}
                        onChange={(e) => setDeliveryDetails(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="e.g. Flat 302, Green Glen Apartments, K. Narayanpura Main Road"
                        className="w-full px-3 py-2 rounded-xl border border-french-gold/30 bg-french-card text-xs focus:outline-none focus:border-french-gold"
                      />
                      {!deliveryDetails.address?.trim() && (
                        <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                          * Please enter your delivery address before checkout.
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-french-dark mb-1">
                          Nearby Landmark
                        </label>
                        <input
                          type="text"
                          value={deliveryDetails.landmark || ''}
                          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, landmark: e.target.value }))}
                          placeholder="e.g. Near SBI ATM"
                          className="w-full px-3 py-2 rounded-xl border border-french-gold/30 bg-french-card text-xs focus:outline-none focus:border-french-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-french-dark mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={deliveryDetails.pincode || ''}
                          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                          placeholder="560077"
                          className="w-full px-3 py-2 rounded-xl border border-french-gold/30 bg-french-card text-xs font-mono font-bold focus:outline-none focus:border-french-gold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-french-dark mb-1">
                        Delivery Drop Instructions <span className="text-french-muted font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryDetails.instructions || ''}
                        onChange={(e) => setDeliveryDetails(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="e.g. Leave with security guard, please do not ring doorbell"
                        className="w-full px-3 py-2 rounded-xl border border-french-gold/30 bg-french-card text-xs focus:outline-none focus:border-french-gold"
                      />
                    </div>
                  </div>
                </div>
              )}

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

              {/* Payment Method Selector — Razorpay and Pay at Cafe only */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-french-gold" />
                  <span>Payment Method</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'razorpay', name: 'Pay Online', icon: CreditCard, desc: 'Razorpay — Cards, UPI, NetBanking' },
                    { id: 'cash', name: 'Pay at Cafe', icon: DollarSign, desc: 'Pay cash at counter' }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-french-dark text-french-gold border-french-gold shadow-md'
                            : 'bg-french-cream/70 text-french-dark border-french-gold/25 hover:border-french-gold'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-bold text-xs">{m.name}</span>
                        <span className="text-[9px] opacity-70">{m.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'cash' && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                    Your order will be placed and payment collected at the cafe counter. The order will remain <strong>unpaid</strong> until the cafe records payment.
                  </div>
                )}
              </div>

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
                className="w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark gold-glow"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{createdOrder ? 'Processing Payment...' : 'Placing Order...'}</span>
                  </>
                ) : paymentSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-800" />
                    <span>Order Confirmed ✓</span>
                  </>
                ) : paymentMethod === 'cash' ? (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Place Order — Pay ₹{grandTotal} at Cafe</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>{createdOrder ? `Retry Payment — ₹${grandTotal}` : `Pay ₹${grandTotal} via Razorpay`}</span>
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
