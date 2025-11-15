import { NextRequest, NextResponse } from 'next/server';
import { 
    getClientIP, 
    sanitizeInput, 
    isValidEmail, 
    generateCSRFToken, 
    validateCSRFToken,
    addSecurityHeaders,
    isTokenBlocked,
    addBlockedToken
} from './security';
import { applyRateLimit } from './advanced-rate-limiter';
import { createRouteHandlerClient } from './supabase';

// API güvenlik katmanları
export interface SecurityConfig {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    requireCSRF?: boolean;
    allowedMethods?: string[];
    rateLimit?: boolean;
    sanitizeBody?: boolean;
    logRequests?: boolean;
    requireHTTPS?: boolean;
}

// Request loglama için interface
interface RequestLog {
    ip: string;
    path: string;
    method: string;
    userAgent: string;
    timestamp: string;
    userId?: string;
    status?: number;
    error?: string;
}

class APISecurityMiddleware {
    private requestLogs: RequestLog[] = [];
    private suspiciousPatterns: RegExp[] = [
        /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bUNION\b|\bDROP\b)/i, // SQL injection patterns
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS patterns
        /javascript:/i,
        /vbscript:/i,
        /onload\s*=/i,
        /onerror\s*=/i,
    ];

    // Ana güvenlik middleware fonksiyonu
    async secureAPIRoute(
        request: NextRequest, 
        config: SecurityConfig = {},
        handler: (req: NextRequest) => Promise<NextResponse>
    ): Promise<NextResponse> {
        const startTime = Date.now();
        let response: NextResponse;
        
        try {
            // 1. HTTPS kontrolü (production'da)
            if (config.requireHTTPS && process.env.NODE_ENV === 'production') {
                if (!request.url.startsWith('https://')) {
                    return this.createErrorResponse('HTTPS gerekli', 400);
                }
            }

            // 2. HTTP method kontrolü
            if (config.allowedMethods && !config.allowedMethods.includes(request.method)) {
                return this.createErrorResponse('Method not allowed', 405);
            }

            // 3. Rate limiting
            if (config.rateLimit !== false) {
                const rateLimitResponse = await applyRateLimit(request);
                if (rateLimitResponse) {
                    this.logRequest(request, 429, 'Rate limit exceeded');
                    return rateLimitResponse;
                }
            }

            // 4. Malicious pattern detection
            await this.detectMaliciousPatterns(request);

            // 5. Authentication kontrolü
            if (config.requireAuth) {
                const authResult = await this.validateAuthentication(request);
                if (!authResult.valid) {
                    this.logRequest(request, 401, authResult.error);
                    return this.createErrorResponse(authResult.error || 'Unauthorized', 401);
                }
                
                // Admin kontrolü
                if (config.requireAdmin && !authResult.isAdmin) {
                    this.logRequest(request, 403, 'Admin access required');
                    return this.createErrorResponse('Admin yetkisi gerekli', 403);
                }
            }

            // 6. CSRF token kontrolü
            if (config.requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
                const csrfValid = await this.validateCSRFToken(request);
                if (!csrfValid) {
                    return this.createErrorResponse('CSRF token geçersiz', 403);
                }
            }

            // 7. Request body sanitization
            if (config.sanitizeBody && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
                request = await this.sanitizeRequestBody(request);
            }

            // 8. Request validation
            const validationResult = await this.validateRequestStructure(request);
            if (!validationResult.valid) {
                return this.createErrorResponse(validationResult.error || 'Invalid request', 400);
            }

            // Handler'ı çalıştır
            response = await handler(request);
            
            // 9. Response headers ekle
            addSecurityHeaders(response);
            
            // 10. Request'i logla
            if (config.logRequests !== false) {
                this.logRequest(request, response.status);
            }

            // 11. Performance monitoring
            const processingTime = Date.now() - startTime;
            response.headers.set('X-Processing-Time', `${processingTime}ms`);

            return response;

        } catch (error: any) {
            this.logRequest(request, 500, error.message);
            return this.createErrorResponse('Sunucu hatası', 500);
        }
    }

    // Authentication doğrulama
    private async validateAuthentication(request: NextRequest): Promise<{
        valid: boolean;
        error?: string;
        userId?: string;
        isAdmin?: boolean;
    }> {
        try {
            const authHeader = request.headers.get('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return { valid: false, error: 'Authorization token gerekli' };
            }

            const token = authHeader.substring(7);
            
            // Token blokaj kontrolü
            if (isTokenBlocked(token)) {
                return { valid: false, error: 'Token geçici olarak engellenmiştir' };
            }

            const supabase = await createRouteHandlerClient();
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                // Geçersiz token'ı blokla
                addBlockedToken(token);
                return { valid: false, error: 'Geçersiz token' };
            }

            // Kullanıcı profil kontrolü (is_active kolonu yoksa sadece is_admin kontrol et)
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            return {
                valid: true,
                userId: user.id,
                isAdmin: profile?.is_admin || false
            };

        } catch (error) {
            return { valid: false, error: 'Authentication hatası' };
        }
    }

    // CSRF token doğrulama
    private async validateCSRFToken(request: NextRequest): Promise<boolean> {
        const csrfToken = request.headers.get('x-csrf-token');
        const sessionToken = request.headers.get('x-session-token');
        
        if (!csrfToken || !sessionToken) {
            return false;
        }

        // Session'dan expected CSRF token'ı al (gerçek implementasyonda session'dan gelecek)
        const expectedCSRF = request.headers.get('x-expected-csrf');
        if (!expectedCSRF) {
            return false;
        }

        return validateCSRFToken(csrfToken, expectedCSRF);
    }

    // Request body sanitization
    private async sanitizeRequestBody(request: NextRequest): Promise<NextRequest> {
        try {
            const contentType = request.headers.get('content-type');
            if (!contentType?.includes('application/json')) {
                return request;
            }

            const body = await request.json();
            const sanitizedBody = this.sanitizeObject(body);
            
            // Yeni request oluştur (NextRequest immutable olduğu için)
            const newRequest = new NextRequest(request.url, {
                method: request.method,
                headers: request.headers,
                body: JSON.stringify(sanitizedBody)
            });

            return newRequest;
        } catch (error) {
            return request;
        }
    }

    // Object sanitization (recursive)
    private sanitizeObject(obj: any): any {
        if (typeof obj !== 'object' || obj === null) {
            if (typeof obj === 'string') {
                return sanitizeInput(obj);
            }
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }

        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[sanitizeInput(key)] = this.sanitizeObject(value);
        }

        return sanitized;
    }

    // Malicious pattern detection
    private async detectMaliciousPatterns(request: NextRequest): Promise<void> {
        const url = request.url;
        const userAgent = request.headers.get('user-agent') || '';
        
        // URL pattern kontrolü
        for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(url) || pattern.test(userAgent)) {
                const ip = getClientIP(request);
                console.warn(`Malicious pattern detected from IP: ${ip}, URL: ${url}, UA: ${userAgent}`);
                
                // IP'yi şüpheli olarak işaretle
                throw new Error('Zararlı aktivite tespit edildi');
            }
        }

        // Body content kontrolü (eğer varsa)
        if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
            try {
                const body = await request.text();
                for (const pattern of this.suspiciousPatterns) {
                    if (pattern.test(body)) {
                        throw new Error('Zararlı içerik tespit edildi');
                    }
                }
            } catch (error) {
                // Body parse edilemezse geç
            }
        }
    }

    // Request structure validation
    private async validateRequestStructure(request: NextRequest): Promise<{
        valid: boolean;
        error?: string;
    }> {
        // Content-Length kontrolü
        const contentLength = request.headers.get('content-length');
        if (contentLength) {
            const length = parseInt(contentLength);
            if (length > 10 * 1024 * 1024) { // 10MB limit
                return { valid: false, error: 'Request çok büyük' };
            }
        }

        // User-Agent kontrolü
        const userAgent = request.headers.get('user-agent');
        if (!userAgent || userAgent.length < 10) {
            return { valid: false, error: 'Geçerli User-Agent gerekli' };
        }

        // Origin kontrolü (CORS)
        const origin = request.headers.get('origin');
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
        if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
            return { valid: false, error: 'Origin izinli değil' };
        }

        return { valid: true };
    }

    // Request loglama
    private logRequest(request: NextRequest, status?: number, error?: string): void {
        const log: RequestLog = {
            ip: getClientIP(request),
            path: request.nextUrl.pathname,
            method: request.method,
            userAgent: request.headers.get('user-agent') || 'unknown',
            timestamp: new Date().toISOString(),
            status,
            error
        };

        this.requestLogs.push(log);

        // Log buffer'ı 1000 adet ile sınırla
        if (this.requestLogs.length > 1000) {
            this.requestLogs = this.requestLogs.slice(-500); // Son 500'ü tut
        }

        // Şüpheli aktivite tespiti
        if (status && (status >= 400 || error)) {
            this.detectSuspiciousActivity(log);
        }
    }

    // Şüpheli aktivite analizi
    private detectSuspiciousActivity(log: RequestLog): void {
        const recentLogs = this.requestLogs.filter(l => 
            l.ip === log.ip && 
            Date.now() - new Date(l.timestamp).getTime() < 60000 // Son 1 dakika
        );

        // Çok fazla hata varsa alarm
        const errorCount = recentLogs.filter(l => l.status && l.status >= 400).length;
        if (errorCount >= 10) {
            console.warn(`Security Alert: IP ${log.ip} has ${errorCount} errors in last minute`);
        }
    }

    // Error response oluşturma
    private createErrorResponse(message: string, status: number): NextResponse {
        const response = NextResponse.json(
            {
                error: message,
                timestamp: new Date().toISOString(),
                status
            },
            { status }
        );

        addSecurityHeaders(response);
        return response;
    }

    // Güvenlik raporları
    getSecurityReport(): {
        totalRequests: number;
        errorRate: number;
        topErrorIPs: string[];
        suspiciousActivity: number;
    } {
        const total = this.requestLogs.length;
        const errors = this.requestLogs.filter(l => l.status && l.status >= 400).length;
        const errorRate = total > 0 ? (errors / total) * 100 : 0;

        // IP bazında hata sayısı
        const ipErrors = new Map<string, number>();
        this.requestLogs.forEach(log => {
            if (log.status && log.status >= 400) {
                ipErrors.set(log.ip, (ipErrors.get(log.ip) || 0) + 1);
            }
        });

        const topErrorIPs = Array.from(ipErrors.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([ip]) => ip);

        return {
            totalRequests: total,
            errorRate: Math.round(errorRate * 100) / 100,
            topErrorIPs,
            suspiciousActivity: this.requestLogs.filter(l => l.error?.includes('tespit edildi')).length
        };
    }
}

// Singleton instance
export const apiSecurityMiddleware = new APISecurityMiddleware();

// Helper function - route'ları güvenli hale getir
export function secureAPIRoute(config: SecurityConfig = {}) {
    return (handler: (req: NextRequest) => Promise<NextResponse>) => {
        return async (request: NextRequest) => {
            return await apiSecurityMiddleware.secureAPIRoute(request, config, handler);
        };
    };
}

// Pre-defined security configs
export const SecurityConfigs = {
    PUBLIC_API: {
        rateLimit: true,
        sanitizeBody: true,
        logRequests: true,
        allowedMethods: ['GET', 'POST']
    },
    AUTHENTICATED_API: {
        requireAuth: true,
        rateLimit: true,
        sanitizeBody: true,
        logRequests: true,
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    ADMIN_API: {
        requireAuth: true,
        requireAdmin: true,
        requireCSRF: true,
        rateLimit: true,
        sanitizeBody: true,
        logRequests: true,
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    AUTH_API: {
        rateLimit: true,
        sanitizeBody: true,
        logRequests: true,
        allowedMethods: ['POST'],
        requireHTTPS: true
    }
};
