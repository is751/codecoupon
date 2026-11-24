import React, { useState } from 'react';
import { 
  ChevronRight, 
  Flame, 
  ShieldCheck, 
  Users, 
  CheckCircle2 
} from 'lucide-react';
import { Coupon } from '../types/coupon';

interface SidebarDealsWidgetProps {
  popularCoupons: Coupon[];
  onSelectCoupon: (coupon: Coupon) => void;
  onSelectStore: (storeSlug: string) => void;
  onSubscribe: (email: string) => void;
  onViewAllDeals?: () => void;
}

export const SidebarDealsWidget: React.FC<SidebarDealsWidgetProps> = ({
  popularCoupons,
  onSelectCoupon,
  onSubscribe,
  onViewAllDeals,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const sortedPopular = [...popularCoupons]
    .sort((a, b) => (b.usesCount + b.upvotes) - (a.usesCount + a.upvotes))
    .slice(0, 5);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubscribe(email.trim());
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <aside className="space-y-6">
      
      {/* 1. Popular Deals Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#FF6600]" />
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Popular Deals
            </h3>
          </div>
          {onViewAllDeals && (
            <button
              type="button"
              onClick={onViewAllDeals}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              View All &rarr;
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {sortedPopular.map((deal) => (
            <button
              type="button"
              key={deal.id}
              onClick={() => onSelectCoupon(deal)}
              className="w-full py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 -mx-2 rounded-lg cursor-pointer transition-colors group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg ${deal.storeLogoBg} text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-xs overflow-hidden`}
                >
                  {(deal.logoUrl || deal.storeLogoUrl) ? (
                    <img
                      src={deal.logoUrl || deal.storeLogoUrl}
                      alt={deal.store}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-1 bg-white"
                    />
                  ) : (
                    deal.storeLogoText.slice(0, 4)
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-orange-600 transition-colors">
                    {deal.store}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {deal.discountBadge}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* 2. Never Miss a Deal Newsletter Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <h4 className="text-base font-bold text-white font-heading">
            Never Miss a Deal!
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Get the latest coupons & exclusive offers delivered straight to your inbox.
          </p>

          {subscribed ? (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>You’re subscribed! Check your inbox for exclusive alerts.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-xl placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 3. Three Trust Badges */}
      <div className="grid grid-cols-3 gap-2 text-center pt-2">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <Users className="w-4 h-4 text-slate-700 mx-auto mb-1" />
          <div className="text-[11px] font-bold text-slate-900">Trusted</div>
          <div className="text-[10px] text-slate-400">by Shoppers</div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <div className="text-[11px] font-bold text-slate-900">Safe & Secure</div>
          <div className="text-[10px] text-slate-400">Shopping</div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-orange-500 mx-auto mb-1" />
          <div className="text-[11px] font-bold text-slate-900">Verified</div>
          <div className="text-[10px] text-slate-400">Coupons</div>
        </div>
      </div>

    </aside>
  );
};
