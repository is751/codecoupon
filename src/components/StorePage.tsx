import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  CheckCircle,
  ArrowUpDown,
  Globe,
} from 'lucide-react';
import { Coupon, SortOption, StoreInfo } from '../types/coupon';
import {
  COUNTRIES,
  CountryFilter,
  formatCountriesFull,
  matchesCountryFilter,
} from '../utils/countries';
import { computeHoursLeftFromDate, isCouponExpired } from '../utils/expiry';
import { resolveMerchantUrl } from '../utils/url';
import { CouponCard } from './CouponCard';

interface StorePageProps {
  store: StoreInfo;
  coupons: Coupon[];
  onBack: () => void;
  onCopyCode: (coupon: Coupon) => void;
  onOpenDetails: (coupon: Coupon) => void;
}

export const StorePage: React.FC<StorePageProps> = ({
  store,
  coupons,
  onBack,
  onCopyCode,
  onOpenDetails,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'code' | 'deal'>('all');
  const [selectedCountry, setSelectedCountry] = useState<CountryFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  useEffect(() => {
    const prevTitle = document.title;
    const metaDescEl = document.querySelector('meta[name="description"]');
    const prevDesc = metaDescEl?.getAttribute('content') || '';

    if (store.metaTitle) {
      document.title = store.metaTitle;
    }
    if (store.metaDescription && metaDescEl) {
      metaDescEl.setAttribute('content', store.metaDescription);
    }

    return () => {
      document.title = prevTitle;
      if (metaDescEl) {
        metaDescEl.setAttribute('content', prevDesc);
      }
    };
  }, [store.metaTitle, store.metaDescription]);

  const isCouponForThisStore = (c: Coupon): boolean => {
    if (!c || !store) return false;
    const cSlug = (c.storeSlug || '').toLowerCase().trim();
    const sSlug = (store.slug || '').toLowerCase().trim();
    if (cSlug && sSlug && cSlug === sSlug) return true;

    const cCleanSlug = cSlug.replace(/[^a-z0-9]/g, '');
    const sCleanSlug = sSlug.replace(/[^a-z0-9]/g, '');
    if (
      cCleanSlug &&
      sCleanSlug &&
      (cCleanSlug === sCleanSlug ||
        cCleanSlug.includes(sCleanSlug) ||
        sCleanSlug.includes(cCleanSlug))
    ) {
      return true;
    }

    const cName = (c.store || '').toLowerCase().trim();
    const sName = (store.name || '').toLowerCase().trim();
    if (
      cName &&
      sName &&
      (cName === sName || cName.includes(sName) || sName.includes(cName))
    ) {
      return true;
    }

    return false;
  };

  // Only active, non-expired offers for this store
  const activeStoreCoupons = coupons.filter(
    (c) => isCouponForThisStore(c) && c.verified && !isCouponExpired(c.expiryDate, c.isExpired)
  );

  const filteredStoreCoupons = activeStoreCoupons
    .filter((c) => {
      const effectiveCountries =
        c.countries && c.countries.length > 0 ? c.countries : store.countries;
      if (!matchesCountryFilter(effectiveCountries, selectedCountry)) return false;
      if (filterType === 'code') return !c.isDeal;
      if (filterType === 'deal') return c.isDeal;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'featured' || sortBy === 'custom') {
        const orderA = a.sortOrder ?? 9999;
        const orderB = b.sortOrder ?? 9999;
        if (orderA !== orderB) return orderA - orderB;
        const featA = (a.featured ? 2 : 0) + (a.exclusive ? 1 : 0);
        const featB = (b.featured ? 2 : 0) + (b.exclusive ? 1 : 0);
        if (featB !== featA) return featB - featA;
        return b.discountValueNum - a.discountValueNum;
      }
      if (sortBy === 'discount') {
        return b.discountValueNum - a.discountValueNum;
      }
      if (sortBy === 'newest') {
        return (b.isCommunity ? 1 : 0) - (a.isCommunity ? 1 : 0);
      }
      if (sortBy === 'expiring') {
        const aHours =
          computeHoursLeftFromDate(a.expiryDate) ??
          a.expiryHoursLeft ??
          Number.MAX_SAFE_INTEGER;
        const bHours =
          computeHoursLeftFromDate(b.expiryDate) ??
          b.expiryHoursLeft ??
          Number.MAX_SAFE_INTEGER;
        return aHours - bHours;
      }
      return 0;
    });

  const codeCount = activeStoreCoupons.filter((c) => !c.isDeal).length;
  const dealCount = activeStoreCoupons.filter((c) => c.isDeal).length;
  const storeCountriesLabel = formatCountriesFull(store.countries);
  const storeWebsiteUrl = resolveMerchantUrl(store.website, undefined, store.slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumbs & Back Button */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-orange-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Deals</span>
        </button>
        <span aria-hidden="true">/</span>
        <span>Stores</span>
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-slate-900">{store.name}</span>
      </div>

      {/* Store Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Logo & Store Identity */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${store.logoBg} text-white flex items-center justify-center font-bold text-xl md:text-2xl shadow-sm tracking-wide shrink-0 overflow-hidden`}
            >
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-2 bg-white"
                />
              ) : (
                store.logoText
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading">
                  {store.name} Promo Codes &amp; Deals
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Partner Store
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="font-medium text-slate-700">{store.category}</span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{storeCountriesLabel}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Visit Official Store CTA */}
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <a
              href={storeWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>Visit {store.name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Store Highlights Strip */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500">Active Offers</div>
            <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {activeStoreCoupons.length} Available
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500">Offer Mix</div>
            <div className="text-sm font-bold text-slate-900 mt-1">
              {codeCount} Codes · {dealCount} Deals
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500">Top Listed Discount</div>
            <div className="text-base font-bold text-orange-600 font-heading mt-0.5">
              {store.bestDiscount}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500">Cashback / Perks</div>
            <div className="text-xs font-bold text-emerald-700 mt-1 truncate">
              {store.cashbackRate || 'Direct Merchant Offers'}
            </div>
          </div>
        </div>

        {/* About Store Prose */}
        <div className="mt-5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
          <p>{store.description}</p>
        </div>
      </div>

      {/* Main Grid: Left Coupons List & Right Store Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Active Store Coupons */}
        <div className="lg:col-span-8 space-y-4">
          {/* Store Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All {store.name} Offers ({activeStoreCoupons.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('code')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'code'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Promo Codes
              </button>
              <button
                type="button"
                onClick={() => setFilterType('deal')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'deal'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Direct Deals
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value as CountryFilter)}
                  aria-label="Filter store coupons by country"
                  className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg py-1.5 pl-2.5 pr-7 focus:outline-none focus:ring-1 focus:ring-[#FF6600] cursor-pointer"
                >
                  <option value="ALL">All Countries</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Sort store coupons"
                  className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg py-1.5 pl-2.5 pr-7 focus:outline-none focus:ring-1 focus:ring-[#FF6600] cursor-pointer"
                >
                  <option value="featured">Featured Order</option>
                  <option value="discount">Highest Discount</option>
                  <option value="newest">Newly Added</option>
                  <option value="expiring">Expiring Soon</option>
                </select>
              </div>
            </div>
          </div>

          {/* Coupons List */}
          {filteredStoreCoupons.length > 0 ? (
            <div className="space-y-4">
              {filteredStoreCoupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  storeWebsite={store.website}
                  storeCountries={store.countries}
                  onCopyCode={onCopyCode}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              <p className="text-sm font-medium">No active coupons match this filter.</p>
              <button
                type="button"
                onClick={() => {
                  setFilterType('all');
                  setSelectedCountry('ALL');
                }}
                className="mt-2 text-xs font-bold text-orange-600 underline cursor-pointer"
              >
                Show all {store.name} offers
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar: Store Shopping Tips */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span>{store.name} Shopping Tips</span>
            </h3>

            <ul className="text-xs text-slate-600 space-y-2.5">
              {store.highlights.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
