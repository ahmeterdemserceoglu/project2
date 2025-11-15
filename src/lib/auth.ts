'use client'

import { Database } from '../types/supabase';
import { createClient } from './supabase/client';
import { type SupabaseClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

// Create a client using @supabase/ssr for better Next.js 15 compatibility
export const supabase = createClient();

// Auth helper functions
export const authHelpers = {
    // Sign in user
    async signIn(email: string, password: string) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return { data: null, error };
            }

            // Check session manually
            if (data.session) {
            }

            return { data, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    },

    // Sign out user - COMPLETELY WIPING ALL SESSION DATA
    async signOut() {
        try {
            // Try client logout
            const { error } = await supabase.auth.signOut({ scope: 'global' });
            if (error) {
            }
            return { error: null };
        } catch (err) {
            return { error: err };
        }
    },

    // Reset all session data and force a hard reload
    async hardReset() {
        await this.signOut();
        if (typeof window !== 'undefined') {
            window.location.href = '/login?t=' + new Date().getTime();
        }
    },

    // Get current session
    async getSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                return { session: null, error };
            }
            return { session, error: null };
        } catch (err) {
            return { session: null, error: err };
        }
    },

    // Refresh session (Supabase client handles this automatically, but keeping for compatibility if needed)
    async refreshSession() {
        try {
            const { data: { session }, error } = await supabase.auth.refreshSession();
            if (error) {
                return { session: null, error };
            }
            return { session, error: null };
        } catch (err) {
            return { session: null, error: err };
        }
    },

    // Get current user
    async getUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                return { user: null, error };
            }
            return { user, error: null };
        } catch (err) {
            return { user: null, error: err };
        }
    }
};


// Custom hook to safely use Supabase in client components
export function useSupabase() {
    const [supabase, setSupabase] = useState<any>(null)

    useEffect(() => {
        // Initialize the client only on the client side
        const client = createClient()
        setSupabase(client)

        // Sayfa yüklendiğinde oturum yenilemeyi başlat
        client.auth.startAutoRefresh();

        return () => {
            // Component unmount olduğunda yenilemeyi durdur
            client.auth.stopAutoRefresh();
        };
    }, [])

    return supabase

}