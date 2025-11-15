import { createRouteHandlerClient } from '../../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET: Kullanıcının sepet verilerini al
export async function GET(request: NextRequest) {
    try {
        const supabase = await createRouteHandlerClient();

        // Kullanıcı oturumunu kontrol et
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Doğrudan tablodan veri çekme
        const { data, error } = await supabase
            .from('user_cart')
            .select('*')
            .eq('user_id', userId)
            .limit(1);

        if (error) {
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        // Veri varsa ilk kaydı kullan, yoksa boş sepet döndür
        if (data && data.length > 0) {
            return NextResponse.json({
                cartItems: data[0].cart_items || [],
                recentlyRemovedItems: data[0].recently_removed_items || []
            });
        } else {
            return NextResponse.json({ cartItems: [], recentlyRemovedItems: [] });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
    }
}

// POST: Kullanıcının sepet verilerini güncelle
export async function POST(request: Request) {
    try {
        const supabase = await createRouteHandlerClient();

        // Kullanıcı oturumunu kontrol et
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const { cartItems, recentlyRemovedItems } = await request.json();

        // Önce kullanıcının sepet kaydı var mı kontrol et
        const { data: existingCart, error: fetchError } = await supabase
            .from('user_cart')
            .select('id')
            .eq('user_id', userId)
            .limit(1);

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message, details: fetchError }, { status: 500 });
        }

        let updateError;

        if (existingCart && existingCart.length > 0) {
            // Mevcut kayıt varsa güncelle
            const { error } = await supabase
                .from('user_cart')
                .update({
                    cart_items: cartItems,
                    recently_removed_items: recentlyRemovedItems || [],
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            updateError = error;
        } else {
            // Kayıt yoksa yeni kayıt oluştur
            const { error } = await supabase
                .from('user_cart')
                .insert({
                    user_id: userId,
                    cart_items: cartItems,
                    recently_removed_items: recentlyRemovedItems || [],
                    updated_at: new Date().toISOString()
                });

            updateError = error;
        }

        if (updateError) {
            return NextResponse.json({ error: updateError.message, details: updateError }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
    }
} 