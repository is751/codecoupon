import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Coupon, StoreInfo } from '../types/coupon';

interface BrandSlideItem {
  id: string;
  store: string;
  storeSlug: string;
  logoBg: string;
  logoText: string;
  badge: string;
  headline: string;
  subtitle: string;
  code?: string;
  isDeal: boolean;
  highlightText: string;
}

const BRAND_SLIDES: BrandSlideItem[] = [
  {
    id: 's-hostinger',
    store: 'Hostinger',
    storeSlug: 'hostinger',
    logoBg: 'bg-indigo-600',
    logoText: 'HOST',
    badge: '78% OFF SPECIAL',
    headline: 'UP TO 78% OFF',
    subtitle: 'Web hosting + free domain, SSL & 24/7 priority support.',
    code: 'CODECOUPON78',
    isDeal: false,
    highlightText: 'Hand-tested & verified today',
  },
  {
    id: 's-amazon',
    store: 'Amazon',
    storeSlug: 'amazon',
    logoBg: 'bg-amber-500',
    logoText: 'AMZN',
    badge: 'PRIME EXCLUSIVE',
    headline: 'UP TO 50% OFF',
    subtitle: 'Smart home devices, headphones, and daily tech essentials.',
    code: 'SAVE20',
    isDeal: false,
    highlightText: 'Top-rated daily tech promo',
  },
  {
    id: 's-nike',
    store: 'Nike',
    storeSlug: 'nike',
    logoBg: 'bg-zinc-950',
    logoText: 'NIKE',
    badge: 'SEASONAL SALE',
    headline: 'EXTRA 25% OFF',
    subtitle: 'Running sneakers, fleece sportswear & gym accessories.',
    code: 'FALLRUN25',
    isDeal: false,
    highlightText: 'Free member delivery included',
  },
  {
    id: 's-bestbuy',
    store: 'Best Buy',
    storeSlug: 'bestbuy',
    logoBg: 'bg-yellow-400',
    logoText: 'BEST',
    badge: 'TECH DOORBUSTER',
    headline: 'SAVE UP TO 50%',
    subtitle: '4K OLED displays, gaming laptops, and audio gear.',
    code: '',
    isDeal: true,
    highlightText: 'Instant doorbuster markdowns',
  },
  {
    id: 's-walmart',
    store: 'Walmart',
    storeSlug: 'walmart',
    logoBg: 'bg-blue-600',
    logoText: 'WMT',
    badge: 'ROLLBACK DEALS',
    headline: 'FLAT $10 OFF',
    subtitle: 'Save on groceries, kitchen appliances, and household items.',
    code: 'SAVE10',
    isDeal: false,
    highlightText: 'Orders $50+ with same-day pickup',
  },
  {
    id: 's-target',
    store: 'Target',
    storeSlug: 'target',
    logoBg: 'bg-red-600',
    logoText: 'TGT',
    badge: 'CIRCLE BONUS',
    headline: '20% OFF SITEWIDE',
    subtitle: 'Home decor, apparel styles, and clean beauty essentials.',
    code: 'CIRCLE20',
    isDeal: false,
    highlightText: '5% extra discount with Circle Card',
  },
];

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

  // Auto-slide effect every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BRAND_SLIDES.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const currentSlide = BRAND_SLIDES[currentIndex];
  const matchedStoreInfo = stores?.[currentSlide.storeSlug.toLowerCase()];
  const matchedCouponWithLogo = coupons.find(
    (c) => c.storeSlug.toLowerCase() === currentSlide.storeSlug.toLowerCase() && (c.logoUrl || c.storeLogoUrl)
  );
  const slideLogoUrl = matchedStoreInfo?.logoUrl || matchedCouponWithLogo?.logoUrl || matchedCouponWithLogo?.storeLogoUrl;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? BRAND_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % BRAND_SLIDES.length);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const matchingCoupon = coupons.find(
      (c) => c.storeSlug.toLowerCase() === currentSlide.storeSlug.toLowerCase()
    );

    if (matchingCoupon) {
      onCopyCode(matchingCoupon);
    } else if (currentSlide.code) {
      navigator.clipboard?.writeText(currentSlide.code);
    }

    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2200);
  };

  return (
    <div 
      className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden border border-orange-500/30 shadow-2xl bg-gradient-to-tr from-slate-950 via-[#131926] to-[#1E1A18] p-4 flex flex-col justify-between group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-radial from-orange-500/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Slide Card */}
      <div 
        key={currentSlide.id}
        className="relative z-10 w-full h-full flex flex-col justify-between p-5 sm:p-6 border-2 border-dashed border-[#FF6600]/60 rounded-xl bg-slate-900/85 backdrop-blur-md shadow-2xl shadow-orange-500/10 transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* Top Slide Meta: Store Monogram, Badge, & Quick Action */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div 
              className={`w-10 h-10 rounded-xl ${slideLogoUrl ? 'bg-white' : currentSlide.logoBg} text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm shrink-0 overflow-hidden`}
            >
              {slideLogoUrl ? (
                <img
                  src={slideLogoUrl}
                  alt={currentSlide.store}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                currentSlide.logoText
              )}
            </div>
            <div>
              <span className="text-sm font-extrabold text-white block font-heading">
                {currentSlide.store}
              </span>
              <span className="text-[11px] text-orange-400 font-semibold block uppercase tracking-wider">
                {currentSlide.badge}
              </span>
            </div>
          </div>

          <button
            onClick={() => onSelectStore(currentSlide.storeSlug)}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold underline underline-offset-4 cursor-pointer"
          >
            <span>Store Page</span>
            <ArrowRight className="w-3 h-3 text-[#FF6600]" />
          </button>
        </div>

        {/* Center Content: Headline & Subtitle */}
        <div className="text-center my-auto py-2">
          <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-orange-200 font-heading tracking-tight">
            SAVE MORE AT {currentSlide.store.toUpperCase()}
          </div>
          
          <div className="text-3xl sm:text-4xl font-extrabold text-[#FF6600] font-heading mt-1 tracking-tight">
            {currentSlide.headline}
          </div>

          <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto line-clamp-2 leading-relaxed">
            {currentSlide.subtitle}
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-0.5 bg-orange-500/15 border border-orange-500/30 rounded-full text-[11px] font-semibold text-orange-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF6600]" />
            <span>{currentSlide.highlightText}</span>
          </div>
        </div>

        {/* Bottom Actions: Code Copy Button + View Deals */}
        <div className="space-y-2 pt-2">
          {currentSlide.code ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 py-2 px-3 bg-slate-950/80 rounded-xl border border-dashed border-slate-700 text-center font-mono font-bold text-xs text-slate-200 tracking-wider">
                {justCopied ? currentSlide.code : `${currentSlide.code.slice(0, 4)}••••`}
              </div>
              <a
                href={(() => {
                  const matchingCoupon = coupons.find(
                    (c) => c.storeSlug.toLowerCase() === currentSlide.storeSlug.toLowerCase()
                  );
                  const raw = matchingCoupon?.storeUrl || matchedStoreInfo?.website || `https://www.${currentSlide.storeSlug}.com`;
                  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCopy}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98] ${
                  justCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white'
                }`}
                title={`Copy code and visit ${currentSlide.store}`}
              >
                {justCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{justCopied ? 'COPIED & OPENED!' : 'GET CODE'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <a
              href={(() => {
                const raw = matchedStoreInfo?.website || `https://www.${currentSlide.storeSlug}.com`;
                return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>CLAIM STORE DEAL</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Dots Indicator & Slider Controls */}
          <div className="flex items-center justify-between pt-1">
            {/* Prev Arrow */}
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Previous brand offer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {BRAND_SLIDES.map((slide, idx) => (
                <button
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

            {/* Next Arrow */}
            <button
              onClick={handleNext}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Next brand offer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
