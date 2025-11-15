import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  try {

    // Authorization header'ından token'ı al
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token gerekli' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    // Supabase client oluştur
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Token ile kullanıcıyı doğrula
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Kullanıcı ID'leri eşleşiyor mu kontrol et
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    // Profil bilgilerini al
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Profil bilgileri alınamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu', details: error.message },
      { status: 500 }
    );
  }
}