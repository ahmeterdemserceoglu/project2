"use client";

import { useState } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";
import RequireAuth from "@/components/auth/RequireAuth";

export default function ChangePassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const supabase = createClientComponentClient();
  const { showToast } = useToast();
  const { showNotification } = useNotification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("Yeni şifreler eşleşmiyor.");
      showNotification("Yeni şifreler eşleşmiyor.", "error");
      return;
    }

    if (formData.newPassword.length < 8) {
      setErrorMessage("Şifre en az 8 karakter uzunluğunda olmalıdır.");
      showNotification(
        "Şifre en az 8 karakter uzunluğunda olmalıdır.",
        "error",
      );
      return;
    }

    setIsLoading(true);

    try {
      // Get current session
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Kullanıcı bilgileri alınamadı");
      }

      // First sign in with current password to verify
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || "",
        password: formData.currentPassword,
      });

      if (signInError) {
        throw new Error("Mevcut şifre yanlış");
      }

      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Success
      showToast("Şifreniz başarıyla güncellendi", "success");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect to account page
      router.push("/account");
    } catch (error: any) {
      console.error("Password change error:", error);
      let message = "Şifre değiştirme sırasında bir hata oluştu.";

      if (error.message === "Mevcut şifre yanlış") {
        message = "Mevcut şifrenizi yanlış girdiniz.";
      } else if (error.message?.includes("password")) {
        message =
          "Yeni şifre gereksinimleri karşılamıyor. Lütfen daha güçlü bir şifre seçin.";
      }

      setErrorMessage(message);
      showNotification(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RequireAuth data-oid="3kh3hgh">
      <div className="container mx-auto px-4 py-8" data-oid="lvqvha3">
        <div className="max-w-md mx-auto" data-oid=".dhlepr">
          <div className="mb-6" data-oid="ixpyof:">
            <Link
              href="/account"
              className="inline-flex items-center text-sm text-secondary hover:text-secondary-dark"
              data-oid="w96d3zm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="uftdg5a"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                  data-oid="y-5k244"
                />
              </svg>
              Hesap Sayfasına Dön
            </Link>
            <h1
              className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2"
              data-oid="mcmlwq:"
            >
              Şifre Değiştir
            </h1>
            <p
              className="text-gray-600 dark:text-gray-300 mt-1"
              data-oid="4od_dzt"
            >
              Hesabınızın güvenliği için düzenli olarak şifrenizi değiştirin.
            </p>
          </div>

          <div
            className="bg-white dark:bg-dark-light rounded-xl shadow-sm overflow-hidden"
            data-oid="a:b4nnb"
          >
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
              data-oid="dpnsy.g"
            >
              <div data-oid=".o:qiu2">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  data-oid="hia-y52"
                >
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="••••••••"
                  required
                  data-oid="9ze9yf0"
                />
              </div>

              <div data-oid="p08z9d9">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  data-oid="wrco9q_"
                >
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="••••••••"
                  required
                  data-oid="wp4lhuc"
                />

                <p
                  className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                  data-oid="ypnmcc8"
                >
                  En az 8 karakter, bir büyük harf ve bir rakam içermelidir.
                </p>
              </div>

              <div data-oid="z6gaakw">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  data-oid="gzx.ssr"
                >
                  Yeni Şifre Tekrar
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="••••••••"
                  required
                  data-oid="ns9wrgo"
                />
              </div>

              {errorMessage && (
                <div
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400"
                  data-oid="yxgalpu"
                >
                  {errorMessage}
                </div>
              )}

              <div className="pt-3" data-oid="lwdl302">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium flex justify-center items-center"
                  data-oid="mg-x4vb"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        data-oid="6mszd7o"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          data-oid="ljisn1e"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          data-oid="xd:0.sz"
                        ></path>
                      </svg>
                      İşleniyor...
                    </>
                  ) : (
                    "Şifreyi Değiştir"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div
            className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
            data-oid="w-uxzxa"
          >
            <p data-oid="_6ub9ny">
              Şifrenizi mi unuttunuz?{" "}
              <Link
                href="/forgot-password"
                className="text-secondary hover:text-secondary-dark font-medium"
                data-oid="674qb5g"
              >
                Şifremi Unuttum
              </Link>{" "}
              sayfasını kullanın.
            </p>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
