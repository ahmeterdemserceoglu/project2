import * as crypto from 'crypto';

// Güvenlik anahtarı - production'da environment variable olmalı
const SECURITY_KEY = process.env.SECURITY_KEY || 'hdticaret-security-2024-key';

// Route obfuscation için encryption
export class RouteSecurityManager {
    private static async getSecretKey() {
        const enc = new TextEncoder();
        const keyMaterial = enc.encode(SECURITY_KEY);
        const key = await crypto.subtle.importKey(
            'raw',
            keyMaterial,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: enc.encode('salt'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            key,
            { name: 'AES-CBC', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Route'u şifrele
    static async encryptRoute(route: string): Promise<string> {
        try {
            const iv = crypto.getRandomValues(new Uint8Array(16));
            const key = await this.getSecretKey();
            const enc = new TextEncoder();
            const data = enc.encode(route);
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: 'AES-CBC',
                    iv
                },
                key,
                data
            );
            return Buffer.from(iv).toString('hex') + ':' + Buffer.from(encrypted).toString('hex');
        } catch (error) {
            return route; // Fallback
        }
    }

    // Route'u çöz
    static async decryptRoute(encryptedRoute: string): Promise<string> {
        try {
            const parts = encryptedRoute.split(':');
            if (parts.length !== 2) return encryptedRoute;

            const iv = Buffer.from(parts[0], 'hex');
            const encryptedText = Buffer.from(parts[1], 'hex');
            const key = await this.getSecretKey();
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-CBC',
                    iv
                },
                key,
                encryptedText
            );
            return new TextDecoder().decode(decrypted);
        } catch (error) {
            return encryptedRoute; // Fallback
        }
    }
}

// XSS koruması
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g, '&#x2F;')
        .trim();
}

// SQL Injection koruması
export function sanitizeForDatabase(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
        .replace(/'/g, "''")
        .replace(/;/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '')
        .trim();
}

// Email validation
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Güçlü şifre kontrolü
export function isStrongPassword(password: string): boolean {
    // En az 8 karakter, büyük harf, küçük harf, sayı ve özel karakter
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
}

// Rate limiting için IP adresi alma
export function getClientIP(request: any): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const connection = request.connection?.remoteAddress;
    
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    
    return real || connection || 'unknown';
}

// CSRF token oluşturma
export function generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// CSRF token doğrulama
export function validateCSRFToken(token: string, expected: string): boolean {
    if (!token || !expected) return false;
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

// Session token oluşturma
export function generateSessionToken(): string {
    return crypto.randomBytes(64).toString('hex');
}

// Hash oluşturma
export function createHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Güvenli rastgele string oluşturma
export function generateSecureRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

// API key validation
export function isValidAPIKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') return false;
    
    // API key format kontrolü (örnek: 32 karakter hex)
    const apiKeyRegex = /^[a-f0-9]{32}$/i;
    return apiKeyRegex.test(apiKey);
}

// Gelişmiş brute force koruması için attempt tracker
interface AttemptInfo {
    count: number;
    lastAttempt: number;
    blockUntil?: number;
    escalationLevel: number;
}

const attemptTracker = new Map<string, AttemptInfo>();
const suspiciousIPs = new Set<string>();
const blockedTokens = new Set<string>();

// Dinamik blok süreleri (dakika)
const BLOCK_DURATIONS = [15, 30, 60, 120, 240]; // Escalating blocks

export function trackFailedAttempt(identifier: string): boolean {
    const now = Date.now();
    const existing = attemptTracker.get(identifier);
    
    if (!existing) {
        attemptTracker.set(identifier, {
            count: 1,
            lastAttempt: now,
            escalationLevel: 0
        });
        return true;
    }
    
    // Blok süresi devam ediyorsa
    if (existing.blockUntil && now < existing.blockUntil) {
        return false;
    }
    
    // Blok süresi geçtiyse, escalation level'ı artır
    if (existing.blockUntil && now >= existing.blockUntil) {
        existing.escalationLevel = Math.min(existing.escalationLevel + 1, BLOCK_DURATIONS.length - 1);
        existing.count = 1;
        existing.lastAttempt = now;
        existing.blockUntil = undefined;
        return true;
    }
    
    // Normal süre geçtiyse counter'ı sıfırla
    if (now - existing.lastAttempt > 15 * 60 * 1000) {
        existing.count = 1;
        existing.lastAttempt = now;
        return true;
    }
    
    existing.count++;
    existing.lastAttempt = now;
    
    // Başarısız deneme limiti aşıldı
    if (existing.count >= 5) {
        const blockDuration = BLOCK_DURATIONS[existing.escalationLevel] * 60 * 1000;
        existing.blockUntil = now + blockDuration;
        
        // IP'yi şüpheli olarak işaretle
        suspiciousIPs.add(identifier.split('_')[0]);
        
        console.warn(`Security Alert: ${identifier} blocked for ${BLOCK_DURATIONS[existing.escalationLevel]} minutes`);
        return false;
    }
    
    return true;
}

export function clearFailedAttempts(identifier: string): void {
    attemptTracker.delete(identifier);
    const ip = identifier.split('_')[0];
    suspiciousIPs.delete(ip);
}

export function isSuspiciousIP(ip: string): boolean {
    // Localhost için suspicious IP kontrolünü devre dışı bırak
    const localhostIPs = ['127.0.0.1', '::1', 'localhost'];
    if (localhostIPs.includes(ip)) {
        return false;
    }
    return suspiciousIPs.has(ip);
}

export function addBlockedToken(token: string): void {
    blockedTokens.add(token);
    // 24 saat sonra otomatik temizle
    setTimeout(() => blockedTokens.delete(token), 24 * 60 * 60 * 1000);
}

export function isTokenBlocked(token: string): boolean {
    return blockedTokens.has(token);
}

// Gelişmiş güvenlik headers
export function addSecurityHeaders(response: any): void {
    // Temel güvenlik headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Ek güvenlik headers
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    // Development ortamında daha esnek güvenlik politikaları
    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    }
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    
    // Content Security Policy
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob: https://gvsezisxgofuchzsapks.supabase.co",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https: wss: https://gvsezisxgofuchzsapks.supabase.co",
        "media-src 'self' https: https://gvsezisxgofuchzsapks.supabase.co",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', csp);
    
    // Rate limiting headers
    response.headers.set('X-RateLimit-Policy', 'dynamic');
}
