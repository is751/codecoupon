import React, { useState, useRef } from 'react';
import {
  X,
  Store,
  Plus,
  Sparkles,
  Check,
  Layers,
  Upload,
  Image as ImageIcon,
  Globe,
} from 'lucide-react';
import { StoreInfo } from '../../types/coupon';
import { COUNTRIES, CountryCode } from '../../utils/countries';

interface StoreActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStore: (store: StoreInfo) => void;
  onAddAllStores: (stores: StoreInfo[]) => void;
  existingStoresCount?: number;
  initialMode?: 'single' | 'bulk';
}

const CATALOG_STORES: StoreInfo[] = [
  {
    slug: 'amazon',
    name: 'Amazon',
    category: 'Tech & Electronics',
    logoText: 'amazon',
    logoBg: 'bg-amber-500',
    brandColor: '#FF9900',
    website: 'https://www.amazon.com',
    description:
      'International online marketplace featuring electronics, books, home essentials, and Amazon smart home hardware.',
    countries: ['US', 'UK', 'CA', 'DE', 'AU', 'IN'],
    established: '1994',
    bestDiscount: 'Up to 40% Off',
    cashbackRate: 'Prime Eligible Benefits',
    highlights: [
      'Free shipping thresholds on eligible items',
      'Seasonal deals across Amazon devices',
      'Subscribe & Save recurring item discounts',
    ],
  },
  {
    slug: 'daraz',
    name: 'Daraz',
    category: 'Tech & Electronics',
    logoText: 'Daraz',
    logoBg: 'bg-[#FF6600]',
    brandColor: '#FF6600',
    website: 'https://www.daraz.pk',
    description:
      'South Asian online marketplace offering electronics, apparel, home appliances, and verified brand stores on DarazMall.',
    countries: ['PK'],
    established: '2012',
    bestDiscount: 'Up to 30% Off',
    cashbackRate: 'DarazMall Vouchers',
    highlights: [
      'Official brand storefronts via DarazMall',
      'Seller voucher stacking on qualifying carts',
      'Regional bank and wallet promotions',
    ],
  },
  {
    slug: 'nike',
    name: 'Nike',
    category: 'Fashion & Apparel',
    logoText: 'NIKE',
    logoBg: 'bg-zinc-950',
    brandColor: '#111111',
    website: 'https://www.nike.com',
    description:
      'Global athletic footwear, apparel, and training gear retailer featuring Nike Member benefits and seasonal sale events.',
    countries: ['US', 'UK', 'CA', 'AU', 'DE'],
    established: '1964',
    bestDiscount: 'Up to 40% Off',
    cashbackRate: 'Nike Member Perks',
    highlights: [
      'Complimentary shipping for signed-in Nike Members',
      '60-day wear-test return policy on most footwear',
      'Seasonal markdowns on select apparel',
    ],
  },
  {
    slug: 'walmart',
    name: 'Walmart',
    category: 'Home & Lifestyle',
    logoText: 'Walmart',
    logoBg: 'bg-blue-600',
    brandColor: '#0071DC',
    website: 'https://www.walmart.com',
    description:
      'Everyday low prices across groceries, electronics, home furnishings, and household essentials online and in store.',
    countries: ['US', 'CA'],
    established: '1962',
    bestDiscount: 'Rollbacks & $10 Off',
    cashbackRate: 'Free Shipping $35+',
    highlights: [
      'Free standard shipping on eligible orders over $35',
      'Weekly rollback savings across departments',
      'Curbside pickup at local Walmart locations',
    ],
  },
  {
    slug: 'ebay',
    name: 'eBay',
    category: 'Tech & Electronics',
    logoText: 'ebay',
    logoBg: 'bg-emerald-600',
    brandColor: '#E53238',
    website: 'https://www.ebay.com',
    description:
      'Global marketplace connecting shoppers with Certified Refurbished electronics, direct brand outlets, and collectibles.',
    countries: ['US', 'UK', 'CA', 'AU', 'DE'],
    established: '1995',
    bestDiscount: '15% Off Refurbished',
    cashbackRate: 'Authenticity Guarantee',
    highlights: [
      'Certified Refurbished electronics with warranty coverage',
      'Buyer Money Back Guarantee on eligible purchases',
      'Event promo codes on featured categories',
    ],
  },
  {
    slug: 'bestbuy',
    name: 'Best Buy',
    category: 'Tech & Electronics',
    logoText: 'BEST BUY',
    logoBg: 'bg-yellow-400',
    brandColor: '#FFE000',
    website: 'https://www.bestbuy.com',
    description:
      'Consumer electronics retailer offering computers, smart TVs, audio equipment, gaming consoles, and major appliances.',
    countries: ['US', 'CA'],
    established: '1966',
    bestDiscount: 'Up to 35% Off',
    cashbackRate: 'Price Match Guarantee',
    highlights: [
      'Price Match Guarantee on qualifying competitor offers',
      'Same-day pickup at participating stores',
      'Student & member savings on select laptops',
    ],
  },
  {
    slug: 'target',
    name: 'Target',
    category: 'Home & Lifestyle',
    logoText: 'Target',
    logoBg: 'bg-red-600',
    brandColor: '#CC0000',
    website: 'https://www.target.com',
    description:
      'US department store offering home decor, apparel, beauty products, and groceries with Target Circle member savings.',
    countries: ['US'],
    established: '1902',
    bestDiscount: '20% Off Circle',
    cashbackRate: '5% with Circle Card',
    highlights: [
      'Contactless Drive Up & Order Pickup',
      'Free Target Circle account deals',
      'Free shipping on qualifying $35+ orders',
    ],
  },
  {
    slug: 'aliexpress',
    name: 'AliExpress',
    category: 'Tech & Electronics',
    logoText: 'AliExpress',
    logoBg: 'bg-orange-500',
    brandColor: '#FF4747',
    website: 'https://www.aliexpress.com',
    description:
      'International direct-to-consumer marketplace featuring electronics accessories, home gadgets, and global Choice delivery.',
    countries: ['GLOBAL'],
    established: '2010',
    bestDiscount: '$12 Off Orders $80+',
    cashbackRate: 'Choice Free Shipping',
    highlights: [
      'AliExpress Choice consolidated delivery options',
      'Regional coupon tiers based on order total',
      'Buyer Protection across eligible orders',
    ],
  },
  {
    slug: 'sephora',
    name: 'Sephora',
    category: 'Beauty & Wellness',
    logoText: 'SEPHORA',
    logoBg: 'bg-black',
    brandColor: '#000000',
    website: 'https://www.sephora.com',
    description:
      'Prestige cosmetics, skincare, fragrance, and haircare retailer with Beauty Insider seasonal member savings.',
    countries: ['US', 'CA', 'UK', 'AU', 'AE'],
    established: '1969',
    bestDiscount: '20% Off Seasonal',
    cashbackRate: 'Beauty Insider Free Shipping',
    highlights: [
      'Complimentary shipping for signed-in Beauty Insiders',
      'Free deluxe sample tiers on qualifying purchases',
      'Seasonal VIB & Rouge member events',
    ],
  },
  {
    slug: 'adidas',
    name: 'Adidas',
    category: 'Sports',
    logoText: 'adidas',
    logoBg: 'bg-slate-900',
    brandColor: '#000000',
    website: 'https://www.adidas.com',
    description:
      'Global sportswear and footwear brand offering running shoes, lifestyle sneakers, and adiClub member benefits.',
    countries: ['US', 'UK', 'CA', 'AU', 'DE'],
    established: '1949',
    bestDiscount: 'Up to 35% Off',
    cashbackRate: 'adiClub Member Rewards',
    highlights: [
      'Free delivery for adiClub members',
      'Seasonal clearance markdowns',
      'Member-exclusive product releases',
    ],
  },
  {
    slug: 'apple',
    name: 'Apple',
    category: 'Tech & Electronics',
    logoText: 'Apple',
    logoBg: 'bg-slate-800',
    brandColor: '#555555',
    website: 'https://www.apple.com',
    description:
      'Direct store for Mac, iPad, iPhone, Apple Watch, and Education Pricing savings plus Certified Refurbished hardware.',
    countries: ['GLOBAL'],
    established: '1976',
    bestDiscount: 'Education Savings',
    cashbackRate: 'Apple Trade In Credits',
    highlights: [
      'Apple Certified Refurbished with 1-year warranty',
      'Education Pricing for university students and faculty',
      'Trade-in credits toward eligible new devices',
    ],
  },
  {
    slug: 'hostinger',
    name: 'Hostinger',
    category: 'Hosting & Software',
    logoText: 'HOSTINGER',
    logoBg: 'bg-violet-700',
    brandColor: '#673DE6',
    website: 'https://www.hostinger.com',
    description:
      'International web hosting and cloud provider offering WordPress hosting, free SSL, and introductory term discounts.',
    countries: ['GLOBAL'],
    established: '2004',
    bestDiscount: 'Up to 78% Off Intro',
    cashbackRate: '1st-Year Domain + SSL',
    highlights: [
      '30-day money-back guarantee on hosting plans',
      'Free SSL certificates included on all tiers',
      '24/7 customer technical support',
    ],
  },
];

