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
    // Initial check for session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user); 
        setIsAuthenticated(true);
        setIsLoading(false);
      }
      // If no session, onAuthStateChange or timeout will handle it
    }).catch(error => {
      console.error('Error getting session:', error);
      // isLoading will be handled by onAuthStateChange or timeout
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user); 
        setIsAuthenticated(true);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null); 
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      } else if (event === 'INITIAL_SESSION') {
        if (session) {
          setUser(session.user); 
          setIsAuthenticated(true);
        } else {
          setUser(null); 
          setIsAuthenticated(false);
          // Don't redirect here immediately, let timeout handle it if still not authenticated
        }
        setIsLoading(false); // Initial auth state determined
      }
    });

    const timer = setTimeout(() => {
        if (isLoading) { // If still loading after initial checks and listener
            if (!isAuthenticated) { // And not authenticated
                 router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
            }
            setIsLoading(false); // Ensure loading is false
        }
    }, 200); // Adjusted timeout slightly for potentially slow networks/devices

    return () => {
      authListener?.subscription?.unsubscribe();
      clearTimeout(timer);
    };
  }, [router, supabase.auth]); // Using original dependencies from origin/fix/account-page-loading

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Fallback: if not loading and not authenticated, don't render children.
    // Redirection should have happened via useEffect.
    return null; 
  }

  return <>{children}</>;
}
