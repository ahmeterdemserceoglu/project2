"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotification } from "@/contexts/NotificationContext";
import RequireAuth from "@/components/auth/RequireAuth";

type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "canceled";
  total_amount: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  shipping_address_id?: string;
  billing_address_id?: string;
  tracking_number?: string;
  created_at: string;
};

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClientComponentClient();
  const { showNotification } = useNotification();

  // Placeholder for future orders functionality
  const loadOrders = async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Kullanıcı bilgileri alınamadı");
      }

      // Try to get orders if table exists
      try {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (orderError && !orderError.message.includes("does not exist")) {
          throw orderError;
        }

        setOrders(orderData || []);
      } catch (error: any) {
        console.log("Orders table may not exist yet:", error.message);
        setOrders([]);
      }
    } catch (error: any) {
      console.error("Error loading orders:", error);
      showNotification("Siparişler yüklenirken bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500",
        label: "Onay Bekliyor",
      },
      processing: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500",
        label: "Hazırlanıyor",
      },
      shipped: {
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-500",
        label: "Kargoya Verildi",
      },
      delivered: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500",
        label: "Teslim Edildi",
      },
      canceled: {
        color: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500",
        label: "İptal Edildi",
      },
    };

    const config = statusConfig[status];

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
        data-oid="wd7xg8v"
      >
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: Order["payment_status"]) => {
    const statusConfig = {
      pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500",
        label: "Ödeme Bekliyor",
      },
      paid: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500",
        label: "Ödendi",
      },
      failed: {
        color: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500",
        label: "Ödeme Başarısız",
      },
      refunded: {
        color:
          "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400",
        label: "İade Edildi",
      },
    };

    const config = statusConfig[status];

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
        data-oid="2jx9:al"
      >
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <RequireAuth data-oid="09zi8cv">
      <div className="container mx-auto px-4 py-8" data-oid=":-e2m9u">
        <div className="max-w-4xl mx-auto" data-oid="_o65muu">
          <div className="mb-6" data-oid="12t6vl:">
            <Link
              href="/account"
              className="inline-flex items-center text-sm text-secondary hover:text-secondary-dark"
              data-oid="xlx4u0m"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="0e4q00k"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                  data-oid="4.zdjwr"
                />
              </svg>
              Hesap Sayfasına Dön
            </Link>
            <h1
              className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2"
              data-oid="54--_5."
            >
              Siparişlerim
            </h1>
            <p
              className="text-gray-600 dark:text-gray-300 mt-1"
              data-oid="ha76z56"
            >
              Tüm siparişlerinizi ve durumlarını görüntüleyin.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8" data-oid="of8w.pn">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"
                data-oid="q8hs-:c"
              ></div>
            </div>
          ) : (
            <>
              {orders.length > 0 ? (
                <div className="space-y-4" data-oid="66_j_tk">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-dark-light rounded-xl shadow-sm overflow-hidden"
                      data-oid="-otg_cy"
                    >
                      <div className="p-6" data-oid="u5uch15">
                        <div
                          className="flex items-center justify-between mb-4"
                          data-oid="pkt09xm"
                        >
                          <div data-oid="v50gfa9">
                            <h3
                              className="text-lg font-semibold text-gray-800 dark:text-white"
                              data-oid="e713zg:"
                            >
                              Sipariş #{order.order_number}
                            </h3>
                            <p
                              className="text-sm text-gray-500 dark:text-gray-400"
                              data-oid="drghdc1"
                            >
                              {new Date(order.created_at).toLocaleDateString(
                                "tr-TR",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                          <div
                            className="flex flex-col items-end"
                            data-oid="quw_s5o"
                          >
                            <span
                              className="text-lg font-bold text-gray-800 dark:text-white"
                              data-oid="rhr2-:o"
                            >
                              {formatCurrency(order.total_amount)}
                            </span>
                            <div
                              className="flex space-x-2 mt-1"
                              data-oid="mcb8fzz"
                            >
                              {getStatusBadge(order.status)}
                              {getPaymentStatusBadge(order.payment_status)}
                            </div>
                          </div>
                        </div>

                        <div
                          className="border-t border-gray-200 dark:border-dark-lighter pt-4 mt-4"
                          data-oid="zgtcwar"
                        >
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="inline-flex items-center text-sm text-secondary hover:text-secondary-dark font-medium"
                            data-oid="z6:9gb4"
                          >
                            Sipariş Detayları
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              data-oid="5vwsr44"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                                data-oid="kbhp9_w"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="bg-white dark:bg-dark-light rounded-xl shadow-sm overflow-hidden p-8 text-center"
                  data-oid="fu77ub5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    data-oid="b-qgnus"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      data-oid="acnbwjr"
                    />
                  </svg>
                  <h3
                    className="mt-2 text-lg font-medium text-gray-900 dark:text-white"
                    data-oid="vxb2e4f"
                  >
                    Henüz siparişiniz bulunmuyor
                  </h3>
                  <p
                    className="mt-1 text-gray-500 dark:text-gray-400"
                    data-oid="ml762on"
                  >
                    Ürünlerimize göz atarak alışveriş yapabilirsiniz.
                  </p>
                  <div className="mt-6" data-oid="vi2:uea">
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                      data-oid="31r78em"
                    >
                      Ürünlere Göz At
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
