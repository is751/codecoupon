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

export type SortOption = 'custom' | 'popular' | 'discount' | 'newest' | 'expiring';

export interface CouponReview {
  id: string;
  couponId: string;
  author: string;
  rating: number; // 1 to 5
  worked: boolean; // Worked for me vs Failed
  comment: string;
  date: string;
  savingsAmount?: string; // e.g. "$35.00"
  helpfulCount: number;
}

export interface Coupon {
  id: string;
  store: string;
  storeSlug: string;
  storeLogoBg: string;
  storeLogoText: string;
  storeLogoUrl?: string;
  logoUrl?: string; // Uploaded custom coupon or brand logo
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
  successRate: number; // e.g. 96 (%)
  usesCount: number;
  expiryDate?: string; // Specific expiry date (YYYY-MM-DD)
  expiryHoursLeft?: number; // for countdown & sorting
  minSpend?: string;
  terms: string[];
  exclusive?: boolean;
  featured?: boolean;
  trending?: boolean;
  editorPicked?: boolean;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  saved?: boolean;
  isCommunity?: boolean;
  tags?: string[];
  reviews: CouponReview[];
  averageRating: number;
  sortOrder?: number;
}

export interface StoreInfo {
  slug: string;
  name: string;
  category: Category;
  logoText: string;
  logoBg: string;
  logoUrl?: string; // Uploaded custom logo data URL or image URL
  brandColor: string;
  website: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  rating: number;
  totalRatingsCount: number;
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
