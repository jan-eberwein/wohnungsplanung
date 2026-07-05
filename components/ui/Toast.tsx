"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type ToastKind = "success" | "error";

type ToastEntry = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  show: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast braucht einen ToastProvider.");
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, kind, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 pt-safe"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="glass-strong animate-slide-up flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg"
          >
            {toast.kind === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
            ) : (
              <AlertCircle className="size-4 shrink-0 text-danger" aria-hidden />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
