import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import BrandedFoodImage from './BrandedFoodImage';
import { Heart, Plus, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function FoodCard({ item }) {
  const { cart, setSelectedFood, setActiveModal } = useApp();
  const [isFavorite, setIsFavorite] = useState(false);

  // Check how many of this item (in any customization) are in cart
  const cartItemsCount = cart
    .filter(i => i.id === item.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  const handleOpenCustomizer = (e) => {
    if (e) e.stopPropagation();
    setSelectedFood(item);
    setActiveModal('foodDetails');
  };

  return (
    <div
      onClick={handleOpenCustomizer}
      className="group relative bg-french-card border border-french-gold/25 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-french-gold/70 transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1.5"
    >
      {/* Top Image Container */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-french-brown/20">
        <BrandedFoodImage
          src={item.image_url}
          name={item.name}
          category={item.category_slug || item.category_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          alt={item.name}
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Veg / Non-Veg Indicator Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-french-dark/90 backdrop-blur-md border border-french-gold/30 shadow-md">
            <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 ${
              item.veg_type === 'veg' ? 'border-emerald-500 bg-emerald-950/60' : 'border-red-500 bg-red-950/60'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                item.veg_type === 'veg' ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
              }`} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-french-cream">
              {item.veg_type === 'veg' ? 'Veg' : 'Non-Veg'}
            </span>
          </div>

          {/* Favorite Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className={`p-2 rounded-full backdrop-blur-md border transition-all pointer-events-auto ${
              isFavorite
                ? 'bg-red-500/90 text-white border-red-400 scale-110'
                : 'bg-french-dark/70 text-french-cream border-french-gold/30 hover:text-red-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Popular Tag */}
        {item.popular === 1 && (
          <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-french-gold to-amber-500 text-french-dark text-[10px] font-extrabold uppercase tracking-wider shadow flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Chef Special</span>
          </div>
        )}

        {/* Customization Available Tag */}
        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-french-dark/80 backdrop-blur-md border border-french-gold/30 text-french-gold text-[9px] font-bold uppercase tracking-wider">
          Customizable ⚙️
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Item Name */}
          <h3 className="font-serif font-bold text-lg text-french-dark group-hover:text-french-warm transition-colors line-clamp-1">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-french-muted line-clamp-2 mt-1 font-normal leading-relaxed">
            {item.description || 'Prepared fresh with signature French Bell spices and premium ingredients.'}
          </p>
        </div>

        {/* Bottom Price & Customize & Add Button */}
        <div className="pt-3 border-t border-french-gold/15 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-french-muted block">From</span>
            <span className="font-serif font-extrabold text-xl text-french-dark">
              ₹{item.price_veg ? Math.min(item.price_veg, item.price) : item.price}
            </span>
          </div>

          {/* Customize & Add CTA Button */}
          <button
            onClick={handleOpenCustomizer}
            className="px-3.5 py-2 rounded-2xl bg-french-dark text-french-gold border border-french-gold/40 hover:bg-french-gold hover:text-french-dark font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-md gold-glow group-hover:scale-105"
          >
            {cartItemsCount > 0 ? (
              <>
                <span className="bg-french-gold text-french-dark px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {cartItemsCount}
                </span>
                <span>In Cart</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Customize</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
