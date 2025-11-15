
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// JWT token içeriğini çözümle
export function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// JWT'nin süresinin dolup dolmadığını kontrol et
export function isTokenExpired(token: string): boolean {
    try {
        const decoded = parseJwt(token);
        if (!decoded) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (e) {
        return true;
    }
}

// Token'ın JTI (JWT ID) değerini al
export function getTokenJti(token: string): string | null {
    try {
        const decoded = parseJwt(token);
        return decoded?.jti || null;
    } catch (e) {
        return null;
    }
}

// Token'ın blacklist'te olup olmadığını kontrol et
export async function isTokenBlacklisted(token: string): Promise<boolean> {
    try {
        const jti = getTokenJti(token);
        if (!jti) return true; // JTI yoksa güvenlik için blacklist'te kabul et

        const supabase = await createRouteHandlerClient() as SupabaseClient<any>;
        const { data, error } = await supabase
            .from('token_blacklist')
            .select('id')
            .eq('token_jti', jti)
            .limit(1);

        if (error) throw error;
        return data && data.length > 0;
    } catch (e) {
        return true; // Hata durumunda güvenlik için blacklist'te kabul et
    }
}

// Token'ı blacklist'e ekle
export async function blacklistToken(token: string, reason: string = 'logout'): Promise<boolean> {
    try {
        const decoded = parseJwt(token);
        if (!decoded) return false;

        const jti = decoded.jti;
        const userId = decoded.sub;
        const expiresAt = new Date(decoded.exp * 1000).toISOString();

        if (!jti || !userId) return false;

        const supabase = await createRouteHandlerClient() as SupabaseClient<any>;
        const { error } = await supabase
            .from('token_blacklist')
            .insert({
                token_jti: jti,
                user_id: userId,
                expires_at: expiresAt,
                reason: reason
            });

        if (error) {
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}

// Süresi dolmuş blacklist kayıtlarını temizle (admin işlemi)
export async function cleanupExpiredBlacklist() {
    // Bu fonksiyon admin yetkisi gerektirdiği için service role key ile çalışmalı
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
        return false;
    }

    try {
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);

        const { error } = await adminClient
            .from('token_blacklist')
            .delete()
            .lt('expires_at', new Date().toISOString());

        if (error) {
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
} 