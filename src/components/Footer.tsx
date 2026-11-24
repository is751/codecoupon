import React, { useState } from 'react';
import { Phone, Mail, ShieldCheck, CheckCircle2, X, FileText } from 'lucide-react';
import { Category } from '../types/coupon';

interface FooterProps {
  onSelectCategory: (cat: Category) => void;
  onSelectNav: (tab: 'home' | 'coupons' | 'deals' | 'stores' | 'categories' | 'blog') => void;
  onSubscribe?: (email: string) => void;
  onOpenAdminPortal?: () => void;
}

type PolicyKey = 'terms' | 'privacy' | 'verification' | 'affiliate' | 'cookies';

const POLICY_CONTENT: Record<PolicyKey, { title: string; summary: string; points: string[] }> = {
  terms: {
    title: 'Terms & Conditions',
    summary: 'By browsing and redeeming coupons on CodeCoupon, you agree to the standard usage terms below.',
    points: [
      'Promo codes and direct deals are subject to each partner retailer’s checkout rules, exclusions, and expiration windows.',
      'CodeCoupon verifies discounts regularly but cannot guarantee price adjustments after an order has been completed.',
      'Automated scraping or bulk commercial redistribution of curated deal feeds without permission is prohibited.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    summary: 'We respect your privacy and collect minimal information required to deliver deal alerts and account preferences.',
    points: [
      'Newsletter email addresses are used strictly to deliver verified promo alerts and weekly deal roundups.',
      'We do not sell or rent shopper email addresses or personal profile details to third-party data brokers.',
      'Browser storage is used locally to remember your coupon feedback votes and saved preferences.',
    ],
  },
  verification: {
    title: 'Coupon Verification Policy',
    summary: 'Our editorial team tests and monitors listed coupon codes using strict quality checks.',
    points: [
      'Every featured coupon code is tested against live retailer checkouts before receiving a Verified status.',
      'Community votes (“Worked?”) and shopper reviews update success rates in real time to flag expired offers.',
      'Stores and offers that repeatedly fail validation are promptly updated or retired from active listings.',
    ],
  },
  affiliate: {
    title: 'Affiliate Disclosure',
    summary: 'Transparency matters to us and keeps CodeCoupon free for every shopper.',
    points: [
      'When you click a store link or activate a deal on CodeCoupon and complete a purchase, we may earn a small commission at zero extra cost to you.',
      'Affiliate partnerships never affect coupon rankings—deals are ordered by verified savings and shopper success rate.',
    ],
  },
  cookies: {
    title: 'Cookie & Storage Preferences',
    summary: 'Essential browser storage keeps filters, votes, and preferences working smoothly.',
    points: [
      'Essential Local Storage: Preserves your voted coupons, submitted reviews, and session login state.',
      'Preference Storage: Remembers your selected filters and newsletter opt-in confirmation.',
    ],
  },
};

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onSelectNav,
  onSubscribe,
  onOpenAdminPortal,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newsletterEmail.trim();
    if (!cleaned) return;
    if (onSubscribe) onSubscribe(cleaned);
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 4500);
  };

  return (
    <footer className="bg-[#0B0F17] text-slate-300 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Top Section: Brand Overview & Join Our Newsletter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-slate-800/80">
          
          {/* Brand Left */}
          <div className="max-w-md space-y-3">
            <button
              type="button"
              onClick={() => onSelectNav('home')}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src="/assets/aistudio/Codecoupon_Logo_on_Dark_Canvas_73907f6d.png"
                  alt="CodeCoupon"
                  className="w-full h-full object-contain scale-110"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-heading">
                Code<span className="text-[#FF6600]">coupon</span>
              </span>
            </button>
            <p className="text-slate-400 text-xs leading-relaxed">
              Disclosure: When you buy through links on our site, we may earn an affiliate commission at no extra cost to you. Hand-tested promo codes verified daily.
            </p>
          </div>

          {/* Join Our Newsletter Right */}
          <div className="max-w-lg w-full space-y-2">
            <h3 className="text-sm font-bold text-white font-heading">
              Join Our Newsletter
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verified promo alerts, seasonal tech & fashion markdowns, and exclusive coupon codes delivered straight to your inbox.
            </p>

            {newsletterSubscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you for subscribing! Check your email for exclusive deals.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-stretch gap-2 pt-1">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>

        {/* 4-Columns Grid: Categories, Quick Links, Information, and Let's Connect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          
          {/* Column 1: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Categories
            </h4>
            <ul className="space-y-2 text-slate-400">
              {(['Tech & Electronics', 'Fashion & Apparel', 'Hosting & Software', 'Food & Dining', 'Travel & Flights'] as Category[]).map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Quick Links
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectNav('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectNav('coupons')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Verified Coupons
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectNav('deals')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Direct Deals & Sales
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectNav('stores')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Top Brand Stores
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectNav('blog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Savings Blog & Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Information
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button type="button" onClick={() => setActivePolicy('terms')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActivePolicy('privacy')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActivePolicy('verification')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Coupon Verification Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActivePolicy('affiliate')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Affiliate Disclosure
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActivePolicy('cookies')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Let's Connect */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Let's Connect
            </h4>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold text-xs transition-colors"
                title="Facebook"
              >
                f
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center font-bold text-xs transition-colors"
                title="Twitter / X"
              >
                𝕏
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-600 hover:opacity-90 text-white flex items-center justify-center font-bold text-xs transition-opacity"
                title="Instagram"
              >
                ig
              </a>
              <a 
                href="https://pinterest.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold text-xs transition-colors"
                title="Pinterest"
              >
                P
              </a>
            </div>

            {/* Contact Phone & Email */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#FF6600] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact :</span>
                  <a 
                    href="tel:+923201214764" 
                    className="text-white hover:text-[#FF6600] font-bold tracking-wide transition-colors font-mono"
                  >
                    +92 3201214764
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#FF6600] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Email :</span>
                  <a 
                    href="mailto:info@codescoupons.com" 
                    className="text-white hover:text-[#FF6600] font-semibold transition-colors"
                  >
                    info@codescoupons.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-400 text-[11px]">
                  Customer Support: Mon - Sat (9am - 8pm PKT)
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Disclaimer & Disclosure Statements */}
        <div className="space-y-4 pt-2 text-slate-400 text-xs leading-relaxed border-b border-slate-800/80 pb-8">
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1 font-heading">
              Disclaimer
            </h5>
            <p>
              Our website contains affiliate links that may earn us a small commission from your purchases at no extra cost to you. We remain committed to providing honest, verified savings guides regardless of compensation.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1 font-heading">
              Disclosure
            </h5>
            <p>
              When you buy a product or service through links on{' '}
              <span className="text-slate-200 font-medium">codescoupons.com</span>, we may earn an affiliate commission.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            Copyright {new Date().getFullYear()} &copy; <span className="text-slate-300 font-semibold">Codecoupon</span>. All Rights Reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a href="tel:+923201214764" className="hover:text-slate-300 transition-colors">
              Phone: +92 3201214764
            </a>
            <span aria-hidden="true">·</span>
            <a href="mailto:info@codescoupons.com" className="hover:text-slate-300 transition-colors">
              info@codescoupons.com
            </a>
            {onOpenAdminPortal && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={onOpenAdminPortal}
                  className="hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Admin Portal
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Policy Information Modal */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="bg-[#0B0F17] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#FF6600]" />
                <h3 className="text-base font-bold font-heading">{POLICY_CONTENT[activePolicy].title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {POLICY_CONTENT[activePolicy].summary}
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600">
                {POLICY_CONTENT[activePolicy].points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600] mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#FF6600] hover:bg-[#FA5A00] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
