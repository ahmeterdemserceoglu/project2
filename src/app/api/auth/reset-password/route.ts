import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
    sanitizeInput, 
    isValidEmail, 
    getClientIP, 
    trackFailedAttempt, 
    addSecurityHeaders 
} from '@/lib/security';

export async function POST(request: NextRequest) {
    let response: NextResponse;
    
    try {
        const clientIP = getClientIP(request);
        const { email } = await request.json();

        // Input validation
        if (!email) {
            response = NextResponse.json(
                { error: 'Email adresi gereklidir' },
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

        // Rate limiting
        if (!trackFailedAttempt(clientIP)) {
            response = NextResponse.json(
                { error: 'Çok fazla istek. Lütfen 15 dakika sonra tekrar deneyin.' },
                { status: 429 }
            );
            addSecurityHeaders(response);
            return response;
        }

        // Create Supabase admin client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Check if user exists
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, first_name')
            .eq('email', sanitizedEmail)
            .single();

        // Always return success to prevent email enumeration
        // But only send email if user actually exists
        if (profile) {
            try {
                // Import custom email functions
                const { createPasswordResetToken, sendPasswordResetEmail } = await import('@/lib/email');
                
                // Create password reset token
                const token = await createPasswordResetToken(profile.id, sanitizedEmail);
                
                // Send custom password reset email
                const emailSent = await sendPasswordResetEmail(sanitizedEmail, token, profile.first_name);
                
                if (!emailSent) {
                }
            } catch (emailError) {
                // Don't expose the actual error to prevent information leakage
            }
        }

        response = NextResponse.json({
            success: true,
            message: 'Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderildi.'
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

// Other HTTP methods
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