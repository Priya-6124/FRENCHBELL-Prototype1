import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { History, Search, RefreshCw, Filter, ShieldCheck, Clock, User, ArrowUpRight } from 'lucide-react';

export default function ActivityLogsManager() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/admin/activity-logs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setLogs(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const filteredLogs = logs.filter(log => {
    if (filterAction !== 'all' && !log.action.toLowerCase().includes(filterAction.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchAction = (log.action || '').toLowerCase().includes(q);
      const matchAdmin = (log.admin_name || '').toLowerCase().includes(q) || (log.admin_email || '').toLowerCase().includes(q);
      const matchDetails = (log.details || '').toLowerCase().includes(q);
      if (!matchAction && !matchAdmin && !matchDetails) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-widest mb-1.5">
            <History className="w-4 h-4 text-french-gold" />
            <span>Audit Trail & Security Register</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-french-cream">
            ACTIVITY LOGS
          </h2>
          <p className="text-xs text-french-cream/80 mt-1 max-w-xl">
            Immutable administrative activity logs recording menu changes, order updates, coupon configurations, banner publishing, and team access.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 rounded-full bg-french-brown/80 border border-french-gold/30 text-french-gold hover:bg-french-gold hover:text-french-dark text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-french-card p-4 rounded-2xl border border-french-gold/25 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-french-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity logs by admin, action, or details..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark text-xs font-medium focus:outline-none focus:border-french-gold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-french-muted shrink-0" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark text-xs font-semibold focus:outline-none focus:border-french-gold"
          >
            <option value="all">All Actions</option>
            <option value="order">Orders</option>
            <option value="menu">Menu Items</option>
            <option value="coupon">Coupons</option>
            <option value="admin">Admin Accounts</option>
            <option value="banner">Advertisements</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-french-card border border-french-gold/30 rounded-3xl overflow-hidden shadow-lg">
        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-french-muted text-xs">
            No activity logs found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[11px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-french-cream/60 transition-colors">
                    <td className="p-4 font-mono text-french-muted whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-french-dark text-french-gold flex items-center justify-center font-bold text-[10px] shrink-0">
                          {(log.admin_name || 'A').charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <span className="font-bold text-french-dark block leading-tight">
                            {log.admin_name || 'System'}
                          </span>
                          <span className="text-[10px] font-mono text-french-muted">
                            {log.admin_email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-french-gold/20 text-french-dark border border-french-gold/40">
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4 text-french-dark max-w-xs break-words">
                      {log.details || '—'}
                    </td>

                    <td className="p-4 font-mono text-[11px] text-french-muted">
                      {log.entity || 'general'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
