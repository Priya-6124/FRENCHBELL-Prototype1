import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Download, FileSpreadsheet, FileText, CheckCircle2, Sparkles, BarChart3 } from 'lucide-react';

export default function ExportModal({ onClose }) {
  const { addNotification } = useApp();
  const [reportType, setReportType] = useState('sales'); // 'sales', 'orders', 'products', 'customers'
  const [timeRange, setTimeRange] = useState('30d');
  const [format, setFormat] = useState('csv'); // 'csv', 'excel', 'pdf'
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setGenerating(true);

    setTimeout(() => {
      setGenerating(false);

      // Create CSV Blob trigger download
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Date,Orders,Revenue,Discounts,DeliveryCharges,NetRevenue\n"
        + "2026-08-27,42,14890,1200,0,13690\n"
        + "2026-08-26,38,12450,850,0,11600\n"
        + "2026-08-25,45,16200,1400,0,14800\n";
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `FrenchBell_${reportType}_Report_${timeRange}.${format === 'excel' ? 'xlsx' : (format === 'pdf' ? 'pdf' : 'csv')}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addNotification('Report Exported', `${reportType.toUpperCase()} report generated & downloaded!`, 'success');
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-french-card border border-french-gold/30 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-french-gold/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-french-gold/20 text-french-gold flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5 text-french-gold" />
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-xl text-french-dark">
                Export Operations Report
              </h3>
              <p className="text-xs text-french-muted">Generate CSV, Excel or PDF analytics export</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-french-cream">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerateReport} className="space-y-4 text-xs font-bold text-french-dark">
          
          {/* Report Type */}
          <div>
            <label className="block mb-1.5 uppercase tracking-wider">1. Select Report Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'sales', label: 'Sales & Revenue' },
                { id: 'orders', label: 'Order History' },
                { id: 'products', label: 'Product Performance' },
                { id: 'customers', label: 'Customer Stats' }
              ].map((rt) => (
                <button
                  type="button"
                  key={rt.id}
                  onClick={() => setReportType(rt.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    reportType === rt.id
                      ? 'bg-french-dark text-french-gold border-french-gold shadow'
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
            <label className="block mb-1.5 uppercase tracking-wider">2. Date Range *</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 font-semibold"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="3m">Last 3 Months</option>
              <option value="1y">Last 1 Year</option>
            </select>
          </div>

          {/* Export Format */}
          <div>
            <label className="block mb-1.5 uppercase tracking-wider">3. Export Format *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'csv', label: 'CSV File', icon: FileText },
                { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
                { id: 'pdf', label: 'PDF Document', icon: Download }
              ].map((fmt) => (
                <button
                  type="button"
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    format === fmt.id
                      ? 'bg-french-gold text-french-dark border-french-gold shadow'
                      : 'bg-french-cream/60 border-french-gold/20 text-french-dark hover:border-french-gold'
                  }`}
                >
                  <span className="text-xs font-bold">{fmt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={generating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 gold-glow"
          >
            {generating ? (
              <span>Generating Report...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate & Download Report</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
