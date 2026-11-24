import React, { useState } from 'react';
import { BookOpen, Clock, Calendar, User, ArrowRight, X, Sparkles } from 'lucide-react';
import { BlogPost } from '../types/coupon';
import { BLOG_POSTS } from '../data/blogs';

interface BlogSectionProps {
  blogs?: BlogPost[];
  onBackToDeals?: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ blogs, onBackToDeals }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const postsToRender = blogs && blogs.length > 0 ? blogs : BLOG_POSTS;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Blog Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF6600] uppercase tracking-wider font-heading">
              <BookOpen className="w-4 h-4" />
              <span>Smart Shopping & Savings Guides</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading">
              CodeCoupon Blog & Insider Tips
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Expert advice, coupon stacking strategies, and seasonal price-drop guides to help you save maximum money on every purchase.
            </p>
          </div>

          {onBackToDeals && (
            <button
              onClick={onBackToDeals}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Browse All Deals
            </button>
          )}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {postsToRender.map((post) => (
          <article
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="bg-white rounded-2xl border border-slate-200 hover:border-orange-300 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Optional Cover image / header strip */}
              {post.coverImage ? (
                <div className="h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : post.coverColor ? (
                <div className={`h-20 w-full bg-gradient-to-r ${post.coverColor} opacity-90`} />
              ) : null}

              <div className="p-6 pb-2">
                {/* Category banner */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="font-bold text-[#FF6600]">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#FF6600] transition-colors leading-snug font-heading mb-2">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
              </div>
            </div>

            {/* Author and Date row */}
            <div className="p-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-700">
                  {post.author ? post.author[0] : 'C'}
                </div>
                <span>{post.author}</span>
              </div>

              <div className="flex items-center gap-1 font-semibold text-[#FF6600] group-hover:translate-x-0.5 transition-transform">
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Full Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
            role="dialog"
          >
            {/* Modal Image if available */}
            {selectedPost.coverImage && (
              <div className="h-48 w-full bg-slate-900 overflow-hidden relative">
                <img
                  src={selectedPost.coverImage}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Modal Header */}
            <div className="bg-[#0B0F17] text-white p-6 relative">
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-xs font-bold text-[#FF6600] uppercase tracking-wider block mb-1">
                {selectedPost.category} · {selectedPost.readTime}
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-heading text-white leading-tight">
                {selectedPost.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                <span>By {selectedPost.author}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedPost.publishedDate}</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-4 max-h-[70vh] overflow-y-auto text-sm text-slate-700 leading-relaxed">
              <p className="text-base font-medium text-slate-900 italic border-l-2 border-[#FF6600] pl-4 py-1">
                {selectedPost.excerpt}
              </p>

              {selectedPost.content.map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}

              <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200/80 text-xs text-orange-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#FF6600] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Coupon Shopping Tip</span>
                  Always verify current coupon expiration dates and terms before completing checkout.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
