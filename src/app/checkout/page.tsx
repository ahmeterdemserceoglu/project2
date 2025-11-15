"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import Link from "next/link";
import LegalAgreements from "@/components/legal/LegalAgreements";
import { useAuth } from "@/contexts/AuthContext";

interface Address {
  id: string;
  title: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  neighborhood?: string;
  area_type?: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  address_type: "shipping" | "billing" | "both";
  created_at: string;
}

// Helper function for safe price formatting
const formatPrice = (price?: number | null): string => {
  return price !== undefined && price !== null ? `₺${price.toFixed(2)}` : "₺0.00";
};

const CheckoutPage = () => {
  const { items, totalPrice } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const { user, session, isAuthenticated, loading } = useAuth();
  const [showLegalAgreements, setShowLegalAgreements] = useState(false);
  const [legalAgreementsAccepted, setLegalAgreementsAccepted] = useState(false);

  // Kargo hesaplama fonksiyonu
  const calculateShipping = () => {
    return totalPrice() >= 500 ? 0 : 29.9;
  };

  // Toplam tutar hesaplama fonksiyonu
  const calculateTotal = () => {
    return totalPrice() + calculateShipping();
  };

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  // Legal agreements için order data hazırlama
  const prepareOrderData = () => {
    let shippingAddress;
    if (selectedAddress) {
      const address = addresses.find(addr => addr.id === selectedAddress);
      if (address) {
        shippingAddress = `${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}, ${address.city}, ${address.postal_code}`;
      }
    } else {
      shippingAddress = `${formData.address}, ${formData.city}, ${formData.postalCode}`;
    }

    return {
      buyer: {
        name: selectedAddress
          ? addresses.find(addr => addr.id === selectedAddress)?.full_name || `${formData.firstName} ${formData.lastName}`
          : `${formData.firstName} ${formData.lastName}`,
        address: shippingAddress || '',
        phone: selectedAddress
          ? addresses.find(addr => addr.id === selectedAddress)?.phone || formData.phoneNumber
          : formData.phoneNumber,
        email: formData.email || user?.email || ''
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        description: `${item.name} - Kaliteli ürün`,
        price: item.price,
        quantity: item.quantity,
        features: ['Garantili ürün', 'Hızlı teslimat', 'Kaliteli malzeme']
      })),
      subtotal: totalPrice(),
      shipping: calculateShipping(),
      total: calculateTotal(),
      paymentMethod: 'Kredi Kartı / Banka Kartı',
      orderId: `ORD-${Date.now()}`,
      orderDate: new Date().toLocaleDateString('tr-TR')
    };
  };

  const handleLegalAgreementsComplete = () => {
    setLegalAgreementsAccepted(true);
    setShowLegalAgreements(false);
    // Sadece modal'ı kapat, ödeme işlemi başlatma
  };

  const handleLegalAgreementsCancel = () => {
    setShowLegalAgreements(false);
  };

  const processPayment = async () => {
    setIsLoading(true);

    try {
      // Seçili adres bilgilerini al
      let shippingAddress;
      if (selectedAddress) {
        const address = addresses.find(addr => addr.id === selectedAddress);
        if (address) {
          shippingAddress = {
            title: address.title,
            full_name: address.full_name,
            address_line1: address.address_line1,
            address_line2: address.address_line2,
            city: address.city,
            state: address.state,
            neighborhood: address.neighborhood,
            postal_code: address.postal_code,
            country: address.country,
            phone: address.phone
          };
        }
      } else {
        // Manuel form verilerinden adres oluştur
        shippingAddress = {
          title: `${formData.firstName} ${formData.lastName}`,
          full_name: `${formData.firstName} ${formData.lastName}`,
          address_line1: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          country: 'TR',
          phone: formData.phoneNumber
        };
      }

      if (!shippingAddress) {
        throw new Error('Teslimat adresi bulunamadı');
      }

      // Önce PayTR konfigürasyonunu kontrol et
  
      const configCheckResponse = await fetch('/api/paytr/check-config', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!configCheckResponse.ok) {
        const configError = await configCheckResponse.json();
        
        throw new Error(configError.error || 'Ödeme sistemi kullanılamıyor');
      }

      // PayTR konfigürasyonu geçerli ise sipariş oluştur
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        total_amount: calculateTotal(),
        payment_method: 'paytr',
        notes: null
      };

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(`Sipariş oluşturulamadı: ${errorData.error || 'Bilinmeyen hata'}`);
      }

      const orderResult = await orderResponse.json();
   
      // PayTR ödeme oturumu oluştur
      const paymentData = {
        order_id: orderResult.order.id,
        items: orderData.items,
        shipping_address: shippingAddress,
        total_amount: calculateTotal(),
        user_email: formData.email || user?.email
      };

   

      const paymentResponse = await fetch('/api/paytr/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(paymentData)
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok || paymentResult.error) {
        // PayTR hatası varsa siparişi iptal et
    
        await fetch(`/api/orders/${orderResult.order.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            status: 'cancelled',
            payment_status: 'failed',
            notes: `PayTR hatası: ${paymentResult.error || 'Ödeme sistemi hatası'}`
          })
        });

        throw new Error('Ödeme işlemi başlatılamadı. Sipariş iptal edildi.');
      }

      // PayTR ödeme sayfasına yönlendir
      if (paymentResult.iframe_url) {
        
        window.location.href = paymentResult.iframe_url;
      } else {
        throw new Error('Ödeme sayfası yüklenemedi');
      }

    } catch (error) {
      alert(`${error instanceof Error ? error.message : 'Teknik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'}`);
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveAddress, setSaveAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Adresleri yükle
  const loadAddresses = async () => {
    if (!user?.id || !session?.access_token) {
      return;
    }

    try {
      const response = await fetch(`/api/addresses?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data);

        // Varsayılan adresi seç
        const defaultAddress = data.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
          // Form verilerini doldur
          setFormData({
            firstName: defaultAddress.full_name.split(' ')[0] || '',
            lastName: defaultAddress.full_name.split(' ').slice(1).join(' ') || '',
            email: formData.email,
            address: `${defaultAddress.address_line1}${defaultAddress.address_line2 ? ', ' + defaultAddress.address_line2 : ''}`,
            city: defaultAddress.city,
            postalCode: defaultAddress.postal_code,
            phoneNumber: defaultAddress.phone || '',
          });
        }
      }
    } catch (error) {
      // Hata durumunda sessizce devam et
    }
  };

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      loadAddresses();
    }
  }, [isAuthenticated, user, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      setFormData({
        firstName: address.full_name.split(' ')[0] || '',
        lastName: address.full_name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        address: `${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}`,
        city: address.city,
        postalCode: address.postal_code,
        phoneNumber: address.phone || '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Eğer kayıtlı adres seçilmişse validasyon gerekmiyor
    if (selectedAddress) {
      return true;
    }

    // Manuel form için validasyon
    if (!formData.firstName.trim()) newErrors.firstName = "Ad gereklidir";
    if (!formData.lastName.trim()) newErrors.lastName = "Soyad gereklidir";
    if (!formData.email.trim()) newErrors.email = "E-posta gereklidir";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    if (!formData.address.trim()) newErrors.address = "Adres gereklidir";
    if (!formData.city.trim()) newErrors.city = "Şehir gereklidir";
    if (!formData.postalCode.trim())
      newErrors.postalCode = "Posta kodu gereklidir";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Telefon numarası gereklidir";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Adres kaydetme fonksiyonu
  const saveAddressToAccount = async () => {
    if (!isAuthenticated || !user?.id || !session?.access_token) {
      return false;
    }

    setIsSavingAddress(true);
    try {
      const addressData = {
        user_id: user.id,
        title: `${formData.firstName} ${formData.lastName}`,
        full_name: `${formData.firstName} ${formData.lastName}`,
        address_line1: formData.address,
        address_line2: null,
        city: formData.city,
        state: null,
        neighborhood: null,
        area_type: null,
        postal_code: formData.postalCode,
        country: 'TR',
        phone: formData.phoneNumber,
        address_type: 'both' as const,
        is_default: addresses.length === 0 // İlk adres ise varsayılan yap
      };

      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const newAddress = await response.json();
        setAddresses(prev => [...prev, newAddress]);
        setSelectedAddress(newAddress.id);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Adres kaydedilemedi');
      }
    } catch (error) {
      console.error('Adres kaydetme hatası:', error);
      alert(`Adres kaydetme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      return false;
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Eğer kullanıcı giriş yapmışsa ve adres kaydetmek istiyorsa
    if (isAuthenticated && saveAddress && !selectedAddress) {
      const saved = await saveAddressToAccount();
      if (!saved) {
        return; // Adres kaydedilemezse ödeme işlemini durdur
      }
    }

    // Direkt ödeme işlemini başlat (legal agreements otomatik kabul edilmiş sayılır)
    processPayment();
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-8">Ödeme</h1>
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
          <p className="text-xl mb-6">Sepetinizde ürün bulunmamaktadır</p>
          <Link href="/products" className="btn btn-primary">
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  // Legal agreements gösteriliyorsa
  if (showLegalAgreements) {
    return (
      <LegalAgreements
        orderData={prepareOrderData()}
        onComplete={handleLegalAgreementsComplete}
        onCancel={handleLegalAgreementsCancel}
      />
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Ödeme</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Teslimat Bilgileri</h2>

            {/* Kayıtlı Adresler */}
            {isAuthenticated && addresses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Kayıtlı Adreslerim</h3>
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedAddress === address.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => handleAddressSelect(address.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <input
                              type="radio"
                              name="selectedAddress"
                              value={address.id}
                              checked={selectedAddress === address.id}
                              onChange={() => handleAddressSelect(address.id)}
                              className="mr-2"
                            />
                            <h4 className="font-medium">{address.title}</h4>
                            {address.is_default && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Varsayılan
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{address.full_name}</p>
                          <p className="text-gray-600 text-sm">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {address.neighborhood && `${address.neighborhood}, `}
                            {address.state && `${address.state}, `}
                            {address.city}, {address.postal_code}
                          </p>
                          {address.phone && (
                            <p className="text-gray-600 text-sm">{address.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <Link
                    href="/account/addresses"
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Yeni Adres Ekle
                  </Link>

                  <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-3 text-gray-500 text-sm">veya</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddress(null);
                      setFormData({
                        firstName: "",
                        lastName: "",
                        email: formData.email || user?.email || "",
                        address: "",
                        city: "",
                        postalCode: "",
                        phoneNumber: "",
                      });
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Manuel Adres Gir
                  </button>
                </div>
              </div>
            )}

            {/* Adres Formu */}
            {(!isAuthenticated || addresses.length === 0 || !selectedAddress) && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="firstName" className="block mb-2 text-sm font-medium">
                      Ad
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`input ${errors.firstName ? "border-red-500" : ""}`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-red-500 text-sm">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block mb-2 text-sm font-medium">
                      Soyad
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`input ${errors.lastName ? "border-red-500" : ""}`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-red-500 text-sm">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block mb-2 text-sm font-medium">
                    E-posta
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label htmlFor="address" className="block mb-2 text-sm font-medium">
                    Adres
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`input ${errors.address ? "border-red-500" : ""}`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-red-500 text-sm">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="city" className="block mb-2 text-sm font-medium">
                      Şehir
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`input ${errors.city ? "border-red-500" : ""}`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-red-500 text-sm">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block mb-2 text-sm font-medium">
                      Posta Kodu
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className={`input ${errors.postalCode ? "border-red-500" : ""}`}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-red-500 text-sm">{errors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="phoneNumber" className="block mb-2 text-sm font-medium">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`input ${errors.phoneNumber ? "border-red-500" : ""}`}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-red-500 text-sm">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Adres Kaydetme Seçeneği */}
                {isAuthenticated && !selectedAddress && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="saveAddress" className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Bu adresi hesabıma kaydet
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          Gelecekteki siparişlerinizde bu adresi tekrar kullanabilirsiniz ve daha hızlı alışveriş yapabilirsiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Güvenli Ödeme Bilgileri */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 p-6 mt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Güvenli Ödeme</h3>
                <p className="text-sm text-gray-600">256-bit SSL şifreleme ile korunmaktadır</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-100">
              <p className="text-gray-700 text-center mb-3">
                Güvenli ödeme sayfasına yönlendirileceksiniz.
              </p>

              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  SSL Güvenlik
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  3D Secure
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  PCI DSS
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 flex items-center justify-center border border-gray-100 hover:shadow-md transition-shadow">
                <span className="text-sm font-medium text-gray-700">Visa</span>
              </div>
              <div className="bg-white rounded-lg p-3 flex items-center justify-center border border-gray-100 hover:shadow-md transition-shadow">
                <span className="text-sm font-medium text-gray-700">Mastercard</span>
              </div>
              <div className="bg-white rounded-lg p-3 flex items-center justify-center border border-gray-100 hover:shadow-md transition-shadow">
                <span className="text-sm font-medium text-gray-700">Troy</span>
              </div>
              <div className="bg-white rounded-lg p-3 flex items-center justify-center border border-gray-100 hover:shadow-md transition-shadow">
                <span className="text-sm font-medium text-gray-700">Amex</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Ödeme işleminiz PayTR güvencesi altında gerçekleştirilmektedir.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Sipariş Özeti</h2>
            </div>

            {/* Ürünler Listesi */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="max-h-64 overflow-y-auto space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-2 last:border-b-0">
                    <div className="flex items-start flex-1 mr-3">
                      <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-medium flex-shrink-0 mt-0.5">
                        {item.quantity}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-800 leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fiyat Detayları */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam ({items.length} ürün)</span>
                <span>{formatPrice(totalPrice())}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-gray-600">Kargo Ücreti</span>
                  {calculateShipping() === 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ücretsiz
                    </span>
                  )}
                </div>
                <span className={`font-medium ${calculateShipping() === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                  {calculateShipping() === 0 ? 'Ücretsiz' : formatPrice(calculateShipping())}
                </span>
              </div>

              {totalPrice() < 500 && (
                <div className="py-2">
                  <p className="text-sm text-gray-600 mb-2">
                    Ücretsiz kargo için <span className="font-semibold text-gray-800">{formatPrice(500 - totalPrice())}</span> daha ekleyin
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-3">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((totalPrice() / 500) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round((totalPrice() / 500) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Toplam Tutar</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(calculateTotal())}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">KDV Dahil</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Agreements Info */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center">
                <p
                  className="text-sm text-gray-700 cursor-pointer text-center"
                  onClick={() => setShowLegalAgreements(true)}
                >
                  <span className="font-medium text-blue-600 hover:text-blue-800 underline">Ön Bilgilendirme Koşulları</span> ve{' '}
                  <span className="font-medium text-blue-600 hover:text-blue-800 underline">Mesafeli Satış Sözleşmesi</span>'ni okumak için tıklayın.
                  <br />
                  <span className="text-xs text-gray-500 mt-1 block">
                    Siparişinizi tamamladığınızda bu sözleşmeleri kabul etmiş sayılırsınız.
                  </span>
                </p>
              </div>
            </div>

            {/* Ödeme Butonu */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || isSavingAddress}
              className="btn btn-primary w-full flex items-center justify-center py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {(isLoading || isSavingAddress) ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isSavingAddress ? 'Adres Kaydediliyor...' : 'İşleniyor...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Güvenli Ödeme ({formatPrice(calculateTotal())})
                </>
              )}
            </button>

            {/* Alt Linkler */}
            <div className="mt-6 space-y-3 text-center">
              <Link
                href="/cart"
                className="text-blue-600 hover:text-blue-800 inline-flex items-center text-sm font-medium transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Sepete Geri Dön
              </Link>

              <div className="flex items-center justify-center text-xs text-gray-500">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                SSL ile güvenli alışveriş
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;