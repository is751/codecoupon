import React, { useState, useRef } from 'react';
import { X, Tag, Plus, Sparkles, Check, Layers, Calendar, Upload, Image as ImageIcon, Link2 } from 'lucide-react';
import { Category, Coupon, StoreInfo } from '../../types/coupon';
import { STORES_DATA } from '../../data/coupons';
import { computeHoursLeftFromDate, getExpiryInfo } from '../../utils/expiry';

interface CouponActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCoupon: (coupon: Coupon) => void;
  onAddAllCoupons: (coupons: Coupon[]) => void;
  stores?: Record<string, StoreInfo>;
  initialMode?: 'single' | 'bulk';
}

// Rich curated batch of high-value trending coupons ready for 1-click bulk import
const BULK_CURATED_COUPONS: Coupon[] = [
  {
    id: 'bulk-c-1',
    store: 'Amazon',
    storeSlug: 'amazon',
    storeLogoBg: 'bg-amber-500',
    storeLogoText: 'amazon',
    storeBrandColor: '#FF9900',
    category: 'Tech & Electronics',
    title: '50% OFF Amazon Echo Dot & Fire TV 4K Streamers',
    description: 'Instant discount on bestselling Amazon devices with hands-free Alexa smart home setup and free Prime delivery.',
    discountBadge: '50% OFF',
    discountType: 'percentage',
    discountValueNum: 50,
    code: 'ECHO50NOW',
    isDeal: false,
    storeUrl: 'https://www.amazon.com',
    verified: true,
    verifiedText: 'Verified & Working Today',
    successRate: 98,
    usesCount: 3840,
    expiryDate: '2026-11-30',
    expiryHoursLeft: 48,
    terms: ['Valid on eligible Amazon devices', 'Cannot be combined with trade-in credits'],
    exclusive: true,
    featured: true,
    trending: true,
    upvotes: 412,
    downvotes: 8,
    reviews: [],
    averageRating: 4.9,
  },
  {
    id: 'bulk-c-2',
    store: 'Daraz',
    storeSlug: 'daraz',
    storeLogoBg: 'bg-[#FF6600]',
    storeLogoText: 'Daraz',
    storeBrandColor: '#FF6600',
    category: 'Tech & Electronics',
    title: 'Flat 70% OFF Daraz 11.11 Mega Shopping Festival',
    description: 'Biggest online sale of the year across smartphones, smart electronics, fashion apparel, and home appliances.',
    discountBadge: '70% OFF',
    discountType: 'percentage',
    discountValueNum: 70,
    code: 'DARAZ1111',
    isDeal: false,
    storeUrl: 'https://www.daraz.pk',
    verified: true,
    verifiedText: 'Mega Festival Code',
    successRate: 99,
    usesCount: 5240,
    expiryDate: '2026-12-15',
    expiryHoursLeft: 72,
    terms: ['Sitewide voucher', 'Applicable on DarazMall stores'],
    exclusive: true,
    featured: true,
    trending: true,
    upvotes: 680,
    downvotes: 12,
    reviews: [],
    averageRating: 5.0,
  },
  {
    id: 'bulk-c-3',
    store: 'Nike',
    storeSlug: 'nike',
    storeLogoBg: 'bg-zinc-950',
    storeLogoText: 'NIKE',
    storeBrandColor: '#111111',
    category: 'Fashion & Apparel',
    title: '30% OFF Nike Member Fall Running & Air Max Collection',
    description: 'Take an extra 30% off selected Pegasus, InfinityRN, and Air Max models at official Nike online checkout.',
    discountBadge: '30% OFF',
    discountType: 'percentage',
    discountValueNum: 30,
    code: 'FALLRUN30',
    isDeal: false,
    storeUrl: 'https://www.nike.com',
    verified: true,
    verifiedText: 'Staff Verified',
    successRate: 97,
    usesCount: 2950,
    expiryDate: '2026-12-10',
    expiryHoursLeft: 408,
    terms: ['Nike Member sign-in required', 'Free standard delivery'],
    exclusive: false,
    featured: true,
    trending: true,
    upvotes: 320,
    downvotes: 6,
    reviews: [],
    averageRating: 4.8,
  },
  {
    id: 'bulk-c-4',
    store: 'Walmart',
    storeSlug: 'walmart',
    storeLogoBg: 'bg-blue-600',
    storeLogoText: 'Walmart',
    storeBrandColor: '#0071DC',
    category: 'Home & Lifestyle',
    title: 'Free Express Grocery & Essentials Delivery ($35+ Orders)',
    description: 'Get doorstep delivery on fresh produce, groceries, and cleaning essentials with zero delivery markup.',
    discountBadge: 'FREE DELIVERY',
    discountType: 'free_shipping',
    discountValueNum: 15,
    code: 'WMTFREEDEL',
    isDeal: true,
    storeUrl: 'https://www.walmart.com',
    verified: true,
    verifiedText: 'Auto-applied deal',
    successRate: 96,
    usesCount: 2180,
    expiryDate: '2026-12-31',
    terms: ['Minimum $35 basket order', 'Valid for new & existing customers'],
    exclusive: false,
    featured: true,
    trending: false,
    upvotes: 210,
    downvotes: 4,
    reviews: [],
    averageRating: 4.7,
  },
  {
    id: 'bulk-c-5',
    store: 'Hostinger',
    storeSlug: 'hostinger',
    storeLogoBg: 'bg-violet-700',
    storeLogoText: 'HOSTINGER',
    storeBrandColor: '#673DE6',
    category: 'Hosting & Software',
    title: '75% OFF Premium Web Hosting + Free Domain & SSL',
    description: 'Launch fast WordPress websites with unlimited bandwidth, AI site generator, and 24/7 technical assistance.',
    discountBadge: '75% OFF',
    discountType: 'percentage',
    discountValueNum: 75,
    code: 'CODECOUPON75',
    isDeal: false,
    storeUrl: 'https://www.hostinger.com',
    verified: true,
    verifiedText: 'Exclusive Partnership',
    successRate: 99,
    usesCount: 1890,
    expiryDate: '2026-12-31',
    terms: ['Valid on 12-month and 48-month hosting plans'],
    exclusive: true,
    featured: true,
    trending: true,
    upvotes: 440,
    downvotes: 2,
    reviews: [],
    averageRating: 5.0,
  },
  {
    id: 'bulk-c-6',
    store: 'Sephora',
    storeSlug: 'sephora',
    storeLogoBg: 'bg-black',
    storeLogoText: 'SEPHORA',
    storeBrandColor: '#000000',
    category: 'Beauty & Wellness',
    title: '20% OFF Sitewide Beauty Insider Holiday Sale',
    description: 'Unlock 20% off high-end perfumes, skincare regimens, and trending cosmetic kits with Beauty Insider code.',
    discountBadge: '20% OFF',
    discountType: 'percentage',
    discountValueNum: 20,
    code: 'YAYSAVE20',
    isDeal: false,
    storeUrl: 'https://www.sephora.com',
    verified: true,
    verifiedText: 'Verified Promo',
    successRate: 95,
    usesCount: 1670,
    expiryDate: '2026-11-25',
    terms: ['Beauty Insider membership required (free to join)'],
    exclusive: false,
    featured: true,
    trending: true,
    upvotes: 280,
    downvotes: 7,
    reviews: [],
    averageRating: 4.8,
  },
  {
    id: 'bulk-c-7',
    store: 'eBay',
    storeSlug: 'ebay',
    storeLogoBg: 'bg-emerald-600',
    storeLogoText: 'ebay',
    storeBrandColor: '#E53238',
    category: 'Tech & Electronics',
    title: '15% OFF Certified Refurbished Apple & Dell Laptops',
    description: 'Save an extra 15% on thoroughly tested refurbished computers with official 2-year Allstate warranty.',
    discountBadge: '15% OFF',
    discountType: 'percentage',
    discountValueNum: 15,
    code: 'REFURB15',
    isDeal: false,
    storeUrl: 'https://www.ebay.com',
    verified: true,
    verifiedText: 'Verified by eBay',
    successRate: 96,
    usesCount: 1420,
    expiryDate: '2026-12-05',
    terms: ['Max discount $100', 'Valid on certified refurbished items only'],
    exclusive: false,
    featured: false,
    trending: true,
    upvotes: 195,
    downvotes: 5,
    reviews: [],
    averageRating: 4.7,
  },
  {
    id: 'bulk-c-8',
    store: 'AliExpress',
    storeSlug: 'aliexpress',
    storeLogoBg: 'bg-orange-500',
    storeLogoText: 'AliExpress',
    storeBrandColor: '#FF4747',
    category: 'Tech & Electronics',
    title: '$12 OFF Orders Over $80 on Global Choice Selection',
    description: 'Direct factory pricing discount on smart gadgets, LED fixtures, and auto accessories with tracking.',
    discountBadge: '$12 OFF',
    discountType: 'fixed',
    discountValueNum: 12,
    code: 'CHOICE12',
    isDeal: false,
    storeUrl: 'https://www.aliexpress.com',
    verified: true,
    verifiedText: 'Verified Code',
    successRate: 94,
    usesCount: 2310,
    expiryDate: '2026-11-28',
    terms: ['Orders $80 and above', 'Free shipping included'],
    exclusive: true,
    featured: false,
    trending: true,
    upvotes: 215,
    downvotes: 9,
    reviews: [],
    averageRating: 4.6,
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
  // Selected sub-tab: 'single' (Add New Coupon) | 'bulk' (Add All Coupon)
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>(initialMode);

  React.useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Available stores for smart domain matching when URL is entered
  const allStoresRecord = stores || STORES_DATA;
  const storeOptions = Object.values(allStoresRecord);

  // Single Form State (Simplified to requested 6 fields)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [code, setCode] = useState('');

  // Coupon Logo Upload States
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expiryPreview = getExpiryInfo(expiryDate);

  // Handle Logo Image File Upload -> Convert to Base64 String
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

  // Resolve store metadata automatically from URL or offer title
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
        safeUrl: cleanUrl || matchedByTitle.website,
      };
    }

    return {
      store: 'Featured Store',
      storeSlug: 'featured-store',
      category: 'Tech & Electronics' as Category,
      storeLogoBg: 'bg-[#FF6600]',
      fallbackLogo: undefined,
      safeUrl: cleanUrl || 'https://example.com',
    };
  };

  // Handle Single Coupon Submit
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
        `Verified discount offer for ${resolved.store}. Save today with this offer.`,
      discountBadge,
      discountType: isDeal ? 'fixed' : 'percentage',
      discountValueNum: discountNum,
      code: isDeal ? undefined : cleanedCode,
      isDeal,
      storeUrl: resolved.safeUrl,
      verified: true,
      verifiedText: 'Verified & Working',
      successRate: 98,
      usesCount: 1,
      expiryDate: cleanedExpiry,
      expiryHoursLeft: computeHoursLeftFromDate(cleanedExpiry),
      terms: ['Subject to retailer terms', 'May not combine with other offers'],
      exclusive: true,
      featured: true,
      trending: true,
      tags: ['Verified', 'Featured Deal'],
      upvotes: 1,
      downvotes: 0,
      userVote: null,
      isCommunity: true,
      reviews: [],
      averageRating: 5.0,
    };

    onAddCoupon(newCoupon);
    setTitle('');
    setDescription('');
    setStoreUrl('');
    setExpiryDate('');
    setCode('');
    setLogoPreview(null);
    setLogoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  // Handle Bulk Add All Coupons
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
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-[#FF6600] flex items-center justify-center border border-orange-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-white">
                Manage Coupons
              </h2>
              <p className="text-xs text-slate-400">
                Choose an option to create a single coupon or import all trending coupons in bulk.
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
            1. Add New Coupon
            2. Add All Coupon
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
            <span>2. Add All Coupons ({BULK_CURATED_COUPONS.length}+ Batch)</span>
          </button>
        </div>

        {/* Tab 1: ADD NEW COUPON (Clean 6-Field Form) */}
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
                placeholder="e.g. 25% OFF Sitewide Orders"
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
                Offer / Brand URL
              </label>
              <div className="relative flex items-center">
                <Link2 className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://www.store.com/deal"
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
                  placeholder="e.g. SAVE25 (optional for deals)"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] uppercase font-mono"
                />
              </div>
            </div>

            {/* Coupon / Brand Logo Upload */}
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
                <span>Save & Add New Coupon</span>
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: ADD ALL COUPONS (Bulk Batch Importer) */
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#FF6600] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  Bulk Coupon & Promo Code Activation
                </span>
                <span className="text-slate-300 block mt-0.5 leading-relaxed">
                  Clicking "Add All Coupons" will instantly deploy {BULK_CURATED_COUPONS.length} verified, editor-picked discounts and promo codes for Amazon, Daraz, Nike, Walmart, Sephora, Hostinger, eBay, and AliExpress directly to your website.
                </span>
              </div>
            </div>

            {/* Preview List of all coupons to be added */}
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
                      <div className={`w-8 h-8 rounded-lg ${c.storeLogoBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs`}>
                        {c.store.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-white text-xs block truncate">
                          {c.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {c.store} • {c.category}
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

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Instant 1-click catalog deployment
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
