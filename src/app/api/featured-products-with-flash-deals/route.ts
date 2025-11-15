import { NextResponse } from "next/server";
import { createServerComponentClient } from "../../../lib/supabase";

export async function GET() {
  try {
    const supabase = await createServerComponentClient();

    // Get featured products
    const { data: featuredProducts, error: featuredError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        base_price,
        sale_price,
        primary_image_url,
        is_featured,
        created_at,
        categories (
          name
        )
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (featuredError) {
      return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 });
    }

    // Get active flash deals
    const now = new Date().toISOString();
    const { data: flashDeals, error: flashDealsError } = await supabase
      .from('flash_deals')
      .select(`
        id,
        product_id,
        title,
        description,
        discount_percent,
        start_time,
        end_time
      `)
      .eq('is_active', true)
      .lte('start_time', now)
      .gte('end_time', now);

    if (flashDealsError) {
      // Continue without flash deals if there's an error
    }

    // Create a map of product_id to flash deal
    const flashDealsMap = new Map();
    if (flashDeals) {
      flashDeals.forEach(deal => {
        flashDealsMap.set(deal.product_id, deal);
      });
    }

    // Get flash deal products that are not already featured
    const flashDealProductIds = Array.from(flashDealsMap.keys());
    const featuredProductIds = featuredProducts?.map(p => p.id) || [];
    const nonFeaturedFlashDealIds = flashDealProductIds.filter(id => !featuredProductIds.includes(id));

    let flashDealProducts: any[] = [];
    if (nonFeaturedFlashDealIds.length > 0) {
      const { data: flashProducts, error: flashProductsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          base_price,
          sale_price,
          primary_image_url,
          is_featured,
          created_at,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .in('id', nonFeaturedFlashDealIds)
        .limit(4);

      if (!flashProductsError && flashProducts) {
        flashDealProducts = flashProducts;
      }
    }

    // Combine and format results
    const combinedResults: any[] = [];

    // Add featured products (check if they have flash deals)
    if (featuredProducts) {
      featuredProducts.forEach(product => {
        const flashDeal = flashDealsMap.get(product.id);
        
        combinedResults.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          base_price: product.base_price,
          sale_price: product.sale_price,
          primary_image_url: product.primary_image_url,
          category_name: Array.isArray(product.categories) ? (product.categories as any)[0]?.name || '' : (product.categories as any)?.name || '',
          is_featured: product.is_featured,
          created_at: product.created_at,
          isFlashDeal: !!flashDeal,
          flashDeal: flashDeal ? {
            id: flashDeal.id,
            title: flashDeal.title,
            description: flashDeal.description,
            discountPercent: flashDeal.discount_percent,
            startTime: flashDeal.start_time,
            endTime: flashDeal.end_time,
            remainingSeconds: Math.max(0, Math.floor((new Date(flashDeal.end_time).getTime() - Date.now()) / 1000))
          } : undefined
        });
      });
    }

    // Add non-featured flash deal products
    flashDealProducts.forEach(product => {
      const flashDeal = flashDealsMap.get(product.id);
      
      if (flashDeal) {
        combinedResults.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          base_price: product.base_price,
          sale_price: product.sale_price,
          primary_image_url: product.primary_image_url,
          category_name: Array.isArray(product.categories) ? (product.categories as any)[0]?.name || '' : (product.categories as any)?.name || '',
          is_featured: product.is_featured,
          created_at: product.created_at,
          isFlashDeal: true,
          flashDeal: {
            id: flashDeal.id,
            title: flashDeal.title,
            description: flashDeal.description,
            discountPercent: flashDeal.discount_percent,
            startTime: flashDeal.start_time,
            endTime: flashDeal.end_time,
            remainingSeconds: Math.max(0, Math.floor((new Date(flashDeal.end_time).getTime() - Date.now()) / 1000))
          }
        });
      }
    });

    // Sort by flash deals first, then by featured, then by creation date
    combinedResults.sort((a, b) => {
      if (a.isFlashDeal && !b.isFlashDeal) return -1;
      if (!a.isFlashDeal && b.isFlashDeal) return 1;
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({
      data: combinedResults.slice(0, 8) // Limit to 8 products total
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}