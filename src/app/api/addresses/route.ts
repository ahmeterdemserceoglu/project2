import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabase';
import { cookies } from 'next/headers';

// Yetkilendirme kontrolü
async function validateUser(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { isValid: false, userId: null, error: 'Yetkilendirme başlığı geçersiz' };
    }

    // Bearer token'ı çıkar
    const token = authHeader.split(' ')[1];
    if (!token) {
        return { isValid: false, userId: null, error: 'Token bulunamadı' };
    }

    try {
        // Admin client kullan (service_role)
        const supabase = createAdminClient();

        // Token'ı doğrula
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return { isValid: false, userId: null, error: 'Geçersiz veya süresi dolmuş token' };
        }

        return { isValid: true, userId: user.id, error: null };
    } catch (error) {
        return { isValid: false, userId: null, error: 'Token doğrulaması sırasında hata oluştu' };
    }
}

// Adres listesini getir
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }

    // Yetkilendirme kontrolü
    const auth = await validateUser(request);
    if (!auth.isValid) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // Sadece kendi adreslerini görüntülemesine izin ver (admin değilse)
    if (auth.userId !== userId) {
        // Admin kontrolü yapılabilir burada
        return NextResponse.json({ error: 'Bu kullanıcının adreslerini görüntüleme yetkiniz yok' }, { status: 403 });
    }

    try {
        // Service role kullanarak RLS bypass
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false });

        if (error) {
            return NextResponse.json({ error: 'Adresler alınamadı' }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json({ error: 'Adresler alınırken bir sorun oluştu' }, { status: 500 });
    }
}

// Yeni adres ekle
export async function POST(request: NextRequest) {
    try {
        // Yetkilendirme kontrolü
        const auth = await validateUser(request);
        if (!auth.isValid) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const body = await request.json();
        const { user_id, title, full_name, address_line1, address_line2, city, state, neighborhood, area_type, postal_code, country, phone, address_type, is_default } = body;

        // Sadece kendi adreslerini eklemesine izin ver
        if (auth.userId !== user_id) {
            return NextResponse.json({ error: 'Başka bir kullanıcı için adres ekleyemezsiniz' }, { status: 403 });
        }

        // Gerekli alanları kontrol et
        if (!title || !full_name || !address_line1 || !city || !postal_code || !country || !address_type) {
            return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
        }

        // Service role kullanarak RLS bypass
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('addresses')
            .insert({
                user_id,
                title,
                full_name,
                address_line1,
                address_line2: address_line2 || null,
                city,
                state: state || null,
                neighborhood: neighborhood || null,
                postal_code,
                country,
                phone: phone || null,
                is_default: is_default || false,
                address_type,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: 'Adres eklenirken bir hata oluştu' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Adres eklenirken bir sorun oluştu' }, { status: 500 });
    }
}

// Adres güncelle
export async function PUT(request: NextRequest) {
    try {
        // Yetkilendirme kontrolü
        const auth = await validateUser(request);
        if (!auth.isValid) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const body = await request.json();
        const { id, user_id, title, full_name, address_line1, address_line2, city, state, neighborhood, area_type, postal_code, country, phone, address_type, is_default } = body;

        if (!id) {
            return NextResponse.json({ error: 'Adres ID gerekli' }, { status: 400 });
        }

        // Sadece kendi adreslerini güncellemesine izin ver
        if (auth.userId !== user_id) {
            return NextResponse.json({ error: 'Başka bir kullanıcının adresini güncelleyemezsiniz' }, { status: 403 });
        }

        // Service role kullanarak RLS bypass
        const supabase = createAdminClient();

        // Önce adresi kontrol et
        const { data: existingAddress, error: fetchError } = await supabase
            .from('addresses')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError) {
            return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 });
        }

        if (existingAddress.user_id !== auth.userId) {
            return NextResponse.json({ error: 'Bu adresi güncelleme yetkiniz yok' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('addresses')
            .update({
                title,
                full_name,
                address_line1,
                address_line2: address_line2 || null,
                city,
                state: state || null,
                neighborhood: neighborhood || null,
                postal_code,
                country,
                phone: phone || null,
                is_default: is_default || false,
                address_type,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: 'Adres güncellenirken bir hata oluştu' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Adres güncellenirken bir sorun oluştu' }, { status: 500 });
    }
}

// Adres sil
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Adres ID gerekli' }, { status: 400 });
    }

    // Yetkilendirme kontrolü
    const auth = await validateUser(request);
    if (!auth.isValid) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        // Service role kullanarak RLS bypass
        const supabase = createAdminClient();

        // Önce adresi kontrol et
        const { data: existingAddress, error: fetchError } = await supabase
            .from('addresses')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError) {
            return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 });
        }

        // Sadece kendi adreslerini silmesine izin ver
        if (existingAddress.user_id !== auth.userId) {
            return NextResponse.json({ error: 'Bu adresi silme yetkiniz yok' }, { status: 403 });
        }

        // Adresin siparişlerde kullanılıp kullanılmadığını kontrol et
        const { data: ordersWithAddress, error: orderCheckError } = await supabase
            .from('orders')
            .select('id')
            .or(`shipping_address_id.eq.${id},billing_address_id.eq.${id}`)
            .limit(1);

        if (orderCheckError) {
            return NextResponse.json({ error: 'Adres kontrol edilirken hata oluştu' }, { status: 500 });
        }

        // Eğer adres siparişlerde kullanılıyorsa silinemez
        if (ordersWithAddress && ordersWithAddress.length > 0) {
            return NextResponse.json({ 
                error: 'Bu adres daha önce verdiğiniz siparişlerde kullanıldığı için silinemez. Bunun yerine adresi düzenleyebilirsiniz.',
                code: 'ADDRESS_IN_USE'
            }, { status: 400 });
        }

        // Adres güvenli bir şekilde silinebilir
        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: 'Adres silinirken bir hata oluştu' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Adres silinirken bir sorun oluştu' }, { status: 500 });
    }
} 