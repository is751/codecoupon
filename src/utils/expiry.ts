export interface ExpiryInfo {
  hasExpiry: boolean;
  daysRemaining: number;
  isExpired: boolean;
  isUrgent: boolean;
  label: string;
  formattedDate: string;
}

/**
 * Parses a YYYY-MM-DD string into a local Date at midnight (00:00:00).
 * Returns null if missing or invalid.
 */
export function parseLocalDate(dateStr?: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const parsed = new Date(year, month, day);
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month &&
      parsed.getDate() === day
    ) {
      return parsed;
    }
    return null;
  }

  const fallback = new Date(trimmed);
  if (isNaN(fallback.getTime())) return null;
  return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
}

/**
 * Computes human-readable expiry details relative to today's local date.
 * Returns null if no valid expiryDate is set.
 */
export function getExpiryInfo(expiryDate?: string): ExpiryInfo | null {
  const target = parseLocalDate(expiryDate);
  if (!target) return null;

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - todayMidnight.getTime();
  const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let label: string;
  if (daysRemaining < 0) {
    label = 'Expired';
  } else if (daysRemaining === 0) {
    label = 'Expires today';
  } else if (daysRemaining === 1) {
    label = '1 day left';
  } else {
    label = `${daysRemaining} days left`;
  }

  const formattedDate = target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    hasExpiry: true,
    daysRemaining,
    isExpired: daysRemaining < 0,
    isUrgent: daysRemaining >= 0 && daysRemaining <= 3,
    label,
    formattedDate,
  };
}

/**
 * Computes approximate hours remaining until end of the expiry date (23:59:59 local).
 */
export function computeHoursLeftFromDate(expiryDate?: string): number | undefined {
  const target = parseLocalDate(expiryDate);
  if (!target) return undefined;
  const endOfDay = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
    23,
    59,
    59
  );
  const diffHours = Math.round((endOfDay.getTime() - Date.now()) / (1000 * 60 * 60));
  return Math.max(0, diffHours);
}
