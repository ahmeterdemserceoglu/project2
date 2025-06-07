"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    console.log('RequireAuth: Initializing effect hook');

    const checkSession = async () => {
      try {
        console.log('RequireAuth: [checkSession] Calling Supabase getSession API');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('RequireAuth: [checkSession] Error getting session from Supabase:', error);
          console.log('RequireAuth: [checkSession] Setting user: null, isAuthenticated: false (due to error)');
          setUser(null);
          setIsAuthenticated(false);
        } else if (session) {
          console.log('RequireAuth: [checkSession] Valid session returned from API. User:', session.user);
          console.log('RequireAuth: [checkSession] Setting user, isAuthenticated: true');
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          console.log('RequireAuth: [checkSession] No session returned from API, user not authenticated.');
          console.log('RequireAuth: [checkSession] Setting user: null, isAuthenticated: false');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error('RequireAuth: [checkSession] Error in checkSession logic:', e);
        console.log('RequireAuth: [checkSession] Setting user: null, isAuthenticated: false (due to catch)');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        console.log('RequireAuth: [checkSession] finally. Setting isLoading: false');
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`RequireAuth: [onAuthStateChange] Event: ${event}, Session User:`, session?.user);

      if (event === 'SIGNED_IN' && session) {
        console.log('RequireAuth: [onAuthStateChange] SIGNED_IN. User:', session.user);
        console.log('RequireAuth: [onAuthStateChange] Setting user, isAuthenticated: true, isLoading: false');
        setUser(session.user);
        setIsAuthenticated(true);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('RequireAuth: [onAuthStateChange] SIGNED_OUT.');
        console.log('RequireAuth: [onAuthStateChange] Setting user: null, isAuthenticated: false, isLoading: false');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        console.log('RequireAuth: [onAuthStateChange] Redirecting to login. Current path:', window.location.pathname);
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('RequireAuth: [onAuthStateChange] TOKEN_REFRESHED. User:', session.user);
        console.log('RequireAuth: [onAuthStateChange] Setting user, isAuthenticated: true, isLoading: false');
        setUser(session.user);
        setIsAuthenticated(true);
        setIsLoading(false);
      } else if (event === 'INITIAL_SESSION' && session) {
        console.log('RequireAuth: [onAuthStateChange] INITIAL_SESSION. User:', session.user);
        console.log('RequireAuth: [onAuthStateChange] Setting user, isAuthenticated: true, isLoading: false');
        setUser(session.user);
        setIsAuthenticated(true);
        setIsLoading(false);
      } else if (event === 'USER_UPDATED' && session) {
        console.log('RequireAuth: [onAuthStateChange] USER_UPDATED. User:', session.user);
        console.log('RequireAuth: [onAuthStateChange] Updating user, isAuthenticated: true (if not already), isLoading: false');
        setUser(session.user);
        setIsAuthenticated(true); 
        setIsLoading(false);
      } else if (event === 'INITIAL_SESSION' && !session) {
        // Handles cases where INITIAL_SESSION might report no session.
        console.log(`RequireAuth: [onAuthStateChange] Event ${event} with no session.`);
        console.log('RequireAuth: [onAuthStateChange] Setting user: null, isAuthenticated: false, isLoading: false');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    });

    // Fallback timer with longer timeout
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('RequireAuth: [FallbackTimer] Triggered while still loading.');
        setIsLoading(false); // Ensure isLoading is set to false
        if (!isAuthenticated) {
          console.log('RequireAuth: [FallbackTimer] Not authenticated, redirecting to login. Current path:', window.location.pathname);
          router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
        } else {
          console.log('RequireAuth: [FallbackTimer] Authenticated, no redirect needed.');
        }
      }
    }, 5000);

    return () => {
      console.log('RequireAuth: Cleanup effect hook. Unsubscribing auth listener and clearing timer.');
      authListener?.subscription?.unsubscribe();
      clearTimeout(timer);
    };
  }, [router, supabase.auth]);

  console.log(`RequireAuth: [Render] Current state - isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}`);

  if (isLoading) {
    console.log('RequireAuth: [Render] Showing loading spinner.');
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('RequireAuth: [Render] Not authenticated. Returning null (redirection should have occurred or will occur).');
    // Fallback: if not loading and not authenticated, don't render children.
    // Redirection should have happened via useEffect or fallback timer.
    return null;
  }

  console.log('RequireAuth: [Render] Authenticated. Rendering children. User:', user);
  return <>{children}</>;
}
