import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Check, Sparkles } from 'lucide-react';

export default function FoodCard({ item }) {
  const { cart, addToCart, setSelectedFood, setActiveModal } = useApp();

  // Check how many of this item are in cart
  const cartItemsCount = cart
    .filter(i => i.id === item.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  const isMomo = item.category_slug === 'momos' || (item.price_chicken && item.price_veg);

  // Clicking the card opens the detailed modal
  const handleCardClick = () => {
    setSelectedFood(item);
    setActiveModal('foodDetails');
  };

  // Clicking the Add button
  const handleAddClick = (e) => {
    e.stopPropagation();
    if (isMomo) {
      // For Momos, customer must pick Veg or Chicken variant in the modal
      setSelectedFood(item);
      setActiveModal('foodDetails');
    } else {
      addToCart(item, 1, {
        variant: null,
        specialInstructions: ''
      });
    }
  };

  const isVeg = item.veg_type === 'veg';

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-french-card border border-french-gold/25 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-french-gold/70 transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1.5"
    >
      {/* Top Image Container with Distinct Photography */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-french-brown/20">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Veg / Non-Veg Indicator Dot */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-french-dark/90 backdrop-blur-md border border-french-gold/30 shadow-md">
            <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 ${
              isVeg ? 'border-emerald-500 bg-emerald-950/60' : 'border-red-500 bg-red-950/60'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isVeg ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
              }`} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-french-cream">
              {isVeg ? 'Veg' : 'Non-Veg'}
            </span>
          </div>

          {/* Popular Tag */}
          {item.popular === 1 && (
            <div className="px-2.5 py-1 rounded-full bg-french-gold text-french-dark text-[10px] font-extrabold uppercase tracking-wider shadow flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-french-dark" />
              <span>Popular</span>
            </div>
          )}
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
            {item.description}
          </p>
        </div>

        {/* Bottom Price & Add to Cart Button (NO separate customize button) */}
        <div className="pt-3 border-t border-french-gold/15 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-french-muted block">
              {isMomo ? 'From' : 'Price'}
            </span>
            <span className="font-serif font-extrabold text-xl text-french-dark">
              ₹{isMomo && item.price_veg ? Math.min(item.price_veg, item.price) : item.price}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddClick}
            className="px-4 py-2 rounded-2xl bg-french-dark text-french-gold border border-french-gold/40 hover:bg-french-gold hover:text-french-dark font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-md gold-glow group-hover:scale-105"
            aria-label={`Add ${item.name} to cart`}
          >
            {cartItemsCount > 0 ? (
              <>
                <span className="bg-french-gold text-french-dark px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {cartItemsCount}
                </span>
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
