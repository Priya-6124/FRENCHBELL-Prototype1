import React, { useState } from 'react';
import { QrCode, Download, ExternalLink, Printer, Sparkles, CheckCircle, Utensils } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TableQRManager() {
  const { addNotification } = useApp();
  const [selectedTable, setSelectedTable] = useState('01');
  const [tableCount, setTableCount] = useState(12);

  const tables = Array.from({ length: tableCount }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      tableNumber: num,
      name: `Table #${num}`,
      capacity: i < 4 ? 2 : (i < 8 ? 4 : 6),
      url: `${window.location.origin}/?table=${num}&mode=dine-in`
    };
  });

  const activeTableData = tables.find(t => t.tableNumber === selectedTable) || tables[0];

  // Client-side QR standee canvas generator for instant high-res PNG download
  const handleDownloadStandee = (tableNum) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Background gradient (Dark French Bell theme)
    const gradient = ctx.createLinearGradient(0, 0, 0, 800);
    gradient.addColorStop(0, '#1A0F0A');
    gradient.addColorStop(0.5, '#2B150A');
    gradient.addColorStop(1, '#120804');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    // Golden border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 560, 760);

    // Inner gold accent frame
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 540, 740);

    // Cafe Brand Name
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('FRENCH BELL CAFE', 300, 90);

    ctx.fillStyle = 'rgba(255, 248, 220, 0.8)';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('GOURMET CAFE & QUICK BITES • BENGALURU', 300, 120);

    // Table Badge
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.roundRect(175, 150, 250, 60, 20);
    ctx.fill();

    ctx.fillStyle = '#1A0F0A';
    ctx.font = '900 28px sans-serif';
    ctx.fillText(`TABLE #${tableNum}`, 300, 192);

    // QR Code Frame (White background box)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(125, 240, 350, 350, 24);
    ctx.fill();

    // Draw stylized QR graphic simulation
    ctx.fillStyle = '#1A0F0A';
    ctx.fillRect(160, 275, 70, 70);
    ctx.fillRect(370, 275, 70, 70);
    ctx.fillRect(160, 485, 70, 70);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(175, 290, 40, 40);
    ctx.fillRect(385, 290, 40, 40);
    ctx.fillRect(175, 500, 40, 40);

    ctx.fillStyle = '#1A0F0A';
    ctx.fillRect(185, 300, 20, 20);
    ctx.fillRect(395, 300, 20, 20);
    ctx.fillRect(185, 510, 20, 20);

    // Center Bell Icon in QR
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(300, 415, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1A0F0A';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('🔔', 300, 424);

    // Text Instructions
    ctx.fillStyle = '#FFF8DC';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('Scan to View Menu & Order', 300, 640);

    ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
    ctx.font = '14px sans-serif';
    ctx.fillText('No waiting for waiter • Direct Kitchen Dispatch', 300, 675);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '11px monospace';
    ctx.fillText(`frenchbellcafe.com/?table=${tableNum}&mode=dine-in`, 300, 720);

    // Trigger Download
    const link = document.createElement('a');
    link.download = `FrenchBell_Table_${tableNum}_Standee.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    addNotification('QR Standee Downloaded 📥', `Table #${tableNum} QR standee saved to your device!`, 'success');
  };

  const handleTestDineIn = (tableNum) => {
    window.open(`/?table=${tableNum}&mode=dine-in`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-french-dark p-6 rounded-3xl text-french-cream border border-french-gold/20 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <QrCode className="w-4 h-4" />
            <span>Table Operations & QR Standees</span>
          </div>
          <h2 className="font-serif font-extrabold text-2xl text-french-cream">
            Dine-In Table QR Generator
          </h2>
          <p className="text-xs text-french-cream/80 mt-1 max-w-xl">
            Generate and download print-ready QR codes for cafe tables. Customers scan the QR at their table to order directly without waiting for a waiter.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDownloadStandee(selectedTable)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow hover:scale-105 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Table #{selectedTable} Standee</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Tables Selector + Standee Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Table List */}
        <div className="lg:col-span-7 bg-french-card p-6 rounded-3xl border border-french-gold/25 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-french-dark">
              Active Tables in Cafe ({tables.length})
            </h3>
            <span className="text-xs font-bold text-french-gold bg-french-dark px-3 py-1 rounded-full">
              K. Narayanpura Branch
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tables.map((table) => {
              const isSelected = selectedTable === table.tableNumber;
              return (
                <div
                  key={table.tableNumber}
                  onClick={() => setSelectedTable(table.tableNumber)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-french-dark text-french-cream border-french-gold shadow-lg scale-102'
                      : 'bg-french-cream/60 border-french-gold/20 text-french-dark hover:border-french-gold'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif font-extrabold text-lg">
                      {table.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-french-gold text-french-dark' : 'bg-french-gold/20 text-french-dark'
                    }`}>
                      {table.capacity} Seater
                    </span>
                  </div>

                  <p className="text-[11px] opacity-75 font-mono truncate mb-3">
                    ?table={table.tableNumber}&mode=dine-in
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-french-gold/20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadStandee(table.tableNumber);
                      }}
                      className="flex-1 py-1 px-2 rounded-lg bg-french-gold/20 hover:bg-french-gold hover:text-french-dark text-french-gold font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestDineIn(table.tableNumber);
                      }}
                      className="p-1 rounded-lg bg-french-brown/50 hover:bg-french-brown text-french-gold transition-colors"
                      title="Test Customer Table View"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 cols: Live Standee Visualizer */}
        <div className="lg:col-span-5 bg-french-dark p-6 rounded-3xl border border-french-gold/40 shadow-2xl text-center space-y-4 flex flex-col items-center justify-between">
          <div className="w-full">
            <span className="text-xs font-bold uppercase tracking-widest text-french-gold block mb-1">
              Live Standee Card Preview
            </span>
            <h4 className="font-serif font-bold text-lg text-french-cream">
              Physical Acrylic Standee #{selectedTable}
            </h4>
          </div>

          {/* Standee Mock Card */}
          <div className="w-full max-w-xs bg-gradient-to-b from-[#1A0F0A] via-[#24130A] to-[#120804] border-4 border-french-gold rounded-3xl p-6 shadow-2xl text-french-cream relative space-y-4 gold-border-glow">
            
            {/* Logo */}
            <div className="w-14 h-14 rounded-full mx-auto p-0.5 border border-french-gold bg-french-dark flex items-center justify-center">
              <img src="/assets/logo.jfif" alt="Logo" className="w-full h-full object-contain rounded-full" />
            </div>

            <div>
              <h5 className="font-serif font-extrabold text-lg text-french-gold">
                FRENCH BELL CAFE
              </h5>
              <span className="text-[9px] uppercase tracking-widest text-french-cream/70 font-bold block">
                TABLE SELF-ORDERING
              </span>
            </div>

            {/* Table Number Pill */}
            <div className="py-1 px-4 rounded-full bg-french-gold text-french-dark font-black text-sm tracking-wider inline-block">
              TABLE #{selectedTable}
            </div>

            {/* White QR Box */}
            <div className="bg-white p-4 rounded-2xl shadow-inner mx-auto w-44 h-44 flex flex-col items-center justify-center relative border border-french-gold/40">
              <QrCode className="w-36 h-36 text-french-dark" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xl bg-french-gold text-french-dark p-1 rounded-full shadow">🔔</span>
              </div>
            </div>

            <div>
              <p className="font-serif font-bold text-sm text-french-gold">
                Scan with Phone Camera 📱
              </p>
              <p className="text-[10px] text-french-cream/70 mt-0.5">
                Browse menu & pay right from your seat.
              </p>
            </div>
          </div>

          <div className="w-full flex gap-3">
            <button
              onClick={() => handleDownloadStandee(selectedTable)}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2 gold-glow"
            >
              <Printer className="w-4 h-4" />
              <span>Download & Print Standee</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
