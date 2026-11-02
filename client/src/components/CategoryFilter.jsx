import React from 'react';
import { Sparkles, Mic, Briefcase, Compass, Layers } from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Mic,
  Briefcase,
  Compass,
};

export function CategoryFilter({ categories, selectedCategory, onSelectCategory, totalCount }) {
  return (
    <div className="py-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        
        {/* All Button */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
            selectedCategory === null
              ? 'bg-brand-500 text-dark-950 font-bold border-brand-400 shadow-glow'
              : 'bg-dark-900/80 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Experiences</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            selectedCategory === null ? 'bg-dark-950/30 text-dark-950' : 'bg-white/10 text-slate-400'
          }`}>
            {totalCount}
          </span>
        </button>

        {/* Dynamic Category Buttons */}
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Sparkles;
          const isSelected = selectedCategory === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                isSelected
                  ? 'bg-brand-500 text-dark-950 font-bold border-brand-400 shadow-glow'
                  : 'bg-dark-900/80 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-dark-950/30 text-dark-950' : 'bg-white/10 text-slate-400'
              }`}>
                {cat.service_count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
