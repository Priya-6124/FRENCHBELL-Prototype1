import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import BrandedFoodImage from '../BrandedFoodImage';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Search, Sparkles } from 'lucide-react';

export default function MenuManager() {
  const { menuItems, setMenuItems, categories, addNotification } = useApp();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    category_id: 1,
    description: '',
    price: '',
    price_chicken: '',
    price_veg: '',
    veg_type: 'veg',
    image_url: '',
    popular: 0,
    available: 1
  });

  const handleToggleAvailable = async (itemId, currentVal) => {
    const newVal = currentVal === 1 ? 0 : 1;
    setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, available: newVal } : i));

    try {
      await fetch(`/api/menu/${itemId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ available: newVal })
      });
      addNotification('Inventory Updated 🍔', `Item marked as ${newVal === 1 ? 'Available' : 'SOLD OUT'}`, 'info');
    } catch (e) {}
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    setMenuItems(prev => prev.filter(i => i.id !== itemId));

    try {
      await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      addNotification('Item Deleted', 'Menu item removed.', 'info');
    } catch (e) {}
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      category_id: Number(form.category_id),
      category_slug: categories.find(c => c.id === Number(form.category_id))?.slug || 'starters',
      name: form.name,
      description: form.description,
      price: Number(form.price),
      price_chicken: form.price_chicken ? Number(form.price_chicken) : null,
      price_veg: form.price_veg ? Number(form.price_veg) : null,
      veg_type: form.veg_type,
      image_url: form.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      popular: form.popular ? 1 : 0,
      available: form.available ? 1 : 0
    };

    if (editingItem) {
      setMenuItems(prev => prev.map(i => i.id === editingItem.id ? newItem : i));
      addNotification('Menu Item Updated ✏️', `${newItem.name} saved!`, 'success');
    } else {
      setMenuItems(prev => [newItem, ...prev]);
      addNotification('Menu Item Added 🎉', `${newItem.name} added to menu!`, 'success');
    }

    setShowAddModal(false);
    setEditingItem(null);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category_id: item.category_id || 1,
      description: item.description || '',
      price: item.price,
      price_chicken: item.price_chicken || '',
      price_veg: item.price_veg || '',
      veg_type: item.veg_type || 'veg',
      image_url: item.image_url || '',
      popular: item.popular || 0,
      available: item.available !== undefined ? item.available : 1
    });
    setShowAddModal(true);
  };

  const filtered = menuItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="p-4 rounded-2xl bg-french-dark text-french-cream border border-french-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-extrabold text-2xl text-french-gold">
            Menu Item & Inventory Manager
          </h3>
          <p className="text-xs text-french-cream/80">
            Control items, pricing, images & quick Sold Out inventory toggles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-french-gold" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food item..."
              className="pl-9 pr-3 py-2 rounded-xl bg-french-brown border border-french-gold/30 text-xs text-french-cream focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setForm({ name: '', category_id: 1, description: '', price: '', price_chicken: '', price_veg: '', veg_type: 'veg', image_url: '', popular: 0, available: 1 });
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Menu Table */}
      <div className="bg-french-card border border-french-gold/30 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[11px] border-b border-french-gold/20">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Veg / Non-Veg</th>
                <th className="p-4">Price</th>
                <th className="p-4">Inventory Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-french-cream/60 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-french-gold/30 shrink-0">
                      <BrandedFoodImage src={item.image_url} name={item.name} category={item.category_slug} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-serif font-bold text-sm text-french-dark block">{item.name}</span>
                      {item.popular === 1 && <span className="text-[10px] text-french-gold font-extrabold uppercase">★ Popular</span>}
                    </div>
                  </td>
                  <td className="p-4 uppercase font-bold text-french-muted">
                    {item.category_name || item.category_slug}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.veg_type === 'veg' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.veg_type}
                    </span>
                  </td>
                  <td className="p-4 font-serif font-extrabold text-sm">
                    ₹{item.price} {item.price_chicken ? `(C:₹${item.price_chicken} / V:₹${item.price_veg})` : ''}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAvailable(item.id, item.available)}
                      className={`px-3 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all ${
                        item.available === 1
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-red-700 text-white hover:bg-red-800'
                      }`}
                    >
                      {item.available === 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{item.available === 1 ? 'Available' : 'SOLD OUT'}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditModal(item)} className="p-1.5 rounded-lg bg-french-gold/20 text-french-warm hover:bg-french-gold transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-french-card border border-french-gold/30 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif font-extrabold text-2xl text-french-dark">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs font-bold text-french-dark">
              <div>
                <label className="block mb-1">Item Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Category *</label>
                  <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Veg / Non-Veg *</label>
                  <select value={form.veg_type} onChange={e => setForm({...form, veg_type: e.target.value})} className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60">
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Standard Price (₹) *</label>
                <input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Chicken Price (Optional)</label>
                  <input type="number" value={form.price_chicken} onChange={e => setForm({...form, price_chicken: e.target.value})} placeholder="e.g. 100 for Momos" className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
                </div>
                <div>
                  <label className="block mb-1">Veg Price (Optional)</label>
                  <input type="number" value={form.price_veg} onChange={e => setForm({...form, price_veg: e.target.value})} placeholder="e.g. 80 for Momos" className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
                </div>
              </div>

              <div>
                <label className="block mb-1">Image URL</label>
                <input type="text" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.popular === 1} onChange={e => setForm({...form, popular: e.target.checked ? 1 : 0})} />
                  <span>Mark as Popular ★</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border border-french-gold/30 bg-french-cream">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-french-dark text-french-gold font-extrabold uppercase">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
