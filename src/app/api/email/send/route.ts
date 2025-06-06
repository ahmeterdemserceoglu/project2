// app/api/email/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createEmailVerification, sendVerificationEmail } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvsezisxgofuchzsapks.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2c2V6aXN4Z29mdWNoenNhcGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzExNTE0MSwiZXhwIjoyMDYyNjkxMTQxfQ.NR9HI83kQ0dwv3IZ9JwY_lxf2myqyxF6VJUfzXut5Q0'
);

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    // Validate required fields
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    // Get user details from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, is_email_verified')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (profile.is_email_verified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      );
    }

    // Invalidate any existing unverified tokens for this user
    await supabase
      .from('email_verifications')
      .update({ verified: true })
      .eq('user_id', userId)
      .eq('verified', false);

    // Create new verification token
    const token = await createEmailVerification(userId, email);

    // Send verification email
    const emailSent = await sendVerificationEmail(email, token, profile.first_name);

    if (emailSent) {
      // Log the email sending for debugging
      await supabase
        .from('debug_logs')
        .insert({
          event_type: 'email_verification_sent',
          details: {
            user_id: userId,
            email: email,
            token_created: true,
            email_sent: true,
            timestamp: new Date().toISOString()
          }
        });

      return NextResponse.json(
        {
          success: true,
          message: 'Verification email sent successfully'
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send email API error:', error);

    // Log the error for debugging
    try {
      await supabase
        .from('debug_logs')
        .insert({
          event_type: 'email_verification_error',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.error('Error logging to database:', logError);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}