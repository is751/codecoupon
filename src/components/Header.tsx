import React, { useState } from 'react';
import { Search, User, LogOut, Menu, X, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenLogin: () => void;
  onOpenBackendLogin: () => void;
  onLogout: () => void;
  currentUser: { name: string; email: string; role?: 'admin' | 'shopper' } | null;
  activeTab: 'home' | 'coupons' | 'deals' | 'stores' | 'categories' | 'blog';
  setActiveTab: (tab: 'home' | 'coupons' | 'deals' | 'stores' | 'categories' | 'blog') => void;
  onResetFilters: () => void;
  onFocusSearch: () => void;
  onOpenAdmin: () => void;
}

const NAV_ITEMS: { key: 'home' | 'coupons' | 'deals' | 'stores' | 'categories' | 'blog'; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'coupons', label: 'Coupons' },
  { key: 'deals', label: 'Deals' },
  { key: 'stores', label: 'Stores' },
  { key: 'categories', label: 'Categories' },
  { key: 'blog', label: 'Blog' },
];

export const Header: React.FC<HeaderProps> = ({
  onOpenLogin,
  onOpenBackendLogin,
  onLogout,
  currentUser,
  activeTab,
  setActiveTab,
  onResetFilters,
  onFocusSearch,
  onOpenAdmin,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'home' | 'coupons' | 'deals' | 'stores' | 'categories' | 'blog') => {
    setIsMobileMenuOpen(false);
    setActiveTab(tab);
    if (tab === 'home') {
      onResetFilters();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17] border-b border-slate-800 text-white transition-all shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus-visible:outline-none shrink-0"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="/assets/aistudio/Codecoupon_Logo_on_Dark_Canvas_73907f6d.png"
              alt="CodeCoupon"
              className="w-full h-full object-contain scale-110"
            />
          </div>
          <span className="text-xl font-black tracking-tight text-white whitespace-nowrap font-heading">
            Code<span className="text-[#FF6600]">coupon</span>
          </span>
        </button>

        {/* Zone 2: Public Storefront Navigation (Admin button removed per request) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === item.key
                  ? 'text-[#FF6600] border-[#FF6600]'
                  : 'border-transparent hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Search, Account & Mobile Drawer Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onFocusSearch}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Search coupons"
            aria-label="Search coupons"
          >
            <Search className="w-4 h-4" />
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              {currentUser.role === 'admin' ? (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
                  title="Return to Admin Portal"
                >
                  <User className="w-3.5 h-3.5 text-[#FF6600]" />
                  <span className="truncate max-w-[100px]">{currentUser.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-[#FF6600] font-bold">
                    Admin
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenBackendLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                  title="Sign in to Admin Backend Dashboard"
                >
                  <User className="w-3.5 h-3.5 text-[#FF6600]" />
                  <span className="truncate max-w-[110px]">{currentUser.name}</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-[#FF6600] font-bold">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Backend
                  </span>
                </button>
              )}
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-800"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>
          )}

          {/* Mobile/Tablet Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0E131F] border-t border-slate-800 px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === item.key
                  ? 'bg-[#FF6600]/15 text-[#FF6600] font-bold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
