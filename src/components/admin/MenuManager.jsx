import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import BrandedFoodImage from '../BrandedFoodImage';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Search, Sparkles, Upload, Image as ImageIcon, X } from 'lucide-react';

const LOCAL_FOOD_PRESETS = [
  { label: 'Gourmet Burger', path: '/assets/food/burger.jpg' },
  { label: 'Crispy Fries', path: '/assets/food/fries.jpg' },
  { label: 'Dumplings / Momos', path: '/assets/food/momos.jpg' },
  { label: 'Crispy Strips', path: '/assets/food/strips.jpg' },
  { label: 'Club Sandwich', path: '/assets/food/sandwich.jpg' },
  { label: 'Kathi / Shawarma Roll', path: '/assets/food/rolls.jpg' },
  { label: 'Loaded Fries Bowl', path: '/assets/food/loaded.jpg' },
  { label: 'Grand Sampler Platter', path: '/assets/food/platter.jpg' },
];

export default function MenuManager() {
  const { menuItems, setMenuItems, categories, addNotification } = useApp();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const fileInputRef = useRef(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    category_id: 1,
    description: '',
    price: '',
    price_chicken: '',
    price_veg: '',
    veg_type: 'veg',
    image_url: '/assets/food/burger.jpg',
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
      addNotification('Inventory Updated', `Item marked as ${newVal === 1 ? 'Available' : 'SOLD OUT'}`, 'info');
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

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      setForm(prev => ({ ...prev, image_url: base64Data }));

      // Try uploading to server
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ base64Data, filename: file.name })
        });
        const data = await res.json();
        if (data.image_url) {
          setForm(prev => ({ ...prev, image_url: data.image_url }));
        }
      } catch (err) {}
    };
    reader.readAsDataURL(file);
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
      image_url: form.image_url || '/assets/food/burger.jpg',
      popular: form.popular ? 1 : 0,
      available: form.available ? 1 : 0
    };

    if (editingItem) {
      setMenuItems(prev => prev.map(i => i.id === editingItem.id ? newItem : i));
      addNotification('Menu Item Updated', `${newItem.name} saved!`, 'success');
    } else {
      setMenuItems(prev => [newItem, ...prev]);
      addNotification('Menu Item Added', `${newItem.name} added to menu!`, 'success');
    }

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const endpoint = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
      await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newItem)
      });
    } catch (e) {}

    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category_id: item.category_id || 1,
      description: item.description || '',
      price: item.price,
      price_chicken: item.price_chicken || '',
      price_veg: item.price_veg || '',
      veg_type: item.veg_type || 'veg',
      image_url: item.image_url || '/assets/food/burger.jpg',
      popular: item.popular || 0,
      available: item.available !== undefined ? item.available : 1
    });
    setShowAddModal(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      name: '',
      category_id: 1,
      description: '',
      price: 99,
      price_chicken: '',
      price_veg: '',
      veg_type: 'veg',
      image_url: '/assets/food/burger.jpg',
      popular: 0,
      available: 1
    });
    setShowAddModal(true);
  };

  const filtered = menuItems.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.category_slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-french-dark p-6 rounded-3xl text-french-cream border border-french-gold/20 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>French Bell Culinary Inventory</span>
          </div>
          <h2 className="font-serif font-extrabold text-2xl text-french-cream">
            Menu Item Management
          </h2>
          <p className="text-xs text-french-cream/80 mt-1">
            Add new dishes, upload local food artwork, update prices, and control in-stock availability.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4 bg-french-card p-4 rounded-2xl border border-french-gold/20 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-french-gold" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-french-cream/60 border border-french-gold/25 text-sm text-french-dark focus:outline-none focus:border-french-gold"
          />
        </div>
        <span className="text-xs font-bold text-french-muted">
          Showing <strong>{filtered.length}</strong> items
        </span>
      </div>

      {/* Menu Items Table */}
      <div className="bg-french-card rounded-3xl border border-french-gold/25 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-french-dark">
            <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-bold text-[11px] border-b border-french-gold/20">
              <tr>
                <th className="py-3.5 px-4">Dish Photo</th>
                <th className="py-3.5 px-4">Name & Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-french-gold/15 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-french-cream/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-french-gold/30 shadow-sm">
                      <BrandedFoodImage
                        src={item.image_url}
                        name={item.name}
                        category={item.category_slug}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-serif font-bold text-sm text-french-dark">{item.name}</div>
                    <div className="text-[11px] text-french-muted truncate">{item.description}</div>
                  </td>
                  <td className="py-3 px-4 capitalize font-semibold text-french-warm">
                    {item.category_slug || 'Specialty'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1.5 ${
                      item.veg_type === 'veg' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.veg_type === 'veg' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      <span>{item.veg_type === 'veg' ? 'Veg' : 'Non-Veg'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    {item.price_chicken ? `Chicken ₹${item.price_chicken} / Veg ₹${item.price_veg}` : `₹${item.price}`}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleAvailable(item.id, item.available)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        item.available === 1
                          ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                          : 'bg-red-600 text-white shadow-sm hover:bg-red-700'
                      }`}
                    >
                      {item.available === 1 ? 'In Stock' : 'Sold Out'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg bg-french-gold/20 hover:bg-french-gold hover:text-french-dark text-french-dark transition-colors"
                      title="Edit Item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg bg-red-100 hover:bg-red-600 hover:text-white text-red-600 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-french-card border border-french-gold/40 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            
            <div className="p-5 bg-french-dark text-french-cream border-b border-french-gold/20 flex items-center justify-between">
              <h3 className="font-serif font-extrabold text-xl text-french-gold">
                {editingItem ? 'Edit Dish Details' : 'Add New Cafe Dish'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-french-cream/80 hover:text-french-gold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-4 text-french-dark flex-1">
              
              {/* Dish Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Dish Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Monster Cheesy Zinger"
                  className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold"
                  required
                />
              </div>

              {/* Category & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Category *</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Veg / Non-Veg *</label>
                  <select
                    value={form.veg_type}
                    onChange={(e) => setForm({ ...form, veg_type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold"
                  >
                    <option value="veg">Pure Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Standard Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm font-mono font-bold focus:outline-none focus:border-french-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Chicken Var. (₹)</label>
                  <input
                    type="number"
                    value={form.price_chicken}
                    onChange={(e) => setForm({ ...form, price_chicken: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm font-mono focus:outline-none focus:border-french-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Veg Var. (₹)</label>
                  <input
                    type="number"
                    value={form.price_veg}
                    onChange={(e) => setForm({ ...form, price_veg: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm font-mono focus:outline-none focus:border-french-gold"
                  />
                </div>
              </div>

              {/* IMAGE SELECTION / UPLOAD (No external link requirement!) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider">
                  Dish Image (Upload Local Image or Select Preset)
                </label>

                {/* Image Preview & Upload Button */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-french-cream border border-french-gold/30">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-french-gold/40 shrink-0">
                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-french-dark text-french-gold font-bold text-xs flex items-center gap-1.5 hover:bg-french-gold hover:text-french-dark transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo from Device</span>
                    </button>
                    <span className="text-[10px] text-french-muted block">Direct file upload saved to cafe storage.</span>
                  </div>
                </div>

                {/* Preset AI Images Selector */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-french-muted block">Or Choose AI Food Preset:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {LOCAL_FOOD_PRESETS.map((p) => (
                      <button
                        key={p.path}
                        type="button"
                        onClick={() => setForm({ ...form, image_url: p.path })}
                        className={`py-1.5 px-2 rounded-lg text-left text-[11px] font-semibold truncate border transition-all ${
                          form.image_url === p.path
                            ? 'bg-french-gold text-french-dark border-french-dark font-bold shadow'
                            : 'bg-french-cream/60 border-french-gold/20 text-french-dark hover:border-french-gold'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ingredients, seasonings and tasting notes..."
                  className="w-full px-4 py-2 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold"
                />
              </div>

              <div className="p-4 bg-french-dark text-french-cream rounded-2xl flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-french-gold/30 text-xs font-bold hover:bg-french-brown"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-french-gold text-french-dark font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold-hover shadow-md"
                >
                  {editingItem ? 'Save Changes' : 'Publish Dish'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
