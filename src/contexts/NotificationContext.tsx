"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Notification, { NotificationType } from "@/components/ui/Notification";

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notification, setNotification] = useState<{
    id: string;
    message: string;
    type: NotificationType;
  } | null>(null);

  const showNotification = useCallback(
    (message: string, type: NotificationType = "info") => {
      const id = uuidv4();
      setNotification({ id, message, type });

      // Automatically remove notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showNotification }}
      data-oid="xdys704"
    >
      {children}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={handleClose}
          data-oid="hunrnfd"
        />
      )}
    </NotificationContext.Provider>
  );
}
