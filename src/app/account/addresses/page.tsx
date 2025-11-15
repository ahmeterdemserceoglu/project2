"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

type Address = {
  id: string;
  user_id: string;
  title: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  neighborhood?: string;
  area_type?: "neighborhood" | "village" | "town";
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  address_type: "shipping" | "billing" | "both";
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
    address_line1: "", // Sokak, Cadde, Bina No
    address_line2: "", // Daire, Kat (isteğe bağlı)
    city: "", // İl
    state: "", // İlçe  
    neighborhood: "", // Mahalle/Köy/Kasaba
    area_type: "neighborhood", // Seçilen alan türü
    postal_code: "",
    country: "TR",
    phone: "",
    address_type: "shipping",
    is_default: false,
  });

  // Türkiye API için state'ler
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);
  const [towns, setTowns] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [selectedAreaType, setSelectedAreaType] = useState<'neighborhood' | 'village' | 'town'>('neighborhood');

  // Use global supabase client
  const { showToast } = useToast();
  const { showNotification } = useNotification();
  const { user, isAuthenticated, loading, session } = useAuth();

  // Türkiye API fonksiyonları
  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const response = await fetch('https://turkiyeapi.dev/api/v1/provinces');
      const data = await response.json();

      if (data.status === 'OK') {
        setCities(data.data);
      }
    } catch (error) {
      showToast('Şehirler yüklenemedi', 'error');
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchDistricts = async (cityName: string) => {
    if (!cityName) {
      setDistricts([]);
      return;
    }

    try {
      setLoadingDistricts(true);

      // Türkiye API dokümanına göre districts endpoint'ini kullan
      const response = await fetch(`https://turkiyeapi.dev/api/v1/districts?province=${encodeURIComponent(cityName)}`);
      const data = await response.json();


      if (data.status === 'OK' && data.data) {
        setDistricts(data.data);
      } else {
        // Alternatif: provinces endpoint'inden şehir detayını al
        const provinceResponse = await fetch(`https://turkiyeapi.dev/api/v1/provinces`);
        const provinceData = await provinceResponse.json();

        if (provinceData.status === 'OK') {
          const selectedProvince = provinceData.data.find((province: any) =>
            province.name === cityName || province.name.toLowerCase() === cityName.toLowerCase()
          );

          if (selectedProvince && selectedProvince.districts) {
            setDistricts(selectedProvince.districts);
          } else {
            setDistricts([]);
          }
        }
      }
    } catch (error) {
      showToast('İlçeler yüklenemedi', 'error');
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchNeighborhoods = async (cityName: string, districtName: string) => {
    if (!cityName || !districtName) {
      setNeighborhoods([]);
      return;
    }

    try {
      setLoadingNeighborhoods(true);

      // Türkiye API'sinden mahalle verilerini çek
      const response = await fetch(`https://turkiyeapi.dev/api/v1/neighborhoods?province=${encodeURIComponent(cityName)}&district=${encodeURIComponent(districtName)}`);
      const data = await response.json();


      if (data.status === 'OK' && data.data) {
        setNeighborhoods(data.data);
      } else {
        setNeighborhoods([]);
      }
    } catch (error) {
      showToast('Mahalleler yüklenemedi', 'error');
      setNeighborhoods([]);
    } finally {
      setLoadingNeighborhoods(false);
    }
  };

  const fetchVillages = async (cityName: string, districtName: string) => {
    if (!cityName || !districtName) {
      setVillages([]);
      return;
    }

    try {
      const response = await fetch(`https://turkiyeapi.dev/api/v1/villages?province=${encodeURIComponent(cityName)}&district=${encodeURIComponent(districtName)}`);
      const data = await response.json();

      if (data.status === 'OK' && data.data) {
        setVillages(data.data);
      } else {
        setVillages([]);
      }
    } catch (error) {
      setVillages([]);
    }
  };

  const fetchTowns = async (cityName: string, districtName: string) => {
    if (!cityName || !districtName) {
      setTowns([]);
      return;
    }

    try {
      const response = await fetch(`https://turkiyeapi.dev/api/v1/towns?province=${encodeURIComponent(cityName)}&district=${encodeURIComponent(districtName)}`);
      const data = await response.json();

      if (data.status === 'OK' && data.data) {
        setTowns(data.data);
      } else {
        setTowns([]);
      }
    } catch (error) {
      setTowns([]);
    }
  };

  // Seçilen alan türüne göre verileri yükle
  const fetchAreaData = async (cityName: string, districtName: string, areaType: string) => {
    switch (areaType) {
      case 'neighborhood':
        await fetchNeighborhoods(cityName, districtName);
        break;
      case 'village':
        await fetchVillages(cityName, districtName);
        break;
      case 'town':
        await fetchTowns(cityName, districtName);
        break;
    }
  };

  // Load user's addresses
  const loadAddresses = async () => {
    try {
      setIsLoading(true);

      if (!user?.id) {
        throw new Error("Kullanıcı bilgileri alınamadı");
      }

      const response = await fetch(`/api/addresses?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Adresler alınamadı');
      }

      const addressData = await response.json();
      setAddresses(addressData || []);
    } catch (error: any) {
      showNotification(error.message || "Adresler yüklenirken bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user && isAuthenticated) {
      loadAddresses();
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, loading]);

  // Şehirleri yükle
  useEffect(() => {
    fetchCities();
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

    // Şehir değiştiğinde ilçeleri yükle ve state'i sıfırla
    if (name === 'city') {
      setFormData((prev) => ({
        ...prev,
        state: "", // İlçeyi sıfırla
        neighborhood: "", // Mahalleyi sıfırla
      }));
      setDistricts([]);
      setNeighborhoods([]);
      fetchDistricts(value);
    }

    // İlçe değiştiğinde alan verilerini yükle
    if (name === 'state') {
      setFormData((prev) => ({
        ...prev,
        neighborhood: "", // Alanı sıfırla
      }));
      setNeighborhoods([]);
      setVillages([]);
      setTowns([]);
      if (value && formData.city) {
        fetchAreaData(formData.city, value, formData.area_type);
      }
    }

    // Alan türü değiştiğinde verileri yeniden yükle
    if (name === 'area_type') {
      setFormData((prev) => ({
        ...prev,
        neighborhood: "", // Alanı sıfırla
      }));
      if (formData.city && formData.state) {
        fetchAreaData(formData.city, formData.state, value);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      full_name: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      neighborhood: "",
      area_type: "neighborhood",
      postal_code: "",
      country: "TR",
      phone: "",
      address_type: "shipping",
      is_default: false,
    });
    setDistricts([]);
    setNeighborhoods([]);
    setVillages([]);
    setTowns([]);
  };

  const handleAddressEdit = (address: Address) => {
    setIsEditing(address.id);
    setIsAdding(false);

    setFormData({
      title: address.title || "",
      full_name: address.full_name || "",
      address_line1: address.address_line1 || "",
      address_line2: address.address_line2 || "",
      city: address.city || "",
      state: address.state || "",
      neighborhood: address.neighborhood || "",
      area_type: address.area_type || "neighborhood",
      postal_code: address.postal_code || "",
      country: address.country || "TR",
      phone: address.phone || "",
      address_type: address.address_type || "shipping",
      is_default: address.is_default || false,
    });

    // Edit sırasında şehir varsa ilçeleri yükle
    if (address.city) {
      fetchDistricts(address.city);

      // İlçe de varsa alan verilerini yükle
      if (address.state) {
        setTimeout(() => {
          fetchAreaData(address.city, address.state, "neighborhood");
        }, 500); // İlçeler yüklendikten sonra alan verilerini yükle
      }
    }
  };

  const handleAddressDelete = async (id: string) => {
    if (!confirm("Bu adresi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/addresses?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Özel hata kodlarını kontrol et
        if (errorData.code === 'ADDRESS_IN_USE') {
          showToast(errorData.error, "error");
          return;
        }

        throw new Error(errorData.error || 'Adres silinirken bir hata oluştu');
      }

      showToast("Adres başarıyla silindi", "success");
      loadAddresses();
    } catch (error: any) {
      showToast(error.message || "Adres silinirken bir hata oluştu", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!user?.id) {
        throw new Error("Kullanıcı bilgileri alınamadı");
      }

      // Artık "both" seçeneği de tek adres olarak kaydediliyor
      if (false) { // Bu blok artık kullanılmıyor
        // Önce teslimat adresi
        const shippingResponse = await fetch('/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            user_id: user.id,
            title: `${formData.title} (Teslimat)`,
            full_name: formData.full_name,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2 || null,
            city: formData.city,
            state: formData.state || null,
            neighborhood: formData.neighborhood || null,
            area_type: formData.area_type || null,
            postal_code: formData.postal_code,
            country: formData.country,
            phone: formData.phone || null,
            address_type: "shipping",
            is_default: formData.is_default
          })
        });

        if (!shippingResponse.ok) {
          const errorData = await shippingResponse.json();
          throw new Error(errorData.message || 'Teslimat adresi kaydedilirken bir hata oluştu');
        }

        // Sonra fatura adresi
        const billingResponse = await fetch('/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            user_id: user.id,
            title: `${formData.title} (Fatura)`,
            full_name: formData.full_name,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2 || null,
            city: formData.city,
            state: formData.state || null,
            neighborhood: formData.neighborhood || null,
            area_type: formData.area_type || null,
            postal_code: formData.postal_code,
            country: formData.country,
            phone: formData.phone || null,
            address_type: "billing",
            is_default: false // Sadece teslimat adresi default olabilir
          })
        });

        if (!billingResponse.ok) {
          const errorData = await billingResponse.json();
          throw new Error(errorData.message || 'Fatura adresi kaydedilirken bir hata oluştu');
        }

        showToast("Teslimat ve fatura adresleri başarıyla eklendi", "success");
      } else {
        // Normal tek adres kaydetme/güncelleme
        const response = await fetch('/api/addresses', {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            id: isEditing || undefined,
            user_id: user.id,
            title: formData.title,
            full_name: formData.full_name,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2 || null,
            city: formData.city,
            state: formData.state || null,
            neighborhood: formData.neighborhood || null,
            area_type: formData.area_type || null,
            postal_code: formData.postal_code,
            country: formData.country,
            phone: formData.phone || null,
            address_type: formData.address_type,
            is_default: formData.is_default
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Adres kaydedilirken bir hata oluştu');
        }

        showToast(isEditing ? "Adres başarıyla güncellendi" : "Yeni adres başarıyla eklendi", "success");
      }

      resetForm();
      setIsEditing(null);
      setIsAdding(false);
      loadAddresses();
    } catch (error: any) {
      showNotification(error.message || "Adres kaydedilirken bir hata oluştu", "error");
    }
  };

  const cancelEdit = () => {
    resetForm();
    setIsEditing(null);
    setIsAdding(false);
  };

  return (
    <RequireAuth data-oid="f7jk9t3">
      <div className="container mx-auto px-4 py-8" data-oid="kx7fs1s">
        <div className="max-w-4xl mx-auto" data-oid="jqwmk0u">
          <div className="mb-6" data-oid="t0:qbhh">
            <Link
              href="/account"
              className="inline-flex items-center text-sm text-secondary hover:text-secondary-dark"
              data-oid="n_2l78t"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="x3aqimm"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                  data-oid="qzx-:ed"
                />
              </svg>
              Hesap Sayfasına Dön
            </Link>
            <h1
              className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2"
              data-oid="rltz95w"
            >
              Adreslerim
            </h1>
            <p
              className="text-gray-600 dark:text-gray-300 mt-1"
              data-oid="ykm_n69"
            >
              Teslimat ve fatura adreslerinizi yönetin.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8" data-oid="sh_o2:0">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"
                data-oid="wbbrro5"
              ></div>
            </div>
          ) : (
            <>
              {/* Add Address Button */}
              {!isAdding && !isEditing && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="mb-4 inline-flex items-center px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                  data-oid="9wl_2rq"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    data-oid="z4qrmaf"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                      data-oid="ovmizzj"
                    />
                  </svg>
                  Yeni Adres Ekle
                </button>
              )}

              {/* Address Form */}
              {(isAdding || isEditing) && (
                <div
                  className="bg-white dark:bg-dark-light rounded-xl shadow-sm overflow-hidden mb-6"
                  data-oid="l-9-ybq"
                >
                  <div className="p-6" data-oid="q42u4os">
                    <h2
                      className="text-xl font-bold text-gray-800 dark:text-white mb-4"
                      data-oid="kgcjhat"
                    >
                      {isEditing ? "Adres Düzenle" : "Yeni Adres Ekle"}
                    </h2>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-4"
                      data-oid="i1p7ek-"
                    >
                      <div data-oid="--fs9f.">
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          data-oid="me.j1c7"
                        >
                          Adres Başlığı <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                          placeholder="Örn: Ev, İş"
                          required
                          data-oid="9yqmglw"
                        />
                      </div>

                      <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        data-oid=".okl.m2"
                      >
                        <div data-oid="skvirjm">
                          <label
                            htmlFor="full_name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="-:4_wlb"
                          >
                            Ad Soyad <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                            data-oid="7ggnbtr"
                          />
                        </div>

                        <div data-oid="elbb70s">
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="ir3xk10"
                          >
                            Telefon <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="+90 555 123 4567"
                            required
                            data-oid="j7ysynj"
                          />
                        </div>
                      </div>

                      <div data-oid="_lr8r3_">
                        <label
                          htmlFor="address_line1"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          data-oid="qlv8roz"
                        >
                          Sokak/Cadde, Bina No <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="address_line1"
                          name="address_line1"
                          value={formData.address_line1 || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                          rows={2}
                          required
                          data-oid="f8-5xkh"
                        />
                      </div>

                      <div data-oid="lx_vno_">
                        <label
                          htmlFor="address_line2"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          data-oid="4xw-329"
                        >
                          Adres Satırı 2 (İsteğe Bağlı)
                        </label>
                        <textarea
                          id="address_line2"
                          name="address_line2"
                          value={formData.address_line2 || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                          rows={1}
                          data-oid="cgtvb._"
                        />
                      </div>

                      <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        data-oid="qgefz.i"
                      >
                        <div className="col-span-2" data-oid="ck9:y:a">
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="s42iopm"
                          >
                            İl <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="city"
                            name="city"
                            value={formData.city || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                            disabled={loadingCities}
                            data-oid="1q.r6zg"
                          >
                            <option value="">
                              {loadingCities ? "Şehirler yükleniyor..." : "Şehir seçiniz"}
                            </option>
                            {cities.map((city) => (
                              <option key={city.id} value={city.name}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2" data-oid="fz8ld5h">
                          <label
                            htmlFor="state"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="pcyy04o"
                          >
                            İlçe <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="state"
                            name="state"
                            value={formData.state || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                            disabled={loadingDistricts || !formData.city}
                            data-oid="qat_zp."
                          >
                            <option value="">
                              {!formData.city
                                ? "Önce şehir seçiniz"
                                : loadingDistricts
                                  ? "İlçeler yükleniyor..."
                                  : "İlçe seçiniz"}
                            </option>
                            {districts.map((district) => (
                              <option key={district.id} value={district.name}>
                                {district.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Alan Türü Seçimi */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="area_type"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Alan Türü <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="area_type"
                            name="area_type"
                            value={formData.area_type || "neighborhood"}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                          >
                            <option value="neighborhood">Mahalle</option>
                            <option value="village">Köy</option>
                            <option value="town">Kasaba</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="neighborhood"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            {formData.area_type === 'neighborhood' ? 'Mahalle' :
                              formData.area_type === 'village' ? 'Köy' : 'Kasaba'} <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="neighborhood"
                            name="neighborhood"
                            value={formData.neighborhood || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                            disabled={loadingNeighborhoods || !formData.state}
                          >
                            <option value="">
                              {!formData.state
                                ? "Önce ilçe seçiniz"
                                : loadingNeighborhoods
                                  ? `${formData.area_type === 'neighborhood' ? 'Mahalleler' :
                                    formData.area_type === 'village' ? 'Köyler' : 'Kasabalar'} yükleniyor...`
                                  : `${formData.area_type === 'neighborhood' ? 'Mahalle' :
                                    formData.area_type === 'village' ? 'Köy' : 'Kasaba'} seçiniz`}
                            </option>
                            {formData.area_type === 'neighborhood' && neighborhoods.map((item) => (
                              <option key={item.id} value={item.name}>
                                {item.name}
                              </option>
                            ))}
                            {formData.area_type === 'village' && villages.map((item) => (
                              <option key={item.id} value={item.name}>
                                {item.name}
                              </option>
                            ))}
                            {formData.area_type === 'town' && towns.map((item) => (
                              <option key={item.id} value={item.name}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        data-oid="6s2h18."
                      >
                        <div className="col-span-2" data-oid="6rlhzli">
                          <label
                            htmlFor="postal_code"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="u07orij"
                          >
                            Posta Kodu <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="postal_code"
                            name="postal_code"
                            value={formData.postal_code || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                            data-oid="qzc4879"
                          />
                        </div>

                        <div className="col-span-2" data-oid="i9srwsv">
                          <label
                            htmlFor="country"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="498-5_b"
                          >
                            Ülke
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value="Türkiye"
                            readOnly
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-gray-100 dark:bg-dark-lighter dark:text-white bg-gray-100 cursor-not-allowed"
                            data-oid="5gi:rtu"
                          />
                        </div>
                      </div>

                      <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        data-oid="h07bs8-"
                      >
                        <div data-oid="3z.976l">
                          <label
                            htmlFor="address_type"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            data-oid="02ww5sa"
                          >
                            Adres Türü
                          </label>
                          <select
                            id="address_type"
                            name="address_type"
                            value={formData.address_type || "shipping"}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-lighter dark:bg-dark-light dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                            data-oid="rc5fn9r"
                          >
                            <option value="shipping" data-oid="xpkk16h">
                              Teslimat Adresi
                            </option>
                            <option value="billing" data-oid="v.bmyr_">
                              Fatura Adresi
                            </option>
                            <option value="both" data-oid="both_addr">
                              Her İkisi (Teslimat + Fatura)
                            </option>
                          </select>
                        </div>

                        <div
                          className="flex items-center mt-8"
                          data-oid="qre--qh"
                        >
                          <input
                            type="checkbox"
                            id="is_default"
                            name="is_default"
                            checked={formData.is_default}
                            onChange={handleChange}
                            className="h-4 w-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                            data-oid="thj6-ph"
                          />

                          <label
                            htmlFor="is_default"
                            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            data-oid=".8v8dnq"
                          >
                            Varsayılan adres olarak ayarla
                          </label>
                        </div>
                      </div>

                      <div className="pt-4 flex space-x-3" data-oid="cp82kks">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                          data-oid="36uwhre"
                        >
                          {isEditing ? "Güncelle" : "Kaydet"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-2 border border-gray-300 dark:border-dark-lighter text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-lighter rounded-lg transition-colors"
                          data-oid="uou23_:"
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
                  data-oid="z_ptw2q"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    data-oid="3yd9aqg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      data-oid="3bwj6ge"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      data-oid="06celto"
                    />
                  </svg>
                  <h3
                    className="mt-2 text-lg font-medium text-gray-900 dark:text-white"
                    data-oid="sdwu259"
                  >
                    Henüz adres eklenmemiş
                  </h3>
                  <p
                    className="mt-1 text-gray-500 dark:text-gray-400"
                    data-oid="6416wnm"
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
                        data-oid="itxru2j"
                      >
                        <div className="p-6" data-oid="gx58z:-">
                          <div
                            className="flex items-start justify-between"
                            data-oid="2f_0dj-"
                          >
                            <div data-oid="uigkxc.">
                              <div
                                className="flex items-center"
                                data-oid=":00j:n0"
                              >
                                <h3
                                  className="text-lg font-semibold text-gray-800 dark:text-white"
                                  data-oid="7pu.-h6"
                                >
                                  {address.title}
                                </h3>
                                {address.is_default && (
                                  <span
                                    className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500"
                                    data-oid="91xstzh"
                                  >
                                    Varsayılan
                                  </span>
                                )}
                                {address.address_type === "both" ? (
                                  <>
                                    <span
                                      className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500"
                                      data-oid="0n6c2i-"
                                    >
                                      Teslimat
                                    </span>
                                    <span
                                      className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500"
                                      data-oid="billing-badge"
                                    >
                                      Fatura
                                    </span>
                                  </>
                                ) : (
                                  <span
                                    className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500"
                                    data-oid="0n6c2i-"
                                  >
                                    {address.address_type === "shipping"
                                      ? "Teslimat"
                                      : "Fatura"}
                                  </span>
                                )}
                              </div>
                              <p
                                className="mt-1 text-gray-900 dark:text-gray-100 font-medium"
                                data-oid=":szm1w1"
                              >
                                {address.full_name}
                              </p>
                              <p
                                className="mt-1 text-gray-600 dark:text-gray-300"
                                data-oid="7ayf.q:"
                              >
                                {address.address_line1}
                                {address.address_line2 && (
                                  <>
                                    <br data-oid="ezb5bk3" />
                                    {address.address_line2}
                                  </>
                                )}
                              </p>
                              <p
                                className="text-gray-600 dark:text-gray-300"
                                data-oid="0bj3.ah"
                              >
                                {address.neighborhood && `${address.neighborhood}, `}
                                {address.state && `${address.state}, `}
                                {address.city}, {address.postal_code}
                              </p>
                              <p
                                className="text-gray-600 dark:text-gray-300"
                                data-oid="57d7tui"
                              >
                                {address.country === "TR"
                                  ? "Türkiye"
                                  : address.country}
                              </p>
                              {address.phone && (
                                <p
                                  className="mt-1 text-gray-600 dark:text-gray-300"
                                  data-oid="3mcaoj0"
                                >
                                  {address.phone}
                                </p>
                              )}
                            </div>

                            <div className="flex space-x-2" data-oid=":_n967r">
                              <button
                                onClick={() => handleAddressEdit(address)}
                                className="text-secondary hover:text-secondary-dark p-1"
                                aria-label="Edit address"
                                data-oid="v0.npu_"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  data-oid="z_ytjcv"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    data-oid="u4m4xwi"
                                  />
                                </svg>
                              </button>

                              <button
                                onClick={() => handleAddressDelete(address.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                aria-label="Delete address"
                                data-oid="b9.00na"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  data-oid="dnzks8x"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    data-oid="g.5r714"
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
