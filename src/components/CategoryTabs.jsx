import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Utensils,
  Flame,
  CircleDot,
  Sandwich,
  Layers,
  Sparkles,
  Boxes,
  LayoutGrid,
  Drumstick
} from 'lucide-react';

const CATEGORY_ICONS = {
  all: LayoutGrid,
  starters: Utensils,
  strips: Drumstick,
  momos: CircleDot,
  burgers: Sandwich,
  sandwich: Layers,
  rolls: Sparkles,
  loaded: Flame,
  platters: Boxes
};

export default function CategoryTabs({ activeCategory, onSelectCategory }) {
  const { categories } = useApp();

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
          <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-french-gold" />
          <span>All Cravings</span>
        </button>

        {/* Categories */}
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.slug;
          const IconComponent = CATEGORY_ICONS[cat.slug] || Utensils;

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
              <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-french-gold' : 'text-french-warm'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
