import React, { useState } from 'react';
import { Store, Search, ArrowRight, Globe, Tag } from 'lucide-react';
import { Category, Coupon, StoreInfo } from '../types/coupon';
import {
  COUNTRIES,
  CountryFilter,
  formatCountriesBadge,
  matchesCountryFilter,
} from '../utils/countries';
import { isCouponExpired } from '../utils/expiry';

interface StoresDirectoryPageProps {
  stores: Record<string, StoreInfo>;
  coupons?: Coupon[];
  selectedCountry?: CountryFilter;
  onSelectCountry?: (country: CountryFilter) => void;
  onSelectStore: (slug: string) => void;
  onBackToHome: () => void;
}

const CATEGORIES: (Category | 'All')[] = [
  'All',
  'Tech & Electronics',
  'Fashion & Apparel',
  'Food & Dining',
  'Hosting & Software',
  'Travel & Flights',
  'Beauty & Wellness',
  'Home & Lifestyle',
  'Entertainment & Gaming',
  'Sports',
  'Toys & Games',
];

export const StoresDirectoryPage: React.FC<StoresDirectoryPageProps> = ({
  stores,
  coupons = [],
  selectedCountry: externalCountry,
  onSelectCountry,
  onSelectStore,
  onBackToHome,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [localCountry, setLocalCountry] = useState<CountryFilter>('ALL');

  const activeCountry = externalCountry ?? localCountry;
  const setCountry = (val: CountryFilter) => {
    setLocalCountry(val);
    if (onSelectCountry) onSelectCountry(val);
  };

  const storeList = Object.values(stores);

  const getActiveOfferCount = (storeSlug: string): number => {
    const cleanTarget = storeSlug.toLowerCase().trim();
    return coupons.filter(
      (c) =>
        c.verified &&
        !isCouponExpired(c.expiryDate, c.isExpired) &&
        c.storeSlug.toLowerCase().trim() === cleanTarget
    ).length;
  };

  const filteredStores = storeList.filter((s) => {
    if (selectedCat !== 'All' && s.category !== selectedCat) return false;
    if (!matchesCountryFilter(s.countries, activeCountry)) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-md">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-[#FF6600] text-xs font-bold">
            <Store className="w-3.5 h-3.5" />
            <span>Store Directory &amp; Merchant Partners</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
            All Partner Stores
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Browse participating retailers and international brands. Select any store to inspect current promo codes, expiration dates, regional availability, and offer terms.
          </p>
        </div>

        {/* Search, Category & Country Filter */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search store name, category, or brand..."
              className="w-full pl-10 pr-4 py-3 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              aria-label="Filter stores by category"
              className="bg-[#121824] border border-slate-700/80 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF6600] cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#121824] text-white">
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <select
              value={activeCountry}
              onChange={(e) => setCountry(e.target.value as CountryFilter)}
              aria-label="Filter stores by country"
              className="bg-[#121824] border border-slate-700/80 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF6600] cursor-pointer"
            >
              <option value="ALL" className="bg-[#121824] text-white">
                All Countries / Regions
              </option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code} className="bg-[#121824] text-white">
                  {country.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredStores.length}</strong> stores
          </span>
          <button
            type="button"
            onClick={onBackToHome}
            className="text-orange-600 hover:underline font-semibold cursor-pointer"
          >
            &larr; Back to Home Deals
          </button>
        </div>

        {filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStores.map((s) => {
              const offerCount = getActiveOfferCount(s.slug);
              return (
                <div
                  key={s.slug}
                  onClick={() => onSelectStore(s.slug)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-orange-400 p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-14 h-14 rounded-2xl ${s.logoBg} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs overflow-hidden group-hover:scale-105 transition-transform`}
                        >
                          {s.logoUrl ? (
                            <img
                              src={s.logoUrl}
                              alt={s.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain p-1.5 bg-white"
                            />
                          ) : (
                            s.logoText.slice(0, 4)
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-sm text-slate-900 truncate group-hover:text-orange-600 transition-colors font-heading">
                            {s.name}
                          </h3>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {s.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>{formatCountriesBadge(s.countries)}</span>
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200/80 shrink-0 font-mono">
                        {s.bestDiscount}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-4 text-xs font-semibold">
                    <span className="text-slate-500 text-[11px] inline-flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>
                        {offerCount > 0
                          ? `${offerCount} Active ${offerCount === 1 ? 'Offer' : 'Offers'}`
                          : s.cashbackRate || 'Store Offers'}
                      </span>
                    </span>
                    <span className="text-orange-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>View Store</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              No stores found matching your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCat('All');
                setCountry('ALL');
              }}
              className="text-xs font-bold text-orange-600 underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
