import { Metadata } from 'next'

interface SEOData {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  noIndex?: boolean
  canonical?: string
  price?: number
  currency?: string
  availability?: 'in_stock' | 'out_of_stock'
  brand?: string
  category?: string
}

export function generateSEOMetadata({
  title = 'HD Ticaret - 3D Baskı Malzemeleri ve 3D Ürünler | Profesyonel 3D Printing',
  description = 'HD Ticaret ile 3D baskı malzemeleri, filamentler, 3D yazıcılar ve özel 3D baskı hizmetleri. PLA, ABS, PETG filamentler ve profesyonel 3D printing çözümleri.',
  keywords = '3D baskı, 3D printing, filament, PLA, ABS, PETG, 3D yazıcı, 3D malzeme, 3D baskı hizmeti, HD Ticaret',
  image = '/images/og-image.jpg',
  url = 'https://hdticaret.com',
  type = 'website',
  noIndex = false,
  canonical,
  price,
  currency = 'TRY',
  availability,
  brand = 'HD Ticaret',
  category
}: SEOData): Metadata {
  const fullTitle = title.includes('HD Ticaret') ? title : `${title} | HD Ticaret`
  const fullImageUrl = image.startsWith('http') ? image : `https://hdticaret.com${image}`
  const canonicalUrl = canonical || url
  // Next.js OpenGraph type does not accept 'product'.
  // Use 'website' for OG while still emitting product-specific tags via metadata.other and JSON-LD.
  const ogType: 'website' | 'article' = type === 'product' ? 'website' : (type as 'website' | 'article')

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords,
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
      canonical: canonicalUrl,
      languages: {
        'tr-TR': canonicalUrl,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: 'HD Ticaret',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'tr_TR',
      type: ogType,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImageUrl],
      creator: '@hdticaret',
    },
    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
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
  }

  // Add product-specific metadata
  if (type === 'product' && price) {
    metadata.other = {
      'product:price:amount': price.toString(),
      'product:price:currency': currency,
      'product:availability': availability || 'in_stock',
      'product:brand': brand,
      'product:category': category || '',
    }
  }

  return metadata
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `https://hdticaret.com${crumb.url}`
    }))
  }
}

export function generateProductSchema(product: any) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.primary_image_url,
    "description": product.description || product.name,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "HD Ticaret"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://hdticaret.com/products/${product.slug}`,
      "priceCurrency": "TRY",
      "price": product.sale_price || product.base_price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "HD Ticaret"
      }
    },
    "aggregateRating": product.average_rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.average_rating,
      "reviewCount": product.review_count || 1
    } : undefined
  }
}