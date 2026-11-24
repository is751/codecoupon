import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  subMessage?: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, subMessage, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 transition-all transform animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold">{message}</p>
        {subMessage && <p className="text-xs text-slate-300">{subMessage}</p>}
      </div>
      <button 
        onClick={onClose}
        className="ml-2 p-1 text-slate-400 hover:text-white rounded transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
