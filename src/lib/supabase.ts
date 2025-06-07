import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// These environment variables need to be set in .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvsezisxgofuchzsapks.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2c2V6aXN4Z29mdWNoenNhcGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMTUxNDEsImV4cCI6MjA2MjY5MTE0MX0.yVO9O_9K2nPlUKOXo5a9U2V1sXFudl7_gvqJTPdrA6c';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2c2V6aXN4Z29mdWNoenNhcGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzExNTE0MSwiZXhwIjoyMDYyNjkxMTQxfQ.NR9HI83kQ0dwv3IZ9JwY_lxf2myqyxF6VJUfzXut5Q0';

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
          flowType: 'pkce',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          // Use a consistent storage key
          storageKey: 'supabase.auth.token',
          // Enable debug mode to see what's happening with auth
          debug: true,
          // Enhanced storage to support cookies, localStorage, and sessionStorage
          storage: {
            getItem: (key: string) => {
              if (typeof window === 'undefined') {
                return null;
              }

              // Debug
              console.log('Getting auth from storage:', key);

              // First try to get from localStorage
              let storedValue = localStorage.getItem(key);
              if (storedValue) {
                console.log('Found in localStorage');
              }

              // If not in localStorage, try sessionStorage as fallback
              if (!storedValue && typeof sessionStorage !== 'undefined') {
                storedValue = sessionStorage.getItem(key);
                if (storedValue) {
                  console.log('Found in sessionStorage');
                }
              }

              // Check for cookies (necessary for some browsers, especially in production)
              if (!storedValue && document.cookie) {
                const cookies = document.cookie.split('; ');
                // Check both the storageKey and the sb-auth-token cookie
                const cookie = cookies.find(c => c.startsWith(`${key}=`) || c.startsWith('sb-auth-token='));
                if (cookie) {
                  console.log('Found in cookies');
                  storedValue = decodeURIComponent(cookie.split('=')[1]);
                }
              }

              if (!storedValue) {
                console.log('No auth token found in any storage');
                return null;
              }

              try {
                return JSON.parse(storedValue);
              } catch (error) {
                console.log('Error parsing stored value, returning as is');
                return storedValue;
              }
            },
            setItem: (key: string, value: any) => {
              if (typeof window === 'undefined') {
                return;
              }

              console.log('Setting auth to storage:', key);
              const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

              try {
                // Store in both localStorage and sessionStorage for redundancy
                localStorage.setItem(key, stringValue);
                if (typeof sessionStorage !== 'undefined') {
                  sessionStorage.setItem(key, stringValue);
                }

                // Also store in cookies for cross-tab persistence and better Vercel compatibility
                // Set expiry to 7 days
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 7);

                // Get hostname for the cookie domain
                const hostname = window.location.hostname;
                const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

                // Use encodeURIComponent to handle special characters
                // For cookies, don't set domain on localhost as it won't work
                const cookieStr = isLocalhost
                  ? `${key}=${encodeURIComponent(stringValue)};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`
                  : `${key}=${encodeURIComponent(stringValue)};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`;

                document.cookie = cookieStr;

                // Also store a backup cookie with a different name
                document.cookie = `sb-auth-token=${encodeURIComponent(stringValue)};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`;

                console.log('Auth token saved to all storage mechanisms');
              } catch (error) {
                console.error('Error storing auth session:', error);
              }
            },
            removeItem: (key: string) => {
              if (typeof window === 'undefined') {
                return;
              }

              console.log('Removing auth from storage:', key);

              try {
                // Remove from localStorage and sessionStorage
                localStorage.removeItem(key);
                if (typeof sessionStorage !== 'undefined') {
                  sessionStorage.removeItem(key);
                }

                // Get hostname for the cookie domain
                const hostname = window.location.hostname;
                const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

                // Remove from cookies by setting an expired date
                // For cookies, don't set domain on localhost as it won't work
                const cookieStr = isLocalhost
                  ? `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`
                  : `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;

                document.cookie = cookieStr;
                document.cookie = `sb-auth-token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
                console.log('Auth token removed from all storage mechanisms');
              } catch (error) {
                console.error('Error removing auth session:', error);
              }
            },
          }
        }
      }
    );
  }
  return clientInstance;
}

// For server-side usage (API routes, Server Components)
export function createServerComponentClient() {
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
    supabaseServiceKey,
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