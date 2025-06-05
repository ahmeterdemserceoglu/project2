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
        data-oid="y1vxr2."
      >
        <h1 className="text-3xl font-bold mb-8" data-oid="5k9g7bf">
          Ödeme
        </h1>
        <div
          className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto"
          data-oid="xw_zt:6"
        >
          <p className="text-xl mb-6" data-oid="h1r_z:x">
            Sepetinizde ürün bulunmamaktadır
          </p>
          <Link href="/products" className="btn btn-primary" data-oid="3bdtfxv">
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4" data-oid="46fy308">
      <h1 className="text-3xl font-bold mb-8" data-oid="sgb4h4t">
        Ödeme
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-oid="cquibq1">
        {/* Checkout Form */}
        <div className="lg:col-span-2" data-oid="z..t7pm">
          <div className="bg-white rounded-lg shadow-md p-6" data-oid="8yz:305">
            <h2 className="text-xl font-bold mb-4" data-oid="ar_vlt9">
              Teslimat Bilgileri
            </h2>

            <form onSubmit={handleSubmit} data-oid="xgx-o0o">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                data-oid="zals5et"
              >
                <div data-oid="nl_pc40">
                  <label
                    htmlFor="firstName"
                    className="block mb-2 text-sm font-medium"
                    data-oid="pognkon"
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
                    data-oid="mf5x.3e"
                  />

                  {errors.firstName && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="dvjb_dk">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div data-oid="734gjvd">
                  <label
                    htmlFor="lastName"
                    className="block mb-2 text-sm font-medium"
                    data-oid="l8ywoy7"
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
                    data-oid="-yn6xi3"
                  />

                  {errors.lastName && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="2n5s--r">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6" data-oid="20phwdg">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium"
                  data-oid=".rjvv3r"
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
                  data-oid="z9i7_01"
                />

                {errors.email && (
                  <p className="mt-1 text-red-500 text-sm" data-oid="z:dbdtq">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="mb-6" data-oid="qaj1nak">
                <label
                  htmlFor="address"
                  className="block mb-2 text-sm font-medium"
                  data-oid=":1oz.q3"
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
                  data-oid="4r7.n4-"
                />

                {errors.address && (
                  <p className="mt-1 text-red-500 text-sm" data-oid="kfb2avk">
                    {errors.address}
                  </p>
                )}
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                data-oid="t1_q02."
              >
                <div data-oid="yu88ej4">
                  <label
                    htmlFor="city"
                    className="block mb-2 text-sm font-medium"
                    data-oid="nm_2zgy"
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
                    data-oid="l2rythw"
                  />

                  {errors.city && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="u16g.48">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div data-oid="mjlarp:">
                  <label
                    htmlFor="postalCode"
                    className="block mb-2 text-sm font-medium"
                    data-oid="py8b287"
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
                    data-oid="54b_7u8"
                  />

                  {errors.postalCode && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="s05l9il">
                      {errors.postalCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6" data-oid="vknvtuq">
                <label
                  htmlFor="phoneNumber"
                  className="block mb-2 text-sm font-medium"
                  data-oid=".k5u4_g"
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
                  data-oid="xuxh:4r"
                />

                {errors.phoneNumber && (
                  <p className="mt-1 text-red-500 text-sm" data-oid="m0y35tu">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div
            className="bg-white rounded-lg shadow-md p-6 mt-6"
            data-oid="2lmjans"
          >
            <h2 className="text-xl font-bold mb-4" data-oid="738wppw">
              Ödeme Bilgileri
            </h2>
            <p className="text-gray-500 mb-4" data-oid="qemgawp">
              Güvenli ödeme sayfasına yönlendirileceksiniz.
            </p>
            {/* Stripe payment will be implemented here */}
            <div
              className="border p-4 rounded-md bg-gray-50 flex items-center space-x-2"
              data-oid="fo2n2on"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                data-oid="6q1upu0"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                  data-oid="8in13yz"
                />
              </svg>
              <span data-oid="uyj3-vg">Stripe ile güvenli ödeme</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1" data-oid="ce3lx44">
          <div
            className="bg-white rounded-lg shadow-md p-6 sticky top-24"
            data-oid="kdm0cxq"
          >
            <h2 className="text-xl font-bold mb-4" data-oid="3z55d:t">
              Sipariş Özeti
            </h2>

            <div className="max-h-64 overflow-y-auto mb-4" data-oid="a28.dpy">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b"
                  data-oid="ol168qu"
                >
                  <div className="flex items-center" data-oid="9dnyf5i">
                    <span
                      className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm"
                      data-oid="v.anhxg"
                    >
                      {item.quantity}
                    </span>
                    <span className="text-sm" data-oid="mp5e7qy">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium" data-oid="t3tk4ub">
                    ₺{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4" data-oid="3z_-lue">
              <div className="flex justify-between" data-oid="ts486rh">
                <span data-oid=".g532l1">Ara Toplam</span>
                <span data-oid="ussda.s">₺{totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between" data-oid="03ng91x">
                <span data-oid="waue3ze">Kargo</span>
                <span data-oid="swr7_sn">₺0.00</span>
              </div>
              <div className="border-t pt-2 mt-2" data-oid="w6th7jt">
                <div
                  className="flex justify-between font-bold"
                  data-oid="lxo:ac."
                >
                  <span data-oid="l-79lnd">Toplam</span>
                  <span data-oid="afc63mn">₺{totalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn btn-primary w-full flex items-center justify-center"
              data-oid="wkkx4dg"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    data-oid=".392.-u"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      data-oid=".xpp6mm"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      data-oid="ooistf3"
                    ></path>
                  </svg>
                  İşleniyor...
                </>
              ) : (
                "Siparişi Tamamla"
              )}
            </button>

            <div className="mt-4" data-oid="44fgddr">
              <Link
                href="/cart"
                className="text-primary hover:underline block text-center"
                data-oid="jbzg:jm"
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
