import React from 'react';
import { Plus, ShoppingBag, Tag, Megaphone, Download, Boxes, Receipt, Zap, ShieldCheck } from 'lucide-react';

export default function QuickActionBar({ onAction }) {
  const actions = [
    { id: 'view-orders', label: 'Live Orders', icon: ShoppingBag, tab: 'orders' },
    { id: 'add-item', label: 'Add Menu Dish', icon: Plus, tab: 'menu-items' },
    { id: 'inventory-stock', label: 'Stock & Out of Stock', icon: Boxes, tab: 'menu-availability' },
    { id: 'receipts', label: 'Invoices & Receipts', icon: Receipt, tab: 'receipts' },
    { id: 'create-offer', label: 'Create Coupon', icon: Tag, tab: 'offers-coupons' },
    { id: 'manage-team', label: 'Admin Team', icon: ShieldCheck, tab: 'settings-admins' },
    { id: 'export-analytics', label: 'Export Excel Report', icon: Download, tab: 'analytics-export', isModal: true },
  ];

  return (
    <div className="p-4 rounded-3xl bg-french-card border border-french-gold/30 shadow-md">
      <h4 className="text-xs font-black uppercase tracking-wider text-french-muted mb-3 flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-french-gold fill-french-gold" />
        <span>Operations Quick Actions</span>
      </h4>
      <div className="flex flex-wrap items-center gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onAction(act)}
              className="px-3.5 py-2 rounded-xl bg-french-dark text-french-gold border border-french-gold/30 hover:bg-french-gold hover:text-french-dark font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center gap-1.5 gold-glow"
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
