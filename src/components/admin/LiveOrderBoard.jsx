import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import OrderDetailDrawer from './OrderDetailDrawer';
import {
  ShoppingBag, Clock, CheckCircle2, ChevronRight, Filter, Search,
  Bell, Utensils, Bike, QrCode, MapPin, RefreshCw, ArrowRight,
  Check, XCircle, Eye, AlertCircle, LayoutGrid, ListFilter
} from 'lucide-react';

export default function LiveOrderBoard({ initialStatus = 'all', initialFilterType = 'all' }) {
  const { token } = useAuth();
  const { addNotification } = useApp();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState(initialFilterType || 'all'); // 'all' | 'dine-in' | 'takeaway' | 'delivery'
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'

  // Update statusFilter when prop changes
  useEffect(() => {
    if (initialStatus) {
      // Map sidebar subtab names to internal statuses if needed
      if (initialStatus === 'orders-new') setStatusFilter('received');
      else if (initialStatus === 'orders-preparing') setStatusFilter('preparing');
      else if (initialStatus === 'orders-ready') setStatusFilter('ready');
      else if (initialStatus === 'orders-out_for_delivery') setStatusFilter('out_for_delivery');
      else if (initialStatus === 'orders-completed') setStatusFilter('completed');
      else if (initialStatus === 'orders-cancelled') setStatusFilter('cancelled');
      else if (initialStatus === 'orders') setStatusFilter('all');
      else setStatusFilter(initialStatus);
    }
  }, [initialStatus]);

  useEffect(() => {
    if (initialFilterType) {
      setTypeFilter(initialFilterType);
    }
  }, [initialFilterType]);

  // Fetch live orders
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order_status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      addNotification('Order Updated', `Order status moved to ${newStatus}`, 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
      }
    } catch (err) {
      addNotification('Transition Error', err.message, 'error');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (typeFilter !== 'all' && o.order_type !== typeFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'received' && (o.order_status === 'received' || o.order_status === 'accepted')) {
        // match new/received/accepted
      } else if (o.order_status !== statusFilter) {
        return false;
      }
    }
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
    {
      id: 'received',
      label: '1. New / Received',
      color: 'border-amber-500/50 bg-amber-500/5',
      badge: 'bg-amber-500 text-french-dark',
      filterStatuses: ['received', 'accepted']
    },
    {
      id: 'preparing',
      label: '2. Kitchen Cooking',
      color: 'border-blue-500/50 bg-blue-500/5',
      badge: 'bg-blue-600 text-white',
      filterStatuses: ['preparing']
    },
    {
      id: 'ready',
      label: '3. Ready / Dispatch',
      color: 'border-purple-500/50 bg-purple-500/5',
      badge: 'bg-purple-600 text-white',
      filterStatuses: ['ready', 'out_for_delivery']
    },
    {
      id: 'completed',
      label: '4. Completed / Delivered',
      color: 'border-emerald-500/50 bg-emerald-500/5',
      badge: 'bg-emerald-600 text-white',
      filterStatuses: ['completed']
    },
  ];

  const getNextTransition = (order) => {
    const s = order.order_status;
    const isDelivery = order.order_type === 'delivery';

    if (s === 'received' || s === 'accepted') {
      return { nextStatus: 'preparing', label: 'Start Cooking', color: 'bg-blue-600 hover:bg-blue-700' };
    }
    if (s === 'preparing') {
      return { nextStatus: 'ready', label: 'Mark Ready', color: 'bg-purple-600 hover:bg-purple-700' };
    }
    if (s === 'ready') {
      if (isDelivery) {
        return { nextStatus: 'out_for_delivery', label: 'Dispatch Rider', color: 'bg-indigo-600 hover:bg-indigo-700' };
      }
      return { nextStatus: 'completed', label: 'Serve / Complete', color: 'bg-emerald-600 hover:bg-emerald-700' };
    }
    if (s === 'out_for_delivery') {
      return { nextStatus: 'completed', label: 'Confirm Delivered', color: 'bg-emerald-600 hover:bg-emerald-700' };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Summary */}
      <div className="p-5 sm:p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Kitchen Display System (KDS) & Order Pipeline</span>
          </div>
          <h2 className="font-serif font-black text-xl sm:text-2xl text-french-gold">
            Live Order Management Board
          </h2>
          <p className="text-xs text-french-cream/80 mt-1">
            Track orders in real time across Dine-In, Takeaway, and Delivery with automated kitchen workflow.
          </p>
        </div>

        {/* View mode toggle & Refresh */}
        <div className="flex items-center gap-2">
          <div className="bg-french-brown/80 rounded-xl p-1 border border-french-gold/30 flex items-center">
            <button
              onClick={() => setViewMode('board')}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'board' ? 'bg-french-gold text-french-dark' : 'text-french-cream/70 hover:text-french-gold'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-french-gold text-french-dark' : 'text-french-cream/70 hover:text-french-gold'
              }`}
              title="Table List View"
            >
              <ListFilter className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-french-gold/20 text-french-gold border border-french-gold/30 hover:bg-french-gold hover:text-french-dark transition-all"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Row: Type + Status + Search */}
      <div className="p-4 rounded-2xl bg-white border border-french-gold/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-bold">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'received', label: 'New' },
            { id: 'preparing', label: 'Preparing' },
            { id: 'ready', label: 'Ready' },
            { id: 'out_for_delivery', label: 'Out for Delivery' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap uppercase tracking-wider text-[11px] ${
                statusFilter === st.id
                  ? 'bg-french-gold text-french-dark font-black shadow'
                  : 'bg-french-cream/50 text-french-dark/70 hover:bg-french-cream hover:text-french-dark'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search & Type Filter */}
        <div className="flex items-center gap-2">
          {/* Order Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-french-cream/40 border border-french-gold/20 text-xs font-bold text-french-dark focus:outline-none focus:border-french-gold cursor-pointer"
          >
            <option value="all">All Channels</option>
            <option value="dine-in">Dine-In</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-french-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Order #, name, phone..."
              className="pl-8 pr-3 py-2 rounded-xl bg-french-cream/40 border border-french-gold/20 text-xs text-french-dark focus:outline-none focus:border-french-gold font-medium w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Render Orders: Kanban or List View */}
      {viewMode === 'board' && statusFilter === 'all' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(col => {
            const colOrders = filteredOrders.filter(o => col.filterStatuses.includes(o.order_status));

            return (
              <div key={col.id} className={`rounded-3xl border-2 ${col.color} p-3.5 flex flex-col justify-between shadow-sm space-y-3 min-h-[500px]`}>
                
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-french-gold/15 pb-2">
                  <span className="font-serif font-black text-xs text-french-dark uppercase tracking-wide">
                    {col.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shadow ${col.badge}`}>
                    {colOrders.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[640px] pr-1">
                  {colOrders.length > 0 ? (
                    colOrders.map(order => {
                      const next = getNextTransition(order);

                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="p-3.5 rounded-2xl bg-white border border-french-gold/30 shadow-md space-y-2.5 hover:border-french-gold cursor-pointer transition-all hover:scale-[1.01] group"
                        >
                          {/* Order Number & Type */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-sm text-french-gold bg-french-dark px-2.5 py-0.5 rounded-lg">
                              #{order.order_number}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${
                              order.order_type === 'dine-in'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : order.order_type === 'takeaway'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}>
                              {order.order_type === 'dine-in' && <><Utensils className="w-3 h-3" /><span>T-{order.table_number || '01'}</span></>}
                              {order.order_type === 'takeaway' && <><ShoppingBag className="w-3 h-3" /><span>Takeaway</span></>}
                              {order.order_type === 'delivery' && <><Bike className="w-3 h-3" /><span>Delivery</span></>}
                            </span>
                          </div>

                          {/* Customer Details */}
                          <div>
                            <div className="font-bold text-xs text-french-dark flex items-center justify-between">
                              <span className="truncate">{order.customer_name}</span>
                              <span className="text-[10px] text-french-muted font-normal">
                                {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                              </span>
                            </div>
                            <div className="text-[11px] text-french-muted font-mono">{order.phone}</div>
                          </div>

                          {/* Items Preview */}
                          <div className="p-2 rounded-xl bg-french-cream/40 border border-french-gold/15 space-y-1 text-xs">
                            {(order.items || []).slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px]">
                                <span className="truncate pr-1">
                                  <strong>{item.quantity}x</strong> {item.item_name || item.name}
                                </span>
                                <span className="font-mono font-bold text-french-dark">
                                  ₹{item.total_price || (item.unit_price * item.quantity)}
                                </span>
                              </div>
                            ))}
                            {(order.items || []).length > 3 && (
                              <div className="text-[10px] text-french-muted italic">
                                + {order.items.length - 3} more items...
                              </div>
                            )}
                          </div>

                          {/* Price & Action */}
                          <div className="pt-2 border-t border-french-gold/15 flex items-center justify-between gap-2">
                            <span className="font-serif font-black text-sm text-french-dark">
                              ₹{order.total}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {next && (
                                <button
                                  onClick={(e) => handleUpdateStatus(order.id, next.nextStatus, e)}
                                  className={`px-2.5 py-1 rounded-lg text-white font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm ${next.color}`}
                                >
                                  <span>{next.label}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                }}
                                className="p-1.5 rounded-lg bg-french-cream text-french-dark hover:bg-french-gold hover:text-french-dark transition-all"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
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
      ) : (
        /* List / Filtered View */
        <div className="bg-white border border-french-gold/25 rounded-3xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[11px] border-b border-french-gold/20">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-french-muted">
                      No orders match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const next = getNextTransition(order);

                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-french-cream/40 transition-colors cursor-pointer group"
                      >
                        <td className="p-4">
                          <span className="font-mono font-black text-xs text-french-gold bg-french-dark px-2.5 py-1 rounded-lg">
                            #{order.order_number}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-xs text-french-dark">{order.customer_name}</div>
                          <div className="text-[11px] text-french-muted font-mono">{order.phone}</div>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase inline-flex items-center gap-1 ${
                            order.order_type === 'dine-in'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : order.order_type === 'takeaway'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {order.order_type === 'dine-in' && `Table #${order.table_number || '01'}`}
                            {order.order_type === 'takeaway' && 'Takeaway'}
                            {order.order_type === 'delivery' && 'Delivery'}
                          </span>
                        </td>

                        <td className="p-4 text-xs">
                          {(order.items || []).map(i => `${i.quantity}x ${i.item_name || i.name}`).join(', ')}
                        </td>

                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full font-bold text-[10px] uppercase bg-french-cream border border-french-gold/30 text-french-dark">
                            {order.order_status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="p-4 font-serif font-black text-sm text-french-dark">
                          ₹{order.total}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {next && (
                              <button
                                onClick={(e) => handleUpdateStatus(order.id, next.nextStatus, e)}
                                className={`px-2.5 py-1 rounded-lg text-white font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm ${next.color}`}
                              >
                                {next.label}
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-french-brown/10 hover:bg-french-dark text-french-dark hover:text-french-gold border border-french-gold/30 font-bold text-[11px] transition-all"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Slide-Over Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={(orderId, newStatus) => {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
            setSelectedOrder(prev => prev ? { ...prev, order_status: newStatus } : null);
          }}
        />
      )}

    </div>
  );
}
