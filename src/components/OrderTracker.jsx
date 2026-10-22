import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle, Clock, Bell, Download, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

export default function OrderTracker({ order: propOrder, onClose }) {
  const { activeOrder } = useApp();
  const { token, user } = useAuth();
  const order = propOrder || activeOrder || {
    order_number: 'FB1042',
    customer_name: 'Guest Customer',
    order_type: 'delivery',
    order_status: 'received',
    payment_status: 'successful',
    total: 248.00,
    created_at: new Date().toISOString()
  };

  const [liveOrder, setLiveOrder] = useState(order);
  const [status, setStatus] = useState(order.order_status || 'received');
  const [pollingActive, setPollingActive] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  const fetchLiveStatus = useCallback(async () => {
    if (!order.order_number) return;
    try {
      const phoneParam = order.phone || user?.phone ? `?phone=${encodeURIComponent(order.phone || user?.phone)}` : '';
      const res = await fetch(`/api/orders/${order.order_number}/track${phoneParam}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.order_status) {
          setLiveOrder(data);
          setStatus(data.order_status);
          setLastRefreshed(new Date());
          setTrackError('');
          // Stop polling on terminal states
          if (data.order_status === 'completed' || data.order_status === 'cancelled') {
            setPollingActive(false);
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          setTrackError(errData.error || 'Unable to authorize or find this order.');
          setPollingActive(false);
        }
      }
    } catch (e) {
      // Silent on network glitch
    } finally {
      setIsLoading(false);
    }
  }, [order.order_number, order.phone, user?.phone, token]);

  // Poll every 5 seconds while order is active
  useEffect(() => {
    setLiveOrder(order);
    setStatus(order.order_status || 'received');
    setPollingActive(
      order.order_status !== 'completed' && order.order_status !== 'cancelled'
    );
  }, [order.order_number]);

  useEffect(() => {
    if (!pollingActive) return;
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchLiveStatus, pollingActive]);

  const getSteps = () => {
    if (liveOrder.order_type === 'dine-in') {
      return [
        { id: 'received', label: 'Order Received', desc: 'Sent to kitchen' },
        { id: 'accepted', label: 'Accepted', desc: 'Acknowledged by kitchen staff' },
        { id: 'preparing', label: 'Preparing', desc: 'Cooking fresh in kitchen' },
        { id: 'ready', label: 'Ready to Serve', desc: 'Plated for serving' },
        { id: 'completed', label: 'Served', desc: 'Served at Table #' + (liveOrder.table_number || '—') }
      ];
    }
    if (liveOrder.order_type === 'takeaway') {
      return [
        { id: 'received', label: 'Order Received', desc: 'Kitchen acknowledged' },
        { id: 'accepted', label: 'Accepted', desc: 'Queued for preparation' },
        { id: 'preparing', label: 'Preparing', desc: 'Cooking & packing' },
        { id: 'ready', label: 'Ready for Pickup', desc: 'Ready at counter' },
        { id: 'completed', label: 'Picked Up', desc: 'Handed over at counter' }
      ];
    }
    // Delivery default
    return [
      { id: 'received', label: 'Order Received', desc: 'Confirmed by FrenchBell' },
      { id: 'accepted', label: 'Accepted', desc: 'Kitchen preparing order' },
      { id: 'preparing', label: 'Preparing', desc: 'Cooking & carefully packing' },
      { id: 'ready', label: 'Ready for Dispatch', desc: 'Packed and waiting for rider' },
      { id: 'out_for_delivery', label: 'Out for Delivery', desc: 'Delivery partner on the way' },
      { id: 'completed', label: 'Delivered', desc: 'Delivered to your address' }
    ];
  };

  const steps = getSteps();
  const isCancelled = status === 'cancelled';
  const isPaymentFailed = liveOrder.payment_status === 'failed';
  const currentStepIndex = isCancelled ? -1 : (
    steps.findIndex(s => s.id === status) !== -1 ? steps.findIndex(s => s.id === status) : 0
  );

  const isSimulated =
    liveOrder.payment_method && String(liveOrder.payment_method).toLowerCase().includes('simulated');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-french-card border border-french-gold/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-french-cream text-french-dark hover:bg-french-gold/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-french-dark text-french-gold flex items-center justify-center border border-french-gold/40 shadow">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-french-gold block">
              Live Order Progress
            </span>
            <h3 className="font-serif font-extrabold text-2xl text-french-dark">
              Order #{liveOrder.order_number || order.order_number}
            </h3>
          </div>
        </div>

        {/* Tracking Error Alert */}
        {trackError && (
          <div className="p-4 rounded-2xl border bg-red-500/10 border-red-500/30 text-red-700 flex items-start gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Tracking Notice</p>
              <p className="text-xs mt-0.5">{trackError}</p>
            </div>
          </div>
        )}

        {/* Cancelled / Payment Failed Alert */}
        {(isCancelled || isPaymentFailed) && (
          <div className={`p-4 rounded-2xl border flex items-start gap-3 text-sm ${
            isCancelled ? 'bg-red-500/10 border-red-500/30 text-red-700' : 'bg-amber-500/10 border-amber-500/30 text-amber-800'
          }`}>
            {isCancelled ? (
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                {isCancelled ? 'Order Cancelled' : 'Payment Failed'}
              </p>
              <p className="text-xs mt-0.5">
                {isCancelled
                  ? 'This order has been cancelled. No payment will be charged.'
                  : 'Payment could not be processed. Please contact the cafe for assistance.'}
              </p>
            </div>
          </div>
        )}

        {/* Simulated Payment Notice */}
        {isSimulated && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-800 text-[11px] font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>SIMULATED / TEST PAYMENT — No real charge made</span>
          </div>
        )}

        {/* Estimated Time Banner (only when active) */}
        {!isCancelled && status !== 'completed' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-french-dark to-french-brown text-french-cream flex items-center justify-between border border-french-gold/30 gold-glow">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-french-gold animate-pulse" />
              <div>
                <span className="text-xs text-french-cream/70 block">Estimated Time</span>
                <span className="font-serif font-bold text-lg text-french-gold">15–25 Minutes</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-french-gold/20 text-french-gold text-xs font-extrabold uppercase border border-french-gold/30">
              {(liveOrder.order_type || order.order_type || '').toUpperCase()}
            </span>
          </div>
        )}

        {/* Payment Status Row */}
        <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-french-cream/70 border border-french-gold/20">
          <span className="text-french-muted font-medium">Payment Status</span>
          <span className={`font-bold uppercase ${
            liveOrder.payment_status === 'successful' || liveOrder.payment_status === 'paid'
              ? 'text-emerald-700'
              : liveOrder.payment_status === 'failed'
              ? 'text-red-700'
              : 'text-amber-700'
          }`}>
            {liveOrder.payment_status || 'pending'}{isSimulated ? ' [SIMULATED]' : ''}
          </span>
        </div>

        {/* Vertical Tracker Steps */}
        {!isCancelled && (
          <div className="py-2 relative space-y-5">
            {steps.map((step, idx) => {
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.id} className="flex items-start gap-4 relative">
                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-5 top-10 w-0.5 h-9 ${
                        idx < currentStepIndex ? 'bg-french-gold' : 'bg-french-gold/20'
                      }`}
                    />
                  )}

                  {/* Step Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0 ${
                      isDone
                        ? 'bg-french-gold text-french-dark border-2 border-french-dark shadow-md gold-glow'
                        : 'bg-french-cream text-french-muted border border-french-gold/30'
                    }`}
                  >
                    {isDone ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                  </div>

                  {/* Step Text */}
                  <div>
                    <h4 className={`font-serif font-bold text-base ${isCurrent ? 'text-french-gold text-lg' : (isDone ? 'text-french-dark' : 'text-french-muted')}`}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-french-muted">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Download Receipt button + live refresh indicator */}
        <div className="pt-2 flex items-center justify-between border-t border-french-gold/20">
          <a
            href={`/api/receipts/${liveOrder.order_number || order.order_number}/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-french-gold hover:underline inline-flex items-center gap-1.5 py-1"
          >
            <Download className="w-4 h-4" />
            <span>Download Receipt (PDF)</span>
          </a>
          <div className="flex items-center gap-2">
            {pollingActive && (
              <span className="flex items-center gap-1 text-[10px] text-french-muted">
                <RefreshCw className="w-3 h-3 animate-spin text-french-gold" />
                <span>Live</span>
              </span>
            )}
            <button
              onClick={fetchLiveStatus}
              className="text-[11px] text-french-gold font-semibold hover:underline flex items-center gap-1"
              title="Refresh status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Status: <strong className="uppercase text-french-dark">{status}</strong></span>
            </button>
          </div>
        </div>

        {/* Last refreshed */}
        <p className="text-[10px] text-french-muted text-right">
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </p>

      </div>
    </div>
  );
}
