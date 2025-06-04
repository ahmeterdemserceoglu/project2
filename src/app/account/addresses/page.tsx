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
    <RequireAuth data-oid="0a82x4x">
      <div className="container mx-auto px-4 py-8" data-oid="ew4kzzm">
        <div className="max-w-4xl mx-auto" data-oid="z93k_hl">
          <div className="mb-6" data-oid="u:54pf2">
            <Link
              href="/account"
              className="inline-flex items-center text-sm text-secondary hover:text-secondary-dark"
              data-oid="eobaseb"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="iro-a9v"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                  data-oid="y4sz0pw"
                />
              </svg>
              Hesap Sayfasına Dön
            </Link>
            <h1
              className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2"
              data-oid="x0bvb1."
            >
              Adreslerim
            </h1>
            <p
              className="text-gray-600 dark:text-gray-300 mt-1"
              data-oid="voo85_s"
            >
              Teslimat ve fatura adreslerinizi yönetin.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8" data-oid="wb8d4cq">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"
                data-oid="oe22js8"
              ></div>
            </div>
          ) : (
            <>
              {/* Add Address Button */}
              {!isAdding && !isEditing && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="mb-4 inline-flex items-center px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                  data-oid="d:klzdh"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    data-oid="p6t_i.2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                      data-oid="e.0vphj"
                    />
                  </svg>
                  Yeni Adres Ekle
                </button>
              )}

              {/* Address Form */}
              {(isAdding || isEditing) && (
                <div
                  className="bg-white dark:bg-dark-light rounded-xl shadow-sm overflow-hidden mb-6"
                  data-oid="qqzxkl1"
                >
                  <div className="p-6" data-oid="or_n_-q">
                    <h2
                      className="text-xl font-bold text-gray-800 dark:text-white mb-4"
                      data-oid="4rcoi5o"
                    >
                      {isEditing ? "Adres Düzenle" : "Yeni Adres Ekle"}
                    </h2>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-4"
                      data-oid="b1tgp12"
                    >
                      <div data-oid="-wdu_2h">
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          data-oid="2eim22w"
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
                          data-oid="iz8nrfv"
                        />
                      </div>

                      <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        data-oid="3nd1:tp"
                      >
                        <div data-oid="ihigd8k">
                          <label
                            htmlFor="full_name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="snw:g9-"
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
                            data-oid="ffd:u6e"
                          />
                        </div>

                        <div data-oid="1titfd2">
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="akv8_qo"
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
                            data-oid="stxt7ua"
                          />
                        </div>
                      </div>

                      <div data-oid="hv1e64q">
                        <label
                          htmlFor="address_line1"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          data-oid="h7jdqj5"
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
                          data-oid="42t0_9r"
                        />
                      </div>

                      <div data-oid="jose004">
                        <label
                          htmlFor="address_line2"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          data-oid="2:gl7iw"
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
                          data-oid="heokrr1"
                        />
                      </div>

                      <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        data-oid="i6o28nm"
                      >
                        <div className="col-span-2" data-oid="z6k_he7">
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="dgdpp9h"
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
                            data-oid="upx7x5f"
                          />
                        </div>

                        <div className="col-span-2" data-oid="0d5b69k">
                          <label
                            htmlFor="state"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="ftjl-n0"
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
                            data-oid="ewsszf3"
                          />
                        </div>
                      </div>

                      <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        data-oid="hp4npue"
                      >
                        <div className="col-span-2" data-oid="kbx3bt5">
                          <label
                            htmlFor="postal_code"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="bywf4bi"
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
                            data-oid="w2g3mt4"
                          />
                        </div>

                        <div className="col-span-2" data-oid="anf4prc">
                          <label
                            htmlFor="country"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="zc54xw5"
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
                            data-oid="slljjjq"
                          >
                            <option value="TR" data-oid="fh:t98x">
                              Türkiye
                            </option>
                            <option value="DE" data-oid="ofcqm-h">
                              Almanya
                            </option>
                            <option value="US" data-oid="hmij-p-">
                              Amerika Birleşik Devletleri
                            </option>
                            <option value="GB" data-oid="v1633wz">
                              Birleşik Krallık
                            </option>
                            <option value="FR" data-oid="cdaj1-d">
                              Fransa
                            </option>
                          </select>
                        </div>
                      </div>

                      <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        data-oid="jxy9rar"
                      >
                        <div data-oid="g8m5a73">
                          <label
                            htmlFor="address_type"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="_oxq4jt"
                          >
                            Adres Türü
                          </label>
                          <select
                            id="address_type"
                            name="address_type"
                            value={formData.address_type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            data-oid="3s7kjnp"
                          >
                            <option value="shipping" data-oid="azfsigs">
                              Teslimat Adresi
                            </option>
                            <option value="billing" data-oid="wx.s6.-">
                              Fatura Adresi
                            </option>
                          </select>
                        </div>

                        <div
                          className="flex items-center mt-8"
                          data-oid="_n86ip0"
                        >
                          <input
                            type="checkbox"
                            id="is_default"
                            name="is_default"
                            checked={formData.is_default}
                            onChange={handleChange}
                            className="h-4 w-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                            data-oid="zyrf96:"
                          />

                          <label
                            htmlFor="is_default"
                            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            data-oid="r-yk4v5"
                          >
                            Varsayılan adres olarak ayarla
                          </label>
                        </div>
                      </div>

                      <div className="pt-4 flex space-x-3" data-oid="t:rm2q0">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                          data-oid="viuqhca"
                        >
                          {isEditing ? "Güncelle" : "Kaydet"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-2 border border-gray-300 dark:border-dark-lighter text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-lighter rounded-lg transition-colors"
                          data-oid="dwpvtv:"
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
                  data-oid="ayaddbx"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    data-oid="ddzoaco"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      data-oid="-23895e"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      data-oid="kh77u1p"
                    />
                  </svg>
                  <h3
                    className="mt-2 text-lg font-medium text-gray-900 dark:text-white"
                    data-oid="71ua__q"
                  >
                    Henüz adres eklenmemiş
                  </h3>
                  <p
                    className="mt-1 text-gray-500 dark:text-gray-400"
                    data-oid="j1ee1x-"
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
                        data-oid="vfn8cq7"
                      >
                        <div className="p-6" data-oid="g85funk">
                          <div
                            className="flex items-start justify-between"
                            data-oid="1:q8lft"
                          >
                            <div data-oid="ne-gtmb">
                              <div
                                className="flex items-center"
                                data-oid="-4akwxu"
                              >
                                <h3
                                  className="text-lg font-semibold text-gray-800 dark:text-white"
                                  data-oid="nlg0hnt"
                                >
                                  {address.title}
                                </h3>
                                {address.is_default && (
                                  <span
                                    className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500"
                                    data-oid="bjd7q9o"
                                  >
                                    Varsayılan
                                  </span>
                                )}
                                <span
                                  className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500"
                                  data-oid="26:5_6:"
                                >
                                  {address.address_type === "shipping"
                                    ? "Teslimat"
                                    : "Fatura"}
                                </span>
                              </div>
                              <p
                                className="mt-1 text-gray-900 dark:text-gray-100 font-medium"
                                data-oid="mgxdz6k"
                              >
                                {address.full_name}
                              </p>
                              <p
                                className="mt-1 text-gray-600 dark:text-gray-300"
                                data-oid="y2nk:tu"
                              >
                                {address.address_line1}
                                {address.address_line2 && (
                                  <>
                                    <br data-oid="j7tu_uc" />
                                    {address.address_line2}
                                  </>
                                )}
                              </p>
                              <p
                                className="text-gray-600 dark:text-gray-300"
                                data-oid="opx-qf_"
                              >
                                {address.state && `${address.state}, `}
                                {address.city}, {address.postal_code}
                              </p>
                              <p
                                className="text-gray-600 dark:text-gray-300"
                                data-oid="hr9u0t1"
                              >
                                {address.country === "TR"
                                  ? "Türkiye"
                                  : address.country}
                              </p>
                              {address.phone && (
                                <p
                                  className="mt-1 text-gray-600 dark:text-gray-300"
                                  data-oid="npna22u"
                                >
                                  {address.phone}
                                </p>
                              )}
                            </div>

                            <div className="flex space-x-2" data-oid="hxeog1c">
                              <button
                                onClick={() => handleAddressEdit(address)}
                                className="text-secondary hover:text-secondary-dark p-1"
                                aria-label="Edit address"
                                data-oid="ato6ms5"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  data-oid="9yt.umj"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    data-oid="h8b_cdp"
                                  />
                                </svg>
                              </button>

                              <button
                                onClick={() => handleAddressDelete(address.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                aria-label="Delete address"
                                data-oid="v.:2u6l"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  data-oid=".jfgwtv"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    data-oid="g:1aqbc"
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
