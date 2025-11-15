import { NextRequest, NextResponse } from 'next/server';
import { getClientIP, isSuspiciousIP, addSecurityHeaders } from './security';

// Memory-based rate limiter (production'da Redis kullanın)
interface RateLimitInfo {
    count: number;
    resetTime: number;
    lastRequest: number;
    violations: number;
}

class AdvancedRateLimiter {
    private limits = new Map<string, RateLimitInfo>();
    private suspiciousActivity = new Map<string, number>();

    // Rate limit politikaları
    private readonly policies = {
        auth: { requests: 10, windowMs: 15 * 60 * 1000 }, // 15 dakikada 10 istek (increased)
        api: { requests: 100, windowMs: 60 * 1000 }, // 1 dakikada 100 istek
        search: { requests: 30, windowMs: 60 * 1000 }, // 1 dakikada 30 arama
        profile: { requests: 20, windowMs: 60 * 1000 }, // 1 dakikada 20 profil isteği
        admin: { requests: 500, windowMs: 60 * 1000 }, // Admin için çok daha yüksek limit
        upload: { requests: 10, windowMs: 60 * 1000 }, // 1 dakikada 10 upload
        contact: { requests: 3, windowMs: 60 * 60 * 1000 }, // 1 saatte 3 iletişim formu
    };

    // Rate limit kategorisini belirle
    private getCategoryForPath(path: string): keyof typeof this.policies {
        if (path.includes('/auth/')) return 'auth';
        if (path.includes('/admin/')) return 'admin';
        if (path.includes('/search')) return 'search';
        if (path.includes('/profile')) return 'profile';
        if (path.includes('/upload')) return 'upload';
        if (path.includes('/contact')) return 'contact';
        if (path.startsWith('/api/')) return 'api';
        return 'api';
    }

    // Ana rate limiting fonksiyonu
    async checkRateLimit(request: NextRequest): Promise<NextResponse | null> {
        const ip = getClientIP(request);
        
        // Localhost için rate limiting'i devre dışı bırak
        const localhostIPs = ['127.0.0.1', '::1', 'localhost'];
        if (localhostIPs.includes(ip)) {
            return null; // Allow all requests from localhost
        }
        
        const path = request.nextUrl.pathname;
        const category = this.getCategoryForPath(path);
        const key = `${ip}_${category}`;

        const policy = this.policies[category];
        const now = Date.now();

        // Şüpheli IP kontrolü
        if (isSuspiciousIP(ip)) {
            return this.createErrorResponse(
                'Şüpheli aktivite tespit edildi. Erişim geçici olarak kısıtlanmıştır.',
                429,
                { 'Retry-After': '3600' }
            );
        }

        let limitInfo = this.limits.get(key);

        if (!limitInfo) {
            limitInfo = {
                count: 1,
                resetTime: now + policy.windowMs,
                lastRequest: now,
                violations: 0
            };
            this.limits.set(key, limitInfo);
            return null; // Allow request
        }

        // Zaman aralığı sıfırlanmış mı?
        if (now >= limitInfo.resetTime) {
            limitInfo.count = 1;
            limitInfo.resetTime = now + policy.windowMs;
            limitInfo.lastRequest = now;
            return null; // Allow request
        }

        // Rate limit kontrolü
        if (limitInfo.count >= policy.requests) {
            limitInfo.violations++;

            // Çok fazla ihlal varsa IP'yi şüpheli olarak işaretle
            if (limitInfo.violations >= 3) {
                this.addSuspiciousActivity(ip);
            }

            const retryAfter = Math.ceil((limitInfo.resetTime - now) / 1000);

            return this.createErrorResponse(
                `Rate limit aşıldı. ${category} kategorisi için ${policy.requests} istek/${policy.windowMs / 1000} saniye limiti vardır.`,
                429,
                {
                    'Retry-After': retryAfter.toString(),
                    'X-RateLimit-Limit': policy.requests.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': limitInfo.resetTime.toString()
                }
            );
        }

        // Suspicious pattern detection
        this.detectSuspiciousPatterns(ip, path, now, limitInfo);

        limitInfo.count++;
        limitInfo.lastRequest = now;

        return null; // Allow request
    }

