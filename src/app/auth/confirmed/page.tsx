"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";

export default function EmailConfirmedPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { showToast } = useToast();
  const { showNotification } = useNotification();

  useEffect(() => {
    // Başarılı doğrulama bildirimi göster
    showToast("E-posta adresiniz başarıyla doğrulandı!", "success");
    showNotification("Hesabınız artık aktif. Giriş yapabilirsiniz.", "success");

    // Kullanıcı profilini kontrol et ve güncelle
    const updateProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Profili güncelle
          await supabase
            .from("profiles")
            .update({
              is_email_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
        }
      } catch (error) {
        console.error("Profil güncelleme hatası:", error);
      }
    };

    updateProfile();
  }, [showToast, showNotification, supabase]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8"
      data-oid="8hu2c0r"
    >
      <div
        className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-2xl text-center"
        data-oid="3m1e6rv"
      >
        <div data-oid="6lj9.kx">
          <div
            className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center"
            data-oid="mlr-7d5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              data-oid="x045g45"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
                data-oid=":-ex2.h"
              />
            </svg>
          </div>
          <h2
            className="mt-6 text-center text-3xl font-extrabold text-white"
            data-oid="yppxnk3"
          >
            E-posta Doğrulandı!
          </h2>
          <p className="mt-2 text-gray-300" data-oid="-hme6tt">
            Hesabınız başarıyla doğrulandı. Artık tüm hizmetlerimizden
            yararlanabilirsiniz.
          </p>
        </div>

        <div className="mt-8 space-y-4" data-oid="agglq-d">
          <button
            onClick={() => router.push("/login")}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            data-oid="9le1_e."
          >
            Giriş Yap
          </button>

          <Link
            href="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-600 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            data-oid="t8s6j2m"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
