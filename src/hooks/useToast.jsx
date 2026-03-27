// src/hooks/useToast.jsx
import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  const addToast = useCallback((type, message, withLoading = false) => {
    const id = Date.now();

    if (withLoading) setLoading(true);

    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      if (withLoading) setLoading(false);
    }, 3000);
  }, []);

  const value = {
    toast: {
      success: (msg, opts) => addToast("success", msg, opts?.loading),
      error: (msg, opts) => addToast("error", msg, opts?.loading),
      info: (msg, opts) => addToast("info", msg, opts?.loading),
    },
    toasts,
    loading,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
