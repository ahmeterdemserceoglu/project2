"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const supabase = createClientComponentClient<Database>();
  const { showToast } = useToast();
  const { showNotification } = useNotification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Validate form fields
  const validateForm = () => {
    setErrorMessage("");

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      const msg = "Şifreler eşleşmiyor.";
      setErrorMessage(msg);
      showNotification(msg, "error");
      return false;
    }

    // Check password length
    if (formData.password.length < 8) {
      const msg = "Şifreniz en az 8 karakter uzunluğunda olmalıdır.";
      setErrorMessage(msg);
      showNotification(msg, "error");
      return false;
    }

    // Check terms acceptance
    if (!formData.terms) {
      const msg =
        "Devam etmek için Kullanım Şartları ve Gizlilik Politikası'nı kabul etmelisiniz.";
      setErrorMessage(msg);
      showNotification(msg, "error");
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setDebugInfo(null);

    try {

      // STEP 1: Kullanıcıyı doğrudan oluşturmaya çalışalım ve tüm cevapları saklayalım
      // Bunun yerine API endpoint kullanarak kayıt işlemini tamamen kontrol edelim
      const registerResponse = await fetch("/api/auth/custom-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        setDebugInfo({
          errorType: "api_signup_error",
          errorDetails: errorData,
        });
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await registerResponse.json();

      if (!data?.userId) {
        const noUserError = {
          message: "No user data returned after registration",
          code: "no_user_data",
        };
        setDebugInfo({
          errorType: "no_user_data",
          response: data,
        });
        throw noUserError;
      }


      // STEP 2: Profil bilgilerini kontrol edelim

      try {
        const { data: profileData, error: profileCheckError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.userId)
          .maybeSingle(); // single yerine maybeSingle kullanmak güvenli

        if (profileCheckError) {
          setDebugInfo({
            errorType: "profile_check_error",
            errorDetails: profileCheckError,
            userId: data.userId,
          });
        }

        // STEP 3: Eğer profil otomatik oluşmadıysa manuel olarak oluşturalım
        if (!profileData) {

          // API endpoint üzerinden profil oluşturma
          const apiResponse = await fetch("/api/create-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: data.userId,
              email: formData.email,
              first_name: formData.firstName,
              last_name: formData.lastName,
            }),
          });

          if (!apiResponse.ok) {
            const apiError = await apiResponse.json();
            setDebugInfo({
              errorType: "api_profile_creation_error",
              errorDetails: apiError,
              profileData: {
                id: data.userId,
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
              },
            });

            // Manuel profil oluşturma dene
            try {
              const { error: createProfileError } = await supabase
                .from("profiles")
                .upsert(
                  {
                    id: data.userId,
                    email: formData.email,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    is_admin: false,
                    is_email_verified: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  {
                    onConflict: "id",
                    ignoreDuplicates: false,
                  },
                );

              if (createProfileError) {
                setDebugInfo((prevState: any) => ({
                  ...prevState,
                  manualProfileError: createProfileError,
                }));
              } else {
              }
            } catch (err) {
            }
          } else {
          }
        }
        // STEP 4: Profil bilgilerini güncelleyelim
        else {
          try {
            const { error: updateProfileError } = await supabase
              .from("profiles")
              .update({
                first_name: formData.firstName,
                last_name: formData.lastName,
              })
              .eq("id", data.userId);

            if (updateProfileError) {
              setDebugInfo({
                errorType: "profile_update_error",
                errorDetails: updateProfileError,
                profileData: profileData,
              });
            } else {
            }
          } catch (err) {
          }
        }
      } catch (profileErr) {
        setDebugInfo((prevState: any) => ({
          ...prevState,
          profileOperationError: profileErr,
        }));
      }

      // Email verification is handled by custom-signup API, no need to send again

      // STEP 6: Debug loglarını kontrol edelim
      if (debugMode) {
        const { data: logData, error: logError } = await (supabase as any)
          .from("debug_logs")
          .select("*")
          .eq("details->user_id", data.userId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (logError) {
        } else {
          setDebugInfo((prev: any) => ({ ...prev, debugLogs: logData }));
        }
      }

      // Başarılı kayıt işlemi
      setIsRegistered(true);
      showToast("Kaydınız başarıyla tamamlandı!", "success");
      showNotification(
        "E-posta adresinize doğrulama bağlantısı gönderildi. Lütfen kontrol edin.",
        "info",
      );

      // Redirect to confirmation page
      router.push(
        "/register/confirm?email=" + encodeURIComponent(formData.email),
      );
    } catch (error: any) {

      // Provide more detailed error messages based on error type
      let errorMsg =
        "Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.";

      if (error.message) {
        if (error.message.includes("already registered")) {
          errorMsg =
            "Bu email adresi zaten kayıtlı. Lütfen giriş yapın veya farklı bir email adresi kullanın.";
        } else if (error.message.includes("weak password")) {
          errorMsg =
            "Şifre çok zayıf. Lütfen en az 8 karakter, bir büyük harf ve bir rakam içeren bir şifre seçin.";
        } else if (error.message.includes("password")) {
          errorMsg =
            "Geçersiz şifre. Şifreniz en az 6 karakterden oluşmalıdır.";
        } else if (error.message.includes("email")) {
          errorMsg =
            "Geçersiz email formatı. Lütfen geçerli bir email adresi girin.";
        } else if (error.message.includes("network")) {
          errorMsg =
            "Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.";
        } else if (error.message.includes("Database error")) {
          errorMsg =
            "Veritabanı hatası. Bu email zaten sistemde kayıtlı olabilir veya bir iç sunucu hatası oluşmuş olabilir.";
        } else if (error.code === "unexpected_failure") {
          errorMsg =
            "Beklenmeyen bir hata oluştu. Bu email zaten kullanılmış olabilir veya sistemde bir sorun olabilir.";
        } else if (error.status === 422 || error.status === 400) {
          if (error.message.includes("Password")) {
            errorMsg =
              "Şifre gereksinimleri karşılanmıyor. Daha güçlü bir şifre belirleyin.";
          } else {
            errorMsg =
              "Geçersiz kayıt bilgileri. Lütfen bilgilerinizi kontrol edin.";
          }
        } else if (error.status === 429) {
          errorMsg =
            "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyiniz.";
        } else if (error.status === 500) {
          errorMsg = "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
        }
      }

      setErrorMessage(errorMsg);
      // Use Notification instead of Toast for errors
      showNotification(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: "google" | "facebook") => {
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

      showToast(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} ile giriş yapılıyor...`,
        "info",
      );
    } catch (error: any) {
      const errorMsg = `${provider.charAt(0).toUpperCase() + provider.slice(1)} ile kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.`;
      setErrorMessage(errorMsg);
      showToast(errorMsg, "error");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen overflow-hidden flex flex-col md:flex-row"
      data-oid="h.5iakx"
    >
      {/* Left side - Image (Hidden on mobile) */}
      <div
        className="hidden md:flex w-1/2 bg-gradient-to-br from-secondary/10 to-accent/10 dark:from-secondary/20 dark:to-accent/20 items-center justify-center"
        data-oid="i3540bh"
      >
        <div className="p-6 max-w-md" data-oid="nj_x6x0">
          <div
            className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-lg"
            data-oid="5qub3w3"
          >
            <div className="relative aspect-[16/9] w-full" data-oid="eo-1cup">
              <Image
                src="/images/register-image.png"
                alt="Register"
                fill
                className="object-cover"
                priority
                data-oid="pxgn8n1"
              />
            </div>
            <div className="p-6" data-oid="p6llutt">
              <h2
                className="text-xl font-bold text-gray-800 dark:text-white mb-2"
                data-oid="kr9wjkg"
              >
                Alışveriş Deneyimini Kişiselleştir
              </h2>
              <p
                className="text-gray-600 dark:text-gray-300"
                data-oid="oxsfgj6"
              >
                Hesabınızla tüm alışveriş deneyiminizi kişiselleştirebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form (Full width on mobile, half width on desktop) */}
      <div
        className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-y-auto"
        data-oid=".oo6huw"
      >
        <div className="w-full max-w-md py-2" data-oid="1z2me__">
          <div className="text-center md:text-left mb-6" data-oid="bex.aek">
            <Link href="/" className="inline-block mb-6" data-oid="plnfie3">
              <span
                className="text-2xl font-bold tracking-tighter relative"
                data-oid="ymlc61a"
              >
                <span className="text-primary" data-oid="i0iydvq">
                  HD
                </span>
                <span
                  className="text-gray-800 dark:text-white"
                  data-oid="zih54xg"
                >
                  Ticaret
                </span>
                <span
                  className="text-xs text-secondary ml-1 absolute -right-4 top-0"
                  data-oid="c:.ohlh"
                >
                  .com
                </span>
              </span>
            </Link>
            <h1
              className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2"
              data-oid="9rvav2_"
            >
              Hesap Oluştur
            </h1>
            <p className="text-gray-500 dark:text-gray-400" data-oid="b7y7.di">
              Hızlı ve güvenli bir şekilde kayıt olun
            </p>
          </div>

          <form
            className="space-y-3"
            onSubmit={handleRegister}
            data-oid="_z3bely"
          >
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
              data-oid="5aqe-a_"
            >
              <div data-oid="q5_3j3z">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                  data-oid="ca76qx8"
                >
                  Ad
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Adınız"
                  required
                  data-oid="9yo2efw"
                />
              </div>
              <div data-oid="_v.7nn8">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                  data-oid="lnu.pug"
                >
                  Soyad
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Soyadınız"
                  required
                  data-oid="cef.cky"
                />
              </div>
            </div>
            <div data-oid="6_xi1i2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                data-oid="6m5kfv-"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="email@example.com"
                required
                data-oid="993vwu3"
              />
            </div>
            <div data-oid="w9_yia_">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                data-oid="qv2iww:"
              >
                Şifre
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="••••••••"
                required
                data-oid="pip33s0"
              />

              <p
                className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                data-oid="2fl3q5t"
              >
                En az 8 karakter ve bir rakam içermelidir.
              </p>
            </div>
            <div data-oid=":kq6p8i">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                data-oid="bj:c9j1"
              >
                Şifre Tekrar
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="••••••••"
                required
                data-oid="o8f2ft."
              />
            </div>
            <div className="flex items-start" data-oid=".q9_czg">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="h-4 w-4 mt-1 text-secondary border-gray-300 rounded focus:ring-secondary"
                required
                data-oid="4_ddpx8"
              />

              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
                data-oid="26pm9dy"
              >
                <Link
                  href="/terms"
                  className="text-secondary hover:text-secondary-dark"
                  data-oid="-.b53wa"
                >
                  Kullanım Şartları
                </Link>{" "}
                ve{" "}
                <Link
                  href="/privacy"
                  className="text-secondary hover:text-secondary-dark"
                  data-oid="4h_lr5:"
                >
                  Gizlilik Politikası
                </Link>
                'nı kabul ediyorum.
              </label>
            </div>

            {errorMessage && (
              <div
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400"
                data-oid="pk9eyyd"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded-xl transition-colors duration-200 font-medium flex justify-center items-center"
              data-oid="kkz:ssl"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    data-oid="t6smfkl"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      data-oid=".f7wcty"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      data-oid="mmrc7se"
                    ></path>
                  </svg>
                  Kayıt Yapılıyor...
                </>
              ) : (
                "Kayıt Ol"
              )}
            </button>
          </form>

          <div className="mt-4 text-center" data-oid="opf2qxf">
            <span
              className="text-gray-600 dark:text-gray-400"
              data-oid="k4..262"
            >
              Zaten hesabınız var mı?{" "}
            </span>
            <Link
              href="/login"
              className="text-secondary hover:text-secondary-dark font-medium"
              data-oid="3to71r9"
            >
              Giriş Yap
            </Link>
          </div>

          <div className="mt-4" data-oid="fxjixcf">
            <div className="relative" data-oid="6l5zu12">
              <div
                className="absolute inset-0 flex items-center"
                data-oid="ytg6v26"
              >
                <div
                  className="w-full border-t border-gray-300 dark:border-dark-lighter"
                  data-oid="m:k2hib"
                ></div>
              </div>
              <div
                className="relative flex justify-center text-sm"
                data-oid="1j6desv"
              >
                <span
                  className="px-2 bg-white dark:bg-dark text-gray-500 dark:text-gray-400"
                  data-oid="4z80ehz"
                >
                  veya şununla devam et
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3" data-oid="5bzz-5f">
              <button
                type="button"
                onClick={() => handleSocialSignUp("google")}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
                data-oid="9zx:cc7"
              >
                <span className="sr-only" data-oid="u1836er">
                  Google ile kayıt ol
                </span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="1ea_7rx"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                    data-oid="buvvvx:"
                  />

                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                    data-oid="6o-3ed_"
                  />

                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                    data-oid="odgwa4g"
                  />

                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                    data-oid="goojai1"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignUp("facebook")}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
                data-oid="a6rf7d6"
              >
                <span className="sr-only" data-oid="91e9str">
                  Facebook ile kayıt ol
                </span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="vir:vk3"
                >
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    fill="#1877F2"
                    data-oid="af9hsrz"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-lighter rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
                data-oid="gw:z9s_"
              >
                <span className="sr-only" data-oid="j1mdogt">
                  Apple ile kayıt ol
                </span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="om3nx4_"
                >
                  <path
                    d="M16.462 16.964c-.511.971-1.04 1.935-1.89 1.956-.825.02-1.09-.499-2.04-.499-.95 0-1.244.479-2.033.499-.82.02-1.446-.931-1.96-1.9-1.066-1.607-1.884-4.535-1.047-6.505.417-.98 1.162-1.6 1.969-1.6.822 0 1.336.499 2.015.499.679 0 1.252-.499 2.116-.499.757 0 1.556.452 2.124 1.232-1.883 1.015-1.578 3.647.746 4.817zM14.1 7.196c.411-.525.745-1.25.627-1.996-.694.048-1.511.3-1.992.746-.465.429-.852 1.131-.745 1.795.767.052 1.561-.234 2.11-.545z"
                    fill="#000000"
                    data-oid="1f5x500"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Debug Mode Toggle */}
          <div className="mt-6 text-center" data-oid="8fq20f1">
            <button
              type="button"
              onClick={() => setDebugMode(!debugMode)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              data-oid="cmabjn3"
            >
              {debugMode ? "Debug Modunu Kapat" : ""}
            </button>
          </div>

          {/* Debug Information - Only shown when debugMode is true */}
          {debugMode && debugInfo && (
            <div
              className="mt-4 p-3 bg-gray-50 dark:bg-dark-medium rounded-lg text-xs overflow-auto max-h-60"
              data-oid="t30:w_t"
            >
              <h4
                className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2"
                data-oid="be10qr7"
              >
                Hata Detayları:
              </h4>
              <pre
                className="text-xs text-gray-600 dark:text-gray-400"
                data-oid="9z:dx2p"
              >
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
