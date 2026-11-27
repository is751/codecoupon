import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Info,
  Sparkles,
  Calendar,
  Globe,
  FileText,
  Clock,
} from 'lucide-react';
import { Coupon } from '../types/coupon';
import { CountryCode, formatCountriesBadge } from '../utils/countries';
import { CountdownTimer } from './CountdownTimer';
import { getEffectiveExpiryDisplay, isCouponExpired } from '../utils/expiry';
import { resolveMerchantUrl } from '../utils/url';

interface CouponCardProps {
  coupon: Coupon;
  storeWebsite?: string;
  storeCountries?: CountryCode[];
  onCopyCode: (coupon: Coupon) => void;
  onOpenDetails: (coupon: Coupon) => void;
  onSelectStore?: (storeSlug: string) => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  storeWebsite,
  storeCountries,
  onCopyCode,
  onOpenDetails,
  onSelectStore,
}) => {
  const [justCopied, setJustCopied] = useState(false);
  const expired = isCouponExpired(coupon.expiryDate, coupon.isExpired);
  const expiryDisplay = getEffectiveExpiryDisplay(coupon.expiryDate, coupon.isExpired);
  const effectiveCountries =
    coupon.countries && coupon.countries.length > 0 ? coupon.countries : storeCountries;
  const countryBadge = formatCountriesBadge(effectiveCountries);

  const targetBrandUrl = resolveMerchantUrl(
    coupon.storeUrl,
    storeWebsite,
    coupon.storeSlug
  );

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (expired) {
      e.preventDefault();
      return;
    }
    onCopyCode(coupon);
    setJustCopied(true);
    setTimeout(() => {
      setJustCopied(false);
    }, 2500);
  };

  return (
    <div
      className={`bg-white rounded-2xl border shadow-xs transition-all duration-200 flex flex-col md:flex-row items-stretch overflow-hidden group ${
        expired
          ? 'border-slate-200 opacity-75'
          : 'border-slate-200/90 hover:border-orange-300 hover:shadow-md'
      }`}
    >
      {/* Left Column: Discount Callout & Store Monogram */}
      <div className="w-full md:w-52 bg-slate-50/70 p-4 sm:p-5 flex flex-row md:flex-col items-center justify-between md:justify-center text-center border-b md:border-b-0 md:border-r border-slate-200/80 shrink-0 gap-3">
        {/* Store Monogram */}
        <div className="flex items-center gap-3 md:flex-col min-w-0">
          <button
            type="button"
            onClick={() => onSelectStore && onSelectStore(coupon.storeSlug)}
            className={`w-12 h-12 rounded-xl ${coupon.storeLogoBg} text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs hover:scale-105 transition-transform cursor-pointer overflow-hidden shrink-0`}
          >
            {coupon.logoUrl || coupon.storeLogoUrl ? (
              <img
                src={coupon.logoUrl || coupon.storeLogoUrl}
                alt={coupon.store}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-1 bg-white"
              />
            ) : (
              coupon.storeLogoText.slice(0, 4)
            )}
          </button>
          <div className="text-left md:text-center min-w-0">
            <button
              type="button"
              onClick={() => onSelectStore && onSelectStore(coupon.storeSlug)}
              className="font-extrabold text-sm text-slate-900 block hover:text-orange-600 transition-colors cursor-pointer truncate max-w-full"
            >
              {coupon.store}
            </button>
            <div className="flex items-center gap-1.5 justify-start md:justify-center text-[11px] text-slate-500 flex-wrap">
              <span className="truncate">{coupon.category}</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <a
                href={targetBrandUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={(e) => e.stopPropagation()}
                className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-0.5 shrink-0"
                title={`Visit ${coupon.store} official website`}
              >
                <span>Visit</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Big Discount Value */}
        <div className="md:mt-2 text-right md:text-center shrink-0">
          <div className="text-xl md:text-2xl font-black text-orange-600 tracking-tight font-heading">
            {coupon.discountBadge}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {coupon.isDeal ? 'Direct Offer' : 'Promo Code'}
          </div>
        </div>
      </div>

      {/* Middle Column: Offer Info, Region & Expiry */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
        <div>
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
            {coupon.exclusive && (
              <>
                <span className="text-orange-600 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Featured
                </span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span
              className={`font-medium flex items-center gap-1 ${
                expired ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {expired ? 'Expired' : coupon.verifiedText || 'Active Offer'}
            </span>
            <span aria-hidden="true">·</span>
            <span
              className="inline-flex items-center gap-1 text-slate-600 font-medium"
              title={`Available regions: ${countryBadge}`}
            >
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{countryBadge}</span>
            </span>
          </div>

          {/* Deal Title */}
          <h3
            onClick={() => onOpenDetails(coupon)}
            className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors cursor-pointer leading-snug font-heading mb-1.5"
          >
            {coupon.title}
          </h3>

          {/* Deal Description */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-2.5 leading-relaxed">
            {coupon.description}
          </p>

          {/* Tags Row */}
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

          {/* Expiry Date & Countdown Row */}
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                expiryDisplay.isExpired
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : expiryDisplay.isUrgent
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200/80'
              }`}
            >
              {expiryDisplay.hasFixedDate ? (
                <Calendar className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{expiryDisplay.badgeText}</span>
              <span aria-hidden="true" className="opacity-40">
                ·
              </span>
              <span className="font-normal text-[11px] opacity-90">
                {expiryDisplay.detailText}
              </span>
            </div>
            {coupon.expiryDate && !expiryDisplay.isExpired && (
              <CountdownTimer
                expiryDateStr={coupon.expiryDate}
                hoursLeftFallback={coupon.expiryHoursLeft || 24}
                compact={true}
              />
            )}
          </div>
        </div>

        {/* Footer Strip: Clear Offer Terms & Minimum Spend */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
            {coupon.minSpend && (
              <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{coupon.minSpend}</span>
              </span>
            )}
            {coupon.terms && coupon.terms.length > 0 && (
              <span className="inline-flex items-center gap-1 text-slate-500 truncate max-w-md">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{coupon.terms[0]}</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenDetails(coupon)}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer shrink-0"
          >
            View Full Terms &rarr;
          </button>
        </div>
      </div>

      {/* Right Column: CTA Buttons & Code Box */}
      <div className="w-full md:w-60 p-4 sm:p-5 bg-slate-50/50 flex flex-col justify-center gap-2.5 border-t md:border-t-0 md:border-l border-slate-200/80 shrink-0">
        {expired ? (
          <div className="w-full py-2.5 px-4 bg-slate-200 text-slate-600 text-xs font-bold rounded-xl text-center">
            Offer Expired
          </div>
        ) : coupon.isDeal ? (
          <a
            href={targetBrandUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
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
              rel="noopener noreferrer sponsored"
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
                  <span>COPIED &amp; OPENED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Show &amp; Copy Code</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-90" />
                </>
              )}
            </a>

            {/* Revealed Code Preview Box */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopyCode(coupon);
                setJustCopied(true);
                setTimeout(() => setJustCopied(false), 2500);
              }}
              className="mt-1.5 w-full px-2 py-1.5 bg-white hover:bg-orange-50/50 rounded-lg text-center border border-dashed border-slate-300 hover:border-orange-400 transition-colors cursor-pointer group/code flex items-center justify-center gap-1.5"
              title="Click to copy full code"
            >
              <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                {justCopied
                  ? coupon.code || 'CODE APPLIED'
                  : coupon.code
                  ? `${coupon.code.slice(0, 4)}••••`
                  : 'VIEW CODE'}
              </span>
              <Copy className="w-3 h-3 text-slate-400 group-hover/code:text-orange-500" />
            </button>

            {/* Direct Link to Brand Official Store */}
            <a
              href={targetBrandUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
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
            type="button"
            onClick={() => onOpenDetails(coupon)}
            className="text-xs text-slate-600 hover:text-orange-600 font-medium underline underline-offset-4 cursor-pointer"
          >
            Terms &amp; Details
          </button>
        </div>
      </div>
    </div>
  );
};
