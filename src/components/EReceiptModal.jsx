import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Download, Printer, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function EReceiptModal({ order, onClose }) {
  const { addNotification } = useApp();

  if (!order) return null;

  const isSimulated =
    order.payment_method &&
    String(order.payment_method).toLowerCase().includes('simulated');

  const handleDownloadPdf = () => {
    window.open(`/api/receipts/${order.order_number}/download`, '_blank');
    addNotification('Receipt Downloaded', 'Digital PDF receipt generated successfully', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const paymentStatusColor =
    order.payment_status === 'successful' || order.payment_status === 'paid'
      ? 'text-emerald-600'
      : order.payment_status === 'failed'
      ? 'text-red-600'
      : 'text-amber-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-french-card border-2 border-french-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 print:border-none print:shadow-none max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-french-cream text-french-dark hover:bg-french-gold/20 print:hidden transition-colors"
            aria-label="Close Receipt"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* TEST/SIMULATED Badge */}
        {isSimulated && (
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-800 text-xs font-extrabold uppercase tracking-wider text-center">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>TEST / SIMULATED PAYMENT — No real money charged</span>
          </div>
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
          {isSimulated && (
            <p className="text-[10px] text-amber-700 font-bold">
              *** DEVELOPMENT / TEST MODE RECEIPT ***
            </p>
          )}
        </div>

        {/* Metadata Table */}
        <div className="text-xs space-y-1.5 bg-french-cream/80 p-3 rounded-2xl border border-french-gold/20">
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
            <span className="font-bold text-french-dark">{order.customer_name || 'Guest'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-french-muted">Order Mode:</span>
            <span className="font-bold uppercase text-french-gold">{order.order_type}</span>
          </div>
          {order.table_number && (
            <div className="flex justify-between">
              <span className="text-french-muted">Table No:</span>
              <span className="font-bold text-french-dark">{order.table_number}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-french-muted">Payment Status:</span>
            <span className={`font-bold uppercase flex items-center gap-1 ${paymentStatusColor}`}>
              {(order.payment_status === 'successful' || order.payment_status === 'paid') && (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              {order.payment_status || 'pending'}
              {isSimulated && ' [SIM]'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-french-muted">Payment Method:</span>
            <span className="font-bold text-french-dark text-right max-w-[160px] truncate">
              {isSimulated
                ? `Simulated — ${(order.payment_method || '').replace('simulated_', '').replace(/_/g, ' ').toUpperCase()}`
                : (order.payment_method || 'Cash').toUpperCase()}
            </span>
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
                  <span>{it.quantity} × ₹{Number(it.unit_price).toFixed(2)}</span>
                  <span className="font-bold font-mono">₹{Number(it.total_price).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between text-french-dark font-medium">
                <span>FrenchBell Order</span>
                <span>1 × ₹{order.total}</span>
                <span className="font-bold font-mono">₹{Number(order.total).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Total Summary */}
        <div className="border-t border-french-gold/30 pt-3 space-y-1 text-xs">
          <div className="flex justify-between text-french-muted">
            <span>Subtotal</span>
            <span>₹{Number(order.subtotal || order.total).toFixed(2)}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
              <span>-₹{Number(order.discount).toFixed(2)}</span>
            </div>
          )}
          {Number(order.tax) > 0 && (
            <div className="flex justify-between text-french-muted">
              <span>GST (5%)</span>
              <span>₹{Number(order.tax).toFixed(2)}</span>
            </div>
          )}
          {Number(order.delivery_charge) > 0 && (
            <div className="flex justify-between text-french-muted">
              <span>Delivery Charge</span>
              <span>₹{Number(order.delivery_charge).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-french-dark pt-1 border-t border-french-gold/20">
            <span>Grand Total</span>
            <span className="font-serif text-xl text-french-dark">₹{Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Simulated Notice */}
        {isSimulated && (
          <div className="text-center text-[10px] text-amber-700 font-bold border border-amber-400/40 rounded-xl p-2 bg-amber-50">
            ⚠ This is a TEST/SIMULATED transaction. No real payment was processed.
            This receipt is for development testing purposes only.
          </div>
        )}

        {/* Footer Tagline */}
        <div className="text-center font-handwriting text-xl text-french-gold font-bold">
          Ding. Eat. Repeat. Thank You!
        </div>

        {/* Action Buttons */}
        <div className="print:hidden pt-1 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-3 rounded-2xl bg-french-cream border border-french-gold/40 text-french-dark font-bold text-xs uppercase tracking-wider hover:border-french-gold transition-all flex items-center justify-center gap-2 shadow"
          >
            <Printer className="w-4 h-4 text-french-gold" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex-1 py-3 px-3 rounded-2xl bg-french-dark text-french-gold font-bold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all flex items-center justify-center gap-2 shadow-lg border border-french-gold/30 hover:border-french-gold group active:scale-[0.99]"
          >
            <Download className="w-4 h-4 text-french-gold group-hover:text-french-dark transition-colors" />
            <span>Download PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}