    // Şüpheli aktivite tespiti
    private detectSuspiciousPatterns(ip: string, path: string, now: number, limitInfo: RateLimitInfo) {
        // Admin endpoint'leri için daha esnek kurallar
        const isAdminPath = path.includes('/admin/');
        
        // Çok hızlı ardışık istekler (admin için daha esnek)
        const minInterval = isAdminPath ? 50 : 100; // Admin için 50ms, diğerleri için 100ms
        if (now - limitInfo.lastRequest < minInterval) {
            this.addSuspiciousActivity(ip);
        }

        // Farklı endpoint'lere çok hızlı istekler (admin için daha esnek)
        const recentRequests = this.getRecentRequestsForIP(ip);
        const maxEndpoints = isAdminPath ? 50 : 20; // Admin için 50, diğerleri için 20
        if (recentRequests.length > maxEndpoints) {
            this.addSuspiciousActivity(ip);
        }
    }

    private addSuspiciousActivity(ip: string) {
        const current = this.suspiciousActivity.get(ip) || 0;
        this.suspiciousActivity.set(ip, current + 1);

        // 10 şüpheli aktivite sonrası geçici ban (increased threshold)
        if (current >= 10) {
            console.warn(`Security Alert: IP ${ip} temporarily banned due to suspicious activity`);
        }
    }

    private getRecentRequestsForIP(ip: string): string[] {
        const now = Date.now();
        const recentKeys: string[] = [];

        for (const [key, info] of this.limits.entries()) {
            if (key.startsWith(ip + '_') && now - info.lastRequest < 60000) {
                recentKeys.push(key);
            }
        }

        return recentKeys;
    }

    private createErrorResponse(message: string, status: number, headers: Record<string, string> = {}): NextResponse {
        const response = NextResponse.json(
            {
                error: message,
                code: 'rate_limit_exceeded',
                timestamp: new Date().toISOString()
            },
            { status }
        );

        // Security headers ekle
        addSecurityHeaders(response);

        // Rate limit headers ekle
        Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    }

    // Temizlik işlemi - eski kayıtları sil
    cleanup() {
        const now = Date.now();
        for (const [key, info] of this.limits.entries()) {
            if (now >= info.resetTime + 60000) { // 1 dakika grace period
                this.limits.delete(key);
            }
        }

        // Şüpheli aktivite kayıtlarını temizle
        for (const [ip, count] of this.suspiciousActivity.entries()) {
            if (count < 3) { // Küçük ihlalleri temizle
                this.suspiciousActivity.delete(ip);
            }
        }
    }

    // Admin endpoint'leri için IP whitelist kontrolü
    isAdminIPAllowed(ip: string): boolean {
        // Development ortamında IP kontrolünü devre dışı bırak
        if (process.env.NODE_ENV === 'development') {
            return true;
        }

        const allowedAdminIPs = process.env.ADMIN_IP_WHITELIST?.split(',') || [];

        // Localhost IP'lerini otomatik olarak izin ver
        const localhostIPs = ['127.0.0.1', '::1', 'localhost'];
        if (localhostIPs.includes(ip)) {
            return true;
        }

        return allowedAdminIPs.length === 0 || allowedAdminIPs.includes(ip);
    }

    // Clear suspicious activity for an IP (for debugging/admin purposes)
    clearSuspiciousActivity(ip: string) {
        this.suspiciousActivity.delete(ip);
        // Also clear all rate limit entries for this IP
        for (const [key] of this.limits.entries()) {
            if (key.startsWith(ip + '_')) {
                this.limits.delete(key);
            }
        }
    }
}

// Singleton instance
export const advancedRateLimiter = new AdvancedRateLimiter();

// Her 5 dakikada bir cleanup çalıştır
if (typeof window === 'undefined') { // Server-side only
    setInterval(() => {
        advancedRateLimiter.cleanup();
    }, 5 * 60 * 1000);
}

// Middleware helper functions
export async function applyRateLimit(request: NextRequest): Promise<NextResponse | null> {
    return await advancedRateLimiter.checkRateLimit(request);
}

export function checkAdminIPAccess(request: NextRequest): boolean {
    const ip = getClientIP(request);
    return advancedRateLimiter.isAdminIPAllowed(ip);
}

export function clearIPSuspiciousActivity(ip: string) {
    advancedRateLimiter.clearSuspiciousActivity(ip);
}
