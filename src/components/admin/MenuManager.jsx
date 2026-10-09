import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import BrandedFoodImage from '../BrandedFoodImage';
import {
  Plus, Edit, Trash2, CheckCircle2, XCircle, Search, Sparkles,
  Upload, Image as ImageIcon, X, AlertTriangle, Clock, Layers,
  Star, Sliders, Check, RefreshCw, Ban, ChevronRight
} from 'lucide-react';

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

export default function MenuManager({ initialTab = 'all' }) {
  const { menuItems, setMenuItems, categories, addNotification } = useApp();
  const { token } = useAuth();

  // Active view: 'all' | 'veg' | 'non-veg' | 'availability' | 'customizations'
  const [activeSubTab, setActiveSubTab] = useState(initialTab === 'availability' ? 'availability' : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialTab === 'availability') {
      setActiveSubTab('availability');
    } else if (initialTab === 'all') {
      setActiveSubTab('all');
    }
  }, [initialTab]);

  // Form State for Add / Edit
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
    available: 1,
    stock_quantity: 20,
    prep_time_mins: 12,
    is_special: 0,
    is_recommended: 0,
    customizations: 'Extra Cheese (+₹25), Spicy Dip (+₹20)'
  });

  // Toggle Availability (In Stock vs Sold Out)
  const handleToggleAvailable = async (itemId, currentVal) => {
    const newVal = currentVal === 1 ? 0 : 1;
    setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, available: newVal } : i));

    try {
      const res = await fetch(`/api/menu/${itemId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ available: newVal })
      });
      if (res.ok) {
        addNotification('Availability Updated', `Item is now ${newVal === 1 ? 'Available' : 'OUT OF STOCK (Unavailable for customers)'}`, 'info');
      }
    } catch (e) {}
  };

  // Adjust stock quantity directly
  const handleUpdateStock = async (itemId, newStock) => {
    const qty = Math.max(0, Number(newStock));
    const isAvail = qty > 0 ? 1 : 0;

    setMenuItems(prev => prev.map(i => i.id === itemId ? {
      ...i,
      stock_quantity: qty,
      available: qty === 0 ? 0 : i.available
    } : i));

    try {
      await fetch(`/api/menu/${itemId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock_quantity: qty })
      });
      if (qty === 0) {
        addNotification('Out of Stock Triggered', 'Item reached 0 stock and is now marked Currently Unavailable.', 'warning');
      }
    } catch (e) {}
  };

  // Delete Item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    setMenuItems(prev => prev.filter(i => i.id !== itemId));

    try {
      await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      addNotification('Item Deleted', 'Menu item permanently removed.', 'info');
    } catch (e) {}
  };

  // Image Upload Handler (Strict type and size validation per Section 9)
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    // 1. Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.');
      addNotification('Upload Error', 'Please select a valid JPEG, PNG or WebP image.', 'error');
      return;
    }

    // 2. Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please upload a smaller image.');
      addNotification('Upload Error', 'File size exceeds 5MB limit.', 'error');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      // Immediate preview
      setForm(prev => ({ ...prev, image_url: base64Data }));

      // Upload to server storage
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
          addNotification('Image Uploaded', 'Stored to cafe uploads and verified.', 'success');
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      } catch (err) {
        setUploadError(err.message || 'Server image storage failed.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save (Create or Update) Item
  const handleSaveItem = async (e) => {
    e.preventDefault();

    const stockQty = Number(form.stock_quantity !== undefined ? form.stock_quantity : 20);
    const isAvail = stockQty === 0 ? 0 : (form.available ? 1 : 0);

    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      category_id: Number(form.category_id),
      category_slug: categories.find(c => c.id === Number(form.category_id))?.slug || 'starters',
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      price_chicken: form.price_chicken ? Number(form.price_chicken) : null,
      price_veg: form.price_veg ? Number(form.price_veg) : null,
      veg_type: form.veg_type,
      image_url: form.image_url || '/assets/food/burger.jpg',
      popular: form.popular || form.is_recommended ? 1 : 0,
      available: isAvail,
      stock_quantity: stockQty,
      prep_time_mins: Number(form.prep_time_mins || 12),
      is_special: form.is_special ? 1 : 0,
      is_recommended: form.is_recommended || form.popular ? 1 : 0,
      customizations: form.customizations || ''
    };

    if (editingItem) {
      setMenuItems(prev => prev.map(i => i.id === editingItem.id ? newItem : i));
      addNotification('Menu Item Updated', `${newItem.name} saved successfully!`, 'success');
    } else {
      setMenuItems(prev => [newItem, ...prev]);
      addNotification('Menu Item Added', `${newItem.name} added to live menu!`, 'success');
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
    setUploadError('');
    setForm({
      name: item.name || '',
      category_id: item.category_id || 1,
      description: item.description || '',
      price: item.price || '',
      price_chicken: item.price_chicken || '',
      price_veg: item.price_veg || '',
      veg_type: item.veg_type || 'veg',
      image_url: item.image_url || '/assets/food/burger.jpg',
      popular: item.popular || item.is_recommended ? 1 : 0,
      available: item.available !== undefined ? item.available : 1,
      stock_quantity: item.stock_quantity !== undefined ? item.stock_quantity : 20,
      prep_time_mins: item.prep_time_mins || 12,
      is_special: item.is_special ? 1 : 0,
      is_recommended: item.is_recommended || item.popular ? 1 : 0,
      customizations: item.customizations || 'Extra Cheese (+₹25), Spicy Dip (+₹20)'
    });
    setShowAddModal(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setUploadError('');
    setForm({
      name: '',
      category_id: categories[0]?.id || 1,
      description: '',
      price: '',
      price_chicken: '',
      price_veg: '',
      veg_type: 'veg',
      image_url: '/assets/food/burger.jpg',
      popular: 0,
      available: 1,
      stock_quantity: 20,
      prep_time_mins: 12,
      is_special: 0,
      is_recommended: 0,
      customizations: 'Extra Cheese (+₹25), Spicy Dip (+₹20)'
    });
    setShowAddModal(true);
  };

  // Filtered Items based on active tab and search
  const filtered = (menuItems || []).filter(item => {
    // Sub-tab filter
    if (activeSubTab === 'veg' && item.veg_type !== 'veg') return false;
    if (activeSubTab === 'non-veg' && item.veg_type !== 'non-veg') return false;
    if (activeSubTab === 'availability' && false) return false; // in availability we show all but focused

    // Category filter
    if (selectedCategory !== 'all' && String(item.category_id) !== String(selectedCategory)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchCat = (item.category_slug || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Master Menu & Recipe Catalog</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-french-cream">
            MENU MANAGEMENT
          </h2>
          <p className="text-xs text-french-cream/80 mt-1 max-w-xl">
            Add, update, or retire food dishes. Manage real-time stock levels, dietary classifications, prep times, and image photography.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs (Requirement 8) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-french-gold/20 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'veg', label: 'Veg Only' },
            { id: 'non-veg', label: 'Non-Veg Only' },
            { id: 'availability', label: 'Availability & Stock' },
            { id: 'customizations', label: 'Customizations' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl uppercase tracking-wider text-[11px] font-black transition-all ${
                activeSubTab === tab.id
                  ? 'bg-french-gold text-french-dark shadow gold-glow'
                  : 'bg-french-card text-french-dark/80 hover:bg-french-cream border border-french-gold/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filter & Search Box */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-french-cream/60 border border-french-gold/25 text-xs font-bold text-french-dark focus:outline-none focus:border-french-gold"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-french-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-french-cream/60 border border-french-gold/25 text-xs text-french-dark focus:outline-none focus:border-french-gold"
            />
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: AVAILABILITY & STOCK MANAGEMENT VIEW (Section 10) */}
      {activeSubTab === 'availability' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Live Inventory Decrement:</strong> Orders automatically decrement stock quantity. When stock reaches 0, the item is instantly marked <strong>OUT OF STOCK</strong> on customer apps.
              </span>
            </div>
            <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-amber-500/20">
              Shift Stock
            </span>
          </div>

          <div className="bg-white border border-french-gold/25 rounded-3xl overflow-hidden shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[10px]">
                <tr>
                  <th className="p-3.5">Dish</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Adjust Stock</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Toggle Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
                {filtered.map(item => {
                  const stock = item.stock_quantity !== undefined ? Number(item.stock_quantity) : 20;
                  const isOut = item.available === 0 || stock <= 0;

                  return (
                    <tr key={item.id} className="hover:bg-french-cream/50 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-french-gold/30 shrink-0">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-sm block">{item.name}</span>
                          <span className="text-[10px] text-french-muted">₹{item.price} • {item.veg_type}</span>
                        </div>
                      </td>

                      <td className="p-3.5 capitalize font-bold text-french-muted">
                        {item.category_slug || 'Starters'}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full font-mono font-black text-xs ${
                          stock <= 0 ? 'bg-red-100 text-red-700' :
                          stock <= 5 ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {stock} Units
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateStock(item.id, stock - 1)}
                            className="w-7 h-7 rounded-lg bg-french-cream border border-french-gold/30 font-black text-sm flex items-center justify-center hover:bg-french-gold"
                            title="Decrement stock"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={stock}
                            onChange={(e) => handleUpdateStock(item.id, e.target.value)}
                            className="w-14 text-center py-1 rounded-lg border border-french-gold/30 bg-french-cream font-mono font-bold text-xs"
                          />
                          <button
                            onClick={() => handleUpdateStock(item.id, stock + 5)}
                            className="w-7 h-7 rounded-lg bg-french-cream border border-french-gold/30 font-black text-sm flex items-center justify-center hover:bg-french-gold"
                            title="Add 5 units"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          isOut ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {isOut ? 'OUT OF STOCK' : 'IN STOCK'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleAvailable(item.id, item.available)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                            item.available === 1
                              ? 'bg-red-100 text-red-700 hover:bg-red-600 hover:text-white'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {item.available === 1 ? 'Disable (Sold Out)' : 'Enable Item'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: CUSTOMIZATIONS VIEW (Requirement 8) */}
      {activeSubTab === 'customizations' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-french-dark text-french-cream border border-french-gold/20 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-black text-lg text-french-gold">Dish Customization Add-Ons</h3>
              <p className="text-xs text-french-cream/80">Configure sauces, extra cheese, patty variants, and spice levels.</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-french-gold text-french-dark font-bold text-xs uppercase"
            >
              Add Customization
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-white border border-french-gold/25 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-french-dark">{item.name}</span>
                  <span className="text-[10px] font-mono text-french-muted">#{item.id}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-french-cream/50 border border-french-gold/20 text-xs text-french-dark/90">
                  <span className="text-[10px] font-black uppercase text-french-muted block mb-1">Active Customization Rules:</span>
                  <p className="font-mono text-xs">{item.customizations || 'Extra Cheese (+₹25), Spicy Dip (+₹20)'}</p>
                </div>
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="w-full py-1.5 rounded-xl bg-french-brown/10 text-french-dark hover:bg-french-dark hover:text-french-gold font-bold text-xs uppercase transition-all"
                >
                  Edit Options
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: ALL / VEG / NON-VEG MASTER TABLE VIEW (Requirement 8) */}
      {(activeSubTab === 'all' || activeSubTab === 'veg' || activeSubTab === 'non-veg') && (
        <div className="bg-white rounded-3xl border border-french-gold/25 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-french-dark">
              <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[10px] border-b border-french-gold/20">
                <tr>
                  <th className="py-3.5 px-4">Dish Photo</th>
                  <th className="py-3.5 px-4">Name & Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Dietary</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Prep Time</th>
                  <th className="py-3.5 px-4">Tags</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-french-gold/15 font-medium">
                {filtered.map((item) => {
                  const stock = item.stock_quantity !== undefined ? Number(item.stock_quantity) : 20;
                  const isOut = item.available === 0 || stock <= 0;

                  return (
                    <tr key={item.id} className="hover:bg-french-cream/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-french-gold/30 shadow-sm">
                          <img
                            src={item.image_url}
                            alt={item.name}
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
                        ₹{item.price}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          stock <= 0 ? 'bg-red-100 text-red-700' :
                          stock <= 5 ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {stock} left
                        </span>
                      </td>

                      <td className="py-3 px-4 text-french-muted text-xs">
                        {item.prep_time_mins || 12}m
                      </td>

                      <td className="py-3 px-4 space-x-1">
                        {item.is_special ? (
                          <span className="px-1.5 py-0.5 rounded bg-french-gold text-french-dark text-[9px] font-black uppercase">
                            Special
                          </span>
                        ) : null}
                        {item.is_recommended || item.popular ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-black uppercase">
                            Reco
                          </span>
                        ) : null}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleAvailable(item.id, item.available)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            !isOut
                              ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                              : 'bg-red-600 text-white shadow-sm hover:bg-red-700'
                          }`}
                        >
                          {!isOut ? 'Available' : 'Sold Out'}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT DISH MODAL (Requirement 8 & 9) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-french-card border-2 border-french-gold/40 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 bg-french-dark text-french-cream border-b border-french-gold/20 flex items-center justify-between">
              <h3 className="font-serif font-extrabold text-xl text-french-gold">
                {editingItem ? `Edit: ${editingItem.name}` : 'Add New Cafe Dish'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-french-cream/80 hover:text-french-gold">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-4 text-french-dark flex-1">
              
              {/* Dish Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Dish Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. French Gourmet Paneer Burger"
                  className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold font-medium"
                  required
                />
              </div>

              {/* Category & Dietary Veg / Non-Veg */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Category *</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold font-medium"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Dietary Classification *</label>
                  <select
                    value={form.veg_type}
                    onChange={(e) => setForm({ ...form, veg_type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold font-medium"
                  >
                    <option value="veg">Pure Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              {/* Price, Stock Quantity, Prep Time */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="149"
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm font-mono font-bold focus:outline-none focus:border-french-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                    placeholder="20"
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm font-mono font-bold focus:outline-none focus:border-french-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Prep Time (Mins) *</label>
                  <input
                    type="number"
                    value={form.prep_time_mins}
                    onChange={(e) => setForm({ ...form, prep_time_mins: e.target.value })}
                    placeholder="12"
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm font-mono focus:outline-none focus:border-french-gold"
                  />
                </div>
              </div>

              {/* Special & Recommended Toggles */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-french-cream/50 border border-french-gold/25">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={Boolean(form.is_special)}
                    onChange={(e) => setForm({ ...form, is_special: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 accent-french-gold rounded"
                  />
                  <span>Mark Special Item</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={Boolean(form.is_recommended)}
                    onChange={(e) => setForm({ ...form, is_recommended: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 accent-french-gold rounded"
                  />
                  <span>Mark Recommended Item</span>
                </label>
              </div>

              {/* Customization Options */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Customization Options
                </label>
                <input
                  type="text"
                  value={form.customizations}
                  onChange={(e) => setForm({ ...form, customizations: e.target.value })}
                  placeholder="e.g. Extra Cheese (+₹25), Spicy Mayo Dip (+₹20)"
                  className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold font-mono"
                />
              </div>

              {/* Image Upload & Presets (Section 9) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider">
                  Food Photography (Upload from Device or Select Preset)
                </label>

                {uploadError && (
                  <p className="text-xs text-red-600 font-bold">{uploadError}</p>
                )}

                <div className="flex items-center gap-4 p-3 rounded-2xl bg-french-cream border border-french-gold/30">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-french-gold/40 shrink-0">
                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-french-dark text-french-gold font-bold text-xs flex items-center gap-1.5 hover:bg-french-gold hover:text-french-dark transition-all disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Uploading & Validating...' : 'Upload Image (Max 5MB)'}</span>
                    </button>
                    <span className="text-[10px] text-french-muted block">
                      Stored permanently on server. Displayed immediately to customers.
                    </span>
                  </div>
                </div>

                {/* Presets */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-french-muted block">Or Select Food Preset:</span>
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
                  placeholder="Ingredients, secret spices, and tasting notes..."
                  className="w-full px-4 py-2 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold"
                />
              </div>

              {/* Modal Actions */}
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
                  className="px-6 py-2.5 rounded-xl bg-french-gold text-french-dark font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold-hover shadow-md gold-glow"
                >
                  {editingItem ? 'Save Changes' : 'Publish Dish to Menu'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
