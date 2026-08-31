import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import BrandedFoodImage from './BrandedFoodImage';
import { X, Plus, Minus, Heart, ShoppingBag, Check } from 'lucide-react';

export default function FoodDetailsModal({ onClose }) {
  const { selectedFood, addToCart, cart, updateCartQty } = useApp();
  if (!selectedFood) return null;

  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState(selectedFood.selectedVariant || (selectedFood.price_chicken ? 'Chicken' : (selectedFood.price_veg ? 'Veg' : null)));
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);

  const addonsList = [
    { name: 'Extra Molten Cheese Lava', price: 30 },
    { name: 'Peri Peri Dip', price: 20 },
    { name: 'Extra Crunchy Jalapeños', price: 25 },
  ];

  const basePrice = variant === 'Veg' && selectedFood.price_veg 
    ? selectedFood.price_veg 
    : (variant === 'Chicken' && selectedFood.price_chicken ? selectedFood.price_chicken : selectedFood.price);

  const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const itemTotal = (basePrice + addonsPrice) * quantity;

  const handleToggleAddon = (addon) => {
    if (selectedAddons.some(a => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleAddToCart = () => {
    addToCart(selectedFood, quantity, variant);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-french-card border border-french-gold/30 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-french-dark/70 text-french-cream border border-french-gold/30 hover:bg-french-gold hover:text-french-dark transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image Showcase */}
        <div className="relative w-full h-60 sm:h-72 shrink-0 bg-french-brown/30">
          <BrandedFoodImage
            src={selectedFood.image_url}
            name={selectedFood.name}
            category={selectedFood.category_slug || selectedFood.category_name}
            className="w-full h-full object-cover"
            alt={selectedFood.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-french-card via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow ${
              (variant === 'Veg' || selectedFood.veg_type === 'veg') ? 'bg-emerald-700' : 'bg-red-700'
            }`}>
              {(variant === 'Veg' || selectedFood.veg_type === 'veg') ? '🟢 Pure Veg' : '🔴 Non-Veg'}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Title & Price */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-french-dark">
                {selectedFood.name}
              </h2>
              <p className="text-xs text-french-muted uppercase tracking-widest mt-1 font-semibold">
                French Bell Specialty • {selectedFood.category_name || selectedFood.category_slug || 'Food Item'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-french-muted block font-semibold">Base Price</span>
              <span className="font-serif font-extrabold text-2xl text-french-dark">
                ₹{basePrice}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Description & Flavor Profile
            </h4>
            <p className="text-sm text-french-muted leading-relaxed">
              {selectedFood.description || 'Crafted with signature French Bell secret spice blends, cooked fresh on order to guarantee maximum crunch and rich taste.'}
            </p>
          </div>

          {/* Dual Variant Selector (for Momos or Chicken/Veg items) */}
          {(selectedFood.price_chicken && selectedFood.price_veg) && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-french-dark mb-2">
                Choose Filling Variant *
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setVariant('Chicken')}
                  className={`py-3 px-4 rounded-2xl border font-bold text-sm flex items-center justify-between transition-all ${
                    variant === 'Chicken'
                      ? 'bg-french-dark text-french-gold border-french-gold shadow'
                      : 'bg-french-cream text-french-dark border-french-gold/30 hover:border-french-gold'
                  }`}
                >
                  <span>🍗 Chicken Momo</span>
                  <span>₹{selectedFood.price_chicken}</span>
                </button>
                <button
                  onClick={() => setVariant('Veg')}
                  className={`py-3 px-4 rounded-2xl border font-bold text-sm flex items-center justify-between transition-all ${
                    variant === 'Veg'
                      ? 'bg-emerald-900 text-white border-emerald-500 shadow'
                      : 'bg-french-cream text-french-dark border-french-gold/30 hover:border-french-gold'
                  }`}
                >
                  <span>🥦 Veg Momo</span>
                  <span>₹{selectedFood.price_veg}</span>
                </button>
              </div>
            </div>
          )}

          {/* Customization Add-ons */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-french-dark mb-2">
              Customization Options & Add-ons
            </h4>
            <div className="space-y-2">
              {addonsList.map((addon) => {
                const isSelected = selectedAddons.some(a => a.name === addon.name);
                return (
                  <div
                    key={addon.name}
                    onClick={() => handleToggleAddon(addon)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-french-gold/15 border-french-gold text-french-dark font-bold'
                        : 'bg-french-cream/60 border-french-gold/20 text-french-dark hover:border-french-gold/40'
                    }`}
                  >
                    <span className="text-sm">{addon.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">+₹{addon.price}</span>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        isSelected ? 'bg-french-gold border-french-gold text-french-dark' : 'border-french-muted'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Special Kitchen Instructions
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra spicy, less mayo, pack dip on side"
              className="w-full px-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold"
            />
          </div>

        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 sm:p-6 bg-french-dark text-french-cream border-t border-french-gold/20 flex flex-wrap items-center justify-between gap-4 shrink-0">
          
          {/* Quantity Selector */}
          <div className="flex items-center gap-3 bg-french-brown/80 border border-french-gold/30 rounded-2xl p-1.5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 rounded-xl bg-french-dark text-french-gold hover:bg-french-gold hover:text-french-dark transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-serif font-extrabold text-lg px-2 text-french-gold">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 rounded-xl bg-french-dark text-french-gold hover:bg-french-gold hover:text-french-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold text-sm uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all flex items-center justify-between gold-glow"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Add To Cart</span>
            </span>
            <span className="font-serif text-base">₹{itemTotal}</span>
          </button>

        </div>

      </div>
    </div>
  );
}
