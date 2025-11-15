import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '../../../lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Doğrulama kodu bulunamadı.'
        },
        { status: 400 }
      );
    }

    const result = await verifyEmailToken(token);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: 'Doğrulama işlemi sırasında bir hata oluştu.'
      },
      { status: 500 }
    );
  }
} 