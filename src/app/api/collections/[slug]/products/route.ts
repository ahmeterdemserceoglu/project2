import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    
    // First get the collection ID
    const { data: collection, error: collectionError } = await supabase
      .from("special_collections")
      .select("id")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Get products in this collection
    const { data: collectionProducts, error: collectionProductsError } = await supabase
      .from("collection_products")
      .select(`
        products (
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
        )
      `)
      .eq("collection_id", collection.id);

    if (collectionProductsError) {
      return NextResponse.json([], { status: 200 });
    }

    // Get product IDs for flash deals lookup
    const productIds = collectionProducts?.map((cp: any) => cp.products.id) || [];

    if (productIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get active flash deals for these products
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
      .gte('end_time', now)
      .in('product_id', productIds);

    // Create a map of product_id to flash deal
    const flashDealsMap = new Map();
    if (flashDeals && !flashDealsError) {
      flashDeals.forEach(deal => {
        flashDealsMap.set(deal.product_id, deal);
      });
    }

    // Format the response with flash deals integration
    const products = collectionProducts?.map((cp: any) => {
      const product = cp.products;
      const flashDeal = flashDealsMap.get(product.id);
      
      if (flashDeal) {
        // Calculate flash deal price
        const flashPrice = product.base_price - (product.base_price * flashDeal.discount_percent / 100);
        
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          base_price: product.base_price,
          sale_price: flashPrice,
          primary_image_url: product.primary_image_url,
          is_featured: product.is_featured,
          created_at: product.created_at,
          category_name: product.categories?.name || "",
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
        };
      } else {
        // Regular product
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          base_price: product.base_price,
          sale_price: product.sale_price,
          primary_image_url: product.primary_image_url,
          is_featured: product.is_featured,
          created_at: product.created_at,
          category_name: product.categories?.name || "",
          isFlashDeal: false
        };
      }
    }) || [];

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}