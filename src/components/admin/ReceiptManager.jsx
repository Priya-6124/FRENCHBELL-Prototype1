import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel, exportToCsv } from '../../utils/excelExport';
import {
  Receipt, Search, Download, Printer, Filter, Eye, Share2,
  Calendar, CheckCircle2, Clock, Phone, User, MapPin, X, FileText,
  CreditCard, ArrowUpRight, DollarSign, Sparkles
} from 'lucide-react';

export default function ReceiptManager() {
  const { settings, addNotification } = useApp();

  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load orders from API and LocalStorage fallback
  const fetchReceipts = () => {
    setLoading(true);
    fetch('/api/orders')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        let combined = Array.isArray(data) ? [...data] : [];
        try {
          const localOrders = JSON.parse(localStorage.getItem('fb_orders') || '[]');
          // Merge local orders that are not already present
          localOrders.forEach(lo => {
            if (!combined.some(o => o.order_number === lo.order_number)) {
              combined.unshift(lo);
            }
          });
        } catch (e) {}

        if (combined.length === 0) {
          // Provide realistic fallback orders if brand new session
          combined = [
            {
              id: 1,
              order_number: 'FB001',
              customer_name: 'Priya Sundaram',
              phone: '9876501234',
              order_type: 'delivery',
              delivery_address: 'Flat 402, Sunshine Apts, K. Narayanpura',
              subtotal: 269,
              discount: 50,
              delivery_charge: 0,
              total: 232,
              payment_method: 'upi_gpay',
              payment_status: 'paid',
              order_status: 'completed',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              items: [
                { item_name: 'Double Zinger Burger', quantity: 1, unit_price: 199, total_price: 199, variant: 'Chicken' },
                { item_name: 'Peri Peri Fries', quantity: 1, unit_price: 70, total_price: 70 }
              ]
            },
            {
              id: 2,
              order_number: 'FB002',
              customer_name: 'Amit Patel',
              phone: '9811223344',
              order_type: 'dine-in',
              table_number: '04',
              subtotal: 378,
              discount: 0,
              delivery_charge: 0,
              total: 397,
              payment_method: 'upi_phonepe',
              payment_status: 'paid',
              order_status: 'preparing',
              created_at: new Date(Date.now() - 7200000).toISOString(),
              items: [
                { item_name: 'Cheesy Blaster Loaded', quantity: 1, unit_price: 179, total_price: 179 },
                { item_name: 'Fusion Platter', quantity: 1, unit_price: 199, total_price: 199 }
              ]
            },
            {
              id: 3,
              order_number: 'FB003',
              customer_name: 'Sara Khan',
              phone: '9988776655',
              order_type: 'takeaway',
              pickup_time: '20 mins',
              subtotal: 218,
              discount: 30,
              delivery_charge: 0,
              total: 197,
              payment_method: 'card',
              payment_status: 'paid',
              order_status: 'ready',
              created_at: new Date(Date.now() - 10800000).toISOString(),
              items: [
                { item_name: 'FB Chicken Roll', quantity: 2, unit_price: 109, total_price: 218 }
              ]
            }
          ];
        }

        setOrders(combined);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (typeFilter !== 'all' && o.order_type !== typeFilter) return false;
    if (statusFilter !== 'all' && o.order_status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = (o.order_number || '').toLowerCase().includes(q);
      const matchName = (o.customer_name || '').toLowerCase().includes(q);
      const matchPhone = (o.phone || '').includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  // Download printable receipt PDF/HTML
  const handleDownloadReceipt = (order) => {
    const url = `/api/receipts/${order.order_number}/download`;
    const win = window.open(url, '_blank');
    if (!win) {
      // Direct client print simulation if popup blocked
      triggerClientPrint(order);
    }
    addNotification('Receipt Ready', `Tax invoice for #${order.order_number} opened for download / print.`, 'success');
  };

  const triggerClientPrint = (order) => {
    const printWindow = window.open('', '_blank', 'width=600,height=750');
    if (!printWindow) return;

    const itemsHtml = (order.items || []).map(it => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0e6d6;">${it.item_name || it.name} ${it.variant ? `(${it.variant})` : ''}</td>
        <td style="text-align: right; padding: 8px 0; border-bottom: 1px solid #f0e6d6;">${it.quantity}</td>
        <td style="text-align: right; padding: 8px 0; border-bottom: 1px solid #f0e6d6;">₹${it.unit_price || it.price}</td>
        <td style="text-align: right; padding: 8px 0; border-bottom: 1px solid #f0e6d6;">₹${it.total_price || (it.price * it.quantity)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - FrenchBell Cafe #${order.order_number}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #faf5ed; color: #1f110a; margin: 0; padding: 24px; }
          .receipt { max-width: 480px; margin: 0 auto; background: #fffdf9; border: 2px solid #d4af37; border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
          .header { text-align: center; border-bottom: 1px solid #d4af37; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-family: serif; color: #1f110a; font-size: 26px; }
          .header p { margin: 4px 0 0; font-size: 12px; color: #6b584e; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; background: #faf5ed; padding: 12px; border-radius: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          th { text-align: left; border-bottom: 1px solid #e0d5c1; padding: 8px 0; color: #6b584e; font-size: 11px; text-transform: uppercase; }
          .totals { border-top: 1px solid #d4af37; padding-top: 12px; font-size: 13px; }
          .totals .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .grand-total { font-size: 18px; font-weight: bold; color: #1f110a; border-top: 1px solid #e0d5c1; padding-top: 8px; margin-top: 8px; }
          .footer-note { text-align: center; margin-top: 24px; font-size: 12px; color: #8b5a2b; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>FrenchBell Cafe</h1>
            <p>${settings.cafe_address || 'K. Narayanpura, Bengaluru – 560077, Karnataka'}</p>
            <p>Phone: ${settings.cafe_phone || '+91 98765 43210'} | GST Invoice</p>
          </div>
          <div class="meta">
            <div>Order ID: <strong>#${order.order_number}</strong></div>
            <div>Order Type: <strong>${(order.order_type || 'Takeaway').toUpperCase()}</strong></div>
            <div>Customer: <strong>${order.customer_name}</strong></div>
            <div>Phone: <strong>+91 ${order.phone}</strong></div>
            <div>Date: <strong>${new Date(order.created_at || Date.now()).toLocaleDateString()}</strong></div>
            <div>Payment: <strong style="color:#10b981;">PAID (${(order.payment_method || 'UPI').toUpperCase()})</strong></div>
          </div>
          <table>
            <thead><tr><th>Item</th><th style="text-align:right;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="totals">
            <div class="row"><span>Subtotal</span><span>₹${order.subtotal || order.total}</span></div>
            ${order.discount > 0 ? `<div class="row" style="color:#10b981;"><span>Discount</span><span>-₹${order.discount}</span></div>` : ''}
            ${order.delivery_charge > 0 ? `<div class="row"><span>Delivery Fee</span><span>₹${order.delivery_charge}</span></div>` : ''}
            <div class="row grand-total"><span>Total Paid</span><span>₹${Number(order.total).toFixed(2)}</span></div>
          </div>
          <div class="footer-note">Good Food, Great Moments. Thank you for dining with FrenchBell Cafe!</div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // WhatsApp Share receipt link to customer
  const handleShareWhatsApp = (order) => {
    const receiptLink = `${window.location.origin}/api/receipts/${order.order_number}/download`;
    const message = encodeURIComponent(
      `Hello ${order.customer_name}! 🍽️\nHere is your official tax receipt for Order #${order.order_number} at FrenchBell Cafe.\nTotal Amount: ₹${order.total}\nView / Download Receipt: ${receiptLink}\n\nThank you for choosing FrenchBell Cafe!`
    );
    window.open(`https://api.whatsapp.com/send?phone=91${order.phone}&text=${message}`, '_blank');
    addNotification('WhatsApp Shared', `Receipt link shared to +91 ${order.phone}`, 'success');
  };

  // Export all receipts / orders to Excel
  const handleExportAllReceipts = () => {
    const columns = [
      { header: 'Order Number', key: 'order_number', width: 120 },
      { header: 'Date & Time', key: 'created_at', width: 150 },
      { header: 'Customer Name', key: 'customer_name', width: 160 },
      { header: 'Phone', key: 'phone', width: 130 },
      { header: 'Order Type', key: 'order_type', width: 110 },
      { header: 'Table #', key: 'table_number', width: 90 },
      { header: 'Items Purchased', key: 'items_summary', width: 220 },
      { header: 'Subtotal (₹)', key: 'subtotal', width: 110, isCurrency: true },
      { header: 'Discount (₹)', key: 'discount', width: 110, isCurrency: true },
      { header: 'Delivery Fee (₹)', key: 'delivery_charge', width: 110, isCurrency: true },
      { header: 'Total Paid (₹)', key: 'total', width: 120, isCurrency: true },
      { header: 'Payment Method', key: 'payment_method', width: 140 },
      { header: 'Order Status', key: 'order_status', width: 120 }
    ];

    const rows = filteredOrders.map(o => {
      const itemsSummary = (o.items || []).map(i => `${i.quantity}x ${i.item_name || i.name}`).join('; ');
      return {
        order_number: o.order_number,
        created_at: new Date(o.created_at || Date.now()).toLocaleString(),
        customer_name: o.customer_name,
        phone: o.phone,
        order_type: (o.order_type || 'takeaway').toUpperCase(),
        table_number: o.table_number || 'N/A',
        items_summary: itemsSummary || 'Standard order items',
        subtotal: o.subtotal || o.total,
        discount: o.discount || 0,
        delivery_charge: o.delivery_charge || 0,
        total: o.total,
        payment_method: (o.payment_method || 'UPI').toUpperCase(),
        order_status: (o.order_status || 'completed').toUpperCase()
      };
    });

    exportToExcel('FrenchBell_Customer_Receipts_Report', 'Receipts Ledger', columns, rows);
    addNotification('Receipts Exported', 'Customer receipts register exported to Excel (.xls)', 'success');
  };

  const totalSalesRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Tax Invoices & Billing Register</span>
          </div>
          <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-french-gold">
            Customer Receipts & Invoices
          </h2>
          <p className="text-xs sm:text-sm text-french-cream/80 mt-1">
            View detailed tax invoices for all customer orders, print/download digital receipts, or export transaction records to Excel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportAllReceipts}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow hover:scale-105 transition-all flex items-center gap-2 gold-glow"
          >
            <Download className="w-4 h-4" />
            <span>Export Invoices to Excel</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-french-card border border-french-gold/30 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-french-muted block">
              Total Invoices
            </span>
            <span className="font-serif font-black text-2xl text-french-dark mt-1 block">
              {filteredOrders.length} Receipts
            </span>
            <span className="text-[11px] text-french-muted font-medium">Logged in billing history</span>
          </div>
          <div className="p-3 rounded-2xl bg-french-gold/15 text-french-gold border border-french-gold/30">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-french-card border border-french-gold/30 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 block">
              Total Billed Revenue
            </span>
            <span className="font-serif font-black text-2xl text-emerald-700 mt-1 block">
              ₹{totalSalesRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-800 font-medium">Paid tax receipts</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-french-card border border-french-gold/30 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-french-muted block">
              Average Invoice Value
            </span>
            <span className="font-serif font-black text-2xl text-french-dark mt-1 block">
              ₹{filteredOrders.length ? Math.round(totalSalesRevenue / filteredOrders.length) : 0}
            </span>
            <span className="text-[11px] text-french-muted font-medium">Per customer ticket</span>
          </div>
          <div className="p-3 rounded-2xl bg-french-gold/15 text-french-gold border border-french-gold/30">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-3xl bg-french-card border border-french-gold/30 shadow-md flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-french-gold" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order # (FB001), Customer Name, or Phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-french-gold/30 bg-french-cream text-xs font-semibold text-french-dark placeholder:text-french-muted focus:outline-none focus:border-french-gold"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-french-muted hover:text-french-dark"
            >
              Clear
            </button>
          )}
        </div>

        {/* Order Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="p-2.5 rounded-2xl border border-french-gold/30 bg-french-cream text-xs font-bold text-french-dark focus:outline-none focus:border-french-gold w-full md:w-auto"
        >
          <option value="all">All Order Types</option>
          <option value="delivery">Delivery</option>
          <option value="takeaway">Takeaway</option>
          <option value="dine-in">Dine-In</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2.5 rounded-2xl border border-french-gold/30 bg-french-cream text-xs font-bold text-french-dark focus:outline-none focus:border-french-gold w-full md:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="ready">Ready</option>
          <option value="preparing">Preparing</option>
          <option value="received">Received</option>
        </select>
      </div>

      {/* Receipts Table */}
      <div className="rounded-3xl bg-french-card border border-french-gold/30 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-french-dark text-french-cream border-b border-french-gold/30">
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px] text-french-gold">Invoice #</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px]">Date & Time</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px]">Customer</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px]">Type</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px]">Items</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px] text-right">Amount</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px] text-center">Payment</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px] text-center">Status</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px] text-center">Receipt Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-french-gold/15 font-medium text-french-dark">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const itemsCount = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);
                  const itemsPreview = (order.items || []).map(i => `${i.quantity}x ${i.item_name || i.name}`).join(', ');

                  return (
                    <tr key={order.order_number || order.id} className="hover:bg-french-gold/10 transition-colors">
                      {/* Order Number */}
                      <td className="p-4">
                        <span className="font-mono font-black text-sm text-french-dark block">
                          #{order.order_number}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-french-muted text-[11px]">
                        {new Date(order.created_at || Date.now()).toLocaleDateString()}<br />
                        <span className="text-[10px] font-mono">{new Date(order.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4">
                        <span className="font-bold text-french-dark block text-xs">
                          {order.customer_name}
                        </span>
                        <span className="text-[10px] font-mono text-french-muted flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-french-gold" />
                          +91 {order.phone}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-french-cream border border-french-gold/30 text-french-dark">
                          {order.order_type}
                          {order.table_number && ` (T-${order.table_number})`}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="p-4 max-w-xs">
                        <span className="text-[11px] font-semibold text-french-dark block truncate" title={itemsPreview}>
                          {itemsPreview || `${itemsCount} item(s)`}
                        </span>
                        <span className="text-[10px] text-french-muted">
                          {itemsCount} item{itemsCount > 1 ? 's' : ''} total
                        </span>
                      </td>

                      {/* Total */}
                      <td className="p-4 text-right font-mono font-black text-sm text-french-dark">
                        ₹{order.total}
                      </td>

                      {/* Payment */}
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {order.payment_status || 'PAID'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-french-brown text-french-cream">
                          {order.order_status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Full Tax Invoice */}
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(order)}
                            className="p-1.5 rounded-lg bg-french-cream border border-french-gold/30 text-french-dark hover:bg-french-gold hover:text-french-dark transition-colors"
                            title="View Tax Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Download / Print */}
                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(order)}
                            className="px-2.5 py-1.5 rounded-xl bg-french-dark text-french-gold hover:bg-french-gold hover:text-french-dark font-extrabold text-[10px] uppercase tracking-wider transition-all shadow-sm flex items-center gap-1"
                            title="Download / Print PDF Receipt"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>

                          {/* Share via WhatsApp */}
                          <button
                            type="button"
                            onClick={() => handleShareWhatsApp(order)}
                            className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                            title="Share receipt via WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-french-muted">
                    <Receipt className="w-10 h-10 text-french-gold mx-auto mb-2 opacity-60" />
                    <p className="font-serif font-bold text-base text-french-dark">No receipts found</p>
                    <p className="text-xs text-french-muted mt-1">Try searching a different order number or customer name.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Invoice Modal Preview */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#FFFDF9] border-2 border-french-gold rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-french-gold/30 pb-4">
              <div>
                <h3 className="font-serif font-black text-2xl text-french-dark">
                  FrenchBell Cafe
                </h3>
                <p className="text-xs text-french-muted mt-0.5">
                  {settings.cafe_address || 'K. Narayanpura, Bengaluru – 560077, Karnataka'}
                </p>
                <p className="text-xs text-french-muted">
                  Phone: {settings.cafe_phone || '+91 98765 43210'} | Tax Invoice
                </p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-full hover:bg-french-cream text-french-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta details */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-french-cream text-xs">
              <div>
                <span className="text-[10px] text-french-muted block uppercase">Invoice Number</span>
                <span className="font-mono font-black text-french-dark text-sm">#{selectedReceipt.order_number}</span>
              </div>
              <div>
                <span className="text-[10px] text-french-muted block uppercase">Order Mode</span>
                <span className="font-bold text-french-dark uppercase">{selectedReceipt.order_type}</span>
              </div>
              <div>
                <span className="text-[10px] text-french-muted block uppercase">Customer</span>
                <span className="font-bold text-french-dark">{selectedReceipt.customer_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-french-muted block uppercase">Phone</span>
                <span className="font-mono font-bold text-french-dark">+91 {selectedReceipt.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-french-muted block uppercase">Date & Time</span>
                <span className="font-medium text-french-dark">{new Date(selectedReceipt.created_at || Date.now()).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-french-muted block uppercase">Payment Status</span>
                <span className="font-black text-emerald-700 uppercase">PAID ({(selectedReceipt.payment_method || 'UPI').toUpperCase()})</span>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-french-muted mb-2">Order Items</h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-french-gold/20 text-french-muted text-[10px] uppercase">
                    <th className="text-left pb-2">Item</th>
                    <th className="text-center pb-2">Qty</th>
                    <th className="text-right pb-2">Price</th>
                    <th className="text-right pb-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-french-gold/10">
                  {(selectedReceipt.items || []).map((it, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-2">
                        <span className="font-bold text-french-dark">{it.item_name || it.name}</span>
                        {it.variant && <span className="text-[10px] text-french-warm block">{it.variant} Variant</span>}
                      </td>
                      <td className="text-center py-2 font-mono">{it.quantity}</td>
                      <td className="text-right py-2 font-mono">₹{it.unit_price || it.price}</td>
                      <td className="text-right py-2 font-mono font-bold">₹{it.total_price || (it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="pt-3 border-t-2 border-french-gold/40 space-y-1.5 text-xs">
              <div className="flex justify-between text-french-muted">
                <span>Subtotal</span>
                <span className="font-mono">₹{selectedReceipt.subtotal || selectedReceipt.total}</span>
              </div>

              {selectedReceipt.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-₹{selectedReceipt.discount}</span>
                </div>
              )}

              {selectedReceipt.delivery_charge > 0 && (
                <div className="flex justify-between text-french-muted">
                  <span>Delivery Fee</span>
                  <span className="font-mono">₹{selectedReceipt.delivery_charge}</span>
                </div>
              )}

              <div className="pt-2 border-t border-french-gold/20 flex justify-between text-base font-serif font-black text-french-dark">
                <span>Total Amount Paid</span>
                <span className="font-mono text-lg">₹{Number(selectedReceipt.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-french-gold/20 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleShareWhatsApp(selectedReceipt)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Send on WhatsApp</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 rounded-xl border border-french-gold/30 text-french-dark hover:bg-french-cream text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(selectedReceipt)}
                  className="px-5 py-2 rounded-xl bg-french-dark text-french-gold hover:bg-french-gold hover:text-french-dark font-black text-xs uppercase tracking-wider transition-all shadow gold-glow flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
