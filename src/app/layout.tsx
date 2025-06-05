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
    <html lang="tr" data-oid="k2zi61h">
      <body className="bg-gray-50" data-oid="b48fg93">
        <ToastProvider data-oid="7j276gw">
          <NotificationProvider data-oid="0v:ikrd">
            <StoreProvider data-oid="499nwo1">
              <div className="flex flex-col min-h-screen" data-oid="ofl1hx-">
                <AppHeader data-oid="1u85.99" />
                <main className="flex-grow" data-oid="xx94i2f">
                  {children}
                </main>
                <AppFooter data-oid="ow-lmbf" />
              </div>
            </StoreProvider>
          </NotificationProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
