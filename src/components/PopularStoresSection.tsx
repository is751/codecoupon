import React from 'react';
import { Store } from 'lucide-react';
import { POPULAR_STORES_LIST } from '../data/coupons';

interface PopularStoresSectionProps {
  onSelectStore: (storeName: string) => void;
  selectedStore: string | null;
}

export const PopularStoresSection: React.FC<PopularStoresSectionProps> = ({
  onSelectStore,
  selectedStore,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-heading">
            Featured Partner Stores
          </h3>
        </div>
        {selectedStore && (
          <button
            type="button"
            onClick={() => onSelectStore('')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer underline underline-offset-4"
          >
            Show All Stores
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {POPULAR_STORES_LIST.map((store) => {
          const isSelected = selectedStore?.toLowerCase() === store.name.toLowerCase();

          return (
            <button
              type="button"
              key={store.name}
              onClick={() => onSelectStore(isSelected ? '' : store.name)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-3 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-md ${store.logoBg} text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-xs`}
              >
                {store.logoText.slice(0, 4)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold truncate">{store.name}</span>
                <span
                  className={`block text-[11px] truncate ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  View Deals
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
