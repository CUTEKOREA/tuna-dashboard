'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

const toastStyles: Record<ToastType, React.CSSProperties> = {
  success: { borderLeft: '4px solid var(--w-emerald-500)', background: 'rgba(var(--w-emerald-500-rgb), 0.1)' },
  error:   { borderLeft: '4px solid var(--w-red-500)', background: 'rgba(var(--w-red-500-rgb), 0.1)' },
  info:    { borderLeft: '4px solid var(--w-cyan-500)', background: 'rgba(var(--w-cyan-500-rgb), 0.1)' },
  warning: { borderLeft: '4px solid var(--w-amber-500)', background: 'rgba(var(--w-amber-500-rgb), 0.1)' },
};

const iconMap: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                ...toastStyles[toast.type],
                padding: '12px 20px',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 500,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                pointerEvents: 'auto',
                maxWidth: 400,
                cursor: 'pointer',
              }}
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{iconMap[toast.type]}</span>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
