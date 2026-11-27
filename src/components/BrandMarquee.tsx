import React from 'react';
import { Coupon, StoreInfo } from '../types/coupon';
import { POPULAR_STORES_LIST } from '../data/coupons';
import { isCouponExpired } from '../utils/expiry';

interface BrandMarqueeProps {
  onSelectStore: (storeSlug: string) => void;
  stores?: Record<string, StoreInfo>;
  coupons?: Coupon[];
}

export const BrandMarquee: React.FC<BrandMarqueeProps> = ({
  onSelectStore,
  stores,
  coupons = [],
}) => {
  const activeCoupons = coupons.filter(
    (c) => c.verified && !isCouponExpired(c.expiryDate, c.isExpired)
  );

  const storeEntries =
    stores && Object.keys(stores).length > 0
      ? Object.values(stores).map((s) => {
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
            label:
              liveCount > 0
                ? `${liveCount} ${liveCount === 1 ? 'Offer' : 'Offers'}`
                : s.bestDiscount || 'Store Offers',
          };
        })
      : POPULAR_STORES_LIST.map((s) => ({
          slug: s.slug,
          name: s.name,
          logoText: s.logoText,
          logoBg: s.logoBg,
          logoUrl: undefined as string | undefined,
          label: 'View Deals',
        }));

  const duplicatedStores = [...storeEntries, ...storeEntries];

  return (
    <div className="bg-[#0B0F17]/95 border-t border-slate-800 py-3.5 overflow-hidden relative select-none">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0B0F17] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0B0F17] to-transparent z-10 pointer-events-none" />

      <div className="flex items-center gap-6 w-max animate-marquee hover:[animation-play-state:paused]">
        {duplicatedStores.map((store, index) => (
          <button
            type="button"
            key={`${store.slug}-${index}`}
            onClick={() => onSelectStore(store.slug)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-orange-500/50 transition-all cursor-pointer shrink-0 group"
          >
            <div
              className={`w-6 h-6 rounded-md ${store.logoBg} text-white flex items-center justify-center font-bold text-[10px] tracking-wider shadow-xs group-hover:scale-105 transition-transform overflow-hidden`}
            >
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-0.5 bg-white"
                />
              ) : (
                store.logoText.slice(0, 3)
              )}
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-[#FF6600] transition-colors whitespace-nowrap">
              {store.name}
            </span>
            <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded font-mono tabular-nums">
              {store.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
