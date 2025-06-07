"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Helper function for safe price formatting
const formatPrice = (price?: number | null): string => {
  return price !== undefined && price !== null ? `₺${price.toFixed(2)}` : "₺0.00";
};

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
        data-oid="a.d.9nt"
      >
        <h1 className="text-3xl font-bold mb-8" data-oid="ixqhq6p">
          Ödeme
        </h1>
        <div
          className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto"
          data-oid="o5wpskm"
        >
          <p className="text-xl mb-6" data-oid="nfffx_k">
            Sepetinizde ürün bulunmamaktadır
          </p>
          <Link href="/products" className="btn btn-primary" data-oid=":oi.soc">
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4" data-oid="f2ay_wv">
      <h1 className="text-3xl font-bold mb-8" data-oid="-dpl.23">
        Ödeme
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-oid="-v38ms_">
        {/* Checkout Form */}
        <div className="lg:col-span-2" data-oid="047j34d">
          <div className="bg-white rounded-lg shadow-md p-6" data-oid="l7m1-82">
            <h2 className="text-xl font-bold mb-4" data-oid="krf_h3f">
              Teslimat Bilgileri
            </h2>

            <form onSubmit={handleSubmit} data-oid="x53jg4.">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                data-oid="1h6zbz4"
              >
                <div data-oid="ho:hdf3">
                  <label
                    htmlFor="firstName"
                    className="block mb-2 text-sm font-medium"
                    data-oid="kxwr6t:"
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
                    data-oid="m1kogri"
                  />

                  {errors.firstName && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="-og9fr4">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div data-oid="s3pkhlq">
                  <label
                    htmlFor="lastName"
                    className="block mb-2 text-sm font-medium"
                    data-oid="bl07-lq"
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
                    data-oid="ptj28fj"
                  />

                  {errors.lastName && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="p_cqm1a">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6" data-oid="rofh90_">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium"
                  data-oid="-7wjbnz"
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
                  data-oid="lr_jf15"
                />

                {errors.email && (
                  <p className="mt-1 text-red-500 text-sm" data-oid="wn_rtr0">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="mb-6" data-oid="yaqy2c:">
                <label
                  htmlFor="address"
                  className="block mb-2 text-sm font-medium"
                  data-oid="bf02-5-"
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
                  data-oid="evbaxo5"
                />

                {errors.address && (
                  <p className="mt-1 text-red-500 text-sm" data-oid="jg8iyr:">
                    {errors.address}
                  </p>
                )}
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                data-oid="ibdjp:a"
              >
                <div data-oid="i_qfi84">
                  <label
                    htmlFor="city"
                    className="block mb-2 text-sm font-medium"
                    data-oid="z16k9xv"
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
                    data-oid="8j0p4o2"
                  />

                  {errors.city && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="3xx31:n">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div data-oid="36wpr-o">
                  <label
                    htmlFor="postalCode"
                    className="block mb-2 text-sm font-medium"
                    data-oid="z7.75uz"
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
                    data-oid=":q1po7y"
                  />

                  {errors.postalCode && (
                    <p className="mt-1 text-red-500 text-sm" data-oid="xb39-:w">
                      {errors.postalCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6" data-oid="o6t_zzx">
                <label
                  htmlFor="phoneNumber"
                  className="block mb-2 text-sm font-medium"
                  data-oid="iyrv-q1"
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
                  data-oid="hl_d2s4"
                />

                {errors.phoneNumber && (
                  <p className="mt-1 text-red-500 text-sm" data-oid="pfre7v3">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div
            className="bg-white rounded-lg shadow-md p-6 mt-6"
            data-oid="ijw-gga"
          >
            <h2 className="text-xl font-bold mb-4" data-oid="c2giro7">
              Ödeme Bilgileri
            </h2>
            <p className="text-gray-500 mb-4" data-oid="qv0kawn">
              Güvenli ödeme sayfasına yönlendirileceksiniz.
            </p>
            {/* Stripe payment will be implemented here */}
            <div
              className="border p-4 rounded-md bg-gray-50 flex items-center space-x-2"
              data-oid="8y9on1z"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                data-oid="saem4el"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                  data-oid="lnsu6bp"
                />
              </svg>
              <span data-oid="c8olhdq">Stripe ile güvenli ödeme</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1" data-oid="rp6aelr">
          <div
            className="bg-white rounded-lg shadow-md p-6 sticky top-24"
            data-oid="5lt4jga"
          >
            <h2 className="text-xl font-bold mb-4" data-oid="w93nez-">
              Sipariş Özeti
            </h2>

            <div className="max-h-64 overflow-y-auto mb-4" data-oid="n.16bwk">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b"
                  data-oid="0x76kjw"
                >
                  <div className="flex items-center" data-oid="eje:jhg">
                    <span
                      className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm"
                      data-oid="d0q:8i9"
                    >
                      {item.quantity}
                    </span>
                    <span className="text-sm" data-oid="-89nq48">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium" data-oid="ydpwx4.">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4" data-oid="-hy49c:">
              <div className="flex justify-between" data-oid=":2gg_s-">
                <span data-oid="b2x21h8">Ara Toplam</span>
                <span data-oid="749_ysi">{formatPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between" data-oid="ln.oqrz">
                <span data-oid="zidrdzm">Kargo</span>
                <span data-oid="q9:qe62">₺0.00</span>
              </div>
              <div className="border-t pt-2 mt-2" data-oid="h7i0gu9">
                <div
                  className="flex justify-between font-bold"
                  data-oid="3_brgf_"
                >
                  <span data-oid="kzrbdz.">Toplam</span>
                  <span data-oid="w4y-mmc">{formatPrice(totalPrice())}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn btn-primary w-full flex items-center justify-center"
              data-oid="pcpat_l"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    data-oid="53jhqtt"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      data-oid="bxjx::1"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      data-oid="v3im2wf"
                    ></path>
                  </svg>
                  İşleniyor...
                </>
              ) : (
                "Siparişi Tamamla"
              )}
            </button>

            <div className="mt-4" data-oid="qeubms5">
              <Link
                href="/cart"
                className="text-primary hover:underline block text-center"
                data-oid="w3dugf4"
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
