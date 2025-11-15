import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '../types/supabase';

// Re-export the Database type for convenience
export type { Database };

// Supabase URL ve API anahtarını al
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;


// --- ISTEMCI OLUŞTURMA FONKSİYONLARI ---

/**
 * Client Component'ler ('use client') için bir Supabase istemcisi oluşturur.
 */
export const createClientComponentClient = (): SupabaseClient<Database> => {
    return createBrowserClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );
};

/**
 * Server Component'ler ve API Route'lar için birleşik, cookie-destekli Supabase istemcisi oluşturur.
 * Bu fonksiyon, sunucu tarafındaki tüm Supabase işlemleri için kullanılmalıdır.
 */
export const createServerComponentClient = async () => {
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();

    return createServerClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    );
};



/**
 * API Route'lar için cookie'leri doğru şekilde işleyen Supabase istemcisi oluşturur.
 * Bu fonksiyon, API route'larında kullanıcı kimlik doğrulaması gerektiren işlemler için kullanılmalıdır.
 */
export const createRouteHandlerClient = async () => {
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();

    return createServerClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    );
};

/**
 * Yalnızca sunucu tarafında, yönetici yetkileri gerektiren işlemler için
 * (Row Level Security'i bypass eden) bir Supabase admin istemcisi oluşturur.
 */
export const createAdminClient = () => {
    if (!supabaseServiceKey) {
        throw new Error('Supabase service key is missing. Cannot create admin client.');
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
};


// --- YARDIMCI FONKSİYONLARI ---

/**
 * Verilen JWT'nin süresinin dolup dolmadığını kontrol eder.
 * @param token Kontrol edilecek JWT string'i.
 * @returns Token süresi dolmuşsa veya token geçersizse true, aksi takdirde false.
 */


// --- VERİTABANI TİP TANIMLAMALARI ---
// Bu tipler, projenizdeki veritabanı şemasına göre genişletilebilir.

export type Profile = {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    billing_address_id: string | null;
    shipping_address_id: string | null;
    created_at: string;
    updated_at: string;
    is_email_verified: boolean;
};

export type Address = {
    id: string;
    user_id: string | null;
    street_address: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    is_default_billing: boolean;
    is_default_shipping: boolean;
    created_at: string;
    updated_at: string;
};

export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parent_category_id: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
};

export type Product = {
    id: string;
    name: string;
    slug: string;
    description: string;
    category_id: string;
    base_price: number;
    sku: string | null;
    stock_quantity: number;
    is_active: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
};

export type ProductVariant = {
    id: string;
    product_id: string;
    name: string;
    price_modifier: number;
    sku: string | null;
    stock_quantity: number;
    created_at: string;
    updated_at: string;
};

export type ProductVariantAttribute = {
    variant_id: string;
    attribute_name: string;
    attribute_value: string;
};

export type ProductImage = {
    id: string;
    product_id: string;
    image_url: string;
    alt_text: string | null;
    is_primary: boolean;
    order: number;
    created_at: string;
    updated_at: string;
};

export type Cart = {
    id: string;
    user_id: string | null;
    session_id: string | null;
    created_at: string;
    updated_at: string;
};

export type CartItem = {
    id: string;
    cart_id: string;
    product_variant_id: string;
    quantity: number;
    price_at_addition: number;
    created_at: string;
    updated_at: string;
};

export type Order = {
    id: string;
    user_id: string | null;
    customer_email: string;
    total_amount: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    shipping_address_id: string | null;
    billing_address_id: string | null;
    stripe_payment_intent_id: string | null;
    created_at: string;
    updated_at: string;
};

export type OrderItem = {
    id: string;
    order_id: string;
    product_variant_id: string;
    quantity: number;
    price_at_purchase: number;
    created_at: string;
};

export type Review = {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
};

export type Promotion = {
    id: string;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
    max_uses: number | null;
    uses_count: number;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

// Yeni eklenen tax_payments tablosu için tip tanımı
export type TaxPayment = {
    id: string;
    month: number;
    year: number;
    payment_date: string;
    amount: number;
    created_at: string;
    updated_at: string;
};