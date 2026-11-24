import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Tag,
  Store,
  FolderTree,
  Link2,
  BarChart3,
  Users,
  Settings,
  Search,
  Bell,
  Plus,
  MousePointerClick,
  ExternalLink,
  Edit3,
  Copy,
  Trash2,
  ChevronRight,
  ArrowUpRight,
  Eye,
  ShieldCheck,
  Rocket,
  LogOut,
  Layers,
  Check,
  BookOpen,
  Star,
  PauseCircle,
  Menu,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Category, Coupon, StoreInfo, BlogPost } from '../../types/coupon';
import { computeHoursLeftFromDate } from '../../utils/expiry';
import { STORES_DATA } from '../../data/coupons';
import { BLOG_POSTS } from '../../data/blogs';
import { CouponActionModal } from './CouponActionModal';
import { StoreActionModal } from './StoreActionModal';
import { EditCouponModal } from './EditCouponModal';
import { EditStoreModal } from './EditStoreModal';
import { WriteBlogModal } from './WriteBlogModal';
import { EditBlogModal } from './EditBlogModal';
import { AdminSettings } from './AdminSettings';

type AdminNav =
  | 'dashboard'
  | 'coupons'
  | 'sort-coupons'
  | 'stores'
  | 'blogs'
  | 'categories'
  | 'affiliates'
  | 'analytics'
  | 'users'
  | 'settings';

const ALL_CATEGORIES: Category[] = [
  'Tech & Electronics',
  'Fashion & Apparel',
  'Food & Dining',
  'Hosting & Software',
  'Travel & Flights',
  'Beauty & Wellness',
  'Home & Lifestyle',
  'Entertainment & Gaming',
  'Sports',
  'Toys & Games',
];

const DONUT_COLORS = ['#FF6600', '#F59E0B', '#10B981', '#3B82F6', '#64748B'];

