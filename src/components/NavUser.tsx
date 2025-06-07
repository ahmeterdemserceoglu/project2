"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";

interface NavUserProps {
  mobileView?: boolean;
  onMobileClick?: () => void;
}

export default function NavUser({
  mobileView = false,
  onMobileClick,
}: NavUserProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { showToast } = useToast();
  const { showNotification } = useNotification();

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error("Error checking authentication status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUser(session?.user || null);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      // Clear all session storage mechanisms first
      try {
        // Clear localStorage
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('supabase-auth-token');
        localStorage.removeItem('sb-auth-token');
        localStorage.removeItem('authSuccess');

        // Clear sessionStorage
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('supabase.auth.token');
          sessionStorage.removeItem('supabase-auth-token');
          sessionStorage.removeItem('sb-auth-token');
          sessionStorage.removeItem('authSuccess');
        }

        // Clear all cookies
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

          if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
          }
        }
      } catch (clearError) {
        console.error("Error clearing session storage:", clearError);
      }

      // Then sign out from Supabase
      await supabase.auth.signOut();

      const userName =
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "Kullanıcı";
      showToast(`${userName}, başarıyla çıkış yapıldı`, "success");
      showNotification("Oturumunuz güvenli bir şekilde sonlandırıldı", "info");

      // Force a full page reload to ensure all state is cleared
      window.location.href = "/";
    } catch (error) {
      console.error("Çıkış yaparken hata oluştu:", error);
      showToast("Çıkış yapılırken bir hata oluştu", "error");
      showNotification(
        "Çıkış işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin.",
        "error",
      );
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (loading) {
    // Render a minimal skeleton loader while checking auth status
    if (mobileView) {
      return (
        <div
          className="flex flex-col items-center justify-center p-3 text-xs rounded-md"
          data-oid="kuxg69:"
        >
          <div
            className="h-5 w-5 mb-1 bg-gray-200 dark:bg-dark-lighter rounded-full animate-pulse"
            data-oid="k5gd0tg"
          ></div>
          <span className="mt-1" data-oid="-v2spb8">
            Yükleniyor...
          </span>
        </div>
      );
    }

    return (
      <div
        className="p-2 rounded-full bg-gray-100 dark:bg-dark-lighter animate-pulse w-9 h-9"
        data-oid="186bfv1"
      ></div>
    );
  }

  if (!user) {
    // If not logged in, show login link
    if (mobileView) {
      return (
        <Link
          href="/login"
          className="flex flex-col items-center justify-center p-3 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
          onClick={onMobileClick}
          data-oid="t744d.m"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="rlbiomy"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              data-oid="gc:3m_d"
            />
          </svg>
          Giriş Yap
        </Link>
      );
    }

    return (
      <Link
        href="/login"
        className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
        aria-label="Giriş Yap"
        data-oid="9vr9aaz"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          data-oid="-1eosow"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            data-oid="qsdtss-"
          />
        </svg>
      </Link>
    );
  }

  // If logged in and on mobile view, show simplified user menu
  if (mobileView) {
    return (
      <div
        className="flex flex-col items-center justify-center p-3 text-xs"
        data-oid="-atkdhb"
      >
        <div
          className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs mb-1"
          data-oid="gv68605"
        >
          {user.email?.charAt(0).toUpperCase() ||
            user.user_metadata?.full_name?.charAt(0).toUpperCase() ||
            "U"}
        </div>
        <div className="flex flex-col mt-1" data-oid="yvev78m">
          <Link
            href="/account"
            className="text-center hover:text-primary dark:hover:text-accent transition-colors"
            onClick={onMobileClick}
            data-oid="7drc6iu"
          >
            Hesabım
          </Link>
          <button
            onClick={() => {
              handleSignOut();
              if (onMobileClick) onMobileClick();
            }}
            className="text-red-600 dark:text-red-400 mt-2"
            data-oid="36momcf"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    );
  }

  // Default desktop view with dropdown
  return (
    <div className="relative" data-oid="u4vnnfe">
      <button
        className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200 flex items-center"
        onClick={toggleDropdown}
        aria-label="Hesabım"
        aria-expanded={isDropdownOpen}
        data-oid="qkzqfsv"
      >
        <div
          className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs"
          data-oid="gnk2_bq"
        >
          {user.email?.charAt(0).toUpperCase() ||
            user.user_metadata?.full_name?.charAt(0).toUpperCase() ||
            "U"}
        </div>
      </button>

      {isDropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-light rounded-lg shadow-lg py-1 z-50 border dark:border-dark-lighter"
          data-oid="xkk2h16"
        >
          <div
            className="px-4 py-2 border-b dark:border-dark-lighter"
            data-oid="-z2qq.x"
          >
            <p
              className="text-sm font-medium text-gray-900 dark:text-white truncate"
              data-oid="dgflk6a"
            >
              {user.user_metadata?.full_name || user.email}
            </p>
            <p
              className="text-xs text-gray-500 dark:text-gray-400 truncate"
              data-oid="90frzq8"
            >
              {user.email}
            </p>
          </div>
          <Link
            href="/account"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-lighter"
            onClick={() => setIsDropdownOpen(false)}
            data-oid="mj2n4if"
          >
            Hesabım
          </Link>
          <Link
            href="/orders"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-lighter"
            onClick={() => setIsDropdownOpen(false)}
            data-oid="cvhcd_s"
          >
            Siparişlerim
          </Link>
          <button
            onClick={() => {
              handleSignOut();
              setIsDropdownOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-lighter"
            data-oid="7gseucz"
          >
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}
