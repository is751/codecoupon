import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Info,
  Tag as TagIcon,
  HelpCircle,
  Share2,
  Calendar,
  Globe,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Coupon, StoreInfo } from '../types/coupon';
import { formatCountriesFull } from '../utils/countries';
import { CountdownTimer } from './CountdownTimer';
import { getEffectiveExpiryDisplay, isCouponExpired } from '../utils/expiry';
import { resolveMerchantUrl } from '../utils/url';

interface CouponDetailPageProps {
  coupon: Coupon;
  store?: StoreInfo;
  allCoupons: Coupon[];
  onBack: () => void;
  onSelectCoupon: (coupon: Coupon) => void;
  onSelectStore: (storeSlug: string) => void;
  onCopyCode: (coupon: Coupon) => void;
}

export const CouponDetailPage: React.FC<CouponDetailPageProps> = ({
  coupon,
  store,
  allCoupons,
  onBack,
  onSelectCoupon,
  onSelectStore,
  onCopyCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const expired = isCouponExpired(coupon.expiryDate, coupon.isExpired);
  const expiryDisplay = getEffectiveExpiryDisplay(coupon.expiryDate, coupon.isExpired);
  const effectiveCountries =
    coupon.countries && coupon.countries.length > 0 ? coupon.countries : store?.countries;
  const countriesLabel = formatCountriesFull(effectiveCountries);

  const targetBrandUrl = resolveMerchantUrl(
    coupon.storeUrl,
    store?.website,
    coupon.storeSlug
  );

  const handleCopy = () => {
    if (expired) return;
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

  // Active non-expired coupons from this same store
  const moreStoreCoupons = allCoupons
    .filter(
      (c) =>
        !isCouponExpired(c.expiryDate, c.isExpired) &&
        c.storeSlug.toLowerCase() === coupon.storeSlug.toLowerCase() &&
        c.id !== coupon.id
    )
    .slice(0, 3);

  // Active non-expired coupons in same category
  const relatedCategoryCoupons = allCoupons
    .filter(
      (c) =>
        !isCouponExpired(c.expiryDate, c.isExpired) &&
        c.category === coupon.category &&
        c.id !== coupon.id &&
        c.storeSlug.toLowerCase() !== coupon.storeSlug.toLowerCase()
    )
    .slice(0, 3);

  const logoBg = store?.logoBg || coupon.storeLogoBg || 'bg-[#FF6600]';
  const logoUrl = coupon.logoUrl || coupon.storeLogoUrl || store?.logoUrl;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      {/* 1. Breadcrumbs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-[#FF6600] transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <button type="button" onClick={onBack} className="hover:text-slate-900 cursor-pointer">
            Coupons
          </button>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <button
            type="button"
            onClick={() => onSelectStore(coupon.storeSlug)}
            className="hover:text-[#FF6600] font-medium cursor-pointer"
          >
            {coupon.store}
          </button>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <span className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
            {coupon.title}
          </span>
        </div>

        <button
          type="button"
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
            <button
              type="button"
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
                  type="button"
                  onClick={() => onSelectStore(coupon.storeSlug)}
                  className="text-xl sm:text-2xl font-black font-heading text-white hover:text-[#FF6600] transition-colors cursor-pointer text-left"
                >
                  {coupon.store}
                </button>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    expired
                      ? 'text-rose-300 bg-rose-500/15 border-rose-500/30'
                      : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {expired ? 'Offer Expired' : 'Partner Store'}
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
              rel="noopener noreferrer sponsored"
              className="w-full md:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Visit Official Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Expired Alert Banner */}
        {expired && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-rose-800 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                This offer has expired ({expiryDisplay.detailText}) and is no longer active.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectStore(coupon.storeSlug)}
              className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
            >
              View Active {coupon.store} Offers &rarr;
            </button>
          </div>
        )}

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
                  {coupon.isDeal ? 'Direct Online Deal' : 'Promotional Code'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {coupon.exclusive ? 'Featured partner promotion' : 'Merchant terms apply at checkout'}
                </span>
              </div>
            </div>

            {/* Region & Offer Status */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80 font-medium">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{countriesLabel}</span>
              </span>
            </div>
          </div>

          {/* Deal Title */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-heading leading-tight mb-2">
              {coupon.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">{coupon.description}</p>
          </div>

          {/* Tags */}
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
                  {expired
                    ? 'This offer has ended and can no longer be redeemed.'
                    : coupon.isDeal
                    ? 'No code needed. Click the button to open the merchant promotion.'
                    : 'Copy this code and paste it in the promo/voucher box at checkout.'}
                </span>
              </div>

              {expired ? (
                <div className="px-6 py-3 rounded-xl bg-slate-200 text-slate-600 font-bold text-xs">
                  Offer Expired
                </div>
              ) : coupon.isDeal ? (
                <a
                  href={targetBrandUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={handleCopy}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>Activate Deal Now</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-5 py-3 bg-white hover:bg-orange-50/50 rounded-xl border border-slate-300 hover:border-orange-400 font-mono text-base font-black tracking-widest text-slate-900 shadow-2xs select-all text-center w-full sm:w-auto cursor-pointer transition-colors"
                    title="Click to copy code"
                  >
                    {coupon.code}
                  </button>
                  <a
                    href={targetBrandUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
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
                        <span>Code Copied &amp; Store Opened!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Code &amp; Visit Store</span>
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </a>
                </div>
              )}
            </div>

            {/* Expiry Countdown & Minimum Spend Banner */}
            <div className="pt-3 border-t border-orange-200/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-2">
                {expiryDisplay.hasFixedDate ? (
                  <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                )}
                <span className="font-semibold text-slate-800">Validity:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                    expiryDisplay.isExpired
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : expiryDisplay.isUrgent
                      ? 'bg-orange-100 text-orange-800 border-orange-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {expiryDisplay.badgeText}
                </span>
                <span className="text-slate-600">({expiryDisplay.detailText})</span>
                {coupon.expiryDate && !expiryDisplay.isExpired && (
                  <CountdownTimer
                    expiryDateStr={coupon.expiryDate}
                    hoursLeftFallback={coupon.expiryHoursLeft || 24}
                    compact={true}
                  />
                )}
              </div>

              {coupon.minSpend && (
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>{coupon.minSpend}</span>
                </div>
              )}
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
            <span>Terms &amp; Conditions</span>
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
                <span className="leading-relaxed">
                  Valid on qualifying purchases directly at {coupon.store}.
                </span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
              <span className="leading-relaxed">
                Eligible regions: {countriesLabel}.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
              <span className="leading-relaxed">
                Final eligibility and discount calculation are determined by {coupon.store} at checkout.
              </span>
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
                <strong className="text-slate-800 block">
                  {coupon.isDeal ? 'Activate the Offer:' : 'Copy the Code:'}
                </strong>
                <span>
                  {coupon.isDeal
                    ? 'Click the Activate Deal button above to open the official store promotion.'
                    : 'Click the Copy Code button above to save the promo code to your clipboard.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <div>
                <strong className="text-slate-800 block">Shop at {coupon.store}:</strong>
                <span>
                  Add eligible items to your shopping cart on the official retailer website.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <div>
                <strong className="text-slate-800 block">Apply &amp; Verify Total:</strong>
                <span>
                  {coupon.isDeal
                    ? 'Confirm the promotional pricing is reflected in your cart before payment.'
                    : 'Paste the code into the Promo or Voucher box at checkout before completing payment.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. More Coupons from this Store */}
      {moreStoreCoupons.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              More Active Deals from {coupon.store}
            </h3>
            <button
              type="button"
              onClick={() => onSelectStore(coupon.storeSlug)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              View All {coupon.store} Offers &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {moreStoreCoupons.map((c) => {
              const cExpiry = getEffectiveExpiryDisplay(c.expiryDate, c.isExpired);
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCoupon(c)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-orange-400 p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-orange-600 text-sm">
                        {c.discountBadge}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {cExpiry.badgeText}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {c.title}
                    </h4>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-400 text-[11px] font-mono">
                      {c.code || 'Direct Deal'}
                    </span>
                    <span className="font-bold text-orange-600 text-[11px] group-hover:underline">
                      View Deal &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Related Category Deals */}
      {relatedCategoryCoupons.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Active Deals in {coupon.category}
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
                    <span className="text-xs font-bold text-slate-500">{c.store}</span>
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
                    {c.code || 'Direct Deal'}
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
