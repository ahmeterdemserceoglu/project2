import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Run a raw SQL query to update auth.users table directly
    const { data, error } = await supabase.rpc('admin_confirm_user_email', { 
      input_user_id: userId 
    });
    
    if (error) {
      console.error('Error confirming user email:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to confirm user email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'User email confirmed successfully',
      data
    });

  } catch (err) {
    console.error('Error in confirm-user-email API:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 