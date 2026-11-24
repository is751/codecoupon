import React from 'react';
import { SlidersHorizontal, ArrowUpDown, Sparkles, Tag, Percent, Truck, RotateCcw } from 'lucide-react';
import { DealType, SortOption } from '../types/coupon';

interface DealControlsBarProps {
  dealType: DealType;
  setDealType: (type: DealType) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  totalResults: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const DealControlsBar: React.FC<DealControlsBarProps> = ({
  dealType,
  setDealType,
  sortBy,
  setSortBy,
  totalResults,
  hasActiveFilters,
  onResetFilters,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-200">
      
      {/* Left: Deal Type Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setDealType('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            dealType === 'all'
              ? 'bg-[#FF6600] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80'
          }`}
        >
          <span>All Offers</span>
        </button>

        <button
          onClick={() => setDealType('code')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            dealType === 'code'
              ? 'bg-[#FF6600] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Coupon Codes</span>
        </button>

        <button
          onClick={() => setDealType('deal')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            dealType === 'deal'
              ? 'bg-[#FF6600] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>Direct Deals</span>
        </button>

        <button
          onClick={() => setDealType('exclusive')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            dealType === 'exclusive'
              ? 'bg-[#FF6600] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Exclusive</span>
        </button>

        <button
          onClick={() => setDealType('shipping')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            dealType === 'shipping'
              ? 'bg-[#FF6600] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Free Shipping</span>
        </button>
      </div>

      {/* Right: Results Count, Reset, and Sort Dropdown */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-900 font-mono tabular-nums">{totalResults}</span> coupons
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg py-1.5 pl-2.5 pr-7 focus:outline-none focus:ring-1 focus:ring-[#FF6600] cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="discount">Highest Discount</option>
            <option value="newest">Newly Added</option>
            <option value="expiring">Expiring Soon</option>
          </select>
        </div>
      </div>

    </div>
  );
};
