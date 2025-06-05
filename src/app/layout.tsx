import type { Metadata } from "next";
import "./globals.css";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import StoreProvider from "@/lib/StoreProvider";
import { ToastProvider } from "@/contexts/ToastContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "HDTicaret.com";
const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Premium alışveriş deneyimi";
export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: ["e-commerce", "online alışveriş", "hdticaret", "premium ürünler"],
  icons: {
    icon: "/favicon.ico",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" data-oid="ftlva26">
      <body className="bg-gray-50" data-oid="w:zrdx3">
        <ToastProvider data-oid="k2o0n-i">
          <NotificationProvider data-oid="q0ih8v.">
            <StoreProvider data-oid="sqf2vs2">
              <div className="flex flex-col min-h-screen" data-oid="8u:q5ge">
                <AppHeader data-oid=".o180yn" />
                <main className="flex-grow" data-oid="g_9dye5">
                  {children}
                </main>
                <AppFooter data-oid="19cp51." />
              </div>
            </StoreProvider>
          </NotificationProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
