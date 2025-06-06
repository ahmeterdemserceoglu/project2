"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@/lib/supabase";

interface SiteInfo {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

export default function SettingsPage() {
  const supabase = createClientComponentClient();
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    site_name: "",
    site_description: "",
    contact_email: "",
    contact_phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("id", "site_info")
        .single();
      if (!error && data) {
        setSiteInfo({
          site_name: data.value.site_name || "",
          site_description: data.value.site_description || "",
          contact_email: data.value.contact_email || "",
          contact_phone: data.value.contact_phone || "",
          address: data.value.address || "",
        });
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSiteInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("settings").upsert({ id: "site_info", value: siteInfo });
    setSaving(false);
  };

  if (isLoading) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  return (
    <div className="p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Site Ayarları</h1>
      <div className="space-y-4 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="site_name">Site Adı</label>
          <input
            id="site_name"
            name="site_name"
            value={siteInfo.site_name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="site_description">Açıklama</label>
          <textarea
            id="site_description"
            name="site_description"
            value={siteInfo.site_description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="contact_email">E-posta</label>
          <input
            id="contact_email"
            name="contact_email"
            value={siteInfo.contact_email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="contact_phone">Telefon</label>
          <input
            id="contact_phone"
            name="contact_phone"
            value={siteInfo.contact_phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="address">Adres</label>
          <textarea
            id="address"
            name="address"
            value={siteInfo.address}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
