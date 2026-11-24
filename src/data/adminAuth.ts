export interface AdminCredentials {
  adminId: string;       // e.g. "admin@codecoupon.com" or "admin"
  adminName: string;     // e.g. "Super Admin"
  password: string;      // default: "admin"
  lastUpdated: string;   // ISO timestamp
  twoFactorEnabled?: boolean;
  sessionTimeout?: string;
}

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  adminId: 'admin@codecoupon.com',
  adminName: 'Super Admin',
  password: 'admin',
  lastUpdated: new Date().toISOString(),
  twoFactorEnabled: false,
  sessionTimeout: '24 hours',
};

export const STORAGE_KEY_ADMIN_CREDENTIALS = 'codecoupon_admin_credentials';

export function getAdminCredentials(): AdminCredentials {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_CREDENTIALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ADMIN_CREDENTIALS,
        ...parsed,
      };
    }
  } catch (err) {
    console.error('Error reading admin credentials from localStorage', err);
  }
  return DEFAULT_ADMIN_CREDENTIALS;
}

export function saveAdminCredentials(creds: AdminCredentials): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_CREDENTIALS, JSON.stringify(creds));
  } catch (err) {
    console.error('Error saving admin credentials to localStorage', err);
  }
}
