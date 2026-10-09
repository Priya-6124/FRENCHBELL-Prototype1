import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Minus, ShoppingCart, Check, Ban } from 'lucide-react';

export default function FoodDetailsModal({ onClose }) {
  const { selectedFood, addToCart, updateCartItemDetails } = useApp();
  if (!selectedFood) return null;

  const isCartEdit = Boolean(selectedFood.isCartEdit);
  const isOutOfStock = selectedFood.available === 0 || (selectedFood.stock_quantity !== undefined && Number(selectedFood.stock_quantity) <= 0);

  const [quantity, setQuantity] = useState(selectedFood.quantity || 1);
  const [specialInstructions, setSpecialInstructions] = useState(selectedFood.specialInstructions || '');

  const unitPrice = selectedFood.price;
  const totalPrice = unitPrice * quantity;

  // Sanitize text input
  const sanitizeText = (text) => {
    return text.replace(/[<>]/g, '').trim();
  };

  const handleAction = () => {
    if (isOutOfStock && !isCartEdit) return;

    const cleanInstructions = sanitizeText(specialInstructions);

    if (isCartEdit && updateCartItemDetails) {
      updateCartItemDetails(selectedFood.cartItemId, {
        quantity,
        specialInstructions: cleanInstructions,
        price: unitPrice
      });
    } else {
      addToCart(selectedFood, quantity, {
        variant: null,
        specialInstructions: cleanInstructions
      });
    }

    if (onClose) onClose();
  };

  const isVeg = selectedFood.veg_type === 'veg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-french-card border border-french-gold/35 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-french-dark/75 text-french-cream border border-french-gold/30 hover:bg-french-gold hover:text-french-dark transition-colors shadow-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image Showcase */}
        <div className="relative w-full h-56 sm:h-64 shrink-0 bg-french-brown/30">
          <img
            src={selectedFood.image_url}
            alt={selectedFood.name}
            className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale-[60%]' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-french-card via-transparent to-transparent" />

          {/* Out of stock banner */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-4 py-1.5 rounded-full bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg border border-red-400">
                <Ban className="w-4 h-4" />
                <span>Currently Unavailable</span>
              </span>
            </div>
          )}

          {/* Veg / Non-Veg Indicator Badge on Image */}
          <div className="absolute bottom-3 left-6 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-french-dark/90 backdrop-blur-md border border-french-gold/30 shadow-md">
              <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 ${
                isVeg ? 'border-emerald-500 bg-emerald-950/60' : 'border-red-500 bg-red-950/60'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isVeg ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                }`} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-french-cream">
                {isVeg ? 'Veg' : 'Non-Veg'}
              </span>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-french-dark/80 text-french-gold border border-french-gold/30">
              {selectedFood.category_name || selectedFood.category_slug || 'Specialty'}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-french-dark">

          {/* Item Name, Base Price & Description */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-french-dark leading-tight">
                  {selectedFood.name}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-french-muted uppercase tracking-wider font-semibold">
                    FrenchBell Cafe Fresh Preparation
                  </span>
                  {selectedFood.prep_time_mins && (
                    <span className="text-[11px] text-french-gold bg-french-dark px-2 py-0.5 rounded-full font-bold">
                      {selectedFood.prep_time_mins} mins
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-french-muted uppercase tracking-wider block font-bold">Price</span>
                <span className="font-serif font-extrabold text-2xl text-french-dark">
                  ₹{unitPrice}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-french-muted mt-2 leading-relaxed">
              {selectedFood.description}
            </p>
          </div>

          {/* Text-Only Special Instructions Customization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-french-dark">
                Special Instructions
              </label>
              <span className="text-[10px] text-french-muted font-mono">
                {specialInstructions.length}/300
              </span>
            </div>

            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value.slice(0, 300))}
              placeholder="Tell us how you'd like your order prepared (e.g. Less spicy, Extra sauce, No onions, Less salty)..."
              rows={3}
              className="w-full p-3.5 rounded-2xl bg-french-cream border border-french-gold/35 text-french-dark text-xs sm:text-sm placeholder-french-muted/70 focus:outline-none focus:border-french-gold transition-all resize-none shadow-inner"
            />
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-french-cream/60 border border-french-gold/25">
              <span className="text-xs font-bold uppercase tracking-wider text-french-dark">
                Quantity
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl bg-french-dark text-french-gold flex items-center justify-center hover:bg-french-gold hover:text-french-dark transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="font-serif font-extrabold text-lg text-french-dark min-w-[20px] text-center">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 rounded-xl bg-french-dark text-french-gold flex items-center justify-center hover:bg-french-gold hover:text-french-dark transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 sm:p-5 bg-french-cream border-t border-french-gold/20 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-french-muted block">Total</span>
            <span className="font-serif font-extrabold text-2xl text-french-dark">
              ₹{totalPrice}
            </span>
          </div>

          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="flex-1 max-w-xs py-3.5 px-6 rounded-full bg-gray-200 text-gray-500 font-extrabold text-xs sm:text-sm uppercase tracking-wider cursor-not-allowed"
            >
              Currently Unavailable
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAction}
              className="flex-1 max-w-xs py-3.5 px-6 rounded-full bg-french-dark text-french-gold border border-french-gold/40 hover:bg-french-gold hover:text-french-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg gold-glow"
            >
              {isCartEdit ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart • ₹{totalPrice}</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
