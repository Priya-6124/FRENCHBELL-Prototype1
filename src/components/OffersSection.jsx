import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, Tag, Clock } from 'lucide-react';
import CurvedUnderline from './CurvedUnderline';

export default function OffersSection({ onExploreClick }) {
  const { offers, setAppliedOffer, addNotification } = useApp();

  const defaultOffers = [
    {
      id: 101,
      title: 'Zinger & Loaded Fries Special Duo',
      description: 'Pair any signature burger with peri peri loaded fries for a flat ₹40 off.',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      discount_label: 'Flat ₹40 OFF',
      validity: 'Weekend Special',
      applicable_order_type: 'All Orders'
    },
    {
      id: 102,
      title: 'Steamed & Fried Momos Fiesta',
      description: 'Try any 2 momo variants (Chicken or Veg) with authentic fiery dips.',
      image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
      discount_label: '15% OFF',
      validity: 'Mon – Thu Special',
      applicable_order_type: 'Dine In & Takeaway'
    },
    {
      id: 103,
      title: 'Grand Sharing Platter Combo',
      description: 'Loaded platter with crispy strips, momos, fries & dips starting at ₹179.',
      image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      discount_label: 'Best Value',
      validity: 'Everyday Special',
      applicable_order_type: 'All Orders'
    }
  ];

  const displayOffers = defaultOffers;

  return (
    <section id="offers" className="py-16 sm:py-20 bg-gradient-to-b from-french-dark to-[#1F1008] text-french-cream relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-french-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-french-gold/20 text-french-gold text-xs font-extrabold uppercase tracking-widest border border-french-gold/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Cafe Deals</span>
          </div>

          <div>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-french-cream tracking-tight">
              Deals Worth <span className="text-french-gold">The Craving</span>
            </h2>
            <div className="w-52 sm:w-64 mx-auto mt-1">
              <CurvedUnderline className="text-french-caramel-light h-4 sm:h-5" />
            </div>
          </div>

          <p className="text-french-cream/80 text-xs sm:text-sm">
            Handcrafted chef specials and pairing combos prepared fresh for dine-in, takeaway, and delivery.
          </p>
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {displayOffers.map((offer) => (
            <div
              key={offer.id}
              onClick={onExploreClick}
              className="group relative rounded-3xl bg-french-card/10 border border-french-gold/30 overflow-hidden shadow-xl hover:shadow-2xl hover:border-french-gold transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1 backdrop-blur-sm"
            >
              {/* Offer Image Container */}
              <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-french-brown/30">
                <img
                  src={offer.image_url}
                  alt={offer.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-french-dark via-transparent to-transparent opacity-80" />

                {/* Top Discount Tag */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-french-gold text-french-dark font-black text-xs uppercase tracking-wider shadow-lg">
                  {offer.discount_label}
                </div>

                {/* Applicable Order Type */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-french-dark/85 text-french-gold border border-french-gold/30 text-[10px] font-bold uppercase tracking-wider">
                  {offer.applicable_order_type}
                </div>
              </div>

              {/* Offer Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-french-gold font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{offer.validity}</span>
                  </div>

                  <h3 className="font-serif font-bold text-lg sm:text-xl text-french-cream group-hover:text-french-gold transition-colors leading-snug">
                    {offer.title}
                  </h3>

                  <p className="text-xs text-french-cream/75 leading-relaxed font-normal">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-french-gold/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-french-gold uppercase tracking-wider">
                    Order In Menu
                  </span>
                  <div className="p-2 rounded-full bg-french-gold text-french-dark group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
