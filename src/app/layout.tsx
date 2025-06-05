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
    <html lang="tr" data-oid="-i4c4dq">
      <body className="bg-gray-50" data-oid="mr7.31l">
        <ToastProvider data-oid="33.0jwo">
          <NotificationProvider data-oid=".__1yjc">
            <StoreProvider data-oid="3rdzex6">
              <div className="flex flex-col min-h-screen" data-oid=".r3d0ue">
                <AppHeader data-oid="rjxuz.p" />
                <main className="flex-grow" data-oid="8c-lz-n">
                  {children}
                </main>
                <AppFooter data-oid="s29.a5h" />
              </div>
            </StoreProvider>
          </NotificationProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
