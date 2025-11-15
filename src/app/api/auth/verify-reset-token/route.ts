import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetToken } from '@/lib/email';
import { addSecurityHeaders } from '@/lib/security';

export async function POST(request: NextRequest) {
    let response: NextResponse;
    
    try {
        const { token } = await request.json();

        // Input validation
        if (!token) {
            response = NextResponse.json(
                { success: false, message: 'Token gereklidir' },
                { status: 400 }
            );
            addSecurityHeaders(response);
            return response;
        }

        // Verify token
        const result = await verifyPasswordResetToken(token);

        if (result.success) {
            response = NextResponse.json({
                success: true,
                message: result.message
            });
        } else {
            response = NextResponse.json({
                success: false,
                message: result.message
            }, { status: 400 });
        }

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