interface AdminDashboardProps {
  coupons: Coupon[];
  stores?: Record<string, StoreInfo>;
  blogs?: BlogPost[];
  activeNav?: AdminNav;
  onNavChange?: (nav: AdminNav) => void;
  onAddCoupon: (coupon: Coupon) => void;
  onAddAllCoupons: (coupons: Coupon[]) => void;
  onUpdateCoupon?: (coupon: Coupon) => void;
  onDeleteCoupon: (couponId: string) => void;
  onToggleCouponStatus: (couponId: string) => void;
  onReorderCoupons?: (reorderedCoupons: Coupon[], storeLabel?: string) => void;
  onViewWebsite: () => void;
  onAddStore: (store: StoreInfo) => void;
  onAddAllStores: (stores: StoreInfo[]) => void;
  onUpdateStore?: (store: StoreInfo) => void;
  onDeleteStore?: (slug: string) => void;
  onNavigateToStore?: (slug: string) => void;
  onNavigateToCoupon?: (coupon: Coupon) => void;
  onAddBlog?: (blog: BlogPost) => void;
  onUpdateBlog?: (blog: BlogPost) => void;
  onDeleteBlog?: (blogId: string) => void;
  currentUser?: { name: string; email: string; role?: 'admin' | 'shopper' } | null;
  onUpdateCurrentUser?: (user: { name: string; email: string; role?: 'admin' | 'shopper' }) => void;
  onShowToast?: (message: string, subMessage?: string) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  coupons,
  stores,
  blogs,
  activeNav: propActiveNav,
  onNavChange,
  onAddCoupon,
  onAddAllCoupons,
  onUpdateCoupon,
  onDeleteCoupon,
  onToggleCouponStatus,
  onReorderCoupons,
  onViewWebsite,
  onAddStore,
  onAddAllStores,
  onUpdateStore,
  onDeleteStore,
  onNavigateToStore,
  onNavigateToCoupon,
  onAddBlog,
  onUpdateBlog,
  onDeleteBlog,
  currentUser,
  onUpdateCurrentUser,
  onShowToast,
  onLogout,
}) => {
  const [internalNav, setInternalNav] = useState<AdminNav>('dashboard');
  const activeNav = propActiveNav || internalNav;

  const setActiveNav = (nav: AdminNav) => {
    setInternalNav(nav);
    setIsMobileSidebarOpen(false);
    if (onNavChange) {
      onNavChange(nav);
    } else {
      window.location.hash = nav === 'dashboard' ? '#/admin' : `#/admin/${nav}`;
    }
  };

  const [isCouponActionOpen, setIsCouponActionOpen] = useState(false);
  const [isStoreActionOpen, setIsStoreActionOpen] = useState(false);
  const [storeModalMode, setStoreModalMode] = useState<'single' | 'bulk'>('single');
  const [couponModalMode, setCouponModalMode] = useState<'single' | 'bulk'>('single');

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isEditCouponOpen, setIsEditCouponOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreInfo | null>(null);
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);

  const [isWriteBlogOpen, setIsWriteBlogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isEditBlogOpen, setIsEditBlogOpen] = useState(false);
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('All');

  const [searchQuery, setSearchQuery] = useState('');
  const [storeCategoryFilter, setStoreCategoryFilter] = useState<string>('All');
  const [couponCategoryFilter, setCouponCategoryFilter] = useState<string>('All');
  const [couponSortBy, setCouponSortBy] = useState<
    'newest' | 'popular' | 'discount' | 'expiring' | 'store' | 'status'
  >('newest');

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsCleared, setNotificationsCleared] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedAffiliateId, setCopiedAffiliateId] = useState<string | null>(null);

  // Manual Sort Coupon state (drag & drop + up/down per store or all coupons)
  const [sortStoreFilter, setSortStoreFilter] = useState<string>('all');
  const [draftSortedCoupons, setDraftSortedCoupons] = useState<Coupon[]>(coupons);
  const [hasUnsavedSort, setHasUnsavedSort] = useState(false);
  const [draggedCouponId, setDraggedCouponId] = useState<string | null>(null);
  const [dragOverCouponId, setDragOverCouponId] = useState<string | null>(null);

  useEffect(() => {
    setDraftSortedCoupons(coupons);
    setHasUnsavedSort(false);
  }, [coupons]);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleOpenStoreModal = (mode: 'single' | 'bulk' = 'single') => {
    setStoreModalMode(mode);
    setIsStoreActionOpen(true);
  };

  const handleOpenCouponModal = (mode: 'single' | 'bulk' = 'single') => {
    setCouponModalMode(mode);
    setIsCouponActionOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsEditCouponOpen(true);
  };

  const handleEditStore = (store: StoreInfo) => {
    setEditingStore(store);
    setIsEditStoreOpen(true);
  };

  const handleEditBlog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setIsEditBlogOpen(true);
  };

  const triggerConfirmDelete = (key: string, action: () => void) => {
    if (confirmDeleteId === key) {
      setConfirmDeleteId(null);
      action();
    } else {
      setConfirmDeleteId(key);
      setTimeout(() => {
        setConfirmDeleteId((curr) => (curr === key ? null : curr));
      }, 4000);
    }
  };

  // Dynamic records
  const allStoresRecord = stores || STORES_DATA;
  const storesList = useMemo(() => Object.values(allStoresRecord), [allStoresRecord]);
  const allBlogsList = useMemo(() => blogs || BLOG_POSTS, [blogs]);

  // Filtered views
  const filteredStoresList = useMemo(() => {
    return storesList.filter((s) => {
      if (storeCategoryFilter !== 'All' && s.category !== storeCategoryFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.website.toLowerCase().includes(q)
      );
    });
  }, [storesList, storeCategoryFilter, searchQuery]);

  const displayedCoupons = useMemo(() => {
    const filtered = coupons.filter((c) => {
      if (couponCategoryFilter !== 'All' && c.category !== couponCategoryFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.store.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.code && c.code.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
      );
    });

    if (couponSortBy === 'newest') return filtered;

    return [...filtered].sort((a, b) => {
      if (couponSortBy === 'popular') {
        return (b.usesCount || 0) - (a.usesCount || 0);
      }
      if (couponSortBy === 'discount') {
        return (b.discountValueNum || 0) - (a.discountValueNum || 0);
      }
      if (couponSortBy === 'expiring') {
        const aHours = computeHoursLeftFromDate(a.expiryDate) ?? a.expiryHoursLeft ?? Number.MAX_SAFE_INTEGER;
        const bHours = computeHoursLeftFromDate(b.expiryDate) ?? b.expiryHoursLeft ?? Number.MAX_SAFE_INTEGER;
        return aHours - bHours;
      }
      if (couponSortBy === 'store') {
        return a.store.localeCompare(b.store);
      }
      if (couponSortBy === 'status') {
        return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      }
      return 0;
    });
  }, [coupons, couponCategoryFilter, couponSortBy, searchQuery]);

  const filteredBlogsList = useMemo(() => {
    return allBlogsList.filter((b) => {
      if (blogCategoryFilter !== 'All' && b.category !== blogCategoryFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q)
      );
    });
  }, [allBlogsList, blogCategoryFilter, searchQuery]);

  // Real live KPI metrics
  const kpis = useMemo(() => {
    const verifiedCount = coupons.filter((c) => c.verified).length;
    const pausedOrExpiring = coupons.filter(
      (c) => !c.verified || (c.expiryHoursLeft !== undefined && c.expiryHoursLeft <= 24)
    ).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usesCount || 0), 0);
    const avgSuccess =
      coupons.length > 0
        ? Math.round(coupons.reduce((sum, c) => sum + (c.successRate || 95), 0) / coupons.length)
        : 0;
    const avgStoreRating =
      storesList.length > 0
        ? (storesList.reduce((sum, s) => sum + (s.rating || 4.8), 0) / storesList.length).toFixed(1)
        : '0.0';
    return {
      totalCoupons: coupons.length,
      verifiedCount,
      pausedOrExpiring,
      totalRedemptions,
      avgSuccess,
      avgStoreRating,
      totalStores: storesList.length,
      totalBlogs: allBlogsList.length,
    };
  }, [coupons, storesList, allBlogsList]);

  // Dynamic store breakdown donut from real coupons
  const storeClickShare = useMemo(() => {
    const totals = new Map<string, number>();
    coupons.forEach((c) => {
      totals.set(c.store, (totals.get(c.store) || 0) + Math.max(1, c.usesCount || 0));
    });
    const sorted = Array.from(totals.entries())
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks);
    const grandTotal = sorted.reduce((sum, item) => sum + item.clicks, 0) || 1;
    const top4 = sorted.slice(0, 4);
    const othersClicks = sorted.slice(4).reduce((sum, item) => sum + item.clicks, 0);
    const segments = [
      ...top4,
      ...(othersClicks > 0 ? [{ name: 'Others', clicks: othersClicks }] : []),
    ];

    let offset = 0;
    return segments.map((seg, idx) => {
      const pct = Math.max(1, Math.round((seg.clicks / grandTotal) * 100));
      const dashOffset = -offset;
      offset += pct;
      return {
        ...seg,
        pct,
        dashOffset,
        color: DONUT_COLORS[idx % DONUT_COLORS.length],
      };
    });
  }, [coupons]);

  // Dynamic category counts from live coupons
  const categoryStats = useMemo(() => {
    return ALL_CATEGORIES.map((cat) => {
      const catCoupons = coupons.filter((c) => c.category === cat);
      const catStores = storesList.filter((s) => s.category === cat);
      const totalUses = catCoupons.reduce((sum, c) => sum + (c.usesCount || 0), 0);
      return {
        name: cat,
        couponCount: catCoupons.length,
        storeCount: catStores.length,
        totalUses,
      };
    }).sort((a, b) => b.couponCount - a.couponCount || b.totalUses - a.totalUses);
  }, [coupons, storesList]);

  // Notifications derived from real store & coupon state
  const notifications = useMemo(() => {
    const items: { id: string; title: string; detail: string; actionNav: AdminNav }[] = [];
    const expiring = coupons.filter(
      (c) => c.expiryHoursLeft !== undefined && c.expiryHoursLeft <= 24
    );
    if (expiring.length > 0) {
      items.push({
        id: 'notif-expiring',
        title: `${expiring.length} deal${expiring.length > 1 ? 's' : ''} expiring within 24h`,
        detail: `Includes ${expiring[0].store} (${expiring[0].discountBadge})`,
        actionNav: 'coupons',
      });
    }
    const paused = coupons.filter((c) => !c.verified);
    if (paused.length > 0) {
      items.push({
        id: 'notif-paused',
        title: `${paused.length} coupon${paused.length > 1 ? 's' : ''} paused / unverified`,
        detail: 'Review status toggles in Coupons Management.',
        actionNav: 'coupons',
      });
    }
    items.push({
      id: 'notif-catalog',
      title: `${storesList.length} partner stores & ${allBlogsList.length} articles active`,
      detail: `${kpis.totalRedemptions.toLocaleString()} total redemptions recorded.`,
      actionNav: 'analytics',
    });
    return items;
  }, [coupons, storesList.length, allBlogsList.length, kpis.totalRedemptions]);

  const adminInitial = (currentUser?.name || 'Admin').slice(0, 1).toUpperCase();

  const handleCopyAffiliateUrl = (coupon: Coupon) => {
    const url = /^https?:\/\//i.test(coupon.storeUrl) ? coupon.storeUrl : `https://${coupon.storeUrl}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedAffiliateId(coupon.id);
    if (onShowToast) {
      onShowToast('Affiliate Link Copied', `${coupon.store} tracking URL copied to clipboard.`);
    }
    setTimeout(() => setCopiedAffiliateId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-[#FF6600]/30 selection:text-white">
      {/* 1. Sidebar Navigation */}
      <aside
        className={`${
          isMobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden lg:flex'
        } w-64 bg-[#0B0F17] border-r border-slate-800/80 flex-col justify-between shrink-0`}
      >
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src="/assets/aistudio/Codecoupon_Logo_on_Dark_Canvas_73907f6d.png"
                  alt="CodeCoupon"
                  className="w-full h-full object-contain scale-110"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-heading">
                Code<span className="text-[#FF6600]">coupon</span>
              </span>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="p-4 space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveNav('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeNav === 'dashboard'
                  ? 'bg-[#FF6600] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>

            <div className="space-y-1">
              <button
                onClick={() => setActiveNav('coupons')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeNav === 'coupons' || activeNav === 'sort-coupons'
                    ? 'bg-[#FF6600] text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4" />
                  <span>Coupons</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/25 text-white font-mono">
                  {coupons.length}
                </span>
              </button>

              {/* Submenu under Coupons: Add Coupon, All Coupon, Sort Coupon */}
              <div className="ml-4 pl-3 border-l border-slate-800 space-y-0.5 py-1">
                <button
                  onClick={() => handleOpenCouponModal('single')}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-900/70 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FF6600]" />
                  <span>Add Coupon</span>
                </button>
                <button
                  onClick={() => setActiveNav('coupons')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    activeNav === 'coupons'
                      ? 'text-[#FF6600] bg-orange-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/70'
                  }`}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>All Coupon</span>
                </button>
                <button
                  onClick={() => setActiveNav('sort-coupons')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    activeNav === 'sort-coupons'
                      ? 'text-[#FF6600] bg-orange-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/70'
                  }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Sort Coupon</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveNav('stores')}
                className={`flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeNav === 'stores'
                    ? 'bg-[#FF6600] text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4" />
                  <span>Stores</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {storesList.length}
                </span>
              </button>
              <button
                onClick={() => handleOpenStoreModal('single')}
                title="Add Store"
                className="p-2 rounded-xl bg-[#121824] hover:bg-[#FF6600] text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-800 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveNav('blogs')}
                className={`flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeNav === 'blogs'
                    ? 'bg-[#FF6600] text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4" />
                  <span>Blogs & Guides</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {allBlogsList.length}
                </span>
              </button>
              <button
                onClick={() => setIsWriteBlogOpen(true)}
                title="Write Blog Article"
                className="p-2 rounded-xl bg-[#121824] hover:bg-[#FF6600] text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-800 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setActiveNav('categories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeNav === 'categories'
                  ? 'bg-[#FF6600] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderTree className="w-4 h-4" />
                <span>Categories</span>
              </div>
            </button>

            <button
              onClick={() => setActiveNav('affiliates')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeNav === 'affiliates'
                  ? 'bg-[#FF6600] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Link2 className="w-4 h-4" />
                <span>Affiliate Links</span>
              </div>
            </button>

            <button
              onClick={() => setActiveNav('analytics')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeNav === 'analytics'
                  ? 'bg-[#FF6600] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </button>

            <button
              onClick={() => setActiveNav('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeNav === 'users'
                  ? 'bg-[#FF6600] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Accounts</span>
              </div>
            </button>

            <button
              onClick={() => setActiveNav('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeNav === 'settings'
                  ? 'bg-[#FF6600] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom CTA */}
        <div className="p-4">
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#161B26] to-[#0E131E] border border-orange-500/20 shadow-md space-y-2.5 text-center">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-[#FF6600] flex items-center justify-center mx-auto shadow-inner">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-heading">Performance Report</h4>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Track store click-throughs and verified code performance.
              </p>
            </div>
            <button
              onClick={() => setActiveNav('analytics')}
              className="w-full py-2 px-3 bg-[#FF6600] hover:bg-[#FA5A00] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Open Analytics
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* 2. Main Dashboard Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 px-4 md:px-6 bg-[#0B0F17] border-b border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              aria-label="Open admin menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative max-w-xs md:max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coupons, stores, categories..."
                className="w-full pl-9 pr-4 py-2 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6600] transition-colors"
              />
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenStoreModal('single')}
              className="flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl bg-[#FF6600] hover:bg-[#FA5A00] text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Add Store</span>
            </button>

            <button
              onClick={() => handleOpenCouponModal('single')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141B28] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-bold active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#FF6600]" />
              <span>Add Coupon</span>
            </button>
          </div>

          {/* Right Controls: View Website, Notifications, Profile */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onViewWebsite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Open public storefront"
            >
              <span className="hidden md:inline">View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#FF6600]" />
            </button>

            {/* Interactive Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Activity Notifications"
                aria-label="Activity Notifications"
              >
                <Bell className="w-4 h-4" />
                {!notificationsCleared && notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF6600] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {notifications.length}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0E131F] border border-slate-700/80 shadow-2xl p-3 z-50 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">System Activity</span>
                    <button
                      onClick={() => setNotificationsCleared(true)}
                      className="text-[10px] text-[#FF6600] hover:underline font-semibold cursor-pointer"
                    >
                      Mark read
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          setActiveNav(n.actionNav);
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-[#121824] hover:bg-slate-800/80 transition-colors cursor-pointer"
                      >
                        <div className="text-xs font-bold text-white">{n.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{n.detail}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6600] to-amber-600 flex items-center justify-center font-black text-xs text-white border border-orange-400/40 shrink-0">
                {adminInitial}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <span className="font-bold text-white block truncate max-w-[120px]">
                  {currentUser?.name || 'Super Admin'}
                </span>
                <span className="text-[11px] text-slate-400 block truncate max-w-[120px]">
                  {currentUser?.email || 'admin@codecoupon.com'}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-800 ml-1"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Sub-page Breadcrumb & Tabs Bar */}
        <div className="bg-[#0A0E17]/95 border-b border-slate-800 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="text-slate-400 font-medium">Admin Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold capitalize flex items-center gap-1.5 bg-[#141B28] px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-xs">
              {activeNav === 'dashboard' && (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#FF6600]" /> Overview
                </>
              )}
              {activeNav === 'stores' && (
                <>
                  <Store className="w-3.5 h-3.5 text-[#FF6600]" /> Stores Management
                </>
              )}
              {activeNav === 'coupons' && (
                <>
                  <Tag className="w-3.5 h-3.5 text-[#FF6600]" /> All Coupons
                </>
              )}
              {activeNav === 'sort-coupons' && (
                <>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#FF6600]" /> Sort Coupon
                </>
              )}
              {activeNav === 'blogs' && (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-[#FF6600]" /> Blogs & Guides
                </>
              )}
              {activeNav === 'categories' && (
                <>
                  <FolderTree className="w-3.5 h-3.5 text-[#FF6600]" /> Categories
                </>
              )}
              {activeNav === 'affiliates' && (
                <>
                  <Link2 className="w-3.5 h-3.5 text-[#FF6600]" /> Affiliate Links
                </>
              )}
              {activeNav === 'analytics' && (
                <>
                  <BarChart3 className="w-3.5 h-3.5 text-[#FF6600]" /> Analytics
                </>
              )}
              {activeNav === 'users' && (
                <>
                  <Users className="w-3.5 h-3.5 text-[#FF6600]" /> Accounts
                </>
              )}
              {activeNav === 'settings' && (
                <>
                  <Settings className="w-3.5 h-3.5 text-[#FF6600]" /> Settings
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveNav('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNav === 'dashboard'
                  ? 'bg-[#FF6600] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveNav('stores')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNav === 'stores'
                  ? 'bg-[#FF6600] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Stores</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono font-medium">
                {storesList.length}
              </span>
            </button>
            <button
              onClick={() => setActiveNav('coupons')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNav === 'coupons'
                  ? 'bg-[#FF6600] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Coupons</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono font-medium">
                {coupons.length}
              </span>
            </button>
            <button
              onClick={() => setActiveNav('sort-coupons')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNav === 'sort-coupons'
                  ? 'bg-[#FF6600] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort Coupon</span>
            </button>
            <button
              onClick={() => setActiveNav('blogs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNav === 'blogs'
                  ? 'bg-[#FF6600] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Blogs</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono font-medium">
                {allBlogsList.length}
              </span>
            </button>
            <button
              onClick={() => setActiveNav('settings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNav === 'settings'
                  ? 'bg-[#FF6600] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Dashboard Main Area */}
        <main className="p-4 md:p-8 space-y-8 flex-1">
          {/* 1. OVERVIEW TAB (Simple & Clean) */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6">
              {/* Simple Header & Primary Actions */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0E131F] border border-slate-800/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-white font-heading">Dashboard Overview</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Quick summary of your stores, coupons, and blog posts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleOpenStoreModal('single')}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-[#FF6600] hover:bg-[#FA5A00] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Store</span>
                  </button>

                  <button
                    onClick={() => handleOpenCouponModal('single')}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-[#121824] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FF6600]" />
                    <span>Add Coupon</span>
                  </button>

                  <button
                    onClick={() => setIsWriteBlogOpen(true)}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-[#121824] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#FF6600]" />
                    <span>Write Blog</span>
                  </button>

                  <button
                    onClick={onViewWebsite}
                    className="px-3.5 py-2 bg-[#121824] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Open Storefront"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Storefront</span>
                  </button>
                </div>
              </div>

              {/* 4 Clean Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveNav('stores')}
                  className="text-left p-5 rounded-2xl bg-[#0E131F] border border-slate-800/80 hover:border-[#FF6600]/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-[#FF6600] flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-[#FF6600] transition-colors" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums">
                    {kpis.totalStores}
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">Partner Stores</div>
                  <div className="text-[11px] text-slate-400 mt-1">Manage store profiles</div>
                </button>

                <button
                  onClick={() => setActiveNav('coupons')}
                  className="text-left p-5 rounded-2xl bg-[#0E131F] border border-slate-800/80 hover:border-emerald-500/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <Tag className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums">
                    {kpis.totalCoupons}
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">Coupons & Deals</div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    {kpis.verifiedCount} verified live
                  </div>
                </button>

                <button
                  onClick={() => setActiveNav('analytics')}
                  className="text-left p-5 rounded-2xl bg-[#0E131F] border border-slate-800/80 hover:border-blue-500/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                      <MousePointerClick className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums">
                    {kpis.totalRedemptions.toLocaleString()}
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">Total Uses</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {kpis.avgSuccess}% avg success rate
                  </div>
                </button>

                <button
                  onClick={() => setActiveNav('blogs')}
                  className="text-left p-5 rounded-2xl bg-[#0E131F] border border-slate-800/80 hover:border-indigo-500/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums">
                    {kpis.totalBlogs}
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">Blog Articles</div>
                  <div className="text-[11px] text-slate-400 mt-1">Published guides</div>
                </button>
              </div>

              {/* Clean 2-Column Recent Coupons & Recent Stores */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Recent Coupons */}
                <div className="lg:col-span-7 bg-[#0E131F] border border-slate-800/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#FF6600]" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                        Recent Coupons
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveNav('coupons')}
                      className="text-xs font-semibold text-[#FF6600] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {displayedCoupons.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-2.5">Store</th>
                            <th className="py-2.5 px-2.5">Offer</th>
                            <th className="py-2.5 px-2.5">Discount</th>
                            <th className="py-2.5 px-2.5">Status</th>
                            <th className="py-2.5 px-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {displayedCoupons.slice(0, 5).map((coupon) => {
                            const cLogo = coupon.logoUrl || coupon.storeLogoUrl;
                            const isConfirming = confirmDeleteId === `c-${coupon.id}`;
                            return (
                              <tr key={coupon.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="py-3 px-2.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-7 h-7 rounded-lg ${
                                        cLogo ? 'bg-white' : coupon.storeLogoBg
                                      } text-white flex items-center justify-center font-bold text-[10px] overflow-hidden shrink-0`}
                                    >
                                      {cLogo ? (
                                        <img
                                          src={cLogo}
                                          alt={coupon.store}
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-contain p-0.5"
                                        />
                                      ) : (
                                        coupon.storeLogoText.slice(0, 3)
                                      )}
                                    </div>
                                    <span className="font-bold text-white truncate max-w-[90px]">
                                      {coupon.store}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-2.5 max-w-[190px]">
                                  <div className="truncate text-slate-200 font-medium">{coupon.title}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    {coupon.code ? coupon.code : 'Direct Deal'}
                                  </div>
                                </td>
                                <td className="py-3 px-2.5 font-bold text-[#FF6600] font-mono whitespace-nowrap">
                                  {coupon.discountBadge}
                                </td>
                                <td className="py-3 px-2.5">
                                  <button
                                    onClick={() => onToggleCouponStatus(coupon.id)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-colors ${
                                      coupon.verified
                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                                    }`}
                                    title="Click to toggle status"
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        coupon.verified ? 'bg-emerald-400' : 'bg-amber-400'
                                      }`}
                                    />
                                    <span>{coupon.verified ? 'Verified' : 'Paused'}</span>
                                  </button>
                                </td>
                                <td className="py-3 px-2.5 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handleEditCoupon(coupon)}
                                      className="p-1 text-slate-400 hover:text-[#FF6600] rounded hover:bg-slate-800 transition-colors cursor-pointer"
                                      title="Edit Coupon"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        triggerConfirmDelete(`c-${coupon.id}`, () =>
                                          onDeleteCoupon(coupon.id)
                                        )
                                      }
                                      className={`px-1.5 py-1 rounded transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1 ${
                                        isConfirming
                                          ? 'bg-rose-600 text-white'
                                          : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                                      }`}
                                      title={isConfirming ? 'Click again to delete' : 'Delete Coupon'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      {isConfirming && <span>Confirm</span>}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No coupons match your filter.
                    </div>
                  )}
                </div>

                {/* Recent Stores */}
                <div className="lg:col-span-5 bg-[#0E131F] border border-slate-800/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#FF6600]" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                        Recent Stores
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveNav('stores')}
                      className="text-xs font-semibold text-[#FF6600] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {storesList.slice(0, 5).map((s) => (
                      <div
                        key={s.slug || s.name}
                        className="p-3 rounded-xl bg-[#121824] border border-slate-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg ${
                              s.logoUrl ? 'bg-white' : s.logoBg || 'bg-[#FF6600]'
                            } text-white flex items-center justify-center font-bold text-[10px] overflow-hidden shrink-0`}
                          >
                            {s.logoUrl ? (
                              <img
                                src={s.logoUrl}
                                alt={s.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain p-0.5"
                              />
                            ) : s.logoText ? (
                              s.logoText.slice(0, 3).toUpperCase()
                            ) : (
                              s.name.slice(0, 3).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{s.name}</div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {s.category} • {s.bestDiscount || 'Active'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={/^https?:\/\//i.test(s.website) ? s.website : `https://${s.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-[#FF6600] rounded-lg hover:bg-slate-800 transition-colors"
                            title="Visit Website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleEditStore(s)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Store"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. STORES MANAGEMENT VIEW */}
          {activeNav === 'stores' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141B28] via-[#0E131F] to-[#141B28] border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-[#FF6600] flex items-center justify-center border border-orange-500/30 shrink-0">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-white font-heading">
                      Stores & Retail Partners
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Add, edit logos, and manage partner stores ({storesList.length} total stores)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => handleOpenStoreModal('single')}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF6600] hover:bg-[#FA5A00] text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Store</span>
                  </button>

                  <button
                    onClick={() => handleOpenStoreModal('bulk')}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#121824] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-[#FF6600]" />
                    <span>Import Catalog</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-xl bg-[#0E131F] border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Total Stores</span>
                  <div className="text-xl font-black text-white font-mono mt-0.5">{storesList.length}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0E131F] border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Active Offers</span>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{coupons.length}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0E131F] border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Average Rating</span>
                  <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                    {kpis.avgStoreRating} / 5.0
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#0E131F] border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">With Custom Logos</span>
                  <div className="text-xl font-black text-blue-400 font-mono mt-0.5">
                    {storesList.filter((s) => Boolean(s.logoUrl)).length}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0E131F] border border-slate-800/80 p-4 rounded-2xl">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stores by name, category, or website..."
                    className="w-full pl-9 pr-4 py-2 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs text-slate-400 font-semibold shrink-0">Filter:</span>
                  <select
                    value={storeCategoryFilter}
                    onChange={(e) => setStoreCategoryFilter(e.target.value)}
                    className="bg-[#121824] border border-slate-700/80 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#FF6600]"
                  >
                    <option value="All">All Categories</option>
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStoresList.map((store) => {
                  const storeCoupons = coupons.filter(
                    (c) =>
                      c.storeSlug.toLowerCase() === store.slug.toLowerCase() ||
                      c.store.toLowerCase() === store.name.toLowerCase()
                  );
                  const isConfirming = confirmDeleteId === `s-${store.slug}`;

                  return (
                    <div
                      key={store.slug || store.name}
                      className="p-5 rounded-2xl bg-[#0E131F] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-12 h-12 rounded-xl ${
                                store.logoUrl ? 'bg-white' : store.logoBg || 'bg-[#FF6600]'
                              } text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md font-heading overflow-hidden`}
                            >
                              {store.logoUrl ? (
                                <img
                                  src={store.logoUrl}
                                  alt={store.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : store.logoText ? (
                                store.logoText.slice(0, 3).toUpperCase()
                              ) : (
                                store.name.slice(0, 3).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-white text-sm truncate group-hover:text-[#FF6600] transition-colors">
                                {store.name}
                              </h3>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {store.category}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono shrink-0">
                            {store.bestDiscount || 'Active Deals'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 mt-3 leading-relaxed">
                          {store.description}
                        </p>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                          <span className="font-mono text-slate-300">
                            <strong className="text-white">{storeCoupons.length}</strong> coupons linked
                          </span>
                          <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                            <Star className="w-3.5 h-3.5 fill-amber-400" /> {store.rating || 4.8}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <a
                            href={/^https?:\/\//i.test(store.website) ? store.website : `https://${store.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                          >
                            <span>Site</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {onNavigateToStore && (
                            <button
                              onClick={() => onNavigateToStore(store.slug)}
                              className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Preview</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditStore(store)}
                            className="px-2.5 py-1.5 bg-[#121824] hover:bg-slate-800 text-slate-300 hover:text-[#FF6600] border border-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Edit Store Profile & Logo"
                          >
                            <Edit3 className="w-3 h-3 text-[#FF6600]" />
                            <span>Edit</span>
                          </button>
                          {onDeleteStore && (
                            <button
                              onClick={() =>
                                triggerConfirmDelete(`s-${store.slug}`, () => onDeleteStore(store.slug))
                              }
                              className={`px-2 py-1.5 rounded-lg transition-colors cursor-pointer text-[11px] font-bold flex items-center gap-1 ${
                                isConfirming
                                  ? 'bg-rose-600 text-white'
                                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                              }`}
                              title={isConfirming ? 'Click again to delete store' : 'Delete Store'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {isConfirming && <span>Confirm</span>}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. COUPONS MANAGEMENT VIEW */}
          {activeNav === 'coupons' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141B28] via-[#0E131F] to-[#141B28] border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-[#FF6600] flex items-center justify-center border border-orange-500/30 shrink-0">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-white font-heading">
                      Coupon & Deals Management
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Create, edit, verify, and monitor active promotional codes ({coupons.length} offers)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => handleOpenCouponModal('single')}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF6600] hover:bg-[#FA5A00] text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Coupon</span>
                  </button>

                  <button
                    onClick={() => handleOpenCouponModal('bulk')}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#121824] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-[#FF6600]" />
                    <span>Import Batch</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0E131F] border border-slate-800/80 p-4 rounded-2xl">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search coupons by title, code, or store..."
                    className="w-full pl-9 pr-4 py-2 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-[#121824] border border-slate-700/80 rounded-xl px-3 py-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#FF6600] shrink-0" />
                    <select
                      value={couponSortBy}
                      onChange={(e) =>
                        setCouponSortBy(
                          e.target.value as 'newest' | 'popular' | 'discount' | 'expiring' | 'store' | 'status'
                        )
                      }
                      aria-label="Sort coupons"
                      className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="newest" className="bg-[#121824] text-white">Sort: Newly Added</option>
                      <option value="popular" className="bg-[#121824] text-white">Sort: Most Used</option>
                      <option value="discount" className="bg-[#121824] text-white">Sort: Highest Discount</option>
                      <option value="expiring" className="bg-[#121824] text-white">Sort: Expiring Soon</option>
                      <option value="store" className="bg-[#121824] text-white">Sort: Store (A-Z)</option>
                      <option value="status" className="bg-[#121824] text-white">Sort: Verified First</option>
                    </select>
                  </div>

                  <select
                    value={couponCategoryFilter}
                    onChange={(e) => setCouponCategoryFilter(e.target.value)}
                    aria-label="Filter coupons by category"
                    className="bg-[#121824] border border-slate-700/80 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#FF6600] cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[#0E131F] border border-slate-800/80 rounded-2xl p-5 shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Store</th>
                      <th className="py-3 px-3">Title & Tags</th>
                      <th className="py-3 px-3">Discount</th>
                      <th className="py-3 px-3">Code</th>
                      <th className="py-3 px-3">Uses</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {displayedCoupons.map((coupon) => {
                      const cLogo = coupon.logoUrl || coupon.storeLogoUrl;
                      const isConfirming = confirmDeleteId === `full-c-${coupon.id}`;
                      return (
                        <tr key={coupon.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-lg ${
                                  cLogo ? 'bg-white' : coupon.storeLogoBg || 'bg-[#FF6600]'
                                } text-white flex items-center justify-center font-bold text-[10px] overflow-hidden shrink-0`}
                              >
                                {cLogo ? (
                                  <img
                                    src={cLogo}
                                    alt={coupon.store}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-contain p-0.5"
                                  />
                                ) : coupon.storeLogoText ? (
                                  coupon.storeLogoText.slice(0, 3)
                                ) : (
                                  coupon.store.slice(0, 3)
                                )}
                              </div>
                              <span className="font-bold text-white">{coupon.store}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 max-w-[240px]">
                            <span className="font-medium text-slate-200 block truncate">{coupon.title}</span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {coupon.category}
                              {coupon.tags && coupon.tags.length > 0 ? ` • ${coupon.tags.slice(0, 2).join(', ')}` : ''}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[#FF6600] font-bold font-mono bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                              {coupon.discountBadge}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {coupon.code ? (
                              <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                {coupon.code}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">Direct Deal</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            {coupon.usesCount?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => onToggleCouponStatus(coupon.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-colors ${
                                coupon.verified
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                              }`}
                              title="Click to toggle Verified / Paused"
                            >
                              {coupon.verified ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              ) : (
                                <PauseCircle className="w-3 h-3" />
                              )}
                              <span>{coupon.verified ? 'Verified' : 'Paused'}</span>
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {onNavigateToCoupon && (
                                <button
                                  onClick={() => onNavigateToCoupon(coupon)}
                                  className="p-1.5 text-slate-400 hover:text-orange-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Preview Public Coupon Page"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEditCoupon(coupon)}
                                className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit Coupon"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  triggerConfirmDelete(`full-c-${coupon.id}`, () =>
                                    onDeleteCoupon(coupon.id)
                                  )
                                }
                                className={`px-2 py-1.5 rounded-lg transition-colors cursor-pointer text-[11px] font-bold flex items-center gap-1 ${
                                  isConfirming
                                    ? 'bg-rose-600 text-white'
                                    : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                                }`}
                                title={isConfirming ? 'Click again to delete' : 'Delete Coupon'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                {isConfirming && <span>Confirm</span>}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3B. SORT COUPON VIEW (Drag & Drop + Store-level Reordering) */}
          {activeNav === 'sort-coupons' && (() => {
            const visibleSortCoupons =
              sortStoreFilter === 'all'
                ? draftSortedCoupons
                : draftSortedCoupons.filter(
                    (c) =>
                      c.storeSlug.toLowerCase() === sortStoreFilter.toLowerCase() ||
                      c.store.toLowerCase() === sortStoreFilter.toLowerCase()
                  );

            const applySubsetOrder = (newSubset: Coupon[]) => {
              if (sortStoreFilter === 'all') {
                setDraftSortedCoupons(newSubset);
              } else {
                let subsetIdx = 0;
                const subsetIds = new Set(newSubset.map((item) => item.id));
                const merged = draftSortedCoupons.map((item) => {
                  if (subsetIds.has(item.id)) {
                    const nextItem = newSubset[subsetIdx];
                    subsetIdx += 1;
                    return nextItem;
                  }
                  return item;
                });
                setDraftSortedCoupons(merged);
              }
              setHasUnsavedSort(true);
            };

            const moveSortCoupon = (fromIdx: number, toIdx: number) => {
              if (toIdx < 0 || toIdx >= visibleSortCoupons.length || fromIdx === toIdx) return;
              const next = [...visibleSortCoupons];
              const [moved] = next.splice(fromIdx, 1);
              next.splice(toIdx, 0, moved);
              applySubsetOrder(next);
            };

            const quickOrderSubset = (mode: 'codes-first' | 'deals-first' | 'highest-discount') => {
              const next = [...visibleSortCoupons].sort((a, b) => {
                if (mode === 'codes-first') return (a.isDeal ? 1 : 0) - (b.isDeal ? 1 : 0);
                if (mode === 'deals-first') return (b.isDeal ? 1 : 0) - (a.isDeal ? 1 : 0);
                return (b.discountValueNum || 0) - (a.discountValueNum || 0);
              });
              applySubsetOrder(next);
            };

            const selectedStoreObj =
              sortStoreFilter === 'all'
                ? null
                : storesList.find((s) => s.slug.toLowerCase() === sortStoreFilter.toLowerCase());

            return (
              <div className="space-y-6">
                {/* Header */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141B28] via-[#0E131F] to-[#141B28] border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-[#FF6600] flex items-center justify-center border border-orange-500/30 shrink-0">
                      <ArrowUpDown className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-white font-heading">Sort Coupons & Deals</h1>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Drag and drop or use arrows to arrange which offers appear first on store pages.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                    {hasUnsavedSort && (
                      <button
                        type="button"
                        onClick={() => {
                          setDraftSortedCoupons(coupons);
                          setHasUnsavedSort(false);
                        }}
                        className="px-4 py-2.5 bg-[#121824] hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (onReorderCoupons) {
                          onReorderCoupons(draftSortedCoupons, selectedStoreObj?.name);
                        }
                        setHasUnsavedSort(false);
                      }}
                      className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer ${
                        hasUnsavedSort
                          ? 'bg-[#FF6600] hover:bg-[#FA5A00] text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      <span>{hasUnsavedSort ? 'Save Coupon Order' : 'Order Saved'}</span>
                    </button>
                  </div>
                </div>

                {/* Store Filter & Quick Sort Controls */}
                <div className="p-4 rounded-2xl bg-[#0E131F] border border-slate-800/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-xs font-bold text-slate-300 shrink-0">Select Store:</label>
                    <select
                      value={sortStoreFilter}
                      onChange={(e) => setSortStoreFilter(e.target.value)}
                      className="bg-[#121824] border border-slate-700/80 text-xs font-semibold text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#FF6600] cursor-pointer min-w-[210px]"
                    >
                      <option value="all">All Stores ({draftSortedCoupons.length} offers)</option>
                      {storesList.map((s) => {
                        const count = draftSortedCoupons.filter(
                          (c) =>
                            c.storeSlug.toLowerCase() === s.slug.toLowerCase() ||
                            c.store.toLowerCase() === s.name.toLowerCase()
                        ).length;
                        return (
                          <option key={s.slug} value={s.slug}>
                            {s.name} ({count} offers)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Arrange:</span>
                    <button
                      type="button"
                      onClick={() => quickOrderSubset('codes-first')}
                      className="px-3 py-1.5 bg-[#121824] hover:bg-slate-800 border border-slate-700/80 rounded-lg text-[11px] font-semibold text-slate-200 cursor-pointer"
                    >
                      Codes First
                    </button>
                    <button
                      type="button"
                      onClick={() => quickOrderSubset('deals-first')}
                      className="px-3 py-1.5 bg-[#121824] hover:bg-slate-800 border border-slate-700/80 rounded-lg text-[11px] font-semibold text-slate-200 cursor-pointer"
                    >
                      Deals First
                    </button>
                    <button
                      type="button"
                      onClick={() => quickOrderSubset('highest-discount')}
                      className="px-3 py-1.5 bg-[#121824] hover:bg-slate-800 border border-slate-700/80 rounded-lg text-[11px] font-semibold text-slate-200 cursor-pointer"
                    >
                      Highest Discount
                    </button>
                  </div>
                </div>

                {/* Sortable Coupon Cards List (matching screenshot card structure) */}
                {visibleSortCoupons.length > 0 ? (
                  <div className="space-y-3">
                    {visibleSortCoupons.map((coupon, index) => {
                      const cLogo = coupon.logoUrl || coupon.storeLogoUrl;
                      const isDragging = draggedCouponId === coupon.id;
                      const isDragOver = dragOverCouponId === coupon.id && draggedCouponId !== coupon.id;

                      return (
                        <div
                          key={coupon.id}
                          draggable
                          onDragStart={() => setDraggedCouponId(coupon.id)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverCouponId !== coupon.id) {
                              setDragOverCouponId(coupon.id);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverCouponId === coupon.id) {
                              setDragOverCouponId(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedCouponId) {
                              const fromIdx = visibleSortCoupons.findIndex((c) => c.id === draggedCouponId);
                              if (fromIdx !== -1 && fromIdx !== index) {
                                moveSortCoupon(fromIdx, index);
                              }
                            }
                            setDraggedCouponId(null);
                            setDragOverCouponId(null);
                          }}
                          onDragEnd={() => {
                            setDraggedCouponId(null);
                            setDragOverCouponId(null);
                          }}
                          className={`relative rounded-xl bg-[#0E131F] border transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-grab active:cursor-grabbing ${
                            isDragOver
                              ? 'border-[#FF6600] bg-[#FF6600]/10 scale-[1.01]'
                              : isDragging
                              ? 'opacity-50 border-slate-600'
                              : 'border-slate-800/90 hover:border-slate-700'
                          }`}
                        >
                          {/* Left: Drag Handle + Position + Discount Box */}
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 shrink-0 text-slate-500">
                              <GripVertical className="w-4 h-4 text-slate-500" />
                              <span className="w-6 h-6 rounded-md bg-[#121824] border border-slate-700 text-[11px] font-mono font-bold text-slate-300 flex items-center justify-center">
                                {index + 1}
                              </span>
                            </div>

                            <div className="w-24 sm:w-28 shrink-0 text-center pr-3 border-r border-slate-800">
                              <div className="text-xs sm:text-sm font-black text-white uppercase leading-tight">
                                {coupon.discountBadge || (coupon.isDeal ? 'DEAL' : 'OFFER')}
                              </div>
                              {coupon.featured && (
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold uppercase">
                                  Popular
                                </span>
                              )}
                            </div>

                            {/* Store Mini Identity + Offer Title */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <div
                                  className={`w-5 h-5 rounded ${
                                    cLogo ? 'bg-white' : coupon.storeLogoBg || 'bg-[#FF6600]'
                                  } flex items-center justify-center text-[9px] font-bold text-white overflow-hidden shrink-0`}
                                >
                                  {cLogo ? (
                                    <img
                                      src={cLogo}
                                      alt={coupon.store}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-contain p-0.5"
                                    />
                                  ) : (
                                    coupon.store.slice(0, 2).toUpperCase()
                                  )}
                                </div>
                                <span className="text-[11px] font-bold text-slate-300 truncate">
                                  {coupon.store}
                                </span>
                              </div>
                              <div className="text-xs sm:text-sm font-semibold text-white truncate">
                                {coupon.title}
                              </div>
                            </div>
                          </div>

                          {/* Right: Code/Deal Preview Pill + Up/Down/Top Controls */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <span
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase ${
                                coupon.isDeal
                                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-[#1F2937] text-white border border-slate-600'
                              }`}
                            >
                              {coupon.isDeal ? 'GET DEAL' : `GET CODE${coupon.code ? ` · ${coupon.code}` : ''}`}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveSortCoupon(index, 0)}
                                title="Move to Top (#1)"
                                className="px-2 py-1.5 rounded-lg bg-[#121824] hover:bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-[#FF6600] border border-slate-700/80 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                              >
                                Top
                              </button>
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveSortCoupon(index, index - 1)}
                                title="Move Up"
                                className="p-1.5 rounded-lg bg-[#121824] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === visibleSortCoupons.length - 1}
                                onClick={() => moveSortCoupon(index, index + 1)}
                                title="Move Down"
                                className="p-1.5 rounded-lg bg-[#121824] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-[#0E131F] rounded-2xl border border-slate-800 space-y-2">
                    <Tag className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">
                      No coupons found for this store yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenCouponModal('single')}
                      className="text-xs font-bold text-[#FF6600] hover:underline cursor-pointer"
                    >
                      + Add Coupon
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 4. BLOGS MANAGEMENT VIEW */}
          {activeNav === 'blogs' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141B28] via-[#0E131F] to-[#141B28] border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-[#FF6600] flex items-center justify-center border border-orange-500/30 shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-white font-heading">
                      Blog & Savings Guides Management
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Write, edit, and publish savings guides ({allBlogsList.length} articles published)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => setIsWriteBlogOpen(true)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF6600] hover:bg-[#FA5A00] text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Write New Blog</span>
                  </button>

                  <button
                    onClick={onViewWebsite}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#121824] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-[#FF6600]" />
                    <span>Public Storefront</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0E131F] border border-slate-800/80 p-4 rounded-2xl">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles by title, author, or excerpt..."
                    className="w-full pl-9 pr-4 py-2 bg-[#121824] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs text-slate-400 font-semibold shrink-0">Category:</span>
                  <select
                    value={blogCategoryFilter}
                    onChange={(e) => setBlogCategoryFilter(e.target.value)}
                    className="bg-[#121824] border border-slate-700/80 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#FF6600]"
                  >
                    <option value="All">All Categories</option>
                    <option value="Shopping Guides">Shopping Guides</option>
                    <option value="Tech & Gadgets">Tech & Gadgets</option>
                    <option value="Fashion & Footwear">Fashion & Footwear</option>
                    <option value="Web & Tech">Web & Tech</option>
                    <option value="Hosting & Software">Hosting & Software</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Travel & Flights">Travel & Flights</option>
                    <option value="General Savings">General Savings</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBlogsList.map((post) => {
                  const isConfirming = confirmDeleteId === `b-${post.id}`;
                  return (
                    <div
                      key={post.id}
                      className="bg-[#0E131F] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-xs overflow-hidden"
                    >
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden h-28 bg-[#121824] flex items-center justify-center border border-slate-800">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div
                              className={`w-full h-full bg-gradient-to-r ${
                                post.coverColor || 'from-amber-500 to-orange-600'
                              } opacity-90 flex items-center justify-center p-4 text-center`}
                            >
                              <span className="text-white font-extrabold text-sm line-clamp-2 drop-shadow-md">
                                {post.title}
                              </span>
                            </div>
                          )}
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs border border-white/10">
                            {post.category}
                          </span>
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-black/70 text-slate-300">
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-[#FF6600] transition-colors leading-snug">
                          {post.title}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{post.excerpt}</p>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate max-w-[140px] text-slate-300 font-medium">
                            By {post.author}
                          </span>
                          <span className="font-mono text-slate-500">{post.publishedDate}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {post.content?.length || 1} sections
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditBlog(post)}
                            className="px-2.5 py-1.5 bg-[#121824] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3 text-amber-400" />
                            <span>Edit</span>
                          </button>

                          {onDeleteBlog && (
                            <button
                              onClick={() =>
                                triggerConfirmDelete(`b-${post.id}`, () => onDeleteBlog(post.id))
                              }
                              className={`px-2 py-1.5 rounded-lg transition-colors cursor-pointer text-[11px] font-bold flex items-center gap-1 ${
                                isConfirming
                                  ? 'bg-rose-600 text-white'
                                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                              }`}
                              title={isConfirming ? 'Click again to delete article' : 'Delete Blog Post'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {isConfirming && <span>Confirm</span>}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredBlogsList.length === 0 && (
                <div className="p-12 text-center bg-[#0E131F] rounded-2xl border border-slate-800 space-y-3">
                  <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">
                    No blog posts found matching your search.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setBlogCategoryFilter('All');
                    }}
                    className="text-xs text-[#FF6600] underline font-bold cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 5. CATEGORIES BREAKDOWN VIEW */}
          {activeNav === 'categories' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white font-heading">Category Distribution</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live store and coupon counts across all {ALL_CATEGORIES.length} storefront categories.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenCouponModal('single')}
                  className="px-4 py-2 bg-[#FF6600] hover:bg-[#FA5A00] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Categorized Offer</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryStats.map((cat) => (
                  <div
                    key={cat.name}
                    className="p-5 rounded-2xl bg-[#0E131F] border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-white font-heading">{cat.name}</h3>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-[#121824]">
                          <div className="text-sm font-black text-white font-mono">{cat.couponCount}</div>
                          <div className="text-[10px] text-slate-400">Coupons</div>
                        </div>
                        <div className="p-2 rounded-xl bg-[#121824]">
                          <div className="text-sm font-black text-[#FF6600] font-mono">{cat.storeCount}</div>
                          <div className="text-[10px] text-slate-400">Stores</div>
                        </div>
                        <div className="p-2 rounded-xl bg-[#121824]">
                          <div className="text-sm font-black text-emerald-400 font-mono">
                            {cat.totalUses.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">Uses</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <button
                        onClick={() => {
                          setStoreCategoryFilter(cat.name);
                          setActiveNav('stores');
                        }}
                        className="text-slate-400 hover:text-white font-semibold cursor-pointer"
                      >
                        View Stores
                      </button>
                      <button
                        onClick={() => {
                          setCouponCategoryFilter(cat.name);
                          setActiveNav('coupons');
                        }}
                        className="text-[#FF6600] hover:underline font-bold cursor-pointer flex items-center gap-1"
                      >
                        <span>Filter Coupons</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. AFFILIATE LINKS DIRECTORY VIEW */}
          {activeNav === 'affiliates' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white font-heading">Affiliate & Brand Links</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Inspect, copy, or edit destination URLs attached to active store coupons.
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('coupons')}
                  className="px-4 py-2 bg-[#121824] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Manage All Offers
                </button>
              </div>

              <div className="bg-[#0E131F] border border-slate-800/80 rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Store</th>
                      <th className="py-3 px-3">Offer Title</th>
                      <th className="py-3 px-3">Destination URL</th>
                      <th className="py-3 px-3">Redemptions</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {displayedCoupons.map((c) => {
                      const safeUrl = /^https?:\/\//i.test(c.storeUrl) ? c.storeUrl : `https://${c.storeUrl}`;
                      const isCopied = copiedAffiliateId === c.id;
                      return (
                        <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-3 font-bold text-white">{c.store}</td>
                          <td className="py-3 px-3 max-w-xs truncate text-slate-300">{c.title}</td>
                          <td className="py-3 px-3 max-w-xs truncate font-mono text-[11px] text-orange-300">
                            {safeUrl}
                          </td>
                          <td className="py-3 px-3 font-mono">{c.usesCount.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleCopyAffiliateUrl(c)}
                                className="px-2.5 py-1 bg-[#121824] hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-semibold text-slate-200 flex items-center gap-1 cursor-pointer"
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-[#FF6600]" />
                                )}
                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                              <button
                                onClick={() => handleEditCoupon(c)}
                                className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                                title="Edit URL"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. ANALYTICS REPORT VIEW */}
          {activeNav === 'analytics' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white font-heading">Store & Offer Analytics</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time summary of redemptions, community votes, and verification rates.
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('dashboard')}
                  className="px-4 py-2 bg-[#FF6600] hover:bg-[#FA5A00] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Back to Overview
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-1">
                  <span className="text-xs text-slate-400">Total Redemptions Logged</span>
                  <div className="text-2xl font-black text-white font-mono">
                    {kpis.totalRedemptions.toLocaleString()}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-1">
                  <span className="text-xs text-slate-400">Positive Helpful Votes</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {coupons.reduce((s, c) => s + (c.upvotes || 0), 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-[#0E131F] border border-slate-800/80 space-y-1">
                  <span className="text-xs text-slate-400">Verified Offer Ratio</span>
                  <div className="text-2xl font-black text-[#FF6600] font-mono">
                    {kpis.totalCoupons > 0
                      ? `${Math.round((kpis.verifiedCount / kpis.totalCoupons) * 100)}%`
                      : '0%'}
                  </div>
                </div>
              </div>

              <div className="bg-[#0E131F] border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading mb-4">
                  Top Stores Performance Breakdown
                </h3>
                <div className="space-y-3">
                  {storeClickShare.map((seg) => (
                    <div key={seg.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{seg.name}</span>
                        <span className="font-mono text-slate-300">
                          {seg.clicks.toLocaleString()} uses ({seg.pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 8. ACCOUNTS VIEW */}
          {activeNav === 'users' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white font-heading">Administrator Account</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Active session identity and permission level. Manage credentials in Settings.
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('settings')}
                  className="px-4 py-2 bg-[#FF6600] hover:bg-[#FA5A00] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Change ID & Password
                </button>
              </div>

              <div className="bg-[#0E131F] border border-slate-800/80 rounded-2xl p-6 max-w-xl space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6600] to-amber-600 flex items-center justify-center font-black text-base text-white">
                    {adminInitial}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">
                      {currentUser?.name || 'Super Admin'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {currentUser?.email || 'admin@codecoupon.com'}
                    </div>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Administrator
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 9. SETTINGS VIEW */}
          {activeNav === 'settings' && (
            <AdminSettings
              currentUser={currentUser}
              onUpdateCurrentUser={onUpdateCurrentUser}
              onShowToast={onShowToast}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <CouponActionModal
        isOpen={isCouponActionOpen}
        onClose={() => setIsCouponActionOpen(false)}
        onAddCoupon={onAddCoupon}
        onAddAllCoupons={onAddAllCoupons}
        initialMode={couponModalMode}
        stores={allStoresRecord}
      />

      <StoreActionModal
        isOpen={isStoreActionOpen}
        onClose={() => setIsStoreActionOpen(false)}
        onAddStore={onAddStore}
        onAddAllStores={onAddAllStores}
        initialMode={storeModalMode}
      />

      <EditCouponModal
        isOpen={isEditCouponOpen}
        coupon={editingCoupon}
        stores={allStoresRecord}
        onClose={() => {
          setIsEditCouponOpen(false);
          setEditingCoupon(null);
        }}
        onSave={(updatedCoupon) => {
          if (onUpdateCoupon) onUpdateCoupon(updatedCoupon);
          setIsEditCouponOpen(false);
          setEditingCoupon(null);
        }}
      />

      <EditStoreModal
        isOpen={isEditStoreOpen}
        store={editingStore}
        onClose={() => {
          setIsEditStoreOpen(false);
          setEditingStore(null);
        }}
        onSave={(updatedStore) => {
          if (onUpdateStore) onUpdateStore(updatedStore);
          setIsEditStoreOpen(false);
          setEditingStore(null);
        }}
      />

      <WriteBlogModal
        isOpen={isWriteBlogOpen}
        onClose={() => setIsWriteBlogOpen(false)}
        onAddBlog={(blog) => {
          if (onAddBlog) onAddBlog(blog);
          setIsWriteBlogOpen(false);
        }}
      />

      <EditBlogModal
        isOpen={isEditBlogOpen}
        blog={editingBlog}
        onClose={() => {
          setIsEditBlogOpen(false);
          setEditingBlog(null);
        }}
        onSave={(updatedBlog) => {
          if (onUpdateBlog) onUpdateBlog(updatedBlog);
          setIsEditBlogOpen(false);
          setEditingBlog(null);
        }}
      />
    </div>
  );
};
