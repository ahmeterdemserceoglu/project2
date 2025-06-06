// lib/email.ts
<<<<<<< HEAD
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
=======
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// SMTP transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // GoDaddy için gerekli olabilir
  },
});

// Email verification token generation
<<<<<<< HEAD
export function generateVerificationToken(): string {
  return randomBytes(32).toString('base64url');
}
=======
export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255

// Create verification token and save to database
export async function createEmailVerification(userId: string, email: string): Promise<string> {
  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  try {
    const { error } = await supabase
      .from('email_verifications')
      .insert({
        user_id: userId,
        email: email,
        token: token,
        expires_at: expiresAt.toISOString(),
        verified: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating email verification:', error);
      throw new Error('Email verification token oluşturulamadı');
    }

    return token;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// Send verification email
export async function sendVerificationEmail(email: string, token: string, firstName?: string): Promise<boolean> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${token}`;
  
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Doğrulama - ${process.env.NEXT_PUBLIC_SITE_NAME}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0; font-size: 28px;">
                    <span style="color: #2563eb;">HD</span>
                    <span style="color: #333;">Ticaret</span>
                    <span style="color: #10b981; font-size: 14px;">.com</span>
                </h1>
            </div>
            
            <div style="background-color: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">
                    Merhaba ${firstName || 'Değerli Müşterimiz'}! 👋
                </h2>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    HDTicaret.com'a hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki butona tıklayarak 
                    email adresinizi doğrulamanız gerekiyor.
                </p>
                
                <a href="${verificationUrl}" 
                   style="display: inline-block; background-color: #10b981; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; 
                          margin: 20px 0;">
                    📧 Email Adresimi Doğrula
                </a>
                
                <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
                    Bu link 24 saat boyunca geçerlidir. Eğer butona tıklayamıyorsanız, 
                    aşağıdaki linki kopyalayıp tarayıcınıza yapıştırın:
                </p>
                
                <p style="color: #6b7280; font-size: 12px; word-break: break-all; 
                          background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
                    ${verificationUrl}
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; 
                        border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                    Bu email'i beklemiyordunuz? Güvenle silebilirsiniz.
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                    © 2025 ${process.env.NEXT_PUBLIC_SITE_NAME} - Tüm hakları saklıdır.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"${process.env.NEXT_PUBLIC_SITE_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `📧 Email Doğrulama - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      html: emailTemplate,
    });

    console.log('Verification email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

// Verify email token
export async function verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string; message: string }> {
  try {
    // Check token in database
    const { data: verification, error } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('token', token)
      .eq('verified', false)
      .single();

    if (error || !verification) {
      return { success: false, message: 'Geçersiz veya kullanılmış doğrulama kodu.' };
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(verification.expires_at);
    
    if (now > expiresAt) {
      return { success: false, message: 'Doğrulama kodunun süresi dolmuş. Yeni bir kod talep edin.' };
    }

    // Mark token as verified
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ 
        verified: true, 
        verified_at: new Date().toISOString() 
      })
      .eq('token', token);

    if (updateError) {
      console.error('Error updating verification status:', updateError);
      return { success: false, message: 'Doğrulama işlemi sırasında bir hata oluştu.' };
    }

    // Update user profile as email verified
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        is_email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', verification.user_id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Don't return error here, verification is still successful
    }
    
    // Also update Supabase Auth user record as email verified
    // This ensures both systems (DB and Auth) are in sync
    try {
      // Try direct SQL approach using RPC function
      const { error: rpcError } = await supabase.rpc('admin_confirm_user_email', { 
        input_user_id: verification.user_id 
      });
      
      if (rpcError) {
        console.error('Error confirming user email via RPC:', rpcError);
        
        // Fallback to updateUserById (though this seems to be failing)
        try {
          const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
            verification.user_id,
            { email_confirm: true }
          );
          
          if (authUpdateError) {
            console.error('Error updating auth user email confirmation status:', authUpdateError);
          }
        } catch (authError) {
          console.error('Exception during auth API email confirmation update:', authError);
        }
      } else {
        console.log('User email confirmed successfully via RPC');
      }
    } catch (authError) {
      console.error('Exception during auth email confirmation update:', authError);
      // Don't return error here, verification is still successful
    }

    return { 
      success: true, 
      userId: verification.user_id, 
      message: 'Email adresiniz başarıyla doğrulandı!' 
    };

  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, message: 'Doğrulama işlemi sırasında bir hata oluştu.' };
  }
}

// Resend verification email
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Get user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, is_email_verified')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return { success: false, message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.' };
    }

    if (profile.is_email_verified) {
      return { success: false, message: 'Bu email adresi zaten doğrulanmış.' };
    }

    // Invalidate old tokens
    await supabase
      .from('email_verifications')
      .update({ verified: true })
      .eq('user_id', profile.id)
      .eq('verified', false);

    // Create new verification token
    const token = await createEmailVerification(profile.id, email);
    
    // Send new verification email
    const emailSent = await sendVerificationEmail(email, token, profile.first_name);
    
    if (emailSent) {
      return { success: true, message: 'Yeni doğrulama emaili gönderildi. Lütfen email kutunuzu kontrol edin.' };
    } else {
      return { success: false, message: 'Email gönderilirken bir hata oluştu.' };
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    return { success: false, message: 'Yeniden gönderme işlemi sırasında bir hata oluştu.' };
  }
}