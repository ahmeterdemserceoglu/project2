import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/account/',
          '/cart/',
          '/checkout/',
          '/orders/',
          '/verify-email/',
          '/forgot-password/',
          '/_next/',
          '/private/',
          '*.json',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/account/',
          '/cart/',
          '/checkout/',
          '/orders/',
          '/verify-email/',
          '/forgot-password/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: 'https://hdticaret.com/sitemap.xml',
    host: 'https://hdticaret.com',
  }
}