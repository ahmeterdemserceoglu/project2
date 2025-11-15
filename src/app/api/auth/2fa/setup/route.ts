import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    generateSecret,
    generateOtpAuthUrl,
    generateQrCode,
    verifyOtp,
    enable2FA
} from '@/lib/twoFactorAuth';

export const dynamic = 'force-dynamic';

// 2FA kurulumu için QR kod oluştur
export async function GET(request: NextRequest) {
    try {
        const supabase = await createRouteHandlerClient() as SupabaseClient<any>;

        // Kullanıcı oturumunu kontrol et
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Kullanıcı bilgilerini al
        const { user } = session;

        // Yeni bir 2FA secret oluştur
        const secret = generateSecret();

        // QR kod URL'si oluştur
        const otpAuthUrl = generateOtpAuthUrl(user.email || '', secret);

        // QR kod resmi oluştur
        const qrCodeImage = await generateQrCode(otpAuthUrl);

        // Secret'ı geçici olarak sakla
        // Not: Bu secret'ı doğrulama sonrası kalıcı olarak saklayacağız
        const { error } = await supabase
            .from('two_factor_auth')
            .upsert({
                user_id: user.id,
                secret: secret,
                is_enabled: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (error) {
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            qrCode: qrCodeImage,
            secret: secret // Manuel giriş için secret'ı da gönder
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// 2FA kurulumunu doğrula ve etkinleştir
export async function POST(request: NextRequest) {
    try {
        const supabase = await createRouteHandlerClient() as SupabaseClient<any>;

        // Kullanıcı oturumunu kontrol et
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // İstek gövdesini al
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        // Kullanıcının 2FA secret'ını al
        const { data: twoFactorData, error: fetchError } = await supabase
            .from('two_factor_auth')
            .select('secret')
            .eq('user_id', session.user.id)
            .single();

        if (fetchError || !twoFactorData) {
            return NextResponse.json(
                { error: 'Setup not initiated or expired' },
                { status: 400 }
            );
        }

        // Token'ı doğrula
        const isValid = verifyOtp(token, twoFactorData.secret);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid verification code' },
                { status: 400 }
            );
        }

        // 2FA'yı etkinleştir
        const success = await enable2FA(session.user.id, twoFactorData.secret);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to enable 2FA' },
                { status: 500 }
            );
        }

        // Başarılı yanıt
        return NextResponse.json({
            success: true,
            message: '2FA successfully enabled'
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 