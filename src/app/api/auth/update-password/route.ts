import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPasswordResetToken, markPasswordResetTokenAsUsed } from '@/lib/email';
import { addSecurityHeaders, sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
    let response: NextResponse;
    
    try {
        const { token, password } = await request.json();

        // Input validation
        if (!token || !password) {
            response = NextResponse.json(
                { success: false, message: 'Token ve şifre gereklidir' },
                { status: 400 }
            );
            addSecurityHeaders(response);
            return response;
        }

        if (password.length < 6) {
            response = NextResponse.json(
                { success: false, message: 'Şifre en az 6 karakter olmalıdır' },
                { status: 400 }
            );
            addSecurityHeaders(response);
            return response;
        }

        // Verify token
        const tokenResult = await verifyPasswordResetToken(token);

        if (!tokenResult.success) {
            response = NextResponse.json({
                success: false,
                message: tokenResult.message
            }, { status: 400 });
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

        // Update user password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            tokenResult.userId!,
            {
                password: password
            }
        );

        if (updateError) {
            response = NextResponse.json({
                success: false,
                message: 'Şifre güncellenirken bir hata oluştu'
            }, { status: 500 });
            addSecurityHeaders(response);
            return response;
        }

        // Mark token as used
        await markPasswordResetTokenAsUsed(token);

        response = NextResponse.json({
            success: true,
            message: 'Şifreniz başarıyla güncellendi'
        });

        addSecurityHeaders(response);
        return response;

    } catch (error: any) {
        response = NextResponse.json(
            {
                success: false,
                message: 'Sunucuda beklenmedik bir hata oluştu.',
            },
            { status: 500 }
        );
        addSecurityHeaders(response);
        return response;
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