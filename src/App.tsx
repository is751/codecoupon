import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TopStoresGrid } from './components/TopStoresGrid';
import { FeaturedDealsSection } from './components/FeaturedDealsSection';
import { ShopByCategoryGrid } from './components/ShopByCategoryGrid';
import { SidebarDealsWidget } from './components/SidebarDealsWidget';
import { StorePage } from './components/StorePage';
import { StoresDirectoryPage } from './components/StoresDirectoryPage';
import { CouponDetailPage } from './components/CouponDetailPage';
import { BlogSection } from './components/BlogSection';
import { InfoPages } from './components/InfoPages';
import { CouponCard } from './components/CouponCard';
import { CouponModal } from './components/CouponModal';
import { LoginModal } from './components/LoginModal';
import { DealControlsBar } from './components/DealControlsBar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { SavingsChatWidget } from './components/SavingsChatWidget';
import { AdminDashboard } from './components/admin/AdminDashboard';

import { INITIAL_COUPONS, STORES_DATA } from './data/coupons';
import { BLOG_POSTS } from './data/blogs';
import { getAdminCredentials } from './data/adminAuth';
import {
  Category,
  Coupon,
  DealType,
  InfoPageKey,
  SortOption,
  StoreInfo,
  BlogPost,
} from './types/coupon';
import { CountryFilter, matchesCountryFilter } from './utils/countries';
import { computeHoursLeftFromDate, isCouponExpired } from './utils/expiry';
import { resolveMerchantUrl } from './utils/url';
import { Search, RotateCcw, ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

const STORAGE_KEY_COMMUNITY = 'codecoupon_community_items';
const STORAGE_KEY_STORES = 'codecoupon_custom_stores';
const STORAGE_KEY_USER = 'codecoupon_current_user';
const STORAGE_KEY_AUTH_TOKEN = 'codecoupon_auth_token';
const STORAGE_KEY_COUPONS = 'codecoupon_all_coupons';
const STORAGE_KEY_BLOGS = 'codecoupon_blog_posts';
const STORAGE_KEY_COUNTRY = 'codecoupon_country_filter';

const INFO_PAGE_PATHS: Record<InfoPageKey, string> = {
  about: '/about',
  contact: '/contact',
  privacy: '/privacy-policy',
  terms: '/terms',
  affiliate: '/affiliate-disclosure',
  verification: '/verification-policy',
};

const PATH_TO_INFO_PAGE: Record<string, InfoPageKey> = {
  '/about': 'about',
  '/about-us': 'about',
  '/contact': 'contact',
  '/contact-us': 'contact',
  '/privacy-policy': 'privacy',
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/terms-and-conditions': 'terms',
  '/affiliate-disclosure': 'affiliate',
  '/verification-policy': 'verification',
};

interface AuthUser {
  name: string;
  email: string;
  role?: 'admin' | 'shopper';
  token?: string;
}

function normalizeCoupon(raw: Coupon): Coupon {
  const expired = isCouponExpired(raw.expiryDate, raw.isExpired);
  return {
    ...raw,
    isExpired: expired,
    verifiedText: expired ? 'Expired' : raw.verifiedText || 'Checked Nov 2026',
    countries: raw.countries && raw.countries.length > 0 ? raw.countries : ['GLOBAL'],
    terms: Array.isArray(raw.terms) ? raw.terms : [],
  };
}

function normalizeCoupons(list: Coupon[]): Coupon[] {
  return list.map(normalizeCoupon);
}

function getSavedAdminSession(): boolean {
  try {
    const savedToken =
      localStorage.getItem(STORAGE_KEY_AUTH_TOKEN) ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('token');
    if (savedToken && savedToken.trim().length > 0) {
      return true;
    }

    const directRole = localStorage.getItem('role');
    if (directRole === 'admin') {
      return true;
    }

    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (storedUser) {
      const parsed = JSON.parse(storedUser) as AuthUser | null;
      if (parsed?.role === 'admin' || Boolean(parsed?.token)) {
        return true;
      }
    }
  } catch {
    // ignore storage errors
  }
  return false;
}

export default function App() {
  // Stores state
  const [stores, setStores] = useState<Record<string, StoreInfo>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_STORES);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return STORES_DATA;
  });

  // Coupons list state (automatically marks expired coupons)
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const allStored = localStorage.getItem(STORAGE_KEY_COUPONS);
      if (allStored) {
        return normalizeCoupons(JSON.parse(allStored));
      }
      const stored = localStorage.getItem(STORAGE_KEY_COMMUNITY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return normalizeCoupons([...parsed, ...INITIAL_COUPONS]);
      }
    } catch {
      // fallback
    }
    return normalizeCoupons(INITIAL_COUPONS);
  });

  // Periodically check and automatically expire coupons past their expiry date
  useEffect(() => {
    const syncExpiryStates = () => {
      setCoupons((prev) => {
        let changed = false;
        const next = prev.map((c) => {
          const expiredNow = isCouponExpired(c.expiryDate, c.isExpired);
          if (Boolean(c.isExpired) !== expiredNow || (expiredNow && c.verifiedText !== 'Expired')) {
            changed = true;
            return {
              ...c,
              isExpired: expiredNow,
              verifiedText: expiredNow ? 'Expired' : c.verifiedText,
            };
          }
          return c;
        });
        if (changed) {
          try {
            localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        }
        return prev;
      });
    };

    syncExpiryStates();
    const interval = window.setInterval(syncExpiryStates, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Active non-expired coupons visible on public storefront
  const activeCoupons = useMemo(
    () => coupons.filter((c) => c.verified && !isCouponExpired(c.expiryDate, c.isExpired)),
    [coupons]
  );

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      const parsed: AuthUser | null = stored ? JSON.parse(stored) : null;
      if (parsed?.role === 'admin') {
        return parsed;
      }
      if (getSavedAdminSession()) {
        const creds = getAdminCredentials();
        return {
          name: parsed?.name || creds.adminName,
          email: parsed?.email || creds.adminId,
          role: 'admin',
          token:
            parsed?.token ||
            localStorage.getItem(STORAGE_KEY_AUTH_TOKEN) ||
            localStorage.getItem('authToken') ||
            localStorage.getItem('token') ||
            undefined,
        };
      }
      return parsed;
    } catch {
      return null;
    }
  });

  // Admin portal gate form state
  const [gateId, setGateId] = useState('');
  const [gatePassword, setGatePassword] = useState('');
  const [gateError, setGateError] = useState('');

  // Blogs state
  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BLOGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return BLOG_POSTS;
  });

  // Navigation tab & pages
  const [activeTab, setActiveTab] = useState<
    'home' | 'coupons' | 'deals' | 'stores' | 'categories' | 'blog'
  >('home');
  const [activeInfoPage, setActiveInfoPage] = useState<InfoPageKey | null>(null);
  const [activeStoreSlug, setActiveStoreSlug] = useState<string | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  // Filters, Country Targeting & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedCountry, setSelectedCountry] = useState<CountryFilter>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COUNTRY);
      if (saved) return saved as CountryFilter;
    } catch {
      // ignore
    }
    return 'ALL';
  });
  const [dealType, setDealType] = useState<DealType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COUNTRY, selectedCountry);
    } catch {
      // ignore
    }
  }, [selectedCountry]);

  // View mode
  const [viewMode, setViewMode] = useState<'website' | 'admin'>(() =>
    getSavedAdminSession() ? 'admin' : 'website'
  );

  // Admin active sub-page
  const [adminTab, setAdminTab] = useState<
    | 'dashboard'
    | 'coupons'
    | 'sort-coupons'
    | 'stores'
    | 'blogs'
    | 'categories'
    | 'affiliates'
    | 'analytics'
    | 'users'
    | 'settings'
  >('dashboard');

  // Modals
  const [activeCouponModal, setActiveCouponModal] = useState<Coupon | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; subMessage?: string } | null>(null);

  const isInitialMountRef = useRef(true);

  const getStoreUrlPath = (slug: string): string => {
    const clean = slug.trim().toLowerCase();
    return clean.endsWith('-promo-code') ? `/${clean}` : `/${clean}-promo-code`;
  };

  const navigatePath = (path: string, replace = false) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (window.location.pathname !== normalized || window.location.hash) {
      if (replace) {
        window.history.replaceState(null, '', normalized);
      } else {
        window.history.pushState(null, '', normalized);
      }
    }
  };

  useEffect(() => {
    const resolveEffectivePath = (): string => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#/')) {
        let converted = hash.slice(1);
        if (converted.startsWith('/store/')) {
          converted = getStoreUrlPath(converted.replace('/store/', ''));
        }
        window.history.replaceState(null, '', converted || '/');
        return converted || '/';
      }
      const rawPath = window.location.pathname.replace(/\/+$/, '');
      return rawPath || '/';
    };

    const syncRouteFromLocation = () => {
      const path = resolveEffectivePath();

      if (PATH_TO_INFO_PAGE[path]) {
        setActiveInfoPage(PATH_TO_INFO_PAGE[path]);
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setViewMode('website');
      } else if (path.startsWith('/coupon/')) {
        const id = path.replace('/coupon/', '');
        const found = coupons.find((c) => c.id === id);
        if (found) {
          setActiveCoupon(found);
          setActiveStoreSlug(null);
          setActiveInfoPage(null);
          setViewMode('website');
        }
      } else if (path.startsWith('/store/')) {
        const slug = path.replace('/store/', '');
        setActiveStoreSlug(slug);
        setActiveCoupon(null);
        setActiveInfoPage(null);
        setViewMode('website');
        navigatePath(getStoreUrlPath(slug), true);
      } else if (path === '/stores') {
        setActiveTab('stores');
        setActiveInfoPage(null);
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setViewMode('website');
      } else if (path === '/coupons') {
        setActiveTab('coupons');
        setDealType('code');
        setActiveInfoPage(null);
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setViewMode('website');
      } else if (path === '/deals') {
        setActiveTab('deals');
        setDealType('deal');
        setActiveInfoPage(null);
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setViewMode('website');
      } else if (path === '/categories') {
        setActiveTab('categories');
        setDealType('all');
        setActiveInfoPage(null);
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setViewMode('website');
      } else if (path === '/blog') {
        setActiveTab('blog');
        setActiveInfoPage(null);
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setViewMode('website');
      } else if (path.startsWith('/admin')) {
        setViewMode('admin');
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setActiveInfoPage(null);
        if (path === '/admin/stores') {
          setAdminTab('stores');
        } else if (path === '/admin/coupons') {
          setAdminTab('coupons');
        } else if (path === '/admin/sort-coupons') {
          setAdminTab('sort-coupons');
        } else if (path === '/admin/blogs') {
          setAdminTab('blogs');
        } else if (path === '/admin/categories') {
          setAdminTab('categories');
        } else if (path === '/admin/affiliates') {
          setAdminTab('affiliates');
        } else if (path === '/admin/analytics') {
          setAdminTab('analytics');
        } else if (path === '/admin/users') {
          setAdminTab('users');
        } else if (path === '/admin/settings') {
          setAdminTab('settings');
        } else {
          setAdminTab('dashboard');
        }
      } else if (path.endsWith('-promo-code')) {
        const candidateSlug = path.slice(1, -'-promo-code'.length).toLowerCase();
        const fullSlug = path.slice(1).toLowerCase();
        const resolvedSlug = stores[candidateSlug]
          ? candidateSlug
          : stores[fullSlug]
          ? fullSlug
          : candidateSlug;
        setActiveStoreSlug(resolvedSlug);
        setActiveCoupon(null);
        setActiveInfoPage(null);
        setViewMode('website');
      } else if (path !== '/' && stores[path.slice(1).toLowerCase()]) {
        const slug = path.slice(1).toLowerCase();
        setActiveStoreSlug(slug);
        setActiveCoupon(null);
        setActiveInfoPage(null);
        setViewMode('website');
        navigatePath(getStoreUrlPath(slug), true);
      } else {
        setViewMode('website');
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setActiveInfoPage(null);
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', syncRouteFromLocation);
    window.addEventListener('hashchange', syncRouteFromLocation);

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if (getSavedAdminSession()) {
        setViewMode('admin');
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setActiveInfoPage(null);
        if (
          !window.location.pathname.startsWith('/admin') &&
          !window.location.hash.startsWith('#/admin')
        ) {
          setAdminTab('dashboard');
          navigatePath('/admin', true);
        } else {
          syncRouteFromLocation();
        }
        return () => {
          window.removeEventListener('popstate', syncRouteFromLocation);
          window.removeEventListener('hashchange', syncRouteFromLocation);
        };
      }
    }

    syncRouteFromLocation();
    return () => {
      window.removeEventListener('popstate', syncRouteFromLocation);
      window.removeEventListener('hashchange', syncRouteFromLocation);
    };
  }, [coupons, stores]);

  const navigateToCoupon = (coupon: Coupon) => {
    setActiveCoupon(coupon);
    setActiveStoreSlug(null);
    setActiveInfoPage(null);
    navigatePath(`/coupon/${coupon.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStore = (slug: string) => {
    setActiveStoreSlug(slug);
    setActiveCoupon(null);
    setActiveInfoPage(null);
    navigatePath(getStoreUrlPath(slug));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTab = (tab: 'home' | 'coupons' | 'deals' | 'stores' | 'categories' | 'blog') => {
    setActiveTab(tab);
    setActiveCoupon(null);
    setActiveStoreSlug(null);
    setActiveInfoPage(null);
    if (tab === 'coupons') setDealType('code');
    if (tab === 'deals') setDealType('deal');
    if (tab === 'home' || tab === 'categories') setDealType('all');
    navigatePath(tab === 'home' ? '/' : `/${tab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToInfoPage = (page: InfoPageKey) => {
    setActiveInfoPage(page);
    setActiveCoupon(null);
    setActiveStoreSlug(null);
    setViewMode('website');
    navigatePath(INFO_PAGE_PATHS[page]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  const persistCoupons = (updated: Coupon[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
      const customItems = updated.filter(
        (c) => c.isCommunity || c.id.startsWith('admin-c-') || c.id.startsWith('bulk-c-')
      );
      localStorage.setItem(STORAGE_KEY_COMMUNITY, JSON.stringify(customItems));
    } catch {
      // ignore
    }
  };

  const handleLoginSuccess = (user: { name: string; email: string; role: 'admin' | 'shopper' }) => {
    if (user.role === 'admin') {
      const sessionToken = `cc_admin_${Date.now()}`;
      try {
        localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, sessionToken);
      } catch {
        // ignore
      }
      setCurrentUser({ ...user, token: sessionToken });
      setAdminTab('dashboard');
      setViewMode('admin');
      navigatePath('/admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setToast({
        message: `Welcome back, ${user.name}!`,
        subMessage: 'Authenticated as administrator. Opening Backend Dashboard...',
      });
    } else {
      setCurrentUser(user);
      setToast({
        message: `Welcome, ${user.name}!`,
        subMessage: 'You are now signed in to CodeCoupon.',
      });
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setViewMode('website');
    if (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.startsWith('#/admin')
    ) {
      navigatePath('/');
    }
    setToast({
      message: 'Signed Out',
      subMessage: 'You have been signed out successfully.',
    });
  };

  const handleAddCoupon = (newCoupon: Coupon) => {
    const normalized = normalizeCoupon(newCoupon);
    setCoupons((prev) => {
      const updated = [normalized, ...prev];
      persistCoupons(updated);
      return updated;
    });

    setToast({
      message: 'Coupon Added Successfully!',
      subMessage: `"${normalized.title}" is saved to CodeCoupon.`,
    });
  };

  const handleUpdateCoupon = (updatedCoupon: Coupon) => {
    const normalized = normalizeCoupon(updatedCoupon);
    setCoupons((prev) => {
      const updated = prev.map((c) => (c.id === normalized.id ? normalized : c));
      persistCoupons(updated);
      return updated;
    });

    if (activeCoupon?.id === normalized.id) {
      setActiveCoupon(normalized);
    }

    setToast({
      message: 'Coupon Updated Successfully!',
      subMessage: `"${normalized.title}" has been saved.`,
    });
  };

  const handleAddAllCoupons = (curatedCoupons: Coupon[]) => {
    setCoupons((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const newItems = normalizeCoupons(curatedCoupons.filter((c) => !existingIds.has(c.id)));
      const updated = [...newItems, ...prev];
      persistCoupons(updated);
      return updated;
    });

    setToast({
      message: `Added ${curatedCoupons.length} Curated Coupons!`,
      subMessage: 'New partner offers are now active across CodeCoupon.',
    });
  };

  const handleAddStore = (newStore: StoreInfo) => {
    setStores((prev) => {
      const updated = { ...prev, [newStore.slug]: newStore };
      try {
        localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setToast({
      message: `Store "${newStore.name}" Added!`,
      subMessage: 'Store profile and deals page are now active in directory.',
    });
  };

  const handleUpdateStore = (updatedStore: StoreInfo) => {
    setStores((prev) => {
      const updated = { ...prev, [updatedStore.slug]: updatedStore };
      try {
        localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setCoupons((prev) => {
      const updated = prev.map((c) => {
        if (c.storeSlug.toLowerCase() === updatedStore.slug.toLowerCase()) {
          return {
            ...c,
            store: updatedStore.name,
            storeLogoBg: updatedStore.logoBg,
            storeLogoText: updatedStore.logoText || updatedStore.name,
            storeLogoUrl: updatedStore.logoUrl,
            countries:
              c.countries && c.countries.length > 0 ? c.countries : updatedStore.countries,
          };
        }
        return c;
      });
      persistCoupons(updated);
      return updated;
    });

    setToast({
      message: `Store "${updatedStore.name}" Updated!`,
      subMessage: 'Store profile, branding, and regional settings saved.',
    });
  };

  const handleDeleteStore = (slug: string) => {
    const storeName = stores[slug]?.name || slug;
    setStores((prev) => {
      const updated = { ...prev };
      delete updated[slug];
      try {
        localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (activeStoreSlug === slug) {
      setActiveStoreSlug(null);
    }

    setToast({
      message: `Store "${storeName}" Removed`,
      subMessage: 'Store has been removed from directory.',
    });
  };

  const handleAddAllStores = (catalogStores: StoreInfo[]) => {
    setStores((prev) => {
      const updated = { ...prev };
      catalogStores.forEach((s) => {
        updated[s.slug] = s;
      });
      try {
        localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setToast({
      message: `Added ${catalogStores.length} Partner Stores!`,
      subMessage: 'International brand stores are now live in the directory.',
    });
  };

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons((prev) => {
      const updated = prev.filter((c) => c.id !== couponId);
      persistCoupons(updated);
      return updated;
    });

    if (activeCoupon?.id === couponId) {
      setActiveCoupon(null);
      navigatePath('/');
    }

    setToast({
      message: 'Coupon Deleted',
      subMessage: 'The coupon has been permanently removed.',
    });
  };

  const handleToggleCouponStatus = (couponId: string) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => {
        if (c.id === couponId) {
          const newStatus = !c.verified;
          const expired = isCouponExpired(c.expiryDate, c.isExpired);
          const next = {
            ...c,
            verified: newStatus,
            verifiedText: expired ? 'Expired' : newStatus ? 'Active Offer' : 'Paused',
          };
          if (activeCoupon?.id === couponId) {
            setActiveCoupon(next);
          }
          return next;
        }
        return c;
      });
      persistCoupons(updated);
      return updated;
    });

    setToast({
      message: 'Coupon Status Updated',
      subMessage: 'Offer visibility status updated successfully.',
    });
  };

  const handleReorderCoupons = (reorderedCoupons: Coupon[], storeLabel?: string) => {
    const withOrder = reorderedCoupons.map((c, index) => ({
      ...c,
      sortOrder: index,
    }));
    setCoupons(withOrder);
    persistCoupons(withOrder);

    setToast({
      message: 'Coupon Order Saved!',
      subMessage: storeLabel
        ? `Updated display order for ${storeLabel} offers.`
        : 'Updated coupon display order across the storefront.',
    });
  };

  const handleAddBlog = (newBlog: BlogPost) => {
    setBlogs((prev) => {
      const updated = [newBlog, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_BLOGS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save blogs to localStorage', e);
      }
      return updated;
    });

    setToast({
      message: 'Blog Article Published!',
      subMessage: `"${newBlog.title}" is now live on the public blog.`,
    });
  };

  const handleUpdateBlog = (updatedBlog: BlogPost) => {
    setBlogs((prev) => {
      const updated = prev.map((b) => (b.id === updatedBlog.id ? updatedBlog : b));
      try {
        localStorage.setItem(STORAGE_KEY_BLOGS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save blogs to localStorage', e);
      }
      return updated;
    });

    setToast({
      message: 'Blog Article Updated!',
      subMessage: `Changes to "${updatedBlog.title}" have been saved.`,
    });
  };

  const handleDeleteBlog = (blogId: string) => {
    setBlogs((prev) => {
      const blogToDelete = prev.find((b) => b.id === blogId);
      const updated = prev.filter((b) => b.id !== blogId);
      try {
        localStorage.setItem(STORAGE_KEY_BLOGS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save blogs to localStorage', e);
      }
      if (blogToDelete) {
        setToast({
          message: 'Blog Article Deleted',
          subMessage: `"${blogToDelete.title}" has been removed.`,
        });
      }
      return updated;
    });
  };

  // Copy code or activate deal without fake usage counters
  const handleCopyCode = (coupon: Coupon) => {
    if (isCouponExpired(coupon.expiryDate, coupon.isExpired)) {
      setToast({
        message: 'Offer Expired',
        subMessage: 'This promotion has expired and is no longer active.',
      });
      return;
    }

    const storeWebsite = stores[coupon.storeSlug.toLowerCase()]?.website;
    const resolvedUrl = resolveMerchantUrl(coupon.storeUrl, storeWebsite, coupon.storeSlug);
    const textToCopy = coupon.code || resolvedUrl;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      });
    }

    if (coupon.isDeal) {
      setToast({
        message: `Deal Opened for ${coupon.store}!`,
        subMessage: `Opening ${coupon.store} official website in a new tab.`,
      });
    } else {
      setToast({
        message: `Code "${coupon.code}" Copied!`,
        subMessage: `Paste this promo code at ${coupon.store} checkout.`,
      });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCountry('ALL');
    setDealType('all');
    setSortBy('featured');
    setActiveStoreSlug(null);
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
      selectedCategory !== 'All' ||
      selectedCountry !== 'ALL' ||
      dealType !== 'all'
  );

  const handleFocusSearch = () => {
    setActiveStoreSlug(null);
    setActiveInfoPage(null);
    setActiveCoupon(null);
    const searchEl = document.getElementById('hero-search-input');
    if (searchEl) {
      searchEl.focus();
      searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Filtered active offers (always excludes expired & paused coupons)
  const filteredCoupons = useMemo(() => {
    let result = [...activeCoupons];

    if (activeTab === 'coupons') {
      result = result.filter((c) => !c.isDeal);
    } else if (activeTab === 'deals') {
      result = result.filter((c) => c.isDeal);
    }

    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    if (selectedCountry !== 'ALL') {
      result = result.filter((c) => {
        const storeCountries = stores[c.storeSlug.toLowerCase()]?.countries;
        const effectiveCountries =
          c.countries && c.countries.length > 0 ? c.countries : storeCountries;
        return matchesCountryFilter(effectiveCountries, selectedCountry);
      });
    }

    if (dealType === 'code') {
      result = result.filter((c) => !c.isDeal);
    } else if (dealType === 'deal') {
      result = result.filter((c) => c.isDeal);
    } else if (dealType === 'exclusive') {
      result = result.filter((c) => c.exclusive);
    } else if (dealType === 'shipping') {
      result = result.filter((c) => c.discountType === 'free_shipping');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.store.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.code && c.code.toLowerCase().includes(q)) ||
          c.category.toLowerCase().includes(q) ||
          c.discountBadge.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'featured' || sortBy === 'custom') {
        const orderA = a.sortOrder ?? 9999;
        const orderB = b.sortOrder ?? 9999;
        if (orderA !== orderB) return orderA - orderB;
        const featA = (a.featured ? 2 : 0) + (a.exclusive ? 1 : 0);
        const featB = (b.featured ? 2 : 0) + (b.exclusive ? 1 : 0);
        if (featB !== featA) return featB - featA;
        return b.discountValueNum - a.discountValueNum;
      }
      if (sortBy === 'discount') {
        return b.discountValueNum - a.discountValueNum;
      }
      if (sortBy === 'newest') {
        return (b.isCommunity ? 1 : 0) - (a.isCommunity ? 1 : 0);
      }
      if (sortBy === 'expiring') {
        const aHours =
          computeHoursLeftFromDate(a.expiryDate) ??
          a.expiryHoursLeft ??
          Number.MAX_SAFE_INTEGER;
        const bHours =
          computeHoursLeftFromDate(b.expiryDate) ??
          b.expiryHoursLeft ??
          Number.MAX_SAFE_INTEGER;
        return aHours - bHours;
      }
      return 0;
    });

    return result;
  }, [
    activeCoupons,
    stores,
    activeTab,
    selectedCategory,
    selectedCountry,
    dealType,
    searchQuery,
    sortBy,
  ]);

  const currentStoreInfo = activeStoreSlug ? stores[activeStoreSlug.toLowerCase()] : null;

  const handleAdminGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGateError('');
    const adminCreds = getAdminCredentials();
    const rawId = gateId.trim();
    const trimmed = rawId.toLowerCase();
    const trimmedPass = gatePassword.trim();

    if (!rawId || !trimmedPass) {
      setGateError('Please enter both your email and password.');
      return;
    }

    const idOk =
      trimmed === adminCreds.adminId.toLowerCase() ||
      trimmed === 'admin' ||
      trimmed === 'admin@codecoupon.com';

    if (adminCreds.password !== 'admin') {
      if (!idOk || trimmedPass !== adminCreds.password.trim()) {
        setGateError('Invalid email or password.');
        return;
      }
    }

    const sessionToken = `cc_admin_${Date.now()}`;
    try {
      localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, sessionToken);
    } catch {
      // ignore
    }
    const displayName = idOk
      ? adminCreds.adminName
      : rawId.split('@')[0] || adminCreds.adminName;
    setCurrentUser({
      name: displayName,
      email: idOk ? adminCreds.adminId : rawId,
      role: 'admin',
      token: sessionToken,
    });
    setGateId('');
    setGatePassword('');
    setToast({
      message: `Welcome, ${displayName}`,
      subMessage: 'Signed in to administrator portal.',
    });
  };

  if (viewMode === 'admin') {
    if (currentUser?.role !== 'admin') {
      return (
        <div className="min-h-screen bg-[#070A10] text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-md bg-[#0E131F] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-[#0B0F17] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-[#FF6600] border border-orange-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-black text-white font-heading">Admin Portal</h1>
                  <p className="text-[11px] text-slate-400">Restricted Management Access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewMode('website');
                  navigatePath('/');
                }}
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Storefront</span>
              </button>
            </div>

            <form onSubmit={handleAdminGateSubmit} className="p-6 space-y-4">
              {gateError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{gateError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Admin ID / Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={gateId}
                    onChange={(e) => setGateId(e.target.value)}
                    placeholder="admin@codecoupon.com"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#121824] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={gatePassword}
                    onChange={(e) => setGatePassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#121824] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Sign In to Dashboard
              </button>

              {getAdminCredentials().password === 'admin' && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <p className="text-[11px] text-slate-400 text-center">
                    Default ID: <span className="text-white font-mono">admin</span> · Password:{' '}
                    <span className="text-white font-mono">admin</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const creds = getAdminCredentials();
                      const sessionToken = `cc_admin_${Date.now()}`;
                      try {
                        localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, sessionToken);
                      } catch {
                        // ignore
                      }
                      setCurrentUser({
                        name: creds.adminName,
                        email: creds.adminId,
                        role: 'admin',
                        token: sessionToken,
                      });
                      setGateId('');
                      setGatePassword('');
                      setToast({
                        message: `Welcome, ${creds.adminName}`,
                        subMessage: 'Signed in to administrator portal.',
                      });
                    }}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
                  >
                    Quick Login with Default Admin
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#070A10] text-slate-100 font-sans selection:bg-[#FF6600]/30 selection:text-white">
        <AdminDashboard
          coupons={coupons}
          stores={stores}
          blogs={blogs}
          activeNav={adminTab}
          onNavChange={(nav) => {
            setAdminTab(nav);
            navigatePath(nav === 'dashboard' ? '/admin' : `/admin/${nav}`);
          }}
          currentUser={currentUser}
          onUpdateCurrentUser={(updated) => setCurrentUser({ ...updated, role: 'admin' })}
          onShowToast={(msg, sub) => setToast({ message: msg, subMessage: sub })}
          onLogout={handleLogout}
          onAddCoupon={handleAddCoupon}
          onAddAllCoupons={handleAddAllCoupons}
          onUpdateCoupon={handleUpdateCoupon}
          onDeleteCoupon={handleDeleteCoupon}
          onToggleCouponStatus={handleToggleCouponStatus}
          onReorderCoupons={handleReorderCoupons}
          onAddStore={handleAddStore}
          onAddAllStores={handleAddAllStores}
          onUpdateStore={handleUpdateStore}
          onDeleteStore={handleDeleteStore}
          onNavigateToStore={navigateToStore}
          onNavigateToCoupon={navigateToCoupon}
          onAddBlog={handleAddBlog}
          onUpdateBlog={handleUpdateBlog}
          onDeleteBlog={handleDeleteBlog}
          onViewWebsite={() => {
            setViewMode('website');
            navigatePath('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        {toast && (
          <Toast
            message={toast.message}
            subMessage={toast.subMessage}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-orange-500/20 selection:text-orange-950">
      {/* Top Header */}
      <Header
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenBackendLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
        activeTab={activeTab}
        activeInfoPage={activeInfoPage}
        setActiveTab={(tab) => navigateToTab(tab)}
        onNavigateInfo={navigateToInfoPage}
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountry}
        onResetFilters={handleResetFilters}
        onFocusSearch={handleFocusSearch}
        onOpenAdmin={() => {
          setViewMode('admin');
          navigatePath('/admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Hero Section (only shown on homepage when not on sub-pages or info pages) */}
      {!activeInfoPage && !activeCoupon && !activeStoreSlug && activeTab === 'home' && (
        <HeroSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={() => {
            const listEl = document.getElementById('deals-list-anchor');
            if (listEl) listEl.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectStore={navigateToStore}
          onCopyCode={handleCopyCode}
          coupons={activeCoupons}
          stores={stores}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {activeInfoPage ? (
          <InfoPages
            page={activeInfoPage}
            onBack={() => navigateToTab('home')}
            onSelectPage={navigateToInfoPage}
            onOpenStores={() => navigateToTab('stores')}
            onContactSubmit={(payload) => {
              setToast({
                message: 'Message Submitted',
                subMessage: `Thank you, ${payload.name}. Your inquiry has been logged for ${payload.topic}.`,
              });
            }}
          />
        ) : activeCoupon ? (
          <CouponDetailPage
            coupon={activeCoupon}
            store={stores[activeCoupon.storeSlug.toLowerCase()]}
            allCoupons={activeCoupons}
            onBack={() => {
              setActiveCoupon(null);
              navigatePath('/');
            }}
            onSelectCoupon={navigateToCoupon}
            onSelectStore={navigateToStore}
            onCopyCode={handleCopyCode}
          />
        ) : activeStoreSlug && currentStoreInfo ? (
          <StorePage
            store={currentStoreInfo}
            coupons={activeCoupons}
            onBack={() => {
              setActiveStoreSlug(null);
              navigatePath('/');
            }}
            onCopyCode={handleCopyCode}
            onOpenDetails={navigateToCoupon}
          />
        ) : activeTab === 'stores' ? (
          <StoresDirectoryPage
            stores={stores}
            coupons={activeCoupons}
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
            onSelectStore={navigateToStore}
            onBackToHome={() => navigateToTab('home')}
          />
        ) : activeTab === 'blog' ? (
          <BlogSection blogs={blogs} onBackToDeals={() => navigateToTab('home')} />
        ) : (
          <>
            {activeTab !== 'home' && (
              <div className="bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black font-heading text-white">
                    {activeTab === 'coupons'
                      ? 'Active Promo Codes & Coupons'
                      : activeTab === 'deals'
                      ? 'Direct Online Sales & Deals'
                      : 'Browse Offers by Category'}
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">
                    {activeTab === 'coupons'
                      ? 'Copy checked promo codes with clear regional availability and expiration dates.'
                      : activeTab === 'deals'
                      ? 'Direct merchant offers with promotional pricing applied on partner websites.'
                      : 'Select a shopping category below to filter active promo codes and regional store discounts.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToTab('home')}
                  className="text-xs font-bold text-orange-400 hover:text-white bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  &larr; Back to Home
                </button>
              </div>
            )}

            {activeTab === 'categories' && (
              <div id="categories-grid-anchor">
                <ShopByCategoryGrid
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    const listEl = document.getElementById('deals-list-anchor');
                    if (listEl) listEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </div>
            )}

            {activeTab === 'home' && (
              <div id="stores-grid-anchor">
                <TopStoresGrid
                  stores={stores}
                  coupons={activeCoupons}
                  onSelectStore={navigateToStore}
                  onViewAllStores={() => navigateToTab('stores')}
                />
              </div>
            )}

            {activeTab === 'home' && (
              <FeaturedDealsSection
                coupons={activeCoupons}
                stores={stores}
                onCopyCode={handleCopyCode}
                onOpenDetails={navigateToCoupon}
                onSelectStore={navigateToStore}
                onViewAllFeatured={() => {
                  const listEl = document.getElementById('deals-list-anchor');
                  if (listEl) listEl.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            <div
              id="deals-list-anchor"
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2"
            >
              {/* Left Column: All Coupons List & Controls */}
              <div className="lg:col-span-8 space-y-6">
                <DealControlsBar
                  dealType={dealType}
                  setDealType={setDealType}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  selectedCountry={selectedCountry}
                  setSelectedCountry={setSelectedCountry}
                  totalResults={filteredCoupons.length}
                  hasActiveFilters={hasActiveFilters}
                  onResetFilters={handleResetFilters}
                />

                {filteredCoupons.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCoupons.map((coupon) => {
                      const storeInfo = stores[coupon.storeSlug.toLowerCase()];
                      return (
                        <CouponCard
                          key={coupon.id}
                          coupon={coupon}
                          storeWebsite={storeInfo?.website}
                          storeCountries={storeInfo?.countries}
                          onCopyCode={handleCopyCode}
                          onOpenDetails={navigateToCoupon}
                          onSelectStore={navigateToStore}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-heading">
                        No active coupons match your filters
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Try clearing search terms, switching regions, or resetting filters to view all active offers.
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset All Filters</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Featured Deals & Newsletter Widget */}
              <div className="lg:col-span-4">
                <SidebarDealsWidget
                  popularCoupons={activeCoupons}
                  onSelectCoupon={navigateToCoupon}
                  onSelectStore={navigateToStore}
                  onViewAllDeals={() => navigateToTab('deals')}
                  onSubscribe={(email) => {
                    setToast({
                      message: `Subscribed ${email}!`,
                      subMessage: 'You will receive active store coupon alerts and updates.',
                    });
                  }}
                />
              </div>
            </div>

            {activeTab !== 'categories' && (
              <div id="categories-grid-anchor" className="pt-8">
                <ShopByCategoryGrid
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    const listEl = document.getElementById('deals-list-anchor');
                    if (listEl) listEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          navigateToTab('home');
          setTimeout(() => {
            const listEl = document.getElementById('deals-list-anchor');
            if (listEl) listEl.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }}
        onSelectNav={(tab) => navigateToTab(tab)}
        onNavigateInfo={navigateToInfoPage}
        onSubscribe={(email) => {
          setToast({
            message: `Subscribed ${email}!`,
            subMessage: 'Weekly coupon alerts and store promotions will be delivered to your inbox.',
          });
        }}
        onOpenAdminPortal={() => {
          setViewMode('admin');
          navigatePath('/admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Quick View Modal */}
      <CouponModal
        coupon={activeCouponModal}
        storeWebsite={
          activeCouponModal
            ? stores[activeCouponModal.storeSlug.toLowerCase()]?.website
            : undefined
        }
        storeCountries={
          activeCouponModal
            ? stores[activeCouponModal.storeSlug.toLowerCase()]?.countries
            : undefined
        }
        onClose={() => setActiveCouponModal(null)}
        onCopyCode={handleCopyCode}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Floating Deal Assistant Chatbot */}
      <SavingsChatWidget coupons={activeCoupons} stores={stores} />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          subMessage={toast.subMessage}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
