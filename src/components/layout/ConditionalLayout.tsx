"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import { createClientComponentClient } from "@/lib/supabase";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSessionInitialized, setIsSessionInitialized] = useState(false);

  // Attempt to initialize Supabase auth on every page load
  useEffect(() => {
    console.log("ConditionalLayout: Initializing Supabase auth");

    const attemptInitializeAuth = async () => {
      try {
        const supabase = createClientComponentClient();
        let sessionRestored = false;

        // First try to get session from storage
        let storedSession = null;
        try {
          const storedData = localStorage.getItem('supabase.auth.token');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData?.currentSession) {
              storedSession = parsedData.currentSession;
              console.log("ConditionalLayout: Found session in localStorage");
            }
          }
        } catch (storageError) {
          console.error("Error accessing localStorage:", storageError);
        }

        // Try to get session directly from the API
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        }

        if (session) {
          console.log("ConditionalLayout: Session found from API:", session.user.email);
          sessionRestored = true;

          // If we have a session from API but not in storage, save it
          if (!storedSession) {
            try {
              const sessionData = {
                currentSession: session,
                expiresAt: Math.floor(Date.now() / 1000) + (session.expires_in || 3600)
              };
              localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData));
              console.log("ConditionalLayout: Saved session to localStorage");
            } catch (storageError) {
              console.error("Error saving session to localStorage:", storageError);
            }
          }
        } else if (storedSession) {
          // We have a session in storage but not from API, try to restore it
          console.log("ConditionalLayout: Attempting to restore session from storage");

          try {
            // Try to set the session manually using the stored tokens
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: storedSession.access_token,
              refresh_token: storedSession.refresh_token
            });

            if (setSessionError) {
              console.error("Error setting session from storage:", setSessionError);

              // If setting session failed, try to refresh it
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                refresh_token: storedSession.refresh_token
              });

              if (refreshError) {
                console.error("Error refreshing session:", refreshError);
                // Clear invalid session data
                localStorage.removeItem('supabase.auth.token');
              } else if (refreshData.session) {
                console.log("ConditionalLayout: Session refreshed successfully");
                sessionRestored = true;

                // Save the refreshed session
                const sessionData = {
                  currentSession: refreshData.session,
                  expiresAt: Math.floor(Date.now() / 1000) + (refreshData.session.expires_in || 3600)
                };
                localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData));
              }
            } else {
              console.log("ConditionalLayout: Session set successfully from storage");
              sessionRestored = true;
            }
          } catch (restoreError) {
            console.error("Error during session restoration:", restoreError);
          }
        }

        // Try to use cookies as a last resort
        if (!sessionRestored && document.cookie) {
          console.log("ConditionalLayout: Attempting to restore session from cookies");

          try {
            const cookies = document.cookie.split('; ');
            const accessTokenCookie = cookies.find(c => c.startsWith('sb-access-token='));
            const refreshTokenCookie = cookies.find(c => c.startsWith('sb-refresh-token='));

            if (accessTokenCookie && refreshTokenCookie) {
              const accessToken = accessTokenCookie.split('=')[1];
              const refreshToken = refreshTokenCookie.split('=')[1];

              console.log("ConditionalLayout: Found tokens in cookies");

              // Try to set the session manually
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });

              if (setSessionError) {
                console.error("Error setting session from cookies:", setSessionError);

                // If setting session failed, try to refresh it
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                  refresh_token: refreshToken
                });

                if (refreshError) {
                  console.error("Error refreshing session from cookies:", refreshError);
                } else if (refreshData.session) {
                  console.log("ConditionalLayout: Session refreshed successfully from cookies");
                  sessionRestored = true;
                }
              } else {
                console.log("ConditionalLayout: Session set successfully from cookies");
                sessionRestored = true;
              }
            }
          } catch (cookieError) {
            console.error("Error processing cookies:", cookieError);
          }
        }

        setIsSessionInitialized(true);

        // Special handling for login page if user is already logged in
        if (sessionRestored && pathname === '/login') {
          console.log("ConditionalLayout: Already logged in, redirecting from login page");
          router.push('/account');
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsSessionInitialized(true);
      }
    };

    attemptInitializeAuth();
  }, [pathname, router]);

  // Check if current path is in admin section
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    // Render only the children without header/footer for admin pages
    return (
      <div className="flex-grow">
        {children}
      </div>
    );
  }

  // Render with header/footer for all other pages
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow">
        {children}
      </main>
      <AppFooter />
    </div>
  );
} 