export const StoreActionModal: React.FC<StoreActionModalProps> = ({
  isOpen,
  onClose,
  onAddStore,
  onAddAllStores,
  initialMode = 'single',
}) => {
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>(initialMode);

  React.useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<CountryCode[]>(['GLOBAL']);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    const slug =
      storeName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `store-${Date.now()}`;
    const websiteHost = slug.replace(/-/g, '') || 'store';

    const newStore: StoreInfo = {
      slug,
      name: storeName.trim(),
      category: 'Tech & Electronics',
      logoText: storeName.trim(),
      logoBg: 'bg-[#FF6600]',
      logoUrl: logoPreview || undefined,
      brandColor: '#FF6600',
      website: `https://www.${websiteHost}.com`,
      description:
        description.trim() ||
        `${storeName.trim()} store offers, active promo codes, and seasonal promotions.`,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      countries: selectedCountries,
      established: String(new Date().getFullYear()),
      bestDiscount: 'Active Offers',
      cashbackRate: 'Direct Merchant Offers',
      highlights: [
        'Offer terms and expiration dates shown clearly on every listing',
        'Expired deals are automatically hidden from active listings',
        'Direct links to official merchant promotions',
      ],
    };

    onAddStore(newStore);
    setStoreName('');
    setDescription('');
    setMetaTitle('');
    setMetaDescription('');
    setSelectedCountries(['GLOBAL']);
    setLogoPreview(null);
    setLogoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleBulkAddAll = () => {
    onAddAllStores(CATALOG_STORES);
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
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-white">Manage Stores</h2>
              <p className="text-xs text-slate-400">
                Add a new store profile with target regions or import the partner store catalog.
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
            <span>1. Add New Store</span>
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
            <span>2. Add All Stores ({CATALOG_STORES.length} Catalog)</span>
          </button>
        </div>

        {activeMode === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Nike, Amazon, Hostinger"
                className="w-full text-xs px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Store Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the store and its offerings..."
                className="w-full text-xs px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="e.g. Nike Promo Codes & Active Offers | CodeCoupon"
                className="w-full text-xs px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO meta description for search engines..."
                className="w-full text-xs px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] resize-none"
              />
            </div>

            {/* Target Countries */}
            <div className="p-3.5 rounded-xl bg-[#121824] border border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-[#FF6600]" />
                <span>Supported Countries / Regions</span>
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

            {/* Store Logo Upload */}
            <div className="p-4 rounded-xl bg-[#121824] border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <ImageIcon className="w-3.5 h-3.5 text-[#FF6600]" />
                  <span>Upload Store Logo</span>
                </label>
                <span className="text-[11px] text-slate-400">PNG, JPG, WebP, SVG (max 3MB)</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-[#FF6600] border-2 border-slate-600 flex items-center justify-center overflow-hidden shadow-md">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Store Logo Preview"
                        className="w-full h-full object-contain p-1.5 bg-white"
                      />
                    ) : (
                      <span className="text-white font-extrabold text-sm tracking-wider font-heading">
                        {storeName ? storeName.slice(0, 4).toUpperCase() : 'LOGO'}
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
                    id="store-logo-file-input"
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
                <span>Save &amp; Add New Store</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#FF6600] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  Partner Store Catalog Import
                </span>
                <span className="text-slate-300 block mt-0.5 leading-relaxed">
                  Import all {CATALOG_STORES.length} partner stores into CodeCoupon with categories, official store URLs, and regional targeting.
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Stores Included in Catalog ({CATALOG_STORES.length} Stores)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {CATALOG_STORES.map((s) => (
                  <div
                    key={s.slug}
                    className="p-2.5 bg-[#121824] border border-slate-800 rounded-xl flex items-center gap-2.5 hover:border-slate-700 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${s.logoBg} text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-xs font-heading`}
                    >
                      {s.logoText.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-white text-xs block truncate">
                        {s.name}
                      </span>
                      <span className="text-[10px] text-[#FF6600] font-mono block">
                        {s.bestDiscount}
                      </span>
                    </div>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">Instant catalog import</span>
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
                  <span>Add All Stores Now</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
