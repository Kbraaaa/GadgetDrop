import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2, 9);
    const t = { id, duration: 4000, type: 'info', entering: true, leaving: false, ...toast };
    setToasts((s) => [...s, t]);

    // Clear entering flag to trigger CSS transition to final state
    setTimeout(() => {
      setToasts((s) => s.map(x => x.id === id ? { ...x, entering: false } : x));
    }, 20);

    // Schedule removal via removeToast (which animates leaving)
    if (t.duration > 0) {
      setTimeout(() => {
        // call removeToast to animate
        setToasts((s) => s.map(x => x.id === id ? { ...x, leaving: true } : x));
        // remove after animation duration
        setTimeout(() => setToasts((s) => s.filter(x => x.id !== id)), 300);
      }, t.duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    // set leaving flag to trigger exit animation, then remove
    setToasts((s) => s.map(x => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => setToasts((s) => s.filter(x => x.id !== id)), 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div aria-live="polite" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:items-start sm:p-6 z-50">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {toasts.map(t => (
            <div key={t.id} className={`max-w-sm w-full pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}> 
              <div
                className={`bg-white shadow-lg rounded-lg p-4 flex transform transition-all duration-300 ${t.type==='error'?'border-l-4 border-red-500':''} ${t.type==='success'?'border-l-4 border-green-500':''} ${t.entering ? 'opacity-0 translate-y-2 scale-95' : ''} ${t.leaving ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{t.title || (t.type==='success'?'Éxito': t.type==='error'?'Error':'Info')}</p>
                  <p className="mt-1 text-sm text-gray-700">{t.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex items-start">
                  <button onClick={() => removeToast(t.id)} className="inline-flex text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
