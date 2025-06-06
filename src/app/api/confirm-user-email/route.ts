import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvsezisxgofuchzsapks.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2c2V6aXN4Z29mdWNoenNhcGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzExNTE0MSwiZXhwIjoyMDYyNjkxMTQxfQ.NR9HI83kQ0dwv3IZ9JwY_lxf2myqyxF6VJUfzXut5Q0'
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