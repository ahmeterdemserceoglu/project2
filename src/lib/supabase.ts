import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// These environment variables need to be set in .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a singleton client instance for client-side usage
let clientInstance: ReturnType<typeof createClient<Database>> | null = null;

// For client-side usage - singleton pattern to prevent multiple instances
export function createClientComponentClient() {
  if (!clientInstance) {
    clientInstance = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          // Disable Supabase's default email verification
          flowType: 'pkce',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      }
    );
  }
  return clientInstance;
}

// For server-side usage (API routes, Server Components)
export function createServerComponentClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
  // Using service role key for admin privileges in server context
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Server-side admin Supabase client (with service role for admin functions)
export function createAdminClient() {
  return createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Database types - extend as your schema grows
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