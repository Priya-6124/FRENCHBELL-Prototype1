import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Bell, Check, CheckCheck, AlertTriangle, ShoppingBag,
  Package, RefreshCw, Info, AlertOctagon
} from 'lucide-react';

export default function NotificationsManager() {
  const { token } = useAuth();
  const { addNotification } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/admin/notifications/read-all', {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
      addNotification('Notifications Cleared', 'All notifications marked as read', 'success');
    } catch (e) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'inventory': return <Package className="w-4 h-4" />;
      case 'error': return <AlertOctagon className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'warning': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'error': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-french-cream text-french-dark border border-french-gold/30';
    }
  };

  const filtered = notifications.filter(n => filter === 'all' || n.type === filter);
  const unreadCount = notifications.filter(n => n.read === 0).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Admin Live Alerts</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-french-cream">NOTIFICATIONS REGISTER</h2>
          <p className="text-french-cream/60 text-xs mt-1">
            {unreadCount > 0 ? `${unreadCount} unread event${unreadCount !== 1 ? 's' : ''} require attention` : 'All alerts and operational events are cleared.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="p-2.5 rounded-xl bg-french-brown/60 border border-french-gold/30 text-french-gold hover:text-french-cream transition-all"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-french-gold text-french-dark font-black text-sm uppercase tracking-wider hover:bg-french-gold-hover transition-all shadow"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'order', 'warning', 'info'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all capitalize ${
              filter === f
                ? 'bg-french-dark text-french-gold border border-french-gold shadow'
                : 'bg-white text-french-dark border border-french-gold/20 hover:border-french-gold'
            }`}
          >
            {f === 'all' ? `All Alerts (${notifications.length})` : f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading && notifications.length === 0 ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-french-gold animate-spin mx-auto mb-3" />
          <p className="text-french-muted text-sm">Loading notifications feed...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-french-gold/20 shadow-sm">
          <Bell className="w-12 h-12 text-french-gold/30 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-french-dark text-lg mb-1">No Notifications</h3>
          <p className="text-french-muted text-sm">You are all caught up on system updates and operational events.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl p-4 border shadow-sm flex items-start gap-3 transition-all ${
                n.read === 0 ? 'border-french-gold/50 bg-amber-50/20' : 'border-french-gold/15 opacity-75'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${getTypeColor(n.type)}`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif font-black text-sm text-french-dark">{n.title}</h4>
                  {n.read === 0 && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="px-2 py-0.5 rounded-lg bg-french-cream hover:bg-french-gold hover:text-french-dark text-french-muted text-[10px] font-bold uppercase transition-all shrink-0 flex items-center gap-1"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-french-dark/80 mt-1">{n.message}</p>
                <span className="text-[10px] text-french-muted mt-2 block font-mono">
                  {n.created_at ? new Date(n.created_at).toLocaleString('en-IN') : 'Just now'}
                </span>
              </div>
              {n.read === 0 && (
                <div className="w-2.5 h-2.5 rounded-full bg-french-gold shrink-0 mt-2 shadow" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
