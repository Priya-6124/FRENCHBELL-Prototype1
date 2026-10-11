import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Image as ImageIcon, Plus, Trash2, Upload, X,
  Check, MessageCircle, Megaphone, Clock, CheckCircle2,
  RefreshCw, ToggleLeft, ToggleRight, Calendar, AlertCircle
} from 'lucide-react';

export default function AdvertManager() {
  const { addNotification, settings } = useApp();
  const { token } = useAuth();

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('active'); // 'active' | 'scheduled'
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('/assets/food/burger.jpg');
  const [description, setDescription] = useState('');
  const [cta, setCta] = useState('Order Now');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shareOnWhatsApp, setShareOnWhatsApp] = useState(true);
  const fileInputRef = useRef(null);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/advertisements');
      if (res.ok) {
        const data = await res.json();
        setAds(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addNotification('Upload Error', 'Image size exceeds 5MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ base64Data, filename: file.name })
        });
        const data = await res.json();
        if (data.image_url) {
          setImageUrl(data.image_url);
          addNotification('Image Uploaded', 'Banner image stored persistently.', 'success');
        } else {
          setImageUrl(base64Data);
        }
      } catch (err) {
        setImageUrl(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const getWhatsAppMessage = (adTitle, adDesc) => {
    const cafeName = settings?.cafe_name || 'FrenchBell Cafe';
    const siteUrl = window.location.origin;
    return encodeURIComponent(
      `🔥 *NEW SPECIAL PROMOTION: ${cafeName}* 🔥\n\n*${adTitle}*\n${adDesc || 'Freshly made with gourmet cafe recipes & authentic ingredients!'}\n\n👉 *Order Online Now:* ${siteUrl}\n📍 *Store:* ${settings?.cafe_address || 'K. Narayanpura, Bengaluru'}\n📞 *Call / Delivery:* ${settings?.cafe_phone || '+91 98765 43210'}\n\n_Good Food, Great Moments at FrenchBell Cafe._`
    );
  };

  const handleShareToWhatsApp = (ad) => {
    const text = getWhatsAppMessage(ad.title, ad.description);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCreateAdvert = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addNotification('Error', 'Advertisement title is required', 'error');
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        image_url: imageUrl || '/assets/food/burger.jpg',
        description,
        cta: cta || 'Order Now',
        start_date: isScheduled && scheduleDate ? scheduleDate : null,
        end_date: endDate || null,
        active: isScheduled ? 0 : 1
      };

      const res = await fetch('/api/advertisements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create advertisement');

      addNotification('Success', isScheduled ? `Scheduled for ${scheduleDate}` : `"${title}" is now live on carousel`, 'success');

      if (shareOnWhatsApp && !isScheduled) {
        setTimeout(() => handleShareToWhatsApp(payload), 500);
      }

      fetchAds();
      setShowModal(false);
      setTitle('');
      setDescription('');
      setIsScheduled(false);
      setScheduleDate('');
      setEndDate('');
    } catch (err) {
      addNotification('Error', err.message, 'error');
    }
  };

  const handleToggleActive = async (ad) => {
    try {
      const res = await fetch(`/api/advertisements/${ad.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ active: ad.active === 1 ? 0 : 1 })
      });
      if (!res.ok) throw new Error('Failed to update status');
      addNotification('Updated', `Advertisement is now ${ad.active === 1 ? 'inactive' : 'active'}`, 'success');
      fetchAds();
    } catch (err) {
      addNotification('Error', err.message, 'error');
    }
  };

  const handleActivateNow = async (ad) => {
    try {
      const res = await fetch(`/api/advertisements/${ad.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ active: 1, start_date: null })
      });
      if (!res.ok) throw new Error('Failed to activate');
      addNotification('Activated', `"${ad.title}" is now live on customer carousel`, 'success');
      fetchAds();
    } catch (err) {
      addNotification('Error', err.message, 'error');
    }
  };

  const handleDeleteAdvert = async (ad) => {
    try {
      const res = await fetch(`/api/advertisements/${ad.id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to delete');
      addNotification('Deleted', 'Advertisement removed', 'info');
      setDeleteConfirm(null);
      fetchAds();
    } catch (err) {
      addNotification('Error', err.message, 'error');
    }
  };

  const now = new Date();
  const activeAds = ads.filter(a => {
    if (a.is_expired) return false;
    if (a.active !== 1) return false;
    if (a.start_date && new Date(a.start_date) > now) return false;
    return true;
  });

  const scheduledAds = ads.filter(a => {
    if (a.is_expired) return true;
    if (a.active === 0) return true;
    if (a.start_date && new Date(a.start_date) > now) return true;
    return false;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <Megaphone className="w-4 h-4" />
            <span>Customer Marketing & Broadcasts</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-french-cream">
            ADVERTISEMENTS & BANNERS
          </h2>
          <p className="text-xs text-french-cream/80 mt-1 max-w-xl">
            Post promotional banners to customer homepage carousel. Schedule future campaigns and broadcast updates directly to WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAds}
            className="p-2.5 rounded-xl bg-french-brown/60 border border-french-gold/30 text-french-gold hover:text-french-cream transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-french-gold text-french-dark font-black text-xs uppercase tracking-wider hover:bg-french-gold-hover transition-all flex items-center justify-center gap-2 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Advertisement</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-french-gold/20 pb-3">
        <button
          onClick={() => setActiveSubTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeSubTab === 'active'
              ? 'bg-french-gold text-french-dark shadow gold-glow'
              : 'bg-white text-french-dark border border-french-gold/20 hover:border-french-gold'
          }`}
        >
          Active Banners ({activeAds.length})
        </button>
        <button
          onClick={() => setActiveSubTab('scheduled')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeSubTab === 'scheduled'
              ? 'bg-french-gold text-french-dark shadow gold-glow'
              : 'bg-white text-french-dark border border-french-gold/20 hover:border-french-gold'
          }`}
        >
          Scheduled & Inactive ({scheduledAds.length})
        </button>
      </div>

      {/* Active Tab */}
      {activeSubTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAds.length === 0 ? (
            <div className="col-span-full p-12 bg-white rounded-3xl border border-french-gold/20 text-center text-xs text-french-muted">
              No active advertisements running right now. Click "Add Advertisement" to launch one on the customer homepage.
            </div>
          ) : (
            activeAds.map((ad) => (
              <div key={ad.id} className="p-4 rounded-3xl bg-white border border-french-gold/30 shadow-md space-y-3 relative overflow-hidden flex flex-col justify-between hover:border-french-gold transition-all">
                <div className="w-full h-44 rounded-2xl overflow-hidden border border-french-gold/20 relative">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/logo.jfif';
                    }}
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                    <Check className="w-3 h-3" />
                    <span>Live on Carousel</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif font-black text-base text-french-dark leading-tight">{ad.title}</h4>
                  {ad.description && <p className="text-xs text-french-muted line-clamp-2">{ad.description}</p>}
                  {ad.end_date && (
                    <span className="text-[10px] text-french-muted flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      Until: {new Date(ad.end_date).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-french-gold/20 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleShareToWhatsApp(ad)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleToggleActive(ad)}
                    className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    title="Pause Banner"
                  >
                    <ToggleRight className="w-5 h-5 text-emerald-600" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(ad)}
                    className="p-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors"
                    title="Remove Ad"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Scheduled Tab */}
      {activeSubTab === 'scheduled' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scheduledAds.length === 0 ? (
            <div className="col-span-full p-12 bg-white rounded-3xl border border-french-gold/20 text-center text-xs text-french-muted">
              No scheduled or inactive campaigns queued.
            </div>
          ) : (
            scheduledAds.map((ad) => (
              <div key={ad.id} className="p-4 rounded-3xl bg-white border border-french-gold/20 shadow-md space-y-3 relative overflow-hidden flex flex-col justify-between opacity-80 hover:opacity-100 transition-all">
                <div className="w-full h-40 rounded-2xl overflow-hidden border border-french-gold/20 relative">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/logo.jfif';
                    }}
                  />
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-white text-[10px] font-bold flex items-center gap-1 shadow ${
                    ad.is_expired ? 'bg-red-600' : 'bg-amber-600'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{ad.is_expired ? 'Expired' : (ad.start_date ? `Scheduled: ${new Date(ad.start_date).toLocaleDateString('en-IN')}` : 'Paused')}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-french-dark">{ad.title}</h4>
                  {ad.description && <p className="text-xs text-french-muted line-clamp-2">{ad.description}</p>}
                </div>

                <div className="pt-2 border-t border-french-gold/15 flex justify-between items-center gap-2">
                  {!ad.is_expired && (
                    <button
                      onClick={() => handleActivateNow(ad)}
                      className="px-3 py-1.5 rounded-xl bg-french-gold text-french-dark font-black text-xs uppercase hover:bg-french-gold-hover transition-all shadow"
                    >
                      Publish Now
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(ad)}
                    className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 ml-auto transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE ADVERT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border-2 border-french-gold/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-french-gold/20 pb-3">
              <h3 className="font-serif font-black text-xl text-french-dark">
                Add New Advertisement Banner
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-french-muted hover:text-french-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdvert} className="space-y-4 text-xs font-bold text-french-dark">
              <div>
                <label className="block mb-1 uppercase">Banner Headline *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monster Crispy Burgers & Sizzling Momos"
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 focus:outline-none focus:border-french-gold"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase">Marketing Copy / Subtitle</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Handcrafted fresh with secret spices..."
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 focus:outline-none focus:border-french-gold resize-none"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase">Call to Action (CTA) Button</label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Order Now"
                  className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 focus:outline-none focus:border-french-gold"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block uppercase">Banner Image</label>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-french-cream border border-french-gold/30">
                  <img src={imageUrl} alt="Banner" className="w-16 h-12 object-cover rounded-xl" />
                  <div className="flex-1">
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
                      className="px-3 py-1.5 rounded-xl bg-french-dark text-french-gold text-xs font-bold"
                    >
                      Upload Device Image
                    </button>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-french-muted mb-1 uppercase">Start / Schedule Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => {
                      setScheduleDate(e.target.value);
                      setIsScheduled(Boolean(e.target.value && new Date(e.target.value) > new Date()));
                    }}
                    className="w-full p-2 rounded-xl border border-french-gold/30 bg-french-cream font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-french-muted mb-1 uppercase">Expiration / End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-french-gold/30 bg-french-cream font-mono text-xs"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={shareOnWhatsApp}
                  onChange={(e) => setShareOnWhatsApp(e.target.checked)}
                  className="w-4 h-4 accent-french-gold"
                />
                <span>Broadcast Announcement on WhatsApp immediately</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-french-gold/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-french-gold/30 hover:bg-french-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-french-gold text-french-dark font-black uppercase tracking-wider hover:bg-french-gold-hover transition-all shadow"
                >
                  Publish Advertisement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif font-black text-french-dark">Delete Advertisement?</h3>
                <p className="text-xs text-french-muted">This will remove it from the customer carousel.</p>
              </div>
            </div>
            <p className="text-sm text-french-dark">
              Are you sure you want to delete <strong className="font-bold">"{deleteConfirm.title}"</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl border border-french-gold/30 text-french-dark font-bold text-sm hover:bg-french-cream"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAdvert(deleteConfirm)}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white font-black text-sm uppercase tracking-wider hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
