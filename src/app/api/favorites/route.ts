import { createRouteHandlerClient } from '../../../lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET: Kullanıcının favori ürünlerini getir
export async function GET(request: NextRequest) {
    try {
        const supabase = await createRouteHandlerClient();

        // Kullanıcının oturumunu kontrol et
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Giriş yapmalısınız' },
                { status: 401 }
            );
        }

        // Kullanıcının favorilerini getir
        const { data: userFavorites, error } = await supabase
            .from('user_favorites')
            .select('product_id')
            .eq('user_id', session.user.id);

        if (error) {
            return NextResponse.json(
                { error: 'Database error', message: error.message },
                { status: 500 }
            );
        }

        // Favori ürünlerin ID'lerini çıkar
        const productIds = userFavorites?.map((fav: { product_id: string }) => fav.product_id) || [];

        if (productIds.length === 0) {
            return NextResponse.json({ data: [] });
        }

        // Ürün detaylarını getir
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select(`
        id, 
        name, 
        slug, 
        base_price, 
        sale_price, 
        primary_image_url,
        categories(name),
        is_featured
      `)
            .in('id', productIds);

        if (productsError) {
            return NextResponse.json(
                { error: 'Database error', message: productsError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: products });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Server error', message: error.message },
            { status: 500 }
        );
    }
}

// POST: Favori ekle veya kaldır
export async function POST(request: NextRequest) {
    try {
        const supabase = await createRouteHandlerClient();

        // Kullanıcının oturumunu kontrol et
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Giriş yapmalısınız' },
                { status: 401 }
            );
        }

        // İstek gövdesinden ürün ID'sini al
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Ürün ID\'si gerekli' },
                { status: 400 }
            );
        }

        // Favori zaten var mı kontrol et
        const { data: existingFavorite, error: checkError } = await supabase
            .from('user_favorites')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
            .maybeSingle();

        if (checkError) {
            return NextResponse.json(
                { error: 'Database error', message: checkError.message },
                { status: 500 }
            );
        }

        let action;
        let result;

        // Eğer favori varsa sil, yoksa ekle
        if (existingFavorite) {
            // Favoriyi sil
            const { error: deleteError } = await supabase
                .from('user_favorites')
                .delete()
                .eq('id', existingFavorite.id);

            if (deleteError) {
                return NextResponse.json(
                    { error: 'Database error', message: deleteError.message },
                    { status: 500 }
                );
            }

            action = 'removed';
            result = false;
        } else {
            // Favori ekle
            const { error: insertError } = await supabase
                .from('user_favorites')
                .insert({
                    user_id: session.user.id,
                    product_id: productId
                });

            if (insertError) {
                return NextResponse.json(
                    { error: 'Database error', message: insertError.message },
                    { status: 500 }
                );
            }

            action = 'added';
            result = true;
        }

        return NextResponse.json({
            success: true,
            action,
            isFavorite: result,
            productId
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Server error', message: error.message },
            { status: 500 }
        );
    }
}

// DELETE: Favori sil
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createRouteHandlerClient();

        // Kullanıcının oturumunu kontrol et
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Giriş yapmalısınız' },
                { status: 401 }
            );
        }

        // URL'den ürün ID'sini al
        const url = new URL(request.url);
        const productId = url.searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Ürün ID\'si gerekli' },
                { status: 400 }
            );
        }

        // Favoriyi sil
        const { error } = await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', session.user.id)
            .eq('product_id', productId);

        if (error) {
            return NextResponse.json(
                { error: 'Database error', message: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Favori başarıyla silindi',
            productId
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Server error', message: error.message },
            { status: 500 }
        );
    }
} 