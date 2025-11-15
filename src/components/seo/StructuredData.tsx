'use client'

interface StructuredDataProps {
  type: 'product' | 'breadcrumb' | 'organization' | 'website'
  data?: any
  product?: any
  breadcrumbs?: Array<{ name: string; url: string }>
}

export function StructuredData({ type, data, product, breadcrumbs }: StructuredDataProps) {
  let structuredData: any = {}

  switch (type) {
    case 'product':
      if (product) {
        structuredData = {
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
      break

    case 'breadcrumb':
      if (breadcrumbs) {
        structuredData = {
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
      break

    case 'organization':
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "HD Ticaret",
        "url": "https://hdticaret.com",
        "logo": "https://hdticaret.com/images/logo.png",
        "description": "Türkiye'nin önde gelen 3D baskı malzemeleri ve 3D printing çözümleri merkezi. PLA, ABS, PETG filamentler, 3D yazıcılar ve profesyonel 3D baskı hizmetleri.",
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
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "3D Baskı Malzemeleri",
          "itemListElement": [
            {
              "@type": "OfferCatalog",
              "name": "3D Filamentler",
              "description": "PLA, ABS, PETG, TPU ve özel filament türleri"
            },
            {
              "@type": "OfferCatalog", 
              "name": "3D Yazıcılar",
              "description": "FDM ve Resin 3D yazıcılar, hobiden profesyonele"
            },
            {
              "@type": "OfferCatalog",
              "name": "3D Baskı Aksesuarları",
              "description": "Nozzle, baskı tablası, temizlik malzemeleri"
            }
          ]
        }
      }
      break

    case 'website':
      structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "HD Ticaret",
        "url": "https://hdticaret.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://hdticaret.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }
      break

    default:
      structuredData = data || {}
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}