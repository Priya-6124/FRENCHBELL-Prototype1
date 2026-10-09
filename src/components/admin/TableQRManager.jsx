import React, { useState, useEffect } from 'react';
import {
  QrCode, Download, ExternalLink, Printer, Sparkles, CheckCircle,
  Utensils, Bell, Camera, Plus, Trash2, Clock, Users, ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function TableQRManager({ initialTab = 'tables' }) {
  const { addNotification } = useApp();
  const { token } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState(
    initialTab === 'qr' ? 'qr' : initialTab === 'orders' ? 'orders' : 'tables'
  );
  const [selectedTable, setSelectedTable] = useState('01');
  const [tablesList, setTablesList] = useState([]);
  const [dineInOrders, setDineInOrders] = useState([]);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');

  useEffect(() => {
    if (initialTab === 'qr') setActiveSubTab('qr');
    else if (initialTab === 'orders') setActiveSubTab('orders');
    else if (initialTab === 'tables') setActiveSubTab('tables');
  }, [initialTab]);

  // Fetch tables and live dine-in orders
  const loadData = async () => {
    try {
      const resTables = await fetch('/api/tables');
      if (resTables.ok) {
        const data = await resTables.json();
        if (Array.isArray(data)) setTablesList(data);
      }

      const resOrders = await fetch('/api/orders');
      if (resOrders.ok) {
        const orders = await resOrders.json();
        if (Array.isArray(orders)) {
          setDineInOrders(orders.filter(o => o.order_type === 'dine-in'));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fallback tables if API returns empty
  const displayTables = tablesList.length > 0 ? tablesList : Array.from({ length: 12 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      id: i + 1,
      table_number: num,
      name: `Table #${num}`,
      capacity: i < 4 ? 2 : (i < 8 ? 4 : 6),
      status: i === 1 || i === 3 ? 'occupied' : 'vacant',
      qr_url: `${window.location.origin}/?table=${num}&mode=dine-in`
    };
  });

  const handleToggleTableStatus = (tableNum, currentStatus) => {
    const nextStatus = currentStatus === 'vacant' ? 'occupied' : currentStatus === 'occupied' ? 'reserved' : 'vacant';
    setTablesList(prev => prev.map(t => t.table_number === tableNum ? { ...t, status: nextStatus } : t));
    addNotification('Table Status', `Table #${tableNum} marked as ${nextStatus.toUpperCase()}`, 'info');
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNum) return;
    const cleanNum = String(newTableNum).padStart(2, '0');

    const newObj = {
      id: Date.now(),
      table_number: cleanNum,
      name: `Table #${cleanNum}`,
      capacity: Number(newTableCapacity) || 4,
      status: 'vacant',
      qr_url: `${window.location.origin}/?table=${cleanNum}&mode=dine-in`
    };

    setTablesList(prev => [...prev, newObj]);
    addNotification('Table Added', `Table #${cleanNum} created with QR endpoint!`, 'success');

    try {
      await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newObj)
      });
    } catch (e) {}

    setShowAddTableModal(false);
    setNewTableNum('');
  };

  // High-res Standee canvas generator
  const handleDownloadStandee = (tableNum) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Background gradient
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

    // Inner gold frame
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 540, 740);

    // Cafe Brand Name
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('FRENCHBELL CAFE', 300, 90);

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

    // QR White Box
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(125, 240, 350, 350, 24);
    ctx.fill();

    // Stylized QR pattern simulation
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

    // Center Bell Badge
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(300, 415, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1A0F0A';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText('FB', 300, 422);

    // Instructions
    ctx.fillStyle = '#FFF8DC';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('Scan to View Menu & Order', 300, 640);

    ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
    ctx.font = '14px sans-serif';
    ctx.fillText('Direct Kitchen Dispatch • Instant Digital Billing', 300, 675);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '11px monospace';
    ctx.fillText(`frenchbellcafe.com/?table=${tableNum}&mode=dine-in`, 300, 720);

    const link = document.createElement('a');
    link.download = `FrenchBell_Table_${tableNum}_Standee.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    addNotification('Standee Downloaded', `Table #${tableNum} QR standee saved!`, 'success');
  };

  const handleTestDineIn = (tableNum) => {
    window.open(`/?table=${tableNum}&mode=dine-in`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-french-dark p-6 rounded-3xl text-french-cream border border-french-gold/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <QrCode className="w-4 h-4" />
            <span>Dine-In Management</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-french-cream">
            TABLES & QR OPERATIONS
          </h2>
          <p className="text-xs text-french-cream/80 mt-1 max-w-xl">
            Manage dining tables, print individual QR standees, and monitor incoming dine-in kitchen tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTableModal(true)}
            className="px-4 py-2.5 rounded-full bg-french-brown/80 border border-french-gold/30 text-french-gold hover:bg-french-gold hover:text-french-dark text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
          <button
            onClick={() => handleDownloadStandee(selectedTable)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-black text-xs uppercase tracking-wider shadow hover:scale-105 transition-all flex items-center gap-2 gold-glow"
          >
            <Download className="w-4 h-4" />
            <span>Print Standee #{selectedTable}</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Tables | QR Codes | Dine-In Orders */}
      <div className="flex items-center gap-2 border-b border-french-gold/20 pb-3">
        {[
          { id: 'tables', label: 'Tables' },
          { id: 'qr', label: 'QR Codes' },
          { id: 'orders', label: `Dine-In Orders (${dineInOrders.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeSubTab === tab.id
                ? 'bg-french-gold text-french-dark shadow gold-glow'
                : 'bg-french-card text-french-dark/80 hover:bg-french-cream border border-french-gold/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TABLES MANAGEMENT */}
      {activeSubTab === 'tables' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayTables.map((table) => {
              const isSelected = selectedTable === table.table_number;
              const status = table.status || 'vacant';

              return (
                <div
                  key={table.table_number}
                  onClick={() => setSelectedTable(table.table_number)}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                    isSelected
                      ? 'border-french-gold bg-french-cream shadow-md ring-2 ring-french-gold/30'
                      : 'border-french-gold/20 bg-white hover:border-french-gold/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-black text-lg text-french-dark">
                      Table #{table.table_number}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-french-cream border border-french-gold/30 text-french-dark">
                      {table.capacity || 4} Seater
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-french-muted font-bold text-[11px]">Table Status:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTableStatus(table.table_number, status);
                      }}
                      className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] tracking-wider transition-all ${
                        status === 'occupied' ? 'bg-red-100 text-red-700 border border-red-300' :
                        status === 'reserved' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {status}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-french-gold/15 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadStandee(table.table_number);
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-french-dark text-french-gold font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-french-gold hover:text-french-dark transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>Standee</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestDineIn(table.table_number);
                      }}
                      className="p-1.5 rounded-xl bg-french-cream border border-french-gold/30 text-french-dark hover:bg-french-gold transition-colors"
                      title="Test Menu as Customer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: QR CODES VISUALIZER & PRINTING */}
      {activeSubTab === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-french-gold/25 shadow-sm space-y-4">
            <h3 className="font-serif font-black text-lg text-french-dark">
              Select Table for Acrylic Standee Generation
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {displayTables.map(t => (
                <button
                  key={t.table_number}
                  onClick={() => setSelectedTable(t.table_number)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selectedTable === t.table_number
                      ? 'bg-french-dark text-french-gold border-french-gold font-black shadow'
                      : 'bg-french-cream/50 text-french-dark border-french-gold/20 hover:border-french-gold font-bold'
                  }`}
                >
                  <span className="block text-sm font-serif">#{t.table_number}</span>
                  <span className="text-[10px] opacity-75">{t.capacity || 4} Guests</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-french-dark p-6 rounded-3xl border border-french-gold/40 shadow-2xl text-center space-y-4 flex flex-col items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-french-gold block mb-1">
                Print Standee Preview
              </span>
              <h4 className="font-serif font-bold text-lg text-french-cream">
                Acrylic Standee #{selectedTable}
              </h4>
            </div>

            <div className="w-full max-w-xs bg-gradient-to-b from-[#1A0F0A] via-[#24130A] to-[#120804] border-4 border-french-gold rounded-3xl p-6 shadow-2xl text-french-cream space-y-4">
              <div className="w-14 h-14 rounded-full mx-auto p-0.5 border border-french-gold bg-french-dark flex items-center justify-center">
                <img src="/assets/logo.jfif" alt="Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <h5 className="font-serif font-black text-lg text-french-gold">
                FRENCHBELL CAFE
              </h5>
              <div className="py-1 px-4 rounded-full bg-french-gold text-french-dark font-black text-sm tracking-wider inline-block">
                TABLE #{selectedTable}
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-inner mx-auto w-40 h-40 flex flex-col items-center justify-center border border-french-gold/40">
                <QrCode className="w-32 h-32 text-french-dark" />
              </div>
              <p className="text-xs text-french-gold font-serif font-bold">
                Scan with Phone Camera to Order
              </p>
            </div>

            <button
              onClick={() => handleDownloadStandee(selectedTable)}
              className="w-full py-3 rounded-2xl bg-french-gold text-french-dark font-black text-xs uppercase tracking-wider shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2 gold-glow"
            >
              <Printer className="w-4 h-4" />
              <span>Download High-Res Standee PNG</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DINE-IN ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="bg-white border border-french-gold/25 rounded-3xl overflow-hidden shadow-md">
          {dineInOrders.length === 0 ? (
            <div className="p-10 text-center text-french-muted text-xs">
              No active Dine-In orders right now. When customers scan Table QR codes and place orders, they appear here.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[10px]">
                <tr>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Table</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
                {dineInOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-french-cream/50">
                    <td className="p-3.5 font-mono font-bold text-french-gold">#{ord.order_number}</td>
                    <td className="p-3.5 font-bold text-purple-900">Table #{ord.table_number || '01'}</td>
                    <td className="p-3.5 font-serif font-bold">{ord.customer_name}</td>
                    <td className="p-3.5">{Array.isArray(ord.items) ? ord.items.map(i => `${i.quantity}x ${i.item_name || i.name}`).join(', ') : '-'}</td>
                    <td className="p-3.5 font-serif font-black text-sm">₹{ord.total}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-french-cream border border-french-gold/30">
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[10px] text-french-muted">
                      {ord.created_at ? new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-french-card border-2 border-french-gold/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-black text-lg text-french-dark">Add New Cafe Table</h3>
            <form onSubmit={handleAddTable} className="space-y-3 text-xs font-bold text-french-dark">
              <div>
                <label className="block mb-1 uppercase">Table Number (e.g. 13, 14)</label>
                <input
                  type="number"
                  required
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  placeholder="13"
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream font-mono"
                />
              </div>
              <div>
                <label className="block mb-1 uppercase">Seating Capacity</label>
                <select
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream"
                >
                  <option value="2">2 Seater</option>
                  <option value="4">4 Seater</option>
                  <option value="6">6 Seater</option>
                  <option value="8">8 Seater</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  className="px-4 py-2 rounded-xl border border-french-gold/30 hover:bg-french-brown/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-french-gold text-french-dark font-black uppercase"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
