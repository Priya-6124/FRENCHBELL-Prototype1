import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playBellDing } from '../utils/audio';
import { Bell, CheckCircle2, ArrowRight, FileText, Smartphone } from 'lucide-react';

export default function ConfirmationModal({ order, onClose, onTrackOrder, onViewReceipt }) {
  if (!order) return null;

  useEffect(() => {
    // Sound & Confetti trigger
    playBellDing();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FAF5ED', '#331B10', '#E07A5F']
      });
    } catch (e) {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-french-card border-2 border-french-gold rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 gold-border-glow">
        
        {/* Animated Bell Ring Badge */}
        <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-b from-french-gold to-french-gold-hover text-french-dark flex items-center justify-center p-1 shadow-2xl gold-glow animate-bounce">
          <div className="w-full h-full rounded-full bg-french-dark flex items-center justify-center">
            <Bell className="w-10 h-10 text-french-gold" />
          </div>
        </div>

        {/* Headline */}
        <div>
          <span className="font-handwriting text-4xl text-french-gold font-bold block mb-1">
            Ding! 🔔
          </span>
          <h2 className="font-serif font-extrabold text-3xl text-french-dark">
            Your Order is In!
          </h2>
          <p className="text-french-muted text-sm mt-1">
            The French Bell kitchen has received your order and started cooking.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="p-4 rounded-2xl bg-french-cream border border-french-gold/30 text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-french-muted uppercase tracking-wider">
            <span>Order Reference</span>
            <span className="text-french-dark font-mono text-sm font-extrabold text-french-gold bg-french-dark px-2.5 py-0.5 rounded-md">
              #{order.order_number || 'FB1042'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t border-french-gold/20">
            <span className="text-french-dark font-semibold">Customer: {order.customer_name}</span>
            <span className="font-serif font-bold text-french-dark">Total: ₹{Number(order.total).toFixed(2)}</span>
          </div>

          <div className="text-xs text-french-muted">
            Order Type: <strong className="uppercase text-french-dark">{order.order_type}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              if (onTrackOrder) onTrackOrder(order);
              if (onClose) onClose();
            }}
            className="py-3.5 px-4 rounded-2xl bg-french-dark text-french-gold font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all flex items-center justify-center gap-2 gold-glow"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Track My Order</span>
          </button>

          <button
            onClick={() => {
              if (onViewReceipt) onViewReceipt(order);
              if (onClose) onClose();
            }}
            className="py-3.5 px-4 rounded-2xl bg-french-cream border border-french-gold/40 text-french-dark font-extrabold text-xs uppercase tracking-wider hover:border-french-gold transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-french-gold" />
            <span>View Receipt</span>
          </button>
        </div>

      </div>
    </div>
  );
}
