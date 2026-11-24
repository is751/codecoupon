import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Info, 
  Store as StoreIcon,
  Tag as TagIcon,
  ShoppingBag,
  HelpCircle,
  Share2,
  Calendar
} from 'lucide-react';
import { Coupon, StoreInfo } from '../types/coupon';
import { CountdownTimer } from './CountdownTimer';
import { getExpiryInfo } from '../utils/expiry';

interface CouponDetailPageProps {
  coupon: Coupon;
  store?: StoreInfo;
  allCoupons: Coupon[];
  onBack: () => void;
  onSelectCoupon: (coupon: Coupon) => void;
  onSelectStore: (storeSlug: string) => void;
  onCopyCode: (coupon: Coupon) => void;
  onVote: (couponId: string, type: 'up' | 'down') => void;
  onOpenReviewModal: (coupon: Coupon) => void;
}

export const CouponDetailPage: React.FC<CouponDetailPageProps> = ({
  coupon,
  store,
  allCoupons,
  onBack,
  onSelectCoupon,
  onSelectStore,
  onCopyCode,
  onVote,
  onOpenReviewModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const expiryInfo = getExpiryInfo(coupon.expiryDate);

  const targetBrandUrl = (() => {
    const raw = coupon.storeUrl?.trim() || store?.website?.trim();
    if (raw && raw !== '#') {
      if (/^https?:\/\//i.test(raw)) {
        return raw;
      }
      return `https://${raw}`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(coupon.store + ' official store')}`;
  })();

  const handleCopy = () => {
    onCopyCode(coupon);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  // Other coupons from this same store
  const moreStoreCoupons = allCoupons
    .filter((c) => c.storeSlug.toLowerCase() === coupon.storeSlug.toLowerCase() && c.id !== coupon.id)
    .slice(0, 3);

  // Related coupons in same category
  const relatedCategoryCoupons = allCoupons
    .filter((c) => c.category === coupon.category && c.id !== coupon.id && c.storeSlug.toLowerCase() !== coupon.storeSlug.toLowerCase())
    .slice(0, 3);

  const logoBg = store?.logoBg || coupon.storeLogoBg || 'bg-[#FF6600]';
  const logoUrl = coupon.logoUrl || coupon.storeLogoUrl || store?.logoUrl;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Breadcrumbs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-[#FF6600] transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <button
            onClick={onBack}
            className="hover:text-slate-900 cursor-pointer"
          >
            Coupons
          </button>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <button
            onClick={() => onSelectStore(coupon.storeSlug)}
            className="hover:text-[#FF6600] font-medium cursor-pointer"
          >
            {coupon.store}
          </button>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
            {coupon.title}
          </span>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#FF6600] font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
        >
          {shareCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Deal</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Main Coupon Spotlight Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Top Store Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Store Logo with click to store */}
            <button
              onClick={() => onSelectStore(coupon.storeSlug)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${logoBg} text-white flex items-center justify-center font-bold text-xl tracking-wider shadow-md overflow-hidden shrink-0 cursor-pointer hover:scale-105 transition-transform border border-white/10`}
              title={`View all ${coupon.store} deals`}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={coupon.store}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-1.5 bg-white"
                />
              ) : (
                coupon.storeLogoText.slice(0, 4)
              )}
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onSelectStore(coupon.storeSlug)}
                  className="text-xl sm:text-2xl font-black font-heading text-white hover:text-[#FF6600] transition-colors cursor-pointer text-left"
                >
                  {coupon.store}
                </button>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Store
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Category: <span className="text-white font-medium">{coupon.category}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <a
              href={targetBrandUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Visit Official Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Coupon Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Discount Badge & Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/80 font-black text-xl sm:text-2xl font-heading tracking-tight">
                {coupon.discountBadge}
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {coupon.isDeal ? 'Direct Online Deal' : 'Verified Coupon Code'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {coupon.exclusive ? 'Exclusive promo unlocked' : 'Valid sitewide & select items'}
                </span>
              </div>
            </div>

            {/* Success & Uses Stats */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{coupon.successRate}% Success</span>
              </div>
              <span aria-hidden="true" className="text-slate-200">|</span>
              <span className="font-mono tabular-nums">{coupon.usesCount.toLocaleString()} uses</span>
            </div>
          </div>

          {/* Deal Title */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-heading leading-tight mb-2">
              {coupon.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {coupon.description}
            </p>
          </div>

          {/* Pill-shaped Tags */}
          {coupon.tags && coupon.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <TagIcon className="w-3.5 h-3.5" />
                Tags:
              </span>
              {coupon.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full border border-slate-200/80 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Code Reveal & Copy Hero Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50/70 via-slate-50 to-orange-50/40 border-2 border-dashed border-orange-300 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {coupon.isDeal ? 'Deal Activation Link' : 'Promotional Code'}
                </span>
                <span className="text-xs text-slate-500 block">
                  {coupon.isDeal 
                    ? 'No code needed. Click the button to activate discounted prices.' 
                    : 'Copy this code and paste it in the promo/voucher box at checkout.'}
                </span>
              </div>

              {/* Code Display + Copy CTA */}
              {coupon.isDeal ? (
                <a
                  href={targetBrandUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCopy}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>Activate Deal Now</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div 
                    onClick={handleCopy}
                    className="px-5 py-3 bg-white hover:bg-orange-50/50 rounded-xl border border-slate-300 hover:border-orange-400 font-mono text-base font-black tracking-widest text-slate-900 shadow-2xs select-all text-center w-full sm:w-auto cursor-pointer transition-colors"
                    title="Click to copy code"
                  >
                    {coupon.code}
                  </div>
                  <a
                    href={targetBrandUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleCopy}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                    }`}
                    title={`Copy code "${coupon.code}" and visit ${coupon.store}`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Code Copied & Store Opened!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Code & Visit Store</span>
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </a>
                </div>
              )}
            </div>

            {/* Expiry Countdown & Days Remaining in Banner */}
            {(expiryInfo || coupon.minSpend) && (
              <div className="pt-3 border-t border-orange-200/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                {expiryInfo && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
                    <span className="font-semibold text-slate-800">Offer Expiration:</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                        expiryInfo.isExpired
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : expiryInfo.isUrgent
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {expiryInfo.label}
                    </span>
                    <span className="text-slate-500">({expiryInfo.formattedDate})</span>
                    {!expiryInfo.isExpired && (
                      <CountdownTimer
                        expiryDateStr={coupon.expiryDate}
                        hoursLeftFallback={coupon.expiryHoursLeft || 24}
                        compact={true}
                      />
                    )}
                  </div>
                )}

                {coupon.minSpend && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>{coupon.minSpend}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Helpful Feedback / Worked for you? */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800">Did this coupon work for you?</span>
              <span className="text-slate-500">Your feedback helps verify codes for everyone.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onVote(coupon.id, 'up')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                  coupon.userVote === 'up'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Yes, It Worked ({coupon.upvotes})</span>
              </button>

              <button
                onClick={() => onVote(coupon.id, 'down')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                  coupon.userVote === 'down'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>No ({coupon.downvotes})</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Two Columns: Terms & How-To Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Terms & Conditions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-2">
            <Info className="w-4 h-4 text-orange-500" />
            <span>Terms & Conditions</span>
          </h3>
          <ul className="text-xs text-slate-600 space-y-2.5">
            {coupon.terms && coupon.terms.length > 0 ? (
              coupon.terms.map((term, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{term}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">Valid on qualifying purchases directly at {coupon.store}.</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
              <span className="leading-relaxed">Cannot be exchanged for cash or transferred to another account.</span>
            </li>
          </ul>
        </div>

        {/* Right: How to use this coupon */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-orange-500" />
            <span>How to Redeem at {coupon.store}</span>
          </h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <div>
                <strong className="text-slate-800 block">Copy the Code:</strong>
                <span>Click the "Copy Code" button above to save the promo to your clipboard.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <div>
                <strong className="text-slate-800 block">Shop at {coupon.store}:</strong>
                <span>Add your favorite items to your shopping cart on the retailer website.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <div>
                <strong className="text-slate-800 block">Paste at Checkout:</strong>
                <span>Paste the code into the "Promo Code", "Coupon", or "Voucher" box before completing payment.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Shopper Reviews & Ratings Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Shopper Reviews & Community Ratings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real feedback from shoppers who redeemed this code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/70">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{coupon.averageRating.toFixed(1)} / 5.0</span>
            </div>

            <button
              onClick={() => onOpenReviewModal(coupon)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              Write Review
            </button>
          </div>
        </div>

        {/* Reviews List */}
        {coupon.reviews && coupon.reviews.length > 0 ? (
          <div className="space-y-3">
            {coupon.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.author}</span>
                    <span className="text-slate-400">·</span>
                    <div className="flex items-center text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-slate-400 text-[11px]">{rev.date}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "{rev.comment}"
                </p>
                {rev.savingsAmount && (
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Saved {rev.savingsAmount}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
            No reviews submitted yet for this offer. Be the first to verify and help fellow shoppers!
          </div>
        )}
      </div>

      {/* 5. More Coupons from this Store */}
      {moreStoreCoupons.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              More Deals from {coupon.store}
            </h3>
            <button
              onClick={() => onSelectStore(coupon.storeSlug)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              View All {coupon.store} Offers &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {moreStoreCoupons.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCoupon(c)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-orange-400 p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-orange-600 text-sm">
                      {c.discountBadge}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {c.successRate}% Success
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {c.title}
                  </h4>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                  <span className="text-slate-400 text-[11px] font-mono">
                    {c.code || 'Instant Deal'}
                  </span>
                  <span className="font-bold text-orange-600 text-[11px] group-hover:underline">
                    View Deal &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Related Category Deals */}
      {relatedCategoryCoupons.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Trending Deals in {coupon.category}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedCategoryCoupons.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCoupon(c)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-orange-400 p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      {c.store}
                    </span>
                    <span className="font-mono font-black text-orange-600 text-xs">
                      {c.discountBadge}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {c.title}
                  </h4>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                  <span className="text-slate-400 text-[11px] font-mono">
                    {c.code || 'Instant Deal'}
                  </span>
                  <span className="font-bold text-orange-600 text-[11px] group-hover:underline">
                    View Coupon &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
