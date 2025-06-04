// app/api/email/resend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { resendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email adresi gereklidir' 
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Geçersiz email formatı' 
        },
        { status: 400 }
      );
    }

    // Rate limiting check (optional - can be implemented with Redis or database)
    // You can add rate limiting logic here to prevent spam

    // Resend verification email
    const result = await resendVerificationEmail(email);

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Resend email API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Sunucu hatası oluştu' 
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
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