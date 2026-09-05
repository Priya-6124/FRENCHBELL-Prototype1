import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CategoryTabs from './CategoryTabs';
import SearchBar from './SearchBar';
import FoodCard from './FoodCard';
import { UtensilsCrossed, Frown } from 'lucide-react';

export default function MenuSection() {
  const { menuItems, categories } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');

  // Filter and Sort Logic
  const filteredItems = menuItems.filter((item) => {
    // Category match
    if (activeCategory !== 'all' && item.category_slug !== activeCategory) {
      // Find category slug from categories list if needed
      const catObj = categories.find(c => c.id === item.category_id);
      if (catObj && catObj.slug !== activeCategory) return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = item.name.toLowerCase().includes(q);
      const descMatch = (item.description || '').toLowerCase().includes(q);
      const catMatch = (item.category_slug || item.category_name || '').toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !catMatch) return false;
    }

    // Veg / Non-Veg filter match
    if (vegFilter === 'veg' && item.veg_type !== 'veg' && !item.price_veg) return false;
    if (vegFilter === 'non-veg' && item.veg_type !== 'non-veg') return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return (b.popular || 0) - (a.popular || 0); // Recommended popular first
  });

  return (
    <section id="menu" className="py-16 bg-french-cream relative min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="font-serif text-2xl sm:text-3xl text-french-gold font-bold block">
            Pick Your Craving
          </span>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-french-dark tracking-tight">
            Complete Menu
          </h2>
          <p className="text-french-muted text-sm sm:text-base">
            Explore authentic French Bell Cafe specialties prepared fresh to order.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          vegFilter={vegFilter}
          setVegFilter={setVegFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          matchCount={filteredItems.length}
        />

        {/* Category Navigation Tabs */}
        <CategoryTabs
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setSearchQuery('');
          }}
        />

        {/* Food Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mt-6">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto rounded-full bg-french-gold/15 text-french-gold flex items-center justify-center">
              <Search className="w-8 h-8 text-french-gold" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-french-dark">
              No items matched your search
            </h3>
            <p className="text-french-muted text-sm">
              We couldn't find anything matching "{searchQuery}". Try searching for burgers, momos, fries, rolls or platters!
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setVegFilter('all');
              }}
              className="px-6 py-2.5 rounded-full bg-french-dark text-french-gold font-bold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all"
            >
              Clear Search & Show All
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
