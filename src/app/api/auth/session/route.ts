import { NextResponse } from 'next/server';
import { createRouteHandlerClient, createAdminClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createRouteHandlerClient() as SupabaseClient<any>;

        // Oturumu al ve kontrol et
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        // Oturum bulunamadı veya hata oluştu
        if (sessionError || !sessionData.session) {
            return NextResponse.json({
                user: null,
                session: null
            }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
        }

        let session = sessionData.session;

        // Oturumun süresi dolmuş veya dolmak üzere mi kontrol et
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at && (session.expires_at - now) < 300) { // 5 dakikadan az kaldıysa yenile
            try {
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

                if (!refreshError && refreshData.session) {
                    session = refreshData.session;
                } else {
                }
            } catch (refreshException) {
            }
        }

        // Try-catch içinde profil bilgisini al
        let profile = null;
        let isAdmin = false;

        try {
            // Kullanıcı profilini al - önce user_id ile dene
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .limit(1)
                .single();

            if (!profileError && profileData) {
                profile = profileData;
                isAdmin = profile.is_admin === true;
            } else {
                // user_id ile bulunamazsa id ile dene
                const { data: profileByIdData, error: profileByIdError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .limit(1)
                    .single();

                if (!profileByIdError && profileByIdData) {
                    profile = profileByIdData;
                    isAdmin = profile.is_admin === true;
                }
            }
        } catch (profileError) {
            // Profil bulunamasa bile oturum bilgisini döndür
        }

        // Profil bulunamazsa metadata'dan admin kontrolü yap
        if (!profile) {
            isAdmin = session.user.app_metadata?.is_admin === true ||
                session.user.user_metadata?.is_admin === true;
        }

        // Son kullanıcı oturum bilgilerini oluştur
        const userData = {
            ...session.user,
            profile: profile || null,
            isAdmin
        };

        // Oturum bilgilerini döndür ve cache'i devre dışı bırak
        return NextResponse.json({
            user: userData,
            session,
            timestamp: Date.now() // İstemci tarafında önbellek kontrolü için
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error) {
        return NextResponse.json({
            error: 'Internal server error',
            user: null,
            session: null
        }, {
            status: 500,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    }
}

// Diğer HTTP metodları için hata yanıtı
export async function POST() {
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