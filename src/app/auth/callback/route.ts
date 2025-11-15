import { createClientComponentClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Eğer hata varsa, hata sayfasına yönlendirin
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?error=${error}&description=${encodeURIComponent(errorDescription || '')}`,
        requestUrl.origin)
    );
  }

  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createClientComponentClient();
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        return NextResponse.redirect(
          new URL(`/auth/error?error=session_error&description=${encodeURIComponent(sessionError.message)}`,
            requestUrl.origin)
        );
      }

      // Let Supabase handle its own cookies, just redirect
      if (data?.session) {

        // Email doğrulama işlemi ise
        if (type === 'recovery' || type === 'signup') {
          // Email doğrulama işleminden sonra profile tablosunu güncelle
          try {
            const { data: userData } = await supabase.auth.getUser();

            if (userData?.user) {
              await supabase.from('profiles')
                .update({
                  is_email_verified: true,
                  updated_at: new Date().toISOString()
                })
                .eq('id', userData.user.id);

            }
          } catch (profileUpdateError) {
          }
        }

        return NextResponse.redirect(new URL('/account', requestUrl.origin));
      }

      // Başarılı işlem sonrası ana sayfaya yönlendir
      return NextResponse.redirect(new URL('/account', requestUrl.origin));

    } catch (error: any) {
      return NextResponse.redirect(
        new URL(`/auth/error?error=unexpected&description=${encodeURIComponent(error.message || 'Unknown error')}`,
          requestUrl.origin)
      );
    }
  }

  // Kod yoksa ana sayfaya yönlendir
  return NextResponse.redirect(new URL('/?auth=error', requestUrl.origin));
} 