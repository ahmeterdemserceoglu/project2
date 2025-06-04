"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CheckoutPage = () => {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // This would typically be a call to a serverless function that creates a Stripe checkout session
      // For now, we'll simulate a successful checkout

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Set flag to indicate successful checkout
      sessionStorage.setItem("orderCompleted", "true");

      // Clear cart and redirect to success page
      clearCart();
      router.push("/checkout/success");
    } catch (error) {
      console.error("Checkout error:", error);
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div
        className="container mx-auto py-16 px-4 text-center"
        data-oid="::xahv-"
      >
        <h1 className="text-3xl font-bold mb-8" data-oid="ss6_khy">
          Ödeme
        </h1>
        <div
          className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto"
          data-oid="hgce_tm"
        >
          <p className="text-xl mb-6" data-oid="-n7qdkz">
            Sepetinizde ürün bulunmamaktadır
          </p>
          <Link href="/products" className="btn btn-primary" data-oid=".-_7xu.">
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4" data-oid="fy8ltbp">
      <h1 className="text-3xl font-bold mb-8" data-oid="buw1lfc">
        Ödeme
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-oid="mr6.nvj">
        {/* Checkout Form */}
        <div className="lg:col-span-2" data-oid="rp7fpud">
          <div className="bg-white rounded-lg shadow-md p-6" data-oid="ua2_5uf">
            <h2 className="text-xl font-bold mb-4" data-oid="zvkkh20">
              Teslimat Bilgileri
            </h2>

            <form onSubmit={handleSubmit} data-oid="qj0mid2">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                data-oid="kgk.ssl"
              >
                <div data-oid=".0hhumy">
                  <label
                    htmlFor="firstName"
                    className="block mb-2 text-sm font-medium"
                    data-oid="iosrv0_"
                  >
                    Ad
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`input ${errors.firstName ? "border-red-500" : ""}`}
                    data-oid="4u7w3x."
                  />

                  {errors.firstName && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="20taitt">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div data-oid="ociqmx8">
                  <label
                    htmlFor="lastName"
                    className="block mb-2 text-sm font-medium"
                    data-oid="yji39zm"
                  >
                    Soyad
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`input ${errors.lastName ? "border-red-500" : ""}`}
                    data-oid="vlcaeon"
                  />

                  {errors.lastName && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="c8_4cvf">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6" data-oid="yzgdts:">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium"
                  data-oid="2560dyg"
                >
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input ${errors.email ? "border-red-500" : ""}`}
                  data-oid="4bjvu0s"
                />

                {errors.email && (
                  <p className="mt-1 text-red-500 text-sm" data-oid="r3u_3-5">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="mb-6" data-oid="a29l4x0">
                <label
                  htmlFor="address"
                  className="block mb-2 text-sm font-medium"
                  data-oid="52nc-7x"
                >
                  Adres
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`input ${errors.address ? "border-red-500" : ""}`}
                  data-oid="uvfqwc."
                />

                {errors.address && (
                  <p className="mt-1 text-red-500 text-sm" data-oid="vezi8.-">
                    {errors.address}
                  </p>
                )}
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                data-oid="bnqatkc"
              >
                <div data-oid="cfsllsu">
                  <label
                    htmlFor="city"
                    className="block mb-2 text-sm font-medium"
                    data-oid="zei8za0"
                  >
                    Şehir
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`input ${errors.city ? "border-red-500" : ""}`}
                    data-oid="_m.ciro"
                  />

                  {errors.city && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="eahh8r0">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div data-oid="x2.1xnw">
                  <label
                    htmlFor="postalCode"
                    className="block mb-2 text-sm font-medium"
                    data-oid="cagpw3d"
                  >
                    Posta Kodu
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`input ${errors.postalCode ? "border-red-500" : ""}`}
                    data-oid="6wt_kk9"
                  />

                  {errors.postalCode && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="ba4e1uq">
                      {errors.postalCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6" data-oid="orqbsk_">
                <label
                  htmlFor="phoneNumber"
                  className="block mb-2 text-sm font-medium"
                  data-oid="kgmeq_a"
                >
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`input ${errors.phoneNumber ? "border-red-500" : ""}`}
                  data-oid="gq5x964"
                />

                {errors.phoneNumber && (
                  <p className="mt-1 text-red-500 text-sm" data-oid="j1u51xg">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div
            className="bg-white rounded-lg shadow-md p-6 mt-6"
            data-oid="cxz:fl7"
          >
            <h2 className="text-xl font-bold mb-4" data-oid="em9xhom">
              Ödeme Bilgileri
            </h2>
            <p className="text-gray-500 mb-4" data-oid="xyt7i1_">
              Güvenli ödeme sayfasına yönlendirileceksiniz.
            </p>
            {/* Stripe payment will be implemented here */}
            <div
              className="border p-4 rounded-md bg-gray-50 flex items-center space-x-2"
              data-oid="03c-7k."
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                data-oid=".ydvtgr"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                  data-oid="pr-_9hv"
                />
              </svg>
              <span data-oid="0vgvj14">Stripe ile güvenli ödeme</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1" data-oid="v40wqej">
          <div
            className="bg-white rounded-lg shadow-md p-6 sticky top-24"
            data-oid="qlfbl7f"
          >
            <h2 className="text-xl font-bold mb-4" data-oid="cx0xsn1">
              Sipariş Özeti
            </h2>

            <div className="max-h-64 overflow-y-auto mb-4" data-oid="m5y5o:.">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b"
                  data-oid="ose6bx2"
                >
                  <div className="flex items-center" data-oid="o:ck88i">
                    <span
                      className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm"
                      data-oid="qbfhc5g"
                    >
                      {item.quantity}
                    </span>
                    <span className="text-sm" data-oid=":3ihobc">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium" data-oid="meke63d">
                    ₺{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4" data-oid="ay.8pm3">
              <div className="flex justify-between" data-oid="d1uaq:w">
                <span data-oid=":5c95he">Ara Toplam</span>
                <span data-oid="axtneil">₺{totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between" data-oid="4nhljcb">
                <span data-oid="wkwedpj">Kargo</span>
                <span data-oid=".miuhwi">₺0.00</span>
              </div>
              <div className="border-t pt-2 mt-2" data-oid=":a0ebar">
                <div
                  className="flex justify-between font-bold"
                  data-oid="8ifrg_8"
                >
                  <span data-oid="j_3rivj">Toplam</span>
                  <span data-oid="vnwhmnc">₺{totalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn btn-primary w-full flex items-center justify-center"
              data-oid="1q.efpq"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    data-oid="vn-xpv1"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      data-oid="zhb1.._"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      data-oid="uhb6rae"
                    ></path>
                  </svg>
                  İşleniyor...
                </>
              ) : (
                "Siparişi Tamamla"
              )}
            </button>

            <div className="mt-4" data-oid="vgw:6ro">
              <Link
                href="/cart"
                className="text-primary hover:underline block text-center"
                data-oid="1-lseu2"
              >
                Sepete Geri Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
