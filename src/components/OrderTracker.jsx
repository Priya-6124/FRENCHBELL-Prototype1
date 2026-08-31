import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, Clock, Utensils, Bike, ShoppingBag, Bell } from 'lucide-react';

export default function OrderTracker({ order: propOrder, onClose }) {
  const { activeOrder } = useApp();
  const order = propOrder || activeOrder || {
    order_number: 'FB1042',
    customer_name: 'Guest Customer',
    order_type: 'delivery',
    order_status: 'preparing',
    total: 248.00,
    created_at: new Date().toISOString()
  };

  const [status, setStatus] = useState(order.order_status || 'preparing');

  // Interactive Live Status advancement simulation for testing demo
  useEffect(() => {
    setStatus(order.order_status || 'preparing');
  }, [order]);

  const getSteps = () => {
    if (order.order_type === 'dine-in') {
      return [
        { id: 'received', label: 'Order Received', desc: 'Sent to kitchen' },
        { id: 'preparing', label: 'Preparing', desc: 'Cooking fresh' },
        { id: 'ready', label: 'Ready', desc: 'Plated for serving' },
        { id: 'completed', label: 'Served', desc: 'At Table #' + (order.table_number || '04') }
      ];
    }
    if (order.order_type === 'takeaway') {
      return [
        { id: 'received', label: 'Order Received', desc: 'Kitchen acknowledged' },
        { id: 'preparing', label: 'Preparing', desc: 'Frying & packing' },
        { id: 'ready', label: 'Ready for Pickup', desc: 'Counter ready' },
        { id: 'completed', label: 'Picked Up', desc: 'Handed over' }
      ];
    }
    // Delivery default
    return [
      { id: 'received', label: 'Order Received', desc: 'Confirmed by cafe' },
      { id: 'preparing', label: 'Preparing', desc: 'Cooking & packing' },
      { id: 'ready', label: 'Out for Delivery', desc: 'Delivery partner assigned' },
      { id: 'completed', label: 'Delivered', desc: 'Enjoy your meal!' }
    ];
  };

  const steps = getSteps();
  const currentStepIndex = steps.findIndex(s => s.id === status) !== -1 ? steps.findIndex(s => s.id === status) : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-french-card border border-french-gold/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
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
          <div className="w-12 h-12 rounded-2xl bg-french-dark text-french-gold flex items-center justify-center text-xl font-bold border border-french-gold/40 shadow">
            🔔
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-french-gold block">
              Follow The Delicious Journey
            </span>
            <h3 className="font-serif font-extrabold text-2xl text-french-dark">
              Order #{order.order_number || 'FB1042'}
            </h3>
          </div>
        </div>

        {/* Estimated Time Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-french-dark to-french-brown text-french-cream flex items-center justify-between border border-french-gold/30 gold-glow">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-french-gold animate-pulse" />
            <div>
              <span className="text-xs text-french-cream/70 block">Estimated Completion</span>
              <span className="font-serif font-bold text-lg text-french-gold">15–25 Minutes</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-french-gold/20 text-french-gold text-xs font-extrabold uppercase border border-french-gold/30">
            {order.order_type.toUpperCase()}
          </span>
        </div>

        {/* Vertical / Horizontal Tracker Steps */}
        <div className="py-4 relative space-y-6">
          {steps.map((step, idx) => {
            const isDone = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.id} className="flex items-start gap-4 relative">
                
                {/* Connecting Line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-5 top-10 w-0.5 h-10 ${
                      idx < currentStepIndex ? 'bg-french-gold' : 'bg-french-gold/20'
                    }`}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
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

        {/* Dev Quick Advance Controls for testing */}
        <div className="pt-4 border-t border-french-gold/20 flex items-center justify-between text-xs">
          <span className="text-french-muted font-medium">Demo Simulator: Advance Status</span>
          <div className="flex gap-1.5">
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => setStatus(s.id)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all ${
                  status === s.id ? 'bg-french-dark text-french-gold border-french-gold' : 'bg-french-cream text-french-dark border-french-gold/20'
                }`}
              >
                {s.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
