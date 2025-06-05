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
      console.error("Verification error:", error);
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
      console.error("Resend error:", error);
      setResendMessage("❌ Email gönderilirken bir hata oluştu.");
    } finally {
      setResendLoading(false);
    }
  };

  if (state.loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark"
        data-oid="g388vkk"
      >
        <div
          className="max-w-md w-full p-8 bg-white dark:bg-dark-light rounded-xl shadow-lg text-center"
          data-oid="n5lua7k"
        >
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"
            data-oid="t:gflj3"
          ></div>
          <h1
            className="text-xl font-bold text-gray-900 dark:text-white mb-2"
            data-oid="_rf9q26"
          >
            Email Doğrulanıyor...
          </h1>
          <p className="text-gray-600 dark:text-gray-300" data-oid="tbxlz2o">
            Lütfen bekleyin, email adresiniz doğrulanıyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark p-4"
      data-oid="njkbkl4"
    >
      <div
        className="max-w-md w-full p-8 bg-white dark:bg-dark-light rounded-xl shadow-lg"
        data-oid="v6e4se7"
      >
        <div className="text-center" data-oid="q-eb:n5">
          {/* Success Icon */}
          {state.success ? (
            <div
              className="mb-6 p-3 rounded-full bg-green-100 dark:bg-green-900 inline-block"
              data-oid="39lsu5q"
            >
              <svg
                className="h-12 w-12 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="y9ffnsh"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  data-oid="kmb4qp0"
                />
              </svg>
            </div>
          ) : (
            /* Error Icon */
            <div
              className="mb-6 p-3 rounded-full bg-red-100 dark:bg-red-900 inline-block"
              data-oid="vlrc0l4"
            >
              <svg
                className="h-12 w-12 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="oao2y39"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                  data-oid="1jr1uvs"
                />
              </svg>
            </div>
          )}

          {/* Title */}
          <h1
            className={`text-2xl font-bold mb-4 ${
              state.success
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
            data-oid="iks-6z8"
          >
            {state.success ? "✅ Email Doğrulandı!" : "❌ Doğrulama Başarısız"}
          </h1>

          {/* Message */}
          <p
            className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
            data-oid="6rxdetn"
          >
            {state.message}
          </p>

          {/* Success - Auto redirect message */}
          {state.success && (
            <div
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              data-oid="afip4h3"
            >
              <p
                className="text-sm text-green-600 dark:text-green-400"
                data-oid="8xsm.mu"
              >
                🎉 Hesabınız aktifleştirildi! 3 saniye içinde giriş sayfasına
                yönlendirileceksiniz...
              </p>
            </div>
          )}

          {/* Resend Email Section */}
          {state.canResend && (
            <div
              className="mb-6 p-4 bg-gray-50 dark:bg-dark-medium rounded-lg"
              data-oid="-w2ecqz"
            >
              <p
                className="text-sm text-gray-600 dark:text-gray-300 mb-3"
                data-oid="6ta.nrc"
              >
                Doğrulama emaili alamadınız mı?
              </p>
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                data-oid="ao02wmu"
              >
                {resendLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      data-oid="xq4eogw"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        data-oid="yvfn.re"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        data-oid="xw1hdv0"
                      ></path>
                    </svg>
                    Gönderiliyor...
                  </>
                ) : (
                  "📧 Yeniden Gönder"
                )}
              </button>

              {resendMessage && (
                <p
                  className={`mt-3 text-sm ${
                    resendMessage.includes("✅")
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                  data-oid="m8.x9oi"
                >
                  {resendMessage}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3" data-oid="3h-wy:u">
            {state.success ? (
              <Link
                href="/login"
                className="w-full inline-block bg-secondary hover:bg-secondary-dark text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium text-center"
                data-oid="-l.z41l"
              >
                🚀 Giriş Yap
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full inline-block bg-secondary hover:bg-secondary-dark text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium text-center"
                data-oid="pge00-7"
              >
                🔄 Tekrar Kayıt Ol
              </Link>
            )}

            <Link
              href="/"
              className="w-full inline-block border border-gray-300 dark:border-dark-lighter text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-medium transition-colors duration-200 font-medium text-center"
              data-oid="p0._0vh"
            >
              🏠 Ana Sayfaya Dön
            </Link>
          </div>

          {/* Site Branding */}
          <div
            className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-lighter"
            data-oid="7w9nj9_"
          >
            <div className="text-center" data-oid="7-456p0">
              <span
                className="text-lg font-bold tracking-tighter"
                data-oid="b1y9tnz"
              >
                <span className="text-primary" data-oid="ug20p:x">
                  HD
                </span>
                <span
                  className="text-gray-900 dark:text-white"
                  data-oid="03zofa0"
                >
                  Ticaret
                </span>
                <span className="text-secondary text-sm" data-oid="eev81do">
                  .com
                </span>
              </span>
              <p
                className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                data-oid="s1ahgg0"
              >
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
          data-oid="7c7u3k8"
        >
          <div
            className="max-w-md w-full p-8 bg-white dark:bg-dark-light rounded-xl shadow-lg text-center"
            data-oid="afz:blh"
          >
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"
              data-oid="jy_qtmc"
            ></div>
            <h1
              className="text-xl font-bold text-gray-900 dark:text-white mb-2"
              data-oid="j.ha0eg"
            >
              Yükleniyor...
            </h1>
            <p className="text-gray-600 dark:text-gray-300" data-oid="nq-pa72">
              Lütfen bekleyin, sayfa yükleniyor.
            </p>
          </div>
        </div>
      }
      data-oid="gl875uu"
    >
      <VerifyEmailContent data-oid="v-1zfy2" />
    </Suspense>
  );
}
