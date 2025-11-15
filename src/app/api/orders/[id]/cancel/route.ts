import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

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

export async function POST(
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

        // Siparişin kullanıcıya ait olduğunu ve iptal edilebilir durumda olduğunu kontrol et
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', auth.userId)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
        }

        // Sadece pending ve processing durumundaki siparişler iptal edilebilir
        if (!['pending', 'processing'].includes(order.status)) {
            return NextResponse.json({ 
                error: 'Bu sipariş iptal edilemez. Sadece beklemede veya işleniyor durumundaki siparişler iptal edilebilir.' 
            }, { status: 400 });
        }

        // Siparişi iptal et
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (updateError) {
            return NextResponse.json({ error: 'Sipariş iptal edilemedi' }, { status: 500 });
        }

        // Eğer ödeme alınmışsa, Stripe'da refund işlemi yapılabilir
        // Bu kısım isteğe bağlı olarak eklenebilir

        return NextResponse.json({ 
            success: true, 
            message: 'Sipariş başarıyla iptal edildi' 
        });

    } catch (error) {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}