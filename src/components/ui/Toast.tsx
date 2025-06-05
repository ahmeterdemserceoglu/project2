"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  const getTypeStyles = (): string => {
    switch (type) {
      case "success":
        return "bg-green-500 border-green-600";
      case "error":
        return "bg-red-500 border-red-600";
      case "warning":
        return "bg-yellow-500 border-yellow-600";
      case "info":
      default:
        return "bg-blue-500 border-blue-600";
    }
  };

  const getIcon = (): JSX.Element => {
    switch (type) {
      case "success":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="kzctxsw"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
              data-oid="hqdnm27"
            />
          </svg>
        );

      case "error":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="hnmc83m"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
              data-oid="dl3t04h"
            />
          </svg>
        );

      case "warning":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="jhmmb67"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              data-oid="37igwb2"
            />
          </svg>
        );

      case "info":
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="61hjopw"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              data-oid="v8rpxhw"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border flex items-center space-x-3 text-white ${getTypeStyles()} animate-slide-up`}
      data-oid="3.42:p."
    >
      <div className="flex-shrink-0" data-oid="hijj8-6">
        {getIcon()}
      </div>
      <div className="flex-1" data-oid="v9g:jd-">
        <p className="text-sm font-medium" data-oid="6f_tm1t">
          {message}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-4 text-white hover:text-gray-100 focus:outline-none"
        data-oid="ce5c.vp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          data-oid="lotbusv"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
            data-oid="uveei8u"
          />
        </svg>
      </button>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: ToastType;
  }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <div
      className="fixed bottom-0 right-0 z-50 p-4 space-y-4"
      data-oid="co5q9at"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onClose(toast.id)}
          data-oid="..i.mqb"
        />
      ))}
    </div>,
    document.body,
  );
};

export default Toast;
