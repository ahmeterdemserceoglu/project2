"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";

// Login içeriği için ayrı bir komponent oluşturuyoruz
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const supabase = createClientComponentClient();
  const { showToast } = useToast();
  const { showNotification } = useNotification();

  // Doğrulama durumunu kontrol et
  useEffect(() => {
    if (verified === "true") {
      showNotification(
        "Email adresiniz başarıyla doğrulanmıştır! Şimdi giriş yapabilirsiniz.",
        "success",
      );
    }
  }, [verified, showNotification]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    try {
      // Step 1: Attempt to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // Handle login errors
      if (error) {
        console.error("Login error:", error);

        let errorMsg =
          "Giriş sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edin.";

        if (error?.message?.includes("Invalid login credentials")) {
          errorMsg = "Geçersiz email adresi veya şifre.";
        } else if (
          error?.message?.includes("Email not confirmed") ||
          error?.message?.includes("email not confirmed")
        ) {
          errorMsg =
            "Email adresiniz henüz doğrulanmamış. Lütfen emailinizi kontrol edin veya doğrulama linkinin yeniden gönderilmesi için kayıt sayfasını ziyaret edin.";
          showNotification(
            'Doğrulama emaili gönderilmesi için <a href="/register/confirm?email=' +
              encodeURIComponent(email) +
              '" class="text-secondary hover:underline">buraya tıklayın</a>',
            "info",
          );
        } else if (error?.message?.includes("rate limit")) {
          errorMsg =
            "Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.";
        }

        setErrorMessage(errorMsg);
        showNotification(errorMsg, "error");
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        const errorMsg = "Kullanıcı bilgileri alınamadı.";
        setErrorMessage(errorMsg);
        showNotification(errorMsg, "error");
        setIsLoading(false);
        return;
      }

      // Step 2: Check user profile in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        // Continue anyway, this is not critical
      }

      // If profile doesn't exist, create it
      if (!profileData) {
        console.log("Profile not found, attempting to create");
        try {
          // Try to create profile via API
          const apiResponse = await fetch("/api/create-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: data.user.id,
              email: data.user.email,
            }),
          });

          if (!apiResponse.ok) {
            console.error("Error creating profile via API");
          }
        } catch (err) {
          console.error("Exception during profile creation:", err);
          // Non-critical error, continue with login
        }
      }

      // Step 3: Successfully logged in, redirect to dashboard
      showToast("Giriş başarılı! Yönlendiriliyorsunuz...", "success");
      router.push("/account");
    } catch (error: any) {
      console.error("Login exception:", error);
      const errorMsg =
        "Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.";
      setErrorMessage(errorMsg);
      showNotification(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      showToast(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} ile giriş yapılıyor...`,
        "info",
      );
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      const errorMsg = `${provider.charAt(0).toUpperCase() + provider.slice(1)} ile giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.`;
      setErrorMessage(errorMsg);
      showToast(errorMsg, "error");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen overflow-hidden flex flex-col md:flex-row"
      data-oid="b0qumjq"
    >
      {/* Form side - Taking full height on mobile, half width on desktop */}
      <div
        className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-y-auto"
        data-oid="s6ex6tz"
      >
        <div className="w-full max-w-md py-2" data-oid="y6ev02h">
          <div className="text-center md:text-left mb-6" data-oid="z.h1x:i">
            <Link href="/" className="inline-block mb-6" data-oid="nwva12u">
              <span
                className="text-2xl font-bold tracking-tighter relative"
                data-oid="mn6anvp"
              >
                <span className="text-primary" data-oid="j0c1e5e">
                  HD
                </span>
                <span
                  className="text-gray-800 dark:text-white"
                  data-oid="i78dwp2"
                >
                  Ticaret
                </span>
                <span
                  className="text-xs text-secondary ml-1 absolute -right-4 top-0"
                  data-oid="vtg7wha"
                >
                  .com
                </span>
              </span>
            </Link>
            <h1
              className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2"
              data-oid="35rn_6h"
            >
              Hoş Geldiniz
            </h1>
            <p className="text-gray-500 dark:text-gray-400" data-oid="-frh9zd">
              Hesabınıza giriş yaparak özel tekliflerden yararlanın.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin} data-oid="x7624_b">
            <div data-oid="6dcgdxh">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                data-oid="xqiqthw"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="email@example.com"
                required
                data-oid="gfwq59g"
              />
            </div>
            <div data-oid="1a.c210">
              <div
                className="flex items-center justify-between mb-1"
                data-oid="6ckw22s"
              >
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  data-oid="xc7-d6f"
                >
                  Şifre
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-secondary hover:text-secondary-dark"
                  data-oid="125-q8c"
                >
                  Şifremi Unuttum?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="••••••••"
                required
                data-oid="5e8a:9."
              />
            </div>
            <div className="flex items-center" data-oid="4p2jnb0">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                data-oid="24329vb"
              />

              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
                data-oid=":cuzj6t"
              >
                Beni Hatırla
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-secondary-dark text-white py-3 px-4 rounded-xl transition-colors duration-200 font-medium flex justify-center items-center"
              data-oid="1psoh6i"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    data-oid=":7zp0o4"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      data-oid="zj3vgl7"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      data-oid="yurdjbx"
                    ></path>
                  </svg>
                  Giriş Yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>

          <div className="mt-6 text-center" data-oid="4u5r07r">
            <span
              className="text-gray-600 dark:text-gray-400"
              data-oid="fi4v04p"
            >
              Hesabınız yok mu?{" "}
            </span>
            <Link
              href="/register"
              className="text-secondary hover:text-secondary-dark font-medium"
              data-oid="j3trq_3"
            >
              Kayıt Ol
            </Link>
          </div>

          <div className="mt-6" data-oid="23srqlf">
            <div className="relative" data-oid="nd-xhyo">
              <div
                className="absolute inset-0 flex items-center"
                data-oid="45v9lc-"
              >
                <div
                  className="w-full border-t border-gray-300 dark:border-dark-lighter"
                  data-oid="_-kpg3n"
                ></div>
              </div>
              <div
                className="relative flex justify-center text-sm"
                data-oid="r4k5k5n"
              >
                <span
                  className="px-2 bg-white dark:bg-dark text-gray-500 dark:text-gray-400"
                  data-oid="fq3.-_2"
                >
                  veya şununla devam et
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3" data-oid="s:k..u:">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
                data-oid=".uo_6:h"
              >
                <span className="sr-only" data-oid="za.f5kk">
                  Google ile giriş yap
                </span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="ckd5hbv"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                    data-oid="xhuy2ap"
                  />

                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                    data-oid="euoc45e"
                  />

                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                    data-oid="meydthh"
                  />

                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                    data-oid="fug0a6x"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
                data-oid="qgssg7o"
              >
                <span className="sr-only" data-oid="2r4rbxm">
                  Facebook ile giriş yap
                </span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="uxxcp79"
                >
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    fill="#1877F2"
                    data-oid="5xrt25n"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
                data-oid="ihonfeg"
              >
                <span className="sr-only" data-oid="4r-xd7g">
                  Apple ile giriş yap
                </span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="am9bac5"
                >
                  <path
                    d="M16.462 16.964c-.511.971-1.04 1.935-1.89 1.956-.825.02-1.09-.499-2.04-.499-.95 0-1.244.479-2.033.499-.82.02-1.446-.931-1.96-1.9-1.066-1.607-1.884-4.535-1.047-6.505.417-.98 1.162-1.6 1.969-1.6.822 0 1.336.499 2.015.499.679 0 1.252-.499 2.116-.499.757 0 1.556.452 2.124 1.232-1.883 1.015-1.578 3.647.746 4.817zM14.1 7.196c.411-.525.745-1.25.627-1.996-.694.048-1.511.3-1.992.746-.465.429-.852 1.131-.745 1.795.767.052 1.561-.234 2.11-.545z"
                    fill="#000000"
                    data-oid="afvi88o"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image side - Hidden on mobile, half width on desktop */}
      <div
        className="hidden md:flex w-1/2 bg-gradient-to-br from-secondary/10 to-accent/10 dark:from-secondary/20 dark:to-accent/20 items-center justify-center"
        data-oid="54ga4.d"
      >
        <div className="p-6 max-w-md" data-oid=".w63u_v">
          <div
            className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-lg"
            data-oid="5ium6zu"
          >
            <div className="relative aspect-[16/9] w-full" data-oid="f4kxgae">
              <Image
                src="/images/login-image.png"
                alt="Login"
                fill
                className="object-cover"
                priority
                data-oid="owxottn"
              />
            </div>
            <div className="p-6" data-oid="8qor0j:">
              <h2
                className="text-xl font-bold text-gray-800 dark:text-white mb-2"
                data-oid="s0h6vb4"
              >
                Premium Avantajlar
              </h2>
              <p
                className="text-gray-600 dark:text-gray-300"
                data-oid="el:650q"
              >
                HD Ticaret'in sunduğu özel fırsatlardan ve indirimlerden
                yararlanabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ana Login komponenti, içeriği bir Suspense içinde render eder
export default function Login() {
  return (
    <Suspense
      fallback={
        <div
          className="h-screen flex items-center justify-center bg-gray-50 dark:bg-dark"
          data-oid=":l8go7b"
        >
          <div
            className="max-w-md w-full p-6 bg-white dark:bg-dark-light rounded-xl shadow-lg"
            data-oid="g1wu253"
          >
            <div className="flex flex-col items-center" data-oid="_8g.r0b">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"
                data-oid="r4ba-sx"
              ></div>
              <h1
                className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                data-oid="bi-z3-."
              >
                Yükleniyor...
              </h1>
              <p
                className="text-gray-600 dark:text-gray-300"
                data-oid="cf8fwlk"
              >
                Lütfen bekleyin, sayfa yükleniyor.
              </p>
            </div>
          </div>
        </div>
      }
      data-oid="jpncq:7"
    >
      <LoginContent data-oid="e:4az5y" />
    </Suspense>
  );
}
