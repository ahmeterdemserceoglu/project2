import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { updateSession } from './lib/supabase/middleware';
import { applyRateLimit } from './lib/advanced-rate-limiter';
import { getClientIP, addSecurityHeaders, isSuspiciousIP } from './lib/security';
import { createServerClient } from '@supabase/ssr';

// Advanced security configurations
const ADMIN_PATHS = ['/admin', '/api/admin'];
const PUBLIC_PATHS = ['/', '/products', '/categories', '/search'];
const ALLOWED_PATHS_WITHOUT_ADMIN = [
    '/coming-soon', 
    '/login',
    '/register',
    '/auth',
    '/api', 
    '/_next', 
    '/favicon.ico', 
    '/images', 
    '/videos',
    '/android-chrome-192x192.png',
    '/browserconfig.xml',
    '/site.webmanifest',
    '/yandex_'
];

// Güvenlik kontrolleri için helper functions
function isAdminPath(path: string): boolean {
    return ADMIN_PATHS.some(adminPath => path.startsWith(adminPath));
}



function isPublicPath(path: string): boolean {
    return PUBLIC_PATHS.some(publicPath => path === publicPath || path.startsWith(publicPath + '/'));
}

// Threat detection patterns
const THREAT_PATTERNS = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // XSS attempts
    /union.*select/gi, // SQL injection
    /exec\s*\(/gi, // Code execution attempts
    /eval\s*\(/gi, // Eval injection
    /javascript:/gi, // JavaScript protocol
];

// Malicious request detection
function detectMaliciousRequest(request: NextRequest): boolean {
    const url = request.url;
    const userAgent = request.headers.get('user-agent') || '';
    
    for (const pattern of THREAT_PATTERNS) {
        if (pattern.test(url) || pattern.test(userAgent)) {
            console.warn(`Malicious pattern detected: ${pattern} from IP: ${getClientIP(request)}`);
            return true;
        }
    }
    
    return false;
}


export async function middleware(request: NextRequest) {
    const startTime = Date.now();
    const clientIP = getClientIP(request);
    const path = request.nextUrl.pathname;
    
    try {
        // Check if path is allowed without admin check
        const isAllowedPath = ALLOWED_PATHS_WITHOUT_ADMIN.some(allowedPath => 
            path.startsWith(allowedPath)
        );

        // If not an allowed path, check if user is admin
        if (!isAllowedPath) {
            let response = NextResponse.next();
            
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() {
                            return request.cookies.getAll()
                        },
                        setAll(cookiesToSet) {
                            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                            response = NextResponse.next({
                                request,
                            })
                            cookiesToSet.forEach(({ name, value, options }) =>
                                response.cookies.set(name, value, options)
                            )
                        },
                    },
                }
            );

            const { data: { user } } = await supabase.auth.getUser();
            
            // If no user or user is not admin, redirect to coming-soon
            if (!user) {
                return NextResponse.redirect(new URL('/coming-soon', request.url));
            }

            // Check if user has admin role using is_admin column
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (!profile || profile.is_admin !== true) {
                return NextResponse.redirect(new URL('/coming-soon', request.url));
            }
        }

        // 1. Malicious request detection
        if (detectMaliciousRequest(request)) {
            console.warn(`Blocked malicious request from ${clientIP} to ${path}`);
            return new NextResponse('Access Denied', { status: 403 });
        }

        // 2. Suspicious IP check
        if (isSuspiciousIP(clientIP)) {
            console.warn(`Blocked suspicious IP: ${clientIP}`);
            return new NextResponse('Access Temporarily Restricted', { status: 429 });
        }

        // 3. API routes - apply rate limiting and advanced security
        if (path.startsWith('/api/')) {
            // Rate limiting for API routes
            const rateLimitResponse = await applyRateLimit(request);
            if (rateLimitResponse) {
                console.warn(`Rate limit exceeded for ${clientIP} on ${path}`);
                return rateLimitResponse;
            }

            // Admin API path protection - handled by individual API routes
            // Removed IP-based admin access check to prevent conflicts

            const response = NextResponse.next();
            
            // Add security headers to API responses
            addSecurityHeaders(response);
            
            // API-specific caching
            const isCacheable =
                path.startsWith('/api/flash-deals') ||
                path.startsWith('/api/categories');

            if (isCacheable) {
                const cacheTime = path.startsWith('/api/flash-deals') ? 60 : 300;
                response.headers.set('Cache-Control', `public, max-age=${cacheTime}, s-maxage=${cacheTime * 2}`);
            } else {
                response.headers.set('Cache-Control', 'no-store, no-cache');
            }

            // Add processing time header
            response.headers.set('X-Processing-Time', `${Date.now() - startTime}ms`);
            return response;
        }

        // 4. Admin path protection - removed IP check to prevent redirect loops
        // Admin authentication is handled in the admin layout component

        // 5. Session management and authentication
        const response = await updateSession(request);
        
        // 6. Enhanced security headers
        addSecurityHeaders(response);
        
        // 7. Additional security headers for web pages
        response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
        // Development ortamında daha esnek güvenlik politikaları
        if (process.env.NODE_ENV === 'production') {
            response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        }
        response.headers.set('X-DNS-Prefetch-Control', 'off');
        
        // 8. Enhanced Content Security Policy
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: blob: https://gvsezisxgofuchzsapks.supabase.co",
            "font-src 'self' data: https://fonts.gstatic.com",
            "connect-src 'self' https: wss: https://api.stripe.com https://gvsezisxgofuchzsapks.supabase.co",
            "media-src 'self' https: https://gvsezisxgofuchzsapks.supabase.co",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "frame-src https://js.stripe.com https://hooks.stripe.com",
            "upgrade-insecure-requests"
        ].join('; ');
        
        response.headers.set('Content-Security-Policy', csp);

        // 9. Path-specific caching policies
        if (path === '/login' || path === '/register' || path.startsWith('/account/') || isAdminPath(path)) {
            // No caching for sensitive pages
            response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            response.headers.set('Pragma', 'no-cache');
            response.headers.set('Expires', '0');
        } else if (isPublicPath(path)) {
            // Aggressive caching for public pages
            response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
        } else {
            // Default caching
            response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        }

        // 10. Performance monitoring
        const processingTime = Date.now() - startTime;
        response.headers.set('X-Processing-Time', `${processingTime}ms`);
        response.headers.set('X-Request-ID', crypto.randomUUID());
        
        // 11. Bot detection headers
        const userAgent = request.headers.get('user-agent') || '';
        if (userAgent.toLowerCase().includes('bot') || userAgent.toLowerCase().includes('crawler')) {
            response.headers.set('X-Robots-Tag', 'noindex, nofollow');
        }

        return response;
        
    } catch (error) {
        
        // Fallback response with basic security
        const fallbackResponse = NextResponse.next();
        addSecurityHeaders(fallbackResponse);
        return fallbackResponse;
    }
}

// Match all routes except static files
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};