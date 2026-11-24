import React, { useState, useRef } from 'react';
import { X, Tag, Plus, Check, Upload, Image as ImageIcon, Link2 } from 'lucide-react';
import { Category, Coupon } from '../../types/coupon';
import { computeHoursLeftFromDate, getExpiryInfo } from '../../utils/expiry';

interface AddCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCoupon: (coupon: Coupon) => void;
}

const COLOR_PRESETS = [
  { name: 'Orange', bg: 'bg-[#FF6600]' },
  { name: 'Amber', bg: 'bg-amber-500' },
  { name: 'Indigo', bg: 'bg-indigo-600' },
  { name: 'Blue', bg: 'bg-blue-600' },
  { name: 'Emerald', bg: 'bg-emerald-600' },
  { name: 'Dark Slate', bg: 'bg-zinc-950' },
  { name: 'Rose', bg: 'bg-rose-600' },
];

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

export const AddCouponModal: React.FC<AddCouponModalProps> = ({
  isOpen,
  onClose,
  onAddCoupon,
}) => {
  const [store, setStore] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountBadge, setDiscountBadge] = useState('20% OFF');
  const [code, setCode] = useState('');
  const [isDeal, setIsDeal] = useState(false);
  const [category, setCategory] = useState<Category>('Tech & Electronics');
  const [expiryDate, setExpiryDate] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [tagsStr, setTagsStr] = useState('Verified, Trending Deal');
  const [logoError, setLogoError] = useState<string | null>(null);

  // Coupon / Brand Logo states
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState('bg-[#FF6600]');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler converting image file to Base64
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
        setLogoUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store.trim() || !title.trim()) return;

    const bgColors = [
      'bg-amber-500',
      'bg-indigo-600',
      'bg-blue-600',
      'bg-emerald-600',
      'bg-zinc-950',
      'bg-orange-500',
      'bg-red-600',
    ];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];

    const tagsArray = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const finalLogo = logoPreview || (logoUrl.trim() ? logoUrl.trim() : undefined);
    const cleanedExpiry = expiryDate.trim() || undefined;

    const newCoupon: Coupon = {
      id: `admin-c-${Date.now()}`,
      store: store.trim(),
      storeSlug: store.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
      storeLogoBg: selectedBg,
      storeLogoText: store.trim().slice(0, 4).toUpperCase(),
      storeLogoUrl: finalLogo,
      logoUrl: finalLogo,
      category,
      title: title.trim(),
      description: description.trim() || `Verified discount offer for ${store.trim()}.`,
      discountBadge: discountBadge.trim() || 'SPECIAL DEAL',
      discountType: discountBadge.includes('%') ? 'percentage' : 'fixed',
      discountValueNum: parseInt(discountBadge.replace(/[^0-9]/g, '')) || 20,
      code: isDeal ? '' : code.trim().toUpperCase(),
      isDeal,
      storeUrl: storeUrl.trim() || `https://www.${store.toLowerCase().replace(/\s+/g, '')}.com`,
      verified: true,
      verifiedText: 'Verified by Admin',
      successRate: 100,
      usesCount: 0,
      expiryDate: cleanedExpiry,
      expiryHoursLeft: computeHoursLeftFromDate(cleanedExpiry),
      minSpend: 'No minimum spend required',
      terms: ['Admin verified promo offer', 'Valid on qualifying purchases'],
      exclusive: true,
      featured: true,
      trending: true,
      editorPicked: true,
      tags: tagsArray.length > 0 ? tagsArray : ['Verified', 'Exclusive'],
      upvotes: 0,
      downvotes: 0,
      isCommunity: true,
      averageRating: 5.0,
      reviews: [],
    };

    onAddCoupon(newCoupon);
    // Reset state
    setStore('');
    setTitle('');
    setDescription('');
    setCode('');
    setLogoUrl('');
    setLogoPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-[#121824] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-700/80 text-white animate-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-[#0B0F17] p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF6600] flex items-center justify-center text-white font-bold text-xs">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-white">
                Add New Coupon
              </h2>
              <p className="text-[11px] text-slate-400">
                Publish a new promo code or deal to CodeCoupon directory.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Store Name *
            </label>
            <input
              type="text"
              required
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="e.g. Amazon, Nike, Daraz, eBay"
              className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          {/* Coupon Brand / Store Logo Upload Section */}
          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5 text-[#FF6600]" />
                <span>Coupon / Brand Logo</span>
              </label>
              <span className="text-[10px] text-slate-400">
                Upload image file or enter URL
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Logo Preview Box */}
              <div className="relative group shrink-0">
                <div
                  className={`w-14 h-14 rounded-xl ${selectedBg} border-2 border-slate-600 flex items-center justify-center overflow-hidden shadow-md`}
                >
                  {logoPreview || logoUrl ? (
                    <img
                      src={logoPreview || logoUrl}
                      alt="Coupon Logo Preview"
                      className="w-full h-full object-contain p-1 bg-white"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-white font-extrabold text-xs tracking-wider font-heading">
                      {store ? store.slice(0, 4).toUpperCase() : 'LOGO'}
                    </span>
                  )}
                </div>
                {(logoPreview || logoUrl) && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow cursor-pointer transition-transform hover:scale-110"
                    title="Remove Logo"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {/* Upload & URL Inputs */}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileUpload}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                  id="coupon-logo-file-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#FF6600]" />
                  <span>Upload Logo File (PNG/JPG)</span>
                </button>

                <div className="relative flex items-center">
                  <Link2 className="w-3 h-3 text-slate-500 absolute left-2.5 pointer-events-none" />
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => {
                      setLogoUrl(e.target.value);
                      setLogoPreview(null);
                    }}
                    placeholder="Or paste direct image URL (https://...)"
                    className="w-full text-[11px] pl-7 pr-2.5 py-1.5 bg-[#121824] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
              </div>
            </div>

            {logoError && (
              <p className="text-[11px] text-rose-400 font-medium">{logoError}</p>
            )}

            {/* Badge Color Selector when no image is loaded */}
            {!logoPreview && !logoUrl && (
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium">Badge Color:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedBg(color.bg)}
                      className={`w-4 h-4 rounded-full ${color.bg} border transition-all ${
                        selectedBg === color.bg
                          ? 'border-white scale-125 ring-1 ring-orange-500'
                          : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Coupon Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Up to 50% Off on Electronics & Laptops"
              className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Discount Badge *
              </label>
              <input
                type="text"
                required
                value={discountBadge}
                onChange={(e) => setDiscountBadge(e.target.value)}
                placeholder="e.g. 50% OFF or $20 OFF"
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#FF6600] cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Offer Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsDeal(false)}
                className={`py-2 px-3 rounded-xl border text-center transition-colors cursor-pointer font-semibold ${
                  !isDeal
                    ? 'bg-[#FF6600] text-white border-[#FF6600]'
                    : 'bg-[#0B0F17] text-slate-400 border-slate-700'
                }`}
              >
                Promo Code Required
              </button>
              <button
                type="button"
                onClick={() => setIsDeal(true)}
                className={`py-2 px-3 rounded-xl border text-center transition-colors cursor-pointer font-semibold ${
                  isDeal
                    ? 'bg-[#FF6600] text-white border-[#FF6600]'
                    : 'bg-[#0B0F17] text-slate-400 border-slate-700'
                }`}
              >
                Direct Deal (No Code)
              </button>
            </div>
          </div>

          {!isDeal && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required={!isDeal}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE50, FLASH25"
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-white font-mono font-bold tracking-wider placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Expiry Date (Optional)
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
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#FF6600] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {(() => {
                  const preview = getExpiryInfo(expiryDate);
                  return preview ? `${preview.label} (${preview.formattedDate})` : 'Optional — leave blank if ongoing';
                })()}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Store Website URL
              </label>
              <input
                type="url"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="e.g. Electronics, Limited Time, Verified, Free Shipping"
              className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes or details about where to apply this coupon..."
              className="w-full px-3.5 py-2 bg-[#0B0F17] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              Publish Coupon to CodeCoupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
