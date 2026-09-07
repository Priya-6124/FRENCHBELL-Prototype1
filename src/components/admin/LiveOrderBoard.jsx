import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Clock, CheckCircle2, ChevronRight, Filter, Search, Bell, Utensils, Bike, QrCode, MapPin, RefreshCw, ArrowRight, Check } from 'lucide-react';

export default function LiveOrderBoard() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([
    {
      id: 1,
      order_number: 'FB001',
      customer_name: 'Priya Sundaram',
      phone: '9876501234',
      order_type: 'delivery',
      order_status: 'received',
      total: 241,
      created_at: new Date().toISOString(),
      items: [
        { item_name: 'Zinger Burger', quantity: 2, unit_price: 99, variant: 'Chicken', size: 'Regular' },
        { item_name: 'Peri Peri Fries', quantity: 1, unit_price: 70, size: 'Regular' }
      ]
    },
    {
      id: 2,
      order_number: 'FB002',
      customer_name: 'Amit Patel',
      phone: '9811223344',
      order_type: 'dine-in',
      table_number: '04',
      order_status: 'preparing',
      total: 358,
      created_at: new Date().toISOString(),
      items: [
        { item_name: 'Cheesy Blaster Loaded', quantity: 1, unit_price: 179, size: 'Large', spiceLevel: 'Fiery' },
        { item_name: 'Fusion Platter', quantity: 1, unit_price: 199, size: 'Regular' }
      ]
    },
    {
      id: 3,
      order_number: 'FB003',
      customer_name: 'Sara Khan',
      phone: '9988776655',
      order_type: 'takeaway',
      order_status: 'ready',
      total: 188,
      created_at: new Date().toISOString(),
      items: [
        { item_name: 'FB Chicken Roll', quantity: 2, unit_price: 109, size: 'Regular' }
      ]
    },
    {
      id: 4,
      order_number: 'FB004',
      customer_name: 'Vikram Singh',
      phone: '9765432109',
      order_type: 'delivery',
      order_status: 'completed',
      total: 398,
      created_at: new Date().toISOString(),
      items: [
        { item_name: 'Arabic Platter', quantity: 1, unit_price: 249, size: 'Regular' }
      ]
    }
  ]);

  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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
    const interval = setInterval(fetchOrders, 8000);
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

  const filteredOrders = orders.filter(o => {
    if (typeFilter !== 'all' && o.order_type !== typeFilter) return false;
    if (statusFilter !== 'all' && o.order_status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = (o.order_number || '').toLowerCase().includes(q);
      const matchCust = (o.customer_name || '').toLowerCase().includes(q);
      const matchPhone = (o.phone || '').includes(q);
      const matchTable = String(o.table_number || '').includes(q);
      if (!matchNum && !matchCust && !matchPhone && !matchTable) return false;
    }
    return true;
  });

  const columns = [
    { id: 'received', label: '1. Received / New', color: 'border-amber-500/60 bg-amber-500/5', badge: 'bg-amber-500 text-french-dark' },
    { id: 'preparing', label: '2. In Kitchen (Cooking)', color: 'border-blue-500/60 bg-blue-500/5', badge: 'bg-blue-600 text-white' },
    { id: 'ready', label: '3. Ready to Serve / Dispatch', color: 'border-purple-500/60 bg-purple-500/5', badge: 'bg-purple-600 text-white' },
    { id: 'completed', label: '4. Completed / Served', color: 'border-emerald-500/60 bg-emerald-500/5', badge: 'bg-emerald-600 text-white' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header Controls */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Kitchen Display System (KDS) & POS Board</span>
          </div>
          <h2 className="font-serif font-extrabold text-2xl text-french-cream">
            Live Order Kanban Board
          </h2>
          <p className="text-xs text-french-cream/80 mt-1">
            Real-time pipeline tracking orders from customer QR/app to kitchen and table service.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Type */}
          <div className="flex items-center bg-french-brown/80 rounded-2xl p-1 border border-french-gold/30 text-xs">
            {['all', 'dine-in', 'takeaway', 'delivery'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  typeFilter === type ? 'bg-french-gold text-french-dark shadow' : 'text-french-cream/80 hover:text-french-gold'
                }`}
              >
                {type === 'all' && <span>All Types</span>}
                {type === 'dine-in' && <><Utensils className="w-3.5 h-3.5" /><span>Dine-In</span></>}
                {type === 'takeaway' && <><ShoppingBag className="w-3.5 h-3.5" /><span>Takeaway</span></>}
                {type === 'delivery' && <><Bike className="w-3.5 h-3.5" /><span>Delivery</span></>}
              </button>
            ))}
          </div>

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-2xl bg-french-gold/20 text-french-gold border border-french-gold/30 hover:bg-french-gold hover:text-french-dark transition-all text-xs font-bold flex items-center gap-1.5"
            title="Refresh Orders"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columns.map(col => {
          const colOrders = filteredOrders.filter(o => o.order_status === col.id);

          return (
            <div key={col.id} className={`rounded-3xl border-2 ${col.color} p-4 flex flex-col justify-between shadow-sm space-y-4 min-h-[500px]`}>
              
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-french-gold/15 pb-2">
                <span className="font-serif font-extrabold text-sm text-french-dark">
                  {col.label}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold shadow ${col.badge}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards in this Column */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {colOrders.length > 0 ? (
                  colOrders.map(order => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-french-card border border-french-gold/30 shadow-md space-y-3 hover:border-french-gold transition-all"
                    >
                      {/* Top Order Number & Type Badge */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-base text-french-gold bg-french-dark px-2.5 py-0.5 rounded-lg">
                          #{order.order_number}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${
                          order.order_type === 'dine-in'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : (order.order_type === 'takeaway' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900')
                        }`}>
                          {order.order_type === 'dine-in' ? (
                            <>
                              <Utensils className="w-3 h-3" />
                              <span>Table #{order.table_number || '04'}</span>
                            </>
                          ) : order.order_type === 'takeaway' ? (
                            <>
                              <ShoppingBag className="w-3 h-3" />
                              <span>Takeaway</span>
                            </>
                          ) : (
                            <>
                              <Bike className="w-3 h-3" />
                              <span>Delivery</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <div className="font-bold text-xs text-french-dark">{order.customer_name}</div>
                        <div className="text-[11px] text-french-muted font-mono">{order.phone}</div>
                        {order.delivery_address && (
                          <div className="text-[10px] text-french-muted truncate mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0 text-french-gold" />
                            <span>{order.delivery_address}</span>
                          </div>
                        )}
                      </div>

                      {/* Items Breakdown */}
                      <div className="p-2.5 rounded-xl bg-french-cream/60 border border-french-gold/20 space-y-1 text-xs">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-[11px] text-french-dark">
                            <div className="flex-1 pr-1 font-medium">
                              <strong>{item.quantity}x</strong> {item.item_name}
                              {item.size && <span className="text-[10px] text-french-muted block">({item.size}{item.variant ? ` • ${item.variant}` : ''})</span>}
                            </div>
                            <span className="font-mono font-bold">₹{item.total_price || (item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                        {order.special_instructions && (
                          <div className="text-[10px] font-semibold text-amber-800 bg-amber-50 p-1 rounded mt-1 border border-amber-200">
                            Note: {order.special_instructions}
                          </div>
                        )}
                      </div>

                      {/* Total & Action Status Buttons */}
                      <div className="pt-2 border-t border-french-gold/20 flex items-center justify-between gap-2">
                        <span className="font-serif font-black text-sm text-french-dark">
                          ₹{order.total}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {col.id === 'received' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'preparing')}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1"
                            >
                              <span>Start Cooking</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {col.id === 'preparing' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'ready')}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1"
                            >
                              <span>Mark Ready</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {col.id === 'ready' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1"
                            >
                              <span>Complete</span>
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-french-muted font-medium">
                    No orders in this stage
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
