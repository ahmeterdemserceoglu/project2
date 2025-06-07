"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Helper function for safe price formatting
const formatPrice = (price?: number | null): string => {
  return price !== undefined && price !== null ? `₺${price.toFixed(2)}` : "₺0.00";
};

const CartPage = () => {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast.success("Ürün sepetten çıkarıldı");
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Navigate to checkout page
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4" data-oid="o2gwljr">
        <h1 className="text-3xl font-bold mb-8" data-oid="4q74adk">
          Sepetiniz
        </h1>
        <div
          className="bg-white rounded-lg shadow-lg p-12 max-w-lg mx-auto text-center"
          data-oid="7.qfcw7"
        >
          <div
            className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"
            data-oid="_iv7r6."
          >
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="qha0iew"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                data-oid="b1n:s4o"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-4" data-oid="306ztmd">
            Sepetiniz şu anda boş
          </h2>
          <p className="text-gray-600 mb-8" data-oid="98..9p9">
            Sepetinizde ürün bulunmamaktadır. Alışverişe başlamak için ürünleri
            keşfedin.
          </p>
          <Link
            href="/products"
            className="btn btn-primary px-8 py-3 rounded-md inline-flex items-center"
            data-oid="0ddsfoo"
          >
            <span data-oid="jorp0m8">Alışverişe Başla</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
              data-oid="vyftt-f"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
                data-oid="inogx0z"
              />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4" data-oid=".3xd7bg">
      <h1 className="text-3xl font-bold mb-8" data-oid="1l9g14q">
        Sepetiniz
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-oid="u2yo6no">
        {/* Cart Items */}
        <div className="lg:col-span-2" data-oid="30ju88x">
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            data-oid="0g0tle9"
          >
            {/* Header */}
            <div
              className="hidden md:grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 text-gray-700 font-medium"
              data-oid="5re7jvz"
            >
              <div className="col-span-3" data-oid="nlb-o11">
                Ürün
              </div>
              <div className="text-center" data-oid="qq7u.1y">
                Fiyat
              </div>
              <div className="text-center" data-oid="uwhx93e">
                Adet
              </div>
              <div className="text-center" data-oid="q:35fiu">
                Toplam
              </div>
            </div>

            {/* Items */}
            <div className="divide-y" data-oid="j6bxpaz">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                  data-oid="c4gf_q-"
                >
                  <div
                    className="md:grid md:grid-cols-6 md:gap-4 flex flex-col space-y-4 md:space-y-0 items-center"
                    data-oid="ayzdk8j"
                  >
                    {/* Product */}
                    <div
                      className="md:col-span-3 flex items-center space-x-4 w-full"
                      data-oid=":3-t2y-"
                    >
                      <div
                        className="relative w-20 h-20 flex-shrink-0"
                        data-oid="d4xwerc"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover rounded-md"
                          data-oid="x62j6l6"
                        />
                      </div>
                      <div data-oid="j9:owgy">
                        <h3 className="font-medium" data-oid="o5qwx0x">
                          {item.name}
                        </h3>
                        {item.attributes &&
                          Object.entries(item.attributes).map(
                            ([key, value]) => (
                              <p
                                key={key}
                                className="text-sm text-gray-500"
                                data-oid="wllwr6i"
                              >
                                {key}: {value}
                              </p>
                            ),
                          )}
                      </div>
                    </div>

                    {/* Price */}
                    <div
                      className="text-center md:text-center"
                      data-oid="36n4f7k"
                    >
                      <span
                        className="md:hidden font-medium mr-2"
                        data-oid="_hsg7o2"
                      >
                        Fiyat:
                      </span>
                      {formatPrice(item.price)}
                    </div>

                    {/* Quantity */}
                    <div
                      className="flex items-center justify-center"
                      data-oid="q:zomgl"
                    >
                      <span
                        className="md:hidden font-medium mr-2"
                        data-oid="dlmtlr0"
                      >
                        Adet:
                      </span>
                      <div
                        className="flex border rounded-md"
                        data-oid="k47s80v"
                      >
                        <button
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          data-oid="3j9t:p6"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value),
                            )
                          }
                          className="w-12 text-center focus:outline-none"
                          data-oid="b4kb7_r"
                        />

                        <button
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          data-oid="7zaroqu"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div
                      className="text-center md:text-center"
                      data-oid="8da9ezg"
                    >
                      <span
                        className="md:hidden font-medium mr-2"
                        data-oid="fckqmzt"
                      >
                        Toplam:
                      </span>
                      <div className="flex flex-col" data-oid=":9c9iua">
                        <span data-oid="f7e1wfz">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 text-sm hover:text-red-700 transition-colors"
                          data-oid="i7wh2vk"
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1" data-oid="bsw--fh">
          <div
            className="bg-white rounded-lg shadow-lg p-6 sticky top-24"
            data-oid="iqkjx1j"
          >
            <h2
              className="text-xl font-bold mb-6 pb-4 border-b"
              data-oid="atuwzpd"
            >
              Sipariş Özeti
            </h2>
            <div className="space-y-4 mb-6" data-oid="r1f_zh_">
              <div className="flex justify-between" data-oid="7alx_if">
                <span className="text-gray-600" data-oid="kyjbfki">
                  Ara Toplam
                </span>
                <span className="font-medium" data-oid="e0z7881">
                  {formatPrice(totalPrice())}
                </span>
              </div>
              <div className="flex justify-between" data-oid="nryu4cc">
                <span className="text-gray-600" data-oid="axebo:s">
                  Kargo
                </span>
                <span className="font-medium" data-oid="t49l6:_">
                  {totalPrice() >= 500 ? (
                    <span className="text-green-600" data-oid="q1n8u14">
                      Ücretsiz
                    </span>
                  ) : (
                    "₺29.90"
                  )}
                </span>
              </div>
              <div className="border-t pt-4 mt-4" data-oid="m4immao">
                <div
                  className="flex justify-between font-bold text-lg"
                  data-oid="m1fule."
                >
                  <span data-oid="pmgn34y">Toplam</span>
                  <span data-oid="kvaq9q:">
                    {totalPrice() >= 500
                      ? formatPrice(totalPrice())
                      : formatPrice(totalPrice() + 29.9)}
                  </span>
                </div>
                {totalPrice() < 500 && (
                  <p className="text-sm text-gray-500 mt-2" data-oid="un7-ot4">
                    500₺ üzeri siparişlerde kargo ücretsiz!
                    <span
                      className="text-primary font-medium"
                      data-oid="h49acic"
                    >
                      {" "}
                      {formatPrice(500 - totalPrice())} daha ekleyin
                    </span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="btn btn-primary w-full flex items-center justify-center py-3"
              data-oid="7iysq1h"
            >
              {isCheckingOut ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    data-oid="lp8ssf5"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      data-oid="occfw3a"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      data-oid="puj0m1s"
                    ></path>
                  </svg>
                  İşleniyor...
                </>
              ) : (
                "Ödemeye Geç"
              )}
            </button>
            <div className="mt-4 text-center" data-oid="r.xsh1u">
              <Link
                href="/products"
                className="text-primary hover:underline inline-flex items-center"
                data-oid="6jp7d3g"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  data-oid="6:wx23."
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                    data-oid="yccp.ff"
                  />
                </svg>
                Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
