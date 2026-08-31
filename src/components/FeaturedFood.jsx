import React from 'react';
import { useApp } from '../context/AppContext';
import FoodCard from './FoodCard';
import { Flame, Sparkles } from 'lucide-react';

export default function FeaturedFood() {
  const { menuItems } = useApp();

  // Pick top popular featured items matching prompt exact names or popular flag
  const featured = menuItems.filter(item => 
    item.popular === 1 || 
    ['Chicken Burger', 'Zinger Burger', 'Peri Peri Momos', 'Crispy Chicken Roll', 'Cheesy Blaster Loaded', 'Mixed Platter'].includes(item.name)
  ).slice(0, 8);

  return (
    <section className="py-16 bg-french-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-french-gold/15 text-french-warm text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-french-amber" />
            <span>French Bell Specialties</span>
          </div>

          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-french-dark tracking-tight">
            Cravings Calling? 🔔
          </h2>

          <p className="text-french-muted text-sm sm:text-base font-normal">
            Hand-picked crowd favorites loaded with extra flavor, crispiness & cheesy goodness.
          </p>
        </div>

        {/* Featured Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {featured.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>

      </div>
    </section>
  );
}
