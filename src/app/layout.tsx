import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/lib/StoreProvider";
import { ToastProvider } from "@/contexts/ToastContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { Montserrat } from 'next/font/google';
import Script from "next/script";

// Initialize the Montserrat font
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-montserrat',
});

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
    <html lang="tr" data-oid="dje5tux" className={montserrat.variable}>
      <head>
        {/* Add inline script to restore session before React hydration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                // Check if we have a session token in any of our storage mechanisms
                console.log("Session restore script running");
                
                // 1. Check cookies
                const cookies = document.cookie.split('; ');
                const accessTokenCookie = cookies.find(c => c.startsWith('sb-access-token='));
                const refreshTokenCookie = cookies.find(c => c.startsWith('sb-refresh-token='));
                
                if (accessTokenCookie && refreshTokenCookie) {
                  const accessToken = accessTokenCookie.split('=')[1];
                  const refreshToken = refreshTokenCookie.split('=')[1];
                  
                  console.log("Found tokens in cookies, storing in localStorage");
                  
                  // Store these in localStorage for Supabase to find
                  const sessionData = {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_at: Math.floor(Date.now() / 1000) + 3600,
                    expires_in: 3600,
                    token_type: "bearer",
                    provider_token: null,
                    provider_refresh_token: null
                  };
                  
                  const wrappedData = {
                    currentSession: sessionData,
                    expiresAt: Math.floor(Date.now() / 1000) + 3600
                  };
                  
                  localStorage.setItem('supabase.auth.token', JSON.stringify(wrappedData));
                  sessionStorage.setItem('supabase.auth.token', JSON.stringify(wrappedData));
                  
                  console.log("Session restored from cookies");
                } else {
                  console.log("No session tokens found in cookies");
                }
              } catch (e) {
                console.error("Error in session restore script:", e);
              }
            })();
          `
        }} />
      </head>
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
