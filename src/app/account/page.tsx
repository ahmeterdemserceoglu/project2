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
    <RequireAuth data-oid="a3rnnlk">
      <style jsx global data-oid="9x7.d3p">{`
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
        data-oid="etevjl2"
      >
        <div className="max-w-4xl mx-auto" data-oid="4nfzuh.">
          <h1
            className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6"
            data-oid="875:6f1"
          >
            Hesabım
          </h1>

          {isLoading ? (
            <div className="flex justify-center p-8" data-oid="wvzao61">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"
                data-oid="fx.xiyi"
              ></div>
            </div>
          ) : (
            <div
              className="bg-white account-card rounded-xl shadow-sm overflow-hidden"
              data-oid="ij:5ijr"
            >
              {/* Profil Özeti */}
              <div
                className="border-b border-gray-200 dark:border-dark-lighter p-6"
                data-oid="r99t_zk"
              >
                <div className="flex items-center gap-4" data-oid="1ufawjb">
                  <div
                    className="bg-gray-100 dark:bg-dark rounded-full p-3 h-16 w-16 flex items-center justify-center"
                    data-oid="0gc3m3v"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-500 dark:text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      data-oid="9ylm4r7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        data-oid="fq__689"
                      />
                    </svg>
                  </div>
                  <div data-oid="gn-ye58">
                    <h2
                      className="text-xl font-semibold text-gray-800 dark:text-white"
                      data-oid="6mawvde"
                    >
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <p
                      className="text-gray-500 dark:text-gray-400 flex items-center"
                      data-oid="2:fx38o"
                    >
                      {profile?.email}
                      {profile?.is_email_verified ? (
                        <span
                          className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500"
                          data-oid="b89nl74"
                        >
                          <svg
                            className="mr-1 h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            data-oid="3e-0eai"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                              data-oid="i00gobj"
                            />
                          </svg>
                          Doğrulanmış
                        </span>
                      ) : (
                        <button
                          onClick={sendVerificationEmail}
                          className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500 hover:bg-yellow-200 dark:hover:bg-yellow-800/50"
                          data-oid="bkjqzlv"
                        >
                          Doğrula
                        </button>
                      )}
                    </p>
                  </div>

                  <div className="ml-auto" data-oid="usxvi:v">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="edit-button inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      data-oid="iqvqbj4"
                    >
                      {isEditing ? "İptal" : "Düzenle"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Profil Bilgileri */}
              <div
                className="p-6 bg-white account-card-inner"
                data-oid="5i58v0r"
              >
                {isEditing ? (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    data-oid="9orvns9"
                  >
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      data-oid="z2y7jj6"
                    >
                      <div data-oid="tp6zgem">
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 account-label mb-1"
                          data-oid="y:g:6jp"
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
                          data-oid="1zja2p."
                        />
                      </div>
                      <div data-oid="ikp.ett">
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 account-label mb-1"
                          data-oid="cme0j7c"
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
                          data-oid="do5to1x"
                        />
                      </div>
                    </div>

                    <div data-oid="--b542y">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 account-label mb-1"
                        data-oid="u:9._a0"
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
                        data-oid="dtso._3"
                      />
                    </div>

                    <div data-oid=".n180sa">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 account-label mb-1"
                        data-oid="p.mnkyh"
                      >
                        E-posta
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={profile?.email}
                        disabled
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-gray-400 cursor-not-allowed"
                        data-oid="4ypzw.l"
                      />

                      <p
                        className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                        data-oid="3u8_p:_"
                      >
                        E-posta adresinizi değiştirmek için lütfen destek ile
                        iletişime geçin.
                      </p>
                    </div>

                    <div className="pt-3" data-oid="jj3gsc:">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                        data-oid="4.mkjtc"
                      >
                        Değişiklikleri Kaydet
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    className="space-y-4 bg-white account-card-inner"
                    data-oid="rfw2q-p"
                  >
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      data-oid="iwkv7_0"
                    >
                      <div data-oid=":zspy6-">
                        <h3
                          className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                          data-oid="s38q_kf"
                        >
                          Ad
                        </h3>
                        <p
                          className="mt-1 text-base font-medium text-gray-900 account-info"
                          data-oid=":q4ha_p"
                        >
                          {profile?.first_name || "-"}
                        </p>
                      </div>
                      <div data-oid="dksad.1">
                        <h3
                          className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                          data-oid="bcjnp--"
                        >
                          Soyad
                        </h3>
                        <p
                          className="mt-1 text-base font-medium text-gray-900 account-info"
                          data-oid=".byj_nj"
                        >
                          {profile?.last_name || "-"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      data-oid="xg4p3-a"
                    >
                      <div data-oid="38lfcnw">
                        <h3
                          className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                          data-oid="ej:3-1k"
                        >
                          E-posta
                        </h3>
                        <p
                          className="mt-1 text-base font-medium text-gray-900 account-info flex items-center"
                          data-oid="cam0ca_"
                        >
                          {profile?.email}
                          {profile?.is_email_verified && (
                            <svg
                              className="ml-1.5 h-4 w-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              data-oid="gdc3kww"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                                data-oid="8.8.ma:"
                              />
                            </svg>
                          )}
                        </p>
                      </div>
                      <div data-oid="78qnzi0">
                        <h3
                          className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                          data-oid="rarzreq"
                        >
                          Telefon
                        </h3>
                        <p
                          className="mt-1 text-base font-medium text-gray-900 account-info"
                          data-oid="702gce-"
                        >
                          {profile?.phone || "-"}
                        </p>
                      </div>
                    </div>

                    <div data-oid="r8hbpih">
                      <h3
                        className="text-sm font-medium text-gray-500 dark:text-gray-300 account-label"
                        data-oid="opyy49u"
                      >
                        Üye Olma Tarihi
                      </h3>
                      <p
                        className="mt-1 text-base font-medium text-gray-900 account-info"
                        data-oid="cyh8qdm"
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
                data-oid="45bsob7"
              >
                <h3
                  className="text-lg font-medium text-gray-900 dark:text-white mb-3"
                  data-oid="cxn3ag:"
                >
                  Hesap İşlemleri
                </h3>

                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  data-oid=":.ej9gd"
                >
                  <Link
                    href="/account/orders"
                    className="flex items-center p-3 rounded-lg bg-white account-link-card hover:bg-gray-100 transition-colors"
                    data-oid="_:dedj."
                  >
                    <div
                      className="mr-3 bg-secondary/10 text-secondary dark:text-secondary-light rounded-full p-2"
                      data-oid="e6b81wo"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid="j6-7l_1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          data-oid="fat7fy-"
                        />
                      </svg>
                    </div>
                    <div data-oid="2sbn3y5">
                      <h4
                        className="font-medium text-gray-900 account-info"
                        data-oid="s96baoq"
                      >
                        Siparişlerim
                      </h4>
                      <p
                        className="text-sm text-gray-500 dark:text-gray-300"
                        data-oid="x1jpi5m"
                      >
                        Önceki siparişlerinizi görüntüleyin
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/account/addresses"
                    className="flex items-center p-3 rounded-lg bg-white account-link-card hover:bg-gray-100 transition-colors"
                    data-oid="ke4g-jj"
                  >
                    <div
                      className="mr-3 bg-secondary/10 text-secondary dark:text-secondary-light rounded-full p-2"
                      data-oid="pfmjmwn"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid=":lb__rd"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          data-oid=":y.9g_m"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          data-oid="iyrxo.w"
                        />
                      </svg>
                    </div>
                    <div data-oid="p6gi67b">
                      <h4
                        className="font-medium text-gray-900 account-info"
                        data-oid="w7ybjst"
                      >
                        Adreslerim
                      </h4>
                      <p
                        className="text-sm text-gray-500 dark:text-gray-300"
                        data-oid="2fpeug3"
                      >
                        Teslimat ve fatura adreslerinizi yönetin
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/account/password"
                    className="flex items-center p-3 rounded-lg bg-white account-link-card hover:bg-gray-100 transition-colors"
                    data-oid="cg.-.7c"
                  >
                    <div
                      className="mr-3 bg-secondary/10 text-secondary dark:text-secondary-light rounded-full p-2"
                      data-oid="e.3-ohw"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid="5qinksb"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          data-oid="ew5f7ig"
                        />
                      </svg>
                    </div>
                    <div data-oid="i_vpqa:">
                      <h4
                        className="font-medium text-gray-900 account-info"
                        data-oid="__j97:l"
                      >
                        Şifre Değiştir
                      </h4>
                      <p
                        className="text-sm text-gray-500 dark:text-gray-300"
                        data-oid="j:9ev2k"
                      >
                        Hesap güvenliği için şifrenizi güncelleyin
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center p-3 rounded-lg bg-white account-link-card hover:bg-gray-100 transition-colors text-left"
                    data-oid="9q.e31v"
                  >
                    <div
                      className="mr-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full p-2"
                      data-oid="f:lm957"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid=".yp6mtg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          data-oid="rf2dnhj"
                        />
                      </svg>
                    </div>
                    <div data-oid="hn10sx.">
                      <h4
                        className="font-medium text-gray-900 account-info"
                        data-oid="p_yy42u"
                      >
                        Çıkış Yap
                      </h4>
                      <p
                        className="text-sm text-gray-500 dark:text-gray-300"
                        data-oid="0jm2:rw"
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
