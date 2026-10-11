import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel, exportToCsv } from '../../utils/excelExport';
import {
  Boxes, AlertTriangle, CheckCircle2, XCircle, Plus, Search,
  Filter, Download, RefreshCw, Edit, Trash2, ArrowUpRight,
  TrendingDown, ShoppingCart, Sparkles, X, ChevronRight, Package
} from 'lucide-react';
import { INVENTORY_CATEGORIES } from '../../data/inventoryData';

export default function InventoryManager() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, restockInventoryItem, addNotification } = useApp();

  const [activeView, setActiveView] = useState('required'); // 'required' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'low' | 'out' | 'ok'

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [restockModalItem, setRestockModalItem] = useState(null);
  const [restockQty, setRestockQty] = useState(10);
  const [restockNote, setRestockNote] = useState('');

  // Form State for Add / Edit
  const [form, setForm] = useState({
    name: '',
    category: 'Bakery',
    unit: 'units',
    current_stock: 50,
    min_threshold: 20,
    cost_per_unit: 50,
    supplier: '',
    linked_dishes: ''
  });

  // Calculate stats
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(i => i.current_stock > 0 && i.current_stock <= i.min_threshold);
  const outOfStockItems = inventory.filter(i => i.current_stock <= 0);
  const totalInventoryValue = inventory.reduce((sum, i) => sum + (i.current_stock * (i.cost_per_unit || 0)), 0);

  // Items required (Low stock or out of stock)
  const itemsRequired = inventory.filter(i => i.current_stock <= i.min_threshold);

  // Filtered list based on active tab and filters
  const currentList = activeView === 'required' ? itemsRequired : inventory;

  const filteredItems = currentList.filter(item => {
    // Category match
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

    // Status filter
    if (statusFilter === 'low' && (item.current_stock <= 0 || item.current_stock > item.min_threshold)) return false;
    if (statusFilter === 'out' && item.current_stock > 0) return false;
    if (statusFilter === 'ok' && item.current_stock <= item.min_threshold) return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchSup = (item.supplier || '').toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchSup) return false;
    }

    return true;
  });

  // Export to Excel handler
  const handleExportExcel = () => {
    const columns = [
      { header: 'Item ID', key: 'id', width: 80 },
      { header: 'Item Name', key: 'name', width: 180 },
      { header: 'Category', key: 'category', width: 130 },
      { header: 'Current Stock', key: 'current_stock', width: 110 },
      { header: 'Unit', key: 'unit', width: 80 },
      { header: 'Min Threshold', key: 'min_threshold', width: 110 },
      { header: 'Required Restock', key: 'required_qty', width: 120 },
      { header: 'Unit Cost', key: 'cost_per_unit', width: 100, isCurrency: true },
      { header: 'Estimated Reorder Cost', key: 'reorder_cost', width: 140, isCurrency: true },
      { header: 'Stock Status', key: 'status', width: 120 },
      { header: 'Primary Supplier', key: 'supplier', width: 160 },
      { header: 'Last Restocked', key: 'last_restocked', width: 120 }
    ];

    const rows = filteredItems.map(item => {
      const shortfall = Math.max(0, (item.min_threshold * 2) - item.current_stock);
      const status = item.current_stock <= 0 ? 'OUT OF STOCK' : (item.current_stock <= item.min_threshold ? 'LOW STOCK' : 'IN STOCK');
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        current_stock: item.current_stock,
        unit: item.unit,
        min_threshold: item.min_threshold,
        required_qty: shortfall,
        cost_per_unit: item.cost_per_unit,
        reorder_cost: shortfall * (item.cost_per_unit || 0),
        status,
        supplier: item.supplier || 'Local Market',
        last_restocked: item.last_restocked || 'N/A'
      };
    });

    const reportName = activeView === 'required' ? 'FrenchBell_Items_Required_Procurement' : 'FrenchBell_Full_Inventory_Register';
    exportToExcel(reportName, activeView === 'required' ? 'Items Required' : 'Inventory', columns, rows);
    addNotification('Excel Exported', 'Inventory spreadsheet downloaded successfully!', 'success');
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      name: '',
      category: 'Bakery',
      unit: 'units',
      current_stock: 50,
      min_threshold: 20,
      cost_per_unit: 50,
      supplier: '',
      linked_dishes: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      current_stock: item.current_stock,
      min_threshold: item.min_threshold,
      cost_per_unit: item.cost_per_unit,
      supplier: item.supplier || '',
      linked_dishes: Array.isArray(item.linked_dishes) ? item.linked_dishes.join(', ') : (item.linked_dishes || '')
    });
    setShowAddModal(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    const itemData = {
      name: form.name.trim(),
      category: form.category,
      unit: form.unit,
      current_stock: Number(form.current_stock),
      min_threshold: Number(form.min_threshold),
      cost_per_unit: Number(form.cost_per_unit),
      supplier: form.supplier.trim() || 'Local Distributor',
      linked_dishes: form.linked_dishes ? form.linked_dishes.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    if (editingItem) {
      updateInventoryItem(editingItem.id, itemData);
    } else {
      addInventoryItem(itemData);
    }

    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleExecuteRestock = (e) => {
    e.preventDefault();
    if (!restockModalItem) return;
    restockInventoryItem(restockModalItem.id, restockQty, restockNote);
    setRestockModalItem(null);
    setRestockQty(10);
    setRestockNote('');
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" />
            <span>Store Logistics & Procurement</span>
          </div>
          <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-french-gold">
            Inventory & Stock Management
          </h2>
          <p className="text-xs sm:text-sm text-french-cream/80 mt-1">
            Track raw ingredients, view items required for daily operations, and export purchase lists directly to Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-2xl bg-french-brown border border-french-gold/40 text-french-gold hover:bg-french-gold hover:text-french-dark font-extrabold text-xs uppercase tracking-wider transition-all shadow flex items-center gap-2"
            title="Download formatted Excel sheet"
          >
            <Download className="w-4 h-4" />
            <span>Export to Excel (.xls)</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow hover:scale-105 transition-all flex items-center gap-2 gold-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* Swiggy/Zomato style KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="p-5 rounded-2xl bg-french-card border border-french-gold/30 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-french-muted block">
              Total Items
            </span>
            <span className="font-serif font-black text-2xl text-french-dark mt-1 block">
              {totalItems} Items
            </span>
            <span className="text-[11px] text-french-muted font-medium">In active store catalog</span>
          </div>
          <div className="p-3 rounded-2xl bg-french-gold/15 text-french-gold border border-french-gold/30">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Items Required / Low Stock */}
        <div
          onClick={() => setActiveView('required')}
          className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            activeView === 'required'
              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-french-card border-french-gold/30 hover:border-amber-500'
          }`}
        >
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Items Required Today</span>
            </span>
            <span className="font-serif font-black text-2xl text-amber-700 mt-1 block">
              {itemsRequired.length} Items
            </span>
            <span className="text-[11px] text-amber-800 font-semibold underline">
              Click to view restock list
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-700 border border-amber-500/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Out of Stock */}
        <div className="p-5 rounded-2xl bg-french-card border border-french-gold/30 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600 block">
              Out of Stock
            </span>
            <span className="font-serif font-black text-2xl text-red-600 mt-1 block">
              {outOfStockItems.length} Critical
            </span>
            <span className="text-[11px] text-french-muted font-medium">
              {outOfStockItems.length > 0 ? 'Dishes may be blocked' : 'All critical items in stock'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-red-500/15 text-red-600 border border-red-500/30">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Estimated Value */}
        <div className="p-5 rounded-2xl bg-french-card border border-french-gold/30 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 block">
              Current Stock Value
            </span>
            <span className="font-serif font-black text-2xl text-emerald-700 mt-1 block">
              ₹{totalInventoryValue.toLocaleString()}
            </span>
            <span className="text-[11px] text-french-muted font-medium">Estimated cost basis</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main View Switcher & Filter Controls */}
      <div className="p-5 rounded-3xl bg-french-card border border-french-gold/30 shadow-md space-y-4">
        
        {/* Navigation Tabs: "Items Required" vs "All Inventory" */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-french-gold/20">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-french-dark border border-french-gold/30">
            <button
              onClick={() => setActiveView('required')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeView === 'required'
                  ? 'bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark shadow gold-glow'
                  : 'text-french-cream/70 hover:text-french-gold'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Items Required ({itemsRequired.length})</span>
            </button>

            <button
              onClick={() => setActiveView('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeView === 'all'
                  ? 'bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark shadow gold-glow'
                  : 'text-french-cream/70 hover:text-french-gold'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>All Inventory ({totalItems})</span>
            </button>
          </div>

          <div className="text-xs text-french-muted font-semibold">
            {activeView === 'required' ? (
              <span className="text-amber-800 font-bold bg-amber-50 px-3 py-1.5 rounded-full border border-amber-300">
                ⚠️ Showing ingredients at or below reorder threshold
              </span>
            ) : (
              <span>Full inventory ledger with real-time stock levels</span>
            )}
          </div>
        </div>

        {/* Search & Category Filter Row */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-french-gold" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ingredient, category, or supplier..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-french-gold/30 bg-french-cream text-xs font-semibold text-french-dark placeholder:text-french-muted focus:outline-none focus:border-french-gold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-french-muted hover:text-french-dark"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2.5 rounded-2xl border border-french-gold/30 bg-french-cream text-xs font-bold text-french-dark focus:outline-none focus:border-french-gold"
            >
              {INVENTORY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Status filter if in All view */}
            {activeView === 'all' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2.5 rounded-2xl border border-french-gold/30 bg-french-cream text-xs font-bold text-french-dark focus:outline-none focus:border-french-gold"
              >
                <option value="all">All Status</option>
                <option value="low">Low Stock Only</option>
                <option value="out">Out of Stock Only</option>
                <option value="ok">In Stock Only</option>
              </select>
            )}
          </div>
        </div>

      </div>

      {/* Inventory Table */}
      <div className="rounded-3xl bg-french-card border border-french-gold/30 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-french-dark text-french-cream border-b border-french-gold/30">
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px] text-french-gold">Item Name</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px]">Category</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px] text-center">Current Stock</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px] text-center">Min Threshold</th>
                {activeView === 'required' && (
                  <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px] text-center text-amber-400">Restock Needed</th>
                )}
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px] text-right">Unit Cost</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px] text-center">Status</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px]">Supplier</th>
                <th className="p-4 font-serif font-bold uppercase tracking-wider text-[11px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-french-gold/15 font-medium text-french-dark">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isOut = item.current_stock <= 0;
                  const isLow = !isOut && item.current_stock <= item.min_threshold;
                  const shortfall = Math.max(0, (item.min_threshold * 2) - item.current_stock);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-french-gold/10 transition-colors ${
                        isOut ? 'bg-red-50/40' : (isLow ? 'bg-amber-50/30' : '')
                      }`}
                    >
                      {/* Name & Linked dishes */}
                      <td className="p-4">
                        <span className="font-bold text-french-dark block text-sm">
                          {item.name}
                        </span>
                        {item.linked_dishes && item.linked_dishes.length > 0 && (
                          <span className="text-[10px] text-french-muted italic block truncate max-w-xs">
                            Used in: {Array.isArray(item.linked_dishes) ? item.linked_dishes.join(', ') : item.linked_dishes}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-french-cream border border-french-gold/30 text-french-dark">
                          {item.category}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="p-4 text-center">
                        <span className={`font-mono font-black text-sm ${
                          isOut ? 'text-red-600' : (isLow ? 'text-amber-700' : 'text-emerald-700')
                        }`}>
                          {item.current_stock}
                        </span>
                        <span className="text-[10px] text-french-muted ml-1">{item.unit}</span>
                      </td>

                      {/* Min Threshold */}
                      <td className="p-4 text-center font-mono text-french-muted font-bold">
                        {item.min_threshold} {item.unit}
                      </td>

                      {/* Restock Needed (if required view) */}
                      {activeView === 'required' && (
                        <td className="p-4 text-center">
                          <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-mono font-black text-xs border border-amber-300">
                            +{shortfall} {item.unit}
                          </span>
                        </td>
                      )}

                      {/* Unit Cost */}
                      <td className="p-4 text-right font-mono font-bold text-french-dark">
                        ₹{item.cost_per_unit || 0}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm animate-pulse">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Healthy
                          </span>
                        )}
                      </td>

                      {/* Supplier */}
                      <td className="p-4 text-french-muted text-xs truncate max-w-[140px]">
                        {item.supplier || 'Local Market'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Restock Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setRestockModalItem(item);
                              setRestockQty(shortfall > 0 ? shortfall : 10);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-french-dark text-french-gold hover:bg-french-gold hover:text-french-dark font-extrabold text-[10px] uppercase tracking-wider transition-all shadow-sm flex items-center gap-1"
                            title="Restock Item"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Restock</span>
                          </button>

                          {/* Edit Item */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-french-dark hover:bg-french-cream transition-colors"
                            title="Edit details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete "${item.name}" from inventory?`)) {
                                deleteInventoryItem(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={activeView === 'required' ? 9 : 8} className="p-12 text-center text-french-muted">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
                    <p className="font-serif font-bold text-base text-french-dark">
                      {activeView === 'required' ? 'All Inventory Levels are Healthy!' : 'No inventory items match your search.'}
                    </p>
                    <p className="text-xs text-french-muted mt-1">
                      {activeView === 'required'
                        ? 'None of your tracked ingredients or packaging supplies are below minimum reorder thresholds.'
                        : 'Try adjusting your search query or category filters.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-french-card border border-french-gold/30 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-french-gold/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-french-gold/20 text-french-gold">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-french-dark">
                    Restock Inventory Item
                  </h3>
                  <p className="text-xs text-french-muted">{restockModalItem.name}</p>
                </div>
              </div>
              <button
                onClick={() => setRestockModalItem(null)}
                className="p-1.5 rounded-full hover:bg-french-cream text-french-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteRestock} className="space-y-4 text-xs font-bold text-french-dark">
              <div className="p-3.5 rounded-2xl bg-french-cream/80 border border-french-gold/20 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-french-muted uppercase tracking-wider block">Current Stock</span>
                  <span className="font-mono font-black text-lg text-french-dark">
                    {restockModalItem.current_stock} {restockModalItem.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-french-muted uppercase tracking-wider block text-right">Min Threshold</span>
                  <span className="font-mono font-black text-lg text-french-muted text-right block">
                    {restockModalItem.min_threshold} {restockModalItem.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider">
                  Quantity to Add ({restockModalItem.unit}) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    className="flex-1 p-3 rounded-xl border border-french-gold/30 bg-french-cream font-mono font-black text-base focus:outline-none focus:border-french-gold"
                  />
                  {/* Preset quick buttons */}
                  {[10, 25, 50].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setRestockQty(amt)}
                      className="px-3 py-3 rounded-xl border border-french-gold/30 bg-french-cream hover:bg-french-gold hover:text-french-dark font-extrabold text-xs transition-colors"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider">
                  Supplier / Invoice Note (Optional)
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="e.g. Batch #492, fresh morning delivery"
                  className="w-full p-3 rounded-xl border border-french-gold/30 bg-french-cream font-normal text-xs focus:outline-none focus:border-french-gold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-french-gold/30 text-french-dark hover:bg-french-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-french-dark text-french-gold hover:bg-french-gold hover:text-french-dark font-black text-xs uppercase tracking-wider transition-all shadow gold-glow"
                >
                  Confirm Restock (+{restockQty} {restockModalItem.unit})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Inventory Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-french-card border border-french-gold/30 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-french-gold/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-french-gold/20 text-french-gold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-french-dark">
                    {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                  </h3>
                  <p className="text-xs text-french-muted">Configure stock levels, thresholds & supplier</p>
                </div>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                className="p-1.5 rounded-full hover:bg-french-cream text-french-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-bold text-french-dark">
              <div>
                <label className="block mb-1 uppercase tracking-wider">Item / Ingredient Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Brioche Burger Buns"
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream focus:outline-none focus:border-french-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream focus:outline-none focus:border-french-gold"
                  >
                    {INVENTORY_CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 uppercase tracking-wider">Measurement Unit *</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream focus:outline-none focus:border-french-gold"
                  >
                    <option value="units">units (pieces)</option>
                    <option value="kg">kg (kilograms)</option>
                    <option value="liters">liters</option>
                    <option value="pkts">packets (pkts)</option>
                    <option value="rolls">rolls</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Current Stock *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.current_stock}
                    onChange={(e) => setForm(prev => ({ ...prev, current_stock: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream focus:outline-none focus:border-french-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase tracking-wider">Min Threshold *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.min_threshold}
                    onChange={(e) => setForm(prev => ({ ...prev, min_threshold: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream focus:outline-none focus:border-french-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase tracking-wider">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.cost_per_unit}
                    onChange={(e) => setForm(prev => ({ ...prev, cost_per_unit: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream focus:outline-none focus:border-french-gold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Primary Supplier (Optional)</label>
                <input
                  type="text"
                  value={form.supplier}
                  onChange={(e) => setForm(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="e.g. Bangalore Artisan Breads Ltd"
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream focus:outline-none focus:border-french-gold"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Linked Menu Dishes (Comma-separated)</label>
                <input
                  type="text"
                  value={form.linked_dishes}
                  onChange={(e) => setForm(prev => ({ ...prev, linked_dishes: e.target.value }))}
                  placeholder="e.g. Double Zinger, Monster Crispy Burger"
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream focus:outline-none focus:border-french-gold"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-french-gold/20">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                  className="px-4 py-2.5 rounded-xl border border-french-gold/30 text-french-dark hover:bg-french-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-french-dark text-french-gold hover:bg-french-gold hover:text-french-dark font-black text-xs uppercase tracking-wider transition-all shadow gold-glow"
                >
                  {editingItem ? 'Save Changes' : 'Add Item to Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
