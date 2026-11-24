import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Store, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Link2, 
  Trash2, 
  Star,
  Sparkles,
  AlertCircle,
  Globe
} from 'lucide-react';
import { Category, StoreInfo } from '../../types/coupon';

interface EditStoreModalProps {
  isOpen: boolean;
  store: StoreInfo | null;
  onClose: () => void;
  onSave: (updatedStore: StoreInfo) => void;
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
  { name: 'Orange', bg: 'bg-[#FF6600]', hex: '#FF6600' },
  { name: 'Amber', bg: 'bg-amber-500', hex: '#F59E0B' },
  { name: 'Indigo', bg: 'bg-indigo-600', hex: '#4F46E5' },
  { name: 'Blue', bg: 'bg-blue-600', hex: '#2563EB' },
  { name: 'Emerald', bg: 'bg-emerald-600', hex: '#059669' },
  { name: 'Violet', bg: 'bg-violet-600', hex: '#7C3AED' },
  { name: 'Rose', bg: 'bg-rose-600', hex: '#E11D48' },
  { name: 'Dark Slate', bg: 'bg-slate-900', hex: '#0F172A' },
];

export const EditStoreModal: React.FC<EditStoreModalProps> = ({
  isOpen,
  store,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Tech & Electronics');
  const [website, setWebsite] = useState('');
  const [bestDiscount, setBestDiscount] = useState('');
  const [cashbackRate, setCashbackRate] = useState('');
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [rating, setRating] = useState('4.8');
  const [totalRatingsCount, setTotalRatingsCount] = useState<number>(500);
  const [established, setEstablished] = useState('');
  const [highlightsStr, setHighlightsStr] = useState('');

  // Logo States
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState('bg-[#FF6600]');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever the selected store changes
  useEffect(() => {
    if (store) {
      setName(store.name || '');
      setCategory(store.category || 'Tech & Electronics');
      setWebsite(store.website || '');
      setBestDiscount(store.bestDiscount || '20% OFF');
      setCashbackRate(store.cashbackRate || 'Up to 5% Rewards');
      setDescription(store.description || '');
      setMetaTitle(store.metaTitle || '');
      setMetaDescription(store.metaDescription || '');
      setRating(store.rating ? String(store.rating) : '4.8');
      setTotalRatingsCount(store.totalRatingsCount || 450);
      setEstablished(store.established || '2020');
      setHighlightsStr(store.highlights ? store.highlights.join('\n') : '');

      setLogoUrl(store.logoUrl || '');
      setLogoPreview(store.logoUrl || null);
      setSelectedBg(store.logoBg || 'bg-[#FF6600]');
      setUploadError(null);
    }
  }, [store, isOpen]);

  if (!isOpen || !store) return null;

  // Handle Logo Upload to Base64
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setUploadError('File size exceeds 3MB. Please choose a smaller logo image.');
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
    if (!name.trim()) return;

    const parsedHighlights = highlightsStr
      .split('\n')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    const finalLogo = logoPreview || (logoUrl.trim() ? logoUrl.trim() : undefined);

    const updatedStore: StoreInfo = {
      ...store,
      name: name.trim(),
      category,
      logoText: name.trim(),
      logoBg: selectedBg,
      logoUrl: finalLogo,
      brandColor: '#FF6600',
      website: website.trim() || store.website,
      description: description.trim(),
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      rating: parseFloat(rating) || 4.8,
      totalRatingsCount: Number(totalRatingsCount) || store.totalRatingsCount || 500,
      established: established.trim() || store.established,
      bestDiscount: bestDiscount.trim() || '20% OFF',
      cashbackRate: cashbackRate.trim() || 'Up to 5% Rewards',
      highlights: parsedHighlights.length > 0 ? parsedHighlights : store.highlights,
    };

    onSave(updatedStore);
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
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading text-white">
                  Edit Store Profile
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-[#FF6600] border border-orange-500/30">
                  Slug: {store.slug}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Update store branding, custom logo, rating, discount rates, and website URL.
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
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Store Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amazon, Daraz, Nike"
                required
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
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

          {/* 2. Official Website / Affiliate Link */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Official Store Website URL *
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.example.com"
                required
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>

          {/* 3. Best Discount & Cashback Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Best Available Discount *
              </label>
              <input
                type="text"
                value={bestDiscount}
                onChange={(e) => setBestDiscount(e.target.value)}
                placeholder="e.g. 50% OFF, Up to 70% OFF"
                required
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Cashback / Member Rate
              </label>
              <input
                type="text"
                value={cashbackRate}
                onChange={(e) => setCashbackRate(e.target.value)}
                placeholder="e.g. Up to 8% Cash Back"
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>

          {/* 4. Rating, Total Ratings & Year Established */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Rating (1.0 to 5.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Total Ratings Count
              </label>
              <input
                type="number"
                value={totalRatingsCount}
                onChange={(e) => setTotalRatingsCount(Number(e.target.value))}
                min="1"
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Established Year
              </label>
              <input
                type="text"
                value={established}
                onChange={(e) => setEstablished(e.target.value)}
                placeholder="e.g. 1994, 2012"
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>

          {/* 5. Description & SEO Meta */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Store Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the retailer, specialties, and shipping options..."
              className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="e.g. Nike Promo Codes & Verified Coupons 2026"
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO summary shown in search engine results..."
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] resize-none"
              />
            </div>
          </div>

          {/* 6. Store Logo (Upload File or URL + Preview) */}
          <div className="p-4 rounded-xl bg-[#121824] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#FF6600]" />
                <span>Store Brand Logo</span>
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
                    alt="Store Logo"
                    className="w-full h-full object-contain p-1 bg-white"
                  />
                ) : (
                  <span>{name ? name.slice(0, 3).toUpperCase() : 'STR'}</span>
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
                    id="edit-store-logo-upload"
                  />
                  <label
                    htmlFor="edit-store-logo-upload"
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
                  placeholder="Or paste external logo image URL..."
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

          {/* 7. Highlights (One per line) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Highlights & Perks (One per line)
            </label>
            <textarea
              rows={3}
              value={highlightsStr}
              onChange={(e) => setHighlightsStr(e.target.value)}
              placeholder="e.g.&#10;Free 2-day delivery&#10;30-day money back guarantee&#10;Verified daily discount codes"
              className="w-full px-3.5 py-2 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] resize-none"
            />
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
