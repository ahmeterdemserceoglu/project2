import { NextRequest, NextResponse } from 'next/server';
import { paytr } from '@/lib/paytr';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        
        const merchant_oid = formData.get('merchant_oid') as string;
        const status = formData.get('status') as string;
        const total_amount = formData.get('total_amount') as string;
        const hash = formData.get('hash') as string;

        // Hash doğrulama
        const isValid = paytr.verifyCallback({
            merchant_oid,
            status,
            total_amount,
            hash
        });

        if (!isValid) {
            return NextResponse.json({ error: 'Hash doğrulaması başarısız' }, { status: 400 });
        }

        // Sipariş ID'sini çıkar
        const orderId = merchant_oid.replace('ORDER-', '');

        const supabase = createAdminClient();

        // Ödeme başarısız - siparişi iptal et
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'cancelled',
                payment_status: 'failed',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (updateError) {
            return NextResponse.json({ error: 'Sipariş iptal edilemedi' }, { status: 500 });
        }

        return NextResponse.json({ message: 'OK' });

    } catch (error) {
        return NextResponse.json({ error: 'Callback işlenemedi' }, { status: 500 });
    }
}

// GET isteği için kullanıcıyı yönlendir
export async function GET(request: NextRequest) {
    return NextResponse.redirect(new URL('/checkout?payment=failed', request.url));
}