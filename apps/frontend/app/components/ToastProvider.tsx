"use client";

import { createContext, useContext, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastContextType {
  showToast: (msg: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: any) {
  const [toast, setToast] = useState({ message: "", type: "info" });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: "", type: "info" });
    }, 2500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast.message && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: "fixed",
            top: "90px",
            left: "50%",
            transform: "translateX(-50%)",
            background:
              toast.type === "error"
                ? "#dc2626"
                : toast.type === "success"
                ? "#16a34a"
                : "#2563eb",
            color: "white",
            padding: "14px 30px",
            borderRadius: "50px",
            fontWeight: 600,
            zIndex: 9999,
          }}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside provider");
  return ctx;
}
