"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClientComponentClient } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";
import RequireAuth from "@/components/auth/RequireAuth";

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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const supabase = createClientComponentClient();
  const { showToast } = useToast();
  const { showNotification } = useNotification();

  // Kullanıcı bilgilerini yükle
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message || "Kullanıcı bilgileri bulunamadı");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Auth metadata ile profil bilgilerini birleştirerek güncelleyelim
      // Eğer profil tablosunda ad/soyad boşsa, auth metadata'dan alalım
      profileData.first_name =
        profileData.first_name || user.user_metadata?.first_name || "";
      profileData.last_name =
        profileData.last_name || user.user_metadata?.last_name || "";

      // Eğer ad/soyad değişmiş ise veritabanını da güncelleyelim
      if (
        (!profileData.first_name && user.user_metadata?.first_name) ||
        (!profileData.last_name && user.user_metadata?.last_name)
      ) {
        await supabase
          .from("profiles")
          .update({
            first_name:
              profileData.first_name || user.user_metadata?.first_name || "",
            last_name:
              profileData.last_name || user.user_metadata?.last_name || "",
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      setProfile(profileData);
      setFormData({
        firstName: profileData.first_name || "",
        lastName: profileData.last_name || "",
        phone: profileData.phone || "",
      });
    } catch (error: any) {
      console.error("Error loading profile:", error.message);
      showNotification("Profil bilgileri yüklenirken bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showNotification("Başarıyla çıkış yapıldı", "success");
    router.push("/");
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

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile?.id);

      if (error) throw error;

      showToast("Profil başarıyla güncellendi", "success");
      setIsEditing(false);
      loadUserProfile(); // Yeniden profil bilgilerini yükle
    } catch (error: any) {
      console.error("Error updating profile:", error);
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
      console.error("Error sending verification email:", error);
      showNotification(
        "Doğrulama e-postası gönderilirken bir hata oluştu",
        "error",
      );
    }
  };

  // Koruma kaydı - kimlik doğrulaması gerektiren sayfa
  return (
    <RequireAuth data-oid="bf8vj4m">
      <style jsx global data-oid="tkusf.3">{`
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
        data-oid=".enqpmc"
      >
        <div className="max-w-4xl mx-auto" data-oid="zci3rgu">
          <h1
            className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6"
            data-oid="f3jfe7u"
          >
            Hesabım
          </h1>

          {isLoading ? (
            <div className="flex justify-center p-8" data-oid="r8xvege">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"
                data-oid="h7bm841"
              ></div>
            </div>
          ) : (
            <div
              className="bg-white account-card rounded-xl shadow-sm overflow-hidden"
              data-oid="-v:l58r"
            >
              {/* Profil Özeti */}
              <div
                className="border-b border-gray-200 dark:border-dark-lighter p-6"
                data-oid="69pj9zs"
              >
                <div className="flex items-center gap-4" data-oid="091rq4b">
                  <div
                    className="bg-gray-100 dark:bg-dark rounded-full p-3 h-16 w-16 flex items-center justify-center"
                    data-oid="0bbqq0g"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-500 dark:text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      data-oid=":csxljg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        data-oid="qrzmbay"
                      />
                    </svg>
                  </div>
                  <div data-oid="uw81i:g">
                    <h2
                      className="text-xl font-semibold text-gray-800 dark:text-white"
                      data-oid="0h3thbi"
                    >
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <p
                      className="text-gray-500 dark:text-gray-400 flex items-center"
                      data-oid="ng:rzpt"
                    >
                      {profile?.email}
                      {profile?.is_email_verified ? (
                        <span
                          className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500"
                          data-oid="2ghxx7r"
                        >
                          <svg
                            className="mr-1 h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            data-oid="5rhikte"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                              data-oid="sk6k5iu"
                            />
                          </svg>
                          Doğrulanmış
                        </span>
                      ) : (
                        <button
                          onClick={sendVerificationEmail}
                          className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500 hover:bg-yellow-200 dark:hover:bg-yellow-800/50"
                          data-oid="4hb8kkp"
                        >
                          Doğrula
                        </button>
                      )}
                    </p>
                  </div>

                  <div className="ml-auto" data-oid="a4u.pf_">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="edit-button inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      data-oid="2p:8w2j"
                    >
                      {isEditing ? "İptal" : "Düzenle"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Profil Bilgileri */}
              <div
                className="p-6 bg-white account-card-inner"
                data-oid="ryep.ep"
              >
                {isEditing ? (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    data-oid="rp27kce"
                  >
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      data-oid="snzbwcp"
                    >
                      <div data-oid="why50kd">
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 account-label mb-1"
                          data-oid="7ymb:zt"
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
                          data-oid="p2uiy38"
                        />
                      </div>
                      <div data-oid="ryp_uj9">
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 account-label mb-1"
                          data-oid="ena_cn-"
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
                          data-oid="5tqzfzo"
                        />
                      </div>
                    </div>

                    <div data-oid="7w_pn:-">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 account-label mb-1"
                        data-oid="sb2.c.k"
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
                        data-oid="p869_nw"
                      />
                    </div>

                    <div data-oid="gs39v1d">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 account-label mb-1"
                        data-oid="m6rtwfv"
                      >
                        E-posta
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={profile?.email}
                        disabled
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-gray-400 cursor-not-allowed"
                        data-oid="b:oy-k:"
                      />

                      <p
                        className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                        data-oid="3deu.dh"
                      >
                        E-posta adresinizi değiştirmek için lütfen destek ile
                        iletişime geçin.
                      </p>
                    </div>

                    <div className="pt-3" data-oid="aupygi:">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                        data-oid="cpummuu"
                      >
                        Değişiklikleri Kaydet
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    className="space-y-4 bg-white account-card-inner"
                    data-oid="7onopb7"
                  >
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      data-oid="mpckdtj"
                    >
                      <div data-oid="67eloid">
                        <h3
                          className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                          data-oid=":5p2yqy"
                        >
                          Ad
                        </h3>
                        <p
                          className="mt-1 text-base font-medium text-gray-900 account-info"
                          data-oid="1hv_e0m"
                        >
                          {profile?.first_name || "-"}
                        </p>
                      </div>
                      <div data-oid="weqh9.a">
                        <h3
                          className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                          data-oid="1wcelhx"
                        >
                          Soyad
                        </h3>
                        <p
                          className="mt-1 text-base font-medium text-gray-900 account-info"
                          data-oid="f_g:8_3"
                        >
                          {profile?.last_name || "-"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      data-oid="f4-n:4d"
                    >
                      <div data-oid="u2.vhob">
                        <h3
                          className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                          data-oid="87qrqhk"
                        >
                          E-posta
                        </h3>
                        <p
                          className="mt-1 text-base font-medium text-gray-900 account-info flex items-center"
                          data-oid="0.gs1vm"
                        >
                          {profile?.email}
                          {profile?.is_email_verified && (
                            <svg
                              className="ml-1.5 h-4 w-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              data-oid="vg5b1kf"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                                data-oid="cdepzzt"
                              />
                            </svg>
                          )}
                        </p>
                      </div>
                      <div data-oid="qxb_w:5">
                        <h3
                          className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                          data-oid="8uabo0s"
                        >
                          Telefon
                        </h3>
                        <p
                          className="mt-1 text-base font-medium text-gray-900 account-info"
                          data-oid="baak7fr"
                        >
                          {profile?.phone || "-"}
                        </p>
                      </div>
                    </div>

                    <div data-oid="hqrdpub">
                      <h3
                        className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                        data-oid="oc6kzd6"
                      >
                        Üye Olma Tarihi
                      </h3>
                      <p
                        className="mt-1 text-base font-medium text-gray-900 account-info"
                        data-oid="9s8wjtt"
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
                data-oid="uqwb:7h"
              >
                <h3
                  className="text-lg font-medium text-gray-900 dark:text-white mb-3"
                  data-oid="qc-m75s"
                >
                  Hesap İşlemleri
                </h3>

                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  data-oid="tjdlbw1"
                >
                  <Link
                    href="/account/orders"
                    className="flex items-center p-3 rounded-lg bg-white account-link-card hover:bg-gray-100 transition-colors"
                    data-oid="btdy8pc"
                  >
                    <div
                      className="mr-3 bg-secondary/10 text-secondary dark:text-secondary-light rounded-full p-2"
                      data-oid="jqp7jmp"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid="je7vwxa"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          data-oid="et1bfu5"
                        />
                      </svg>
                    </div>
                    <div data-oid="pg4ci0o">
                      <h4
                        className="font-medium text-gray-900 account-info"
                        data-oid="dvssj.h"
                      >
                        Siparişlerim
                      </h4>
                      <p
                        className="text-sm text-gray-500 dark:text-gray-300"
                        data-oid="ar24-6o"
                      >
                        Önceki siparişlerinizi görüntüleyin
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/account/addresses"
                    className="flex items-center p-3 rounded-lg bg-white account-link-card hover:bg-gray-100 transition-colors"
                    data-oid="0_7uora"
                  >
                    <div
                      className="mr-3 bg-secondary/10 text-secondary dark:text-secondary-light rounded-full p-2"
                      data-oid="or_iija"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid=".-s71ys"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          data-oid="_3lx8zb"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          data-oid="vvgjuvp"
                        />
                      </svg>
                    </div>
                    <div data-oid="0f--xvs">
                      <h4
                        className="font-medium text-gray-900 account-info"
                        data-oid="4wg_18r"
                      >
                        Adreslerim
                      </h4>
                      <p
                        className="text-sm text-gray-500 dark:text-gray-300"
                        data-oid="g.jcwip"
                      >
                        Teslimat ve fatura adreslerinizi yönetin
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/account/password"
                    className="flex items-center p-3 rounded-lg bg-white account-link-card hover:bg-gray-100 transition-colors"
                    data-oid="l9.mj9t"
                  >
                    <div
                      className="mr-3 bg-secondary/10 text-secondary dark:text-secondary-light rounded-full p-2"
                      data-oid="9lqcn5c"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid="fc7zw73"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          data-oid="nevadyi"
                        />
                      </svg>
                    </div>
                    <div data-oid="nzc9vrg">
                      <h4
                        className="font-medium text-gray-900 account-info"
                        data-oid="_1vwfn3"
                      >
                        Şifre Değiştir
                      </h4>
                      <p
                        className="text-sm text-gray-500 dark:text-gray-300"
                        data-oid="yd0fa-i"
                      >
                        Hesap güvenliği için şifrenizi güncelleyin
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center p-3 rounded-lg bg-white account-link-card hover:bg-gray-100 transition-colors text-left"
                    data-oid="6-b-0kt"
                  >
                    <div
                      className="mr-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full p-2"
                      data-oid=":sa6yd_"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid="c7kro.7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          data-oid="ebkhjz8"
                        />
                      </svg>
                    </div>
                    <div data-oid="a:04:xf">
                      <h4
                        className="font-medium text-gray-900 account-info"
                        data-oid="n_hjcpa"
                      >
                        Çıkış Yap
                      </h4>
                      <p
                        className="text-sm text-gray-500 dark:text-gray-300"
                        data-oid="w58j8eb"
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
