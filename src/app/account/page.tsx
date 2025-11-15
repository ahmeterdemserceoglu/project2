"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from '@supabase/supabase-js';
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { clearCorruptedCookies } from "@/lib/clear-cookies";
import { supabase } from "@/lib/auth";

type ProfileData = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_email_verified: boolean;
  created_at: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [cookieError, setCookieError] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Use global supabase client
  const { showToast } = useToast();
  const { showNotification } = useNotification();
  const { user, isAuthenticated, session, loading } = useAuth();

  // Kullanıcı bilgilerini yükle
  const loadUserProfile = async () => {
    if (!user?.id || !isAuthenticated || !session) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Doğrudan supabase sorgusu kullan (API yerine)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data as ProfileData);
      setFormData({
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        phone: data.phone || "",
      });
    } catch (error: any) {
      showNotification("Profil bilgileri yüklenirken bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Auth değişikliklerinde profil bilgilerini yükle
  useEffect(() => {
    // Clear corrupted cookies on page load
    try {
      clearCorruptedCookies();
    } catch (error) {
      setCookieError(true);
    }

    if (!loading && user && isAuthenticated) {
      loadUserProfile();
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, loading]);

  // Cookie error handler
  if (cookieError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Oturum Hatası</h2>
          <p className="text-gray-600 mb-6">
            Tarayıcı verilerinde bir sorun tespit edildi. Lütfen sayfayı yenileyin.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      // Clear all session storage mechanisms first
      localStorage.removeItem('supabase.auth.token');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('authSuccess');
      }

      // Clear cookies
      document.cookie = 'supabase.auth.token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict';
      document.cookie = 'auth_verified=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict';

      // Then sign out from Supabase
      const supabase = createClient();
      await supabase.auth.signOut();

      showNotification("Başarıyla çıkış yapıldı", "success");

      // Force a full page reload to ensure all state is cleared
      window.location.href = "/";
    } catch (error) {
      showNotification("Çıkış işlemi sırasında bir sorun oluştu", "error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      showNotification("Kullanıcı bilgisi bulunamadı", "error");
      return;
    }

    try {
      // Update the profile in the database
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Also update user metadata to ensure consistent data across auth and profiles
      const { error: userMetadataError } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName
        }
      });

      if (userMetadataError) {
      }

      showToast("Profil başarıyla güncellendi", "success");
      setIsEditing(false);
      loadUserProfile(); // Yeniden profil bilgilerini yükle
    } catch (error: any) {
      showNotification("Profil güncellenirken bir hata oluştu", "error");
    }
  };

  const sendVerificationEmail = async () => {
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile?.id,
          email: profile?.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Doğrulama e-postası gönderilemedi");
      }

      const data = await response.json();

      if (data.message === "Email is already verified") {
        showNotification("E-posta adresiniz zaten doğrulanmış", "info");
      } else {
        showNotification(
          "Doğrulama e-postası gönderildi. Lütfen e-posta kutunuzu kontrol edin.",
          "success",
        );
      }
    } catch (error: any) {
      showNotification(
        "Doğrulama e-postası gönderilirken bir hata oluştu",
        "error",
      );
    }
  };

  // Koruma kaydı - kimlik doğrulaması gerektiren sayfa
  // RequireAuth is typically applied in a layout component for account pages
  return (
    <RequireAuth data-oid="btkkmsb">
      <style jsx global data-oid="c0sdf1j">{`
        /* CSS Variables */
        :root {
          --dark: #1e293b;
          --dark-light: #2d3748;
          --dark-medium: #1a2234;
          --dark-lighter: #334155;
          --secondary: #3b82f6;
          --secondary-light: #60a5fa;
        }

        /* Account sayfasına özel dark mode CSS */
        .dark .account-page .account-card {
          background-color: var(--dark-medium);
          color: white;
        }

        .dark .account-page .account-card-inner {
          background-color: var(--dark-medium);
        }

        .dark .account-page .account-action-card {
          background-color: var(--dark);
          border: 1px solid var(--dark-lighter);
          color: white;
        }

        .dark .account-page .account-input {
          background-color: var(--dark);
          border-color: var(--dark-lighter);
          color: white;
        }

        .dark .account-page .account-info {
          color: #f1f5f9 !important;
        }

        .dark .account-page .account-label {
          color: #cbd5e1 !important;
        }

        .dark .account-page .account-link-card {
          background-color: var(--dark-medium);
          border: 1px solid var(--dark-lighter);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .dark .account-page .account-link-card:hover {
          background-color: var(--dark-lighter);
        }

        .dark .account-page .edit-button {
          background-color: var(--dark);
          color: white;
          border-color: var(--dark-lighter);
        }

        .dark .account-page .edit-button:hover {
          background-color: var(--dark-lighter);
        }
      `}</style>
      <div
        className="container mx-auto px-4 py-8 account-page"
        data-oid="9d5j:nf"
      >
        <div className="max-w-4xl mx-auto" data-oid="yu207mj">
          <h1
            className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6"
            data-oid="2pjq6:i"
          >
            Hesabım
          </h1>

          {isLoading ? (
            <div className="flex justify-center p-8" data-oid="tm96lod">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"
                data-oid="gzf1z.3"
              ></div>
            </div>
          ) : (
            <div
              className="bg-white account-card rounded-xl shadow-sm overflow-hidden"
              data-oid="lg6vu5v"
            >
              {/* Profil Özeti */}
              <div
                className="border-b border-gray-200 dark:border-dark-lighter p-6"
                data-oid="1u-qnhw"
              >
                <div className="flex items-center gap-4" data-oid="arlmi6k">
                  <div
                    className="bg-gray-100 dark:bg-dark rounded-full p-3 h-16 w-16 flex items-center justify-center"
                    data-oid="eek.npn"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-500 dark:text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      data-oid="9hrcqrl"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        data-oid="tgc1fnt"
                      />
                    </svg>
                  </div>
                  <div data-oid="enmgfu5">
                    <h2
                      className="text-xl font-semibold text-gray-800 dark:text-white"
                      data-oid="hdmk27b"
                    >
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <p
                      className="text-gray-500 dark:text-gray-400 flex items-center"
                      data-oid="cdh12_m"
                    >
                      {profile?.email}
                      {profile?.is_email_verified ? (
                        <span
                          className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500"
                          data-oid="lpxgxtv"
                        >
                          <svg
                            className="mr-1 h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            data-oid="zk06k:h"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                              data-oid="_u_-487"
                            />
                          </svg>
                          Doğrulanmış
                        </span>
                      ) : (
                        <button
                          onClick={sendVerificationEmail}
                          className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500 hover:bg-yellow-200 dark:hover:bg-yellow-800/50"
                          data-oid="1c2d35c"
                        >
                          Doğrula
                        </button>
                      )}
                    </p>
                  </div>

                  <div className="ml-auto" data-oid="lyv7q3h">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="edit-button inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      data-oid="4knzrg5"
                    >
                      {isEditing ? "İptal" : "Düzenle"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Profil Bilgileri */}
              <div
                className="p-6 bg-white account-card-inner"
                data-oid="05fwn3x"
              >
                {isEditing ? (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    data-oid="c6_7nqw"
                  >
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      data-oid="xw3fu5n"
                    >
                      <div data-oid="fivuzn1">
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 account-label mb-1"
                          data-oid="wuk5vy4"
                        >
                          Ad
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="account-input w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
                          data-oid="x_z-ro2"
                        />
                      </div>
                      <div data-oid="slmibbo">
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 account-label mb-1"
                          data-oid="ty7nc_s"
                        >
                          Soyad
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="account-input w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
                          data-oid="d2kjx.j"
                        />
                      </div>
                    </div>

                    <div data-oid="-ovd2o7">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 account-label mb-1"
                        data-oid="0y4.qmv"
                      >
                        Telefon (isteğe bağlı)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="account-input w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="+90 555 123 4567"
                        data-oid="6lp.8:-"
                      />
                    </div>

                    <div data-oid="0ogovw9">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 account-label mb-1"
                        data-oid="7_1z7:o"
                      >
                        E-posta
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={profile?.email}
                        disabled
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-gray-400 cursor-not-allowed"
                        data-oid="_dwbhax"
                      />

                      <p
                        className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                        data-oid=":vd0:cd"
                      >
                        E-posta adresinizi değiştirmek için lütfen destek ile
                        iletişime geçin.
                      </p>
                    </div>

                    <div className="pt-3" data-oid="440nbbq">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                        data-oid="qr2zpy4"
                      >
                        Değişiklikleri Kaydet
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    className="space-y-4 bg-white account-card-inner"
                    data-oid="_zkslke"
                  >
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      data-oid="n89hz4y"
                    >
                      <div data-oid="ydrjt2b">
                        <h3
                          className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                          data-oid="8xq5_lh"
                        >
                          Ad
                        </h3>
                        <p
                          className="mt-1 text-base font-medium text-gray-900 account-info"
                          data-oid="8ck-t_u"
                        >
                          {profile?.first_name || "-"}
                        </p>
                      </div>
                      <div data-oid="qc9uyy_">
                        <h3
                          className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                          data-oid="z0sxxa:"
                        >
                          Soyad
                        </h3>
                        <p
                          className="mt-1 text-base font-medium text-gray-900 account-info"
                          data-oid="y9:fe2w"
                        >
                          {profile?.last_name || "-"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      data-oid="7sb1n06"
                    >
                      <div data-oid="fivewq5">
                        <h3
                          className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                          data-oid="czc0q1w"
                        >
                          E-posta
                        </h3>
                        <p
                          className="mt-1 text-base font-medium text-gray-900 account-info flex items-center"
                          data-oid="57za_m3"
                        >
                          {profile?.email}
                          {profile?.is_email_verified && (
                            <svg
                              className="ml-1.5 h-4 w-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              data-oid="d:1lw92"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                                data-oid="mtuhjac"
                              />
                            </svg>
                          )}
                        </p>
                      </div>
                      <div data-oid="xj_luwn">
                        <h3
                          className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                          data-oid="qttl2oy"
                        >
                          Telefon
                        </h3>
                        <p
                          className="mt-1 text-base font-medium text-gray-900 account-info"
                          data-oid="9zl8jjh"
                        >
                          {profile?.phone || "-"}
                        </p>
                      </div>
                    </div>

                    <div data-oid="oq2lk7n">
                      <h3
                        className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                        data-oid="o-nmd63"
                      >
                        Üye Olma Tarihi
                      </h3>
                      <p
                        className="mt-1 text-base font-medium text-gray-900 account-info"
                        data-oid="c-w.tai"
                      >
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString(
                            "tr-TR",
                          )
                          : "-"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hesap İşlemleri */}
              <div
                className="border-t border-gray-200 dark:border-dark-lighter p-6 bg-gray-50 account-action-card"
                data-oid="9j8b3zq"
              >
                <h3
                  className="text-lg font-medium text-gray-900 dark:text-white mb-3"
                  data-oid="lv25au4"
                >
                  Hesap İşlemleri
                </h3>

                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  data-oid="2d5o3q6"
                >
                  <Link
                    href="/account/orders"
                    className="flex items-center p-3 rounded-lg bg-white account-link-card hover:bg-gray-100 transition-colors"
                    data-oid="53id42."
                  >
                    <div
                      className="mr-3 bg-secondary/10 text-secondary dark:text-secondary-light rounded-full p-2"
                      data-oid="oijyb7l"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid="4jy8_ya"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          data-oid="fkgl9co"
                        />
                      </svg>
                    </div>
                    <div data-oid="fish1lp">
                      <h4
                        className="font-medium text-gray-900 account-info"
                        data-oid="ypfwjkz"
                      >
                        Siparişlerim
                      </h4>
                      <p
                        className="text-sm text-gray-500 dark:text-gray-300"
                        data-oid="2ltjp5x"
                      >
                        Önceki siparişlerinizi görüntüleyin
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/account/addresses"
                    className="flex items-center p-3 rounded-lg bg-white account-link-card hover:bg-gray-100 transition-colors"
                    data-oid="34bvsxx"
                  >
                    <div
                      className="mr-3 bg-secondary/10 text-secondary dark:text-secondary-light rounded-full p-2"
                      data-oid="8ee53si"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid="-o-6nf0"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          data-oid="mzqtx9a"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          data-oid="x_r393i"
                        />
                      </svg>
                    </div>
                    <div data-oid="xfp3j-_">
                      <h4
                        className="font-medium text-gray-900 account-info"
                        data-oid="nde6ebs"
                      >
                        Adreslerim
                      </h4>
                      <p
                        className="text-sm text-gray-500 dark:text-gray-300"
                        data-oid="cp9vqns"
                      >
                        Teslimat ve fatura adreslerinizi yönetin
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/account/password"
                    className="flex items-center p-3 rounded-lg bg-white account-link-card hover:bg-gray-100 transition-colors"
                    data-oid="2ezg71r"
                  >
                    <div
                      className="mr-3 bg-secondary/10 text-secondary dark:text-secondary-light rounded-full p-2"
                      data-oid="6tau2wq"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid="l30qiqz"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          data-oid="zc3-c1f"
                        />
                      </svg>
                    </div>
                    <div data-oid="b9_7_-i">
                      <h4
                        className="font-medium text-gray-900 account-info"
                        data-oid="bddyqtm"
                      >
                        Şifre Değiştir
                      </h4>
                      <p
                        className="text-sm text-gray-500 dark:text-gray-300"
                        data-oid="7p5xfoa"
                      >
                        Hesap güvenliği için şifrenizi güncelleyin
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center p-3 rounded-lg bg-white account-link-card hover:bg-gray-100 transition-colors text-left"
                    data-oid="m6e2raw"
                  >
                    <div
                      className="mr-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full p-2"
                      data-oid="j68is0m"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid="bmuvkui"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          data-oid=":4un:l_"
                        />
                      </svg>
                    </div>
                    <div data-oid="gtzqp.-">
                      <h4
                        className="font-medium text-gray-900 account-info"
                        data-oid="a.8bbck"
                      >
                        Çıkış Yap
                      </h4>
                      <p
                        className="text-sm text-gray-500 dark:text-gray-300"
                        data-oid="ejvd1.d"
                      >
                        Hesabınızdan güvenli çıkış yapın
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}

// Then update your loadUserProfile function to use authUser instead of user if needed
