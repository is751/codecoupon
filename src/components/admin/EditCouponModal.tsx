import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Tag, 
  Save, 
  Calendar, 
  Upload, 
  Image as ImageIcon, 
  Link2, 
  Percent, 
  ShieldCheck, 
  Trash2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Category, Coupon, StoreInfo } from '../../types/coupon';
import { COUNTRIES, CountryCode } from '../../utils/countries';
import { computeHoursLeftFromDate, getExpiryInfo, isCouponExpired } from '../../utils/expiry';

interface EditCouponModalProps {
  isOpen: boolean;
  coupon: Coupon | null;
  stores?: Record<string, StoreInfo>;
  onClose: () => void;
  onSave: (updatedCoupon: Coupon) => void;
}

const CATEGORIES: Category[] = [
  'Tech & Electronics',
  'Fashion & Apparel',
  'Food & Dining',
  'Hosting & Software',
  'Travel & Flights',
  'Beauty & Wellness',
  'Home & Lifestyle',
  'Entertainment & Gaming',
  'Sports',
  'Toys & Games',
];

const COLOR_PRESETS = [
  { name: 'Orange', bg: 'bg-[#FF6600]' },
  { name: 'Amber', bg: 'bg-amber-500' },
  { name: 'Indigo', bg: 'bg-indigo-600' },
  { name: 'Blue', bg: 'bg-blue-600' },
  { name: 'Emerald', bg: 'bg-emerald-600' },
  { name: 'Dark Slate', bg: 'bg-zinc-950' },
  { name: 'Rose', bg: 'bg-rose-600' },
  { name: 'Violet', bg: 'bg-violet-700' },
];

