import React from 'react';
import {
  LayoutDashboard, ShoppingBag, Utensils, Tag, Image, Users,
  Bike, CreditCard, BarChart3, Settings, LogOut, ArrowLeft, ShieldCheck
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, onBackToSite, onLogout }) {
  const menuNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-orders', label: 'Live Orders', icon: ShoppingBag, badge: 'Live' },
    { id: 'menu-manager', label: 'Menu Items', icon: Utensils },
    { id: 'offers-manager', label: 'Offers & Coupons', icon: Tag },
    { id: 'adverts-manager', label: 'Banners & Ads', icon: Image },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, highlight: true },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'delivery', label: 'Delivery Settings', icon: Bike },
    { id: 'settings', label: 'Cafe Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-french-dark border-r border-french-gold/20 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      
      {/* Top Logo & Header */}
      <div>
        <div className="p-5 border-b border-french-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-french-gold p-0.5 bg-french-dark gold-glow">
              <img src="/assets/logo.jfif" alt="French Bell Admin" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-french-cream tracking-wide">
                FRENCH BELL
              </h2>
              <span className="text-[10px] uppercase font-bold text-french-gold tracking-widest block">
                ADMIN OPERATIONS
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
          {menuNav.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full py-2.5 px-3.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark shadow-md scale-[1.02]'
                    : 'text-french-cream/80 hover:bg-french-brown/60 hover:text-french-gold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-french-dark' : 'text-french-gold'}`} />
                  <span className="font-sans uppercase tracking-wider">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-extrabold uppercase animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls: Back to Cafe & Logout */}
      <div className="p-4 border-t border-french-gold/20 space-y-2">
        <button
          onClick={onBackToSite}
          className="w-full py-2.5 px-3 rounded-xl bg-french-brown/80 border border-french-gold/30 text-french-gold font-bold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back To Customer Website</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full py-2 px-3 rounded-xl text-red-400 font-bold text-xs uppercase tracking-wider hover:bg-red-950/40 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Admin</span>
        </button>
      </div>

    </aside>
  );
}
