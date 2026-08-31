import React, { useState } from 'react';
import { Users, Phone, ShoppingBag, DollarSign } from 'lucide-react';

export default function CustomerManager() {
  const [customers] = useState([
    { id: 1, name: 'Priya Sundaram', phone: '9876501234', order_count: 5, total_spend: 1420.00, preferred_mode: 'Delivery', last_order: 'Today' },
    { id: 2, name: 'Amit Patel', phone: '9811223344', order_count: 3, total_spend: 890.00, preferred_mode: 'Dine-In', last_order: 'Today' },
    { id: 3, name: 'Sara Khan', phone: '9988776655', order_count: 8, total_spend: 2150.00, preferred_mode: 'Takeaway', last_order: 'Yesterday' },
    { id: 4, name: 'Vikram Singh', phone: '9765432109', order_count: 2, total_spend: 640.00, preferred_mode: 'Delivery', last_order: '3 days ago' },
  ]);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-french-dark text-french-cream border border-french-gold/30">
        <h3 className="font-serif font-extrabold text-2xl text-french-gold">
          Customer Intelligence Directory
        </h3>
        <p className="text-xs text-french-cream/80">
          View active cafe customers, total lifetime spend & preferred order modes.
        </p>
      </div>

      <div className="bg-french-card border border-french-gold/30 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[11px]">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Total Spending</th>
                <th className="p-4">Preferred Mode</th>
                <th className="p-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-french-cream/60">
                  <td className="p-4 font-serif font-bold text-sm text-french-dark">{c.name}</td>
                  <td className="p-4 font-mono text-french-muted">+91 {c.phone}</td>
                  <td className="p-4 font-bold">{c.order_count} Orders</td>
                  <td className="p-4 font-serif font-extrabold text-sm text-emerald-800">₹{c.total_spend.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-french-gold/20 text-french-dark font-bold text-[10px] uppercase">
                      {c.preferred_mode}
                    </span>
                  </td>
                  <td className="p-4 text-french-muted">{c.last_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
