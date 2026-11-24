import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  Bell, 
  Laptop, 
  Save, 
  ShieldAlert, 
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  AdminCredentials, 
  getAdminCredentials, 
  saveAdminCredentials, 
  DEFAULT_ADMIN_CREDENTIALS 
} from '../../data/adminAuth';

const STORAGE_KEY_PREFS = 'codecoupon_site_preferences';

interface SitePreferences {
  siteName: string;
  currency: string;
  supportEmail: string;
  autoExpire: boolean;
  emailAlerts: boolean;
}

const DEFAULT_SITE_PREFS: SitePreferences = {
  siteName: 'CodeCoupon',
  currency: 'USD ($)',
  supportEmail: 'info@codescoupons.com',
  autoExpire: true,
  emailAlerts: true,
};

interface AdminSettingsProps {
  currentUser?: { name: string; email: string; role?: 'admin' | 'shopper' } | null;
  onUpdateCurrentUser?: (user: { name: string; email: string; role?: 'admin' | 'shopper' }) => void;
  onShowToast?: (message: string, subMessage?: string) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  currentUser,
  onUpdateCurrentUser,
  onShowToast,
}) => {
  const [credentials, setCredentials] = useState<AdminCredentials>(getAdminCredentials);
  const [activeTab, setActiveTab] = useState<'security' | 'general'>('security');

  // Change Admin ID state
  const [newAdminId, setNewAdminId] = useState(credentials.adminId);
  const [newAdminName, setNewAdminName] = useState(credentials.adminName);
  const [idSuccessMessage, setIdSuccessMessage] = useState('');
  const [idErrorMessage, setIdErrorMessage] = useState('');
  const [isSavingId, setIsSavingId] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // General Settings state (persisted)
  const [prefsLoaded] = useState<SitePreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      return saved ? { ...DEFAULT_SITE_PREFS, ...JSON.parse(saved) } : DEFAULT_SITE_PREFS;
    } catch {
      return DEFAULT_SITE_PREFS;
    }
  });
  const [siteName, setSiteName] = useState(prefsLoaded.siteName);
  const [currency, setCurrency] = useState(prefsLoaded.currency);
  const [supportEmail, setSupportEmail] = useState(prefsLoaded.supportEmail);
  const [autoExpire, setAutoExpire] = useState(prefsLoaded.autoExpire);
  const [emailAlerts, setEmailAlerts] = useState(prefsLoaded.emailAlerts);
  const [twoFactor, setTwoFactor] = useState(credentials.twoFactorEnabled || false);
  const [sessionTimeout, setSessionTimeout] = useState(credentials.sessionTimeout || '24 hours');
  const [generalSuccessMessage, setGeneralSuccessMessage] = useState('');

  // Keep credentials synced if updated externally
  useEffect(() => {
    const creds = getAdminCredentials();
    setCredentials(creds);
    setNewAdminId(creds.adminId);
    setNewAdminName(creds.adminName);
    setTwoFactor(creds.twoFactorEnabled || false);
    setSessionTimeout(creds.sessionTimeout || '24 hours');
  }, []);

  // Compute password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Empty', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 20, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 45, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 70, text: 'Good', color: 'bg-blue-500' };
    return { score: 100, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  // Handle Admin ID / Username change
  const handleSaveAdminId = (e: React.FormEvent) => {
    e.preventDefault();
    setIdErrorMessage('');
    setIdSuccessMessage('');

    if (!newAdminId.trim()) {
      setIdErrorMessage('Admin ID / Username cannot be blank.');
      return;
    }

    if (!newAdminName.trim()) {
      setIdErrorMessage('Display name cannot be blank.');
      return;
    }

    setIsSavingId(true);

    setTimeout(() => {
      const updatedCreds: AdminCredentials = {
        ...credentials,
        adminId: newAdminId.trim(),
        adminName: newAdminName.trim(),
        lastUpdated: new Date().toISOString(),
      };

      saveAdminCredentials(updatedCreds);
      setCredentials(updatedCreds);
      setIsSavingId(false);
      setIdSuccessMessage('Admin ID and username updated successfully!');

      if (onUpdateCurrentUser) {
        onUpdateCurrentUser({
          name: updatedCreds.adminName,
          email: updatedCreds.adminId,
          role: 'admin',
        });
      }

      if (onShowToast) {
        onShowToast(
          'Admin ID Updated',
          `Login ID is now "${updatedCreds.adminId}". Use this ID to sign in.`
        );
      }

      setTimeout(() => setIdSuccessMessage(''), 4000);
    }, 400);
  };

  // Handle Password change
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMessage('');
    setPasswordSuccessMessage('');

    if (!currentPassword) {
      setPasswordErrorMessage('Please enter your current password to confirm.');
      return;
    }

    if (currentPassword !== credentials.password) {
      setPasswordErrorMessage('Current password does not match our records.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setPasswordErrorMessage('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMessage('New password and confirmation do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordErrorMessage('New password cannot be the same as your current password.');
      return;
    }

    setIsUpdatingPassword(true);

    setTimeout(() => {
      const updatedCreds: AdminCredentials = {
        ...credentials,
        password: newPassword,
        lastUpdated: new Date().toISOString(),
      };

      saveAdminCredentials(updatedCreds);
      setCredentials(updatedCreds);
      setIsUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccessMessage('Password changed successfully! Keep your new password secure.');

      if (onShowToast) {
        onShowToast(
          'Password Changed',
          'Admin password updated successfully. Your new password is now active.'
        );
      }

      setTimeout(() => setPasswordSuccessMessage(''), 5000);
    }, 400);
  };

  // Reset to default credentials (2-step inline confirmation, no window.confirm)
  const handleResetToDefault = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
      return;
    }

    saveAdminCredentials(DEFAULT_ADMIN_CREDENTIALS);
    setCredentials(DEFAULT_ADMIN_CREDENTIALS);
    setNewAdminId(DEFAULT_ADMIN_CREDENTIALS.adminId);
    setNewAdminName(DEFAULT_ADMIN_CREDENTIALS.adminName);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrorMessage('');
    setConfirmReset(false);
    setPasswordSuccessMessage('Admin credentials reset to default.');

    if (onUpdateCurrentUser) {
      onUpdateCurrentUser({
        name: DEFAULT_ADMIN_CREDENTIALS.adminName,
        email: DEFAULT_ADMIN_CREDENTIALS.adminId,
        role: 'admin',
      });
    }

    if (onShowToast) {
      onShowToast('Credentials Reset', 'Admin ID & password restored to defaults.');
    }
  };

  // Handle General preferences save
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCreds: AdminCredentials = {
      ...credentials,
      twoFactorEnabled: twoFactor,
      sessionTimeout,
    };
    saveAdminCredentials(updatedCreds);
    setCredentials(updatedCreds);
    try {
      const prefs: SitePreferences = {
        siteName: siteName.trim() || 'CodeCoupon',
        currency,
        supportEmail: supportEmail.trim() || 'info@codescoupons.com',
        autoExpire,
        emailAlerts,
      };
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    setGeneralSuccessMessage('System preferences saved successfully!');
    if (onShowToast) {
      onShowToast('Settings Saved', 'Platform preferences updated.');
    }
    setTimeout(() => setGeneralSuccessMessage(''), 4000);
  };

  const formattedLastUpdated = (() => {
    try {
      const d = new Date(credentials.lastUpdated);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  })();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner with Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141B28] via-[#0E131F] to-[#141B28] border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-[#FF6600] flex items-center justify-center border border-orange-500/30 shrink-0 shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white font-heading">
                Admin Settings & Security
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your Admin Login ID / Username, Password, and Platform Preferences.
            </p>
          </div>
        </div>

        {/* Quick Credentials Info Tag */}
        <div className="flex items-center gap-2 bg-[#0A0D14] border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-left">
            <span className="text-slate-500 block text-[10px] leading-none uppercase font-bold">Current Login ID</span>
            <span className="text-white font-bold">{credentials.adminId}</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Security (ID & Password) vs General Preferences */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#FF6600] text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Login ID & Password</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-black/30 rounded font-mono">Security</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-[#FF6600] text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Site Preferences</span>
        </button>
      </div>

      {/* 1. SECURITY TAB: CHANGE ID & PASSWORD */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Change ID and Change Password Forms (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* CARD 1: CHANGE ADMIN ID & USERNAME */}
            <div className="bg-[#0E131F] border border-slate-800/90 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-[#FF6600] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white font-heading">
                      Change Admin Login ID / Username
                    </h2>
                    <p className="text-xs text-slate-400">
                      Update the ID, email address, or username you use to log into the admin dashboard.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-orange-500/15 text-[#FF6600] border border-orange-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  Credentials
                </span>
              </div>

              {/* Feedback Alert Messages */}
              {idSuccessMessage && (
                <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{idSuccessMessage}</span>
                </div>
              )}

              {idErrorMessage && (
                <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-semibold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{idErrorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveAdminId} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Admin Login ID / Email <span className="text-orange-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={newAdminId}
                        onChange={(e) => setNewAdminId(e.target.value)}
                        placeholder="e.g. admin@codecoupon.com or superadmin"
                        className="w-full text-xs font-medium pl-10 pr-3.5 py-2.5 bg-[#121824] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] transition-colors"
                        required
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      You can use an email or unique username for authentication.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Display Name <span className="text-orange-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="e.g. Super Admin"
                        className="w-full text-xs font-medium pl-10 pr-3.5 py-2.5 bg-[#121824] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] transition-colors"
                        required
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Shown on the top-right header and audit logs.
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Last modified: <strong>{formattedLastUpdated}</strong></span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingId}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingId ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Admin ID</span>
                  </button>
                </div>
              </form>
            </div>

            {/* CARD 2: CHANGE ADMIN PASSWORD */}
            <div className="bg-[#0E131F] border border-slate-800/90 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-[#FF6600] flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white font-heading">
                      Change Admin Password
                    </h2>
                    <p className="text-xs text-slate-400">
                      Choose a secure password to protect your coupon store and deals platform.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  Encrypted
                </span>
              </div>

              {/* Feedback Alert Messages */}
              {passwordSuccessMessage && (
                <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccessMessage}</span>
                </div>
              )}

              {passwordErrorMessage && (
                <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-semibold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordErrorMessage}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {/* Current Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Current Password <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password (default: admin)"
                      className="w-full text-xs font-medium pl-10 pr-10 py-2.5 bg-[#121824] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="p-1.5 text-slate-400 hover:text-white absolute right-3 cursor-pointer"
                      title={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      New Password <span className="text-orange-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create strong password"
                        className="w-full text-xs font-medium pl-10 pr-10 py-2.5 bg-[#121824] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] transition-colors"
                        required
                        minLength={4}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="p-1.5 text-slate-400 hover:text-white absolute right-3 cursor-pointer"
                        title={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Strength:</span>
                          <span className={`font-bold ${
                            strength.text === 'Strong' ? 'text-emerald-400' :
                            strength.text === 'Good' ? 'text-blue-400' :
                            strength.text === 'Fair' ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {strength.text}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${strength.color}`}
                            style={{ width: `${strength.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Confirm New Password <span className="text-orange-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className={`w-full text-xs font-medium pl-10 pr-10 py-2.5 bg-[#121824] border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors ${
                          confirmPassword && confirmPassword !== newPassword
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : confirmPassword && confirmPassword === newPassword
                            ? 'border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                            : 'border-slate-700 focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600]'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="p-1.5 text-slate-400 hover:text-white absolute right-3 cursor-pointer"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {confirmPassword && (
                      <span className={`text-[10px] mt-1 block font-semibold ${
                        confirmPassword === newPassword ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {confirmPassword === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className={`text-xs flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg ${
                        confirmReset
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'text-slate-400 hover:text-amber-400'
                      }`}
                      title="Click twice to revert to default credentials"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{confirmReset ? 'Click Again to Confirm Reset' : 'Restore Default Password'}</span>
                    </button>
                    {confirmReset && (
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUpdatingPassword ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Security Status, Active Session & Two-Factor (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Session Card */}
            <div className="bg-[#0E131F] border border-slate-800/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Laptop className="w-4 h-4 text-[#FF6600]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  Active Session Info
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current User:</span>
                  <span className="text-white font-bold">{currentUser?.name || credentials.adminName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Login ID:</span>
                  <span className="text-[#FF6600] font-mono font-bold truncate max-w-[150px]">{credentials.adminId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Role:</span>
                  <span className="px-2 py-0.5 rounded bg-orange-500/15 text-[#FF6600] font-bold text-[10px]">
                    Super Administrator
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Security Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Secured
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Session Timeout:</span>
                  <span className="text-slate-300 font-mono">{sessionTimeout}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#090C12] border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <strong>Security Tip:</strong> Use a combination of upper/lowercase letters, numbers, and symbols for strong account protection.
              </div>
            </div>

            {/* Quick 2FA & Protection Card */}
            <div className="bg-[#0E131F] border border-slate-800/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  Two-Factor Security
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">2FA Verification</span>
                  <span className="text-[11px] text-slate-400 block">Require OTP code at sign in</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newStatus = !twoFactor;
                    setTwoFactor(newStatus);
                    const updatedCreds = { ...credentials, twoFactorEnabled: newStatus };
                    saveAdminCredentials(updatedCreds);
                    setCredentials(updatedCreds);
                    if (onShowToast) {
                      onShowToast('2FA Status Changed', newStatus ? 'Two-Factor enabled.' : 'Two-Factor disabled.');
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    twoFactor ? 'bg-[#FF6600]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      twoFactor ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Current mode: <strong className={twoFactor ? 'text-emerald-400' : 'text-slate-400'}>
                  {twoFactor ? 'Active (OTP Enabled)' : 'Standard Password Login'}
                </strong>
              </div>
            </div>

            {/* Default Credentials Cheat-sheet / Info */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#0E131F] to-[#0A0D14] border border-amber-500/20 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Login Defaults</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                If you ever forget your custom password, you can restore default admin credentials from the Security panel.
              </p>
              <div className="bg-black/30 p-2.5 rounded-xl font-mono text-[11px] text-amber-300 space-y-0.5 border border-amber-500/20">
                <div>ID: <span className="text-white">{credentials.adminId}</span></div>
                <div>Default Pass: <span className="text-white">admin</span></div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. GENERAL TAB: SITE PREFERENCES */}
      {activeTab === 'general' && (
        <div className="bg-[#0E131F] border border-slate-800/90 rounded-2xl p-6 shadow-sm max-w-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                Platform & Directory Preferences
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure brand settings, currency, notifications, and deal automation.
              </p>
            </div>
            <Sliders className="w-5 h-5 text-[#FF6600]" />
          </div>

          {generalSuccessMessage && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{generalSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveGeneral} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Website Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-[#121824] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-[#121824] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#FF6600]"
                >
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                  <option value="PKR (Rs)">PKR (Rs) - Pakistani Rupee</option>
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Session Expiration Timeout
                </label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-[#121824] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#FF6600]"
                >
                  <option value="30 minutes">30 minutes</option>
                  <option value="2 hours">2 hours</option>
                  <option value="12 hours">12 hours</option>
                  <option value="24 hours">24 hours</option>
                  <option value="Never">Never (Persistent)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Support Contact Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-[#121824] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>

            {/* Automation Toggles */}
            <div className="pt-3 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Auto-Expire Outdated Coupons</span>
                  <span className="text-[11px] text-slate-400 block">Mark deals expired automatically when countdown or expiry date passes</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoExpire(!autoExpire)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoExpire ? 'bg-[#FF6600]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      autoExpire ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Email Alerts for New Submissions</span>
                  <span className="text-[11px] text-slate-400 block">Send notification when a shopper submits a new store deal or review</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailAlerts ? 'bg-[#FF6600]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      emailAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Site Preferences</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
