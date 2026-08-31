import React from 'react';
import { Plus, ShoppingBag, Tag, Image, Download, Bike, QrCode } from 'lucide-react';

export default function QuickActionBar({ onAction }) {
  const actions = [
    { id: 'add-item', label: '+ Add Menu Item', icon: Plus, tab: 'menu-manager' },
    { id: 'view-orders', label: 'Live Orders', icon: ShoppingBag, tab: 'live-orders' },
    { id: 'table-qr', label: 'Table QRs', icon: QrCode, tab: 'table-qr' },
    { id: 'create-offer', label: 'Create Offer', icon: Tag, tab: 'offers-manager' },
    { id: 'upload-ad', label: 'Promo Banners', icon: Image, tab: 'adverts-manager' },
    { id: 'export-analytics', label: 'Export Report', icon: Download, tab: 'analytics', isModal: true },
  ];

  return (
    <div className="p-4 rounded-2xl bg-french-card border border-french-gold/30 shadow-md">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-french-muted mb-3">
        ⚡ Cafe Operations Quick Actions
      </h4>
      <div className="flex flex-wrap items-center gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onAction(act)}
              className="px-4 py-2.5 rounded-xl bg-french-dark text-french-gold border border-french-gold/30 hover:bg-french-gold hover:text-french-dark font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow flex items-center gap-2 gold-glow"
            >
              <Icon className="w-4 h-4" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
