import React from 'react';
import { 
  Laptop, 
  Shirt, 
  UtensilsCrossed, 
  Server, 
  Plane, 
  Sparkles, 
  Home, 
  Gamepad2, 
  Grid 
} from 'lucide-react';
import { Category } from '../types/coupon';

interface CategoryFilterBarProps {
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  categoryCounts: Record<Category, number>;
}

interface CategoryOption {
  id: Category;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'All', label: 'All Categories', icon: Grid },
  { id: 'Tech & Electronics', label: 'Tech & Electronics', icon: Laptop },
  { id: 'Fashion & Apparel', label: 'Fashion & Apparel', icon: Shirt },
  { id: 'Hosting & Software', label: 'Hosting & Software', icon: Server },
  { id: 'Food & Dining', label: 'Food & Dining', icon: UtensilsCrossed },
  { id: 'Travel & Flights', label: 'Travel & Flights', icon: Plane },
  { id: 'Beauty & Wellness', label: 'Beauty & Wellness', icon: Sparkles },
  { id: 'Home & Lifestyle', label: 'Home & Lifestyle', icon: Home },
  { id: 'Entertainment & Gaming', label: 'Gaming & Fun', icon: Gamepad2 },
];

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="border-b border-slate-200 bg-white py-4 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Horizontal scrollable category pill bar with zero-wrap discipline */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FF6600]' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
