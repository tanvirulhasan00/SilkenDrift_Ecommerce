import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "~/lib/utils";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-luxury border transition-all duration-300 animate-in slide-in-from-bottom-5",
              toast.type === "success" &&
                "bg-white border-emerald-300 text-emerald-950 dark:bg-dark-surface dark:border-emerald-800 dark:text-emerald-200",
              toast.type === "error" &&
                "bg-white border-rose-300 text-rose-950 dark:bg-dark-surface dark:border-rose-800 dark:text-rose-200",
              toast.type === "warning" &&
                "bg-white border-amber-300 text-amber-950 dark:bg-dark-surface dark:border-amber-800 dark:text-amber-200",
              toast.type === "info" &&
                "bg-white border-blue-300 text-blue-950 dark:bg-dark-surface dark:border-blue-800 dark:text-blue-200"
            )}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
              {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-silk-400 hover:text-silk-700 p-1 ml-2 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
