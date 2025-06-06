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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const supabase = createClientComponentClient();
  const { showToast } = useToast();
  const { showNotification } = useNotification();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsLoggedIn(true);
      }
    };
    
    checkSession();
  }, [supabase.auth]);

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

      // Manually ensure the session cookie is set properly
      const session = data.session;
      if (session) {
        // Store session in localStorage if rememberMe is checked
        if (rememberMe) {
          // Set expiration to 7 days
          const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7);
          
          localStorage.setItem('supabase.auth.token', JSON.stringify({
            currentSession: session,
            expiresAt: expiresAt,
          }));
        }
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
      
      // Set a local flag to indicate successful authentication
      sessionStorage.setItem('authSuccess', 'true');
      
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
      data-oid="9vg3s43"
    >
      {/* Show already logged in message if user is logged in */}
      {isLoggedIn ? (
        <div className="w-full flex items-center justify-center p-4 md:p-8 lg:p-12">
          <div className="w-full max-w-md py-10 px-6 bg-white dark:bg-dark-light rounded-2xl shadow-lg text-center">
            <div className="mb-6 text-center">
              <div className="mx-auto bg-green-100 dark:bg-green-900/30 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Zaten Giriş Yapmışsınız</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Hesabınıza zaten giriş yapmış durumdasınız. Ana sayfaya dönebilir veya hesap sayfanıza gidebilirsiniz.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-secondary hover:bg-secondary-dark text-white font-medium rounded-lg transition-colors"
                >
                  Ana Sayfaya Git
                </button>
                <button
                  onClick={() => router.push('/account')}
                  className="px-6 py-3 border border-secondary text-secondary hover:bg-secondary hover:text-white font-medium rounded-lg transition-colors"
                >
                  Hesabım
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* Form side - Taking full height on mobile, half width on desktop */}
      <div
        className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-y-auto"
        data-oid="amjh_i_"
      >
        <div className="w-full max-w-md py-2" data-oid="xpdf6v_">
          <div className="text-center md:text-left mb-6" data-oid="b.6yunt">
            <Link href="/" className="inline-block mb-6" data-oid="9rxivex">
              <span
                className="text-2xl font-bold tracking-tighter relative"
                data-oid="12-vl76"
              >
                <span className="text-primary" data-oid="0lkws_e">
                  HD
                </span>
                <span
                  className="text-gray-800 dark:text-white"
                  data-oid="ur-ivz_"
                >
                  Ticaret
                </span>
                <span
                  className="text-xs text-secondary ml-1 absolute -right-4 top-0"
                  data-oid="lr039cp"
                >
                  .com
                </span>
              </span>
            </Link>
            <h1
              className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2"
              data-oid="7f3h08q"
            >
              Hoş Geldiniz
            </h1>
            <p className="text-gray-500 dark:text-gray-400" data-oid="u37l2.p">
              Hesabınıza giriş yaparak özel tekliflerden yararlanın.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin} data-oid="y9ultq-">
            <div data-oid="0m-qv3b">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                data-oid="p2408w:"
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
                data-oid=":s8kzt6"
              />
            </div>
            <div data-oid="qaydd2a">
              <div
                className="flex items-center justify-between mb-1"
                data-oid="9-801o2"
              >
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  data-oid="b7.4f_r"
                >
                  Şifre
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-secondary hover:text-secondary-dark"
                  data-oid="ci:-sil"
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
                data-oid="r13tizk"
              />
            </div>
            <div className="flex items-center" data-oid="5xi3tn.">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                data-oid="4-upbmx"
              />

              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
                data-oid="3qrekds"
              >
                Beni Hatırla
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-secondary-dark text-white py-3 px-4 rounded-xl transition-colors duration-200 font-medium flex justify-center items-center"
              data-oid="hrqav:."
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    data-oid="rqo.c88"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      data-oid="slpadxa"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      data-oid="7yvgh-7"
                    ></path>
                  </svg>
                  Giriş Yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>

          <div className="mt-6 text-center" data-oid="d:tj_ce">
            <span
              className="text-gray-600 dark:text-gray-400"
              data-oid="11pf:4v"
            >
              Hesabınız yok mu?{" "}
            </span>
            <Link
              href="/register"
              className="text-secondary hover:text-secondary-dark font-medium"
              data-oid="g-5-t45"
            >
              Kayıt Ol
            </Link>
          </div>

          <div className="mt-6" data-oid="3-qs24o">
            <div className="relative" data-oid="c7u47wv">
              <div
                className="absolute inset-0 flex items-center"
                data-oid=":t:5r_b"
              >
                <div
                  className="w-full border-t border-gray-300 dark:border-dark-lighter"
                  data-oid="1dvj9hk"
                ></div>
              </div>
              <div
                className="relative flex justify-center text-sm"
                data-oid="eav6p0."
              >
                <span
                  className="px-2 bg-white dark:bg-dark text-gray-500 dark:text-gray-400"
                  data-oid="21oz7pa"
                >
                  veya şununla devam et
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3" data-oid="4-4txng">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
                data-oid="3hs.:g_"
              >
                <span className="sr-only" data-oid=":7fg2nd">
                  Google ile giriş yap
                </span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="y90.1in"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                    data-oid="4ph88x7"
                  />

                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                    data-oid="5tdro7."
                  />

                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                    data-oid="kik_4xj"
                  />

                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                    data-oid="lazq.bm"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
                data-oid="drm:4rz"
              >
                <span className="sr-only" data-oid="mzriuip">
                  Facebook ile giriş yap
                </span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="yi__o-v"
                >
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    fill="#1877F2"
                    data-oid=".8s-r8_"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
                data-oid="jcjvrd0"
              >
                <span className="sr-only" data-oid="vbdsc-u">
                  Apple ile giriş yap
                </span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="0pbz7_3"
                >
                  <path
                    d="M16.462 16.964c-.511.971-1.04 1.935-1.89 1.956-.825.02-1.09-.499-2.04-.499-.95 0-1.244.479-2.033.499-.82.02-1.446-.931-1.96-1.9-1.066-1.607-1.884-4.535-1.047-6.505.417-.98 1.162-1.6 1.969-1.6.822 0 1.336.499 2.015.499.679 0 1.252-.499 2.116-.499.757 0 1.556.452 2.124 1.232-1.883 1.015-1.578 3.647.746 4.817zM14.1 7.196c.411-.525.745-1.25.627-1.996-.694.048-1.511.3-1.992.746-.465.429-.852 1.131-.745 1.795.767.052 1.561-.234 2.11-.545z"
                    fill="#000000"
                    data-oid="r_cfp41"
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
        data-oid="xtx8k7-"
      >
        <div className="p-6 max-w-md" data-oid="a4kadsh">
          <div
            className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-lg"
            data-oid="2wyr9_l"
          >
            <div className="relative aspect-[16/9] w-full" data-oid="6ws:se0">
              <Image
                src="/images/login-image.png"
                alt="Login"
                fill
                className="object-cover"
                priority
                data-oid="vzw4q:7"
              />
            </div>
            <div className="p-6" data-oid="jb6:con">
              <h2
                className="text-xl font-bold text-gray-800 dark:text-white mb-2"
                data-oid="zkknpbj"
              >
                Premium Avantajlar
              </h2>
              <p
                className="text-gray-600 dark:text-gray-300"
                data-oid="twjf9rs"
              >
                HD Ticaret'in sunduğu özel fırsatlardan ve indirimlerden
                yararlanabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
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
          data-oid="-io1j3s"
        >
          <div
            className="max-w-md w-full p-6 bg-white dark:bg-dark-light rounded-xl shadow-lg"
            data-oid="oqfuk1n"
          >
            <div className="flex flex-col items-center" data-oid="k.xoqvi">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"
                data-oid="vx5f10u"
              ></div>
              <h1
                className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                data-oid="_5smo73"
              >
                Yükleniyor...
              </h1>
              <p
                className="text-gray-600 dark:text-gray-300"
                data-oid="lacr9fl"
              >
                Lütfen bekleyin, sayfa yükleniyor.
              </p>
            </div>
          </div>
        </div>
      }
      data-oid="bthpc.-"
    >
      <LoginContent data-oid="62t53a0" />
    </Suspense>
  );
}
