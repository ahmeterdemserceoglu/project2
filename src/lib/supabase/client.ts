import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Client factory with proper SSR handling
export function createClient() {
  // Always create a new client instance for better reliability
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase.auth.token',
        flowType: 'pkce'
      }
    }
  );
}

// Lazy initialization for better performance
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getClient() {
  if (typeof window === 'undefined') {
    // Always return a new instance on server side
    return createClient();
  }
  
  if (!clientInstance) {
    clientInstance = createClient();
  }
  
  return clientInstance;
}