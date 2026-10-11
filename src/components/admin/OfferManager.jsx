<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Tag, Plus, Trash2, CheckCircle2, X, Gift,
  Percent, Calendar, RefreshCw, Search, Edit2,
  ToggleLeft, ToggleRight, AlertCircle, Clock, ShoppingBag
} from 'lucide-react';

export default function OfferManager() {
  const { addNotification } = useApp();
  const { token } = useAuth();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    coupon_code: '',
    discount_type: 'percentage',
    discount_value: '20',
    minimum_order: '199',
    max_discount: '150',
    valid_from: '',
    valid_until: '',
    applicable_order_type: 'all',
    usage_limit: '',
    per_customer_limit: '1',
    active: true
  });

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/offers');
      if (res.ok) {
        const data = await res.json();
        setOffers(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch offers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
    const interval = setInterval(fetchOffers, 10000);
    return () => clearInterval(interval);
  }, [fetchOffers]);
=======
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Tag, Plus, Trash2, CheckCircle2, Sparkles, X, Gift, Check,
  Percent, Calendar, ArrowRight, ShieldCheck, Flame
} from 'lucide-react';

export default function OfferManager({ initialTab = 'coupons' }) {
  const { offers, setOffers, addNotification } = useApp();
  const { token } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState(initialTab === 'promotions' ? 'promotions' : 'coupons');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('20');
  const [minimumOrder, setMinimumOrder] = useState('199');
  const [maxDiscount, setMaxDiscount] = useState('100');
  const [expiryDate, setExpiryDate] = useState('31 Dec 2026');

  useEffect(() => {
    if (initialTab === 'promotions') setActiveSubTab('promotions');
    else if (initialTab === 'coupons') setActiveSubTab('coupons');
  }, [initialTab]);

  // Promotions / Featured Deals State
  const [promotions, setPromotions] = useState([
    {
      id: 1,
      title: 'Monster Burger Feast Combo',
      description: 'Get any Gourmet Burger + Peri Peri Fries + Soft Beverage combo starting at ₹199!',
      badge: 'Bestseller Deal',
      discount: 'Save 25%',
      active: 1
    },
    {
      id: 2,
      title: 'Weekend Momos Carnival',
      description: 'Order 2 Plates of Steamed/Fried Momos and get 1 Signature Dip Platter FREE.',
      badge: 'Weekend Special',
      discount: 'Buy 2 Get 1 Dip',
      active: 1
    },
    {
      id: 3,
      title: 'Student Special Discount',
      description: 'Special 10% flat discount for Kristu Jayanti students with valid student ID.',
      badge: 'Campus Deal',
      discount: 'Flat 10% Off',
      active: 1
    }
  ]);
>>>>>>> 1db65623a1a40f9abb4889af2d5c43f7d748873d

  const handleGenerateCode = async () => {
    try {
      const res = await fetch('/api/offers/generate-code', {
        method: 'POST',
<<<<<<< HEAD
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.code) setForm(prev => ({ ...prev, coupon_code: data.code }));
      } else {
        const randomCode = 'FB' + Math.floor(10 + Math.random() * 90) + 'OFF';
        setForm(prev => ({ ...prev, coupon_code: randomCode }));
      }
    } catch (e) {
      const randomCode = 'FB' + Math.floor(10 + Math.random() * 90) + 'OFF';
      setForm(prev => ({ ...prev, coupon_code: randomCode }));
    }
  };

  const openCreateModal = () => {
    setEditingOffer(null);
    setForm({
      title: '',
      description: '',
      coupon_code: '',
      discount_type: 'percentage',
      discount_value: '20',
      minimum_order: '199',
      max_discount: '150',
      valid_from: '',
      valid_until: '',
      applicable_order_type: 'all',
      usage_limit: '',
      per_customer_limit: '1',
      active: true
    });
    setShowModal(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setForm({
      title: offer.title || '',
      description: offer.description || '',
      coupon_code: offer.coupon_code || '',
      discount_type: offer.discount_type || 'percentage',
      discount_value: String(offer.discount_value || '20'),
      minimum_order: String(offer.minimum_order || '0'),
      max_discount: offer.max_discount ? String(offer.max_discount) : '',
      valid_from: offer.valid_from || '',
      valid_until: offer.valid_until || '',
      applicable_order_type: offer.applicable_order_type || 'all',
      usage_limit: offer.usage_limit ? String(offer.usage_limit) : '',
      per_customer_limit: String(offer.per_customer_limit || '1'),
      active: offer.active !== 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.coupon_code.trim() || !form.discount_value) {
      addNotification('Validation Error', 'Title, coupon code, and discount value are required.', 'error');
      return;
    }

    try {
      let res;
      if (editingOffer) {
        res = await fetch(`/api/offers/${editingOffer.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            ...form,
            discount_value: Number(form.discount_value),
            minimum_order: Number(form.minimum_order) || 0,
            max_discount: form.max_discount ? Number(form.max_discount) : null,
            usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
            per_customer_limit: Number(form.per_customer_limit) || 1,
            active: form.active ? 1 : 0
          })
        });
      } else {
        res = await fetch('/api/offers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            ...form,
            discount_value: Number(form.discount_value),
            minimum_order: Number(form.minimum_order) || 0,
            max_discount: form.max_discount ? Number(form.max_discount) : null,
            usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
            per_customer_limit: Number(form.per_customer_limit) || 1,
            active: form.active ? 1 : 0
          })
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save coupon');

      addNotification('Success', editingOffer ? 'Coupon updated successfully' : 'Coupon created successfully', 'success');
      setShowModal(false);
      fetchOffers();
    } catch (err) {
      addNotification('Error', err.message, 'error');
    }
  };

  const handleToggleActive = async (offer) => {
    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ active: offer.active === 0 ? 1 : 0 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update coupon');

      addNotification('Updated', `Coupon ${offer.coupon_code} is now ${offer.active === 0 ? 'active' : 'inactive'}`, 'success');
      fetchOffers();
    } catch (err) {
      addNotification('Error', err.message, 'error');
    }
  };

  const handleDelete = async (offer) => {
    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete coupon');

      addNotification('Deleted', `Coupon ${offer.coupon_code} has been removed`, 'success');
      setDeleteConfirm(null);
      fetchOffers();
    } catch (err) {
      addNotification('Error', err.message, 'error');
    }
  };

  const filteredOffers = offers.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (o.title || '').toLowerCase().includes(q) ||
      (o.coupon_code || '').toLowerCase().includes(q) ||
      (o.description || '').toLowerCase().includes(q)
    );
  });

  const isExpired = (offer) => {
    if (!offer.valid_until) return false;
    return new Date(offer.valid_until) < new Date();
  };

  const getStatusBadge = (offer) => {
    if (isExpired(offer)) return { label: 'Expired', class: 'bg-gray-100 text-gray-700 border border-gray-300' };
    if (offer.active === 0) return { label: 'Inactive', class: 'bg-red-100 text-red-700 border border-red-200' };
    return { label: 'Active', class: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <Tag className="w-4 h-4" />
            <span>Coupons & Offers Management</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-french-cream">OFFERS & COUPONS</h2>
          <p className="text-french-cream/60 text-xs mt-1">
            Create, manage, and track discount coupons. Changes apply immediately on the customer side.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOffers}
            className="p-2.5 rounded-xl bg-french-brown/60 border border-french-gold/30 text-french-gold hover:text-french-cream transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-french-gold text-french-dark font-black text-sm uppercase tracking-wider hover:bg-french-gold-hover transition-all shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Coupon</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-french-gold/20 shadow-sm text-center">
          <div className="text-2xl font-black font-serif text-french-dark">{offers.length}</div>
          <div className="text-[10px] font-bold text-french-muted uppercase">Total Coupons</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center">
          <div className="text-2xl font-black font-serif text-emerald-700">{offers.filter(o => o.active !== 0 && !isExpired(o)).length}</div>
          <div className="text-[10px] font-bold text-emerald-600 uppercase">Active</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-red-200 shadow-sm text-center">
          <div className="text-2xl font-black font-serif text-red-600">{offers.filter(o => isExpired(o)).length}</div>
          <div className="text-[10px] font-bold text-red-500 uppercase">Expired</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm text-center">
          <div className="text-2xl font-black font-serif text-amber-700">{offers.reduce((sum, o) => sum + (o.times_used || 0), 0)}</div>
          <div className="text-[10px] font-bold text-amber-600 uppercase">Total Redemptions</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-french-muted" />
          <input
            type="text"
            placeholder="Search by code, title, description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-french-gold/30 bg-white text-sm text-french-dark placeholder:text-french-muted/60 focus:outline-none focus:border-french-gold"
          />
        </div>
      </div>

      {/* Coupons List */}
      {loading && offers.length === 0 ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-french-gold animate-spin mx-auto mb-3" />
          <p className="text-french-muted text-sm">Loading coupons...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-french-gold/20 shadow-sm">
          <Gift className="w-12 h-12 text-french-gold/40 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-french-dark text-lg mb-1">
            {searchQuery ? 'No matching coupons found' : 'No Coupons Yet'}
          </h3>
          <p className="text-french-muted text-sm mb-4">
            {searchQuery ? 'Try a different search term.' : 'Create your first coupon to start offering discounts to customers.'}
          </p>
          {!searchQuery && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-french-gold text-french-dark font-black text-sm uppercase tracking-wider hover:bg-french-gold-hover transition-all"
            >
              Create First Coupon
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOffers.map(offer => {
            const status = getStatusBadge(offer);
            const usagePercent = offer.usage_limit ? Math.min(100, ((offer.times_used || 0) / offer.usage_limit) * 100) : null;
            return (
              <div
                key={offer.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${
                  offer.active === 0 || isExpired(offer) ? 'opacity-70 border-gray-200' : 'border-french-gold/25'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono font-black text-sm bg-french-dark text-french-gold px-2 py-0.5 rounded-lg">
                        {offer.coupon_code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${status.class}`}>
                        {status.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                        {offer.discount_type === 'percentage' ? `${offer.discount_value}% Off` : `₹${offer.discount_value} Off`}
                      </span>
                      {offer.applicable_order_type && offer.applicable_order_type !== 'all' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                          {offer.applicable_order_type} only
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-black text-base text-french-dark">{offer.title}</h3>
                    {offer.description && (
                      <p className="text-french-muted text-xs mt-0.5 line-clamp-1">{offer.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-french-muted">
                      {offer.minimum_order > 0 && (
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          Min. ₹{offer.minimum_order}
                        </span>
                      )}
                      {offer.max_discount && (
                        <span className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          Max discount: ₹{offer.max_discount}
                        </span>
                      )}
                      {offer.valid_until && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Valid until: {new Date(offer.valid_until).toLocaleDateString('en-IN')}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Used: {offer.times_used || 0}{offer.usage_limit ? `/${offer.usage_limit}` : ''} times
                      </span>
                    </div>
                    {usagePercent !== null && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${usagePercent >= 80 ? 'bg-red-500' : usagePercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-french-muted mt-0.5 block">{Math.round(usagePercent)}% usage limit reached</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Toggle Active */}
                    <button
                      onClick={() => handleToggleActive(offer)}
                      className={`p-2 rounded-xl transition-all ${
                        offer.active !== 0 && !isExpired(offer)
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      title={offer.active !== 0 ? 'Deactivate coupon' : 'Activate coupon'}
                    >
                      {offer.active !== 0 ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(offer)}
                      className="p-2 rounded-xl bg-french-cream hover:bg-french-gold/20 text-french-dark transition-all"
                      title="Edit coupon"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => setDeleteConfirm(offer)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl my-8">
            <div className="p-6 border-b border-french-gold/20 flex items-center justify-between">
              <h3 className="font-serif font-black text-xl text-french-dark">
                {editingOffer ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-french-cream text-french-muted">
=======
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.code) setCouponCode(data.code);
      } else {
        const randomCode = 'FB' + Math.floor(10 + Math.random() * 90) + 'OFF';
        setCouponCode(randomCode);
      }
    } catch (e) {
      const randomCode = 'FB' + Math.floor(10 + Math.random() * 90) + 'OFF';
      setCouponCode(randomCode);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    const newOffer = {
      id: Date.now(),
      title,
      description,
      coupon_code: couponCode.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      minimum_order: Number(minimumOrder),
      max_discount: Number(maxDiscount),
      expiry_date: expiryDate,
      active: 1
    };

    setOffers([newOffer, ...offers]);
    addNotification('Coupon Created', `Coupon ${newOffer.coupon_code} is active for customers!`, 'success');

    try {
      await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newOffer)
      });
    } catch (err) {}

    setShowModal(false);
    setTitle('');
    setCouponCode('');
    setDescription('');
  };

  const handleDeleteOffer = async (id) => {
    setOffers(offers.filter(o => o.id !== id));
    addNotification('Coupon Removed', 'Coupon deactivated from checkout', 'info');

    try {
      await fetch(`/api/offers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <Gift className="w-4 h-4" />
            <span>Promotional Discounts & Coupons</span>
          </div>
          <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-french-gold">
            OFFERS & COUPONS MANAGEMENT
          </h2>
          <p className="text-xs text-french-cream/80 mt-1 max-w-xl">
            Create promotional discount coupons, set minimum spend rules, max discount caps, and publish combo meal deals.
          </p>
        </div>

        <button
          onClick={() => {
            handleGenerateCode();
            setShowModal(true);
          }}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Sub Tabs: Coupons | Promotions */}
      <div className="flex items-center gap-2 border-b border-french-gold/20 pb-3">
        {[
          { id: 'coupons', label: `Coupons (${offers.length})` },
          { id: 'promotions', label: `Promotions & Combos (${promotions.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeSubTab === tab.id
                ? 'bg-french-gold text-french-dark shadow gold-glow'
                : 'bg-french-card text-french-dark/80 hover:bg-french-cream border border-french-gold/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: COUPONS */}
      {activeSubTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((o) => (
            <div key={o.id} className="p-5 rounded-3xl bg-white border-2 border-french-gold/30 shadow-md space-y-3 relative flex flex-col justify-between hover:border-french-gold transition-all">
              <button
                onClick={() => handleDeleteOffer(o.id)}
                className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors"
                title="Delete Coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-french-dark text-french-gold font-mono font-black text-sm tracking-wider border border-french-gold/40 shadow-sm">
                    {o.coupon_code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base text-french-dark">{o.title}</h4>
                <p className="text-xs text-french-muted leading-relaxed">{o.description}</p>
              </div>

              <div className="text-xs font-bold text-french-dark pt-3 border-t border-french-gold/20 flex justify-between items-center">
                <span className="text-emerald-700 font-extrabold text-sm">
                  {o.discount_type === 'percentage' ? `${o.discount_value}% OFF` : `₹${o.discount_value} OFF`}
                </span>
                <span className="text-french-muted text-[11px]">Min Order: ₹{o.minimum_order}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PROMOTIONS */}
      {activeSubTab === 'promotions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className="p-5 rounded-3xl bg-white border border-french-gold/30 shadow-md space-y-3 relative flex flex-col justify-between hover:border-french-gold transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-french-dark text-french-gold font-bold text-[10px] uppercase tracking-wider">
                    {promo.badge}
                  </span>
                  <span className="font-serif font-black text-sm text-emerald-800">
                    {promo.discount}
                  </span>
                </div>
                <h4 className="font-serif font-black text-base text-french-dark">{promo.title}</h4>
                <p className="text-xs text-french-muted leading-relaxed">{promo.description}</p>
              </div>

              <div className="pt-3 border-t border-french-gold/15 flex items-center justify-between">
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Live on Customer Offers Tab</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-french-card border-2 border-french-gold/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-french-gold/20 pb-3">
              <h3 className="font-serif font-extrabold text-xl text-french-dark">
                Create Promo Coupon
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-french-muted hover:text-french-dark">
>>>>>>> 1db65623a1a40f9abb4889af2d5c43f7d748873d
                <X className="w-5 h-5" />
              </button>
            </div>

<<<<<<< HEAD
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-french-dark mb-1">Coupon Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Weekend Special Discount"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 text-sm focus:outline-none focus:border-french-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-french-dark mb-1">Coupon Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.coupon_code}
                      onChange={e => setForm(prev => ({ ...prev, coupon_code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. SAVE20"
                      required
                      className="flex-1 px-3 py-2.5 rounded-xl border border-french-gold/30 text-sm font-mono focus:outline-none focus:border-french-gold"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="px-3 py-2 rounded-xl bg-french-dark text-french-gold text-xs font-bold hover:bg-french-gold hover:text-french-dark transition-all whitespace-nowrap"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-french-dark mb-1">Discount Type *</label>
                  <select
                    value={form.discount_type}
                    onChange={e => setForm(prev => ({ ...prev, discount_type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 text-sm focus:outline-none focus:border-french-gold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-french-dark mb-1">
                    Discount Value * {form.discount_type === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    value={form.discount_value}
                    onChange={e => setForm(prev => ({ ...prev, discount_value: e.target.value }))}
                    required
                    min="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 text-sm focus:outline-none focus:border-french-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-french-dark mb-1">Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    value={form.minimum_order}
                    onChange={e => setForm(prev => ({ ...prev, minimum_order: e.target.value }))}
                    min="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 text-sm focus:outline-none focus:border-french-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-french-dark mb-1">Max Discount (₹, optional)</label>
                  <input
                    type="number"
                    value={form.max_discount}
                    onChange={e => setForm(prev => ({ ...prev, max_discount: e.target.value }))}
                    min="0"
                    placeholder="No limit"
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 text-sm focus:outline-none focus:border-french-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-french-dark mb-1">Valid From</label>
                  <input
                    type="date"
                    value={form.valid_from}
                    onChange={e => setForm(prev => ({ ...prev, valid_from: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 text-sm focus:outline-none focus:border-french-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-french-dark mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={form.valid_until}
                    onChange={e => setForm(prev => ({ ...prev, valid_until: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 text-sm focus:outline-none focus:border-french-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-french-dark mb-1">Applicable Order Type</label>
                  <select
                    value={form.applicable_order_type}
                    onChange={e => setForm(prev => ({ ...prev, applicable_order_type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 text-sm focus:outline-none focus:border-french-gold"
                  >
                    <option value="all">All Order Types</option>
                    <option value="takeaway">Takeaway Only</option>
                    <option value="delivery">Delivery Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-french-dark mb-1">Total Usage Limit (optional)</label>
                  <input
                    type="number"
                    value={form.usage_limit}
                    onChange={e => setForm(prev => ({ ...prev, usage_limit: e.target.value }))}
                    min="1"
                    placeholder="Unlimited"
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 text-sm focus:outline-none focus:border-french-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-french-dark mb-1">Per Customer Limit</label>
                  <input
                    type="number"
                    value={form.per_customer_limit}
                    onChange={e => setForm(prev => ({ ...prev, per_customer_limit: e.target.value }))}
                    min="1"
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 text-sm focus:outline-none focus:border-french-gold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-french-dark mb-1">Description (optional)</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this coupon offer..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-french-gold/30 text-sm resize-none focus:outline-none focus:border-french-gold"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={e => setForm(prev => ({ ...prev, active: e.target.checked }))}
                      className="w-4 h-4 accent-french-gold"
                    />
                    <span className="text-sm font-bold text-french-dark">Active (customers can use this coupon immediately)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-french-gold/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-french-gold/30 text-french-dark font-bold text-sm hover:bg-french-cream transition-all"
=======
            <form onSubmit={handleCreateOffer} className="space-y-3 text-xs font-bold text-french-dark">
              <div>
                <label className="block mb-1 uppercase">Coupon Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BELL50"
                    className="flex-1 p-2.5 rounded-xl border border-french-gold/30 bg-french-cream font-mono font-bold uppercase text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="px-3 py-2 rounded-xl bg-french-dark text-french-gold font-bold text-[10px] uppercase"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flat ₹50 Off Weekend Special"
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 uppercase">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="20"
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase">Minimum Order (₹)</label>
                  <input
                    type="number"
                    value={minimumOrder}
                    onChange={(e) => setMinimumOrder(e.target.value)}
                    placeholder="199"
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="100"
                    className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase">Description / Customer Terms</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Valid on all orders above minimum order value..."
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-french-gold/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-french-gold/30 hover:bg-french-brown/20"
>>>>>>> 1db65623a1a40f9abb4889af2d5c43f7d748873d
                >
                  Cancel
                </button>
                <button
                  type="submit"
<<<<<<< HEAD
                  className="px-5 py-2 rounded-xl bg-french-gold text-french-dark font-black text-sm uppercase tracking-wider hover:bg-french-gold-hover transition-all shadow"
                >
                  {editingOffer ? 'Save Changes' : 'Create Coupon'}
=======
                  className="px-6 py-2.5 rounded-xl bg-french-gold text-french-dark font-black uppercase tracking-wider"
                >
                  Save Coupon
>>>>>>> 1db65623a1a40f9abb4889af2d5c43f7d748873d
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif font-black text-french-dark">Delete Coupon?</h3>
                <p className="text-xs text-french-muted">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-french-dark">
              Are you sure you want to delete coupon <strong className="font-mono">{deleteConfirm.coupon_code}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl border border-french-gold/30 text-french-dark font-bold text-sm hover:bg-french-cream transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white font-black text-sm uppercase tracking-wider hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
=======
>>>>>>> 1db65623a1a40f9abb4889af2d5c43f7d748873d
    </div>
  );
}
