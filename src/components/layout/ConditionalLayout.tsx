"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ModernHeader from "@/components/layout/ModernHeader";
import AppFooter from "@/components/layout/AppFooter";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Check if current path is in admin section
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    // Render only the children without header/footer for admin pages
    return (
      <div className="flex-grow">
        {children}
      </div>
    );
  }

  // Render with header/footer for all other pages
  return (
    <div className="flex flex-col min-h-screen">
      <ModernHeader />
      <main className="flex-grow">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}