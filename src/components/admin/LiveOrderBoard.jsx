import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Clock, CheckCircle2, ChevronRight, Filter, Search, Bell } from 'lucide-react';

export default function LiveOrderBoard() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([
    {
      id: 1,
      order_number: 'FB1040',
      customer_name: 'Priya Sundaram',
      phone: '9876501234',
      order_type: 'delivery',
      order_status: 'received',
      total: 241.20,
      created_at: new Date().toISOString(),
      items: [
        { item_name: 'Zinger Burger', quantity: 2, unit_price: 99 },
        { item_name: 'Peri Peri Fries', quantity: 1, unit_price: 70 }
      ]
    },
    {
      id: 2,
      order_number: 'FB1041',
      customer_name: 'Amit Patel',
      phone: '9811223344',
      order_type: 'dine-in',
      table_number: '04',
      order_status: 'preparing',
      total: 358.00,
      created_at: new Date().toISOString(),
      items: [
        { item_name: 'Cheesy Blaster Loaded', quantity: 1, unit_price: 179 },
        { item_name: 'Fusion Platter', quantity: 1, unit_price: 199 }
      ]
    },
    {
      id: 3,
      order_number: 'FB1042',
      customer_name: 'Sara Khan',
      phone: '9988776655',
      order_type: 'takeaway',
      order_status: 'ready',
      total: 188.00,
      created_at: new Date().toISOString(),
      items: [
        { item_name: 'FB Chicken Roll', quantity: 2, unit_price: 109 }
      ]
    },
    {
      id: 4,
      order_number: 'FB1039',
      customer_name: 'Vikram Singh',
      phone: '9765432109',
      order_type: 'delivery',
      order_status: 'completed',
      total: 398.00,
      created_at: new Date().toISOString(),
      items: [
        { item_name: 'Arabic Platter', quantity: 1, unit_price: 249 }
      ]
    }
  ]);

  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch live orders from backend server
  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setOrders(data); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));

    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order_status: newStatus })
      });
    } catch (e) {}
  };

  const columns = [
    { id: 'received', title: 'New Received 🔔', bg: 'border-amber-500/40 bg-amber-950/10' },
    { id: 'preparing', title: 'Preparing 🍳', bg: 'border-blue-500/40 bg-blue-950/10' },
    { id: 'ready', title: 'Ready / Out 🛵', bg: 'border-emerald-500/40 bg-emerald-950/10' },
    { id: 'completed', title: 'Completed ✅', bg: 'border-gray-500/40 bg-gray-950/10' }
  ];

  const filteredOrders = orders.filter(o => {
    if (typeFilter !== 'all' && o.order_type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.order_number.toLowerCase().includes(q);
      const matchName = o.customer_name.toLowerCase().includes(q);
      const matchPhone = (o.phone || '').includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert for New Order */}
      <div className="p-4 rounded-2xl bg-french-dark text-french-cream border border-french-gold/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-french-gold text-french-dark flex items-center justify-center font-bold text-lg animate-bounce">
            🔔
          </div>
          <div>
            <span className="font-serif font-bold text-base text-french-gold block">
              Live Order Management Kanban Board
            </span>
            <span className="text-xs text-french-cream/80">
              Drag or click action buttons to transition order status in real time.
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-french-gold" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search #FB order or phone"
              className="pl-9 pr-3 py-1.5 rounded-xl bg-french-brown border border-french-gold/30 text-xs text-french-cream focus:outline-none"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-french-brown border border-french-gold/30 text-xs font-bold text-french-gold cursor-pointer"
          >
            <option value="all">All Order Types</option>
            <option value="dine-in">Dine-In</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
      </div>

      {/* 4-Column Live Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {columns.map((col) => {
          const colOrders = filteredOrders.filter(o => o.order_status === col.id || (col.id === 'received' && o.order_status === 'accepted'));

          return (
            <div key={col.id} className={`p-4 rounded-3xl border ${col.bg} flex flex-col justify-between min-h-[500px]`}>
              
              {/* Column Header */}
              <div className="pb-3 border-b border-french-gold/20 flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-french-dark">
                  {col.title}
                </h3>
                <span className="w-6 h-6 rounded-full bg-french-dark text-french-gold font-extrabold text-xs flex items-center justify-center">
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards List */}
              <div className="py-4 space-y-4 flex-1 overflow-y-auto max-h-[600px]">
                {colOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-2xl bg-french-card border border-french-gold/30 shadow-md space-y-3 hover:border-french-gold transition-all"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="font-mono text-french-gold bg-french-dark px-2.5 py-0.5 rounded-md text-sm">
                        #{o.order_number}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-french-gold/20 text-french-warm uppercase text-[10px]">
                        {o.order_type}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-sm text-french-dark">
                        {o.customer_name}
                      </h4>
                      <span className="text-[11px] text-french-muted block font-mono">
                        Ph: +91 {o.phone}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="p-2.5 rounded-xl bg-french-cream/80 text-xs space-y-1">
                      {o.items && o.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-french-dark font-medium">
                          <span>{it.item_name} {it.variant ? `(${it.variant})` : ''}</span>
                          <span className="font-bold">×{it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-french-gold/15">
                      <span className="font-serif font-extrabold text-sm text-french-dark">
                        Total: ₹{Number(o.total).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-french-muted">
                        {new Date(o.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Quick Move Action Buttons */}
                    <div className="pt-2 flex items-center gap-1.5">
                      {col.id === 'received' && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'preparing')}
                          className="w-full py-2 rounded-xl bg-french-dark text-french-gold font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all flex items-center justify-center gap-1"
                        >
                          <span>Start Preparing 🍳</span>
                        </button>
                      )}
                      {col.id === 'preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'ready')}
                          className="w-full py-2 rounded-xl bg-french-dark text-french-gold font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all flex items-center justify-center gap-1"
                        >
                          <span>Mark Ready 🛵</span>
                        </button>
                      )}
                      {col.id === 'ready' && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'completed')}
                          className="w-full py-2 rounded-xl bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-800 transition-all flex items-center justify-center gap-1"
                        >
                          <span>Complete Order ✅</span>
                        </button>
                      )}
                      {col.id === 'completed' && (
                        <span className="text-[11px] font-bold text-emerald-600 block text-center w-full">
                          Order Completed
                        </span>
                      )}
                    </div>

                  </div>
                ))}

                {colOrders.length === 0 && (
                  <div className="py-12 text-center text-xs text-french-muted italic">
                    No orders in {col.title}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
