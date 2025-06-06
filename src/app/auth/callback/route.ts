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
  
  console.log('Auth callback received:', { 
    type, 
    hasCode: !!code,
    error,
    errorDescription
  });
  
  // Eğer hata varsa, hata sayfasına yönlendirin
  if (error) {
    console.error('Auth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/auth/error?error=${error}&description=${encodeURIComponent(errorDescription || '')}`, 
      requestUrl.origin)
    );
  }
  
  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createClientComponentClient();
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        return NextResponse.redirect(
          new URL(`/auth/error?error=session_error&description=${encodeURIComponent(sessionError.message)}`, 
          requestUrl.origin)
        );
      }
      
      // Ensure session is properly set in cookies
      if (data?.session) {
        // Make sure to set cookies for the session
        const response = NextResponse.redirect(new URL('/account', requestUrl.origin));
        
        // Set auth cookies explicitly
        const authTokens = supabase.auth.getSession();
        
        // Set a session verification cookie
        response.cookies.set('auth_verified', 'true', { 
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
          httpOnly: true,
          sameSite: 'lax'
        });
        
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
              
              console.log('User profile updated after verification');
            }
          } catch (profileUpdateError) {
            console.error('Error updating profile after verification:', profileUpdateError);
          }
        }
        
        return response;
      }
      
      // Başarılı işlem sonrası ana sayfaya yönlendir
      return NextResponse.redirect(new URL('/account', requestUrl.origin));
      
    } catch (error: any) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        new URL(`/auth/error?error=unexpected&description=${encodeURIComponent(error.message || 'Unknown error')}`, 
        requestUrl.origin)
      );
    }
  }

  // Kod yoksa ana sayfaya yönlendir
  return NextResponse.redirect(new URL('/?auth=error', requestUrl.origin));
} 