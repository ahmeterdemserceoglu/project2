"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function RegisterConfirmationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email address";
  const [resendStatus, setResendStatus] = useState<{
    loading: boolean;
    message: string;
    success: boolean;
  }>({
    loading: false,
    message: "",
    success: false,
  });

  const handleResendVerification = async () => {
    if (!email || email === "your email address") {
      setResendStatus({
        loading: false,
        message: "Email adresi bulunamadı.",
        success: false,
      });
      return;
    }

    setResendStatus({
      loading: true,
      message: "",
      success: false,
    });

    try {
      const response = await fetch("/api/email/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      setResendStatus({
        loading: false,
        message: data.success
          ? "Doğrulama emaili yeniden gönderildi!"
          : data.error || "Bir hata oluştu.",
        success: data.success,
      });
    } catch (error) {
      setResendStatus({
        loading: false,
        message: "Bir hata oluştu. Lütfen tekrar deneyin.",
        success: false,
      });
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center bg-gray-50 dark:bg-dark"
      data-oid="2471h01"
    >
      <div
        className="max-w-md w-full p-6 bg-white dark:bg-dark-light rounded-xl shadow-lg"
        data-oid="xc.ro6k"
      >
        <div className="flex flex-col items-center" data-oid="1ztli:o">
          <div
            className="mb-5 p-3 rounded-full bg-green-100 dark:bg-green-900"
            data-oid="lsafs9y"
          >
            <svg
              className="h-12 w-12 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              data-oid="la79lca"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
                data-oid="qsm726e"
              />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
            data-oid="oc0llo1"
          >
            Kayıt İşlemi Başarılı
          </h1>
          <p
            className="text-gray-600 dark:text-gray-300 text-center mb-6"
            data-oid="791qoyh"
          >
            Hesabınız başarıyla oluşturuldu.{" "}
            <span className="font-medium" data-oid="tqfiney">
              {email}
            </span>{" "}
            adresine gönderilen doğrulama linkine tıklayarak hesabınızı
            aktifleştirebilirsiniz.
          </p>
          <div
            className="mt-2 border border-gray-200 dark:border-dark-lighter rounded-lg p-4 bg-gray-50 dark:bg-dark-medium w-full"
            data-oid="9c7.1a5"
          >
            <h2
              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              data-oid="7ym_08n"
            >
              Sonraki Adımlar:
            </h2>
            <ol
              className="list-decimal text-sm text-gray-600 dark:text-gray-400 pl-5 space-y-1"
              data-oid="p1pms58"
            >
              <li data-oid="wn5.vss">Email kutunuzu kontrol edin</li>
              <li data-oid="8k_2b62">Onay linkine tıklayın</li>
              <li data-oid="p5o-9-s">Hesabınıza giriş yapın</li>
            </ol>
          </div>

          {/* Resend verification section */}
          <div
            className="w-full mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg"
            data-oid="1wv7a3o"
          >
            <p
              className="text-sm text-blue-600 dark:text-blue-400 mb-3"
              data-oid="m71odjl"
            >
              Email gelmediyse veya süresi geçtiyse, doğrulama emailini yeniden
              gönderebilirsiniz.
            </p>
            <button
              onClick={handleResendVerification}
              disabled={resendStatus.loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              data-oid="w_6fe3l"
            >
              {resendStatus.loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    data-oid="11alfgw"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      data-oid="j4v:f-6"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      data-oid="s6i60q4"
                    ></path>
                  </svg>
                  Gönderiliyor...
                </>
              ) : (
                "📧 Doğrulama Emailini Yeniden Gönder"
              )}
            </button>

            {resendStatus.message && (
              <p
                className={`mt-3 text-sm ${
                  resendStatus.success
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
                data-oid="_2z5u4y"
              >
                {resendStatus.message}
              </p>
            )}
          </div>

          <div className="mt-6 w-full" data-oid="366b7oe">
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              data-oid="bn_x7sf"
            >
              Giriş Sayfasına Git
            </Link>
            <Link
              href="/"
              className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-light hover:bg-gray-50 dark:hover:bg-dark-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-dark-lighter"
              data-oid="0r5__ow"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterConfirmation() {
  return (
    <Suspense
      fallback={
        <div
          className="h-screen flex items-center justify-center bg-gray-50 dark:bg-dark"
          data-oid="xs5x..4"
        >
          <div
            className="max-w-md w-full p-6 bg-white dark:bg-dark-light rounded-xl shadow-lg"
            data-oid="vslwrcb"
          >
            <div className="flex flex-col items-center" data-oid="-ygdmc5">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"
                data-oid="l9b5y0r"
              ></div>
              <h1
                className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                data-oid="3lud:ek"
              >
                Yükleniyor...
              </h1>
              <p
                className="text-gray-600 dark:text-gray-300"
                data-oid="cqssyxw"
              >
                Lütfen bekleyin, sayfa yükleniyor.
              </p>
            </div>
          </div>
        </div>
      }
      data-oid="_m:m::3"
    >
      <RegisterConfirmationContent data-oid="265_ow6" />
    </Suspense>
  );
}
