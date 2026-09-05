import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import FoodCard from './FoodCard';
import CurvedUnderline from './CurvedUnderline';
import {
  Search, X, ArrowLeft, Utensils, Bike, Package,
  SlidersHorizontal, Sparkles, Drumstick, CircleDot,
  Sandwich, Layers, Flame, Boxes
} from 'lucide-react';

const CATEGORY_ICONS = {
  all: Utensils,
  starters: Utensils,
  strips: Drumstick,
  momos: CircleDot,
  burgers: Sandwich,
  sandwich: Layers,
  rolls: Sparkles,
  loaded: Flame,
  platters: Boxes
};

export default function MenuPage({ onBackToHome }) {
  const {
    menuItems, categories,
    orderMode, setOrderMode,
    activeCategory, setActiveCategory,
    searchQuery, setSearchQuery,
    dietaryFilter, setDietaryFilter
  } = useApp();

  const [sortBy, setSortBy] = useState('popular');

  // Filter items
  const filteredItems = menuItems.filter(item => {
    // 1. Availability check
    if (item.available === 0) return false;

    // 2. Category check
    if (activeCategory !== 'all' && item.category_slug !== activeCategory) {
      return false;
    }

    // 3. Dietary check
    if (dietaryFilter === 'veg' && item.veg_type !== 'veg') return false;
    if (dietaryFilter === 'non-veg' && item.veg_type !== 'non-veg') return false;

    // 4. Search Query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCategory = (item.category_slug || '').toLowerCase().includes(q) || (item.category_name || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      if (!matchName && !matchCategory && !matchDesc) return false;
    }

    return true;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return (b.popular || 0) - (a.popular || 0);
  });

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-20 bg-french-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Top Header Bar: Back Button & Order Type Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-french-gold/20">

          {/* Left: Back to Home & Title */}
          <div>
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-french-dark/70 hover:text-french-warm transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            <h1 className="font-serif font-black text-3xl sm:text-4xl text-french-dark tracking-tight">
              FrenchBell <span className="text-french-warm">Menu</span>
            </h1>
            <div className="w-36 sm:w-44 mt-1">
              <CurvedUnderline className="text-french-gold h-3" />
            </div>
          </div>

          {/* Right: Modern Segmented Order Type Selector (Requirement 15) */}
          <div className="bg-french-dark/95 p-1.5 rounded-2xl border border-french-gold/30 shadow-lg flex items-center gap-1 self-start md:self-center">
            <button
              type="button"
              onClick={() => setOrderMode('takeaway')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                orderMode === 'takeaway'
                  ? 'bg-french-gold text-french-dark shadow gold-glow'
                  : 'text-french-cream/80 hover:text-french-gold'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Takeaway</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderMode('dine-in')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                orderMode === 'dine-in'
                  ? 'bg-french-gold text-french-dark shadow gold-glow'
                  : 'text-french-cream/80 hover:text-french-gold'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Dine In</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderMode('delivery')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                orderMode === 'delivery'
                  ? 'bg-french-gold text-french-dark shadow gold-glow'
                  : 'text-french-cream/80 hover:text-french-gold'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Delivery</span>
            </button>
          </div>

        </div>

        {/* Category Sorting Tabs (Requirement 16) */}
        <div className="w-full overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-max px-1">
            {/* All Cravings Tab */}
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center gap-2 ${
                activeCategory === 'all'
                  ? 'bg-french-dark text-french-gold border border-french-gold shadow-lg gold-glow scale-105'
                  : 'bg-french-card text-french-dark border border-french-gold/25 hover:border-french-gold hover:bg-french-gold/10'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>All Cravings</span>
            </button>

            {/* Categories */}
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.slug;
              const IconComp = CATEGORY_ICONS[cat.slug] || Sparkles;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-french-dark text-french-gold border border-french-gold shadow-lg gold-glow scale-105'
                      : 'bg-french-card text-french-dark border border-french-gold/25 hover:border-french-gold hover:bg-french-gold/10'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instant Search Bar & Filter Toolbar (Requirement 17) */}
        <div className="space-y-4">
          <div className="relative flex items-center max-w-3xl mx-auto">
            <Search className="absolute left-4 w-5 h-5 text-french-gold" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your favourite food..."
              className="w-full pl-12 pr-12 py-3.5 rounded-full bg-french-card border-2 border-french-gold/30 text-french-dark placeholder-french-muted font-medium text-sm sm:text-base focus:outline-none focus:border-french-gold shadow-md transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 p-1.5 rounded-full text-french-muted hover:text-french-dark hover:bg-french-cream transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sub-toolbar: Match count, Veg/Non-Veg filter, Sort By */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm max-w-3xl mx-auto pt-1">
            <span className="font-serif font-bold text-french-dark">
              Showing <strong className="text-french-warm">{sortedItems.length}</strong> items
            </span>

            <div className="flex items-center gap-2">
              {/* Veg / Non-Veg Toggle */}
              <div className="flex items-center bg-french-card border border-french-gold/30 rounded-full p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setDietaryFilter('all')}
                  className={`px-3 py-1 rounded-full font-bold transition-all text-xs ${
                    dietaryFilter === 'all' ? 'bg-french-dark text-french-gold' : 'text-french-muted hover:text-french-dark'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryFilter('veg')}
                  className={`px-3 py-1 rounded-full font-bold transition-all text-xs flex items-center gap-1 ${
                    dietaryFilter === 'veg' ? 'bg-emerald-800 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryFilter('non-veg')}
                  className={`px-3 py-1 rounded-full font-bold transition-all text-xs flex items-center gap-1 ${
                    dietaryFilter === 'non-veg' ? 'bg-red-800 text-white' : 'text-red-700 hover:bg-red-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Non-Veg</span>
                </button>
              </div>

              {/* Sort By Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-1.5 rounded-full bg-french-card border border-french-gold/30 text-french-dark font-bold text-xs focus:outline-none focus:border-french-gold shadow-sm cursor-pointer"
              >
                <option value="popular">Popular First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Menu Items Grid (Requirement 18 & 19) */}
        {sortedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {sortedItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-french-gold/20 text-french-dark flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-french-gold" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-french-dark">
              No matching food items found
            </h3>
            <p className="text-xs text-french-muted">
              Try searching for something else like fries, momos, burger, or loaded rolls.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setDietaryFilter('all');
              }}
              className="px-6 py-2.5 rounded-full bg-french-dark text-french-gold font-bold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
