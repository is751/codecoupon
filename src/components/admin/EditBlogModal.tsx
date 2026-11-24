import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  BookOpen, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Calendar, 
  Clock, 
  User, 
  Trash2,
  AlertCircle 
} from 'lucide-react';
import { BlogPost } from '../../types/coupon';

interface EditBlogModalProps {
  isOpen: boolean;
  blog: BlogPost | null;
  onClose: () => void;
  onSave: (updatedBlog: BlogPost) => void;
}

const BLOG_CATEGORIES = [
  'Shopping Guides',
  'Tech & Gadgets',
  'Fashion & Footwear',
  'Web & Tech',
  'Hosting & Software',
  'Food & Dining',
  'Travel & Flights',
  'General Savings',
];

const GRADIENT_PRESETS = [
  { name: 'Orange-Amber', gradient: 'from-amber-500 to-orange-600' },
  { name: 'Dark Zinc', gradient: 'from-zinc-800 to-zinc-950' },
  { name: 'Indigo-Violet', gradient: 'from-indigo-600 to-violet-700' },
  { name: 'Emerald-Teal', gradient: 'from-emerald-600 to-teal-700' },
  { name: 'Rose-Pink', gradient: 'from-rose-600 to-pink-600' },
  { name: 'Blue-Cyan', gradient: 'from-blue-600 to-cyan-600' },
];

export const EditBlogModal: React.FC<EditBlogModalProps> = ({
  isOpen,
  blog,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Shopping Guides');
  const [author, setAuthor] = useState('Admin Editor');
  const [readTime, setReadTime] = useState('4 min read');
  const [publishedDate, setPublishedDate] = useState('');
  const [coverColor, setCoverColor] = useState('from-amber-500 to-orange-600');
  const [coverImage, setCoverImage] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [excerpt, setExcerpt] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (blog) {
      setTitle(blog.title || '');
      setSlug(blog.slug || '');
      setCategory(blog.category || 'Shopping Guides');
      setAuthor(blog.author || 'Admin Editor');
      setReadTime(blog.readTime || '4 min read');
      setPublishedDate(blog.publishedDate || '');
      setCoverColor(blog.coverColor || 'from-amber-500 to-orange-600');
      setCoverImage(blog.coverImage || '');
      setCoverImagePreview(blog.coverImage || null);
      setExcerpt(blog.excerpt || '');
      setBodyText(blog.content ? blog.content.join('\n\n') : '');
      setImageError(null);
    }
  }, [blog, isOpen]);

  if (!isOpen || !blog) return null;

  // Image Upload -> Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setImageError('Image size exceeds 3MB. Please choose a smaller image.');
        return;
      }
      setImageError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCoverImagePreview(base64);
        setCoverImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImagePreview(null);
    setCoverImage('');
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bodyText.trim()) return;

    const paragraphs = bodyText
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const updatedBlog: BlogPost = {
      ...blog,
      title: title.trim(),
      slug: slug.trim() || blog.slug,
      category,
      author: author.trim() || 'Admin Editor',
      readTime: readTime.trim() || '4 min read',
      publishedDate: publishedDate.trim() || blog.publishedDate,
      coverColor,
      coverImage: coverImagePreview || (coverImage.trim() ? coverImage.trim() : undefined),
      excerpt: excerpt.trim() || paragraphs[0]?.slice(0, 160) + '...',
      content: paragraphs.length > 0 ? paragraphs : [bodyText.trim()],
    };

    onSave(updatedBlog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-[#0B0F17] text-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0E131F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6600] flex items-center justify-center border border-orange-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading text-white">
                  Edit Blog Post / Guide
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-[#FF6600] border border-orange-500/30">
                  ID: {blog.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Update article title, category, savings content, and cover theme.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Blog Article Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          {/* Slug & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6600] cursor-pointer"
              >
                {BLOG_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Author, Read Time, & Publish Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Author Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Read Time
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Publish Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>
          </div>

          {/* Excerpt / Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Short Excerpt / Teaser *
            </label>
            <textarea
              rows={2}
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] resize-none"
            />
          </div>

          {/* Full Article Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Article Body Content *
              </label>
              <span className="text-[11px] text-slate-400">
                Separate paragraphs with double Enter
              </span>
            </div>
            <textarea
              rows={7}
              required
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] leading-relaxed"
            />
          </div>

          {/* Cover Color & Image */}
          <div className="p-4 rounded-xl bg-[#121824] border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <ImageIcon className="w-3.5 h-3.5 text-[#FF6600]" />
              <span>Cover Card Style & Image</span>
            </label>

            {imageError && (
              <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Gradient Presets */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">
                Cover Gradient Color Theme:
              </span>
              <div className="flex flex-wrap gap-2">
                {GRADIENT_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setCoverColor(p.gradient)}
                    className={`h-7 px-3 rounded-lg bg-gradient-to-r ${p.gradient} text-[11px] font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 ${
                      coverColor === p.gradient
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0B0F17] scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Cover Image Upload */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="edit-blog-image-upload"
              />
              <label
                htmlFor="edit-blog-image-upload"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-[#FF6600]" />
                <span>Change Cover Image (Optional)</span>
              </label>

              {coverImagePreview && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700">
                    <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>
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
              <span>Save Blog Changes</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
