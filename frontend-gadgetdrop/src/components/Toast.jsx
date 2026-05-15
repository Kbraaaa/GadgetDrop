import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle,
    bar: 'bg-green-500',
    icon_cls: 'text-green-500',
    bg: 'bg-white',
  },
  error: {
    icon: AlertCircle,
    bar: 'bg-red-500',
    icon_cls: 'text-red-500',
    bg: 'bg-white',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-amber-500',
    icon_cls: 'text-amber-500',
    bg: 'bg-white',
  },
  info: {
    icon: Info,
    bar: 'bg-blue-500',
    icon_cls: 'text-blue-500',
    bg: 'bg-white',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2, 9);
    const t = { id, duration: 4000, type: 'info', entering: true, leaving: false, ...toast };
    setToasts(s => [...s, t]);

    setTimeout(() => {
      setToasts(s => s.map(x => x.id === id ? { ...x, entering: false } : x));
    }, 20);

    if (t.duration > 0) {
      setTimeout(() => {
        setToasts(s => s.map(x => x.id === id ? { ...x, leaving: true } : x));
        setTimeout(() => setToasts(s => s.filter(x => x.id !== id)), 300);
      }, t.duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(s => s.map(x => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => setToasts(s => s.filter(x => x.id !== id)), 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-3 pointer-events-none sm:bottom-6 sm:right-6"
      >
        {toasts.map(t => {
          const cfg = TYPE_CONFIG[t.type] || TYPE_CONFIG.info;
          const Icon = cfg.icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto w-full max-w-sm transform transition-all duration-300
                ${t.entering || t.leaving ? 'opacity-0 translate-y-3 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
            >
              <div className={`${cfg.bg} rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex`}>
                <div className={`w-1 flex-shrink-0 ${cfg.bar}`} />
                <div className="flex items-start gap-3 px-4 py-3.5 flex-1 min-w-0">
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.icon_cls}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">
                      {t.title || (t.type === 'success' ? 'Éxito' : t.type === 'error' ? 'Error' : t.type === 'warning' ? 'Aviso' : 'Info')}
                    </p>
                    {t.message && (
                      <p className="mt-0.5 text-sm text-slate-500 leading-snug">{t.message}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeToast(t.id)}
                    className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export default ToastProvider;
