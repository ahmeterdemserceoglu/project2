"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";
=======
import React, { useEffect, useState } from 'react'; // Import React
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js'; // Import User type
>>>>>>> origin/fix/account-page-loading

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null); // Add user state
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
<<<<<<< HEAD
    const checkAuth = async () => {
      try {
        // First try to get the session from Supabase
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session retrieval error:", error);
          throw error;
        }

        // Check if we have a valid session
        if (session) {
          // Verify if the session is still valid
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError || !userData.user) {
            console.error("User verification failed:", userError);
            throw new Error("User verification failed");
          }
          
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // If we don't have a session, check if there's an auth flag in sessionStorage
        // that might indicate the user just logged in
        const authSuccess = sessionStorage.getItem('authSuccess');
        
        if (authSuccess === 'true') {
          // If user just logged in successfully but we don't have a session yet,
          // try to refresh the auth state
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshData.session) {
        setIsAuthenticated(true);
            setIsLoading(false);
            return;
          } else {
            // If refresh fails, clear the auth flag
            sessionStorage.removeItem('authSuccess');
            console.error("Session refresh failed:", refreshError);
          }
        }
        
        // If we reach here, user is not authenticated
        console.log("No active session found, redirecting to login");
        router.push(
          "/login?redirect=" + encodeURIComponent(window.location.pathname),
        );
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      } finally {
=======
    // Initial check for session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user); // Set user
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        // No session initially, wait for onAuthStateChange or redirect if already determined
        // This part is tricky, as onAuthStateChange might fire immediately or after some delay
        // We rely on onAuthStateChange to eventually set isLoading to false.
        // If getSession returns no session, we don't immediately redirect,
        // but wait for onAuthStateChange to confirm.
      }
    }).catch(error => {
      console.error('Error getting session:', error);
      //  isLoading should be set to false by onAuthStateChange in case of error too.
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user); // Set user
        setIsAuthenticated(true);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null); // Clear user
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      } else if (event === 'INITIAL_SESSION') {
        // This event fires when the listener is first attached
        if (session) {
          setUser(session.user); // Set user
          setIsAuthenticated(true);
        } else {
          setUser(null); // Clear user
          setIsAuthenticated(false);
          router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
        }
>>>>>>> origin/fix/account-page-loading
        setIsLoading(false);
      }
    });

    // Initial check if still loading and no session after listeners are set up
    // This handles the case where onAuthStateChange doesn't fire immediately
    // and getSession found no session.
    // We need to ensure isLoading becomes false.
    // A small delay to allow onAuthStateChange to fire if it's going to.
    const timer = setTimeout(() => {
        if (isLoading) { // Check if still loading after initial checks and listener setup
            // If still loading, and isAuthenticated is false, means no session found.
            // This can happen if getSession had no session, and onAuthStateChange hasn't fired SIGNED_IN.
            // It might also mean onAuthStateChange fired SIGNED_OUT or INITIAL_SESSION with no session.
            if (!isAuthenticated) {
                 router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
            }
            setIsLoading(false); // Ensure loading is false in any case after timeout
        }
    }, 100); // Adjust timeout as necessary, e.g., 100ms to 500ms

    return () => {
      authListener?.subscription?.unsubscribe();
      clearTimeout(timer);
    };
<<<<<<< HEAD

    checkAuth();
=======
>>>>>>> origin/fix/account-page-loading
  }, [router, supabase.auth]);

  if (isLoading) {
    return (
<<<<<<< HEAD
      <div
        className="flex justify-center items-center min-h-[400px]"
        data-oid="wp2oybz"
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"
          data-oid="xakxr64"
        ></div>
=======
      <div className="flex justify-center items-center min-h-[400px]">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
>>>>>>> origin/fix/account-page-loading
      </div>
    );
  }

<<<<<<< HEAD
  return isAuthenticated ? <>{children}</> : null;
}
=======
  return isAuthenticated && user ? (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // @ts-ignore user prop might not be explicitly defined on all possible children
          return React.cloneElement(child, { user });
        }
        return child;
      })}
    </>
  ) : null; // Or handle redirect if !isAuthenticated more explicitly, though covered by useEffect
} 
>>>>>>> origin/fix/account-page-loading
