import React, { useState, useRef } from 'react';
import {
  X,
  Tag,
  Plus,
  Sparkles,
  Layers,
  Calendar,
  Upload,
  Image as ImageIcon,
  Link2,
  Globe,
} from 'lucide-react';
import { Category, Coupon, StoreInfo } from '../../types/coupon';
import { STORES_DATA } from '../../data/coupons';
import { COUNTRIES, CountryCode } from '../../utils/countries';
import { computeHoursLeftFromDate, getExpiryInfo, isCouponExpired } from '../../utils/expiry';
import { resolveMerchantUrl } from '../../utils/url';

interface CouponActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCoupon: (coupon: Coupon) => void;
  onAddAllCoupons: (coupons: Coupon[]) => void;
  stores?: Record<string, StoreInfo>;
  initialMode?: 'single' | 'bulk';
}

const BULK_CURATED_COUPONS: Coupon[] = [
  {
    id: 'bulk-c-1',
    store: 'Amazon',
    storeSlug: 'amazon',
    storeLogoBg: 'bg-amber-500',
    storeLogoText: 'amazon',
    storeBrandColor: '#FF9900',
    category: 'Tech & Electronics',
    title: 'Up to 35% Off Amazon Smart Home & Fire TV Devices',
    description:
      'Seasonal savings on select Echo speakers, Fire TV Stick streaming hardware, and Kindle e-readers sold directly by Amazon.',
    discountBadge: 'UP TO 35% OFF',
    discountType: 'percentage',
    discountValueNum: 35,
    isDeal: true,
    storeUrl: 'https://www.amazon.com/deals',
    verified: true,
    verifiedText: 'Checked Nov 2026',
    isExpired: false,
    expiryDate: '2026-12-31',
    countries: ['US', 'UK', 'CA', 'DE'],
    minSpend: 'Valid on select Amazon devices while inventory lasts',
    terms: [
      'Discount reflects on participating Amazon-sold hardware listings',
      'Subject to stock availability and regional store domain',
    ],
    exclusive: false,
    featured: true,
    trending: true,
    tags: ['Electronics', 'Direct Offer'],
  },
  {
    id: 'bulk-c-2',
    store: 'Daraz',
    storeSlug: 'daraz',
    storeLogoBg: 'bg-[#FF6600]',
    storeLogoText: 'Daraz',
    storeBrandColor: '#FF6600',
    category: 'Tech & Electronics',
    title: 'Up to 25% Off Year-End Electronics & Home Essentials',
    description:
      'Voucher savings across participating DarazMall stores for smartphones, kitchen appliances, and seasonal accessories.',
    discountBadge: 'UP TO 25% OFF',
    discountType: 'percentage',
    discountValueNum: 25,
    code: 'DARAZSAVE25',
    isDeal: false,
    storeUrl: 'https://www.daraz.pk',
    verified: true,
    verifiedText: 'Checked Nov 2026',
    isExpired: false,
    expiryDate: '2026-12-31',
    countries: ['PK'],
    minSpend: 'Minimum basket Rs. 3,000',
    terms: [
      'Valid on participating DarazMall partner stores',
      'One redemption per registered account',
    ],
    exclusive: false,
    featured: true,
    trending: true,
    tags: ['DarazMall', 'Electronics'],
  },
  {
    id: 'bulk-c-3',
    store: 'Nike',
    storeSlug: 'nike',
    storeLogoBg: 'bg-zinc-950',
    storeLogoText: 'NIKE',
    storeBrandColor: '#111111',
    category: 'Fashion & Apparel',
    title: '20% Off Select Nike Running & Training Styles',
    description:
      'Apply promo code MEMBER20 on eligible footwear and athletic apparel in the seasonal sale section.',
    discountBadge: '20% OFF',
    discountType: 'percentage',
    discountValueNum: 20,
    code: 'MEMBER20',
    isDeal: false,
    storeUrl: 'https://www.nike.com',
    verified: true,
    verifiedText: 'Checked Nov 2026',
    isExpired: false,
    expiryDate: '2027-01-15',
    countries: ['US', 'UK', 'CA', 'AU', 'DE'],
    minSpend: 'Nike Member sign-in required',
    terms: [
      'Nike Member sign-in required at checkout',
      'Excludes limited-edition SNKRS releases and gift cards',
    ],
    exclusive: false,
    featured: true,
    trending: true,
    tags: ['Apparel', 'Footwear'],
  },
  {
    id: 'bulk-c-4',
    store: 'Walmart',
    storeSlug: 'walmart',
    storeLogoBg: 'bg-blue-600',
    storeLogoText: 'Walmart',
    storeBrandColor: '#0071DC',
    category: 'Home & Lifestyle',
    title: 'Free Shipping on Eligible Orders Over $35',
    description:
      'Automatic free standard shipping on qualifying online orders over $35 shipped and sold by Walmart.',
    discountBadge: 'FREE SHIPPING',
    discountType: 'free_shipping',
    discountValueNum: 15,
    isDeal: true,
    storeUrl: 'https://www.walmart.com',
    verified: true,
    verifiedText: 'Checked Nov 2026',
    isExpired: false,
    expiryDate: '2027-01-31',
    countries: ['US', 'CA'],
    minSpend: 'Minimum $35 qualifying basket',
    terms: [
      'Minimum $35 subtotal required before tax',
      'Excludes freight or marketplace-only surcharges',
    ],
    exclusive: false,
    featured: true,
    trending: false,
    tags: ['Free Shipping', 'Groceries'],
  },
  {
    id: 'bulk-c-5',
    store: 'Hostinger',
    storeSlug: 'hostinger',
    storeLogoBg: 'bg-violet-700',
    storeLogoText: 'HOSTINGER',
    storeBrandColor: '#673DE6',
    category: 'Hosting & Software',
    title: 'Up to 75% Off Introductory Web Hosting + Free Domain',
    description:
      'Apply code CODECOUPON75 on eligible annual Premium or Business hosting subscriptions with SSL included.',
    discountBadge: 'UP TO 75% OFF',
    discountType: 'percentage',
    discountValueNum: 75,
    code: 'CODECOUPON75',
    isDeal: false,
    storeUrl: 'https://www.hostinger.com',
    verified: true,
    verifiedText: 'Checked Nov 2026',
    isExpired: false,
    expiryDate: '2027-01-31',
    countries: ['GLOBAL'],
    minSpend: 'Requires 12-month or longer billing cycle',
    terms: [
      'Applies to new introductory hosting terms',
      'Standard renewal pricing applies after the first term',
    ],
    exclusive: true,
    featured: true,
    trending: true,
    tags: ['Hosting', 'Global'],
  },
  {
    id: 'bulk-c-6',
    store: 'Sephora',
    storeSlug: 'sephora',
    storeLogoBg: 'bg-black',
    storeLogoText: 'SEPHORA',
    storeBrandColor: '#000000',
    category: 'Beauty & Wellness',
    title: 'Free Standard Shipping for Beauty Insider Members',
    description:
      'Join Sephora Beauty Insider for free to unlock complimentary standard shipping on eligible online orders.',
    discountBadge: 'FREE SHIPPING',
    discountType: 'free_shipping',
    discountValueNum: 10,
    isDeal: true,
    storeUrl: 'https://www.sephora.com',
    verified: true,
    verifiedText: 'Checked Nov 2026',
    isExpired: false,
    expiryDate: '2027-01-31',
    countries: ['US', 'CA'],
    minSpend: 'Free Beauty Insider account required',
    terms: [
      'Must be signed into a Sephora Beauty Insider account at checkout',
      'Excludes expedited or same-day courier fees',
    ],
    exclusive: false,
    featured: true,
    trending: true,
    tags: ['Beauty', 'Free Shipping'],
  },
  {
    id: 'bulk-c-7',
    store: 'eBay',
    storeSlug: 'ebay',
    storeLogoBg: 'bg-emerald-600',
    storeLogoText: 'ebay',
    storeBrandColor: '#E53238',
    category: 'Tech & Electronics',
    title: '15% Off Certified Refurbished Tech & Electronics',
    description:
      'Save 15% on qualifying certified refurbished laptops, audio gear, and tools from participating sellers.',
    discountBadge: '15% OFF',
    discountType: 'percentage',
    discountValueNum: 15,
    code: 'REFURB15',
    isDeal: false,
    storeUrl: 'https://www.ebay.com',
    verified: true,
    verifiedText: 'Checked Nov 2026',
    isExpired: false,
    expiryDate: '2026-12-28',
    countries: ['US', 'UK', 'CA', 'AU', 'DE'],
    minSpend: 'Minimum purchase $50; max discount $100',
    terms: [
      'Valid on eligible Certified Refurbished event listings',
      'Maximum discount capped at $100 per transaction',
    ],
    exclusive: false,
    featured: false,
    trending: true,
    tags: ['Refurbished', 'Tech'],
  },
  {
    id: 'bulk-c-8',
    store: 'AliExpress',
    storeSlug: 'aliexpress',
    storeLogoBg: 'bg-orange-500',
    storeLogoText: 'AliExpress',
    storeBrandColor: '#FF4747',
    category: 'Tech & Electronics',
    title: '$12 Off Qualifying Choice Orders Over $80',
    description:
      'Apply code CHOICE12 at checkout on eligible AliExpress Choice baskets above $80.',
    discountBadge: '$12 OFF',
    discountType: 'fixed',
    discountValueNum: 12,
    code: 'CHOICE12',
    isDeal: false,
    storeUrl: 'https://www.aliexpress.com',
    verified: true,
    verifiedText: 'Checked Nov 2026',
    isExpired: false,
    expiryDate: '2026-12-24',
    countries: ['GLOBAL'],
    minSpend: 'Minimum order $80 excluding shipping',
    terms: [
      'Applicable to eligible Choice marketplace items',
      'Currency equivalents vary by shipping destination',
    ],
    exclusive: true,
    featured: false,
    trending: true,
    tags: ['Global', 'Choice'],
  },
];

