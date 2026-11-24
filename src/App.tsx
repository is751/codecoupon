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
import { CouponCard } from './components/CouponCard';
import { CouponModal } from './components/CouponModal';
import { CouponReviewModal } from './components/CouponReviewModal';
import { LoginModal } from './components/LoginModal';
import { DealControlsBar } from './components/DealControlsBar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { SavingsChatWidget } from './components/SavingsChatWidget';
import { AdminDashboard } from './components/admin/AdminDashboard';

import { INITIAL_COUPONS, STORES_DATA } from './data/coupons';
import { BLOG_POSTS } from './data/blogs';
import { getAdminCredentials } from './data/adminAuth';
import { Category, Coupon, CouponReview, DealType, SortOption, StoreInfo, BlogPost } from './types/coupon';
import { computeHoursLeftFromDate } from './utils/expiry';
import { Search, RotateCcw, ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

const STORAGE_KEY_COMMUNITY = 'codecoupon_community_items';
const STORAGE_KEY_STORES = 'codecoupon_custom_stores';
const STORAGE_KEY_USER = 'codecoupon_current_user';
const STORAGE_KEY_AUTH_TOKEN = 'codecoupon_auth_token';
const STORAGE_KEY_COUPONS = 'codecoupon_all_coupons';
const STORAGE_KEY_BLOGS = 'codecoupon_blog_posts';

interface AuthUser {
  name: string;
  email: string;
  role?: 'admin' | 'shopper';
  token?: string;
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
  // Stores state (trust localStorage once initialized so deletions persist)
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

  // Coupons list state
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const allStored = localStorage.getItem(STORAGE_KEY_COUPONS);
      if (allStored) {
        return JSON.parse(allStored);
      }
      const stored = localStorage.getItem(STORAGE_KEY_COMMUNITY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return [...parsed, ...INITIAL_COUPONS];
      }
    } catch {
      // fallback
    }
    return INITIAL_COUPONS;
  });

  // Current logged in user (hydrates admin if token or admin role exists in localStorage)
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

  // Admin portal gate form state (when navigating to #/admin unauthenticated)
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

  // Navigation tab: 'home' | 'coupons' | 'deals' | 'stores' | 'categories' | 'blog'
  const [activeTab, setActiveTab] = useState<'home' | 'coupons' | 'deals' | 'stores' | 'categories' | 'blog'>('home');

  // Active dedicated store page (e.g. 'amazon', 'nike', null)
  const [activeStoreSlug, setActiveStoreSlug] = useState<string | null>(null);

  // Active dedicated coupon detail page (separate page for clicked coupon)
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [dealType, setDealType] = useState<DealType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  // View mode: 'website' | 'admin' (auto-enters 'admin' if saved token or admin role exists)
  const [viewMode, setViewMode] = useState<'website' | 'admin'>(() =>
    getSavedAdminSession() ? 'admin' : 'website'
  );

  // Admin active sub-page
  const [adminTab, setAdminTab] = useState<'dashboard' | 'coupons' | 'sort-coupons' | 'stores' | 'blogs' | 'categories' | 'affiliates' | 'analytics' | 'users' | 'settings'>('dashboard');

  // Modals
  const [activeCouponModal, setActiveCouponModal] = useState<Coupon | null>(null);
  const [activeReviewCoupon, setActiveReviewCoupon] = useState<Coupon | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'shopper' | 'admin'>('shopper');

  // Toast
  const [toast, setToast] = useState<{ message: string; subMessage?: string } | null>(null);

  // Dedicated URL Hash Routing & Browser History support:
  // When a coupon is clicked, it opens its dedicated page (#/coupon/:id)
  // When a store is clicked, it opens its dedicated page (#/store/:slug)
  // When tabs are clicked, they open (#/stores, #/blog, #/coupons, #/deals)
  // When admin pages are clicked, each has its dedicated page (#/admin, #/admin/stores, #/admin/coupons, etc.)
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/coupon/')) {
        const id = hash.replace('#/coupon/', '');
        const found = coupons.find((c) => c.id === id);
        if (found) {
          setActiveCoupon(found);
          setActiveStoreSlug(null);
          setViewMode('website');
        }
      } else if (hash.startsWith('#/store/')) {
        const slug = hash.replace('#/store/', '');
        setActiveStoreSlug(slug);
        setActiveCoupon(null);
        setViewMode('website');
      } else if (hash === '#/stores') {
        setActiveTab('stores');
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setViewMode('website');
      } else if (hash === '#/coupons') {
        setActiveTab('coupons');
        setDealType('code');
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setViewMode('website');
      } else if (hash === '#/deals') {
        setActiveTab('deals');
        setDealType('deal');
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setViewMode('website');
      } else if (hash === '#/categories') {
        setActiveTab('categories');
        setDealType('all');
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setViewMode('website');
      } else if (hash === '#/blog') {
        setActiveTab('blog');
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setViewMode('website');
      } else if (hash.startsWith('#/admin')) {
        setViewMode('admin');
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        if (hash === '#/admin/stores') {
          setAdminTab('stores');
        } else if (hash === '#/admin/coupons') {
          setAdminTab('coupons');
        } else if (hash === '#/admin/sort-coupons') {
          setAdminTab('sort-coupons');
        } else if (hash === '#/admin/blogs') {
          setAdminTab('blogs');
        } else if (hash === '#/admin/categories') {
          setAdminTab('categories');
        } else if (hash === '#/admin/affiliates') {
          setAdminTab('affiliates');
        } else if (hash === '#/admin/analytics') {
          setAdminTab('analytics');
        } else if (hash === '#/admin/users') {
          setAdminTab('users');
        } else if (hash === '#/admin/settings') {
          setAdminTab('settings');
        } else {
          setAdminTab('dashboard');
        }
      } else if (hash === '#/' || hash === '') {
        setViewMode('website');
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        setActiveTab('home');
      }
    };

    window.addEventListener('hashchange', handleHashSync);

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if (getSavedAdminSession()) {
        setViewMode('admin');
        setActiveCoupon(null);
        setActiveStoreSlug(null);
        if (!window.location.hash.startsWith('#/admin')) {
          setAdminTab('dashboard');
          window.location.hash = '#/admin';
        } else {
          handleHashSync();
        }
        return () => window.removeEventListener('hashchange', handleHashSync);
      }
    }

    handleHashSync();
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, [coupons]);

  // Navigate to dedicated coupon page
  const navigateToCoupon = (coupon: Coupon) => {
    setActiveCoupon(coupon);
    setActiveStoreSlug(null);
    window.location.hash = `#/coupon/${coupon.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to dedicated store page
  const navigateToStore = (slug: string) => {
    setActiveStoreSlug(slug);
    setActiveCoupon(null);
    window.location.hash = `#/store/${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to tab page
  const navigateToTab = (tab: 'home' | 'coupons' | 'deals' | 'stores' | 'categories' | 'blog') => {
    setActiveTab(tab);
    setActiveCoupon(null);
    setActiveStoreSlug(null);
    if (tab === 'coupons') setDealType('code');
    if (tab === 'deals') setDealType('deal');
    if (tab === 'home' || tab === 'categories') setDealType('all');
    window.location.hash = tab === 'home' ? '#/' : `#/${tab}`;
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

  // Helper to persist coupons safely
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

  // Handle Login success -> only admins open Backend Dashboard; shoppers stay on storefront
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
      window.location.hash = '#/admin';
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

  // Handle Logout -> clears auth token & returns cleanly to public website
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
    if (window.location.hash.startsWith('#/admin')) {
      window.location.hash = '#/';
    }
    setToast({
      message: 'Signed Out',
      subMessage: 'You have been signed out successfully.',
    });
  };

  // Admin: Handle adding new coupon
  const handleAddCoupon = (newCoupon: Coupon) => {
    setCoupons((prev) => {
      const updated = [newCoupon, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
        const customItems = updated.filter((c) => c.isCommunity || c.id.startsWith('admin-c-') || c.id.startsWith('bulk-c-'));
        localStorage.setItem(STORAGE_KEY_COMMUNITY, JSON.stringify(customItems));
      } catch {
        // ignore
      }
      return updated;
    });

    setToast({
      message: `Coupon Added Successfully!`,
      subMessage: `"${newCoupon.title}" is now live across CodeCoupon.`,
    });
  };

  // Admin: Handle updating existing coupon
  const handleUpdateCoupon = (updatedCoupon: Coupon) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => (c.id === updatedCoupon.id ? updatedCoupon : c));
      try {
        localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
        const customItems = updated.filter((c) => c.isCommunity || c.id.startsWith('admin-c-') || c.id.startsWith('bulk-c-'));
        localStorage.setItem(STORAGE_KEY_COMMUNITY, JSON.stringify(customItems));
      } catch {
        // ignore
      }
      return updated;
    });

    if (activeCoupon?.id === updatedCoupon.id) {
      setActiveCoupon(updatedCoupon);
    }

    setToast({
      message: `Coupon Updated Successfully!`,
      subMessage: `"${updatedCoupon.title}" has been saved.`,
    });
  };

  // Admin: Handle adding all curated coupons in bulk (Add All Coupons)
  const handleAddAllCoupons = (curatedCoupons: Coupon[]) => {
    setCoupons((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const newItems = curatedCoupons.filter((c) => !existingIds.has(c.id));
      const updated = [...newItems, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
        const customItems = updated.filter((c) => c.isCommunity || c.id.startsWith('bulk-c-'));
        localStorage.setItem(STORAGE_KEY_COMMUNITY, JSON.stringify(customItems));
      } catch {
        // ignore
      }
      return updated;
    });

    setToast({
      message: `All ${curatedCoupons.length} Curated Coupons Added!`,
      subMessage: 'Top verified coupons and deals are now live across CodeCoupon.',
    });
  };

  // Admin: Handle adding a new store (Add New Store)
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
      subMessage: 'Store profile and deals page are now live in directory.',
    });
  };

  // Admin: Handle updating an existing store
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

    // Also sync existing coupons for this store if logo or brand name changed
    setCoupons((prev) => {
      const updated = prev.map((c) => {
        if (c.storeSlug.toLowerCase() === updatedStore.slug.toLowerCase()) {
          return {
            ...c,
            store: updatedStore.name,
            storeLogoBg: updatedStore.logoBg,
            storeLogoText: updatedStore.logoText || updatedStore.name,
            storeLogoUrl: updatedStore.logoUrl,
          };
        }
        return c;
      });
      try {
        localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setToast({
      message: `Store "${updatedStore.name}" Updated!`,
      subMessage: 'Store profile, branding, and details updated.',
    });
  };

  // Admin: Handle deleting a store
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

  // Admin: Handle adding all catalog stores in bulk (Add All Stores)
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
      message: `All ${catalogStores.length} Partner Stores Added!`,
      subMessage: 'Amazon, Daraz, Nike, Walmart, eBay, Sephora & more are active.',
    });
  };

  // Admin: Handle deleting coupon
  const handleDeleteCoupon = (couponId: string) => {
    setCoupons((prev) => {
      const updated = prev.filter((c) => c.id !== couponId);
      persistCoupons(updated);
      return updated;
    });

    if (activeCoupon?.id === couponId) {
      setActiveCoupon(null);
      window.location.hash = '#/';
    }

    setToast({
      message: `Coupon Deleted`,
      subMessage: 'The coupon has been permanently removed.',
    });
  };

  // Admin: Handle toggling coupon status (verified / paused)
  const handleToggleCouponStatus = (couponId: string) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => {
        if (c.id === couponId) {
          const newStatus = !c.verified;
          const next = {
            ...c,
            verified: newStatus,
            verifiedText: newStatus ? 'Verified & Working' : 'Paused',
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
      subMessage: 'Coupon verification status updated successfully.',
    });
  };

  // Admin: Handle manual reordering of coupons (Sort Coupon)
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

  // Admin: Handle adding new blog post
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

  // Admin: Handle updating blog post
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

  // Admin: Handle deleting blog post
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

  // Handle Copy Code (persists usesCount + syncs activeCoupon)
  const handleCopyCode = (coupon: Coupon) => {
    const textToCopy = coupon.code || coupon.storeUrl;
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

    setCoupons((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== coupon.id) return c;
        const next = { ...c, usesCount: c.usesCount + 1 };
        if (activeCoupon?.id === coupon.id) {
          setActiveCoupon(next);
        }
        return next;
      });
      persistCoupons(updated);
      return updated;
    });

    if (coupon.isDeal) {
      setToast({
        message: `Deal Activated for ${coupon.store}!`,
        subMessage: `Opening ${coupon.store} official store with discounted pricing applied.`,
      });
    } else {
      setToast({
        message: `Code "${coupon.code}" Copied & Store Opened!`,
        subMessage: `Opening ${coupon.store} in a new tab. Paste code at checkout!`,
      });
    }
  };

  // Handle Helpful Upvote/Downvote (persists to localStorage & syncs activeCoupon)
  const handleVote = (couponId: string, type: 'up' | 'down') => {
    setCoupons((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== couponId) return c;
        let next: Coupon;
        if (c.userVote === type) {
          next = {
            ...c,
            userVote: null,
            upvotes: type === 'up' ? Math.max(0, c.upvotes - 1) : c.upvotes,
            downvotes: type === 'down' ? Math.max(0, c.downvotes - 1) : c.downvotes,
          };
        } else {
          const prevVote = c.userVote;
          next = {
            ...c,
            userVote: type,
            upvotes: type === 'up' ? c.upvotes + 1 : prevVote === 'up' ? Math.max(0, c.upvotes - 1) : c.upvotes,
            downvotes: type === 'down' ? c.downvotes + 1 : prevVote === 'down' ? Math.max(0, c.downvotes - 1) : c.downvotes,
          };
        }
        if (activeCoupon?.id === couponId) {
          setActiveCoupon(next);
        }
        return next;
      });
      persistCoupons(updated);
      return updated;
    });
  };

  // Handle adding user review and rating (persists to localStorage & syncs activeCoupon)
  const handleAddReview = (
    couponId: string,
    newReviewData: Omit<CouponReview, 'id' | 'couponId' | 'helpfulCount'>
  ) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== couponId) return c;

        const newReview: CouponReview = {
          ...newReviewData,
          id: `rev-${Date.now()}`,
          couponId,
          helpfulCount: 1,
        };

        const updatedReviews = [newReview, ...(c.reviews || [])];
        const totalRatingSum = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAverageRating = totalRatingSum / updatedReviews.length;
        const workedCount = updatedReviews.filter((r) => r.worked).length;
        const newSuccessRate = Math.round((workedCount / updatedReviews.length) * 100);

        const next: Coupon = {
          ...c,
          reviews: updatedReviews,
          averageRating: Number(newAverageRating.toFixed(1)),
          successRate: Math.max(80, newSuccessRate),
        };
        if (activeCoupon?.id === couponId) {
          setActiveCoupon(next);
        }
        return next;
      });
      persistCoupons(updated);
      return updated;
    });

    setToast({
      message: 'Review & Rating Submitted!',
      subMessage: 'Thank you for helping other shoppers verify this coupon.',
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setDealType('all');
    setSortBy('popular');
    setActiveStoreSlug(null);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedCategory !== 'All' || dealType !== 'all'
  );

  // Focus Search handler
  const handleFocusSearch = () => {
    setActiveStoreSlug(null);
    const searchEl = document.getElementById('hero-search-input');
    if (searchEl) {
      searchEl.focus();
      searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    let result = [...coupons];

    if (activeTab === 'coupons') {
      result = result.filter((c) => !c.isDeal);
    } else if (activeTab === 'deals') {
      result = result.filter((c) => c.isDeal);
    }

    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory);
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
      if (sortBy === 'popular') {
        return (b.usesCount + b.upvotes) - (a.usesCount + a.upvotes);
      }
      if (sortBy === 'discount') {
        return b.discountValueNum - a.discountValueNum;
      }
      if (sortBy === 'newest') {
        return (b.isCommunity ? 1 : 0) - (a.isCommunity ? 1 : 0);
      }
      if (sortBy === 'expiring') {
        const aHours = computeHoursLeftFromDate(a.expiryDate) ?? a.expiryHoursLeft ?? Number.MAX_SAFE_INTEGER;
        const bHours = computeHoursLeftFromDate(b.expiryDate) ?? b.expiryHoursLeft ?? Number.MAX_SAFE_INTEGER;
        return aHours - bHours;
      }
      return 0;
    });

    return result;
  }, [coupons, activeTab, selectedCategory, dealType, searchQuery, sortBy]);

  const currentStoreInfo = activeStoreSlug
    ? stores[activeStoreSlug.toLowerCase()]
    : null;

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
    const displayName = idOk ? adminCreds.adminName : rawId.split('@')[0] || adminCreds.adminName;
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
                onClick={() => {
                  setViewMode('website');
                  window.location.hash = '#/';
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
                    placeholder="Enter admin ID"
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
                    Default ID: <span className="text-white font-mono">admin</span> · Password: <span className="text-white font-mono">admin</span>
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
            window.location.hash = nav === 'dashboard' ? '#/admin' : `#/admin/${nav}`;
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
            window.location.hash = '#/';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          initialMode={loginModalMode}
        />

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-orange-500/20 selection:text-orange-950">
      
      {/* Top Header */}
      <Header
        onOpenLogin={() => {
          setLoginModalMode('shopper');
          setIsLoginModalOpen(true);
        }}
        onOpenBackendLogin={() => {
          setLoginModalMode('admin');
          setIsLoginModalOpen(true);
        }}
        onLogout={handleLogout}
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => navigateToTab(tab)}
        onResetFilters={handleResetFilters}
        onFocusSearch={handleFocusSearch}
        onOpenAdmin={() => {
          setViewMode('admin');
          window.location.hash = '#/admin';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Hero Section (only shown on home page when not in dedicated sub-pages) */}
      {!activeCoupon && !activeStoreSlug && activeTab === 'home' && (
        <HeroSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={() => {
            const listEl = document.getElementById('deals-list-anchor');
            if (listEl) listEl.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectStore={navigateToStore}
          onCopyCode={handleCopyCode}
          coupons={coupons}
          stores={stores}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        
        {/* VIEW 1: DEDICATED INDIVIDUAL COUPON PAGE */}
        {activeCoupon ? (
          <CouponDetailPage
            coupon={activeCoupon}
            store={stores[activeCoupon.storeSlug.toLowerCase()]}
            allCoupons={coupons}
            onBack={() => {
              setActiveCoupon(null);
              window.location.hash = '#/';
            }}
            onSelectCoupon={navigateToCoupon}
            onSelectStore={navigateToStore}
            onCopyCode={handleCopyCode}
            onVote={handleVote}
            onOpenReviewModal={(c) => setActiveReviewCoupon(c)}
          />
        ) : activeStoreSlug && currentStoreInfo ? (
          /* VIEW 2: DEDICATED STORE PAGE */
          <StorePage
            store={currentStoreInfo}
            coupons={coupons}
            onBack={() => {
              setActiveStoreSlug(null);
              window.location.hash = '#/';
            }}
            onCopyCode={handleCopyCode}
            onOpenDetails={navigateToCoupon}
            onVote={handleVote}
            onOpenReviewModal={(c) => setActiveReviewCoupon(c)}
          />
        ) : activeTab === 'stores' ? (
          /* VIEW 3: DEDICATED STORES DIRECTORY PAGE */
          <StoresDirectoryPage
            stores={stores}
            onSelectStore={navigateToStore}
            onBackToHome={() => navigateToTab('home')}
          />
        ) : activeTab === 'blog' ? (
          /* VIEW 4: DEDICATED BLOG VIEW */
          <BlogSection blogs={blogs} onBackToDeals={() => navigateToTab('home')} />
        ) : (
          /* VIEW 5: HOMEPAGE / DEDICATED COUPONS, DEALS & CATEGORIES VIEW */
          <>
            {activeTab !== 'home' && (
              <div className="bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black font-heading text-white">
                    {activeTab === 'coupons'
                      ? 'Verified Promo Codes & Coupons'
                      : activeTab === 'deals'
                      ? 'Direct Online Sales & Deals'
                      : 'Browse Deals by Category'}
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">
                    {activeTab === 'coupons'
                      ? 'Copy verified promo codes to apply instant discounts at checkout.'
                      : activeTab === 'deals'
                      ? 'Direct deals with price reductions automatically applied at retailer checkout.'
                      : 'Select a shopping category below to filter verified promo codes and store discounts.'}
                  </p>
                </div>
                <button
                  onClick={() => navigateToTab('home')}
                  className="text-xs font-bold text-orange-400 hover:text-white bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  &larr; Back to Home
                </button>
              </div>
            )}

            {/* Category Grid placed prominently at top when browsing Categories tab */}
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

            {/* 1. Top Stores Grid (Homepage) */}
            {activeTab === 'home' && (
              <div id="stores-grid-anchor">
                <TopStoresGrid
                  stores={stores}
                  coupons={coupons}
                  onSelectStore={navigateToStore}
                  onViewAllStores={() => navigateToTab('stores')}
                />
              </div>
            )}

            {/* 2. Featured Deals Section (Homepage) */}
            {activeTab === 'home' && (
              <FeaturedDealsSection
                coupons={coupons}
                onCopyCode={handleCopyCode}
                onOpenDetails={navigateToCoupon}
                onSelectStore={navigateToStore}
                onViewAllFeatured={() => {
                  const listEl = document.getElementById('deals-list-anchor');
                  if (listEl) listEl.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* 3. Main Split Grid: Left Deals List & Right Sidebar */}
            <div id="deals-list-anchor" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
              
              {/* Left Column: All Coupons List & Controls */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Deal Controls Bar */}
                <DealControlsBar
                  dealType={dealType}
                  setDealType={setDealType}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  totalResults={filteredCoupons.length}
                  hasActiveFilters={hasActiveFilters}
                  onResetFilters={handleResetFilters}
                />

                {/* Coupons List */}
                {filteredCoupons.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCoupons.map((coupon) => (
                      <CouponCard
                        key={coupon.id}
                        coupon={coupon}
                        onCopyCode={handleCopyCode}
                        onOpenDetails={navigateToCoupon}
                        onVote={handleVote}
                        onOpenReviewModal={(c) => setActiveReviewCoupon(c)}
                        onSelectStore={navigateToStore}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-heading">
                        No coupons found matching your criteria
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Try clearing search terms or reset filters to see all verified codes.
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center">
                      <button
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

              {/* Right Column: Popular Deals & Newsletter Widget */}
              <div className="lg:col-span-4">
                <SidebarDealsWidget
                  popularCoupons={coupons}
                  onSelectCoupon={navigateToCoupon}
                  onSelectStore={navigateToStore}
                  onViewAllDeals={() => {
                    navigateToTab('deals');
                  }}
                  onSubscribe={(email) => {
                    setToast({
                      message: `Subscribed ${email}!`,
                      subMessage: 'You will now receive the freshest verified promo codes.',
                    });
                  }}
                />
              </div>

            </div>

            {/* 4. Shop by Category Grid (shown below deals on non-category tabs) */}
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
        onSelectNav={(tab) => {
          navigateToTab(tab);
        }}
        onSubscribe={(email) => {
          setToast({
            message: `Subscribed ${email}!`,
            subMessage: 'Weekly top coupons and seasonal alerts will be delivered to your inbox.',
          });
        }}
        onOpenAdminPortal={() => {
          setViewMode('admin');
          window.location.hash = '#/admin';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals & Dialogs */}
      <CouponModal
        coupon={activeCouponModal}
        onClose={() => setActiveCouponModal(null)}
        onCopyCode={handleCopyCode}
        onVote={handleVote}
      />

      <CouponReviewModal
        coupon={activeReviewCoupon}
        isOpen={Boolean(activeReviewCoupon)}
        onClose={() => setActiveReviewCoupon(null)}
        onSubmitReview={handleAddReview}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={loginModalMode}
      />

      {/* Floating Multi-Turn Deal Assistant Chatbot */}
      <SavingsChatWidget coupons={coupons} stores={stores} />

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
