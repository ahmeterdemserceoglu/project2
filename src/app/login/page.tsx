"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/auth"; // Supabase client'ı auth.ts'den import ediyoruz

import { FaEye, FaEyeSlash, FaGoogle, FaFacebook } from "react-icons/fa";

// Login içeriği için ayrı bir komponent oluşturuyoruz
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirected, setRedirected] = useState(false);

  // AuthContext'ten signIn ve diğer fonksiyonları kullan
  const { signIn, isAuthenticated, loading, user, isAdmin, refreshAuth, checkIfAdmin } = useAuth();
  const { showNotification } = useNotification();

  // Doğrulama mesajı
  useEffect(() => {
    if (verified === "true") {
      showNotification(
        "Email adresiniz başarıyla doğrulanmıştır! Şimdi giriş yapabilirsiniz.",
        "success"
      );
    }

    // Çıkış yapıldıysa bildirim göster
    const logoutParam = searchParams.get("logout");
    if (logoutParam === "true") {
      showNotification(
        "Başarıyla çıkış yaptınız.",
        "success"
      );
    } else if (logoutParam === "force") {
      showNotification(
        "Oturumunuz sonlandırıldı.",
        "info"
      );
    }
  }, [verified, showNotification, searchParams]);

  // Check for redirect parameter
  const redirect = searchParams.get("redirect") || "/";

  // Zaten giriş yapmışsa yönlendir - with redirected flag to prevent infinite loops
  useEffect(() => {
    // Only proceed if not already redirected and not loading
    if (!loading && isAuthenticated && !redirected) {
      setRedirected(true);

      // Check for stored redirect path from before login
      const storedRedirect = localStorage.getItem('login_redirect');

      // Use a timeout to ensure state updates have propagated
      setTimeout(() => {
        if (storedRedirect) {
          // Clear the stored redirect
          localStorage.removeItem('login_redirect');
          // Only redirect to admin if user is actually admin
          if (storedRedirect === '/admin' && isAdmin !== true) {
            router.push("/");
          } else {
            router.push(storedRedirect);
          }
        } else {
          if (isAdmin === true) {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }
      }, 100);
    }
  }, [isAuthenticated, loading, isAdmin, redirected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Lütfen tüm alanları doldurun.");
      setIsLoading(false);
      return;
    }

    try {
      // First try the API endpoint for login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error('Sunucudan beklenmeyen yanıt alındı');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Giriş yapılırken bir hata oluştu');
      }

      // Then use the AuthContext signIn method to update state
      await signIn(email, password);

      // Set success flags
      setSuccess(true);
      showNotification('Başarıyla giriş yaptınız!', 'success');

      // Set flags to ensure navbar updates
      localStorage.setItem('auth_login_success', 'true');

      // Check if there's a redirect parameter and if user has permission
      const redirectParam = searchParams.get('redirect');
      
      // Use Next.js router for better state management
      setTimeout(async () => {
        // Refresh auth state to get latest admin status
        await refreshAuth();
        
        if (redirectParam === '/admin') {
          // Check if user is admin before redirecting to admin
          const adminStatus = await checkIfAdmin();
          if (adminStatus) {
            router.push('/admin');
          } else {
            router.push('/');
          }
        } else if (redirectParam) {
          router.push(redirectParam);
        } else {
          router.push('/');
        }
      }, 500); // Reduced timeout for better UX

    } catch (err: any) {
      setErrorMessage(err.message || 'Giriş yapılırken bir hata oluştu');
      showNotification(err.message || 'Giriş yapılırken bir hata oluştu', 'error');
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
      // Başarılı OAuth girişi durumunda yönlendirme otomatik olarak yapılacak
    } catch (error) {
      setErrorMessage("Sosyal giriş sırasında bir hata oluştu.");
      showNotification("Sosyal giriş sırasında bir hata oluştu.", "error");
      setIsLoading(false);
    }
  };

  // Eğer yükleniyor durumundaysa loading göster
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If already authenticated and not redirected yet, show loading
  if (isAuthenticated && !redirected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">Yönlendiriliyorsunuz...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hoş Geldiniz</h2>
          <p className="text-gray-600">Hesabınıza giriş yapın</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Başarıyla giriş yaptınız!
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Yönlendiriliyorsunuz...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errorMessage}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                  placeholder="Şifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
       
        
             

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary hover:text-accent transition-colors"
                >
                  Şifrenizi mi unuttunuz?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">veya</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => handleSocialLogin("google")}
            className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
          >
            <FaGoogle className="text-red-500 mr-2" />
            <span>Google</span>
          </button>
          <button
            onClick={() => handleSocialLogin("facebook")}
            className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
          >
            <FaFacebook className="text-blue-600 mr-2" />
            <span>Facebook</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Hesabınız yok mu?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>}>
      <LoginContent />
    </Suspense>
  );
}