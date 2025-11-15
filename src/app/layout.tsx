import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ToastProvider } from '@/contexts/ToastContext';
import StoreProvider from '@/lib/StoreProvider';
import SessionRefresh from '@/components/auth/SessionRefresh';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import { GoogleAnalytics, GoogleTagManager } from '@/components/analytics/GoogleAnalytics';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HD Ticaret - 3D Baskı Malzemeleri ve 3D Ürünler | Profesyonel 3D Printing',
  description: 'HD Ticaret ile 3D baskı malzemeleri, filamentler, 3D yazıcılar ve özel 3D baskı hizmetleri. PLA, ABS, PETG filamentler ve profesyonel 3D printing çözümleri.',
  keywords: '3D baskı, 3D printing, filament, PLA, ABS, PETG, 3D yazıcı, 3D malzeme, 3D baskı hizmeti, HD Ticaret',
  authors: [{ name: 'HD Ticaret' }],
  creator: 'HD Ticaret',
  publisher: 'HD Ticaret',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://hdticaret.com'),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/',
    },
  },
  openGraph: {
    title: 'HD Ticaret - 3D Baskı Malzemeleri ve 3D Ürünler | Profesyonel 3D Printing',
    description: 'HD Ticaret ile 3D baskı malzemeleri, filamentler, 3D yazıcılar ve özel 3D baskı hizmetleri. PLA, ABS, PETG filamentler ve profesyonel 3D printing çözümleri.',
    url: 'https://hdticaret.com',
    siteName: 'HD Ticaret',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HD Ticaret - 3D Baskı Malzemeleri',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HD Ticaret - 3D Baskı Malzemeleri ve 3D Ürünler | Profesyonel 3D Printing',
    description: 'HD Ticaret ile 3D baskı malzemeleri, filamentler, 3D yazıcılar ve özel 3D baskı hizmetleri.',
    images: ['/images/twitter-image.jpg'],
    creator: '@hdticaret',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "HD Ticaret",
              "url": "https://hdticaret.com",
              "logo": "https://hdticaret.com/images/logo.png",
              "description": "Türkiye'nin önde gelen 3D baskı malzemeleri ve 3D printing çözümleri merkezi",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "TR",
                "addressLocality": "İstanbul"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+90-XXX-XXX-XXXX",
                "contactType": "customer service",
                "availableLanguage": "Turkish"
              },
              "sameAs": [
                "https://www.facebook.com/hdticaret",
                "https://www.instagram.com/hdticaret",
                "https://twitter.com/hdticaret"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-dark text-gray-900 dark:text-gray-100 min-h-screen flex flex-col`}>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        )}
        <StoreProvider>
          <AuthProvider>
            <NotificationProvider>
              <ToastProvider>
                <SessionRefresh />
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
              </ToastProvider>
            </NotificationProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
