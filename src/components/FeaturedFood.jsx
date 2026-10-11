import React from 'react';
import { useApp } from '../context/AppContext';
import FoodCard from './FoodCard';
import CurvedUnderline from './CurvedUnderline';
import { Flame, ArrowRight } from 'lucide-react';

export default function FeaturedFood({ onExploreMenu }) {
  const { menuItems, setCurrentView } = useApp();

  const handleExplore = () => {
    if (onExploreMenu) onExploreMenu();
    else if (setCurrentView) setCurrentView('menu');
  };

  // Pick top popular featured items matching prompt exact names or popular flag
  const featured = menuItems.filter(item =>
    item.popular === 1 ||
    ['Chicken Burger', 'Zinger Burger', 'Peri Peri Momos', 'Crispy Chicken Roll', 'Cheesy Blaster Loaded', 'Mixed Platter'].includes(item.name)
  ).slice(0, 8);

  return (
    <section className="py-16 bg-french-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-french-gold/15 text-french-warm text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-french-amber" />
            <span>FrenchBell Specialties</span>
          </div>

          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-french-dark tracking-tight">
            Popular Customer Favorites
          </h2>

          <div className="w-44 sm:w-56 mx-auto">
            <CurvedUnderline className="text-french-caramel h-4 sm:h-5" />
          </div>

          <p className="text-french-muted text-sm sm:text-base font-normal">
            Hand-crafted cafe favorites loaded with authentic flavor, crunch, and gourmet quality.
          </p>
        </div>

        {/* Featured Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {featured.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>

        {/* Explore Full Menu CTA button */}
        <div className="text-center pt-12">
          <button
            onClick={handleExplore}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-french-dark text-french-gold font-extrabold text-sm uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all duration-300 shadow-xl gold-glow hover:scale-105"
          >
            <span>Explore All 49 Items</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
