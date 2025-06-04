"use client";

import { useRef } from "react";
import { useCartStore } from "./store";
import { toast, Toaster } from "react-hot-toast";

// This component handles store hydration on the client side
// without causing hydration mismatches
export function StoreInitializer() {
  const initialized = useRef(false);

  if (!initialized.current && typeof window !== "undefined") {
    // Access the store to trigger hydration only on client side
    useCartStore.persist.rehydrate();
    initialized.current = true;
  }

  return null;
}

// This component provides toast notifications for the store actions
export function ToastHandler() {
  // Add toast notifications for cart actions here
  return <Toaster position="top-right" data-oid="pd:.zix" />;
}

// Combine both into a single provider to use in layout
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <StoreInitializer data-oid="ww4s.1e" />
      <ToastHandler data-oid="k7t8_-1" />
    </>
  );
}
