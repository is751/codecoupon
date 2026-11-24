import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  ExternalLink, 
  ThumbsUp, 
  ThumbsDown, 
  ShieldCheck, 
  Info,
  Sparkles,
  Star,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { Coupon } from '../types/coupon';
import { CountdownTimer } from './CountdownTimer';
import { getExpiryInfo } from '../utils/expiry';

interface CouponCardProps {
  coupon: Coupon;
  onCopyCode: (coupon: Coupon) => void;
  onOpenDetails: (coupon: Coupon) => void;
  onVote: (couponId: string, type: 'up' | 'down') => void;
  onOpenReviewModal?: (coupon: Coupon) => void;
  onSelectStore?: (storeSlug: string) => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onCopyCode,
  onOpenDetails,
  onVote,
  onOpenReviewModal,
  onSelectStore,
}) => {
  const [justCopied, setJustCopied] = useState(false);
  const expiryInfo = getExpiryInfo(coupon.expiryDate);

  const targetBrandUrl = (() => {
    const raw = coupon.storeUrl?.trim();
    if (raw && raw !== '#') {
      if (/^https?:\/\//i.test(raw)) {
        return raw;
      }
      return `https://${raw}`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(coupon.store + ' official store')}`;
  })();

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Allow the native anchor href navigation to targetBrandUrl in target="_blank"
    onCopyCode(coupon);
    setJustCopied(true);
    setTimeout(() => {
      setJustCopied(false);
    }, 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-orange-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-stretch overflow-hidden group">
      
      {/* Left Column: Discount Callout & Store Monogram */}
      <div className="w-full md:w-52 bg-slate-50/70 p-5 flex flex-row md:flex-col items-center justify-between md:justify-center text-center border-b md:border-b-0 md:border-r border-slate-200/80 shrink-0 gap-3">
        {/* Store Monogram */}
        <div className="flex items-center gap-3 md:flex-col">
          <button
            onClick={() => onSelectStore && onSelectStore(coupon.storeSlug)}
            className={`w-12 h-12 rounded-xl ${coupon.storeLogoBg} text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs hover:scale-105 transition-transform cursor-pointer overflow-hidden`}
          >
            {(coupon.logoUrl || coupon.storeLogoUrl) ? (
              <img src={coupon.logoUrl || coupon.storeLogoUrl} alt={coupon.store} referrerPolicy="no-referrer" className="w-full h-full object-contain p-1 bg-white" />
            ) : (
              coupon.storeLogoText.slice(0, 4)
            )}
          </button>
          <div className="text-left md:text-center">
            <button
              onClick={() => onSelectStore && onSelectStore(coupon.storeSlug)}
              className="font-extrabold text-sm text-slate-900 block hover:text-orange-600 transition-colors cursor-pointer"
            >
              {coupon.store}
            </button>
            <div className="flex items-center gap-1.5 justify-start md:justify-center text-[11px] text-slate-500">
              <span>{coupon.category}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <a
                href={targetBrandUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                title={`Visit ${coupon.store} official website`}
              >
                <span>Visit</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Big Discount Value */}
        <div className="md:mt-2 text-right md:text-center">
          <div className="text-xl md:text-2xl font-black text-orange-600 tracking-tight font-heading">
            {coupon.discountBadge}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {coupon.isDeal ? 'Direct Sale' : 'Coupon Code'}
          </div>
        </div>
      </div>

      {/* Middle Column: Offer Info & Countdown */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Clean Unboxed Text with Separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
            {coupon.exclusive && (
              <>
                <span className="text-orange-600 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Exclusive
                </span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {coupon.verifiedText}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{coupon.successRate}% Success</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{coupon.usesCount.toLocaleString()} uses</span>
          </div>

          {/* Deal Title */}
          <h3 
            onClick={() => onOpenDetails(coupon)}
            className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors cursor-pointer leading-snug font-heading mb-1.5"
          >
            {coupon.title}
          </h3>

          {/* Deal Description */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-2 leading-relaxed">
            {coupon.description}
          </p>

          {/* Tags Pills Row */}
          {coupon.tags && coupon.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {coupon.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-0.5 rounded-full border border-slate-200/80 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Expiry Date & Days Remaining Row (only shown if expiryDate is set) */}
          {expiryInfo && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                  expiryInfo.isExpired
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : expiryInfo.isUrgent
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200/80'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{expiryInfo.label}</span>
                <span aria-hidden="true" className="opacity-40">·</span>
                <span className="font-normal text-[11px] opacity-85">
                  {expiryInfo.isExpired ? `Ended ${expiryInfo.formattedDate}` : `Expires ${expiryInfo.formattedDate}`}
                </span>
              </div>
              {!expiryInfo.isExpired && (
                <CountdownTimer
                  expiryDateStr={coupon.expiryDate}
                  hoursLeftFallback={coupon.expiryHoursLeft || 24}
                  compact={true}
                />
              )}
            </div>
          )}

          {/* Minimum Spend or Requirements */}
          {coupon.minSpend && (
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{coupon.minSpend}</span>
            </div>
          )}
        </div>

        {/* Footer info: Expiry date, Reviews Rating, & community feedback */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          
          {/* Rating & Reviews Trigger */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{coupon.averageRating.toFixed(1)}</span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => onOpenReviewModal && onOpenReviewModal(coupon)}
              className="text-xs text-slate-600 hover:text-orange-600 font-medium underline underline-offset-4 cursor-pointer flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3 text-slate-400" />
              <span>{coupon.reviews?.length || 0} reviews</span>
            </button>
          </div>

          {/* Helpful Feedback Votes */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Worked?</span>
            <button
              onClick={() => onVote(coupon.id, 'up')}
              className={`p-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                coupon.userVote === 'up'
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-50'
              }`}
              title="Yes, this code worked"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono tabular-nums">{coupon.upvotes}</span>
            </button>
            <button
              onClick={() => onVote(coupon.id, 'down')}
              className={`p-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                coupon.userVote === 'down'
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-slate-50'
              }`}
              title="No, this code did not work"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono tabular-nums">{coupon.downvotes}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: CTA Buttons & Code Box */}
      <div className="w-full md:w-60 p-5 bg-slate-50/50 flex flex-col justify-center gap-2.5 border-t md:border-t-0 md:border-l border-slate-200/80 shrink-0">
        
        {/* Main CTA */}
        {coupon.isDeal ? (
          <a
            href={targetBrandUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              onCopyCode(coupon);
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <span>Activate Deal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <div className="relative">
            {/* Show & Copy Code Anchor that opens brand URL and copies code simultaneously */}
            <a
              href={targetBrandUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCopyClick}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] border cursor-pointer ${
                justCopied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-orange-500 shadow-sm'
              }`}
              title={`Click to copy code "${coupon.code}" and visit ${coupon.store}`}
            >
              {justCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>COPIED & OPENED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Show & Copy Code</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-90" />
                </>
              )}
            </a>

            {/* Revealed Code Preview Box */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onCopyCode(coupon);
                setJustCopied(true);
                setTimeout(() => setJustCopied(false), 2500);
              }}
              className="mt-1.5 px-2 py-1.5 bg-white hover:bg-orange-50/50 rounded-lg text-center border border-dashed border-slate-300 hover:border-orange-400 transition-colors cursor-pointer group/code flex items-center justify-center gap-1.5"
              title="Click to copy full code"
            >
              <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                {justCopied ? (coupon.code || 'CODE APPLIED') : (coupon.code ? `${coupon.code.slice(0, 4)}••••` : 'VIEW CODE')}
              </span>
              <Copy className="w-3 h-3 text-slate-400 group-hover/code:text-orange-500" />
            </div>

            {/* Direct Link to Brand Official Store */}
            <a
              href={targetBrandUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-1.5 text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center justify-center gap-1 transition-colors"
              title={`Directly open ${coupon.store} official website`}
            >
              <span>Visit {coupon.store} Store</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Secondary Action: Terms & Details */}
        <div className="text-center pt-1">
          <button
            onClick={() => onOpenDetails(coupon)}
            className="text-xs text-slate-600 hover:text-orange-600 font-medium underline underline-offset-4 cursor-pointer"
          >
            Terms & Details
          </button>
        </div>

      </div>

    </div>
  );
};
