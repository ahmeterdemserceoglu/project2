import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// TOTP (Time-based One-Time Password) için gerekli ayarlar
authenticator.options = {
    window: 1, // Geçerlilik penceresi (±1 adım)
    step: 30,  // Adım süresi (saniye)
    digits: 6  // OTP uzunluğu
};

// Rastgele bir 2FA secret oluştur
export function generateSecret(): string {
    return authenticator.generateSecret();
}

// Yedek kodlar oluştur
export function generateBackupCodes(count: number = 10): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
        // 8 karakter uzunluğunda alfanümerik kod
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
    }
    return codes;
}

// QR kod URL'si oluştur
export function generateOtpAuthUrl(email: string, secret: string, issuer: string = 'HDTicaret'): string {
    return authenticator.keyuri(email, issuer, secret);
}

// QR kod resmi oluştur (base64 formatında)
export async function generateQrCode(otpAuthUrl: string): Promise<string> {
    try {
        return await QRCode.toDataURL(otpAuthUrl);
    } catch (error) {
        throw error;
    }
}

// OTP kodunu doğrula
export function verifyOtp(token: string, secret: string): boolean {
    try {
        return authenticator.verify({ token, secret });
    } catch (error) {
        return false;
    }
}

// Kullanıcı için 2FA etkinleştir
export async function enable2FA(userId: string, secret: string): Promise<boolean> {
    try {
        // Yedek kodlar oluştur
        const backupCodes = generateBackupCodes();

        // Veritabanına kaydet
        const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
        const { error } = await adminSupabase
            .from('two_factor_auth')
            .upsert({
                user_id: userId,
                secret: secret,
                backup_codes: backupCodes,
                is_enabled: true,
                updated_at: new Date().toISOString()
            });

        if (error) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}

// Kullanıcı için 2FA devre dışı bırak
export async function disable2FA(userId: string): Promise<boolean> {
    try {
        const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
        const { error } = await adminSupabase
            .from('two_factor_auth')
            .update({ is_enabled: false, updated_at: new Date().toISOString() })
            .eq('user_id', userId);

        if (error) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}

// Kullanıcının 2FA durumunu kontrol et
export async function check2FAStatus(userId: string): Promise<{ isEnabled: boolean, secret?: string }> {
    try {
        const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
        const { data, error } = await adminSupabase
            .from('two_factor_auth')
            .select('is_enabled, secret')
            .eq('user_id', userId)
            .single();

        if (error) {
            return { isEnabled: false };
        }

        return {
            isEnabled: data?.is_enabled || false,
            secret: data?.secret
        };
    } catch (error) {
        return { isEnabled: false };
    }
}

// Yedek kod doğrula
export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
        // Kullanıcının yedek kodlarını al
        const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
        const { data, error } = await adminSupabase
            .from('two_factor_auth')
            .select('backup_codes')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return false;
        }

        const backupCodes = data.backup_codes as string[];

        // Kod geçerli mi kontrol et
        if (!backupCodes || !backupCodes.includes(code)) {
            return false;
        }

        // Kullanılan kodu listeden çıkar
        const updatedCodes = backupCodes.filter(c => c !== code);

        // Veritabanını güncelle
        const { error: updateError } = await adminSupabase
            .from('two_factor_auth')
            .update({
                backup_codes: updatedCodes,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (updateError) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}

// Yeni yedek kodlar oluştur
export async function regenerateBackupCodes(userId: string): Promise<string[] | null> {
    try {
        const newCodes = generateBackupCodes();

        const { error } = await adminSupabase
            .from('two_factor_auth')
            .update({
                backup_codes: newCodes,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (error) {
            return null;
        }

        return newCodes;
    } catch (error) {
        return null;
    }
} 