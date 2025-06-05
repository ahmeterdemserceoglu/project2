"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CheckoutSuccessPage = () => {
  const router = useRouter();

  // Redirect if user navigates directly to this page without a successful checkout
  useEffect(() => {
    // This is a simple check - in a real app, you'd validate the order with a session ID
    const hasOrderCompleted = sessionStorage.getItem("orderCompleted");

    if (!hasOrderCompleted) {
      router.push("/");
    } else {
      // Clear the flag after successful navigation
      sessionStorage.removeItem("orderCompleted");
    }
  }, [router]);

  return (
    <div
      className="container mx-auto py-16 px-4 text-center"
      data-oid="04dc89r"
    >
      <div
        className="bg-white rounded-lg shadow-md p-8 max-w-lg mx-auto"
        data-oid="192wqpl"
      >
        <div
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          data-oid="k:3jdfp"
        >
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            data-oid="l6df-l9"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
              data-oid="ks5wr2a"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4" data-oid="qfxi46w">
          Siparişiniz Alındı!
        </h1>
        <p className="text-gray-600 mb-6" data-oid="f8_5i7e">
          Siparişiniz başarıyla oluşturuldu. Sipariş onayı e-posta adresinize
          gönderildi.
        </p>

        <div className="border-t border-b py-4 my-6" data-oid="-ewq3mt">
          <p className="text-gray-600 mb-2" data-oid="_k_2.6:">
            Sipariş numaranız:
          </p>
          <p className="text-lg font-bold" data-oid="34509hx">
            #ORD-{Math.floor(100000 + Math.random() * 900000)}
          </p>
        </div>

        <p className="text-gray-600 mb-8" data-oid="chxcexs">
          Siparişinizle ilgili herhangi bir sorunuz olursa müşteri
          hizmetlerimizle iletişime geçebilirsiniz.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          data-oid="0o7nvs:"
        >
          <Link href="/orders" className="btn btn-outline" data-oid="xzrvo6_">
            Siparişlerim
          </Link>
          <Link href="/" className="btn btn-primary" data-oid="smzgr:2">
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
