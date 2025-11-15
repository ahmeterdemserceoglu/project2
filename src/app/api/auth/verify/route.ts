import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvsezisxgofuchzsapks.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2c2V6aXN4Z29mdWNoenNhcGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzExNTE0MSwiZXhwIjoyMDYyNjkxMTQxfQ.NR9HI83kQ0dwv3IZ9JwY_lxf2myqyxF6VJUfzXut5Q0'
);

// Token doğrulama
async function verifyToken(email: string, token: string) {
  try {
    // Token'ı bul
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('email', email)
      .eq('token', token)
      .single();

    if (error || !data) return false;

    // Token süresi dolmuş mu kontrol et
    if (new Date(data.expires_at) < new Date()) return false;

    // Kullanıcı profilini güncelle
    await supabase
      .from('profiles')
      .update({
        is_email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.user_id);

    // Kullanılan token'ı sil
    await supabase
      .from('verification_tokens')
      .delete()
      .eq('id', data.id);

    return true;
  } catch (error) {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/auth/error?error=missing_params&description=Doğrulama+için+gerekli+parametreler+eksik', request.url));
    }

    // Token'ı doğrula
    const isValid = await verifyToken(email, token);

    if (!isValid) {
      return NextResponse.redirect(new URL('/auth/error?error=invalid_token&description=Doğrulama+bağlantısı+geçersiz+veya+süresi+dolmuş', request.url));
    }

    // Başarılı doğrulama
    return NextResponse.redirect(new URL('/auth/confirmed', request.url));
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/error?error=verification_error&description=Doğrulama+sırasında+bir+hata+oluştu', request.url));
  }
} 