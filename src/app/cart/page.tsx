"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
      <div className="container mx-auto py-16 px-4" data-oid="avdze10">
        <h1 className="text-3xl font-bold mb-8" data-oid="8:jx:tn">
          Sepetiniz
        </h1>
        <div
          className="bg-white rounded-lg shadow-lg p-12 max-w-lg mx-auto text-center"
          data-oid=":8b1f.c"
        >
          <div
            className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"
            data-oid="p9k.1b4"
          >
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="m-speyy"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                data-oid="u1:97vc"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-4" data-oid="ao7bq1a">
            Sepetiniz şu anda boş
          </h2>
          <p className="text-gray-600 mb-8" data-oid="q_bl4zz">
            Sepetinizde ürün bulunmamaktadır. Alışverişe başlamak için ürünleri
            keşfedin.
          </p>
          <Link
            href="/products"
            className="btn btn-primary px-8 py-3 rounded-md inline-flex items-center"
            data-oid="ksmjq:r"
          >
            <span data-oid="w745k_u">Alışverişe Başla</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
              data-oid="vjiar3f"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
                data-oid="_bo_6o3"
              />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4" data-oid="2dq-:8u">
      <h1 className="text-3xl font-bold mb-8" data-oid="a.7r83g">
        Sepetiniz
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-oid="5sz7dt2">
        {/* Cart Items */}
        <div className="lg:col-span-2" data-oid="_bojezj">
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            data-oid="zmag2st"
          >
            {/* Header */}
            <div
              className="hidden md:grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 text-gray-700 font-medium"
              data-oid="ps:m781"
            >
              <div className="col-span-3" data-oid="a:-gt-4">
                Ürün
              </div>
              <div className="text-center" data-oid="l_bpikp">
                Fiyat
              </div>
              <div className="text-center" data-oid="ggn8fsf">
                Adet
              </div>
              <div className="text-center" data-oid="q-nl15x">
                Toplam
              </div>
            </div>

            {/* Items */}
            <div className="divide-y" data-oid="9dsw:zz">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                  data-oid="rcfxv6q"
                >
                  <div
                    className="md:grid md:grid-cols-6 md:gap-4 flex flex-col space-y-4 md:space-y-0 items-center"
                    data-oid=":39pn_0"
                  >
                    {/* Product */}
                    <div
                      className="md:col-span-3 flex items-center space-x-4 w-full"
                      data-oid="e9m7r67"
                    >
                      <div
                        className="relative w-20 h-20 flex-shrink-0"
                        data-oid="i8s:drt"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover rounded-md"
                          data-oid="obxa2om"
                        />
                      </div>
                      <div data-oid="wnwjqe4">
                        <h3 className="font-medium" data-oid="9hmpdu5">
                          {item.name}
                        </h3>
                        {item.attributes &&
                          Object.entries(item.attributes).map(
                            ([key, value]) => (
                              <p
                                key={key}
                                className="text-sm text-gray-500"
                                data-oid="lz6h6du"
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
                      data-oid="ip4wy9e"
                    >
                      <span
                        className="md:hidden font-medium mr-2"
                        data-oid=":e.nmgm"
                      >
                        Fiyat:
                      </span>
                      ₺{item.price.toFixed(2)}
                    </div>

                    {/* Quantity */}
                    <div
                      className="flex items-center justify-center"
                      data-oid="zock-d3"
                    >
                      <span
                        className="md:hidden font-medium mr-2"
                        data-oid="b4c0f9v"
                      >
                        Adet:
                      </span>
                      <div
                        className="flex border rounded-md"
                        data-oid="0v_mox6"
                      >
                        <button
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          data-oid="bp4higi"
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
                          data-oid="0zi9j-n"
                        />

                        <button
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          data-oid="odj-kuq"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div
                      className="text-center md:text-center"
                      data-oid="w.:rw5r"
                    >
                      <span
                        className="md:hidden font-medium mr-2"
                        data-oid="vop_ihf"
                      >
                        Toplam:
                      </span>
                      <div className="flex flex-col" data-oid="cj07pzu">
                        <span data-oid="am4mcbz">
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 text-sm hover:text-red-700 transition-colors"
                          data-oid="ppfi0og"
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
        <div className="lg:col-span-1" data-oid=":vhql8m">
          <div
            className="bg-white rounded-lg shadow-lg p-6 sticky top-24"
            data-oid="513-j_."
          >
            <h2
              className="text-xl font-bold mb-6 pb-4 border-b"
              data-oid="mv7.try"
            >
              Sipariş Özeti
            </h2>
            <div className="space-y-4 mb-6" data-oid="iw8qsh6">
              <div className="flex justify-between" data-oid="jpz6zn0">
                <span className="text-gray-600" data-oid="df.8wj3">
                  Ara Toplam
                </span>
                <span className="font-medium" data-oid="fe1ry8k">
                  ₺{totalPrice().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between" data-oid="e-3b2d_">
                <span className="text-gray-600" data-oid="19:_x.:">
                  Kargo
                </span>
                <span className="font-medium" data-oid="nu92sp:">
                  {totalPrice() >= 500 ? (
                    <span className="text-green-600" data-oid="hxwp-8k">
                      Ücretsiz
                    </span>
                  ) : (
                    "₺29.90"
                  )}
                </span>
              </div>
              <div className="border-t pt-4 mt-4" data-oid="tjiqfx.">
                <div
                  className="flex justify-between font-bold text-lg"
                  data-oid="y6grb24"
                >
                  <span data-oid="d::8qmf">Toplam</span>
                  <span data-oid="r70:g:g">
                    ₺
                    {totalPrice() >= 500
                      ? totalPrice().toFixed(2)
                      : (totalPrice() + 29.9).toFixed(2)}
                  </span>
                </div>
                {totalPrice() < 500 && (
                  <p className="text-sm text-gray-500 mt-2" data-oid="rlurb5:">
                    500₺ üzeri siparişlerde kargo ücretsiz!
                    <span
                      className="text-primary font-medium"
                      data-oid="3lmpjx5"
                    >
                      {" "}
                      ₺{(500 - totalPrice()).toFixed(2)} daha ekleyin
                    </span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="btn btn-primary w-full flex items-center justify-center py-3"
              data-oid="f6m6zeo"
            >
              {isCheckingOut ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    data-oid="oz7.1c6"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      data-oid=".4f:w1w"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      data-oid="u5xi:0d"
                    ></path>
                  </svg>
                  İşleniyor...
                </>
              ) : (
                "Ödemeye Geç"
              )}
            </button>
            <div className="mt-4 text-center" data-oid="9yhuz-2">
              <Link
                href="/products"
                className="text-primary hover:underline inline-flex items-center"
                data-oid="y596kge"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  data-oid="nfblv6u"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                    data-oid="mhfnp0z"
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
