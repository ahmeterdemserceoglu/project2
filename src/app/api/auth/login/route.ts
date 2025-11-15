import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '../../../../lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
    sanitizeInput,
    isValidEmail,
    getClientIP,
    trackFailedAttempt,
    clearFailedAttempts,
    addSecurityHeaders
} from '../../../../lib/security';

export async function POST(request: NextRequest) {
    let response: NextResponse;

    try {
        const clientIP = getClientIP(request);
        const { email, password } = await request.json();

        // Input validation ve sanitization
        if (!email || !password) {
            response = NextResponse.json(
                { error: 'Email ve şifre gereklidir' },
                { status: 400 }
            );
            addSecurityHeaders(response);
            return response;
        }

        // Email format kontrolü
        const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
        if (!isValidEmail(sanitizedEmail)) {
            response = NextResponse.json(
                { error: 'Geçerli bir email adresi girin' },
                { status: 400 }
            );
            addSecurityHeaders(response);
            return response;
        }

        // Brute force kontrolü
        if (!trackFailedAttempt(clientIP)) {
            response = NextResponse.json(
                { error: 'Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin.' },
                { status: 429 }
            );
            addSecurityHeaders(response);
            return response;
        }

        const supabase = await createRouteHandlerClient() as SupabaseClient<any>;

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: sanitizedEmail,
            password: password.trim(),
        });

        if (authError) {
            // Başarısız giriş denemesi kaydet
            trackFailedAttempt(`${clientIP}_${sanitizedEmail}`);

            const errorMessage = authError.message.includes('Invalid login credentials')
                ? 'Geçersiz email veya şifre'
                : 'Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.';
            const statusCode = authError.message.includes('Invalid login credentials') ? 401 : 400;

            // logging removed

            response = NextResponse.json(
                { error: errorMessage },
                { status: statusCode }
            );
            addSecurityHeaders(response);
            return response;
        }

        if (!authData?.user) {
            response = NextResponse.json(
                { error: 'Giriş başarısız, kullanıcı bilgisi alınamadı.' },
                { status: 500 }
            );
            addSecurityHeaders(response);
            return response;
        }

        // Başarılı giriş - failed attempts'i temizle
        clearFailedAttempts(clientIP);
        clearFailedAttempts(`${clientIP}_${sanitizedEmail}`);

        // Kullanıcı profilini kontrol et (güvenli şekilde)
        let profile = null;
        try {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', authData.user.id)
                .single();
            profile = profileData;
        } catch (profileError) {
            // Profile tablosunda gerekli kolonlar yoksa varsayılan değerler kullan
        }

        response = NextResponse.json({
            success: true,
            message: 'Giriş başarılı',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                is_admin: (profile as any)?.is_admin || false
            },
        });

        addSecurityHeaders(response);
        return response;

    } catch (error: any) {
        return NextResponse.json(
            {
                error: 'Sunucuda beklenmedik bir hata oluştu.',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// Diğer HTTP metodları için hata yanıtı
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}