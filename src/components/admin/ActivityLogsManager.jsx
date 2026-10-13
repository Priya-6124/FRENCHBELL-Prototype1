import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  History,
  Search,
  RefreshCw,
  Filter,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ActivityLogsManager() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterAdmin, setFilterAdmin] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const buildQuery = useCallback((pageNum = 1) => {
    const params = new URLSearchParams();
    params.set('limit', PAGE_SIZE);
    params.set('offset', (pageNum - 1) * PAGE_SIZE);
    if (filterAction !== 'all') params.set('action', filterAction);
    if (filterEntity !== 'all') params.set('entity', filterEntity);
    if (filterAdmin.trim()) params.set('admin_email', filterAdmin.trim());
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    return params.toString();
  }, [filterAction, filterEntity, filterAdmin, startDate, endDate, searchQuery]);

  const fetchLogs = useCallback((pageNum = 1) => {
    setLoading(true);
    fetch(`/api/admin/activity-logs?${buildQuery(pageNum)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data)) {
          setLogs(data);
          setTotal(data.length < PAGE_SIZE ? (pageNum - 1) * PAGE_SIZE + data.length : -1);
        } else if (data && data.logs) {
          setLogs(data.logs);
          setTotal(data.total || data.logs.length);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, buildQuery]);

  useEffect(() => {
    setPage(1);
    fetchLogs(1);
  }, [filterAction, filterEntity, filterAdmin, startDate, endDate, token]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchLogs(newPage);
  };

  const getActionBadgeColor = (action) => {
    const a = (action || '').toLowerCase();
    if (a.includes('suspend') || a.includes('remove') || a.includes('cancel') || a.includes('failed')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (a.includes('invite') || a.includes('accept') || a.includes('creat') || a.includes('restor')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (a.includes('order') || a.includes('payment') || a.includes('status')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (a.includes('login') || a.includes('sign')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-french-gold/20 text-french-dark border-french-gold/40';
  };

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
            Append-only administrative activity log recording all significant actions. Normal operations cannot delete or rewrite this history.
          </p>
        </div>

        <button
          onClick={() => fetchLogs(page)}
          className="px-4 py-2 rounded-full bg-french-brown/80 border border-french-gold/30 text-french-gold hover:bg-french-gold hover:text-french-dark text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-french-card p-4 rounded-2xl border border-french-gold/25 shadow-sm space-y-3">

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-french-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by admin, action, or details..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark text-xs font-medium focus:outline-none focus:border-french-gold"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-french-dark text-french-gold text-xs font-bold hover:bg-french-gold hover:text-french-dark transition-all border border-french-gold/30"
          >
            Search
          </button>
        </form>

        {/* Filter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">

          {/* Action Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-french-muted shrink-0" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-2 py-2 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark text-xs font-semibold focus:outline-none focus:border-french-gold"
            >
              <option value="all">All Actions</option>
              <option value="login">Login Events</option>
              <option value="order">Orders</option>
              <option value="payment">Payments</option>
              <option value="menu">Menu Items</option>
              <option value="coupon">Coupons</option>
              <option value="invite">Invitations</option>
              <option value="admin">Admin Accounts</option>
              <option value="suspend">Suspensions</option>
              <option value="banner">Advertisements</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="w-full px-2 py-2 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark text-xs font-semibold focus:outline-none focus:border-french-gold"
            >
              <option value="all">All Entities</option>
              <option value="order">Orders</option>
              <option value="payment">Payments</option>
              <option value="menu_item">Menu Items</option>
              <option value="coupon">Coupons</option>
              <option value="admin_invitation">Invitations</option>
              <option value="admin_user">Admin Users</option>
              <option value="banner">Banners</option>
            </select>
          </div>

          {/* Admin Email Filter */}
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-french-muted shrink-0" />
            <input
              type="text"
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
              onBlur={() => { setPage(1); fetchLogs(1); }}
              placeholder="Filter by admin email..."
              className="w-full px-2 py-2 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark text-xs font-medium focus:outline-none focus:border-french-gold"
            />
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-french-muted shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-2 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark text-xs font-medium focus:outline-none focus:border-french-gold"
              title="From date"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 py-2 rounded-xl border border-french-gold/30 bg-french-cream/60 text-french-dark text-xs font-medium focus:outline-none focus:border-french-gold"
              title="To date"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(filterAction !== 'all' || filterEntity !== 'all' || filterAdmin || startDate || endDate || searchQuery) && (
          <button
            onClick={() => {
              setFilterAction('all');
              setFilterEntity('all');
              setFilterAdmin('');
              setStartDate('');
              setEndDate('');
              setSearchQuery('');
              setPage(1);
              setTimeout(() => fetchLogs(1), 0);
            }}
            className="text-xs text-french-gold hover:underline font-semibold"
          >
            × Clear all filters
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-french-card border border-french-gold/30 rounded-3xl overflow-hidden shadow-lg">
        {loading && logs.length === 0 ? (
          <div className="p-10 text-center text-french-muted text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-french-gold" />
            <span>Loading activity logs...</span>
          </div>
        ) : logs.length === 0 ? (
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
                  <th className="p-4">Details / Reason</th>
                  <th className="p-4">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-french-cream/60 transition-colors">
                    <td className="p-4 font-mono text-french-muted whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-french-dark text-french-gold flex items-center justify-center font-bold text-[10px] shrink-0">
                          {(log.admin_name || 'S').charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <span className="font-bold text-french-dark block leading-tight">
                            {log.admin_name || 'System'}
                          </span>
                          <span className="text-[10px] font-mono text-french-muted">
                            {log.admin_email || '—'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4 text-french-dark max-w-xs break-words">
                      {log.details || '—'}
                      {log.reason && (
                        <div className="text-[10px] text-french-muted mt-0.5 italic">
                          Reason: {log.reason}
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-mono text-[11px] text-french-muted">
                      <span className="block">{log.entity || 'general'}</span>
                      {log.entity_id && (
                        <span className="text-[9px] text-french-muted/70">#{log.entity_id}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {logs.length > 0 && (
        <div className="flex items-center justify-between text-xs text-french-muted px-1">
          <span>
            Page {page} · Showing {logs.length} record{logs.length !== 1 ? 's' : ''}
            {total > 0 ? ` of ${total}` : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded-lg border border-french-gold/30 bg-french-cream text-french-dark font-bold hover:border-french-gold transition-all disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={logs.length < PAGE_SIZE || loading}
              className="px-3 py-1.5 rounded-lg border border-french-gold/30 bg-french-cream text-french-dark font-bold hover:border-french-gold transition-all disabled:opacity-40 flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
