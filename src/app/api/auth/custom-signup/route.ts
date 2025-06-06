import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateVerificationToken } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Request body'den verileri al
    const { email, password, firstName, lastName } = await request.json();

    // Gerekli verileri kontrol et
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Admin API ile kullanıcı oluştur
    // Bu yöntem otomatik doğrulama e-postalarını atlar
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`
      }
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      return NextResponse.json(
        { error: createUserError.message },
        { status: createUserError.status || 500 }
      );
    }

    if (!userData?.user) {
      console.error('No user data returned');
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Profil oluştur
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        is_admin: false,
        is_email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Profil oluşturulamasa bile kullanıcı oluşturuldu, bu yüzden devam et
    }

    // Debug log
    await supabaseAdmin
      .from('debug_logs')
      .insert({
        operation: 'custom_signup',
        status: 'success',
        details: {
          user_id: userData.user.id,
          email
        }
      });

    return NextResponse.json({
      success: true,
      userId: userData.user.id,
      message: 'User created successfully'
    });

  } catch (error: any) {
    console.error('Custom signup error:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 