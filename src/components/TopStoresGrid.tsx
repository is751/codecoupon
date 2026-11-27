import React from 'react';
import { ArrowRight } from 'lucide-react';
import { POPULAR_STORES_LIST } from '../data/coupons';
import { Coupon, StoreInfo } from '../types/coupon';
import { isCouponExpired } from '../utils/expiry';

interface TopStoresGridProps {
  onSelectStore: (storeSlug: string) => void;
  onViewAllStores: () => void;
  stores?: Record<string, StoreInfo>;
  coupons?: Coupon[];
}

export const TopStoresGrid: React.FC<TopStoresGridProps> = ({
  onSelectStore,
  onViewAllStores,
  stores,
  coupons = [],
}) => {
  const activeCoupons = coupons.filter(
    (c) => c.verified && !isCouponExpired(c.expiryDate, c.isExpired)
  );

  const storeCards =
    stores && Object.keys(stores).length > 0
      ? Object.values(stores)
          .map((s) => {
            const liveCount = activeCoupons.filter(
              (c) =>
                c.storeSlug.toLowerCase() === s.slug.toLowerCase() ||
                c.store.toLowerCase() === s.name.toLowerCase()
            ).length;
            return {
              slug: s.slug,
              name: s.name,
              logoText: s.logoText || s.name,
              logoBg: s.logoBg || 'bg-[#FF6600]',
              logoUrl: s.logoUrl,
              count: liveCount,
              bestDiscount: s.bestDiscount,
            };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
      : POPULAR_STORES_LIST.slice(0, 8).map((s) => ({
          ...s,
          count: 0,
          logoUrl: undefined as string | undefined,
          bestDiscount: undefined as string | undefined,
        }));

  if (storeCards.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-extrabold text-slate-900 font-heading">
          Top Stores
        </h2>
        <button
          type="button"
          onClick={onViewAllStores}
          className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {storeCards.map((store) => (
          <button
            type="button"
            key={store.slug}
            onClick={() => onSelectStore(store.slug)}
            className="bg-white rounded-xl border border-slate-200/90 hover:border-orange-400 p-4 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div
              className={`w-12 h-12 rounded-xl ${store.logoBg} text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs mb-2 group-hover:scale-105 transition-transform overflow-hidden`}
            >
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-1 bg-white"
                />
              ) : (
                store.logoText.slice(0, 4)
              )}
            </div>
            <span className="text-xs font-extrabold text-slate-900 block truncate w-full group-hover:text-orange-600 transition-colors">
              {store.name}
            </span>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums block mt-0.5">
              {store.count > 0
                ? `${store.count} ${store.count === 1 ? 'Offer' : 'Offers'}`
                : store.bestDiscount || 'View Deals'}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
