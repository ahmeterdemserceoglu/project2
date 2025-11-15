import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase';

// Yetkilendirme kontrolü
async function validateUser(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { isValid: false, userId: null, error: 'Yetkilendirme başlığı geçersiz' };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return { isValid: false, userId: null, error: 'Token bulunamadı' };
    }

    try {
        const supabase = createAdminClient();
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return { isValid: false, userId: null, error: 'Geçersiz veya süresi dolmuş token' };
        }

        return { isValid: true, userId: user.id, error: null };
    } catch (error) {
        return { isValid: false, userId: null, error: 'Token doğrulaması sırasında hata oluştu' };
    }
}

// Sipariş güncelle
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await validateUser(request);
        if (!auth.isValid) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const orderId = params.id;
        const body = await request.json();
        
        const { status, payment_status, notes } = body;

        if (!status && !payment_status && !notes) {
            return NextResponse.json({ error: 'Güncellenecek alan belirtilmedi' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Önce siparişin kullanıcıya ait olduğunu kontrol et
        const { data: existingOrder, error: fetchError } = await supabase
            .from('orders')
            .select('id, user_id, status')
            .eq('id', orderId)
            .eq('user_id', auth.userId)
            .single();

        if (fetchError || !existingOrder) {
            return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
        }

        // Güncelleme verilerini hazırla
        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        if (status) updateData.status = status;
        if (payment_status) updateData.payment_status = payment_status;
        if (notes) updateData.notes = notes;

        // Siparişi güncelle
        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .eq('user_id', auth.userId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: 'Sipariş güncellenemedi' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            order: updatedOrder
        });

    } catch (error) {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

// Sipariş detayını getir
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await validateUser(request);
        if (!auth.isValid) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const orderId = params.id;
        const supabase = createAdminClient();

        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                id,
                order_number,
                status,
                total_amount,
                shipping_amount,
                tax_amount,
                discount_amount,
                payment_status,
                payment_method,
                notes,
                created_at,
                updated_at
            `)
            .eq('id', orderId)
            .eq('user_id', auth.userId)
            .single();

        if (error || !order) {
            return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(order);

    } catch (error) {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}