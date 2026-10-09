import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Search, Filter, RefreshCw, CheckCircle2, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function PaymentManager() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = () => {
    setLoading(true);
    fetch('/api/payments', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setPayments(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const filtered = payments.filter(p => {
    if (statusFilter !== 'all' && (p.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTxn = (p.transaction_id || '').toLowerCase().includes(q);
      const matchOrder = (p.order_number || '').toLowerCase().includes(q);
      const matchCust = (p.customer_name || '').toLowerCase().includes(q);
      if (!matchTxn && !matchOrder && !matchCust) return false;
    }
    return true;
  });

  const totalCollected = filtered
    .filter(p => p.status === 'paid' || p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-widest mb-1.5">
            <CreditCard className="w-4 h-4 text-french-gold" />
            <span>Digital Settlement & Audit</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-french-cream">
            PAYMENT MANAGEMENT
          </h2>
          <p className="text-xs text-french-cream/80 mt-1 max-w-xl">
            Track customer payments, UPI transaction references, settlement statuses, and refunds.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-french-brown/80 px-4 py-2.5 rounded-2xl border border-french-gold/30">
          <div>
            <span className="text-[10px] text-french-cream/70 uppercase font-bold block">Filtered Gross</span>
            <span className="font-serif font-black text-lg text-french-gold">₹{totalCollected.toFixed(2)}</span>
          </div>
          <button
            onClick={fetchPayments}
            className="p-2 rounded-xl bg-french-gold/20 hover:bg-french-gold text-french-gold hover:text-french-dark transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-french-card p-4 rounded-2xl border border-french-gold/25 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-french-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Transaction ID, Order #, or Customer..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark text-xs font-medium focus:outline-none focus:border-french-gold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-french-muted shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark text-xs font-semibold focus:outline-none focus:border-french-gold"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid (Success)</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-french-card border border-french-gold/30 rounded-3xl overflow-hidden shadow-lg">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-french-muted text-xs">
            No transactions found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[11px]">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
                {filtered.map((p) => {
                  const isSuccess = p.status === 'paid' || p.status === 'success';

                  return (
                    <tr key={p.id} className="hover:bg-french-cream/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-french-dark">
                        {p.transaction_id}
                      </td>

                      <td className="p-4 font-mono font-bold text-french-gold">
                        #{p.order_number}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-french-dark block">{p.customer_name}</span>
                        <span className="font-mono text-french-muted text-[10px]">+91 {p.phone}</span>
                      </td>

                      <td className="p-4 font-serif font-extrabold text-sm text-french-dark">
                        ₹{Number(p.amount).toFixed(2)}
                      </td>

                      <td className="p-4 uppercase font-mono text-[11px] text-french-muted">
                        {p.method || 'UPI'}
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase inline-flex items-center gap-1 ${
                          isSuccess
                            ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-900 border border-amber-500/40'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span>{isSuccess ? 'SUCCESS' : 'PENDING'}</span>
                        </span>
                      </td>

                      <td className="p-4 font-mono text-french-muted whitespace-nowrap">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
