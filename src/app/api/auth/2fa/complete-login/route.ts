import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifyOtp, verifyBackupCode } from '@/lib/twoFactorAuth';
import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

export async function POST(request: NextRequest) {
    try {
        // Supabase credentials kontrolü
        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // İstek gövdesini al
        const { token, userId, isBackupCode = false } = await request.json();

        if (!token || !userId) {
            return NextResponse.json(
                { error: 'Token and userId are required' },
                { status: 400 }
            );
        }

        // Supabase client oluştur
        const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

        // Kullanıcının 2FA bilgilerini al
        const { data: twoFactorData, error: fetchError } = (await supabase
            .from('two_factor_auth' as any)
            .select('secret, is_enabled')
            .eq('user_id', userId)
            .single()) as { data: { secret: string; is_enabled: boolean } | null; error: any };

        if (fetchError || !twoFactorData) {
            return NextResponse.json(
                { error: '2FA is not set up for this user' },
                { status: 400 }
            );
        }

        if (!twoFactorData.is_enabled) {
            return NextResponse.json(
                { error: '2FA is not enabled for this user' },
                { status: 400 }
            );
        }

        let isValid = false;

        // Yedek kod mu yoksa OTP mi kontrol et
        if (isBackupCode) {
            isValid = await verifyBackupCode(userId, token);
        } else {
            isValid = verifyOtp(token, twoFactorData.secret);
        }

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid verification code' },
                { status: 401 }
            );
        }

        // Kullanıcı bilgilerini al
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

        if (userError || !userData.user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Generate a new session for the user by creating a magic link and parsing the tokens from it
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: userData.user.email!,
        });

        if (linkError || !linkData) {
            return NextResponse.json({ error: 'Failed to create session link' }, { status: 500 });
        }

        // Parse the session tokens from the action_link URL fragment
        const actionLink = linkData.properties.action_link;
        
        // Validate the action link URL
        if (!actionLink || typeof actionLink !== 'string') {
            return NextResponse.json({ error: 'Invalid session link generated' }, { status: 500 });
        }
        
        let url;
        try {
            url = new URL(actionLink);
        } catch (urlError) {
            return NextResponse.json({ error: 'Invalid session link format' }, { status: 500 });
        }
        
        const params = new URLSearchParams(url.hash.substring(1)); // Remove the leading '#'

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');
        const tokenType = params.get('token_type');

        if (!accessToken || !refreshToken || !expiresIn || !tokenType) {
            return NextResponse.json({ error: 'Failed to parse session from link' }, { status: 500 });
        }

        const session = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: parseInt(expiresIn, 10),
            token_type: tokenType,
            expires_at: Date.now() + (parseInt(expiresIn, 10) * 1000),
        };

        // Kullanıcı profilini al
        let profile = null;
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!profileError && profileData) {
            profile = profileData;
        }

        // Başarılı doğrulama kaydı
        try {
            await supabase.from('audit_logs' as any).insert({
                user_id: userId,
                action: '2fa_login',
                entity_type: 'user',
                entity_id: userId,
                metadata: {
                    method: isBackupCode ? 'backup_code' : 'totp',
                    ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
                    user_agent: request.headers.get('user-agent') || 'unknown'
                }
            });
        } catch (logError) {
        }

        // Başarılı yanıt
        const response = NextResponse.json({
            success: true,
            user: {
                id: userData.user.id,
                email: userData.user.email,
                user_metadata: userData.user.user_metadata,
                profile: profile || null,
                app_metadata: { ...userData.user.app_metadata, two_factor_authenticated: true },
            },
            session: session
        });

        // Set cookies manually
        response.cookies.set('sb-access-token', session.access_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: session.expires_in,
        });
        response.cookies.set('sb-refresh-token', session.refresh_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        response.cookies.set('auth_verified', 'true', {
            path: '/',
            sameSite: 'lax',
            maxAge: session.expires_in,
        });

        return response;

    } catch (error: any) {
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error.message
            },
            { status: 500 }
        );
    }
} 