import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { X, User, Phone, LogOut, Clock, FileText, RotateCcw, ShieldCheck } from 'lucide-react';

export default function ProfileDrawer({ onClose, onViewReceipt }) {
  const { user, logout, isAdmin } = useAuth();
  const { setActiveModal, addNotification } = useApp();
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
    if (user?.phone) {
      fetch(`/api/orders?phone=${user.phone}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data && data.length) setOrders(data); })
        .catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-french-dark/70 backdrop-blur-sm animate-fadeIn" />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-french-card border-l border-french-gold/30 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 bg-french-dark text-french-cream border-b border-french-gold/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-french-gold/20 text-french-gold flex items-center justify-center font-bold text-lg border border-french-gold/30">
                <User className="w-6 h-6 text-french-gold" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-lg text-french-cream">
                  {user.name}
                </h3>
                <span className="text-xs text-french-gold font-mono">
                  +91 {user.phone}
                </span>
              </div>
            </div>

            <button onClick={onClose} className="p-2 rounded-full hover:bg-french-brown text-french-cream">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Profile Body & Order History */}
          <div className="p-5 overflow-y-auto flex-1 space-y-6">
            
            {/* Role Badge */}
            <div className="p-3 rounded-2xl bg-french-cream border border-french-gold/30 flex items-center justify-between">
              <span className="text-xs font-bold text-french-dark uppercase">Account Role</span>
              <span className="px-3 py-1 rounded-full bg-french-dark text-french-gold text-xs font-extrabold uppercase">
                {user.role}
              </span>
            </div>

            {/* Order History Section */}
            <div>
              <h4 className="font-serif font-bold text-base text-french-dark mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-french-gold" />
                <span>Order History</span>
              </h4>

              <div className="space-y-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-2xl bg-french-cream/80 border border-french-gold/25 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="font-mono text-french-gold bg-french-dark px-2 py-0.5 rounded">
                        #{o.order_number}
                      </span>
                      <span className={`uppercase px-2 py-0.5 rounded ${
                        o.order_status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.order_status}
                      </span>
                    </div>

                    <p className="text-xs text-french-dark font-medium">
                      {o.items ? o.items.map(i => `${i.item_name} ×${i.quantity}`).join(', ') : 'French Bell Delicious Meal'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-french-gold/20 text-xs">
                      <span className="font-serif font-extrabold text-french-dark text-sm">₹{Number(o.total).toFixed(2)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (onViewReceipt) onViewReceipt(o);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-french-dark text-french-gold font-bold text-[11px] hover:bg-french-gold hover:text-french-dark transition-all flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
              <span>Log Out Account</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
