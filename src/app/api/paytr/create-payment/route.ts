import { NextRequest, NextResponse } from 'next/server';
import { paytr } from '@/lib/paytr';
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

        if (error) {
            return { isValid: false, userId: null, error: 'Geçersiz veya süresi dolmuş token' };
        }
        
        if (!user) {
            return { isValid: false, userId: null, error: 'Geçersiz veya süresi dolmuş token' };
        }

        return { isValid: true, userId: user.id, error: null };
    } catch (error) {
        return { isValid: false, userId: null, error: 'Token doğrulaması sırasında hata oluştu' };
    }
}

// IP adresini al
function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
        const ip = forwarded.split(',')[0].trim();
        return ip;
    }
    
    if (realIP) {
        return realIP;
    }
    
    return '127.0.0.1'; // Fallback
}

export async function POST(request: NextRequest) {
    try {
        const auth = await validateUser(request);
        
        if (!auth.isValid) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        // PayTR mağaza bilgilerini kontrol et
        const merchantId = process.env.PAYTR_MERCHANT_ID;
        const merchantKey = process.env.PAYTR_MERCHANT_KEY;
        const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

        if (!merchantId || !merchantKey || !merchantSalt) {
            return NextResponse.json({ 
                error: 'PayTR mağaza bilgileri eksik. Lütfen sistem yöneticisi ile iletişime geçin.' 
            }, { status: 500 });
        }

        const body = await request.json();
        
        const { 
            order_id,
            items, 
            shipping_address, 
            total_amount,
            user_email
        } = body;

        if (!order_id || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Sipariş bilgileri eksik' }, { status: 400 });
        }

        if (!shipping_address || !total_amount) {
            return NextResponse.json({ error: 'Teslimat adresi ve toplam tutar gerekli' }, { status: 400 });
        }

        const userIP = getClientIP(request);

        const paymentDataInput = {
            orderId: order_id,
            email: user_email || shipping_address.email || 'test@example.com',
            amount: total_amount,
            items: items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            userName: shipping_address.full_name,
            userAddress: `${shipping_address.address_line1}, ${shipping_address.city}`,
            userPhone: shipping_address.phone || '05555555555',
            userIp: userIP
        };

        // PayTR ödeme verilerini hazırla
        const paymentData = paytr.preparePaymentData(paymentDataInput);

        const paytrResponse = await fetch('https://www.paytr.com/odeme/api/get-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(paymentData as any).toString()
        });

        const paytrResult = await paytrResponse.text();
        
        if (paytrResult.startsWith('SUCCESS')) {
            const token = paytrResult.split(':')[1];
            
            const response = { 
                success: true,
                token,
                iframe_url: `https://www.paytr.com/odeme/guvenli/${token}`
            };
            
            return NextResponse.json(response);
        } else {
            // PayTR hata mesajlarını kontrol et
            console.error('PayTR Error:', paytrResult);
            
            if (paytrResult.includes('FAILED') || paytrResult.includes('ERROR')) {
                return NextResponse.json({ 
                    error: 'Ödeme sistemi geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.' 
                }, { status: 500 });
            }
            
            return NextResponse.json({ 
                error: 'Ödeme oturumu oluşturulamadı. Lütfen daha sonra tekrar deneyin.' 
            }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ 
            error: 'Ödeme oturumu oluşturulamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata')
        }, { status: 500 });
    }
}