"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";
import RequireAuth from "@/components/auth/RequireAuth";

type Address = {
  id: string;
  user_id: string;
  title: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  address_type: "shipping" | "billing";
  created_at: string;
};

export default function Addresses() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    full_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "TR",
    phone: "",
    address_type: "shipping",
    is_default: false,
  });

  const supabase = createClientComponentClient();
  const { showToast } = useToast();
  const { showNotification } = useNotification();

  // Load user's addresses
  const loadAddresses = async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Kullanıcı bilgileri alınamadı");
      }

      const { data: addressData, error: addressError } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (addressError) {
        throw addressError;
      }

      setAddresses(addressData || []);
    } catch (error: any) {
      console.error("Error loading addresses:", error);
      showNotification("Adresler yüklenirken bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      full_name: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "TR",
      phone: "",
      address_type: "shipping",
      is_default: false,
    });
  };

  const handleAddressEdit = (address: Address) => {
    setIsEditing(address.id);
    setIsAdding(false);
    setFormData({
      title: address.title,
      full_name: address.full_name,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      state: address.state || "",
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || "",
      address_type: address.address_type,
      is_default: address.is_default,
    });
  };

  const handleAddressDelete = async (id: string) => {
    if (!confirm("Bu adresi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const { error } = await supabase.from("addresses").delete().eq("id", id);

      if (error) throw error;

      showToast("Adres başarıyla silindi", "success");
      loadAddresses();
    } catch (error: any) {
      console.error("Error deleting address:", error);
      showNotification("Adres silinirken bir hata oluştu", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Kullanıcı bilgileri alınamadı");
      }

      const addressData = {
        user_id: user.id,
        title: formData.title,
        full_name: formData.full_name,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2 || null,
        city: formData.city,
        state: formData.state || null,
        postal_code: formData.postal_code,
        country: formData.country,
        phone: formData.phone || null,
        address_type: formData.address_type as "shipping" | "billing",
        is_default: formData.is_default,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        // Update existing address
        const { error } = await supabase
          .from("addresses")
          .update(addressData)
          .eq("id", isEditing);

        if (error) throw error;

        showToast("Adres başarıyla güncellendi", "success");
      } else {
        // Create new address
        const { error } = await supabase.from("addresses").insert({
          ...addressData,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;

        showToast("Yeni adres başarıyla eklendi", "success");
      }

      // Reset form and reload addresses
      resetForm();
      setIsEditing(null);
      setIsAdding(false);
      loadAddresses();
    } catch (error: any) {
      console.error("Error saving address:", error);
      showNotification("Adres kaydedilirken bir hata oluştu", "error");
    }
  };

  const cancelEdit = () => {
    resetForm();
    setIsEditing(null);
    setIsAdding(false);
  };

  return (
    <RequireAuth data-oid="b89jufz">
      <div className="container mx-auto px-4 py-8" data-oid="f2jz077">
        <div className="max-w-4xl mx-auto" data-oid=":28emyw">
          <div className="mb-6" data-oid="q_psi95">
            <Link
              href="/account"
              className="inline-flex items-center text-sm text-secondary hover:text-secondary-dark"
              data-oid="m040ah4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="rjuj_j5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                  data-oid="_5kuy9f"
                />
              </svg>
              Hesap Sayfasına Dön
            </Link>
            <h1
              className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2"
              data-oid="652_jm_"
            >
              Adreslerim
            </h1>
            <p
              className="text-gray-600 dark:text-gray-300 mt-1"
              data-oid="4tbs7:4"
            >
              Teslimat ve fatura adreslerinizi yönetin.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8" data-oid="bwr-y2q">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"
                data-oid="if6c-j9"
              ></div>
            </div>
          ) : (
            <>
              {/* Add Address Button */}
              {!isAdding && !isEditing && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="mb-4 inline-flex items-center px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                  data-oid="ub2faoc"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    data-oid="kxhaa:z"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                      data-oid="r:rj-ez"
                    />
                  </svg>
                  Yeni Adres Ekle
                </button>
              )}

              {/* Address Form */}
              {(isAdding || isEditing) && (
                <div
                  className="bg-white dark:bg-dark-light rounded-xl shadow-sm overflow-hidden mb-6"
                  data-oid="valswuy"
                >
                  <div className="p-6" data-oid="heikb2:">
                    <h2
                      className="text-xl font-bold text-gray-800 dark:text-white mb-4"
                      data-oid="4thqt1i"
                    >
                      {isEditing ? "Adres Düzenle" : "Yeni Adres Ekle"}
                    </h2>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-4"
                      data-oid="._myrfa"
                    >
                      <div data-oid="3suwa-g">
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          data-oid="-.3fby8"
                        >
                          Adres Başlığı
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                          placeholder="Örn: Ev, İş"
                          required
                          data-oid="ez1gi6i"
                        />
                      </div>

                      <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        data-oid="sx4t6gs"
                      >
                        <div data-oid="mk6a7j_">
                          <label
                            htmlFor="full_name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="jk28t5f"
                          >
                            Ad Soyad
                          </label>
                          <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                            data-oid="5cyu9pn"
                          />
                        </div>

                        <div data-oid="15fqwcf">
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="el1:nrl"
                          >
                            Telefon
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="+90 555 123 4567"
                            data-oid="e5f.jv0"
                          />
                        </div>
                      </div>

                      <div data-oid="x8bza1:">
                        <label
                          htmlFor="address_line1"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          data-oid="96xy9p8"
                        >
                          Adres Satırı 1
                        </label>
                        <textarea
                          id="address_line1"
                          name="address_line1"
                          value={formData.address_line1}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                          rows={2}
                          required
                          data-oid="w9n-sq_"
                        />
                      </div>

                      <div data-oid="qcalh-4">
                        <label
                          htmlFor="address_line2"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          data-oid="gydqimb"
                        >
                          Adres Satırı 2 (İsteğe Bağlı)
                        </label>
                        <textarea
                          id="address_line2"
                          name="address_line2"
                          value={formData.address_line2}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                          rows={1}
                          data-oid="gtozpi:"
                        />
                      </div>

                      <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        data-oid="cr37z15"
                      >
                        <div className="col-span-2" data-oid="tb1aimw">
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="j-c7jy-"
                          >
                            İl
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                            data-oid="41-wn53"
                          />
                        </div>

                        <div className="col-span-2" data-oid="9t3f91u">
                          <label
                            htmlFor="state"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="nwk.ob0"
                          >
                            İlçe
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            data-oid="9txduas"
                          />
                        </div>
                      </div>

                      <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        data-oid="9wdamhu"
                      >
                        <div className="col-span-2" data-oid="j8a.642">
                          <label
                            htmlFor="postal_code"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="ed0hqad"
                          >
                            Posta Kodu
                          </label>
                          <input
                            type="text"
                            id="postal_code"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                            data-oid="g6223wo"
                          />
                        </div>

                        <div className="col-span-2" data-oid="0rzafzl">
                          <label
                            htmlFor="country"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="2qa--ro"
                          >
                            Ülke
                          </label>
                          <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                            data-oid="kc49_w3"
                          >
                            <option value="TR" data-oid="a:ep559">
                              Türkiye
                            </option>
                            <option value="DE" data-oid="clc7gr2">
                              Almanya
                            </option>
                            <option value="US" data-oid="mhqd2zr">
                              Amerika Birleşik Devletleri
                            </option>
                            <option value="GB" data-oid="sg43:uy">
                              Birleşik Krallık
                            </option>
                            <option value="FR" data-oid="pjt:0tx">
                              Fransa
                            </option>
                          </select>
                        </div>
                      </div>

                      <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        data-oid="xplbzq4"
                      >
                        <div data-oid="3r24k91">
                          <label
                            htmlFor="address_type"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid=".-c.2v7"
                          >
                            Adres Türü
                          </label>
                          <select
                            id="address_type"
                            name="address_type"
                            value={formData.address_type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            data-oid="71rvmm:"
                          >
                            <option value="shipping" data-oid="1nqbh6c">
                              Teslimat Adresi
                            </option>
                            <option value="billing" data-oid="vn:crkp">
                              Fatura Adresi
                            </option>
                          </select>
                        </div>

                        <div
                          className="flex items-center mt-8"
                          data-oid="dt.3_1a"
                        >
                          <input
                            type="checkbox"
                            id="is_default"
                            name="is_default"
                            checked={formData.is_default}
                            onChange={handleChange}
                            className="h-4 w-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                            data-oid="on309f3"
                          />

                          <label
                            htmlFor="is_default"
                            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            data-oid="7muljjd"
                          >
                            Varsayılan adres olarak ayarla
                          </label>
                        </div>
                      </div>

                      <div className="pt-4 flex space-x-3" data-oid=".mddsa6">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                          data-oid="fw6a4p9"
                        >
                          {isEditing ? "Güncelle" : "Kaydet"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-2 border border-gray-300 dark:border-dark-lighter text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-lighter rounded-lg transition-colors"
                          data-oid="8eo7i05"
                        >
                          İptal
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Address List */}
              {!addresses.length && !isAdding && !isEditing ? (
                <div
                  className="bg-white dark:bg-dark-light rounded-xl shadow-sm overflow-hidden p-8 text-center"
                  data-oid="ii5t6jx"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    data-oid="c1i2zce"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      data-oid="9_6oxdl"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      data-oid="385y0nw"
                    />
                  </svg>
                  <h3
                    className="mt-2 text-lg font-medium text-gray-900 dark:text-white"
                    data-oid="6xav9tt"
                  >
                    Henüz adres eklenmemiş
                  </h3>
                  <p
                    className="mt-1 text-gray-500 dark:text-gray-400"
                    data-oid="ftyu3d3"
                  >
                    Adres ekleyerek siparişlerinizi hızlıca tamamlayabilirsiniz.
                  </p>
                </div>
              ) : (
                <>
                  {!isAdding &&
                    !isEditing &&
                    addresses.map((address) => (
                      <div
                        key={address.id}
                        className="bg-white dark:bg-dark-light rounded-xl shadow-sm overflow-hidden mb-4"
                        data-oid="195fm57"
                      >
                        <div className="p-6" data-oid="i_.vp2k">
                          <div
                            className="flex items-start justify-between"
                            data-oid="9ui_f:4"
                          >
                            <div data-oid="m3kc3ax">
                              <div
                                className="flex items-center"
                                data-oid="bil9j_2"
                              >
                                <h3
                                  className="text-lg font-semibold text-gray-800 dark:text-white"
                                  data-oid="k0-4g4q"
                                >
                                  {address.title}
                                </h3>
                                {address.is_default && (
                                  <span
                                    className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500"
                                    data-oid="88ix9_0"
                                  >
                                    Varsayılan
                                  </span>
                                )}
                                <span
                                  className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500"
                                  data-oid="iuun9g0"
                                >
                                  {address.address_type === "shipping"
                                    ? "Teslimat"
                                    : "Fatura"}
                                </span>
                              </div>
                              <p
                                className="mt-1 text-gray-900 dark:text-gray-100 font-medium"
                                data-oid="n_xyc4e"
                              >
                                {address.full_name}
                              </p>
                              <p
                                className="mt-1 text-gray-600 dark:text-gray-300"
                                data-oid="o4.3-st"
                              >
                                {address.address_line1}
                                {address.address_line2 && (
                                  <>
                                    <br data-oid="u-r2k4o" />
                                    {address.address_line2}
                                  </>
                                )}
                              </p>
                              <p
                                className="text-gray-600 dark:text-gray-300"
                                data-oid="45:peza"
                              >
                                {address.state && `${address.state}, `}
                                {address.city}, {address.postal_code}
                              </p>
                              <p
                                className="text-gray-600 dark:text-gray-300"
                                data-oid="vxyv2-i"
                              >
                                {address.country === "TR"
                                  ? "Türkiye"
                                  : address.country}
                              </p>
                              {address.phone && (
                                <p
                                  className="mt-1 text-gray-600 dark:text-gray-300"
                                  data-oid=":f0s.ba"
                                >
                                  {address.phone}
                                </p>
                              )}
                            </div>

                            <div className="flex space-x-2" data-oid="tzuoupm">
                              <button
                                onClick={() => handleAddressEdit(address)}
                                className="text-secondary hover:text-secondary-dark p-1"
                                aria-label="Edit address"
                                data-oid="zowgwa0"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  data-oid="a0mjiei"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    data-oid="idj56yr"
                                  />
                                </svg>
                              </button>

                              <button
                                onClick={() => handleAddressDelete(address.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                aria-label="Delete address"
                                data-oid="twa370u"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  data-oid="x:_kz4o"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    data-oid="tiwgqj1"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
