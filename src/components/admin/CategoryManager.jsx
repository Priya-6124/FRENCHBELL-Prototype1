import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Layers, Plus, Edit, Trash2, ArrowUp, ArrowDown, Check, X, AlertCircle } from 'lucide-react';

export default function CategoryManager() {
  const { categories, setCategories, menuItems, addNotification } = useApp();
  const { token } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setError('');
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanSlug = slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingCategory) {
      // Update
      const updated = {
        ...editingCategory,
        name: name.trim(),
        slug: cleanSlug
      };

      setCategories(prev => prev.map(c => c.id === editingCategory.id ? updated : c));
      addNotification('Category Updated', `Updated "${updated.name}"`, 'success');

      try {
        await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updated)
        });
      } catch (err) {}
    } else {
      // Create
      const newCat = {
        id: Date.now(),
        name: name.trim(),
        slug: cleanSlug,
        display_order: categories.length + 1,
        active: 1
      };

      setCategories(prev => [...prev, newCat]);
      addNotification('Category Created', `Created "${newCat.name}"`, 'success');

      try {
        await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newCat)
        });
      } catch (err) {}
    }

    setShowAddModal(false);
  };

  const handleDelete = async (cat) => {
    // Check if items depend on this category
    const count = (menuItems || []).filter(m => m.category_id === cat.id || m.category_slug === cat.slug).length;
    if (count > 0) {
      alert(`Cannot delete "${cat.name}": ${count} active menu item(s) belong to this category. Please reassign or delete the items first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    setCategories(prev => prev.filter(c => c.id !== cat.id));
    addNotification('Category Removed', `Deleted category "${cat.name}"`, 'info');

    try {
      await fetch(`/api/categories/${cat.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {}
  };

  const handleToggleActive = async (cat) => {
    const updated = { ...cat, active: cat.active === 1 ? 0 : 1 };
    setCategories(prev => prev.map(c => c.id === cat.id ? updated : c));

    try {
      await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
      addNotification('Category Status', `"${cat.name}" is now ${updated.active ? 'Active' : 'Hidden'}`, 'info');
    } catch (err) {}
  };

  const handleMoveOrder = async (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= categories.length) return;

    const list = [...categories];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    // Reassign display_order
    const reordered = list.map((c, i) => ({ ...c, display_order: i + 1 }));
    setCategories(reordered);

    // Sync to server
    for (const c of reordered) {
      try {
        await fetch(`/api/categories/${c.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(c)
        });
      } catch (err) {}
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-widest mb-1.5">
            <Layers className="w-4 h-4 text-french-gold" />
            <span>Menu Architecture & Taxonomy</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-french-cream">
            CATEGORY MANAGEMENT
          </h2>
          <p className="text-xs text-french-cream/80 mt-1">
            Organize cafe menu categories, rearrange tab order, and enable or disable visibility.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-french-card border border-french-gold/30 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[11px]">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Category Name</th>
                <th className="p-4">Slug Identifier</th>
                <th className="p-4">Active Dishes</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
              {categories.map((cat, idx) => {
                const dishCount = (menuItems || []).filter(m => m.category_id === cat.id || m.category_slug === cat.slug).length;

                return (
                  <tr key={cat.id} className="hover:bg-french-cream/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveOrder(idx, -1)}
                          className="p-1 rounded hover:bg-french-gold/20 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === categories.length - 1}
                          onClick={() => handleMoveOrder(idx, 1)}
                          className="p-1 rounded hover:bg-french-gold/20 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-french-muted text-[11px] ml-1">#{idx + 1}</span>
                      </div>
                    </td>

                    <td className="p-4 font-serif font-bold text-sm text-french-dark">
                      {cat.name}
                    </td>

                    <td className="p-4 font-mono text-french-muted">
                      {cat.slug}
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-french-gold/20 text-french-dark">
                        {dishCount} Items
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border transition-all ${
                          cat.active !== 0
                            ? 'bg-emerald-500/20 text-emerald-800 border-emerald-500/40'
                            : 'bg-red-500/20 text-red-700 border-red-500/40'
                        }`}
                      >
                        {cat.active !== 0 ? 'Active' : 'Hidden'}
                      </button>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="px-3 py-1.5 rounded-xl bg-french-dark text-french-gold font-bold text-[11px] uppercase hover:bg-french-gold hover:text-french-dark transition-all"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(cat)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white font-bold text-[11px] uppercase transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit Category */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-french-dark border-2 border-french-gold rounded-3xl p-6 sm:p-7 shadow-2xl text-french-cream space-y-5 gold-glow">
            <div className="flex items-center justify-between pb-3 border-b border-french-gold/30">
              <h3 className="font-serif font-black text-xl text-french-gold">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-french-cream/60 hover:text-french-cream p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-cream/90 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Desserts & Beverages"
                  className="w-full p-3 rounded-xl border border-french-gold/40 bg-french-brown/50 text-french-cream text-xs font-semibold focus:outline-none focus:border-french-gold"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-cream/90 mb-1.5">
                  Slug / URL Key
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="desserts-beverages"
                  className="w-full p-3 rounded-xl border border-french-gold/40 bg-french-brown/50 text-french-cream text-xs font-mono focus:outline-none focus:border-french-gold"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-french-brown/70 hover:bg-french-brown text-french-cream font-bold text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-102 transition-all gold-glow"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
