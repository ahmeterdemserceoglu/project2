import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/lib/StoreProvider";
import { ToastProvider } from "@/contexts/ToastContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

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
    <html lang="tr" data-oid="dje5tux">
      <body className="bg-gray-50" data-oid=".woj7:p">
        <ToastProvider data-oid=".58w8f9">
          <NotificationProvider data-oid=":o5sol:">
            <StoreProvider data-oid="iafd-ct">
              <ConditionalLayout>
                  {children}
              </ConditionalLayout>
            </StoreProvider>
          </NotificationProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