export const EditCouponModal: React.FC<EditCouponModalProps> = ({
  isOpen,
  coupon,
  stores,
  onClose,
  onSave,
}) => {
  const [store, setStore] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountBadge, setDiscountBadge] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'free_shipping' | 'bogo'>('percentage');
  const [discountValueNum, setDiscountValueNum] = useState<number>(20);
  const [code, setCode] = useState('');
  const [isDeal, setIsDeal] = useState(false);
  const [category, setCategory] = useState<Category>('Tech & Electronics');
  const [expiryDate, setExpiryDate] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [termsStr, setTermsStr] = useState('');
  const [verified, setVerified] = useState(true);
  const [verifiedText, setVerifiedText] = useState('Checked Nov 2026');
  const [selectedCountries, setSelectedCountries] = useState<CountryCode[]>(['GLOBAL']);
  const [featured, setFeatured] = useState(false);
  const [exclusive, setExclusive] = useState(false);

  // Logo States
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState('bg-[#FF6600]');
  const [uploadError, setUploadError] = useState<string | null>(null);
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

  // Sync state whenever the selected coupon changes
  useEffect(() => {
    if (coupon) {
      setStore(coupon.store || '');
      setStoreSlug(coupon.storeSlug || '');
      setTitle(coupon.title || '');
      setDescription(coupon.description || '');
      setDiscountBadge(coupon.discountBadge || '20% OFF');
      setDiscountType(coupon.discountType || 'percentage');
      setDiscountValueNum(coupon.discountValueNum ?? 20);
      setCode(coupon.code || '');
      setIsDeal(Boolean(coupon.isDeal));
      setCategory(coupon.category || 'Tech & Electronics');
      setExpiryDate(coupon.expiryDate || '');
      setStoreUrl(coupon.storeUrl || '');
      setTagsStr(coupon.tags ? coupon.tags.join(', ') : '');
      setMinSpend(coupon.minSpend || '');
      setTermsStr(coupon.terms ? coupon.terms.join('\n') : '');
      setVerified(coupon.verified ?? true);
      setVerifiedText(coupon.verifiedText || 'Checked Nov 2026');
      setSelectedCountries(
        coupon.countries && coupon.countries.length > 0 ? coupon.countries : ['GLOBAL']
      );
      setFeatured(Boolean(coupon.featured));
      setExclusive(Boolean(coupon.exclusive));

      const existingLogo = coupon.logoUrl || coupon.storeLogoUrl || '';
      setLogoUrl(existingLogo);
      setLogoPreview(existingLogo || null);
      setSelectedBg(coupon.storeLogoBg || 'bg-[#FF6600]');
      setUploadError(null);
    }
  }, [coupon, isOpen]);

  if (!isOpen || !coupon) return null;

  // Handle Logo Upload to Base64
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setUploadError('File size exceeds 3MB. Please choose a smaller image.');
        return;
      }
      setUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setLogoUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoUrl('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store.trim() || !title.trim()) return;

    const parsedTags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const parsedTerms = termsStr
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const finalLogo = logoPreview || (logoUrl.trim() ? logoUrl.trim() : undefined);
    const resolvedSlug = storeSlug || coupon.storeSlug || store.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanedExpiry = expiryDate.trim() || undefined;
    const expired = isCouponExpired(cleanedExpiry, false);

    const updatedCoupon: Coupon = {
      ...coupon,
      store: store.trim(),
      storeSlug: resolvedSlug,
      storeLogoBg: selectedBg,
      storeLogoText: store.trim(),
      storeLogoUrl: finalLogo,
      logoUrl: finalLogo,
      category,
      title: title.trim(),
      description: description.trim(),
      discountBadge: discountBadge.trim() || 'Deal',
      discountType,
      discountValueNum: Number(discountValueNum) || 0,
      code: isDeal ? undefined : code.trim() ? code.trim().toUpperCase() : undefined,
      isDeal,
      storeUrl: storeUrl.trim() || coupon.storeUrl,
      verified,
      verifiedText: expired ? 'Expired' : verifiedText.trim() || 'Active Offer',
      isExpired: expired,
      expiryDate: cleanedExpiry,
      expiryHoursLeft: computeHoursLeftFromDate(cleanedExpiry),
      countries: selectedCountries,
      minSpend: minSpend.trim() ? minSpend.trim() : undefined,
      tags: parsedTags.length > 0 ? parsedTags : coupon.tags,
      terms: parsedTerms.length > 0 ? parsedTerms : coupon.terms,
      featured,
      exclusive,
    };

    onSave(updatedCoupon);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-[#0B0F17] text-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0E131F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6600] flex items-center justify-center border border-orange-500/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading text-white">
                  Edit Coupon / Deal
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-[#FF6600] border border-orange-500/30">
                  ID: {coupon.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Update store name, discount code, logo, tags, and expiry date.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* 1. Store Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Store *
                </label>
                {stores && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    slug: {storeSlug || store.toLowerCase().replace(/[^a-z0-9]/g, '')}
                  </span>
                )}
              </div>

              {stores && Object.keys(stores).length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={storeSlug}
                    onChange={(e) => {
                      const selectedSlug = e.target.value;
                      if (selectedSlug === '__custom__') {
                        setStoreSlug('');
                      } else {
                        setStoreSlug(selectedSlug);
                        const matched = stores[selectedSlug];
                        if (matched) {
                          setStore(matched.name);
                          setCategory(matched.category);
                          if (matched.logoBg) setSelectedBg(matched.logoBg);
                          if (matched.website) setStoreUrl(matched.website);
                          if (matched.logoUrl) {
                            setLogoUrl(matched.logoUrl);
                            setLogoPreview(matched.logoUrl);
                          }
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6600] cursor-pointer"
                  >
                    <option value="">-- Select Store --</option>
                    {Object.values(stores).map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                    <option value="__custom__">+ Enter Custom Store Name...</option>
                  </select>

                  {(!storeSlug || !stores[storeSlug]) && (
                    <input
                      type="text"
                      value={store}
                      onChange={(e) => {
                        setStore(e.target.value);
                        setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                      }}
                      placeholder="Type custom store name..."
                      required
                      className="w-full px-3.5 py-2 bg-[#0B0F17] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={store}
                  onChange={(e) => {
                    setStore(e.target.value);
                    setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }}
                  placeholder="e.g. Amazon, Daraz, Nike"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6600] cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Coupon Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Coupon / Deal Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 50% OFF Echo Dot & Fire TV 4K Streamers"
              required
              className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          {/* 3. Discount Badge, Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Discount Badge *
              </label>
              <input
                type="text"
                value={discountBadge}
                onChange={(e) => setDiscountBadge(e.target.value)}
                placeholder="e.g. 50% OFF, $20 OFF"
                required
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6600] cursor-pointer"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
                <option value="free_shipping">Free Shipping</option>
                <option value="bogo">Buy One Get One</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Numeric Value
              </label>
              <input
                type="number"
                value={discountValueNum}
                onChange={(e) => setDiscountValueNum(Number(e.target.value))}
                min="0"
                max="1000"
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>

          {/* 4. Deal vs Promo Code Toggle & Code */}
          <div className="p-4 rounded-xl bg-[#121824] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Offer Type
                </span>
                <span className="text-[11px] text-slate-400">
                  {isDeal ? 'Direct Deal (No code required)' : 'Promo Code (User must copy code)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeal(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    !isDeal ? 'bg-[#FF6600] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Promo Code
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeal(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    isDeal ? 'bg-[#FF6600] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Direct Deal
                </button>
              </div>
            </div>

            {!isDeal && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Coupon Promo Code *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE50, FLASH20"
                  required={!isDeal}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-400 placeholder-slate-500 uppercase focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            )}
          </div>

          {/* 5. Expiry Date & Store URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Expiry Date (Optional)
                </label>
                {expiryDate && (
                  <button
                    type="button"
                    onClick={() => setExpiryDate('')}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Clear date
                  </button>
                )}
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6600]"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {(() => {
                  const preview = getExpiryInfo(expiryDate);
                  return preview
                    ? `${preview.label} (${preview.formattedDate})`
                    : 'No specific expiry date set (countdown hidden on cards)';
                })()}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Store / Affiliate URL
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://www.merchant-store.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>
          </div>

          {/* Country / Region Targeting */}
          <div className="p-3.5 rounded-xl bg-[#121824] border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Target Countries / Regions
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

          {/* 6. Tags (comma-separated) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="e.g. Verified, Trending, Bestseller, Limited Time"
              className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
            />
            {tagsStr && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tagsStr.split(',').map((t, i) => {
                  const cleaned = t.trim();
                  if (!cleaned) return null;
                  return (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-[#FF6600] border border-orange-500/30">
                      #{cleaned}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* 7. Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what this coupon or promotion offers..."
              className="w-full px-3.5 py-2 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] resize-none"
            />
          </div>

          {/* 8. Logo Customization (Upload File or Enter URL) */}
          <div className="p-4 rounded-xl bg-[#121824] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#FF6600]" />
                <span>Coupon / Brand Logo</span>
              </label>
              {logoPreview && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Custom Logo</span>
                </button>
              )}
            </div>

            {uploadError && (
              <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="flex items-center gap-4">
              {/* Logo Preview */}
              <div
                className={`w-14 h-14 rounded-xl ${selectedBg} text-white flex items-center justify-center font-bold text-sm shrink-0 border border-slate-700 overflow-hidden shadow-inner`}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-full h-full object-contain p-1 bg-white"
                  />
                ) : (
                  <span>{store ? store.slice(0, 3).toUpperCase() : 'CPN'}</span>
                )}
              </div>

              {/* Upload & URL Controls */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                    id="edit-coupon-logo-upload"
                  />
                  <label
                    htmlFor="edit-coupon-logo-upload"
                    className="px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-[#FF6600] border border-orange-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Image</span>
                  </label>
                  <span className="text-[11px] text-slate-500">PNG, JPG, SVG up to 3MB</span>
                </div>

                <input
                  type="url"
                  value={logoUrl.startsWith('data:') ? '' : logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    setLogoPreview(e.target.value || null);
                  }}
                  placeholder="Or paste external image URL..."
                  className="w-full px-3 py-1.5 bg-[#0B0F17] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>

            {/* Logo Background Presets */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">
                Badge Background (if logo has transparency or no image):
              </span>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setSelectedBg(p.bg)}
                    className={`w-6 h-6 rounded-lg ${p.bg} transition-all cursor-pointer ${
                      selectedBg === p.bg ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0B0F17] scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={p.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 9. Extra Options: Verified status, Success rate, Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <label className="flex items-center gap-2 p-3 rounded-xl bg-[#121824] border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF6600] focus:ring-0 bg-[#0B0F17] border-slate-700"
              />
              <span className="text-xs font-semibold text-slate-200">
                Active Status
              </span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-[#121824] border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF6600] focus:ring-0 bg-[#0B0F17] border-slate-700"
              />
              <span className="text-xs font-semibold text-slate-200">
                Featured Deal
              </span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-[#121824] border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={exclusive}
                onChange={(e) => setExclusive(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF6600] focus:ring-0 bg-[#0B0F17] border-slate-700"
              />
              <span className="text-xs font-semibold text-slate-200">
                Exclusive Code
              </span>
            </label>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white text-xs font-bold shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
