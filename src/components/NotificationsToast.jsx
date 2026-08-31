import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function NotificationsToast() {
  const { notifications } = useApp();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[80] space-y-3 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto p-4 rounded-2xl bg-french-dark/95 border border-french-gold/40 text-french-cream shadow-2xl backdrop-blur-md flex items-start gap-3 animate-slideUp"
        >
          <div className="p-2 rounded-xl bg-french-gold/20 text-french-gold shrink-0">
            {n.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : (n.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <Bell className="w-5 h-5 text-french-gold" />)}
          </div>

          <div className="flex-1">
            <h4 className="font-serif font-bold text-sm text-french-gold">
              {n.title}
            </h4>
            <p className="text-xs text-french-cream/80 mt-0.5 font-normal">
              {n.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
