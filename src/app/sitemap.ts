import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://hdticaret.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kampanyalar`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ]

  try {
    const supabase = createClient()
    
    // Get all active products
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    // Get all categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    // Get all collections
    const { data: collections } = await (supabase as any)
      .from('collections')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    // Product pages
    const productPages = products?.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) || []

    // Category pages
    const categoryPages = categories?.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || []

    // Collection pages
    const collectionPages = collections?.map((collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      lastModified: new Date(collection.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) || []

    return [
      ...staticPages,
      ...categoryPages,
      ...collectionPages,
      ...productPages,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}