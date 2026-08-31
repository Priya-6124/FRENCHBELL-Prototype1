import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import BrandedFoodImage from '../BrandedFoodImage';
import { Image as ImageIcon, Plus, Trash2, Upload, Sparkles, X, Bell } from 'lucide-react';

const LOCAL_BANNER_PRESETS = [
  { label: '🍔 Burger Feast', path: '/assets/food/burger.jpg' },
  { label: '🍟 Cheesy Fries', path: '/assets/food/fries.jpg' },
  { label: '🍗 Sizzling Strips', path: '/assets/food/strips.jpg' },
  { label: '🥟 Momo Platter', path: '/assets/food/momos.jpg' },
  { label: '🍱 Grand Sampler', path: '/assets/food/platter.jpg' },
];

export default function AdvertManager() {
  const { advertisements, setAdvertisements, addNotification } = useApp();
  const { token } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('/assets/food/burger.jpg');
  const [description, setDescription] = useState('');
  const [cta, setCta] = useState('Order Now');
  const fileInputRef = useRef(null);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAdvert = async (e) => {
    e.preventDefault();
    const newAd = {
      id: Date.now(),
      title,
      image_url: imageUrl || '/assets/food/burger.jpg',
      description,
      cta,
      active: 1
    };

    setAdvertisements([newAd, ...advertisements]);
    addNotification('Banner Published 📢', `Live customer announcement: "${title}"`, 'success');

    try {
      await fetch('/api/advertisements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAd)
      });
    } catch (err) {}

    setShowModal(false);
    setTitle('');
    setDescription('');
  };

  const handleDeleteAdvert = async (id) => {
    setAdvertisements(prev => prev.filter(a => a.id !== id));
    addNotification('Banner Removed', 'Advertisement removed from customer view', 'info');

    try {
      await fetch(`/api/advertisements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>Customer Promotions & Media</span>
          </div>
          <h2 className="font-serif font-extrabold text-2xl text-french-gold">
            Advertisements & Carousel Banners
          </h2>
          <p className="text-xs text-french-cream/80 mt-1">
            Upload custom graphics or pick AI food images. All published banners are instantly broadcast to customers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Grid of Advertisements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {advertisements.map((ad) => (
          <div key={ad.id} className="p-4 rounded-3xl bg-french-card border border-french-gold/30 shadow-md space-y-3 relative overflow-hidden flex flex-col justify-between">
            <div className="w-full h-44 rounded-2xl overflow-hidden border border-french-gold/20 relative">
              <BrandedFoodImage src={ad.image_url} name={ad.title} category="banner" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                Live on Site ✓
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <h4 className="font-serif font-bold text-base text-french-dark line-clamp-1">{ad.title}</h4>
              <p className="text-xs text-french-muted line-clamp-2">{ad.description}</p>
            </div>

            <div className="pt-2 border-t border-french-gold/20 flex items-center justify-between">
              <span className="text-[11px] font-bold text-french-gold bg-french-dark px-2.5 py-1 rounded-full">
                CTA: {ad.cta}
              </span>
              <button
                onClick={() => handleDeleteAdvert(ad.id)}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                title="Delete Banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-french-card border border-french-gold/40 rounded-3xl overflow-hidden shadow-2xl">
            
            <div className="p-5 bg-french-dark text-french-cream border-b border-french-gold/20 flex items-center justify-between">
              <h3 className="font-serif font-extrabold text-xl text-french-gold">Create Promo Banner</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-french-cream/80 hover:text-french-gold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdvert} className="p-6 space-y-4 text-french-dark">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Banner Headline *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 🍕 Weekend Loaded Feast 20% Off!"
                  className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold"
                  required
                />
              </div>

              {/* Image Uploader & Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider">Banner Graphic</label>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-french-cream border border-french-gold/30">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-french-gold/40 shrink-0">
                    <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
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
                      className="px-3 py-1.5 rounded-xl bg-french-dark text-french-gold font-bold text-xs flex items-center gap-1.5 hover:bg-french-gold hover:text-french-dark transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Banner Image</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {LOCAL_BANNER_PRESETS.map((p) => (
                    <button
                      key={p.path}
                      type="button"
                      onClick={() => setImageUrl(p.path)}
                      className={`p-1.5 rounded-lg text-left text-[10px] font-bold border truncate transition-all ${
                        imageUrl === p.path ? 'bg-french-gold text-french-dark border-french-dark shadow' : 'bg-french-cream/60 border-french-gold/20 text-french-dark'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Description / Subtitle</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Sizzling chicken strips, peri peri fries & cold boba tea"
                  className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Call to Action (CTA)</label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="e.g. Grab Offer, Order Now"
                  className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-french-gold/30 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-french-gold text-french-dark font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold-hover shadow"
                >
                  Publish Banner & Alert Customers 📢
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
