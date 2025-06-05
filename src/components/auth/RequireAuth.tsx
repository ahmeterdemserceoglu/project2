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
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!session) {
          router.push(
            "/login?redirect=" + encodeURIComponent(window.location.pathname),
          );
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div
        className="flex justify-center items-center min-h-[400px]"
        data-oid="19jp7b7"
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"
          data-oid="q6bz8pr"
        ></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
