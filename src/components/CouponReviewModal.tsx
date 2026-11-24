import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ThumbsUp, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { Coupon, CouponReview } from '../types/coupon';

interface CouponReviewModalProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (couponId: string, review: Omit<CouponReview, 'id' | 'couponId' | 'helpfulCount'>) => void;
}

export const CouponReviewModal: React.FC<CouponReviewModalProps> = ({
  coupon,
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [worked, setWorked] = useState<boolean>(true);
  const [comment, setComment] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [savingsAmount, setSavingsAmount] = useState<string>('$20.00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon || !comment.trim()) return;

    onSubmitReview(coupon.id, {
      author: author.trim() || 'Verified Shopper',
      rating,
      worked,
      comment: comment.trim(),
      date: 'Just now',
      savingsAmount: worked ? savingsAmount.trim() : undefined,
    });

    setComment('');
    onClose();
  };

  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Shopper Reviews & Verification</span>
          </div>
          <h2 className="text-lg font-bold font-heading text-white">
            {coupon.store}: {coupon.discountBadge}
          </h2>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
            {coupon.title}
          </p>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Rating Summary Bar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {coupon.averageRating.toFixed(1)}
                </span>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(coupon.averageRating)
                          ? 'fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                Based on {coupon.reviews?.length || 0} community reviews
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-emerald-700 font-bold block">
                {coupon.successRate}% Success Rate
              </span>
              <span className="text-[11px] text-slate-500">
                {coupon.verifiedText}
              </span>
            </div>
          </div>

          {/* Write a Review Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
              Write Your Review
            </h3>

            {/* Interactive Star Picker */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Your Overall Rating:
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {hoverRating || rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Success Status Toggle */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Did this coupon work for you?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWorked(true)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    worked
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yes, It Worked!</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWorked(false)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    !worked
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Did Not Work</span>
                </button>
              </div>
            </div>

            {/* Savings Amount (if worked) */}
            {worked && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Estimated Amount You Saved (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">$</span>
                  <input
                    type="text"
                    value={savingsAmount}
                    onChange={(e) => setSavingsAmount(e.target.value)}
                    placeholder="e.g. $25.00"
                    className="w-full text-xs font-semibold pl-6 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            {/* Author Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Your Name / Nickname
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Alex M. or Anonymous"
                className="w-full text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Your Experience & Feedback *
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Mention what items you purchased, whether you were signed in, or if special conditions applied..."
                className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              Submit Rating & Review
            </button>
          </form>

          {/* Past Community Reviews List */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
              Community Reviews ({coupon.reviews?.length || 0})
            </h4>

            {coupon.reviews && coupon.reviews.length > 0 ? (
              <div className="space-y-3">
                {coupon.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rev.author}</span>
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>

                    <p className="text-slate-700 leading-relaxed">{rev.comment}</p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        {rev.worked ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Worked
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                        {rev.savingsAmount && (
                          <span className="text-emerald-800 font-mono font-bold">
                            · Saved {rev.savingsAmount}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400">
                        {rev.helpfulCount} people found this helpful
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Be the first shopper to review this coupon!
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
