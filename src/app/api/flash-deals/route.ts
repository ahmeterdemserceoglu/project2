// DİKKAT: Import satırını yeni ve birleşik fonksiyonumuzla güncelledik.
import { createRouteHandlerClient } from '../../../lib/supabase';

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';


// Decrease revalidation time to make it faster to update
export const revalidate = 30;

// Define a default limit for static rendering
const DEFAULT_LIMIT = 10;

// Placeholder data for faster initial load
const placeholderDeals = [
    {
        id: 'placeholder-1',
        product_id: 'placeholder-1',
        title: 'Yükleniyor...',
        description: null,
        discount_percent: 20,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 86400000).toISOString(),
        remaining_seconds: 3600,
        product_name: 'Yükleniyor...',
        product_slug: '#',
        base_price: 100,
        sale_price: 80,
        primary_image_url: '/images/placeholder.jpg'
    },
    {
        id: 'placeholder-2',
        product_id: 'placeholder-2',
        title: 'Yükleniyor...',
        description: null,
        discount_percent: 15,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 86400000).toISOString(),
        remaining_seconds: 7200,
        product_name: 'Yükleniyor...',
        product_slug: '#',
        base_price: 150,
        sale_price: 127.5,
        primary_image_url: '/images/placeholder.jpg'
    }
];

export async function GET(request: Request) {
    try {
        // Extract query parameters
        const url = new URL(request.url);
        const forceRefresh = url.searchParams.get('force') === 'true';
        const includeAll = url.searchParams.get('include_all') === 'true';

        // If not forcing refresh and query has fast=true, return placeholders immediately
        if (!forceRefresh && url.searchParams.get('fast') === 'true') {
            // Return placeholders with short cache time
            const placeholderResponse = NextResponse.json({
                data: placeholderDeals,
                isPlaceholder: true
            });
            placeholderResponse.headers.set('Cache-Control', 'public, max-age=5, stale-while-revalidate=10');
            return placeholderResponse;
        }

        // Otherwise, fetch real data
        const realData = await fetchRealData(includeAll);

        // Add cache headers based on whether this is a forced refresh
        const response = NextResponse.json({ data: realData });
        if (forceRefresh) {
            response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else {
            response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
        }
        return response;

    } catch (e: any) {
        // Return placeholder data on error to ensure UI doesn't break
        return NextResponse.json(
            { data: placeholderDeals, isError: true },
            {
                status: 200, // Return 200 instead of 500 to prevent API errors
                headers: {
                    'Cache-Control': 'private, max-age=5, stale-while-revalidate=10',
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}

// Helper function to fetch the actual data
async function fetchRealData(includeAll = false) {
    const supabase = await createRouteHandlerClient();
    const now = new Date().toISOString();
    const limit = DEFAULT_LIMIT;

    console.time('flash-deals-fetch');

    // Başlangıç sorgusu
    let query = supabase
        .from('flash_deals')
        .select(`
            id,
            title,
            description,
            discount_percent,
            start_time,
            end_time,
            product_id,
            is_active,
            products (
                name,
                slug,
                base_price,
                sale_price,
                primary_image_url,
                is_featured
            )
        `);

    // Eğer tüm fırsatları istemiyorsak sadece aktif ve süresi dolmamış olanları getir
    if (!includeAll) {
        query = query
            .eq('is_active', true)
            .lt('start_time', now)
            .gt('end_time', now);
    }

    // Sorguyu tamamla
    const { data: flashDeals, error } = await query
        .order('end_time', { ascending: true })
        .limit(limit);

    console.timeEnd('flash-deals-fetch');

    if (error) {
        // Return placeholder data on error
        return placeholderDeals;
    }

    // Veriyi istemcinin kullanabileceği bir formata dönüştür
    const formattedDeals = flashDeals?.map(deal => {
        const endTime = new Date(deal.end_time).getTime();
        const startTime = new Date(deal.start_time).getTime();
        const currentTime = new Date().getTime();
        const remainingMs = Math.max(0, endTime - currentTime);

        // Check deal status
        let status = 'active';
        if (currentTime > endTime) {
            status = 'expired';
        } else if (currentTime < startTime) {
            status = 'upcoming';
        }

        return {
            id: deal.id,
            product_id: deal.product_id,
            title: deal.title,
            description: deal.description,
            discount_percent: deal.discount_percent,
            start_time: deal.start_time,
            end_time: deal.end_time,
            remaining_seconds: Math.floor(remainingMs / 1000),
            product_name: deal.products?.name,
            product_slug: deal.products?.slug,
            base_price: deal.products?.base_price,
            sale_price: deal.products?.sale_price,
            primary_image_url: deal.products?.primary_image_url,
            is_featured: deal.products?.is_featured,
            is_active: deal.is_active,
            status: status
        };
    }) || [];

    return formattedDeals.length > 0 ? formattedDeals : placeholderDeals;
}