import React from 'react';
import {
  Gamepad2,
  Zap,
  Gauge,
  Puzzle,
  ShieldAlert,
  Crown,
  Coffee,
  Wrench,
  Compass,
  Trophy,
} from 'lucide-react';
import { GameCategory } from '../types/game';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

interface CategoryDef {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORIES: CategoryDef[] = [
  { name: 'All', label: 'All Games & Apps', icon: Gamepad2 },
  { name: 'Action', label: 'Action', icon: Zap },
  { name: 'Racing', label: 'Racing', icon: Gauge },
  { name: 'Puzzle', label: 'Puzzle', icon: Puzzle },
  { name: 'RPG', label: 'RPG', icon: ShieldAlert },
  { name: 'Strategy', label: 'Strategy', icon: Crown },
  { name: 'Casual', label: 'Casual', icon: Coffee },
  { name: 'Tools', label: 'Tools & Utilities', icon: Wrench },
  { name: 'Adventure', label: 'Adventure', icon: Compass },
  { name: 'Sports', label: 'Sports', icon: Trophy },
];

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3">
      <div className="flex items-center gap-2 min-w-max px-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          const count = categoryCounts[cat.name] || 0;

          return (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all select-none ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
              <span>{cat.label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-slate-950/20 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 font-medium'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
