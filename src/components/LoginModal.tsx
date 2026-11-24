import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { getAdminCredentials } from '../data/adminAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: 'admin' | 'shopper' }) => void;
  initialMode?: 'shopper' | 'admin';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAuthError('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const rawInput = email.trim();
    const inputId = rawInput.toLowerCase();
    const trimmedPassword = password.trim();

    if (!rawInput || !trimmedPassword) {
      setAuthError('Please enter both your email and password.');
      return;
    }

    const creds = getAdminCredentials();
    const matchesAdminId =
      inputId === creds.adminId.toLowerCase() ||
      inputId === 'admin' ||
      inputId === 'admin@codecoupon.com';

    // Only enforce strict custom credential check if the user updated their password in Settings
    if (creds.password !== 'admin') {
      if (!matchesAdminId || trimmedPassword !== creds.password.trim()) {
        setAuthError('Invalid email or password.');
        return;
      }
    }

    const displayName = matchesAdminId
      ? creds.adminName
      : rawInput.split('@')[0] || creds.adminName;

    onLoginSuccess({
      name: displayName,
      email: matchesAdminId ? creds.adminId : rawInput,
      role: 'admin',
    });
    setEmail('');
    setPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Sign In"
      >
        {/* Header */}
        <div className="bg-[#0B0F17] text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src="/assets/aistudio/Codecoupon_Logo_on_Dark_Canvas_73907f6d.png"
                alt="CodeCoupon"
                className="w-full h-full object-contain scale-110"
              />
            </div>
            <span className="text-base font-bold font-heading text-white">
              Code<span className="text-[#FF6600]">coupon</span>
            </span>
          </div>

          <h2 className="text-lg font-bold font-heading text-white">Sign In</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter your email and password to open the dashboard.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-600 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-sm font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6600]/25 focus:border-[#FF6600]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full text-sm font-medium pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6600]/25 focus:border-[#FF6600]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
