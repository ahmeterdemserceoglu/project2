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
      console.error("Manuel doğrulama hatası:", error);
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
      console.error("E-posta ile doğrulama hatası:", error);
      alert(`Doğrulama sırasında bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8"
      data-oid="j0n1eb5"
    >
      <div
        className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-2xl"
        data-oid="ifn6hk."
      >
        <div data-oid="xaii.u:">
          <h2
            className="mt-6 text-center text-3xl font-extrabold text-white"
            data-oid="lon4jxm"
          >
            Kimlik Doğrulama Hatası
          </h2>

          {/* SearchParams'ı Suspense içinde kullan */}
          <Suspense
            fallback={
              <div
                className="mt-4 text-center text-gray-300"
                data-oid="6:32:dd"
              >
                Yükleniyor...
              </div>
            }
            data-oid="1g6cu_7"
          >
            <ErrorInfoHandler setErrorInfo={setErrorInfo} data-oid="02lruva" />
          </Suspense>

          <div className="mt-4 text-center" data-oid="lbd8yt5">
            <div className="text-red-500 font-semibold" data-oid="e.dc6uz">
              {errorInfo.error}
            </div>
            <p className="mt-2 text-gray-300" data-oid="o_5mbw7">
              {errorInfo.description}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6" data-oid="fo6qq4s">
          <div className="rounded-md shadow-sm space-y-4" data-oid="l5bbkbb">
            <p className="text-gray-300 text-center" data-oid="k.92b_o">
              E-posta doğrulama ile ilgili bir sorun mu yaşıyorsunuz?
            </p>

            {showEmailForm ? (
              <form
                onSubmit={verifyByEmail}
                className="space-y-4"
                data-oid="s6lczz8"
              >
                <div data-oid="mxyc62a">
                  <label htmlFor="email" className="sr-only" data-oid="u_ktdu.">
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
                    data-oid=".d8p2ws"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  data-oid="x9v7ujg"
                >
                  {loading ? "İşleniyor..." : "E-posta ile Doğrula"}
                </button>
              </form>
            ) : (
              <div className="flex flex-col space-y-4" data-oid="0_s7i1w">
                <button
                  onClick={manuallyVerifyProfile}
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  data-oid="tox4d30"
                >
                  {loading ? "İşleniyor..." : "Manuel Doğrulama Dene"}
                </button>

                <button
                  onClick={() => router.push("/login")}
                  className="group relative w-full flex justify-center py-2 px-4 border border-gray-600 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  data-oid="bcwib4t"
                >
                  Giriş Sayfasına Dön
                </button>
              </div>
            )}
          </div>

          <div className="text-center text-sm" data-oid="el58yox">
            <Link
              href="/"
              className="text-indigo-400 hover:text-indigo-300"
              data-oid="bc93sfh"
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