export const CouponActionModal: React.FC<CouponActionModalProps> = ({
  isOpen,
  onClose,
  onAddCoupon,
  onAddAllCoupons,
  stores,
  initialMode = 'single',
}) => {
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>(initialMode);

  React.useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const allStoresRecord = stores || STORES_DATA;
  const storeOptions = Object.values(allStoresRecord);

  // Single Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [code, setCode] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<CountryCode[]>(['GLOBAL']);

  // Coupon Logo Upload States
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expiryPreview = getExpiryInfo(expiryDate);

  const toggleCountry = (countryCode: CountryCode) => {
    setSelectedCountries((prev) => {
      if (countryCode === 'GLOBAL') return ['GLOBAL'];
      const withoutGlobal = prev.filter((c) => c !== 'GLOBAL');
      const exists = withoutGlobal.includes(countryCode);
      const next = exists
        ? withoutGlobal.filter((c) => c !== countryCode)
        : [...withoutGlobal, countryCode];
      return next.length > 0 ? next : ['GLOBAL'];
    });
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setLogoError('File size exceeds 3MB. Please choose a smaller logo image.');
        return;
      }
      setLogoError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resolveStoreFromInput = (rawUrl: string, offerTitle: string) => {
    const cleanUrl = rawUrl.trim();
    if (cleanUrl) {
      try {
        const normalized = /^https?:\/\//i.test(cleanUrl) ? cleanUrl : `https://${cleanUrl}`;
        const host = new URL(normalized).hostname.replace(/^www\./i, '').toLowerCase();
        const hostRoot = host.split('.')[0] || '';

        const matchedStore = storeOptions.find((s) => {
          const sSlug = s.slug.toLowerCase();
          const sName = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          return (
            hostRoot === sSlug ||
            hostRoot === sName ||
            s.website.toLowerCase().includes(host)
          );
        });

        if (matchedStore) {
          return {
            store: matchedStore.name,
            storeSlug: matchedStore.slug,
            category: matchedStore.category,
            storeLogoBg: matchedStore.logoBg || 'bg-[#FF6600]',
            fallbackLogo: matchedStore.logoUrl,
            safeUrl: normalized,
          };
        }

        if (hostRoot) {
          const prettyName = hostRoot.charAt(0).toUpperCase() + hostRoot.slice(1);
          return {
            store: prettyName,
            storeSlug: hostRoot.replace(/[^a-z0-9]/g, ''),
            category: 'Tech & Electronics' as Category,
            storeLogoBg: 'bg-[#FF6600]',
            fallbackLogo: undefined,
            safeUrl: normalized,
          };
        }
      } catch {
        // Ignore invalid URL parse and fall back below
      }
    }

    const titleWord = offerTitle.trim().split(/\s+/)[0] || 'Featured';
    const matchedByTitle = storeOptions.find(
      (s) => s.name.toLowerCase() === titleWord.toLowerCase()
    );
    if (matchedByTitle) {
      return {
        store: matchedByTitle.name,
        storeSlug: matchedByTitle.slug,
        category: matchedByTitle.category,
        storeLogoBg: matchedByTitle.logoBg || 'bg-[#FF6600]',
        fallbackLogo: matchedByTitle.logoUrl,
        safeUrl: resolveMerchantUrl(cleanUrl, matchedByTitle.website, matchedByTitle.slug),
      };
    }

    return {
      store: 'Partner Store',
      storeSlug: 'partner-store',
      category: 'Tech & Electronics' as Category,
      storeLogoBg: 'bg-[#FF6600]',
      fallbackLogo: undefined,
      safeUrl: resolveMerchantUrl(cleanUrl, undefined, 'codecoupon'),
    };
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const resolved = resolveStoreFromInput(storeUrl, title);
    const cleanedCode = code.trim().toUpperCase();
    const isDeal = cleanedCode.length === 0;

    const badgeMatch = title.match(/(\d+%\s*OFF|\$\d+\s*OFF|FREE\s*SHIPPING|BOGO)/i);
    const discountBadge = badgeMatch ? badgeMatch[1].toUpperCase() : 'SPECIAL OFFER';
    const discountNum = parseInt(discountBadge.replace(/[^0-9]/g, ''), 10) || 20;

    const finalLogo = logoPreview || resolved.fallbackLogo;
    const cleanedExpiry = expiryDate.trim() || undefined;
    const expired = isCouponExpired(cleanedExpiry, false);

    const newCoupon: Coupon = {
      id: `admin-c-${Date.now()}`,
      store: resolved.store,
      storeSlug: resolved.storeSlug,
      storeLogoBg: resolved.storeLogoBg,
      storeLogoText: resolved.store,
      storeLogoUrl: finalLogo,
      logoUrl: finalLogo,
      category: resolved.category,
      title: title.trim(),
      description:
        description.trim() ||
        `Promotional offer for ${resolved.store}. Review merchant terms at checkout.`,
      discountBadge,
      discountType: isDeal ? 'fixed' : 'percentage',
      discountValueNum: discountNum,
      code: isDeal ? undefined : cleanedCode,
      isDeal,
      storeUrl: resolved.safeUrl,
      verified: true,
      verifiedText: expired ? 'Expired' : 'Active Offer',
      isExpired: expired,
      expiryDate: cleanedExpiry,
      expiryHoursLeft: computeHoursLeftFromDate(cleanedExpiry),
      countries: selectedCountries,
      terms: ['Subject to merchant terms and exclusions at checkout'],
      exclusive: false,
      featured: true,
      trending: true,
      tags: ['Active Offer'],
      isCommunity: true,
    };

    onAddCoupon(newCoupon);
    setTitle('');
    setDescription('');
    setStoreUrl('');
    setExpiryDate('');
    setCode('');
    setSelectedCountries(['GLOBAL']);
    setLogoPreview(null);
    setLogoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleBulkAddAll = () => {
    onAddAllCoupons(BULK_CURATED_COUPONS);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#0B0F17] text-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        role="dialog"
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-[#FF6600] flex items-center justify-center border border-orange-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-white">Manage Coupons</h2>
              <p className="text-xs text-slate-400">
                Create a new coupon offer with target regions or import the curated batch.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 p-2 bg-[#0E131F] border-b border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveMode('single')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'single'
                ? 'bg-[#FF6600] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>1. Add New Coupon</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('bulk')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'bulk'
                ? 'bg-[#FF6600] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Add All Coupons ({BULK_CURATED_COUPONS.length} Offers)</span>
          </button>
        </div>

        {activeMode === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Offer Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 20% Off Orders Over $75"
                className="w-full text-xs px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Offer Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about this offer, eligible items, or terms..."
                className="w-full text-xs px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Offer / Affiliate URL
              </label>
              <div className="relative flex items-center">
                <Link2 className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://www.merchant-store.com/offer"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Expiry Date
                  </label>
                  {expiryDate && (
                    <button
                      type="button"
                      onClick={() => setExpiryDate('')}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      Clear date
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
                {expiryPreview && (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {expiryPreview.label} ({expiryPreview.formattedDate})
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SAVE20 (leave blank for deal)"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] uppercase font-mono"
                />
              </div>
            </div>

            {/* Country / Region Targeting */}
            <div className="p-3.5 rounded-xl bg-[#121824] border border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-[#FF6600]" />
                <span>Target Countries / Regions</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRIES.map((country) => {
                  const isSelected = selectedCountries.includes(country.code);
                  return (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => toggleCountry(country.code)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF6600] text-white border-[#FF6600]'
                          : 'bg-[#0B0F17] text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {country.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logo Upload */}
            <div className="p-4 rounded-xl bg-[#121824] border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <ImageIcon className="w-3.5 h-3.5 text-[#FF6600]" />
                  <span>Upload Logo</span>
                </label>
                <span className="text-[11px] text-slate-400">PNG, JPG, WebP, SVG (max 3MB)</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-[#FF6600] border-2 border-slate-600 flex items-center justify-center overflow-hidden shadow-md">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Coupon Logo Preview"
                        className="w-full h-full object-contain p-1.5 bg-white"
                      />
                    ) : (
                      <span className="text-white font-extrabold text-sm tracking-wider font-heading">
                        LOGO
                      </span>
                    )}
                  </div>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow cursor-pointer transition-transform hover:scale-110"
                      title="Remove Logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoFileUpload}
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    className="hidden"
                    id="coupon-action-logo-file-input"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#FF6600]" />
                    <span>{logoPreview ? 'Change Logo File' : 'Upload Logo File'}</span>
                  </button>
                </div>
              </div>

              {logoError && <p className="text-[11px] text-rose-400 font-medium">{logoError}</p>}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#FF6600] hover:bg-[#FA5A00] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Save &amp; Add New Coupon</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#FF6600] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  Curated Partner Offer Import
                </span>
                <span className="text-slate-300 block mt-0.5 leading-relaxed">
                  Import {BULK_CURATED_COUPONS.length} partner offers with expiration dates, regional targeting, and explicit terms for Amazon, Daraz, Nike, Walmart, Sephora, Hostinger, eBay, and AliExpress.
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Curated Deals Included ({BULK_CURATED_COUPONS.length} Offers)
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {BULK_CURATED_COUPONS.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-[#121824] border border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg ${c.storeLogoBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        {c.store.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-white text-xs block truncate">
                          {c.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {c.store} • {c.category} • Exp {c.expiryDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.code && (
                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-[#FF6600] font-bold">
                          {c.code}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold">
                        {c.discountBadge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">Ready for catalog import</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkAddAll}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Add All Coupons Now</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
