"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, ToastType } from "@/components/ui/Toast";

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = uuidv4();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Automatically remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }} data-oid="chgel_r">
      {children}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        data-oid="zxsuaz6"
      />
    </ToastContext.Provider>
  );
}
