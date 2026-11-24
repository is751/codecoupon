import React from 'react';
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Sparkles, 
  Trophy, 
  Gamepad2, 
  Plane, 
  ShoppingCart, 
  MoreHorizontal,
  LayoutGrid
} from 'lucide-react';
import { Category } from '../types/coupon';

interface ShopByCategoryGridProps {
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
}

const CATEGORY_ITEMS = [
  { id: 'Tech & Electronics', label: 'Electronics', icon: Smartphone },
  { id: 'Fashion & Apparel', label: 'Fashion', icon: Shirt },
  { id: 'Home & Lifestyle', label: 'Home & Living', icon: Home },
  { id: 'Beauty & Wellness', label: 'Beauty', icon: Sparkles },
  { id: 'Sports', label: 'Sports', icon: Trophy },
  { id: 'Toys & Games', label: 'Toys & Games', icon: Gamepad2 },
  { id: 'Travel & Flights', label: 'Travel', icon: Plane },
  { id: 'Food & Dining', label: 'Food & Grocery', icon: ShoppingCart },
  { id: 'All', label: 'More', icon: MoreHorizontal },
];

export const ShopByCategoryGrid: React.FC<ShopByCategoryGridProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <LayoutGrid className="w-5 h-5 text-slate-800" />
        <h2 className="text-lg md:text-xl font-extrabold text-slate-900 font-heading">
          Shop by Category
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
        {CATEGORY_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedCategory === item.id;

          return (
            <button
              key={item.label}
              onClick={() => onSelectCategory(item.id as Category)}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:border-orange-400 hover:shadow-xs'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                  isSelected
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-50 text-slate-600 group-hover:text-orange-500 group-hover:bg-orange-50'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold truncate w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
