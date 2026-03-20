import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  emoji?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, emoji?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success', emoji?: string) => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type, emoji }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const colors: Record<ToastType, string> = {
    success: 'bg-forest text-cream',
    error: 'bg-red-600 text-white',
    info: 'bg-gold text-forest',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999999] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`${colors[toast.type]} px-5 py-3 rounded-2xl shadow-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 animate-toast-in`}
          >
            {toast.emoji && <span>{toast.emoji}</span>}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
