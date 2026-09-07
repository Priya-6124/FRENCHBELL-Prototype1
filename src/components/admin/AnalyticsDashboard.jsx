import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RevenueLineChart, OrderTypeDonutChart, TopProductsBarChart } from './AnalyticsCharts';
import ExportModal from './ExportModal';
import {
  TrendingUp, ShoppingBag, DollarSign, Users, Clock, CheckCircle2,
  Download, Calendar, Award, CreditCard, Sparkles
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const { token } = useAuth();
  const [timeFilter, setTimeFilter] = useState('7d');
  const [showExportModal, setShowExportModal] = useState(false);

  const [summary, setSummary] = useState({
    today_revenue: 14890,
    total_orders: 42,
    pending_orders: 3,
    completed_orders: 39,
    active_customers: 28,
    average_order_value: 354
  });

  useEffect(() => {
    fetch('/api/analytics/summary', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setSummary(prev => ({ ...prev, ...data })); })
      .catch(() => {});
  }, [token]);

  return (
    <div className="space-y-8">
      
      {/* Top Greeting & Header Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-french-dark via-[#2B160E] to-french-brown text-french-cream border border-french-gold/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-french-cream">
            Good evening, Admin
          </h2>
          <p className="text-french-cream/80 text-xs sm:text-sm mt-1">
            Here's what's happening at <strong>French Bell Cafe</strong> today.
          </p>
        </div>

        {/* Action Controls: Time Filter & Export Modal Button */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Time Filter Buttons */}
          <div className="flex items-center p-1 rounded-2xl bg-french-dark/80 border border-french-gold/30 text-xs">
            {['today', '7d', '30d', '3m', '1y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all ${
                  timeFilter === tf
                    ? 'bg-french-gold text-french-dark shadow'
                    : 'text-french-cream/70 hover:text-french-gold'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-french-gold text-french-dark font-extrabold text-xs uppercase tracking-wider shadow hover:scale-105 transition-all flex items-center gap-2 gold-glow"
          >
            <Download className="w-4 h-4" />
            <span>Export Analytics</span>
          </button>

        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Today's Revenue */}
        <div className="p-5 rounded-3xl bg-french-card border border-french-gold/30 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-french-muted">Today's Revenue</span>
            <div className="p-2 rounded-xl bg-french-gold/20 text-french-gold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-extrabold text-2xl text-french-dark block">
            ₹{summary.today_revenue.toLocaleString()}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs yesterday</span>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="p-5 rounded-3xl bg-french-card border border-french-gold/30 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-french-muted">Today's Orders</span>
            <div className="p-2 rounded-xl bg-french-gold/20 text-french-gold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-extrabold text-2xl text-french-dark block">
            {summary.total_orders}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+8 new orders</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-3xl bg-french-card border border-french-gold/30 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-french-muted">Pending Kitchen</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-extrabold text-2xl text-amber-600 block">
            {summary.pending_orders}
          </span>
          <span className="text-[10px] font-bold text-french-muted block">In preparation</span>
        </div>

        {/* Completed Orders */}
        <div className="p-5 rounded-3xl bg-french-card border border-french-gold/30 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-french-muted">Completed</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-extrabold text-2xl text-emerald-700 block">
            {summary.completed_orders}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 block">100% fulfilled</span>
        </div>

        {/* Active Customers */}
        <div className="p-5 rounded-3xl bg-french-card border border-french-gold/30 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-french-muted">Active Customers</span>
            <div className="p-2 rounded-xl bg-french-gold/20 text-french-gold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-extrabold text-2xl text-french-dark block">
            {summary.active_customers}
          </span>
          <span className="text-[10px] font-bold text-french-muted block">Unique buyers</span>
        </div>

        {/* Average Order Value */}
        <div className="p-5 rounded-3xl bg-french-card border border-french-gold/30 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-french-muted">Avg Order Value</span>
            <div className="p-2 rounded-xl bg-french-gold/20 text-french-gold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-extrabold text-2xl text-french-dark block">
            ₹{summary.average_order_value}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 block">Per basket</span>
        </div>

      </div>

      {/* Analytics Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales Revenue Trend Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-french-card border border-french-gold/30 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-french-gold/15 pb-4">
            <div>
              <h3 className="font-serif font-extrabold text-xl text-french-dark">
                Revenue Growth Analytics
              </h3>
              <p className="text-xs text-french-muted">Total sales performance over time</p>
            </div>
            <span className="text-xs font-mono font-bold text-french-gold bg-french-dark px-3 py-1 rounded-full">
              {timeFilter.toUpperCase()} RANGE
            </span>
          </div>
          <RevenueLineChart />
        </div>

        {/* Order Mode Distribution Donut Chart */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-french-card border border-french-gold/30 shadow-lg space-y-4">
          <div className="border-b border-french-gold/15 pb-4">
            <h3 className="font-serif font-extrabold text-xl text-french-dark">
              Order Type Distribution
            </h3>
            <p className="text-xs text-french-muted">Dine-In vs Takeaway vs Delivery ratio</p>
          </div>
          <OrderTypeDonutChart />
        </div>

      </div>

      {/* Product Performance Bar Chart */}
      <div className="p-6 rounded-3xl bg-french-card border border-french-gold/30 shadow-lg space-y-4">
        <div className="border-b border-french-gold/15 pb-4">
          <h3 className="font-serif font-extrabold text-xl text-french-dark flex items-center gap-2">
            <Award className="w-5 h-5 text-french-gold" />
            <span>Best-Selling Food Items</span>
          </h3>
          <p className="text-xs text-french-muted">Top dishes by volume ordered</p>
        </div>
        <TopProductsBarChart />
      </div>

      {/* Export Modal */}
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}

    </div>
  );
}
