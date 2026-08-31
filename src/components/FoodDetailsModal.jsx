import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import BrandedFoodImage from './BrandedFoodImage';
import { X, Plus, Minus, Check, ShoppingBag, Flame, Sparkles } from 'lucide-react';

export default function FoodDetailsModal({ onClose }) {
  const { selectedFood, addToCart, setCartOpen } = useApp();
  if (!selectedFood) return null;

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('Regular'); // 'Regular' | 'Large' | 'Jumbo'
  const [variant, setVariant] = useState(
    selectedFood.selectedVariant || (selectedFood.price_chicken ? 'Chicken' : (selectedFood.price_veg ? 'Veg' : null))
  );
  const [spiceLevel, setSpiceLevel] = useState('Medium'); // 'Mild' | 'Medium' | 'Fiery'
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const availableAddons = [
    { id: 'cheese', name: '🧀 Extra Molten Cheese Lava', price: 30 },
    { id: 'periperi', name: '🌶️ Signature Peri Peri Dip', price: 20 },
    { id: 'jalapeno', name: '🫑 Extra Sliced Jalapeños', price: 15 },
    { id: 'mayo', name: '🥣 Garlic Herb Mayonnaise', price: 15 },
    { id: 'crispy', name: '🍗 Extra Crispy Tender Strip', price: 40 },
  ];

  // Base price computation
  let basePrice = selectedFood.price;
  if (variant === 'Veg' && selectedFood.price_veg) basePrice = selectedFood.price_veg;
  if (variant === 'Chicken' && selectedFood.price_chicken) basePrice = selectedFood.price_chicken;

  const sizeMultiplier = size === 'Jumbo' ? 1.4 : (size === 'Large' ? 1.2 : 1);
  const sizeCost = Math.round(basePrice * sizeMultiplier);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = sizeCost + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleToggleAddon = (addon) => {
    if (selectedAddons.some(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleAddToCart = () => {
    addToCart(selectedFood, quantity, {
      variant,
      size,
      spiceLevel,
      selectedAddons,
      specialInstructions
    });
    setCartOpen(true);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-french-card border border-french-gold/35 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-french-dark/70 text-french-cream border border-french-gold/30 hover:bg-french-gold hover:text-french-dark transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image Showcase */}
        <div className="relative w-full h-56 sm:h-64 shrink-0 bg-french-brown/30">
          <BrandedFoodImage
            src={selectedFood.image_url}
            name={selectedFood.name}
            category={selectedFood.category_slug || selectedFood.category_name}
            className="w-full h-full object-cover"
            alt={selectedFood.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-french-card via-transparent to-transparent" />
          
          <div className="absolute bottom-3 left-6 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow ${
              (variant === 'Veg' || selectedFood.veg_type === 'veg') ? 'bg-emerald-700' : 'bg-red-700'
            }`}>
              {(variant === 'Veg' || selectedFood.veg_type === 'veg') ? '🟢 Pure Veg' : '🔴 Non-Veg'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-french-dark/80 text-french-gold border border-french-gold/30">
              {selectedFood.category_slug || 'Specialty'}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Customization Suite */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-french-dark">
          
          {/* Title & Description */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-french-dark">
                  {selectedFood.name}
                </h2>
                <p className="text-xs text-french-muted uppercase tracking-widest mt-1 font-semibold">
                  French Bell Cafe • Fresh Kitchen Prep 🔔
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-french-muted uppercase tracking-wider block font-bold">Base Price</span>
                <span className="font-serif font-extrabold text-2xl text-french-dark">
                  ₹{basePrice}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-french-muted mt-2 leading-relaxed">
              {selectedFood.description || 'Crafted with signature French Bell spices and premium ingredients, cooked fresh upon order.'}
            </p>
          </div>

          {/* 1. Filling Variant Selector (if Chicken & Veg prices both exist) */}
          {(selectedFood.price_chicken && selectedFood.price_veg) && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-french-dark">
                Choose Filling Variant *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVariant('Chicken')}
                  className={`py-3 px-4 rounded-2xl border font-bold text-xs sm:text-sm flex items-center justify-between transition-all ${
                    variant === 'Chicken'
                      ? 'bg-french-dark text-french-gold border-french-gold shadow-md'
                      : 'bg-french-cream/70 text-french-dark border-french-gold/30 hover:border-french-gold'
                  }`}
                >
                  <span>🍗 Chicken</span>
                  <span>₹{selectedFood.price_chicken}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVariant('Veg')}
                  className={`py-3 px-4 rounded-2xl border font-bold text-xs sm:text-sm flex items-center justify-between transition-all ${
                    variant === 'Veg'
                      ? 'bg-emerald-900 text-white border-emerald-500 shadow-md'
                      : 'bg-french-cream/70 text-french-dark border-french-gold/30 hover:border-french-gold'
                  }`}
                >
                  <span>🥦 Veg Paneer</span>
                  <span>₹{selectedFood.price_veg}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Portion Size Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark">
              Select Portion / Size
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { name: 'Regular', desc: 'Standard Single', mult: 1 },
                { name: 'Large', desc: '+20% Extra Crunch', mult: 1.2 },
                { name: 'Jumbo', desc: 'Double Monster Size', mult: 1.4 }
              ].map((s) => {
                const sPrice = Math.round(basePrice * s.mult);
                const isSelected = size === s.name;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSize(s.name)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-french-dark text-french-gold border-french-gold shadow-md'
                        : 'bg-french-cream/70 text-french-dark border-french-gold/25 hover:border-french-gold/50'
                    }`}
                  >
                    <span className="font-serif font-extrabold text-sm">{s.name}</span>
                    <span className="text-[10px] text-french-muted mt-0.5">{s.desc}</span>
                    <span className="font-bold text-xs mt-1">₹{sPrice}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Spice Level Slider / Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Spice & Seasoning Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { name: 'Mild', icon: '🌿', label: 'Classic / Low Spice' },
                { name: 'Medium', icon: '🌶️', label: 'French Bell Signature' },
                { name: 'Fiery', icon: '🔥', label: 'Extra Peri Peri Spicy' }
              ].map((sp) => {
                const isSelected = spiceLevel === sp.name;
                return (
                  <button
                    key={sp.name}
                    type="button"
                    onClick={() => setSpiceLevel(sp.name)}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-french-gold text-french-dark font-extrabold border-french-dark shadow'
                        : 'bg-french-cream/70 text-french-dark border-french-gold/25 hover:border-french-gold/50'
                    }`}
                  >
                    <div className="text-base">{sp.icon}</div>
                    <div className="text-xs font-bold">{sp.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Delicious Add-ons Checklist */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-french-gold" />
              <span>Custom Add-ons & Extra Dips</span>
            </label>
            <div className="space-y-2">
              {availableAddons.map((addon) => {
                const isSelected = selectedAddons.some(a => a.id === addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => handleToggleAddon(addon)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-french-gold/15 border-french-gold text-french-dark font-bold'
                        : 'bg-french-cream/60 border-french-gold/20 text-french-dark hover:border-french-gold/40'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{addon.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">+₹{addon.price}</span>
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-french-gold border-french-gold text-french-dark' : 'border-french-gold/40'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Special Kitchen Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1.5">
              Chef Notes & Special Requests
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra crispy fries, mayo on the side, no onions"
              className="w-full px-4 py-3 rounded-2xl border border-french-gold/30 bg-french-cream/70 text-sm focus:outline-none focus:border-french-gold shadow-inner"
            />
          </div>

        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 sm:p-6 bg-french-dark text-french-cream border-t border-french-gold/20 flex items-center justify-between gap-4 shrink-0 shadow-2xl">
          
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-french-brown/80 border border-french-gold/30 rounded-2xl p-1.5">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 rounded-xl bg-french-dark text-french-gold hover:bg-french-gold hover:text-french-dark transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-mono font-extrabold text-lg px-2 text-french-gold min-w-[28px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 rounded-xl bg-french-dark text-french-gold hover:bg-french-gold hover:text-french-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold text-sm uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-between gold-glow"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Add Customized</span>
            </span>
            <span className="font-serif font-extrabold text-base">₹{totalPrice}</span>
          </button>

        </div>

      </div>
    </div>
  );
}
