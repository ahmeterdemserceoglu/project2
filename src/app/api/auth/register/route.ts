import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use direct client creation instead of the helper function
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: Request) {
    try {

        // Check if Supabase credentials are available
        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Parse request body
        const { email, password, firstName, lastName } = await request.json();

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create admin Supabase client
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

        // Create user with admin client to bypass Supabase email confirmation
        const { data: authData, error: authError } = await adminSupabaseClient.auth.admin.createUser({
            email,
            password,
            user_metadata: {
                firstName,
                lastName,
                full_name: `${firstName} ${lastName}`
            },
            email_confirm: false // Bypass Supabase email confirmation completely
        });

        // Handle auth error
        if (authError) {
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
            return NextResponse.json(
                { error: 'Failed to create user - no user data returned' },
                { status: 500 }
            );
        }


        // Create a profile manually
        try {
            const { error: profileError } = await adminSupabaseClient
                .from('profiles')
                .insert([{
                    id: authData.user.id,
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    is_admin: false,
                    is_email_verified: false, // Will be set to true after email verification
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }]);

            if (profileError) {
                // Continue anyway as the auth account was created
            } else {
            }
        } catch (profileErr) {
            // Continue anyway as the auth account was created
        }

        // Send custom verification email
        try {
            const { createEmailVerification, sendVerificationEmail } = await import('@/lib/email');

            const token = await createEmailVerification(authData.user.id, email);

            const emailSent = await sendVerificationEmail(email, token, firstName);

            if (!emailSent) {
                // Don't fail registration, just log the error
            } else {
            }
        } catch (emailError) {
            // Don't fail registration, just log the error
        }

        // Return success
        return NextResponse.json({
            success: true,
            message: 'Kayıt başarılı! Email adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin.',
            userId: authData.user.id,
            requiresEmailVerification: true
        });

    } catch (error: any) {
        return NextResponse.json(
            {
                error: error.message || 'An error occurred during registration',
                details: JSON.stringify(error)
            },
            { status: 500 }
        );
    }
} 