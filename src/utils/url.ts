/**
 * Safely resolves an outbound merchant or affiliate destination URL.
 * Prefers coupon-level affiliate URL, then store website URL, ensuring https:// protocol.
 */
export function resolveMerchantUrl(
  couponUrl?: string,
  storeWebsite?: string,
  fallbackStoreSlug?: string
): string {
  const candidates = [couponUrl, storeWebsite];
  for (const rawCandidate of candidates) {
    const trimmed = rawCandidate?.trim();
    if (trimmed && trimmed !== '#' && !trimmed.includes('example.com')) {
      if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
      }
      return `https://${trimmed}`;
    }
  }

  const cleanSlug = (fallbackStoreSlug || 'store')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
  return `https://www.${cleanSlug || 'codecoupon'}.com`;
}
