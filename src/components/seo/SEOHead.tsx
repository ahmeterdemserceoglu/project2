'use client'

import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  noIndex?: boolean
  canonical?: string
}

export function SEOHead({
  title = 'HD Ticaret - 3D Baskı Malzemeleri ve 3D Ürünler | Profesyonel 3D Printing',
  description = 'HD Ticaret ile 3D baskı malzemeleri, filamentler, 3D yazıcılar ve özel 3D baskı hizmetleri. PLA, ABS, PETG filamentler ve profesyonel 3D printing çözümleri.',
  keywords = '3D baskı, 3D printing, filament, PLA, ABS, PETG, 3D yazıcı, 3D malzeme, 3D baskı hizmeti, HD Ticaret',
  image = '/images/og-image.jpg',
  url = 'https://hdticaret.com',
  type = 'website',
  noIndex = false,
  canonical
}: SEOHeadProps) {
  const fullTitle = title.includes('HD Ticaret') ? title : `${title} | HD Ticaret`
  const fullImageUrl = image.startsWith('http') ? image : `https://hdticaret.com${image}`
  const canonicalUrl = canonical || url

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="HD Ticaret" />
      <meta property="og:locale" content="tr_TR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@hdticaret" />
      
      {/* Additional meta tags */}
      <meta name="author" content="HD Ticaret" />
      <meta name="publisher" content="HD Ticaret" />
      <meta name="copyright" content="HD Ticaret" />
      <meta name="language" content="Turkish" />
      <meta name="revisit-after" content="1 days" />
      
      {/* Geo tags */}
      <meta name="geo.region" content="TR" />
      <meta name="geo.country" content="Turkey" />
      <meta name="geo.placename" content="İstanbul" />
      
      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  )
}