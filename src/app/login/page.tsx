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
      data-oid="pmyci7c"
    >
      {/* Form side - Taking full height on mobile, half width on desktop */}
      <div
        className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-y-auto"
        data-oid="kfz8yxh"
      >
        <div className="w-full max-w-md py-2" data-oid="ga5h5sc">
          <div className="text-center md:text-left mb-6" data-oid="9_q05x9">
            <Link href="/" className="inline-block mb-6" data-oid=".9g1_ey">
              <span
                className="text-2xl font-bold tracking-tighter relative"
                data-oid="lseahyh"
              >
                <span className="text-primary" data-oid="zd39qe7">
                  HD
                </span>
                <span
                  className="text-gray-800 dark:text-white"
                  data-oid="08ak7w1"
                >
                  Ticaret
                </span>
                <span
                  className="text-xs text-secondary ml-1 absolute -right-4 top-0"
                  data-oid="7oho69e"
                >
                  .com
                </span>
              </span>
            </Link>
            <h1
              className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2"
              data-oid="s3:r7bz"
            >
              Hoş Geldiniz
            </h1>
            <p className="text-gray-500 dark:text-gray-400" data-oid="i3e33o8">
              Hesabınıza giriş yaparak özel tekliflerden yararlanın.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin} data-oid="nen2om:">
            <div data-oid="s9lgc47">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                data-oid="wfh1tu0"
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
                data-oid="vd.igzk"
              />
            </div>
            <div data-oid="6n3hh_l">
              <div
                className="flex items-center justify-between mb-1"
                data-oid="yuk4092"
              >
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  data-oid="dzxr6nl"
                >
                  Şifre
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-secondary hover:text-secondary-dark"
                  data-oid="f8kiqpr"
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
                data-oid="g0vq1:d"
              />
            </div>
            <div className="flex items-center" data-oid="ybxk7.t">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                data-oid="ww3i:hn"
              />

              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
                data-oid="h_rrkry"
              >
                Beni Hatırla
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-secondary-dark text-white py-3 px-4 rounded-xl transition-colors duration-200 font-medium flex justify-center items-center"
              data-oid="0nx-10n"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    data-oid="g:_io54"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      data-oid="d6xw2hi"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      data-oid="x-pefly"
                    ></path>
                  </svg>
                  Giriş Yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>

          <div className="mt-6 text-center" data-oid="hbu.6ry">
            <span
              className="text-gray-600 dark:text-gray-400"
              data-oid="g:0lpmh"
            >
              Hesabınız yok mu?{" "}
            </span>
            <Link
              href="/register"
              className="text-secondary hover:text-secondary-dark font-medium"
              data-oid="fr6.kzv"
            >
              Kayıt Ol
            </Link>
          </div>

          <div className="mt-6" data-oid="pto1eik">
            <div className="relative" data-oid="._xyx.l">
              <div
                className="absolute inset-0 flex items-center"
                data-oid="urcjruw"
              >
                <div
                  className="w-full border-t border-gray-300 dark:border-dark-lighter"
                  data-oid="vpgllvm"
                ></div>
              </div>
              <div
                className="relative flex justify-center text-sm"
                data-oid="lt505ay"
              >
                <span
                  className="px-2 bg-white dark:bg-dark text-gray-500 dark:text-gray-400"
                  data-oid="3l6ux0i"
                >
                  veya şununla devam et
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3" data-oid="l.kbi7o">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
                data-oid="t:r0epz"
              >
                <span className="sr-only" data-oid="35v29ps">
                  Google ile giriş yap
                </span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="-g0p8rm"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                    data-oid="r5.72.k"
                  />

                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                    data-oid="0uslmy:"
                  />

                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                    data-oid="ygpu8q1"
                  />

                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                    data-oid="dmbbz.z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
                data-oid="wqr7hgg"
              >
                <span className="sr-only" data-oid="w6rdifl">
                  Facebook ile giriş yap
                </span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="_le1w6h"
                >
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    fill="#1877F2"
                    data-oid="x5390s7"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
                data-oid="eh6mg5."
              >
                <span className="sr-only" data-oid="tuy8g7d">
                  Apple ile giriş yap
                </span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="80589xt"
                >
                  <path
                    d="M16.462 16.964c-.511.971-1.04 1.935-1.89 1.956-.825.02-1.09-.499-2.04-.499-.95 0-1.244.479-2.033.499-.82.02-1.446-.931-1.96-1.9-1.066-1.607-1.884-4.535-1.047-6.505.417-.98 1.162-1.6 1.969-1.6.822 0 1.336.499 2.015.499.679 0 1.252-.499 2.116-.499.757 0 1.556.452 2.124 1.232-1.883 1.015-1.578 3.647.746 4.817zM14.1 7.196c.411-.525.745-1.25.627-1.996-.694.048-1.511.3-1.992.746-.465.429-.852 1.131-.745 1.795.767.052 1.561-.234 2.11-.545z"
                    fill="#000000"
                    data-oid="lcx4vxm"
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
        data-oid="31p.lyy"
      >
        <div className="p-6 max-w-md" data-oid="d2_ou5s">
          <div
            className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-lg"
            data-oid="6nrd.4x"
          >
            <div className="relative aspect-[16/9] w-full" data-oid="y0m:9qj">
              <Image
                src="/images/login-image.png"
                alt="Login"
                fill
                className="object-cover"
                priority
                data-oid="0bitumn"
              />
            </div>
            <div className="p-6" data-oid="o5-wicn">
              <h2
                className="text-xl font-bold text-gray-800 dark:text-white mb-2"
                data-oid="ydbwtah"
              >
                Premium Avantajlar
              </h2>
              <p
                className="text-gray-600 dark:text-gray-300"
                data-oid="jcs6.u1"
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
          data-oid="1q.htnm"
        >
          <div
            className="max-w-md w-full p-6 bg-white dark:bg-dark-light rounded-xl shadow-lg"
            data-oid="4au76rg"
          >
            <div className="flex flex-col items-center" data-oid="e81mhqf">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"
                data-oid="rvywn4d"
              ></div>
              <h1
                className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                data-oid="y_b7tub"
              >
                Yükleniyor...
              </h1>
              <p
                className="text-gray-600 dark:text-gray-300"
                data-oid="o4bz:1a"
              >
                Lütfen bekleyin, sayfa yükleniyor.
              </p>
            </div>
          </div>
        </div>
      }
      data-oid="qx-wh.i"
    >
      <LoginContent data-oid="_9qvg9-" />
    </Suspense>
  );
}
