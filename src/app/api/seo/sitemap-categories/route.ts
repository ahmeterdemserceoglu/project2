import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('slug, updated_at, image_url, name')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    if (error) {
      throw error
    }

    const baseUrl = 'https://hdticaret.com'
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${categories?.map(category => `
  <url>
    <loc>${baseUrl}/categories/${category.slug}</loc>
    <lastmod>${new Date(category.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${category.image_url ? `
    <image:image>
      <image:loc>${category.image_url}</image:loc>
      <image:title>${category.name}</image:title>
    </image:image>` : ''}
  </url>`).join('') || ''}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error generating categories sitemap:', error)
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 })
  }
}