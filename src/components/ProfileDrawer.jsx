import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  X,
  User,
  Phone,
  LogOut,
  Clock,
  FileText,
  Download,
  ShieldCheck,
  Check,
  Edit2,
  MessageCircle,
  ShoppingBag
} from 'lucide-react';

export default function ProfileDrawer({ onClose, onViewReceipt, onTrackOrder }) {
  const { user, logout, updateProfile, isAdmin } = useAuth();
  const { addNotification } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [whatsappOptIn, setWhatsappOptIn] = useState(user?.whatsapp_opt_in !== false);
  const [orders, setOrders] = useState([
    {
      id: 1,
      order_number: 'FB1042',
      created_at: new Date().toISOString(),
      order_type: 'delivery',
      total: 248.00,
      order_status: 'completed',
      items: [
        { item_name: 'Chicken Burger', quantity: 2, unit_price: 89, total_price: 178 },
        { item_name: 'Peri Peri Fries', quantity: 1, unit_price: 70, total_price: 70 }
      ]
    }
  ]);

  useEffect(() => {
    if (user?.name) setNameInput(user.name);
    if (user?.phone) {
      fetch(`/api/orders?phone=${user.phone}`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data && data.length) setOrders(data);
        })
        .catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  const handleSaveName = async () => {
    try {
      await updateProfile({ name: nameInput.trim() });
      setIsEditingName(false);
      addNotification('Profile Updated', 'Your name was saved successfully', 'success');
    } catch (e) {
      addNotification('Update Failed', e.message || 'Could not update name', 'error');
    }
  };

  const handleToggleWhatsApp = async (val) => {
    setWhatsappOptIn(val);
    try {
      await updateProfile({ whatsapp_opt_in: val });
      addNotification(
        'WhatsApp Preference',
        val ? 'Opted in to WhatsApp order updates and deals' : 'Opted out of WhatsApp updates',
        'info'
      );
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-french-dark/70 backdrop-blur-sm animate-fadeIn" />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-french-card border-l border-french-gold/30 shadow-2xl flex flex-col justify-between">

          {/* Header */}
          <div className="p-5 bg-french-dark text-french-cream border-b border-french-gold/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-french-gold/20 text-french-gold flex items-center justify-center font-bold text-lg border border-french-gold/30">
                <User className="w-6 h-6 text-french-gold" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-lg text-french-cream">
                  {user.name || 'Foodie Profile'}
                </h3>
                <span className="text-xs text-french-gold font-mono">
                  +91 {user.phone}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-french-brown text-french-cream transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-5">

            {/* Profile Info Card */}
            <div className="p-4 rounded-2xl bg-french-cream border border-french-gold/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-french-muted uppercase tracking-wider">
                  Full Name
                </span>
                {!isEditingName ? (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-french-gold hover:underline font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveName}
                    className="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-1.5 rounded-xl border border-french-gold/40 bg-white text-french-dark text-sm focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-3 py-1.5 rounded-xl bg-french-gold text-french-dark font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <p className="font-bold text-french-dark text-sm">
                  {user.name || 'FrenchBell Foodie'}
                </p>
              )}

              <div className="pt-2 border-t border-french-gold/20 flex items-center justify-between text-xs">
                <span className="text-french-muted">Mobile Number</span>
                <span className="font-mono font-bold text-french-dark">+91 {user.phone}</span>
              </div>

              <div className="pt-2 border-t border-french-gold/20 flex items-center justify-between text-xs">
                <span className="text-french-muted">Role</span>
                <span className="px-2 py-0.5 rounded-md bg-french-dark text-french-gold font-bold uppercase text-[10px]">
                  {user.role}
                </span>
              </div>
            </div>

            {/* WhatsApp Communication Opt-in Toggle */}
            <div className="p-4 rounded-2xl bg-french-cream border border-french-gold/25 flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <label htmlFor="drawer-wa-toggle" className="text-xs font-bold text-french-dark block cursor-pointer">
                  WhatsApp Updates & Deals
                </label>
                <p className="text-[11px] text-french-muted mt-0.5">
                  Receive live preparation progress, digital receipts, and exclusive offers on WhatsApp.
                </p>
              </div>
              <input
                id="drawer-wa-toggle"
                type="checkbox"
                checked={whatsappOptIn}
                onChange={(e) => handleToggleWhatsApp(e.target.checked)}
                className="w-4 h-4 rounded text-french-gold accent-french-gold mt-1 cursor-pointer"
              />
            </div>

            {/* Order History Section */}
            <div>
              <h4 className="font-serif font-bold text-base text-french-dark mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-french-gold" />
                <span>Your Past Orders</span>
              </h4>

              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-french-cream text-center text-xs text-french-muted space-y-2">
                    <ShoppingBag className="w-8 h-8 text-french-gold/50 mx-auto" />
                    <p>No past orders found yet. Explore our delicious menu to start ordering!</p>
                  </div>
                ) : (
                  orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-4 rounded-2xl bg-french-cream/80 border border-french-gold/25 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="font-mono text-french-gold bg-french-dark px-2.5 py-0.5 rounded">
                          #{o.order_number}
                        </span>
                        <span
                          className={`uppercase text-[10px] px-2 py-0.5 rounded font-bold ${
                            o.order_status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.order_status}
                        </span>
                      </div>

                      <p className="text-xs text-french-dark font-medium">
                        {o.items
                          ? o.items.map((i) => `${i.item_name} ×${i.quantity}`).join(', ')
                          : 'FrenchBell Combo Meal'}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-french-gold/20 text-xs">
                        <span className="font-serif font-extrabold text-french-dark text-sm">
                          ₹{Number(o.total).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => {
                              if (onTrackOrder) onTrackOrder(o);
                              if (onClose) onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-french-gold text-french-dark font-extrabold text-[11px] hover:bg-french-gold-hover transition-all flex items-center gap-1 shadow-sm"
                            title="Live Order Tracking"
                          >
                            <Clock className="w-3 h-3 text-french-dark" />
                            <span>Track</span>
                          </button>
                          <button
                            onClick={() => {
                              if (onViewReceipt) onViewReceipt(o);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-french-cream border border-french-gold/40 text-french-dark font-bold text-[11px] hover:border-french-gold transition-all flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-french-gold" />
                            <span>View</span>
                          </button>
                          <a
                            href={`/api/receipts/${o.order_number}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-french-dark text-french-gold font-bold text-[11px] hover:bg-french-gold hover:text-french-dark transition-all flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>PDF</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Footer Bar: Logout */}
          <div className="p-5 bg-french-dark border-t border-french-gold/20">
            <button
              onClick={() => {
                logout();
                addNotification('Logged Out', 'You have been signed out.', 'info');
                if (onClose) onClose();
              }}
              className="w-full py-3 rounded-xl bg-red-950/40 text-red-400 border border-red-800/40 font-bold text-xs uppercase tracking-wider hover:bg-red-900 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
