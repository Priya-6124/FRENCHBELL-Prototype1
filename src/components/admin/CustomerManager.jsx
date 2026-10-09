import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Phone, ShoppingBag, DollarSign, Search, Calendar,
  ArrowUpDown, ExternalLink, X, Clock, MapPin, Bike, Utensils,
  ChevronRight, Award, RefreshCw, Download, FileText, CheckCircle2,
  Filter
} from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';

export default function CustomerManager({ initialTab = 'all' }) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab === 'history' || initialTab === 'orders' ? 'orders' : 'all');
  const [customers, setCustomers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('spent'); // 'spent' | 'orders' | 'recent'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');

  useEffect(() => {
    if (initialTab === 'history' || initialTab === 'orders') {
      setActiveTab('orders');
    } else {
      setActiveTab('all');
    }
  }, [initialTab]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setAllOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchOrders();
  }, [token]);

  // Filter & sort customers
  const filteredCustomers = customers
    .filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q)
      );
    })
    .sort((a, b) => {
      const spentA = Number(a.total_spent || a.total_spending || 0);
      const spentB = Number(b.total_spent || b.total_spending || 0);
      const ordersA = Number(a.total_orders || 0);
      const ordersB = Number(b.total_orders || 0);

      if (sortBy === 'spent') return spentB - spentA;
      if (sortBy === 'orders') return ordersB - ordersA;
      if (sortBy === 'recent') {
        const dateA = new Date(a.last_order_date || 0).getTime();
        const dateB = new Date(b.last_order_date || 0).getTime();
        return dateB - dateA;
      }
      return 0;
    });

  // Filter customer orders
  const filteredOrders = allOrders.filter(ord => {
    if (orderTypeFilter !== 'all' && ord.order_type !== orderTypeFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (ord.order_number || '').toLowerCase().includes(q) ||
      (ord.customer_name || '').toLowerCase().includes(q) ||
      (ord.phone || '').includes(q)
    );
  });

  // Summary metrics
  const totalCustomers = customers.length;
  const totalLifetimeRevenue = customers.reduce((sum, c) => sum + (Number(c.total_spent || c.total_spending || 0)), 0);
  const totalOrdersPlaced = customers.reduce((sum, c) => sum + (Number(c.total_orders || 0)), 0);
  const avgOrderValue = totalOrdersPlaced > 0 ? Math.round(totalLifetimeRevenue / totalOrdersPlaced) : 0;
  const repeatCustomersCount = customers.filter(c => (Number(c.total_orders || 0)) > 1).length;

  // Export customer directory to Excel
  const handleExportCustomers = () => {
    const columns = [
      { header: 'Customer Name', key: 'name', width: 180 },
      { header: 'Mobile Number', key: 'phone', width: 140 },
      { header: 'Total Orders', key: 'total_orders', width: 120 },
      { header: 'Total Spent (₹)', key: 'total_spent', width: 140 },
      { header: 'Preferred Mode', key: 'preferred_order_type', width: 140 },
      { header: 'Last Active', key: 'last_order_date', width: 180 },
    ];

    const rows = filteredCustomers.map(c => ({
      name: c.name || 'Valued Foodie',
      phone: `+91 ${c.phone}`,
      total_orders: c.total_orders || 1,
      total_spent: c.total_spent || c.total_spending || 0,
      preferred_order_type: (c.preferred_order_type || 'takeaway').toUpperCase(),
      last_order_date: c.last_order_date ? new Date(c.last_order_date).toLocaleDateString() : 'Recent'
    }));

    exportToExcel('FrenchBell_Customers_Directory', 'Customer Directory', columns, rows);
  };

  // Export customer orders to Excel
  const handleExportOrders = () => {
    const columns = [
      { header: 'Order #', key: 'order_number', width: 120 },
      { header: 'Customer Name', key: 'customer_name', width: 180 },
      { header: 'Mobile Number', key: 'phone', width: 140 },
      { header: 'Order Type', key: 'order_type', width: 130 },
      { header: 'Total Amount (₹)', key: 'total', width: 140 },
      { header: 'Order Status', key: 'order_status', width: 140 },
      { header: 'Payment Method', key: 'payment_method', width: 140 },
      { header: 'Date & Time', key: 'created_at', width: 180 },
    ];

    const rows = filteredOrders.map(o => ({
      order_number: `#${o.order_number}`,
      customer_name: o.customer_name || 'Guest Foodie',
      phone: `+91 ${o.phone}`,
      order_type: (o.order_type || '').toUpperCase(),
      total: o.total || 0,
      order_status: (o.order_status || 'completed').toUpperCase(),
      payment_method: (o.payment_method || 'UPI').toUpperCase(),
      created_at: o.created_at ? new Date(o.created_at).toLocaleString() : 'Now'
    }));

    exportToExcel('FrenchBell_Customer_Orders_Register', 'Customer Orders', columns, rows);
  };

  const handleOpenCustomer = (customer) => {
    // If orders are empty, match from allOrders
    let customerOrders = customer.orders || customer.order_history || [];
    if (customerOrders.length === 0 && customer.phone) {
      customerOrders = allOrders.filter(o => o.phone === customer.phone);
    }
    setSelectedCustomer({
      ...customer,
      orders: customerOrders
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Users className="w-6 h-6 text-french-gold" />
            <h2 className="font-serif font-black text-xl sm:text-2xl text-french-gold">
              Customer Intelligence & Orders
            </h2>
          </div>
          <p className="text-xs text-french-cream/80 mt-1 max-w-xl">
            Real customer spending profiles, order frequencies, and past purchase history aggregated directly from verified orders.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { fetchCustomers(); fetchOrders(); }}
            className="p-2.5 rounded-xl bg-french-brown/80 hover:bg-french-brown border border-french-gold/30 text-french-gold hover:text-french-cream transition-all"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={activeTab === 'all' ? handleExportCustomers : handleExportOrders}
            className="px-4 py-2.5 rounded-xl bg-french-gold text-french-dark font-black text-xs uppercase tracking-wider hover:bg-french-gold-hover transition-all flex items-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>{activeTab === 'all' ? 'Export Directory' : 'Export Orders'}</span>
          </button>
        </div>
      </div>

      {/* Subtabs Bar (Section 3: All Customers & Customer Orders) */}
      <div className="flex items-center gap-2 border-b border-french-gold/25 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-2.5 rounded-2xl font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-french-dark text-french-gold shadow-md border border-french-gold/40 gold-glow'
              : 'bg-white text-french-dark border border-french-gold/20 hover:border-french-gold/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Customers ({totalCustomers})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-2xl font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-french-dark text-french-gold shadow-md border border-french-gold/40 gold-glow'
              : 'bg-white text-french-dark border border-french-gold/20 hover:border-french-gold/50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Orders ({allOrders.length})</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-french-gold/20 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-french-cream border border-french-gold/30 text-french-dark">
            <Users className="w-5 h-5 text-french-gold" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-french-muted block">
              Total Customers
            </span>
            <span className="text-xl font-serif font-black text-french-dark">
              {totalCustomers}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-french-gold/20 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-french-muted block">
              Lifetime Spend
            </span>
            <span className="text-xl font-serif font-black text-emerald-800">
              ₹{totalLifetimeRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-french-gold/20 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-french-muted block">
              Average Order Value
            </span>
            <span className="text-xl font-serif font-black text-french-dark">
              ₹{avgOrderValue}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-french-gold/20 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-french-muted block">
              Repeat Loyalists
            </span>
            <span className="text-xl font-serif font-black text-purple-900">
              {repeatCustomersCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Sort / Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-french-gold/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-french-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'all' ? "Search by customer name or 10-digit mobile..." : "Search by order #, customer, or mobile..."}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-french-cream/40 border border-french-gold/20 text-xs text-french-dark focus:outline-none focus:border-french-gold focus:ring-1 focus:ring-french-gold font-medium"
          />
        </div>

        {activeTab === 'all' ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-french-muted font-bold">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-french-cream/40 border border-french-gold/20 text-xs font-bold text-french-dark focus:outline-none focus:border-french-gold cursor-pointer"
            >
              <option value="spent">Highest Spend</option>
              <option value="orders">Most Orders</option>
              <option value="recent">Recently Active</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-french-muted font-bold">Channel:</span>
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-french-cream/40 border border-french-gold/20 text-xs font-bold text-french-dark focus:outline-none focus:border-french-gold cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="dine-in">Dine-In</option>
              <option value="takeaway">Takeaway</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: ALL CUSTOMERS TABLE */}
      {activeTab === 'all' && (
        <div className="bg-white border border-french-gold/25 rounded-3xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[11px] border-b border-french-gold/20">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Orders Placed</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4">Preferred Channel</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-french-muted">
                      No customers found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr
                      key={c.id || c.phone}
                      className="hover:bg-french-cream/40 transition-colors cursor-pointer group"
                      onClick={() => handleOpenCustomer(c)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-french-dark text-french-gold font-serif font-black text-xs flex items-center justify-center shrink-0 border border-french-gold/30">
                            {(c.name || 'G').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-serif font-bold text-sm text-french-dark group-hover:text-french-gold-hover transition-colors">
                              {c.name || 'Valued Foodie'}
                            </p>
                            <span className="text-[10px] text-french-muted">Customer ID: #{c.phone.slice(-4)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-french-dark">
                        +91 {c.phone}
                      </td>

                      <td className="p-4 font-bold">
                        <span className="px-2 py-0.5 rounded-full bg-french-cream border border-french-gold/30 text-french-dark">
                          {c.total_orders || 1} Orders
                        </span>
                      </td>

                      <td className="p-4 font-serif font-black text-sm text-emerald-800">
                        ₹{Number(c.total_spent || c.total_spending || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase inline-flex items-center gap-1 ${
                          c.preferred_order_type === 'delivery'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : c.preferred_order_type === 'dine-in'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {c.preferred_order_type === 'delivery' && <Bike className="w-3 h-3" />}
                          {c.preferred_order_type === 'dine-in' && <Utensils className="w-3 h-3" />}
                          {c.preferred_order_type === 'takeaway' && <ShoppingBag className="w-3 h-3" />}
                          <span>{c.preferred_order_type || 'Takeaway'}</span>
                        </span>
                      </td>

                      <td className="p-4 text-french-muted text-[11px]">
                        {c.last_order_date
                          ? new Date(c.last_order_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Recent'}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCustomer(c);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-french-brown/10 hover:bg-french-dark text-french-dark hover:text-french-gold border border-french-gold/30 font-bold text-[11px] transition-all inline-flex items-center gap-1"
                        >
                          <span>History</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: CUSTOMER ORDERS TABLE */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-french-gold/25 rounded-3xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[11px] border-b border-french-gold/20">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-french-muted">
                      No customer orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr
                      key={ord.id || ord.order_number}
                      className="hover:bg-french-cream/40 transition-colors cursor-pointer group"
                      onClick={() => {
                        const matchingCust = customers.find(c => c.phone === ord.phone) || {
                          name: ord.customer_name,
                          phone: ord.phone,
                          total_orders: 1,
                          total_spent: ord.total,
                          preferred_order_type: ord.order_type
                        };
                        handleOpenCustomer(matchingCust);
                      }}
                    >
                      <td className="p-4 font-mono font-bold text-french-gold">
                        <span className="bg-french-dark px-2.5 py-1 rounded-md">
                          #{ord.order_number}
                        </span>
                      </td>

                      <td className="p-4 font-serif font-bold text-sm text-french-dark">
                        {ord.customer_name || 'Guest Foodie'}
                      </td>

                      <td className="p-4 font-mono font-bold text-french-dark">
                        +91 {ord.phone}
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase inline-flex items-center gap-1 ${
                          ord.order_type === 'delivery'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : ord.order_type === 'dine-in'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {ord.order_type === 'delivery' && <Bike className="w-3 h-3" />}
                          {ord.order_type === 'dine-in' && <Utensils className="w-3 h-3" />}
                          {ord.order_type === 'takeaway' && <ShoppingBag className="w-3 h-3" />}
                          <span>{ord.order_type}</span>
                        </span>
                      </td>

                      <td className="p-4 text-xs">
                        {Array.isArray(ord.items) && ord.items.length > 0 ? (
                          <span className="line-clamp-1 max-w-[200px]" title={ord.items.map(i => `${i.quantity}x ${i.item_name || i.name}`).join(', ')}>
                            {ord.items.map(i => `${i.quantity}x ${i.item_name || i.name}`).join(', ')}
                          </span>
                        ) : (
                          <span className="text-french-muted italic">Order items logged</span>
                        )}
                      </td>

                      <td className="p-4 font-serif font-black text-sm text-french-dark">
                        ₹{ord.total}
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          ord.order_status === 'completed' || ord.order_status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.order_status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {(ord.order_status || 'received').replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-4 text-french-muted text-[11px] font-mono">
                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent'}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const matchingCust = customers.find(c => c.phone === ord.phone) || {
                              name: ord.customer_name,
                              phone: ord.phone,
                              total_orders: 1,
                              total_spent: ord.total,
                              preferred_order_type: ord.order_type
                            };
                            handleOpenCustomer(matchingCust);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-french-brown/10 hover:bg-french-dark text-french-dark hover:text-french-gold border border-french-gold/30 font-bold text-[11px] transition-all inline-flex items-center gap-1"
                        >
                          <span>Customer</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Details Slide-Over Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-french-cream h-full shadow-2xl flex flex-col justify-between border-l border-french-gold/40 animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="p-5 bg-french-dark text-french-cream border-b border-french-gold/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-french-gold to-amber-200 text-french-dark font-serif font-black text-sm flex items-center justify-center border border-french-gold">
                  {(selectedCustomer.name || 'G').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-french-gold">
                    {selectedCustomer.name || 'Valued Foodie'}
                  </h3>
                  <p className="text-xs text-french-cream/70 font-mono">
                    +91 {selectedCustomer.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-full text-french-cream/60 hover:text-french-cream hover:bg-french-brown/60 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body - Order History */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-white border border-french-gold/20 text-center">
                  <span className="text-[10px] uppercase font-bold text-french-muted block">Orders</span>
                  <span className="text-base font-serif font-black text-french-dark">{selectedCustomer.total_orders || 1}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-french-gold/20 text-center">
                  <span className="text-[10px] uppercase font-bold text-french-muted block">Total Spend</span>
                  <span className="text-base font-serif font-black text-emerald-800">₹{(selectedCustomer.total_spent || selectedCustomer.total_spending || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-french-gold/20 text-center">
                  <span className="text-[10px] uppercase font-bold text-french-muted block">Mode</span>
                  <span className="text-xs font-bold uppercase text-french-gold-hover block mt-0.5">{selectedCustomer.preferred_order_type || 'Takeaway'}</span>
                </div>
              </div>

              {/* Order History Timeline */}
              <div>
                <h4 className="font-serif font-bold text-sm text-french-dark mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-french-gold" />
                  <span>Verified Purchase History</span>
                </h4>

                <div className="space-y-3">
                  {!selectedCustomer.orders || selectedCustomer.orders.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white border border-french-gold/20 text-center text-xs text-french-muted">
                      No past order details archived.
                    </div>
                  ) : (
                    selectedCustomer.orders.map((ord, idx) => (
                      <div
                        key={ord.order_number || idx}
                        className="p-4 rounded-2xl bg-white border border-french-gold/20 shadow-sm space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-french-gold bg-french-dark px-2.5 py-1 rounded-lg">
                            #{ord.order_number}
                          </span>
                          <span className="text-[10px] font-bold text-french-muted">
                            {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>

                        {/* Items preview */}
                        {Array.isArray(ord.items) && (
                          <div className="text-xs text-french-dark/90 divide-y divide-french-gold/10">
                            {ord.items.map((item, i) => (
                              <div key={i} className="py-1 flex items-center justify-between">
                                <span>
                                  {item.quantity}x {item.item_name || item.name}
                                </span>
                                <span className="font-bold text-french-dark">
                                  ₹{item.total_price || (item.unit_price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t border-french-gold/15 flex items-center justify-between text-xs">
                          <span className="text-[10px] uppercase font-bold text-french-muted">
                            Mode: {ord.order_type}
                          </span>
                          <span className="font-serif font-black text-sm text-french-dark">
                            Total: ₹{ord.total}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-french-dark border-t border-french-gold/20">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2.5 rounded-xl bg-french-brown text-french-cream hover:bg-french-gold hover:text-french-dark font-black text-xs uppercase tracking-wider transition-all"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
