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
    <RequireAuth data-oid="qg93fqx">
      <div className="container mx-auto px-4 py-8" data-oid="7ne7gy-">
        <div className="max-w-md mx-auto" data-oid="9358nzv">
          <div className="mb-6" data-oid="tdc2p05">
            <Link
              href="/account"
              className="inline-flex items-center text-sm text-secondary hover:text-secondary-dark"
              data-oid="e503p0q"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="baj4rjo"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                  data-oid="rlvbxhx"
                />
              </svg>
              Hesap Sayfasına Dön
            </Link>
            <h1
              className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2"
              data-oid="lk90t_r"
            >
              Şifre Değiştir
            </h1>
            <p
              className="text-gray-600 dark:text-gray-300 mt-1"
              data-oid="br5wge2"
            >
              Hesabınızın güvenliği için düzenli olarak şifrenizi değiştirin.
            </p>
          </div>

          <div
            className="bg-white dark:bg-dark-light rounded-xl shadow-sm overflow-hidden"
            data-oid="s9iuhhj"
          >
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
              data-oid="2rexsck"
            >
              <div data-oid="0m2dmbn">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  data-oid="k26tqkb"
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
                  data-oid="rxni76k"
                />
              </div>

              <div data-oid="sdhz61e">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  data-oid="5nkr7_h"
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
                  data-oid="_4mhj05"
                />

                <p
                  className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                  data-oid="ypxkbm7"
                >
                  En az 8 karakter, bir büyük harf ve bir rakam içermelidir.
                </p>
              </div>

              <div data-oid="m5rbd2z">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  data-oid="mj5ynq:"
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
                  data-oid="p3u4idx"
                />
              </div>

              {errorMessage && (
                <div
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400"
                  data-oid="jyt-zn4"
                >
                  {errorMessage}
                </div>
              )}

              <div className="pt-3" data-oid="7xi:eg-">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium flex justify-center items-center"
                  data-oid="sh6q-t6"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        data-oid="uu9opiz"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          data-oid="hny35nr"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          data-oid="w2-m4z6"
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
            data-oid="9ndz3lp"
          >
            <p data-oid="sgmie7f">
              Şifrenizi mi unuttunuz?{" "}
              <Link
                href="/forgot-password"
                className="text-secondary hover:text-secondary-dark font-medium"
                data-oid="cptjj.2"
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
