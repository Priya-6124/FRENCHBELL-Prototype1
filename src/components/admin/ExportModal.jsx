import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel, exportToCsv } from '../../utils/excelExport';
import { X, Download, FileSpreadsheet, CheckCircle2, Sparkles, BarChart3 } from 'lucide-react';

export default function ExportModal({ onClose }) {
  const { menuItems, addNotification } = useApp();
  const [reportType, setReportType] = useState('sales'); // 'sales', 'orders', 'products', 'inventory'
  const [timeRange, setTimeRange] = useState('30d');
  const [format, setFormat] = useState('excel'); // 'excel' | 'csv'
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setGenerating(true);

    setTimeout(() => {
      setGenerating(false);

      let columns = [];
      let rows = [];
      let filename = `FrenchBell_${reportType}_Report_${timeRange}`;

      if (reportType === 'sales') {
        columns = [
          { header: 'Date', key: 'date', width: 120 },
          { header: 'Completed Orders', key: 'orders', width: 130 },
          { header: 'Gross Sales (₹)', key: 'gross_sales', width: 130, isCurrency: true },
          { header: 'Discounts Availed (₹)', key: 'discounts', width: 150, isCurrency: true },
          { header: 'Delivery Fees (₹)', key: 'delivery_fees', width: 130, isCurrency: true },
          { header: 'Taxes GST (₹)', key: 'gst', width: 110, isCurrency: true },
          { header: 'Net Cafe Revenue (₹)', key: 'net_revenue', width: 160, isCurrency: true },
          { header: 'Avg Order Value (₹)', key: 'aov', width: 140, isCurrency: true }
        ];

        // 7 days of realistic financial data
        const dates = [
          '2026-10-05', '2026-10-04', '2026-10-03', '2026-10-02', '2026-10-01', '2026-09-30', '2026-09-29'
        ];
        rows = dates.map((d, idx) => {
          const ord = 35 + Math.floor(Math.sin(idx) * 10) + idx * 2;
          const gross = ord * 340;
          const disc = Math.round(gross * 0.08);
          const del = Math.round(ord * 0.4 * 25);
          const gst = Math.round((gross - disc) * 0.05);
          const net = gross - disc + del + gst;
          return {
            date: d,
            orders: ord,
            gross_sales: gross,
            discounts: disc,
            delivery_fees: del,
            gst: gst,
            net_revenue: net,
            aov: Math.round(net / ord)
          };
        });
      } else if (reportType === 'products') {
        columns = [
          { header: 'Dish ID', key: 'id', width: 80 },
          { header: 'Item Name', key: 'name', width: 180 },
          { header: 'Category', key: 'category', width: 130 },
          { header: 'Dietary', key: 'veg_type', width: 90 },
          { header: 'Unit Price (₹)', key: 'price', width: 110, isCurrency: true },
          { header: 'Units Sold (30D)', key: 'units_sold', width: 130 },
          { header: 'Total Revenue (₹)', key: 'revenue', width: 140, isCurrency: true },
          { header: 'Popularity Score', key: 'popular', width: 120 },
          { header: 'Status', key: 'status', width: 110 }
        ];

        rows = (menuItems || []).map((m, idx) => {
          const units = 40 + ((idx * 17 + 23) % 110);
          return {
            id: m.id,
            name: m.name,
            category: m.category_slug || m.category_name || 'Cafe',
            veg_type: (m.veg_type || 'veg').toUpperCase(),
            price: m.price,
            units_sold: units,
            revenue: units * m.price,
            popular: m.popular ? 'High Star' : 'Standard',
            status: m.available !== 0 ? 'AVAILABLE' : 'SOLD OUT'
          };
        });
      } else {
        // Orders & Invoices
        columns = [
          { header: 'Order ID', key: 'order_number', width: 110 },
          { header: 'Customer', key: 'customer', width: 160 },
          { header: 'Type', key: 'type', width: 110 },
          { header: 'Total Paid (₹)', key: 'total', width: 130, isCurrency: true },
          { header: 'Payment Method', key: 'payment', width: 130 },
          { header: 'Kitchen Status', key: 'status', width: 120 }
        ];
        rows = [
          { order_number: 'FB001', customer: 'Priya Sundaram', type: 'DELIVERY', total: 241, payment: 'UPI_GPAY', status: 'COMPLETED' },
          { order_number: 'FB002', customer: 'Amit Patel', type: 'DINE-IN (T-04)', total: 358, payment: 'UPI_PHONEPE', status: 'COMPLETED' },
          { order_number: 'FB003', customer: 'Sara Khan', type: 'TAKEAWAY', total: 188, payment: 'CARD', status: 'COMPLETED' },
          { order_number: 'FB004', customer: 'Vikram Singh', type: 'DELIVERY', total: 398, payment: 'UPI_PAYTM', status: 'COMPLETED' },
          { order_number: 'FB005', customer: 'Deepak Rao', type: 'DELIVERY', total: 320, payment: 'UPI', status: 'COMPLETED' }
        ];
      }

      if (format === 'excel') {
        exportToExcel(filename, reportType.toUpperCase(), columns, rows);
      } else {
        exportToCsv(filename, columns, rows);
      }

      addNotification('Report Exported', `${reportType.toUpperCase()} report generated & downloaded as ${format === 'excel' ? 'Excel (.xls)' : 'CSV'}!`, 'success');
      if (onClose) onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-french-card border border-french-gold/40 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-french-gold/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-french-gold/20 text-french-gold flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5 text-french-gold" />
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-xl text-french-dark">
                Export Operations Report
              </h3>
              <p className="text-xs text-french-muted">Generate genuine Excel (.xls) or CSV spreadsheet data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-french-cream text-french-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerateReport} className="space-y-4 text-xs font-bold text-french-dark">
          
          {/* Report Type */}
          <div>
            <label className="block mb-1.5 uppercase tracking-wider text-french-muted">1. Select Report Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'sales', label: 'Sales & Revenue Ledger' },
                { id: 'products', label: 'Dish & Menu Performance' },
                { id: 'orders', label: 'Customer Order Invoices' }
              ].map((rt) => (
                <button
                  type="button"
                  key={rt.id}
                  onClick={() => setReportType(rt.id)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    reportType === rt.id
                      ? 'bg-french-dark text-french-gold border-french-gold shadow gold-glow font-black'
                      : 'bg-french-cream/60 border-french-gold/20 text-french-dark hover:border-french-gold'
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div>
            <label className="block mb-1.5 uppercase tracking-wider text-french-muted">2. Date Range *</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full p-2.5 rounded-2xl border border-french-gold/30 bg-french-cream text-xs font-semibold focus:outline-none focus:border-french-gold"
            >
              <option value="today">Today's Shift</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Current Quarter (90 Days)</option>
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block mb-1.5 uppercase tracking-wider text-french-muted">3. File Format *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 ${
                  format === 'excel'
                    ? 'bg-french-dark text-french-gold border-french-gold shadow font-black'
                    : 'bg-french-cream/60 border-french-gold/20 text-french-dark'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excel (.xls/.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 ${
                  format === 'csv'
                    ? 'bg-french-dark text-french-gold border-french-gold shadow font-black'
                    : 'bg-french-cream/60 border-french-gold/20 text-french-dark'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-french-gold" />
                <span>CSV (UTF-8 BOM)</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-french-gold/30 text-xs font-bold text-french-dark hover:bg-french-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="px-6 py-2.5 rounded-xl bg-french-dark text-french-gold hover:bg-french-gold hover:text-french-dark font-black text-xs uppercase tracking-wider transition-all shadow gold-glow flex items-center gap-2"
            >
              {generating ? (
                <span>Generating Spreadsheet...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download {format === 'excel' ? 'Excel File' : 'CSV File'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
