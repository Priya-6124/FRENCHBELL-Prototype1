import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Bell, Check, CheckCheck, Clock, AlertTriangle, ShoppingBag,
  Sparkles, ShieldCheck, ChevronRight, X, ExternalLink
} from 'lucide-react';

export default function NotificationsDropdown({ onNavigateTab }) {
  const { token } = useAuth();
  const { addNotification } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all' | 'order' | 'inventory' | 'system'
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications from server
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      // Non-blocking fallback
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [token]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Mark single as read
  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/notifications/read-all', {
        method: 'PATCH',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      addNotification('Notifications', 'All marked as read', 'info');
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.is_read) {
      handleMarkAsRead(item.id);
    }
    setIsOpen(false);

    if (item.type === 'order' && onNavigateTab) {
      onNavigateTab('orders');
    } else if (item.type === 'inventory' && onNavigateTab) {
      onNavigateTab('menu-availability');
    } else if (item.type === 'admin_team' && onNavigateTab) {
      onNavigateTab('settings-admins');
    } else if (onNavigateTab) {
      onNavigateTab('notifications');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'inventory':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'admin_team':
        return <ShieldCheck className="w-4 h-4 text-french-gold" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-french-brown/70 hover:bg-french-brown border border-french-gold/30 text-french-gold hover:text-french-cream transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-french-gold/50"
        title="Admin Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-lg animate-pulse border border-french-dark">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-84 sm:w-96 bg-french-dark border border-french-gold/40 rounded-2xl shadow-2xl z-50 overflow-hidden text-french-cream animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-french-dark border-b border-french-gold/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-french-gold" />
              <h3 className="font-serif font-black text-sm text-french-cream tracking-wide">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={loading}
                  className="text-[11px] font-bold text-french-gold hover:text-french-gold-hover hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-french-cream/60 hover:text-french-cream p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Type Filter Pills */}
          <div className="px-3 py-2 bg-french-dark/80 border-b border-french-gold/15 flex items-center gap-1 text-[11px] overflow-x-auto">
            {['all', 'order', 'inventory', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all whitespace-nowrap ${
                  filter === t
                    ? 'bg-french-gold text-french-dark font-black'
                    : 'text-french-cream/70 hover:bg-french-brown/60 hover:text-french-gold'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-french-gold/10">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-french-cream/60 text-xs">
                <Bell className="w-8 h-8 text-french-gold/30 mx-auto mb-2" />
                <p className="font-bold">No notifications here</p>
                <p className="text-[11px] mt-1 text-french-cream/40">You're completely up to date!</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all hover:bg-french-brown/50 ${
                    !item.is_read ? 'bg-french-brown/20' : 'opacity-80'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-french-dark border border-french-gold/20 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs truncate ${!item.is_read ? 'font-black text-french-cream' : 'font-medium text-french-cream/80'}`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-french-cream/50 whitespace-nowrap shrink-0">
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </span>
                    </div>

                    <p className="text-[11px] text-french-cream/70 line-clamp-2 mt-0.5 leading-snug">
                      {item.message}
                    </p>
                  </div>

                  {!item.is_read && (
                    <button
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      title="Mark as read"
                      className="p-1 rounded-full text-french-cream/40 hover:text-french-gold hover:bg-french-dark shrink-0"
                    >
                      <span className="w-2 h-2 rounded-full bg-french-gold block" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-french-dark/95 border-t border-french-gold/20 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onNavigateTab) onNavigateTab('notifications');
              }}
              className="text-xs font-black text-french-gold hover:text-french-gold-hover uppercase tracking-wider flex items-center justify-center gap-1 mx-auto"
            >
              <span>View All Notifications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
