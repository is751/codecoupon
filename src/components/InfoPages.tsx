import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  Info,
  Mail,
  Send,
  ShieldCheck,
  FileText,
  Scale,
  Handshake,
} from 'lucide-react';
import { InfoPageKey } from '../types/coupon';

interface InfoPagesProps {
  page: InfoPageKey;
  onBack: () => void;
  onSelectPage: (page: InfoPageKey) => void;
  onOpenStores?: () => void;
  onContactSubmit?: (payload: {
    name: string;
    email: string;
    topic: string;
    message: string;
  }) => void;
}

const INFO_NAV: { key: InfoPageKey; label: string; href: string }[] = [
  { key: 'about', label: 'About Us', href: '/about' },
  { key: 'verification', label: 'Coupon Review Policy', href: '/verification-policy' },
  { key: 'affiliate', label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
  { key: 'privacy', label: 'Privacy Policy', href: '/privacy-policy' },
  { key: 'terms', label: 'Terms & Conditions', href: '/terms' },
  { key: 'contact', label: 'Contact Us', href: '/contact' },
];

export const InfoPages: React.FC<InfoPagesProps> = ({
  page,
  onBack,
  onSelectPage,
  onOpenStores,
  onContactSubmit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Merchant & Affiliate Partnership');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    if (onContactSubmit) {
      onContactSubmit({
        name: name.trim(),
        email: email.trim(),
        topic,
        message: message.trim(),
      });
    }
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  const pageMeta: Record<
    InfoPageKey,
    { title: string; subtitle: string; icon: React.ReactNode; updated: string }
  > = {
    about: {
      title: 'About CodeCoupon',
      subtitle:
        'An independent international coupon and merchant promotions directory focused on clear terms, active offers, and transparent affiliate disclosure.',
      icon: <Building2 className="w-6 h-6 text-[#FF6600]" />,
      updated: 'November 2026',
    },
    contact: {
      title: 'Contact Us',
      subtitle:
        'Reach our editorial and merchant partnerships desk for offer updates, affiliate inquiries, or technical support.',
      icon: <Mail className="w-6 h-6 text-[#FF6600]" />,
      updated: 'November 2026',
    },
    privacy: {
      title: 'Privacy Policy',
      subtitle:
        'How CodeCoupon handles browsing preferences, newsletter signups, and outbound merchant links across codecoupon.com.',
      icon: <ShieldCheck className="w-6 h-6 text-[#FF6600]" />,
      updated: 'November 2026',
    },
    terms: {
      title: 'Terms & Conditions',
      subtitle:
        'Standard terms governing use of the CodeCoupon directory, listed promotional codes, and external retailer websites.',
      icon: <Scale className="w-6 h-6 text-[#FF6600]" />,
      updated: 'November 2026',
    },
    affiliate: {
      title: 'Affiliate Disclosure',
      subtitle:
        'Clear disclosure of how CodeCoupon earns affiliate commissions through partner links without adding cost to shoppers.',
      icon: <Handshake className="w-6 h-6 text-[#FF6600]" />,
      updated: 'November 2026',
    },
    verification: {
      title: 'Coupon Review & Expiry Policy',
      subtitle:
        'How we review promo codes, present minimum spend requirements and exclusions, and automatically retire expired offers.',
      icon: <FileText className="w-6 h-6 text-[#FF6600]" />,
      updated: 'November 2026',
    },
  };

  const currentMeta = pageMeta[page];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-[#FF6600] transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Deals</span>
          </button>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <span className="font-semibold text-slate-900">{currentMeta.title}</span>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Last updated: {currentMeta.updated} · codecoupon.com
        </span>
      </div>

      {/* Dark Hero Header */}
      <div className="bg-[#0B0F17] text-white rounded-2xl border border-slate-800 p-6 sm:p-10 shadow-md relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
            {currentMeta.icon}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            {currentMeta.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Split Layout: Sidebar Navigation + Main Document Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 pb-2 border-b border-slate-100">
              Information & Policies
            </h2>
            {INFO_NAV.map((item) => {
              const isActive = item.key === page;
              return (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectPage(item.key);
                  }}
                  className={`block px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#FF6600] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="bg-[#0B0F17] text-white rounded-2xl border border-slate-800 p-5 space-y-3">
            <h3 className="text-sm font-bold font-heading">Business & Editorial Contact</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              For affiliate network inquiries, merchant updates, or reporting an expired promotion:
            </p>
            <a
              href="mailto:codecoupon.social@gmail.com"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6600] hover:text-orange-400 break-all"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>codecoupon.social@gmail.com</span>
            </a>
          </div>
        </aside>

        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          {page === 'about' && (
            <>
              <section className="space-y-3">
                <h2 className="text-lg font-extrabold text-slate-900 font-heading">
                  What CodeCoupon Does
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  CodeCoupon (<strong className="text-slate-900">codecoupon.com</strong>) is an
                  online coupon and promotions directory built to help shoppers locate active
                  discount codes, seasonal retailer sales, and transparent offer terms before they
                  reach checkout.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Unlike coupon sites that display inflated click counters, fabricated star ratings,
                  or expired codes to attract clicks, CodeCoupon removes outdated listings
                  automatically and states key terms—such as minimum spend thresholds, member
                  eligibility, and valid regions—directly on each offer.
                </p>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <Clock className="w-4 h-4 text-[#FF6600]" />
                  <h3 className="text-xs font-bold text-slate-900">Automatic Expiry Control</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every dated promotion is tracked against its end date and automatically hidden
                    from active listings once expired.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <Globe className="w-4 h-4 text-[#FF6600]" />
                  <h3 className="text-xs font-bold text-slate-900">Country Targeting</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Offers are tagged with regional eligibility so shoppers in the US, UK, Canada,
                    Australia, EU, UAE, India, or Pakistan see relevant deals.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF6600]" />
                  <h3 className="text-xs font-bold text-slate-900">Clear Offer Terms</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Exclusions, minimum order rules, and renewal terms are presented alongside
                    official merchant links.
                  </p>
                </div>
              </div>

              <section className="space-y-2.5 pt-2 border-t border-slate-100">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  How We Operate & Disclose Partnerships
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  CodeCoupon participates in affiliate marketing programs with merchants and
                  affiliate networks. When you click an outbound offer button and complete an
                  eligible purchase on a partner website, CodeCoupon may earn a commission at no
                  additional cost to you. Our{' '}
                  <a
                    href="/affiliate-disclosure"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectPage('affiliate');
                    }}
                    className="text-orange-600 font-semibold hover:underline"
                  >
                    Affiliate Disclosure
                  </a>{' '}
                  and{' '}
                  <a
                    href="/verification-policy"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectPage('verification');
                    }}
                    className="text-orange-600 font-semibold hover:underline"
                  >
                    Coupon Review Policy
                  </a>{' '}
                  provide full details.
                </p>
              </section>

              {onOpenStores && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenStores}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Browse Partner Stores Directory
                  </button>
                </div>
              )}
            </>
          )}

          {page === 'contact' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Direct Email Desk
                  </span>
                  <span className="text-xs text-slate-600">
                    General inquiries, merchant campaigns, and compliance requests
                  </span>
                </div>
                <a
                  href="mailto:codecoupon.social@gmail.com"
                  className="text-xs font-bold text-orange-600 hover:underline font-mono"
                >
                  codecoupon.social@gmail.com
                </a>
              </div>

              {submitted ? (
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Message Received</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you for contacting CodeCoupon. Our team reviews incoming messages and
                    typically responds via email within 1 to 2 business days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-emerald-700 underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#FF6600]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#FF6600]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Topic
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#FF6600]"
                    >
                      <option value="Merchant & Affiliate Partnership">
                        Merchant & Affiliate Partnership
                      </option>
                      <option value="Report an Expired or Invalid Offer">
                        Report an Expired or Invalid Offer
                      </option>
                      <option value="Update Store Information">Update Store Information</option>
                      <option value="Privacy or Legal Request">Privacy or Legal Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Include store name, coupon code, or inquiry details..."
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#FF6600] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {page === 'privacy' && (
            <div className="space-y-5 text-xs sm:text-sm text-slate-600">
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  1. Information We Collect
                </h2>
                <p>
                  CodeCoupon (<strong className="text-slate-900">codecoupon.com</strong>) minimizes
                  data collection. Browsing public coupon listings and store pages does not require
                  account registration. If you voluntarily subscribe to email alerts or submit the
                  contact form, we collect only the name, email address, and message you provide.
                </p>
              </section>
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  2. Local Browser Storage & Preferences
                </h2>
                <p>
                  We use standard browser storage (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">localStorage</code>) to remember your selected country filter and newsletter confirmation state. You can clear browser storage at any time through your browser settings.
                </p>
              </section>
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  3. Outbound Merchant Links & Affiliate Tracking
                </h2>
                <p>
                  When you click a merchant link, “Show & Copy Code”, or “Activate Deal” button,
                  your browser navigates to an external retailer website. Affiliate networks and
                  participating merchants may use referral parameters or cookies on their domains to
                  attribute qualifying purchases. Once you leave codecoupon.com, the destination
                  merchant’s privacy policy governs your visit.
                </p>
              </section>
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  4. Data Sharing & Your Rights
                </h2>
                <p>
                  We do not sell or rent user email addresses to third-party data brokers. To
                  request removal of your email from deal alerts or ask privacy questions, write to{' '}
                  <a href="mailto:codecoupon.social@gmail.com" className="text-orange-600 font-semibold hover:underline">
                    codecoupon.social@gmail.com
                  </a>
                  .
                </p>
              </section>
            </div>
          )}

          {page === 'terms' && (
            <div className="space-y-5 text-xs sm:text-sm text-slate-600">
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using <strong className="text-slate-900">codecoupon.com</strong>,
                  you agree to comply with these Terms & Conditions and all applicable laws.
                </p>
              </section>
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  2. Merchant Checkout Governance
                </h2>
                <p>
                  All promo codes, voucher offers, and direct sales listed on CodeCoupon are
                  issued by independent third-party merchants. Discounts are subject to each
                  merchant’s cart eligibility, regional availability, stock limits, minimum spend,
                  and early campaign termination. Always confirm the final discounted total on the
                  merchant’s checkout page before paying.
                </p>
              </section>
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  3. Permitted Use & Intellectual Property
                </h2>
                <p>
                  CodeCoupon content, site structure, and original editorial guides are protected
                  by applicable copyright law. Store names, logos, and trademarks remain the
                  property of their respective owners and are used solely to identify merchant
                  promotions. Automated scraping or unauthorized redistribution is prohibited.
                </p>
              </section>
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  4. Limitation of Liability
                </h2>
                <p>
                  CodeCoupon provides promotional listings on an “as is” basis and is not liable
                  for third-party website availability, merchant pricing changes, shipping
                  outcomes, or fulfilled orders.
                </p>
              </section>
            </div>
          )}

          {page === 'affiliate' && (
            <div className="space-y-5 text-xs sm:text-sm text-slate-600">
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 flex items-start gap-2.5 text-xs">
                <Info className="w-4 h-4 text-[#FF6600] shrink-0 mt-0.5" />
                <span>
                  <strong>Material Connection Notice:</strong> CodeCoupon participates in
                  affiliate marketing programs. When you use outbound links or promo codes listed
                  on codecoupon.com, we may earn a commission from qualifying purchases at zero
                  added cost to you.
                </span>
              </div>
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  How Affiliate Links Work
                </h2>
                <p>
                  Retailers and service providers partner with affiliate networks to reward
                  publishers for referring shoppers. Clicking an outbound merchant button on
                  CodeCoupon opens the partner retailer’s page with an affiliate tracking
                  parameter or direct merchant link. Any commission earned comes from the merchant’s
                  marketing budget—never as a surcharge on your order.
                </p>
              </section>
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  Editorial Standards
                </h2>
                <p>
                  CodeCoupon lists both direct affiliate partner promotions and publicly available
                  retailer offers when helpful to shoppers. We do not publish fake coupon usage
                  counts, fabricated ratings, or disguised advertisements.
                </p>
              </section>
            </div>
          )}

          {page === 'verification' && (
            <div className="space-y-5 text-xs sm:text-sm text-slate-600">
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  1. Offer Review Criteria
                </h2>
                <p>
                  Before publishing any promotion on CodeCoupon, our editors confirm the destination
                  merchant URL, discount scope, region eligibility, minimum order requirements, and
                  applicable terms or exclusions.
                </p>
              </section>
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  2. Expiration Tracking & Automatic Removal
                </h2>
                <p>
                  Promotions with a scheduled end date display their expiration date clearly on
                  each listing. Once a coupon passes its expiration date, CodeCoupon automatically
                  marks it expired and removes it from active public storefront feeds so visitors
                  are not misled by outdated offers.
                </p>
              </section>
              <section className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  3. Ongoing Merchant Promotions
                </h2>
                <p>
                  Retailer offers without a fixed end date (such as ongoing student savings, first-order
                  discounts, or evergreen free-shipping thresholds) are labeled clearly as ongoing
                  promotions subject to merchant availability. Report any expired code via{' '}
                  <a
                    href="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectPage('contact');
                    }}
                    className="text-orange-600 font-semibold hover:underline"
                  >
                    our Contact page
                  </a>
                  .
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
