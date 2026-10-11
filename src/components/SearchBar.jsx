import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function SearchBar({
  searchQuery, setSearchQuery,
  vegFilter, setVegFilter,
  sortBy, setSortBy,
  matchCount
}) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 mb-6">
      
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-french-gold" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search burger, momo, chicken, cheese, fries..."
          className="w-full pl-12 pr-12 py-3.5 rounded-full bg-french-card border-2 border-french-gold/30 text-french-dark placeholder-french-muted font-medium text-sm sm:text-base focus:outline-none focus:border-french-gold shadow-md transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 p-1 rounded-full text-french-muted hover:text-french-dark hover:bg-french-cream/80"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        
        {/* Match Count Badge */}
        <div className="font-serif font-bold text-french-warm">
          {searchQuery ? (
            <span>Found <strong className="text-french-gold text-base">{matchCount}</strong> matching items</span>
          ) : (
            <span>Showing <strong className="text-french-dark">{matchCount}</strong> menu items</span>
          )}
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Veg / Non-Veg Toggle Filter */}
          <div className="flex items-center bg-french-card border border-french-gold/30 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setVegFilter('all')}
              className={`px-3 py-1 rounded-full font-bold transition-all text-xs ${
                vegFilter === 'all' ? 'bg-french-dark text-french-gold' : 'text-french-muted hover:text-french-dark'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVegFilter('veg')}
              className={`px-3 py-1 rounded-full font-bold transition-all text-xs flex items-center gap-1 ${
                vegFilter === 'veg' ? 'bg-emerald-800 text-white' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Veg Only
            </button>
            <button
              onClick={() => setVegFilter('non-veg')}
              className={`px-3 py-1 rounded-full font-bold transition-all text-xs flex items-center gap-1 ${
                vegFilter === 'non-veg' ? 'bg-red-800 text-white' : 'text-red-700 hover:bg-red-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Non-Veg
            </button>
          </div>

          {/* Price Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-french-card border border-french-gold/30 text-french-dark font-bold text-xs focus:outline-none focus:border-french-gold shadow-sm cursor-pointer"
          >
            <option value="recommended">Sort: Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>

        </div>

      </div>

    </div>
  );
}
