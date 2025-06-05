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
        data-oid="-o96yqs"
      >
        <h1 className="text-3xl font-bold mb-8" data-oid="mxu9.4j">
          Ödeme
        </h1>
        <div
          className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto"
          data-oid="hu.5vid"
        >
          <p className="text-xl mb-6" data-oid="zldnt1x">
            Sepetinizde ürün bulunmamaktadır
          </p>
          <Link href="/products" className="btn btn-primary" data-oid="ng:7:3b">
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4" data-oid="m6id4._">
      <h1 className="text-3xl font-bold mb-8" data-oid="f2ennz1">
        Ödeme
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-oid="..gid30">
        {/* Checkout Form */}
        <div className="lg:col-span-2" data-oid="d95tlmf">
          <div className="bg-white rounded-lg shadow-md p-6" data-oid="m4mrf_d">
            <h2 className="text-xl font-bold mb-4" data-oid="c7uf9vh">
              Teslimat Bilgileri
            </h2>

            <form onSubmit={handleSubmit} data-oid="q.dv4-u">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                data-oid="q5v00wg"
              >
                <div data-oid="9olj_q7">
                  <label
                    htmlFor="firstName"
                    className="block mb-2 text-sm font-medium"
                    data-oid="_-lx5rn"
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
                    data-oid="bu8jfht"
                  />

                  {errors.firstName && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="aqp9ew.">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div data-oid="z6ny-oh">
                  <label
                    htmlFor="lastName"
                    className="block mb-2 text-sm font-medium"
                    data-oid="fk7x7_c"
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
                    data-oid="3me:aip"
                  />

                  {errors.lastName && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="k3zx66r">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6" data-oid="siu_t3b">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium"
                  data-oid="c521hda"
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
                  data-oid="v2f091n"
                />

                {errors.email && (
                  <p className="mt-1 text-red-500 text-sm" data-oid="grm2.e6">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="mb-6" data-oid="sov8u-f">
                <label
                  htmlFor="address"
                  className="block mb-2 text-sm font-medium"
                  data-oid="2ls.ieq"
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
                  data-oid="5p5w89u"
                />

                {errors.address && (
                  <p className="mt-1 text-red-500 text-sm" data-oid="hf9v.s-">
                    {errors.address}
                  </p>
                )}
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                data-oid="9f4vfx4"
              >
                <div data-oid="miyb728">
                  <label
                    htmlFor="city"
                    className="block mb-2 text-sm font-medium"
                    data-oid="lezy5:o"
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
                    data-oid="s9t9ipm"
                  />

                  {errors.city && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="4n3h91h">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div data-oid="naqs1k-">
                  <label
                    htmlFor="postalCode"
                    className="block mb-2 text-sm font-medium"
                    data-oid="89ecjfz"
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
                    data-oid="531e3-x"
                  />

                  {errors.postalCode && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="4d2cs2b">
                      {errors.postalCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6" data-oid="hj.96go">
                <label
                  htmlFor="phoneNumber"
                  className="block mb-2 text-sm font-medium"
                  data-oid="etc::pt"
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
                  data-oid="4p77lm:"
                />

                {errors.phoneNumber && (
                  <p className="mt-1 text-red-500 text-sm" data-oid="xd4cu6d">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div
            className="bg-white rounded-lg shadow-md p-6 mt-6"
            data-oid="hg2ens_"
          >
            <h2 className="text-xl font-bold mb-4" data-oid="d71-2-a">
              Ödeme Bilgileri
            </h2>
            <p className="text-gray-500 mb-4" data-oid="0dgmlco">
              Güvenli ödeme sayfasına yönlendirileceksiniz.
            </p>
            {/* Stripe payment will be implemented here */}
            <div
              className="border p-4 rounded-md bg-gray-50 flex items-center space-x-2"
              data-oid="wmto1na"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                data-oid="8veopx."
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                  data-oid="chxvx2o"
                />
              </svg>
              <span data-oid="5qg.2gz">Stripe ile güvenli ödeme</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1" data-oid="x5r6g.e">
          <div
            className="bg-white rounded-lg shadow-md p-6 sticky top-24"
            data-oid="_201.65"
          >
            <h2 className="text-xl font-bold mb-4" data-oid="yxb5lrb">
              Sipariş Özeti
            </h2>

            <div className="max-h-64 overflow-y-auto mb-4" data-oid="riboivk">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b"
                  data-oid="irkls0h"
                >
                  <div className="flex items-center" data-oid="p336c3r">
                    <span
                      className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm"
                      data-oid=".._q99h"
                    >
                      {item.quantity}
                    </span>
                    <span className="text-sm" data-oid="f32-9-8">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium" data-oid=".a5msez">
                    ₺{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4" data-oid="6i7-l2z">
              <div className="flex justify-between" data-oid="b95xlq.">
                <span data-oid="4_hw:x5">Ara Toplam</span>
                <span data-oid="j.pim69">₺{totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between" data-oid="12gkd0b">
                <span data-oid="tyxinco">Kargo</span>
                <span data-oid="8:cgamm">₺0.00</span>
              </div>
              <div className="border-t pt-2 mt-2" data-oid="9d05zw2">
                <div
                  className="flex justify-between font-bold"
                  data-oid="hnvjtsf"
                >
                  <span data-oid=".erlty0">Toplam</span>
                  <span data-oid="n86ylm-">₺{totalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn btn-primary w-full flex items-center justify-center"
              data-oid=".nbg1_d"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    data-oid="b4z3t9-"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      data-oid="5o92iqk"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      data-oid="72ujny6"
                    ></path>
                  </svg>
                  İşleniyor...
                </>
              ) : (
                "Siparişi Tamamla"
              )}
            </button>

            <div className="mt-4" data-oid="_973s8:">
              <Link
                href="/cart"
                className="text-primary hover:underline block text-center"
                data-oid="w46_jfn"
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
