import React, { useRef } from 'react';
import { Search, X, ShieldCheck, Zap, Tag, Heart } from 'lucide-react';
import { Coupon, StoreInfo } from '../types/coupon';
import { BrandHeroSlider } from './BrandHeroSlider';
import { BrandMarquee } from './BrandMarquee';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit?: () => void;
  onSelectStore: (storeSlug: string) => void;
  onCopyCode: (coupon: Coupon) => void;
  coupons: Coupon[];
  stores?: Record<string, StoreInfo>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onSelectStore,
  onCopyCode,
  coupons,
  stores,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit();
  };

  return (
    <section className="bg-[#0B0F17] text-white relative overflow-hidden border-b border-slate-800">
      {/* Background glow effects */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines, Search & Trust Badges */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Orange Tagline */}
            <div className="inline-block">
              <span className="text-xs md:text-sm font-black tracking-widest text-[#FF6600] uppercase font-heading">
                SAVE MORE. SHOP SMART.
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-heading">
              Best Coupons & Deals <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] via-orange-400 to-amber-400">
                From Top Brands
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
              Find verified promo codes, exclusive discounts and the latest deals from your favorite stores — all in one place.
            </p>

            {/* Search Bar - Rounded Full matching Mockup */}
            <form onSubmit={handleSubmit} className="relative max-w-xl">
              <div className="relative flex items-center bg-white rounded-full shadow-xl p-1.5 focus-within:ring-2 focus-within:ring-[#FF6600] transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                <input
                  ref={inputRef}
                  id="hero-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for stores, deals, or coupon codes..."
                  className="w-full py-2.5 px-3 text-xs sm:text-sm text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 mr-2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-all active:scale-[0.98] cursor-pointer shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* 4 Trust Badges from Mockup */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF6600]" />
                <span className="font-medium">100% Verified Codes</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF6600]" />
                <span className="font-medium">Latest Deals</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#FF6600]" />
                <span className="font-medium">Exclusive Offers</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#FF6600]" />
                <span className="font-medium">Save Big</span>
              </div>
            </div>

          </div>

          {/* Right Column: Sliding Brand Banner */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <BrandHeroSlider
              onSelectStore={onSelectStore}
              onCopyCode={onCopyCode}
              coupons={coupons}
              stores={stores}
            />
          </div>

        </div>
      </div>

      {/* Sliding Brands Marquee Ticker at bottom of hero */}
      <BrandMarquee onSelectStore={onSelectStore} stores={stores} coupons={coupons} />
    </section>
  );
};
