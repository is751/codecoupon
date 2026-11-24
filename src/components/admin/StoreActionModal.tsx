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
} from 'lucide-react';
import { StoreInfo } from '../../types/coupon';

interface StoreActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStore: (store: StoreInfo) => void;
  onAddAllStores: (stores: StoreInfo[]) => void;
  existingStoresCount?: number;
  initialMode?: 'single' | 'bulk';
}

// Comprehensive catalog of pre-configured premier stores for bulk import
const CATALOG_STORES: StoreInfo[] = [
  {
    slug: 'amazon',
    name: 'Amazon',
    category: 'Tech & Electronics',
    logoText: 'amazon',
    logoBg: 'bg-amber-500',
    brandColor: '#FF9900',
    website: 'https://www.amazon.com',
    description: 'World’s largest online marketplace with electronics, books, smart home tech, and daily essentials with Prime delivery.',
    rating: 4.8,
    totalRatingsCount: 1420,
    established: '1994',
    bestDiscount: '50% OFF',
    cashbackRate: 'Up to 5% with Prime',
    highlights: ['Prime 1-Day Shipping', 'Lightning Deals', 'Echo & Kindle Hardware'],
  },
  {
    slug: 'daraz',
    name: 'Daraz',
    category: 'Tech & Electronics',
    logoText: 'Daraz',
    logoBg: 'bg-[#FF6600]',
    brandColor: '#FF6600',
    website: 'https://www.daraz.pk',
    description: 'South Asia’s premier online shopping platform offering mega discounts on electronics, fashion, mobile phones, and lifestyle brands.',
    rating: 4.8,
    totalRatingsCount: 1540,
    established: '2012',
    bestDiscount: '70% OFF',
    cashbackRate: '10% Daraz Club Coins',
    highlights: ['11.11 Mega Shopping Festival', 'DarazMall 100% Authentic', 'Free Delivery Vouchers'],
  },
  {
    slug: 'nike',
    name: 'Nike',
    category: 'Fashion & Apparel',
    logoText: 'NIKE',
    logoBg: 'bg-zinc-950',
    brandColor: '#111111',
    website: 'https://www.nike.com',
    description: 'Premier global athletic footwear, apparel, and sports equipment brand with iconic Air Jordan, Pegasus, and Dri-FIT collections.',
    rating: 4.9,
    totalRatingsCount: 890,
    established: '1964',
    bestDiscount: '40% OFF',
    cashbackRate: '6% Member Rewards',
    highlights: ['Free 60-day returns', 'SNKRS exclusive drops', 'Seasonal clearance'],
  },
  {
    slug: 'walmart',
    name: 'Walmart',
    category: 'Home & Lifestyle',
    logoText: 'Walmart',
    logoBg: 'bg-blue-600',
    brandColor: '#0071DC',
    website: 'https://www.walmart.com',
    description: 'Everyday low prices on grocery essentials, home goods, electronics, and pharmacy items online and in store.',
    rating: 4.7,
    totalRatingsCount: 750,
    established: '1962',
    bestDiscount: '$10 OFF',
    cashbackRate: 'Walmart+ Free Shipping',
    highlights: ['Rollback specials', 'Doorstep grocery delivery', 'Gas discount benefits'],
  },
  {
    slug: 'ebay',
    name: 'eBay',
    category: 'Tech & Electronics',
    logoText: 'ebay',
    logoBg: 'bg-emerald-600',
    brandColor: '#E53238',
    website: 'https://www.ebay.com',
    description: 'Global online marketplace for certified refurbished electronics, fashion, collectibles, and direct retailer outlets.',
    rating: 4.6,
    totalRatingsCount: 620,
    established: '1995',
    bestDiscount: '15% OFF',
    cashbackRate: 'eBay Bucks 1-3%',
    highlights: ['Authenticity Guarantee', 'Refurbished 2-yr warranty', 'Seller coupons'],
  },
  {
    slug: 'bestbuy',
    name: 'Best Buy',
    category: 'Tech & Electronics',
    logoText: 'BEST BUY',
    logoBg: 'bg-yellow-400',
    brandColor: '#FFE000',
    website: 'https://www.bestbuy.com',
    description: 'North America’s leading electronics retailer with deals on laptops, 4K TVs, gaming gear, and appliances.',
    rating: 4.8,
    totalRatingsCount: 980,
    established: '1966',
    bestDiscount: '50% OFF',
    cashbackRate: 'My Best Buy Plus',
    highlights: ['Deal of the Day', 'Price Match Guarantee', '1-hour store pickup'],
  },
  {
    slug: 'target',
    name: 'Target',
    category: 'Home & Lifestyle',
    logoText: 'Target',
    logoBg: 'bg-red-600',
    brandColor: '#CC0000',
    website: 'https://www.target.com',
    description: 'Trend-forward home decor, apparel, clean beauty, and groceries with famous Target Circle rewards.',
    rating: 4.9,
    totalRatingsCount: 1120,
    established: '1902',
    bestDiscount: '20% OFF',
    cashbackRate: '5% with Circle Card',
    highlights: ['Free contactless Drive Up', 'Circle 360 same-day delivery', '1-year brand guarantee'],
  },
  {
    slug: 'aliexpress',
    name: 'AliExpress',
    category: 'Tech & Electronics',
    logoText: 'AliExpress',
    logoBg: 'bg-orange-500',
    brandColor: '#FF4747',
    website: 'https://www.aliexpress.com',
    description: 'Global direct-to-consumer store with wholesale prices on gadget accessories, tools, apparel, and hobbies.',
    rating: 4.5,
    totalRatingsCount: 840,
    established: '2010',
    bestDiscount: '60% OFF',
    cashbackRate: 'SuperDeals coins',
    highlights: ['Choice Day Free Delivery', 'Buyer Protection', 'Flash Discounts'],
  },
  {
    slug: 'sephora',
    name: 'Sephora',
    category: 'Beauty & Wellness',
    logoText: 'SEPHORA',
    logoBg: 'bg-black',
    brandColor: '#000000',
    website: 'https://www.sephora.com',
    description: 'Luxury makeup, skincare, fragrances, and haircare with Beauty Insider sample rewards and seasonal sales.',
    rating: 4.9,
    totalRatingsCount: 1250,
    established: '1969',
    bestDiscount: '20% OFF',
    cashbackRate: 'Beauty Insider Points',
    highlights: ['Free beauty samples with order', 'VIB & Rouge Seasonal Sales', 'Free standard shipping'],
  },
  {
    slug: 'adidas',
    name: 'Adidas',
    category: 'Sports',
    logoText: 'adidas',
    logoBg: 'bg-slate-900',
    brandColor: '#000000',
    website: 'https://www.adidas.com',
    description: 'German athletic giant famous for Ultraboost, Stan Smith, Samba, and performance sportswear.',
    rating: 4.8,
    totalRatingsCount: 670,
    established: '1949',
    bestDiscount: '35% OFF',
    cashbackRate: 'adiClub Member Points',
    highlights: ['adiClub exclusive drops', 'Extra 20% off sale items', 'Free delivery for members'],
  },
  {
    slug: 'apple',
    name: 'Apple',
    category: 'Tech & Electronics',
    logoText: 'Apple',
    logoBg: 'bg-slate-800',
    brandColor: '#555555',
    website: 'https://www.apple.com',
    description: 'Premium tech innovator producing iPhone, MacBook Pro, iPad, AirPods, and Apple Watch.',
    rating: 4.9,
    totalRatingsCount: 2100,
    established: '1976',
    bestDiscount: '$150 OFF',
    cashbackRate: '3% Daily Cash with Apple Card',
    highlights: ['Apple Certified Refurbished', 'Student Education Savings', 'Trade-in value credits'],
  },
  {
    slug: 'hostinger',
    name: 'Hostinger',
    category: 'Hosting & Software',
    logoText: 'HOSTINGER',
    logoBg: 'bg-violet-700',
    brandColor: '#673DE6',
    website: 'https://www.hostinger.com',
    description: 'High-performance cloud & WordPress hosting provider with free domain, SSL, and AI website builder.',
    rating: 4.7,
    totalRatingsCount: 890,
    established: '2004',
    bestDiscount: '75% OFF',
    cashbackRate: 'Free Domain + SSL Included',
    highlights: ['99.9% uptime guarantee', 'LiteSpeed web servers', '24/7 priority customer support'],
  },
];

