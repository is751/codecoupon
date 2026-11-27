import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Globe,
  ArrowRight,
  Tag,
} from 'lucide-react';
import { Coupon, StoreInfo } from '../types/coupon';
import { getEffectiveExpiryDisplay, isCouponExpired } from '../utils/expiry';
import { formatCountriesBadge } from '../utils/countries';
import { resolveMerchantUrl } from '../utils/url';

interface BrandHeroSliderProps {
  onSelectStore: (storeSlug: string) => void;
  onCopyCode: (coupon: Coupon) => void;
  coupons: Coupon[];
  stores?: Record<string, StoreInfo>;
}

export const BrandHeroSlider: React.FC<BrandHeroSliderProps> = ({
  onSelectStore,
  onCopyCode,
  coupons,
  stores,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const slides = useMemo(() => {
    const active = coupons.filter(
      (c) => c.verified && !isCouponExpired(c.expiryDate, c.isExpired)
    );
    const prioritized = [...active].sort((a, b) => {
      const aScore = (a.featured ? 2 : 0) + (a.exclusive ? 1 : 0);
      const bScore = (b.featured ? 2 : 0) + (b.exclusive ? 1 : 0);
      return bScore - aScore || b.discountValueNum - a.discountValueNum;
    });

    // Prefer distinct stores for variety in hero spotlight
    const seenStores = new Set<string>();
    const uniqueByStore: Coupon[] = [];
    for (const c of prioritized) {
      const key = c.storeSlug.toLowerCase();
      if (!seenStores.has(key)) {
        seenStores.add(key);
        uniqueByStore.push(c);
      }
      if (uniqueByStore.length >= 6) break;
    }

    return uniqueByStore.length > 0 ? uniqueByStore : prioritized.slice(0, 6);
  }, [coupons]);

  useEffect(() => {
    if (currentIndex >= slides.length && slides.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, slides.length]);

  // Auto-slide every 4 seconds when more than 1 slide
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative w-full max-w-lg min-h-[300px] sm:min-h-[340px] rounded-2xl overflow-hidden border border-orange-500/30 shadow-2xl bg-gradient-to-tr from-slate-950 via-[#131926] to-[#1E1A18] p-6 flex flex-col items-center justify-center text-center space-y-3">
        <Tag className="w-8 h-8 text-[#FF6600]" />
        <h3 className="text-base font-extrabold text-white font-heading">
          Browse International Store Offers
        </h3>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Switch regions above or view all partner stores to discover active offers.
        </p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex] || slides[0];
  const matchedStoreInfo = stores?.[currentSlide.storeSlug.toLowerCase()];
  const slideLogoUrl =
    currentSlide.logoUrl || currentSlide.storeLogoUrl || matchedStoreInfo?.logoUrl;
  const expiryDisplay = getEffectiveExpiryDisplay(
    currentSlide.expiryDate,
    currentSlide.isExpired
  );
  const countryLabel = formatCountriesBadge(
    currentSlide.countries || matchedStoreInfo?.countries
  );
  const destinationUrl = resolveMerchantUrl(
    currentSlide.storeUrl,
    matchedStoreInfo?.website,
    currentSlide.storeSlug
  );

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyCode(currentSlide);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2200);
  };

  return (
    <div
      className="relative w-full max-w-lg min-h-[310px] sm:min-h-[340px] rounded-2xl overflow-hidden border border-orange-500/30 shadow-2xl bg-gradient-to-tr from-slate-950 via-[#131926] to-[#1E1A18] p-3.5 sm:p-4 flex flex-col justify-between group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-radial from-orange-500/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Slide Card */}
      <div
        key={currentSlide.id}
        className="relative z-10 w-full flex-1 flex flex-col justify-between p-4 sm:p-6 border-2 border-dashed border-[#FF6600]/60 rounded-xl bg-slate-900/85 backdrop-blur-md shadow-2xl shadow-orange-500/10 transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* Top Slide Meta */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl ${
                slideLogoUrl ? 'bg-white' : currentSlide.storeLogoBg
              } text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm shrink-0 overflow-hidden`}
            >
              {slideLogoUrl ? (
                <img
                  src={slideLogoUrl}
                  alt={currentSlide.store}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                currentSlide.storeLogoText.slice(0, 4)
              )}
            </div>
            <div className="min-w-0">
              <span className="text-sm font-extrabold text-white block font-heading truncate">
                {currentSlide.store}
              </span>
              <span className="text-[11px] text-orange-400 font-semibold block uppercase tracking-wider truncate">
                {currentSlide.category}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectStore(currentSlide.storeSlug)}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold underline underline-offset-4 cursor-pointer shrink-0"
          >
            <span>Store Page</span>
            <ArrowRight className="w-3 h-3 text-[#FF6600]" />
          </button>
        </div>

        {/* Center Content */}
        <div className="text-center my-auto py-3 space-y-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#FF6600] font-heading tracking-tight">
            {currentSlide.discountBadge}
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug max-w-sm mx-auto">
            {currentSlide.title}
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-800/90 border border-slate-700 rounded-full text-slate-200 font-medium">
              <Globe className="w-3 h-3 text-[#FF6600]" />
              <span>{countryLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-500/15 border border-orange-500/30 rounded-full text-orange-300 font-semibold">
              <Calendar className="w-3 h-3 text-[#FF6600]" />
              <span>{expiryDisplay.detailText}</span>
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2.5 pt-2">
          {!currentSlide.isDeal && currentSlide.code ? (
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
              <div className="flex-1 py-2 px-3 bg-slate-950/80 rounded-xl border border-dashed border-slate-700 text-center font-mono font-bold text-xs text-slate-200 tracking-wider">
                {justCopied ? currentSlide.code : `${currentSlide.code.slice(0, 4)}••••`}
              </div>
              <a
                href={destinationUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={handleCopy}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98] ${
                  justCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white'
                }`}
                title={`Copy code and visit ${currentSlide.store}`}
              >
                {justCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{justCopied ? 'COPIED!' : 'GET CODE'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <a
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleCopy}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>ACTIVATE OFFER</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Dots & Slider Controls */}
          {slides.length > 1 && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Previous offer"
                aria-label="Previous offer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {slides.map((slide, idx) => (
                  <button
                    type="button"
                    key={slide.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentIndex === idx
                        ? 'w-6 bg-[#FF6600]'
                        : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Next offer"
                aria-label="Next offer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
