import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '../../../lib/supabase';


// Değişiklik: Performans için önbellekleme ekledik
// 300 saniye (5 dakika) boyunca önbellekte sakla - kategoriler sık değişmez
export const revalidate = 300;

// Define a default limit for static rendering
const DEFAULT_LIMIT = 8;

export async function GET(request: Request) {
    try {
        // Instead of using request.url which causes dynamic rendering,
        // use a default limit for static rendering
        const limit = DEFAULT_LIMIT;

        const supabase = await createRouteHandlerClient();

        console.time('categories-fetch');
        const { data: categories, error } = await supabase
            .from('categories')
            .select('id, name, slug, image_url, description')
            .eq('is_active', true)
            .order('sort_order', { ascending: true, nullsFirst: false })
            .limit(limit);
        console.timeEnd('categories-fetch');

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch categories', details: error.message },
                {
                    status: 500,
                    headers: {
                        'Cache-Control': 'private, no-store, must-revalidate',
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // Performans için cache-control başlığı ekle
        const response = NextResponse.json({ data: categories || [] });
        response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=600');
        return response;

    } catch (e: any) {
        return NextResponse.json(
            {
                error: 'An unexpected internal server error occurred',
                details: e?.message || 'Unknown error'
            },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'private, no-store, must-revalidate',
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}