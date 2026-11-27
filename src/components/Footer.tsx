import React, { useState } from 'react';
import { Mail, ShieldCheck, CheckCircle2, Globe } from 'lucide-react';
import { Category, InfoPageKey } from '../types/coupon';

interface FooterProps {
  onSelectCategory: (cat: Category) => void;
  onSelectNav: (tab: 'home' | 'coupons' | 'deals' | 'stores' | 'categories' | 'blog') => void;
  onNavigateInfo: (page: InfoPageKey) => void;
  onSubscribe?: (email: string) => void;
  onOpenAdminPortal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onSelectNav,
  onNavigateInfo,
  onSubscribe,
  onOpenAdminPortal,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newsletterEmail.trim();
    if (!cleaned) return;
    if (onSubscribe) onSubscribe(cleaned);
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 4500);
  };

  const handleInfoLink = (e: React.MouseEvent, page: InfoPageKey) => {
    e.preventDefault();
    onNavigateInfo(page);
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
                Code<span className="text-[#FF6600]">Coupon</span>
              </span>
            </button>
            <p className="text-slate-400 text-xs leading-relaxed">
              Independent international coupon and promotions directory on codecoupon.com. All active deals display regional availability, offer terms, and clear expiration dates.
            </p>
          </div>

          {/* Join Our Newsletter Right */}
          <div className="max-w-lg w-full space-y-2">
            <h3 className="text-sm font-bold text-white font-heading">
              Join Our Deal Alerts
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive active coupon updates, seasonal store promotions, and clear expiration reminders in your inbox.
            </p>

            {newsletterSubscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you for subscribing to CodeCoupon deal updates.</span>
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

        {/* 4-Columns Grid: Categories, Quick Links, Information, and Contact & Compliance */}
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
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectNav('home');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/coupons"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectNav('coupons');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Promo Codes & Coupons
                </a>
              </li>
              <li>
                <a
                  href="/deals"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectNav('deals');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Direct Sales & Deals
                </a>
              </li>
              <li>
                <a
                  href="/stores"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectNav('stores');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Partner Stores Directory
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectNav('blog');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Shopping Guides
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleInfoLink(e, 'about')}
                  className="hover:text-white transition-colors"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Company & Policies
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleInfoLink(e, 'about')}
                  className="hover:text-white transition-colors"
                >
                  About CodeCoupon
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  onClick={(e) => handleInfoLink(e, 'privacy')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => handleInfoLink(e, 'terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="/affiliate-disclosure"
                  onClick={(e) => handleInfoLink(e, 'affiliate')}
                  className="hover:text-white transition-colors"
                >
                  Affiliate Disclosure
                </a>
              </li>
              <li>
                <a
                  href="/verification-policy"
                  onClick={(e) => handleInfoLink(e, 'verification')}
                  className="hover:text-white transition-colors"
                >
                  Coupon Review Policy
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleInfoLink(e, 'contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Business Details */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Contact & Support
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-[#FF6600] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Official Website</span>
                  <a
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectNav('home');
                    }}
                    className="text-white hover:text-[#FF6600] font-semibold transition-colors"
                  >
                    codecoupon.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#FF6600] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Support & Partnerships</span>
                  <a
                    href="mailto:codecoupon.social@gmail.com"
                    className="text-white hover:text-[#FF6600] font-semibold transition-colors break-all"
                  >
                    codecoupon.social@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <a
                    href="/contact"
                    onClick={(e) => handleInfoLink(e, 'contact')}
                    className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
                  >
                    Open Contact Form &rarr;
                  </a>
                  <span className="text-slate-400 text-[11px] block mt-0.5">
                    Typical reply within 1–2 business days
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer & Affiliate Disclosure Statements */}
        <div className="space-y-4 pt-2 text-slate-400 text-xs leading-relaxed border-b border-slate-800/80 pb-8">
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1 font-heading">
              Affiliate Disclosure
            </h5>
            <p>
              CodeCoupon (<span className="text-slate-200 font-medium">codecoupon.com</span>)
              contains affiliate links. When you click an outbound offer button and complete a
              qualifying purchase on a partner merchant site, we may earn an affiliate commission at
              no extra cost to you. Read our full{' '}
              <a
                href="/affiliate-disclosure"
                onClick={(e) => handleInfoLink(e, 'affiliate')}
                className="text-orange-400 hover:underline"
              >
                Affiliate Disclosure
              </a>
              .
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1 font-heading">
              Offer Terms Notice
            </h5>
            <p>
              Promotions remain subject to each merchant’s exclusions, regional restrictions, and
              expiration schedule. Expired listings are automatically removed from active pages.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            Copyright {new Date().getFullYear()} &copy;{' '}
            <span className="text-slate-300 font-semibold">CodeCoupon</span> (codecoupon.com). All
            Rights Reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/privacy-policy"
              onClick={(e) => handleInfoLink(e, 'privacy')}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="/terms"
              onClick={(e) => handleInfoLink(e, 'terms')}
              className="hover:text-slate-300 transition-colors"
            >
              Terms
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="mailto:codecoupon.social@gmail.com"
              className="hover:text-slate-300 transition-colors"
            >
              codecoupon.social@gmail.com
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
    </footer>
  );
};
