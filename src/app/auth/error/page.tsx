"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@/lib/supabase";

// Ana sayfa bileşeni
export default function AuthErrorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [errorInfo, setErrorInfo] = useState({
    error: "unknown",
    description: "Kimlik doğrulama sırasında bir hata oluştu.",
  });

  const supabase = createClientComponentClient();

  // Manuel olarak profili e-posta doğrulandı olarak işaretleme
  const manuallyVerifyProfile = async () => {
    setLoading(true);

    try {
      // Kullanıcının oturum açık olup olmadığını kontrol et
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Kullanıcı oturum açmışsa profili güncelle
        const { error } = await supabase
          .from("profiles")
          .update({
            is_email_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) {
          throw error;
        }

        alert("Profiliniz başarıyla doğrulandı!");
        router.push("/account");
        return;
      }

      // Kullanıcı oturum açmamışsa e-posta ile kontrol etmek için formu göster
      setShowEmailForm(true);
    } catch (error: any) {
      alert(`Doğrulama sırasında bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // E-posta ile kullanıcıyı bul ve profili güncelle
  const verifyByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // E-posta ile profili bul
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (profileError) {
        throw profileError;
      }

      if (!profiles || profiles.length === 0) {
        alert("Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.");
        return;
      }

      // Profili güncelle
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_email_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profiles[0].id);

      if (updateError) {
        throw updateError;
      }

      alert("Profiliniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.");
      router.push("/login");
    } catch (error: any) {
      alert(`Doğrulama sırasında bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8"
      data-oid="8xq8x4-"
    >
      <div
        className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-2xl"
        data-oid="htwp7-3"
      >
        <div data-oid="8v:ho5.">
          <h2
            className="mt-6 text-center text-3xl font-extrabold text-white"
            data-oid="hsw_10w"
          >
            Kimlik Doğrulama Hatası
          </h2>

          {/* SearchParams'ı Suspense içinde kullan */}
          <Suspense
            fallback={
              <div
                className="mt-4 text-center text-gray-300"
                data-oid="w1._3hq"
              >
                Yükleniyor...
              </div>
            }
            data-oid=":alzy4u"
          >
            <ErrorInfoHandler setErrorInfo={setErrorInfo} data-oid="punwiw8" />
          </Suspense>

          <div className="mt-4 text-center" data-oid="szyvux3">
            <div className="text-red-500 font-semibold" data-oid="tm_-kh5">
              {errorInfo.error}
            </div>
            <p className="mt-2 text-gray-300" data-oid="4g6cxya">
              {errorInfo.description}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6" data-oid="fqopsdl">
          <div className="rounded-md shadow-sm space-y-4" data-oid="xyy3nmz">
            <p className="text-gray-300 text-center" data-oid="c3dt_dr">
              E-posta doğrulama ile ilgili bir sorun mu yaşıyorsunuz?
            </p>

            {showEmailForm ? (
              <form
                onSubmit={verifyByEmail}
                className="space-y-4"
                data-oid="l6oo3gt"
              >
                <div data-oid="-hc62ar">
                  <label htmlFor="email" className="sr-only" data-oid="gqdfz_-">
                    E-posta Adresi
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="E-posta adresiniz"
                    data-oid="0uzjy0."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  data-oid="2qt4wrb"
                >
                  {loading ? "İşleniyor..." : "E-posta ile Doğrula"}
                </button>
              </form>
            ) : (
              <div className="flex flex-col space-y-4" data-oid="5vlfumr">
                <button
                  onClick={manuallyVerifyProfile}
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  data-oid="zaycdpg"
                >
                  {loading ? "İşleniyor..." : "Manuel Doğrulama Dene"}
                </button>

                <button
                  onClick={() => router.push("/login")}
                  className="group relative w-full flex justify-center py-2 px-4 border border-gray-600 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  data-oid="6s.g971"
                >
                  Giriş Sayfasına Dön
                </button>
              </div>
            )}
          </div>

          <div className="text-center text-sm" data-oid="cmdwgxl">
            <Link
              href="/"
              className="text-indigo-400 hover:text-indigo-300"
              data-oid="eo3b:0h"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// URL parametrelerini işleyen ayrı bir bileşen
function ErrorInfoHandler({
  setErrorInfo,
}: {
  setErrorInfo: React.Dispatch<
    React.SetStateAction<{ error: string; description: string }>
  >;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error") || "unknown";
    const description =
      searchParams.get("description") ||
      "Kimlik doğrulama sırasında bir hata oluştu.";

    setErrorInfo({ error, description });
  }, [searchParams, setErrorInfo]);

  return null;
}
