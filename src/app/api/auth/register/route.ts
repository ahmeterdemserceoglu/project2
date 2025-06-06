import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use direct client creation instead of the helper function
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: Request) {
  try {
    console.log("API: Registration request received");

    // Check if Supabase credentials are available
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("API: Supabase credentials missing");
      return NextResponse.json(
        { error: 'Server configuration error' }, 
        { status: 500 }
      );
    }
    
    // Parse request body
    const { email, password, firstName, lastName } = await request.json();
    console.log("API: Parsed user data for email:", email);
    
    if (!email || !password || !firstName || !lastName) {
      console.error("API: Missing required fields");
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Create a direct Supabase client without helpers
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Disable the built-in email verification with a custom admin API key
    const adminSupabaseClient = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create user with standard sign-up
    console.log("API: Attempting to create user with signUp");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          full_name: `${firstName} ${lastName}`,
          email_confirm: false // Signal not to send emails
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/confirm-redirect?email=${encodeURIComponent(email)}`
      }
    });

    // After signup, force signout to prevent any Supabase auto emails
    try {
      await supabase.auth.signOut();
    } catch (signOutErr) {
      console.log("Could not sign out after registration", signOutErr);
      // Non-critical error, continue
    }

    // Handle auth error
    if (authError) {
      console.error('API: Error creating user:', authError);
      return NextResponse.json(
        { 
          error: authError.message,
          code: authError.code,
          status: authError.status,
          details: 'Auth signup error' 
        }, 
        { status: authError.status || 500 }
      );
    }

    // Check if we have user data
    if (!authData?.user) {
      console.error('API: No user data returned');
      return NextResponse.json(
        { error: 'Failed to create user - no user data returned' }, 
        { status: 500 }
      );
    }

    console.log("API: User created successfully with ID:", authData.user.id);

    // Create a profile manually
    try {
      console.log("API: Creating profile for user");
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);
      
      if (profileError) {
        console.error('API: Error creating profile:', profileError);
        // Continue anyway as the auth account was created
      } else {
        console.log("API: Profile created successfully");
      }
    } catch (profileErr) {
      console.error('API: Exception creating profile:', profileErr);
      // Continue anyway as the auth account was created
    }
    
    // Return success
    return NextResponse.json({ 
      success: true, 
      message: 'User registered successfully',
      userId: authData.user.id
    });
      
  } catch (error: any) {
    console.error('API: Registration exception:', error);
    return NextResponse.json(
      { 
        error: error.message || 'An error occurred during registration',
        details: JSON.stringify(error)
      }, 
      { status: 500 }
    );
  }
} 