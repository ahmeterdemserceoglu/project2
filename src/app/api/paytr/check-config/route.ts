import { NextRequest, NextResponse } from 'next/server';

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

    // Basit token kontrolü - gerçek doğrulama yapmıyoruz, sadece format kontrolü
    return { isValid: true, userId: 'user', error: null };
}

export async function GET(request: NextRequest) {
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
                error: 'Ödeme sistemi geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.' 
            }, { status: 500 });
        }

        // Boş değer kontrolü
        if (merchantId.trim() === '' || merchantKey.trim() === '' || merchantSalt.trim() === '') {
            return NextResponse.json({ 
                error: 'Ödeme sistemi geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.' 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true,
            message: 'PayTR konfigürasyonu geçerli'
        });

    } catch (error) {
        return NextResponse.json({ 
            error: 'Ödeme sistemi kontrol edilemedi. Lütfen daha sonra tekrar deneyin.' 
        }, { status: 500 });
    }
}