"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";

export default function AdminSettingsPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [formData, setFormData] = useState({
    site_name: "",
    site_description: "",
    contact_email: "",
    contact_phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push("/login");
          return;
        }
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
        if (profileError || !profile || !profile.is_admin) {
          router.push("/");
          return;
        }
        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("id", "site_info")
          .single();
        if (error) throw error;
        if (data && data.value) {
          setFormData(prev => ({ ...prev, ...data.value }));
        }
      } catch (e) {
        console.error("Error loading settings:", e);
        setError("Ayarlar yüklenirken hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [supabase, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("settings")
        .update({ value: formData })
        .eq("id", "site_info");
      if (error) throw error;
      setSuccess(true);
    } catch (e) {
      console.error("Error saving settings:", e);
      setError("Ayarlar kaydedilirken hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md dark:bg-dark p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Site Ayarları</h1>
          <button
            type="submit"
            form="settings-form"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
        {success && <p className="text-green-600 mb-4">Ayarlar güncellendi.</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form id="settings-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Site Başlığı
            </label>
            <input
              type="text"
              id="site_name"
              name="site_name"
              value={formData.site_name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="site_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Site Açıklaması
            </label>
            <textarea
              id="site_description"
              name="site_description"
              rows={3}
              value={formData.site_description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              İletişim Emaili
            </label>
            <input
              type="email"
              id="contact_email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              İletişim Telefonu
            </label>
            <input
              type="text"
              id="contact_phone"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adres
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
