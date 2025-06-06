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
      data-oid="j1ftjqb"
    >
      <div
        className="bg-white rounded-lg shadow-md p-8 max-w-lg mx-auto"
        data-oid="o3ycv6l"
      >
        <div
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          data-oid="g1:kor_"
        >
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            data-oid="8:a-dpy"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
              data-oid="knyisck"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4" data-oid="h173:1o">
          Siparişiniz Alındı!
        </h1>
        <p className="text-gray-600 mb-6" data-oid=":-5ek.n">
          Siparişiniz başarıyla oluşturuldu. Sipariş onayı e-posta adresinize
          gönderildi.
        </p>

        <div className="border-t border-b py-4 my-6" data-oid="mq1102x">
          <p className="text-gray-600 mb-2" data-oid="r230b0g">
            Sipariş numaranız:
          </p>
          <p className="text-lg font-bold" data-oid="1ib2fmu">
            #ORD-{Math.floor(100000 + Math.random() * 900000)}
          </p>
        </div>

        <p className="text-gray-600 mb-8" data-oid="-8l0xfp">
          Siparişinizle ilgili herhangi bir sorunuz olursa müşteri
          hizmetlerimizle iletişime geçebilirsiniz.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          data-oid="aebw:7w"
        >
          <Link href="/orders" className="btn btn-outline" data-oid="ofsd0:3">
            Siparişlerim
          </Link>
          <Link href="/" className="btn btn-primary" data-oid="cozkdz9">
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
