import React, { useState } from 'react';
import { Flame, ArrowRight, Check, ExternalLink, Calendar, Globe, Clock } from 'lucide-react';
import { Coupon, StoreInfo } from '../types/coupon';
import { formatCountriesBadge } from '../utils/countries';
import { CountdownTimer } from './CountdownTimer';
import { getEffectiveExpiryDisplay, isCouponExpired } from '../utils/expiry';
import { resolveMerchantUrl } from '../utils/url';

interface FeaturedDealsSectionProps {
  coupons: Coupon[];
  stores?: Record<string, StoreInfo>;
  onCopyCode: (coupon: Coupon) => void;
  onOpenDetails: (coupon: Coupon) => void;
  onSelectStore: (storeSlug: string) => void;
  onViewAllFeatured: () => void;
}

export const FeaturedDealsSection: React.FC<FeaturedDealsSectionProps> = ({
  coupons,
  stores = {},
  onCopyCode,
  onOpenDetails,
  onSelectStore,
  onViewAllFeatured,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Take top 4 active, non-expired featured deals
  const featuredOffers = coupons
    .filter((c) => c.verified && !isCouponExpired(c.expiryDate, c.isExpired) && (c.featured || c.trending))
    .slice(0, 4);

  if (featuredOffers.length === 0) return null;

  const handleCopy = (coupon: Coupon, e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyCode(coupon);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#FF6600]" />
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 font-heading">
            Featured Coupons &amp; Deals
          </h2>
        </div>
        <button
          type="button"
          onClick={onViewAllFeatured}
          className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of 4 Featured Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredOffers.map((coupon) => {
          const isCopied = copiedId === coupon.id;
          const expiryDisplay = getEffectiveExpiryDisplay(coupon.expiryDate, coupon.isExpired);
          const storeInfo = stores[coupon.storeSlug.toLowerCase()];
          const effectiveCountries =
            coupon.countries && coupon.countries.length > 0
              ? coupon.countries
              : storeInfo?.countries;
          const targetBrandUrl = resolveMerchantUrl(
            coupon.storeUrl,
            storeInfo?.website,
            coupon.storeSlug
          );

          return (
            <div
              key={coupon.id}
              onClick={() => onOpenDetails(coupon)}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-orange-300 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer relative"
            >
              <div>
                {/* Top Row: Store Branding + Discount Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStore(coupon.storeSlug);
                    }}
                    className="flex items-center gap-2.5 text-left group-hover:opacity-90 transition-opacity cursor-pointer min-w-0"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${coupon.storeLogoBg} text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs shrink-0 overflow-hidden`}
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
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-sm text-slate-900 block font-heading hover:text-orange-600 transition-colors truncate">
                        {coupon.store}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                        <Globe className="w-2.5 h-2.5 text-slate-400" />
                        <span>{formatCountriesBadge(effectiveCountries)}</span>
                      </span>
                    </div>
                  </button>

                  <span className="px-2.5 py-1 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-md shadow-xs font-heading shrink-0">
                    {coupon.discountBadge}
                  </span>
                </div>

                {/* Expiry Display */}
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                      expiryDisplay.isUrgent
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {expiryDisplay.hasFixedDate ? (
                      <Calendar className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{expiryDisplay.badgeText}</span>
                  </span>
                  {coupon.expiryDate && !expiryDisplay.isExpired && (
                    <CountdownTimer
                      expiryDateStr={coupon.expiryDate}
                      hoursLeftFallback={coupon.expiryHoursLeft || 24}
                      compact={true}
                    />
                  )}
                </div>

                {/* Deal Title */}
                <p className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-relaxed mb-1.5">
                  {coupon.title}
                </p>

                {/* Term / Minimum Spend Preview */}
                {(coupon.minSpend || coupon.terms?.[0]) && (
                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                    {coupon.minSpend || coupon.terms[0]}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                {!coupon.isDeal && coupon.code ? (
                  <div className="py-2 px-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center font-mono font-bold text-xs text-slate-800 tracking-wider">
                    {isCopied ? coupon.code : `${coupon.code.slice(0, 3)}••••`}
                  </div>
                ) : (
                  <div className="py-2 px-3 bg-emerald-50/50 border border-dashed border-emerald-300 rounded-lg text-center font-medium text-xs text-emerald-800">
                    No Code Required (Direct Offer)
                  </div>
                )}

                <a
                  href={targetBrandUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={(e) => handleCopy(coupon, e)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-xs cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-500/20'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>COPIED &amp; OPENED!</span>
                    </>
                  ) : coupon.isDeal ? (
                    <>
                      <span>Get Deal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Get Code</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </>
                  )}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
