import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateVerificationToken } from '@/lib/email';
import { createEmailVerification, sendVerificationEmail } from '@/lib/email';

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
            return NextResponse.json(
                { error: createUserError.message },
                { status: createUserError.status || 500 }
            );
        }

        if (!userData?.user) {
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
            });

        if (profileError) {
            // Profil oluşturulamadıysa, kullanıcıyı silip hata döndürmek daha doğru olabilir.
            // Şimdilik sadece loglayıp devam ediyoruz.
            await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
            return NextResponse.json(
                { error: `Failed to create profile: ${profileError.message}` },
                { status: 500 }
            );
        }

        // Doğrulama e-postası göndermek için token oluştur ve gönder
        try {
            const verificationToken = await createEmailVerification(userData.user.id, email);
            await sendVerificationEmail(email, verificationToken, firstName);
        } catch (emailError: any) {
            // E-posta gönderilemese bile kayıt başarılı sayılabilir.
            // Ama kullanıcıya bilgi vermek iyi olur.
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

        return NextResponse.json(
            { error: error.message || 'An error occurred during registration' },
            { status: 500 }
        );
    }
} 