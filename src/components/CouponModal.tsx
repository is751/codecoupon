import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Globe,
  Calendar,
  Info,
} from 'lucide-react';
import { Coupon } from '../types/coupon';
import { CountryCode, formatCountriesFull } from '../utils/countries';
import { getEffectiveExpiryDisplay, isCouponExpired } from '../utils/expiry';
import { resolveMerchantUrl } from '../utils/url';

interface CouponModalProps {
  coupon: Coupon | null;
  storeWebsite?: string;
  storeCountries?: CountryCode[];
  onClose: () => void;
  onCopyCode: (coupon: Coupon) => void;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  coupon,
  storeWebsite,
  storeCountries,
  onClose,
  onCopyCode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!coupon) return null;

  const expired = isCouponExpired(coupon.expiryDate, coupon.isExpired);
  const expiryDisplay = getEffectiveExpiryDisplay(coupon.expiryDate, coupon.isExpired);
  const effectiveCountries =
    coupon.countries && coupon.countries.length > 0 ? coupon.countries : storeCountries;
  const countriesLabel = formatCountriesFull(effectiveCountries);

  const targetBrandUrl = resolveMerchantUrl(
    coupon.storeUrl,
    storeWebsite,
    coupon.storeSlug
  );

  const handleCopy = () => {
    if (expired) return;
    onCopyCode(coupon);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Strip */}
        <div className="bg-[#0B0F17] text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl ${coupon.storeLogoBg} text-white flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden shrink-0`}
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
              <div className="flex items-center gap-2 text-xs font-medium flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 ${
                    expired ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{expired ? 'Offer Expired' : coupon.verifiedText || 'Active Offer'}</span>
                </span>
                <span aria-hidden="true" className="text-slate-500">
                  ·
                </span>
                <span className="text-slate-300 inline-flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{countriesLabel}</span>
                </span>
              </div>
              <h2 className="text-xl font-bold font-heading text-white mt-0.5 truncate">
                {coupon.store}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Deal Headline */}
          <div>
            <div className="text-2xl font-black text-[#FF6600] font-heading">
              {coupon.discountBadge}
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">{coupon.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {coupon.description}
            </p>
          </div>

          {/* Validity & Region Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold border ${
                expiryDisplay.isExpired
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : expiryDisplay.isUrgent
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {expiryDisplay.badgeText} · {expiryDisplay.detailText}
              </span>
            </span>
            {coupon.minSpend && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>{coupon.minSpend}</span>
              </span>
            )}
          </div>

          {/* Coupon Code Big Action Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
            {expired ? (
              <p className="text-xs font-semibold text-rose-600 py-2">
                This promotion has expired and is no longer redeemable.
              </p>
            ) : coupon.isDeal ? (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-3">
                  No promotional code required. Discount applies directly through the merchant offer page.
                </p>
                <a
                  href={targetBrandUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <span>Go to {coupon.store} Store</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div>
                <span className="text-xs text-slate-500 font-medium block mb-2">
                  Copy this code and paste it at checkout:
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2 bg-white rounded-lg border-2 border-dashed border-[#FF6600]/80">
                  <span className="font-mono text-base font-extrabold text-slate-900 tracking-wider px-2 py-1">
                    {coupon.code}
                  </span>
                  <a
                    href={targetBrandUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={handleCopy}
                    className={`py-2 px-4 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] text-white'
                    }`}
                    title={`Copy code and visit ${coupon.store}`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'COPIED & OPENED!' : 'COPY CODE & VISIT'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="mt-3">
                  <a
                    href={targetBrandUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-bold underline underline-offset-4"
                  >
                    <span>Visit Official {coupon.store} Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Offer Terms &amp; Eligibility
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              {coupon.terms && coupon.terms.length > 0 ? (
                coupon.terms.map((term, index) => (
                  <li key={index} className="leading-relaxed">
                    {term}
                  </li>
                ))
              ) : (
                <li className="leading-relaxed">
                  Valid on qualifying purchases at {coupon.store}.
                </li>
              )}
              <li className="leading-relaxed">Eligible regions: {countriesLabel}.</li>
              <li className="leading-relaxed">
                Validity: {expiryDisplay.detailText}.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
