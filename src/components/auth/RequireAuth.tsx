"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
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
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase.auth]);

  if (isLoading) {
    return (
      <div
        className="flex justify-center items-center min-h-[400px]"
        data-oid="wp2oybz"
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"
          data-oid="xakxr64"
        ></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
