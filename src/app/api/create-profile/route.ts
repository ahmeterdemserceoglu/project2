import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

export async function POST(request: NextRequest) {
  try {
    // Supabase client oluştur (service role)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Request body'den verileri al
    const { user_id, email, first_name, last_name } = await request.json();

    // Gerekli verileri kontrol et
    if (!user_id || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    // Kullanıcı zaten var mı kontrol et
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists', id: existingProfile.id },
        { status: 409 }
      );
    }

    // Get user info to extract any name data from auth if available
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    let userFirstName = first_name || '';
    let userLastName = last_name || '';
    
    // Try to get name from user metadata if not provided
    if (userData?.user) {
      if (!userFirstName && userData.user.user_metadata?.first_name) {
        userFirstName = userData.user.user_metadata.first_name;
      }
      if (!userLastName && userData.user.user_metadata?.last_name) {
        userLastName = userData.user.user_metadata.last_name;
      }
      
      // Extract name from email if still not available
      if (!userFirstName && !userLastName) {
        const emailUsername = email.split('@')[0];
        
        if (emailUsername) {
          // Try to parse a name from email (remove numbers, split by non-alphas)
          const cleanUsername = emailUsername
            .replace(/[0-9]/g, '')
            .split(/[._-]/)
            .filter((part: string) => part.length > 0);
          
          if (cleanUsername.length > 0) {
            userFirstName = cleanUsername[0].charAt(0).toUpperCase() + 
                           cleanUsername[0].slice(1).toLowerCase();
            
            if (cleanUsername.length > 1) {
              userLastName = cleanUsername[1].charAt(0).toUpperCase() + 
                            cleanUsername[1].slice(1).toLowerCase();
            }
          }
        }
      }
      
      // Update the user's metadata with the name
      if (userFirstName || userLastName) {
        await supabase.auth.admin.updateUserById(user_id, {
          user_metadata: {
            ...userData.user.user_metadata,
            first_name: userFirstName,
            last_name: userLastName
          }
        });
      }
    }

    // Database fonksiyonu ile profil oluştur
    try {
      const { data, error } = await supabase.rpc(
        'register_user_with_profile', 
        { 
          user_email: email,
          first_name: userFirstName,
          last_name: userLastName
        }
      );

      if (error) {
        console.error('RPC error:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      // Yedek çözüm olarak doğrudan profil oluştur
      if (!data || data.length === 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user_id,
            email,
            first_name: userFirstName,
            last_name: userLastName,
            is_admin: false,
            is_email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id',
            ignoreDuplicates: false
          })
          .select('id')
          .single();

        if (profileError) {
          console.error('Direct profile creation error:', profileError);
          return NextResponse.json(
            { error: profileError.message },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { success: true, id: profileData.id, method: 'direct' },
          { status: 201 }
        );
      }

      return NextResponse.json(
        { success: true, data, method: 'rpc' },
        { status: 201 }
      );
      
    } catch (err: any) {
      console.error('Error creating profile:', err);
      
      // Farklı bir denemede bulun - SQL yerine doğrudan Supabase API
      try {
        const { data: directData, error: directError } = await supabase
          .from('profiles')
          .upsert({
            id: user_id,
            email,
            first_name: userFirstName,
            last_name: userLastName,
            is_admin: false,
            is_email_verified: false
          }, {
            onConflict: 'id',
            ignoreDuplicates: false
          })
          .select();
          
        if (directError) {
          return NextResponse.json(
            { error: directError.message, phase: 'fallback' },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { success: true, data: directData, method: 'fallback' },
          { status: 201 }
        );
      } catch (fallbackErr) {
        return NextResponse.json(
          { error: 'Multiple profile creation attempts failed' },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 