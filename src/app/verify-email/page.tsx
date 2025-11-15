// app/verify-email/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface VerificationState {
  loading: boolean;
  success: boolean;
  message: string;
  canResend: boolean;
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<VerificationState>({
    loading: true,
    success: false,
    message: "",
    canResend: false,
  });
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState({
        loading: false,
        success: false,
        message:
          "Doğrulama kodu bulunamadı. Lütfen email'inizdeki linki kontrol edin.",
        canResend: true,
      });
      return;
    }

    verifyToken(token);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`/api/verify-email?token=${token}`);
      const result = await response.json();

      setState({
        loading: false,
        success: result.success,
        message: result.message,
        canResend: !result.success,
      });

      // If successful, redirect to login page after 3 seconds
      if (result.success) {
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 3000);
      }
    } catch (error) {
      setState({
        loading: false,
        success: false,
        message: "Doğrulama işlemi sırasında bir hata oluştu.",
        canResend: true,
      });
    }
  };

  const handleResendEmail = async () => {
    const email = prompt("Email adresinizi girin:");

    if (!email) return;

    setResendLoading(true);
    setResendMessage("");

    try {
      const response = await fetch("/api/email/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setResendMessage("✅ Yeni doğrulama emaili gönderildi!");
      } else {
        setResendMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setResendMessage("❌ Email gönderilirken bir hata oluştu.");
    } finally {
      setResendLoading(false);
    }
  };

  if (state.loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark"
        data-oid="8827:7k"
      >
        <div
          className="max-w-md w-full p-8 bg-white dark:bg-dark-light rounded-xl shadow-lg text-center"
          data-oid="4zjusd5"
        >
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"
            data-oid="9-edvhz"
          ></div>
          <h1
            className="text-xl font-bold text-gray-900 dark:text-white mb-2"
            data-oid="m4lwwdr"
          >
            Email Doğrulanıyor...
          </h1>
          <p className="text-gray-600 dark:text-gray-300" data-oid="f-_g2ch">
            Lütfen bekleyin, email adresiniz doğrulanıyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-dark dark:via-dark-light dark:to-dark-medium flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-lighter overflow-hidden">
          {/* Header with gradient */}
          <div className={`px-8 py-6 ${state.success ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
            <div className="text-center">
              {/* Icon */}
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
                {state.success ? (
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              
              {/* Title */}
              <h1 className="text-2xl font-bold text-white mb-2">
                {state.success ? "Email Doğrulandı!" : "Doğrulama Başarısız"}
              </h1>
              
              <p className="text-white/90 text-sm">
                {state.success ? "Hesabınız başarıyla aktifleştirildi" : "Doğrulama işlemi tamamlanamadı"}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {/* Message */}
            <div className={`p-4 rounded-xl mb-6 ${state.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <p className={`text-sm leading-relaxed ${state.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                {state.message}
              </p>
            </div>

            {/* Success - Auto redirect message */}
            {state.success && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      🎉 3 saniye içinde giriş sayfasına yönlendirileceksiniz...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Resend Email Section */}
            {state.canResend && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-medium rounded-xl border border-gray-200 dark:border-dark-lighter">
                <div className="text-center">
                  <div className="mb-3">
                    <svg className="h-8 w-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Doğrulama emaili alamadınız mı?
                  </p>
                  <button
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="w-full bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {resendLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <svg className="inline mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Yeniden Gönder
                      </>
                    )}
                  </button>

                  {resendMessage && (
                    <div className={`mt-3 p-3 rounded-lg ${resendMessage.includes("✅") ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      <p className={`text-sm ${resendMessage.includes("✅") ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                        {resendMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {state.success ? (
                <Link
                  href="/login"
                  className="w-full inline-block bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="inline mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Giriş Yap
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="w-full inline-block bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="inline mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tekrar Kayıt Ol
                </Link>
              )}

              <Link
                href="/"
                className="w-full inline-block border-2 border-gray-200 dark:border-dark-lighter text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-medium transition-all duration-200 font-medium text-center hover:border-gray-300 dark:hover:border-gray-600"
              >
                <svg className="inline mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 dark:bg-dark-medium border-t border-gray-100 dark:border-dark-lighter">
            <div className="text-center">
              <span className="text-lg font-bold tracking-tighter">
                <span className="text-primary">HD</span>
                <span className="text-gray-900 dark:text-white">Ticaret</span>
                <span className="text-secondary text-sm">.com</span>
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Güvenilir E-Ticaret Platformu
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark"
          data-oid=":g242c_"
        >
          <div
            className="max-w-md w-full p-8 bg-white dark:bg-dark-light rounded-xl shadow-lg text-center"
            data-oid="rf6vq4_"
          >
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"
              data-oid="utfymf1"
            ></div>
            <h1
              className="text-xl font-bold text-gray-900 dark:text-white mb-2"
              data-oid="y2hbvg."
            >
              Yükleniyor...
            </h1>
            <p className="text-gray-600 dark:text-gray-300" data-oid="pzgzr_m">
              Lütfen bekleyin, sayfa yükleniyor.
            </p>
          </div>
        </div>
      }
      data-oid="n8_2gcv"
    >
      <VerifyEmailContent data-oid="u7gvr3v" />
    </Suspense>
  );
}
