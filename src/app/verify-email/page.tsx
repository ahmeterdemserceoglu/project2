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
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark p-4"
      data-oid="vs2q_m1"
    >
      <div
        className="max-w-md w-full p-8 bg-white dark:bg-dark-light rounded-xl shadow-lg"
        data-oid="g:g5zx8"
      >
        <div className="text-center" data-oid="jf8nm.m">
          {/* Success Icon */}
          {state.success ? (
            <div
              className="mb-6 p-3 rounded-full bg-green-100 dark:bg-green-900 inline-block"
              data-oid="g5sl3dw"
            >
              <svg
                className="h-12 w-12 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="cj6a8an"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  data-oid="e27go7b"
                />
              </svg>
            </div>
          ) : (
            /* Error Icon */
            <div
              className="mb-6 p-3 rounded-full bg-red-100 dark:bg-red-900 inline-block"
              data-oid="w24chxv"
            >
              <svg
                className="h-12 w-12 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="-m_zqa."
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                  data-oid="eij7ir-"
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
            data-oid="-izw2hx"
          >
            {state.success ? "✅ Email Doğrulandı!" : "❌ Doğrulama Başarısız"}
          </h1>

          {/* Message */}
          <p
            className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
            data-oid="ta2snp_"
          >
            {state.message}
          </p>

          {/* Success - Auto redirect message */}
          {state.success && (
            <div
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              data-oid="43-5659"
            >
              <p
                className="text-sm text-green-600 dark:text-green-400"
                data-oid="zod9559"
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
              data-oid=":.7z95j"
            >
              <p
                className="text-sm text-gray-600 dark:text-gray-300 mb-3"
                data-oid="u0vtceb"
              >
                Doğrulama emaili alamadınız mı?
              </p>
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                data-oid="rtkosbv"
              >
                {resendLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      data-oid="3g1tvjp"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        data-oid="yhi0t1r"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        data-oid="rjf5rsz"
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
                  data-oid="nrk:y-a"
                >
                  {resendMessage}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3" data-oid="mfgqfan">
            {state.success ? (
              <Link
                href="/login"
                className="w-full inline-block bg-secondary hover:bg-secondary-dark text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium text-center"
                data-oid="36_j3g4"
              >
                🚀 Giriş Yap
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full inline-block bg-secondary hover:bg-secondary-dark text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium text-center"
                data-oid="oc.anmf"
              >
                🔄 Tekrar Kayıt Ol
              </Link>
            )}

            <Link
              href="/"
              className="w-full inline-block border border-gray-300 dark:border-dark-lighter text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-medium transition-colors duration-200 font-medium text-center"
              data-oid="d4n7tal"
            >
              🏠 Ana Sayfaya Dön
            </Link>
          </div>

          {/* Site Branding */}
          <div
            className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-lighter"
            data-oid="o_t50:."
          >
            <div className="text-center" data-oid="ut3mb-:">
              <span
                className="text-lg font-bold tracking-tighter"
                data-oid="gqcmq3q"
              >
                <span className="text-primary" data-oid="92a02ak">
                  HD
                </span>
                <span
                  className="text-gray-900 dark:text-white"
                  data-oid=":k.vqv2"
                >
                  Ticaret
                </span>
                <span className="text-secondary text-sm" data-oid="c_v1mmg">
                  .com
                </span>
              </span>
              <p
                className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                data-oid="qpreozu"
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
