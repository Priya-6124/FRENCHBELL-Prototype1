import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  X, Clock, Phone, MapPin, Bike, Utensils, ShoppingBag,
  CreditCard, CheckCircle2, AlertCircle, Printer, MessageSquare,
  ArrowRight, ShieldCheck, ChevronRight, Ban
} from 'lucide-react';

export default function OrderDetailDrawer({ order, onClose, onStatusUpdated }) {
  if (!order) return null;

  const { token } = useAuth();
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(false);

  const isDelivery = order.order_type === 'delivery';

  // Status step configuration
  const steps = isDelivery
    ? ['received', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'completed']
    : ['received', 'accepted', 'preparing', 'ready', 'completed'];

  const stepLabels = {
    received: 'New / Received',
    accepted: 'Accepted',
    preparing: 'In Kitchen (Preparing)',
    ready: 'Ready',
    out_for_delivery: 'Out for Delivery',
    completed: isDelivery ? 'Delivered' : 'Completed'
  };

  const currentStepIndex = steps.indexOf(order.order_status);

  // Update order status
  const handleUpdateStatus = async (newStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id || order.order_number}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order_status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      addNotification('Status Updated', data.message || `Order #${order.order_number} is now ${newStatus}`, 'success');
      if (onStatusUpdated) onStatusUpdated(order.id, newStatus);
      if (onClose) onClose();
    } catch (err) {
      addNotification('Transition Rejected', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Send WhatsApp Receipt
  const handleSendWhatsApp = async () => {
    try {
      const res = await fetch('/api/receipts/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: order.order_number, phone: order.phone })
      });
      const data = await res.json();
      if (data.whatsapp_link) {
        window.open(data.whatsapp_link, '_blank');
      }
      addNotification('WhatsApp Receipt', 'Dispatched receipt link via WhatsApp!', 'success');
    } catch (err) {
      addNotification('Error', 'Failed to generate WhatsApp receipt', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-french-dark/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-french-card border-l-2 border-french-gold shadow-2xl h-full flex flex-col justify-between overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-5 bg-french-dark text-french-cream border-b border-french-gold/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-french-gold text-french-dark flex items-center justify-center font-bold shadow">
              {order.order_type === 'delivery' && <Bike className="w-5 h-5" />}
              {order.order_type === 'dine-in' && <Utensils className="w-5 h-5" />}
              {order.order_type === 'takeaway' && <ShoppingBag className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-black text-xl text-french-gold">
                  ORDER #{order.order_number}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-french-gold/20 text-french-gold border border-french-gold/40">
                  {order.order_type}
                </span>
              </div>
              <p className="text-xs text-french-cream/70 font-mono mt-0.5">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-french-brown text-french-cream/70 hover:text-french-cream transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Order Details Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-french-dark text-xs font-medium">

          {/* 1. Visual Order Status Timeline */}
          <div className="p-4 rounded-2xl bg-french-cream/80 border border-french-gold/25 space-y-3">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-french-muted block">
              Order Status Lifecycle
            </span>

            {order.order_status === 'cancelled' ? (
              <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-700 font-bold flex items-center gap-2">
                <Ban className="w-4 h-4 shrink-0" />
                <span>This order was CANCELLED.</span>
              </div>
            ) : (
              <div className="flex items-center justify-between relative">
                {steps.map((st, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={st} className="flex flex-col items-center flex-1 text-center relative z-10">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-french-gold text-french-dark ring-4 ring-french-gold/30 scale-110'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-french-brown/20 text-french-muted border border-french-gold/20'
                      }`}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[9px] uppercase font-bold mt-1.5 leading-tight ${
                        isCurrent ? 'text-french-dark font-extrabold' : 'text-french-muted'
                      }`}>
                        {st.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Customer Information */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-french-cream/60 border border-french-gold/20">
            <div>
              <span className="text-[10px] text-french-muted uppercase tracking-wider block font-bold">Customer</span>
              <span className="font-serif font-bold text-sm text-french-dark block mt-0.5">
                {order.customer_name}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-french-muted uppercase tracking-wider block font-bold">Mobile Number</span>
              <a href={`tel:+91${order.phone}`} className="font-mono text-sm font-bold text-french-dark hover:text-french-gold block mt-0.5">
                +91 {order.phone}
              </a>
            </div>

            {order.table_number && (
              <div>
                <span className="text-[10px] text-french-muted uppercase tracking-wider block font-bold">Dine-In Table</span>
                <span className="font-bold text-sm text-french-dark mt-0.5 block">
                  Table #{order.table_number} ({order.num_people || 2} Guests)
                </span>
              </div>
            )}

            {order.pickup_time && (
              <div>
                <span className="text-[10px] text-french-muted uppercase tracking-wider block font-bold">Takeaway Pickup</span>
                <span className="font-bold text-sm text-french-dark mt-0.5 block">
                  {order.pickup_time}
                </span>
              </div>
            )}
          </div>

          {/* 3. Delivery Details (if applicable) */}
          {isDelivery && (
            <div className="p-4 rounded-2xl bg-french-cream/60 border border-french-gold/20 space-y-2">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-french-dark">
                <MapPin className="w-4 h-4 text-french-gold" />
                <span>Delivery Address & Logistics</span>
              </div>

              <p className="font-medium text-xs leading-relaxed text-french-dark/90 pl-5">
                {order.delivery_address || 'K. Narayanpura, Main Rd'}
                {order.landmark ? ` (Near ${order.landmark})` : ''}
                {order.pincode ? ` - ${order.pincode}` : ''}
              </p>

              <div className="flex items-center gap-4 text-[11px] text-french-muted pl-5 pt-1">
                <span>Radius: <strong>~1.4 km</strong> (Within 2 km free zone)</span>
                <span>Charge: <strong>₹0 (Free)</strong></span>
              </div>
            </div>
          )}

          {/* 4. Special Instructions */}
          {order.special_instructions && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block">
                Customer Preparation Note:
              </span>
              <p className="text-xs italic">
                "{order.special_instructions}"
              </p>
            </div>
          )}

          {/* 5. Order Items Table */}
          <div className="rounded-2xl border border-french-gold/25 overflow-hidden">
            <div className="bg-french-dark text-french-gold p-3 uppercase font-extrabold tracking-wider text-[10px] flex justify-between">
              <span>Item Description</span>
              <span>Total</span>
            </div>

            <div className="divide-y divide-french-gold/15 bg-french-cream/40">
              {(order.items || []).map((it, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-french-dark block">
                      {it.item_name} <span className="text-french-muted font-mono font-normal">× {it.quantity}</span>
                    </span>
                    {it.variant && (
                      <span className="text-[10px] font-bold text-french-gold uppercase">
                        {it.variant}
                      </span>
                    )}
                  </div>
                  <span className="font-serif font-extrabold text-sm text-french-dark">
                    ₹{it.total_price || (it.unit_price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Pricing Breakdown */}
          <div className="p-4 rounded-2xl bg-french-cream/60 border border-french-gold/20 space-y-1.5 text-xs">
            <div className="flex justify-between text-french-muted">
              <span>Subtotal</span>
              <span>₹{order.subtotal || order.total}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>Coupon Savings</span>
                <span>-₹{order.discount}</span>
              </div>
            )}

            <div className="flex justify-between text-french-muted">
              <span>Delivery Charge</span>
              <span>{order.delivery_charge > 0 ? `₹${order.delivery_charge}` : '₹0 (Free)'}</span>
            </div>

            <div className="pt-2 border-t border-french-gold/20 flex justify-between items-center text-sm font-extrabold text-french-dark">
              <span>Grand Total</span>
              <span className="font-serif text-lg text-french-dark">
                ₹{Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* 7. Payment Info (Payment ID, Method, Status) */}
          <div className="p-3.5 rounded-2xl bg-french-cream/60 border border-french-gold/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-french-gold shrink-0" />
              <div>
                <span className="font-bold text-french-dark block uppercase text-[10px]">Payment Details</span>
                <span className="text-french-dark font-mono uppercase font-bold text-xs">{order.payment_method || 'UPI'}</span>
                <span className="text-french-muted font-mono text-[10px] block mt-0.5">
                  Payment ID: <strong className="text-french-dark">{order.transaction_id || order.payment_id || `TXN_${order.id || '9823'}_PAID`}</strong>
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-800 border border-emerald-500/30">
              {order.payment_status || 'PAID'}
            </span>
          </div>

        </div>

        {/* Action Controls Footer */}
        <div className="p-5 bg-french-cream border-t border-french-gold/30 space-y-3 shrink-0">
          
          {/* Workflow Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {(order.order_status === 'received' || order.order_status === 'new') && (
              <>
                <button
                  disabled={loading}
                  onClick={() => handleUpdateStatus('accepted')}
                  className="flex-1 py-3 rounded-2xl bg-french-dark text-french-gold font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all gold-glow"
                >
                  Accept Order
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleUpdateStatus('cancelled')}
                  className="px-4 py-3 rounded-2xl bg-red-100 hover:bg-red-600 text-red-600 hover:text-white font-bold text-xs uppercase transition-all"
                >
                  Cancel
                </button>
              </>
            )}

            {order.order_status === 'accepted' && (
              <>
                <button
                  disabled={loading}
                  onClick={() => handleUpdateStatus('preparing')}
                  className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Start Preparing
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleUpdateStatus('cancelled')}
                  className="px-4 py-3 rounded-2xl bg-red-100 hover:bg-red-600 text-red-600 hover:text-white font-bold text-xs uppercase transition-all"
                >
                  Cancel
                </button>
              </>
            )}

            {order.order_status === 'preparing' && (
              <button
                disabled={loading}
                onClick={() => handleUpdateStatus('ready')}
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Mark Ready
              </button>
            )}

            {order.order_status === 'ready' && (
              <>
                {isDelivery ? (
                  <button
                    disabled={loading}
                    onClick={() => handleUpdateStatus('out_for_delivery')}
                    className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
                  >
                    Out for Delivery
                  </button>
                ) : (
                  <button
                    disabled={loading}
                    onClick={() => handleUpdateStatus('completed')}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
                  >
                    Complete (Mark Served)
                  </button>
                )}
              </>
            )}

            {order.order_status === 'out_for_delivery' && (
              <button
                disabled={loading}
                onClick={() => handleUpdateStatus('completed')}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Mark Delivered (Complete)
              </button>
            )}

            {(order.order_status === 'completed' || order.order_status === 'cancelled') && (
              <div className="w-full py-2.5 px-3 rounded-xl bg-french-cream border border-french-gold/30 text-center text-xs font-bold text-french-muted">
                Order is finalized ({order.order_status.toUpperCase()}). No further state changes allowed.
              </div>
            )}
          </div>

          {/* Receipt Actions */}
          <div className="flex gap-2 pt-1 border-t border-french-gold/15">
            <a
              href={`/api/receipts/${order.order_number}/download`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 rounded-xl bg-french-dark text-french-gold font-bold text-xs uppercase tracking-wider text-center hover:bg-french-gold hover:text-french-dark transition-all flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tax Invoice</span>
            </a>

            <button
              onClick={handleSendWhatsApp}
              className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Receipt</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
