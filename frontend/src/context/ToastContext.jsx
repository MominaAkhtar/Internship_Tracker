import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/20';
      case 'error':
        return 'border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/20';
      case 'warning':
        return 'border-amber-500/20 bg-amber-50/90 dark:bg-amber-950/20';
      default:
        return 'border-sky-500/20 bg-sky-50/90 dark:bg-sky-950/20';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Portal/Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg pointer-events-auto backdrop-blur-md ${getBorderColor(toast.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
              <div className="flex-grow text-sm font-medium text-gray-800 dark:text-gray-200">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
