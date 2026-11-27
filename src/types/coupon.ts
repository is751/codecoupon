import { CountryCode } from '../utils/countries';

export type Category =
  | 'All'
  | 'Tech & Electronics'
  | 'Fashion & Apparel'
  | 'Food & Dining'
  | 'Hosting & Software'
  | 'Travel & Flights'
  | 'Beauty & Wellness'
  | 'Home & Lifestyle'
  | 'Entertainment & Gaming'
  | 'Sports'
  | 'Toys & Games';

export type DealType = 'all' | 'code' | 'deal' | 'exclusive' | 'shipping';

export type SortOption = 'featured' | 'custom' | 'discount' | 'newest' | 'expiring';

export type InfoPageKey =
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'affiliate'
  | 'verification';

export interface Coupon {
  id: string;
  store: string;
  storeSlug: string;
  storeLogoBg: string;
  storeLogoText: string;
  storeLogoUrl?: string;
  logoUrl?: string;
  storeBrandColor?: string;
  category: Category;
  title: string;
  description: string;
  discountBadge: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping' | 'bogo';
  discountValueNum: number;
  code?: string;
  isDeal: boolean;
  storeUrl: string;
  verified: boolean;
  verifiedText: string;
  isExpired?: boolean;
  expiryDate?: string; // Specific expiry date (YYYY-MM-DD)
  expiryHoursLeft?: number;
  countries?: CountryCode[];
  minSpend?: string;
  terms: string[];
  exclusive?: boolean;
  featured?: boolean;
  trending?: boolean;
  editorPicked?: boolean;
  saved?: boolean;
  isCommunity?: boolean;
  tags?: string[];
  sortOrder?: number;
}

export interface StoreInfo {
  slug: string;
  name: string;
  category: Category;
  logoText: string;
  logoBg: string;
  logoUrl?: string;
  brandColor: string;
  website: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  countries?: CountryCode[];
  established?: string;
  bestDiscount: string;
  cashbackRate?: string;
  highlights: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  category: string;
  readTime: string;
  publishedDate: string;
  author: string;
  coverColor: string;
  coverImage?: string;
}
