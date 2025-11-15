import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "../../../lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const flashDealsOnly = searchParams.get('flash_deals_only') === 'true';
    
    const offset = (page - 1) * limit;

    // Base query for products
    let productsQuery = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        base_price,
        sale_price,
        stock_quantity,
        primary_image_url,
        is_featured,
        created_at,
        categories!inner (
          name
        )
      `)
      .eq('is_active', true);

    // Apply filters
    if (category) {
      productsQuery = productsQuery.eq('categories.slug', category);
    }

    if (search) {
      productsQuery = productsQuery.ilike('name', `%${search}%`);
    }

    // Apply sorting
    productsQuery = productsQuery.order(sortBy, { ascending: sortOrder === 'asc' });

    // Get products
    const { data: products, error: productsError } = await productsQuery
      .range(offset, offset + limit - 1);

    if (productsError) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
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

    // Combine products with flash deals
    const combinedResults = [];

    if (flashDealsOnly) {
      // Only return products that have active flash deals
      products?.forEach(product => {
        const flashDeal = flashDealsMap.get(product.id);
        if (flashDeal) {
          // Calculate flash deal price
          const flashPrice = product.base_price - (product.base_price * flashDeal.discount_percent / 100);
          
          combinedResults.push({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.base_price,
            salePrice: flashPrice,
            imageUrl: product.primary_image_url,
            categoryName: product.categories?.[0]?.name || '',
            isFeatured: product.is_featured,
            createdAt: product.created_at,
            stock: product.stock_quantity,
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
    } else {
      // Return all products, but mark flash deal products
      products?.forEach(product => {
        const flashDeal = flashDealsMap.get(product.id);
        
        if (flashDeal) {
          // This product has a flash deal - return as flash deal
          const flashPrice = product.base_price - (product.base_price * flashDeal.discount_percent / 100);
          
          combinedResults.push({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.base_price,
            salePrice: flashPrice,
            imageUrl: product.primary_image_url,
            categoryName: product.categories?.[0]?.name || '',
            isFeatured: product.is_featured,
            createdAt: product.created_at,
            stock: product.stock_quantity,
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
        } else {
          // Regular product
          combinedResults.push({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.base_price,
            salePrice: product.sale_price,
            imageUrl: product.primary_image_url,
            categoryName: product.categories?.[0]?.name || '',
            isFeatured: product.is_featured,
            createdAt: product.created_at,
            stock: product.stock_quantity,
            isFlashDeal: false
          });
        }
      });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    if (category) {
      countQuery = countQuery.eq('categories.slug', category);
    }

    if (search) {
      countQuery = countQuery.ilike('name', `%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
    }

    return NextResponse.json({
      data: combinedResults,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}