export const StoreActionModal: React.FC<StoreActionModalProps> = ({
  isOpen,
  onClose,
  onAddStore,
  onAddAllStores,
  initialMode = 'single',
}) => {
  // Selected sub-tab: 'single' (Add New Store) | 'bulk' (Add All Store)
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>(initialMode);

  React.useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Single Store Form State (Simplified to requested 5 fields)
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Store Logo Upload States
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image File Upload -> Convert to Base64 String
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
        const base64String = reader.result as string;
        setLogoPreview(base64String);
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

  // Handle Single Store Submit
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    const slug = storeName.toLowerCase().replace(/[^a-z0-9]/g, '') || `store-${Date.now()}`;

    const newStore: StoreInfo = {
      slug,
      name: storeName.trim(),
      category: 'Tech & Electronics',
      logoText: storeName.trim(),
      logoBg: 'bg-[#FF6600]',
      logoUrl: logoPreview || undefined,
      brandColor: '#FF6600',
      website: `https://www.${slug}.com`,
      description:
        description.trim() ||
        `${storeName.trim()} official store with verified coupon codes, discount deals, and savings.`,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      rating: 4.8,
      totalRatingsCount: 250,
      established: '2020',
      bestDiscount: '20% OFF',
      cashbackRate: 'Up to 5% Rewards',
      highlights: [
        'Verified promo codes updated daily',
        'Direct retailer checkout discount',
        'Official store guarantee',
      ],
    };

    onAddStore(newStore);
    // Reset form
    setStoreName('');
    setDescription('');
    setMetaTitle('');
    setMetaDescription('');
    setLogoPreview(null);
    setLogoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  // Handle Bulk Add All Stores
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
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-[#FF6600] flex items-center justify-center border border-orange-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-white">
                Manage Stores
              </h2>
              <p className="text-xs text-slate-400">
                Choose an option to add an individual store or import all partner stores in bulk.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Options Tab Bar matching user's exact request:
            1. Add New Store
            2. Add All Store
        */}
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
            <span>2. Add All Stores ({CATALOG_STORES.length}+ Catalog)</span>
          </button>
        </div>

        {/* Tab 1: ADD NEW STORE (Clean 5-Field Form) */}
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
                placeholder="e.g. Nike, Amazon, Zara"
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
                placeholder="Brief description of the store and what it offers..."
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
                placeholder="e.g. Nike Promo Codes & Verified Coupons 2026"
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

              {logoError && (
                <p className="text-[11px] text-rose-400 font-medium">{logoError}</p>
              )}
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
                <span>Save & Add New Store</span>
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: ADD ALL STORES (Bulk Catalog Importer) */
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#FF6600] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  Bulk Partner Store Activation
                </span>
                <span className="text-slate-300 block mt-0.5 leading-relaxed">
                  Clicking "Add All Stores" will automatically register and activate all {CATALOG_STORES.length} popular partner stores in CodeCoupon's database, complete with verified categories, rating data, and discount tags.
                </span>
              </div>
            </div>

            {/* Preview Grid of all stores to be added */}
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
                    <div className={`w-8 h-8 rounded-lg ${s.logoBg} text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-xs font-heading`}>
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

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Instant 1-click database sync
              </span>
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
