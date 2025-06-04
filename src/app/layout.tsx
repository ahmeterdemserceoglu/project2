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
    <html lang="tr" data-oid="xnzwcny">
      <body className="bg-gray-50" data-oid="y336-xg">
        <ToastProvider data-oid="42rioml">
          <NotificationProvider data-oid="djmpdhl">
            <StoreProvider data-oid="h69rtzf">
              <div className="flex flex-col min-h-screen" data-oid="iccnabd">
                <AppHeader data-oid=".y-7r3f" />
                <main className="flex-grow" data-oid="ksch7hi">
                  {children}
                </main>
                <AppFooter data-oid="1z221rc" />
              </div>
            </StoreProvider>
          </NotificationProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
