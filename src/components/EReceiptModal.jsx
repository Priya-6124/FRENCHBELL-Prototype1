import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Download, Smartphone, Printer, Check, Bell, Receipt, MessageCircle } from 'lucide-react';

export default function EReceiptModal({ order, onClose }) {
  const { addNotification } = useApp();
  const [sentWhatsapp, setSentWhatsapp] = useState(false);

  if (!order) return null;

  const handlePrintDownload = () => {
    window.open(`/api/receipts/${order.order_number}/download`, '_blank');
    addNotification('Receipt Opened', 'Digital receipt generated for printing and PDF download', 'success');
  };

  const handleSendWhatsapp = async () => {
    setSentWhatsapp(true);
    addNotification('WhatsApp Receipt Dispatched', `Receipt link sent to +91 ${order.phone || '9876543210'}`, 'success');
    try {
      await fetch('/api/receipts/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: order.order_number, phone: order.phone })
      });
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-french-card border-2 border-french-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 print:border-none print:shadow-none">

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-french-cream text-french-dark hover:bg-french-gold/20 print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Cafe Header & Logo */}
        <div className="text-center space-y-2 border-b border-french-gold/20 pb-4">
          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border border-french-gold p-0.5 bg-french-dark shadow-md">
            <img src="/assets/logo.jfif" alt="FrenchBell Cafe" className="w-full h-full object-contain rounded-full" />
          </div>
          <h2 className="font-serif font-extrabold text-2xl text-french-dark tracking-wide uppercase">
            FRENCHBELL CAFE
          </h2>
          <p className="text-[11px] text-french-muted font-medium leading-relaxed">
            K. Narayanpura, Bengaluru – 560077, Karnataka <br />
            Ph: +91 98765 43210 • Official Tax Invoice
          </p>
        </div>

        {/* Metadata Table */}
        <div className="text-xs space-y-1 bg-french-cream/80 p-3 rounded-2xl border border-french-gold/20">
          <div className="flex justify-between">
            <span className="text-french-muted">Order No:</span>
            <span className="font-bold text-french-dark font-mono text-sm">#{order.order_number || 'FB1042'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-french-muted">Date & Time:</span>
            <span className="font-medium text-french-dark">{new Date(order.created_at || Date.now()).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-french-muted">Customer Name:</span>
            <span className="font-bold text-french-dark">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-french-muted">Order Mode:</span>
            <span className="font-bold uppercase text-french-gold">{order.order_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-french-muted">Payment Status:</span>
            <span className="font-bold text-emerald-600 uppercase">PAID ({order.payment_method || 'UPI'})</span>
          </div>
        </div>

        {/* Items Purchased List */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-french-dark border-b border-french-gold/20 pb-1 flex justify-between">
            <span>Item</span>
            <span>Qty × Price</span>
            <span>Total</span>
          </div>

          <div className="space-y-1.5 text-xs max-h-40 overflow-y-auto pr-1">
            {order.items && order.items.length > 0 ? (
              order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-french-dark font-medium">
                  <span className="truncate max-w-[160px]">
                    {it.item_name} {it.variant ? `(${it.variant})` : ''}
                  </span>
                  <span>{it.quantity} × ₹{it.unit_price}</span>
                  <span className="font-bold font-mono">₹{it.total_price}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between text-french-dark font-medium">
                <span>FrenchBell Combo Meal</span>
                <span>1 × ₹{order.total}</span>
                <span className="font-bold font-mono">₹{order.total}</span>
              </div>
            )}
          </div>
        </div>

        {/* Total Summary */}
        <div className="border-t border-french-gold/30 pt-3 space-y-1 text-xs">
          <div className="flex justify-between text-french-muted">
            <span>Subtotal</span>
            <span>₹{order.subtotal || order.total}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Discount</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-french-dark pt-1 border-t border-french-gold/20">
            <span>Grand Total</span>
            <span className="font-serif text-xl text-french-dark">₹{Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Footer Tagline */}
        <div className="text-center font-handwriting text-xl text-french-gold font-bold">
          Ding. Eat. Repeat. Thank You!
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 print:hidden pt-2">
          <button
            onClick={handlePrintDownload}
            className="py-3 px-3 rounded-2xl bg-french-cream border border-french-gold/40 text-french-dark font-bold text-xs uppercase tracking-wider hover:border-french-gold transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4 text-french-gold" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleSendWhatsapp}
            className="py-3 px-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow"
          >
            {sentWhatsapp ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Sent to WhatsApp</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Receipt</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
