import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import BrandedFoodImage from './BrandedFoodImage';
import { Heart, Plus, Minus, Check, Star } from 'lucide-react';

export default function FoodCard({ item }) {
  const { cart, addToCart, updateCartQty, setSelectedFood, setActiveModal } = useApp();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(
    item.price_chicken ? 'Chicken' : (item.price_veg ? 'Veg' : null)
  );

  // Determine current price based on variant selection if applicable
  const currentPrice = selectedVariant === 'Veg' && item.price_veg 
    ? item.price_veg 
    : (selectedVariant === 'Chicken' && item.price_chicken ? item.price_chicken : item.price);

  // Check if item is already in cart
  const cartItemId = `${item.id}-${selectedVariant || 'standard'}`;
  const cartItem = cart.find(i => i.cartItemId === cartItemId);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleCardClick = () => {
    setSelectedFood({ ...item, currentPrice, selectedVariant });
    setActiveModal('foodDetails');
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(item, 1, selectedVariant);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateCartQty(cartItemId, 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateCartQty(cartItemId, -1);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-french-card border border-french-gold/25 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-french-gold/60 transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
    >
      {/* Top Image Container */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-french-brown/20">
        <BrandedFoodImage
          src={item.image_url}
          name={item.name}
          category={item.category_slug || item.category_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={item.name}
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Veg / Non-Veg Indicator Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-french-dark/85 backdrop-blur-md border border-french-gold/30 shadow-md">
            <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 ${
              (selectedVariant === 'Veg' || item.veg_type === 'veg') ? 'border-emerald-600 bg-emerald-950/40' : 'border-red-600 bg-red-950/40'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                (selectedVariant === 'Veg' || item.veg_type === 'veg') ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-french-cream">
              {(selectedVariant === 'Veg' || item.veg_type === 'veg') ? 'Veg' : 'Non-Veg'}
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
          <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-french-gold text-french-dark text-[10px] font-extrabold uppercase tracking-wider shadow">
            Popular ★
          </div>
        )}
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

        {/* Momos / Multi-variant selector if applicable */}
        {(item.price_chicken && item.price_veg) && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-french-cream border border-french-gold/20" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedVariant('Chicken')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                selectedVariant === 'Chicken'
                  ? 'bg-french-dark text-french-gold shadow-sm'
                  : 'text-french-muted hover:text-french-dark'
              }`}
            >
              Chicken (₹{item.price_chicken})
            </button>
            <button
              onClick={() => setSelectedVariant('Veg')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                selectedVariant === 'Veg'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-french-muted hover:text-french-dark'
              }`}
            >
              Veg (₹{item.price_veg})
            </button>
          </div>
        )}

        {/* Bottom Price & Add Control Bar */}
        <div className="pt-2 border-t border-french-gold/15 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-french-muted block">Price</span>
            <span className="font-serif font-extrabold text-xl text-french-dark">
              ₹{currentPrice}
            </span>
          </div>

          {/* Add / Quantity Control Button */}
          {inCartQty === 0 ? (
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-2xl bg-french-dark text-french-gold border border-french-gold/40 hover:bg-french-gold hover:text-french-dark font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-md gold-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center rounded-2xl bg-french-gold text-french-dark p-0.5 font-bold shadow-md border border-french-dark">
              <button
                onClick={handleDecrement}
                className="p-1.5 hover:bg-french-dark/10 rounded-xl transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-extrabold">{inCartQty}</span>
              <button
                onClick={handleIncrement}
                className="p-1.5 hover:bg-french-dark/10 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
