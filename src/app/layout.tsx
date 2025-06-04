import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import StoreProvider from '@/lib/StoreProvider';
import { ToastProvider } from '@/contexts/ToastContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HDTicaret.com';
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Premium alışveriş deneyimi';

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: ['e-commerce', 'online alışveriş', 'hdticaret', 'premium ürünler'],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${poppins.className} bg-gray-50`}>
        <ToastProvider>
          <NotificationProvider>
            <StoreProvider>
              <div className="flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-grow">
                  {children}
                </main>
                <AppFooter />
              </div>
            </StoreProvider>
          </NotificationProvider>
        </ToastProvider>
      </body>
    </html>
  );
} 