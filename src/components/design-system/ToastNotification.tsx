import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = 'toast-' + Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts(prev => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => addToast({ type: 'success', message, title }),
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => addToast({ type: 'warning', message, title }),
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) => addToast({ type: 'error', message, title }),
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) => addToast({ type: 'info', message, title }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, warning, error, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map(toast => {
        const config = {
          success: {
            bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
            badge: 'bg-emerald-600'
          },
          warning: {
            bg: 'bg-amber-50 border-amber-200 text-amber-900',
            icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
            badge: 'bg-amber-500'
          },
          error: {
            bg: 'bg-rose-50 border-rose-200 text-rose-900',
            icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
            badge: 'bg-rose-600'
          },
          info: {
            bg: 'bg-blue-50 border-blue-200 text-blue-900',
            icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
            badge: 'bg-blue-600'
          }
        }[toast.type];

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto rounded-xl border p-3.5 shadow-lg backdrop-blur-xs flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${config.bg}`}
          >
            <div className="mt-0.5">{config.icon}</div>
            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className="text-xs font-bold leading-tight mb-0.5">
                  {toast.title}
                </div>
              )}
              <div className="text-xs font-medium leading-relaxed opacity-95">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
