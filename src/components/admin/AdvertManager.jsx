import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import BrandedFoodImage from '../BrandedFoodImage';
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

export default function AdvertManager() {
  const { addNotification } = useApp();
  const [adverts, setAdverts] = useState([
    { id: 1, title: 'Free Delivery Within 2 KM!', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80', description: 'Order your favorite loaded fries & burgers straight to your doorstep.', cta: 'Order Now' },
    { id: 2, title: 'Crispy Zinger & Loaded Combo', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80', description: 'Try our best-selling Cheesy Blaster Loaded with Double Zinger!', cta: 'Explore Menu' },
    { id: 3, title: 'French Bell Special Sushi Rolls', image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1000&q=80', description: 'Indo-French Fusion rolls starting at just ₹89.', cta: 'View Rolls' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [cta, setCta] = useState('Explore Menu');

  const handleCreateAdvert = (e) => {
    e.preventDefault();
    const newAd = {
      id: Date.now(),
      title,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
      description,
      cta
    };
    setAdverts([newAd, ...adverts]);
    addNotification('Banner Created 📸', `Homepage banner "${title}" added!`, 'success');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-french-dark text-french-cream border border-french-gold/30 flex items-center justify-between">
        <div>
          <h3 className="font-serif font-extrabold text-2xl text-french-gold">
            Advertisement & Banner Manager
          </h3>
          <p className="text-xs text-french-cream/80">
            Upload and schedule homepage hero banners and promotional features.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-french-gold text-french-dark font-extrabold text-xs uppercase tracking-wider shadow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {adverts.map((ad) => (
          <div key={ad.id} className="p-4 rounded-3xl bg-french-card border border-french-gold/30 shadow-md space-y-3 relative overflow-hidden">
            <div className="w-full h-40 rounded-2xl overflow-hidden border border-french-gold/20">
              <BrandedFoodImage src={ad.image_url} name={ad.title} category="banner" className="w-full h-full object-cover" />
            </div>

            <h4 className="font-serif font-bold text-base text-french-dark">{ad.title}</h4>
            <p className="text-xs text-french-muted">{ad.description}</p>
            
            <div className="pt-2 flex justify-between items-center">
              <span className="text-[11px] font-bold text-french-gold bg-french-dark px-2.5 py-1 rounded-md">CTA: {ad.cta}</span>
              <button onClick={() => setAdverts(adverts.filter(a => a.id !== ad.id))} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-french-card border border-french-gold/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-extrabold text-xl text-french-dark">Upload Promotional Banner</h3>

            <form onSubmit={handleCreateAdvert} className="space-y-3 text-xs font-bold text-french-dark">
              <div>
                <label className="block mb-1">Banner Title *</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Free Delivery Deal" className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
              </div>
              <div>
                <label className="block mb-1">Image URL *</label>
                <input type="text" required value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <textarea rows="2" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
              </div>
              <div>
                <label className="block mb-1">Button CTA Text</label>
                <input type="text" value={cta} onChange={e => setCta(e.target.value)} placeholder="Order Now" className="w-full p-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60" />
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-french-cream">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-french-dark text-french-gold font-extrabold uppercase">Save Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
