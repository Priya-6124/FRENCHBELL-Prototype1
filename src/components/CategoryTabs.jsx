import React from 'react';
import { useApp } from '../context/AppContext';

export default function CategoryTabs({ activeCategory, onSelectCategory }) {
  const { categories } = useApp();

  const categoryIcons = {
    'starters': '🍟',
    'strips': '🍗',
    'momos': '🥟',
    'burgers': '🍔',
    'sandwich': '🥪',
    'rolls': '🌯',
    'loaded': '🧀',
    'platters': '🍱'
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 my-4">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-max px-2">
        {/* All Items Option */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 flex items-center gap-2 ${
            activeCategory === 'all'
              ? 'bg-french-dark text-french-gold border border-french-gold shadow-lg gold-glow scale-105'
              : 'bg-french-card text-french-dark border border-french-gold/25 hover:border-french-gold hover:bg-french-gold/10'
          }`}
        >
          <span>✨</span>
          <span>All Cravings</span>
        </button>

        {/* Categories */}
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.slug;
          const emoji = categoryIcons[cat.slug] || '🍽️';

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 flex items-center gap-2 ${
                isSelected
                  ? 'bg-french-dark text-french-gold border border-french-gold shadow-lg gold-glow scale-105'
                  : 'bg-french-card text-french-dark border border-french-gold/25 hover:border-french-gold hover:bg-french-gold/10'
              }`}
            >
              <span className="text-base">{emoji}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
