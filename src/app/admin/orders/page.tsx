"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@/lib/supabase";

interface Order {
  id: string;
  order_number: string | null;
  created_at: string;
  status: string;
  payment_status: string | null;
  total_amount: number | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export default function OrdersPage() {
  const supabase = createClientComponentClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(
          `id, order_number, created_at, status, payment_status, total_amount, profiles(first_name, last_name, email)`
        )
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Normalize the profiles field since Supabase may return it as an array
        const normalized = (data as any[]).map((order) => ({
          ...order,
          profiles: Array.isArray(order.profiles)
            ? order.profiles[0] || null
            : order.profiles,
        })) as Order[];
        setOrders(normalized);
      } else {
        console.error("Error loading orders", error);
        setOrders([]);
      }
      setIsLoading(false);
    };
    fetchOrders();
  }, [supabase]);

  const statusLabels: Record<string, string> = {
    pending: "Bekliyor",
    processing: "Hazırlanıyor",
    shipped: "Kargoda",
    delivered: "Teslim Edildi",
    cancelled: "İptal",
    refunded: "İade",
  };

  if (isLoading) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-sm">Şu an sipariş bulunmuyor.</div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Siparişler</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sipariş No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Müşteri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ödeme
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Toplam
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-primary font-medium">
                  {order.order_number || `#${order.id.substring(0, 8)}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.profiles
                    ? `${order.profiles.first_name || ""} ${order.profiles.last_name || ""}`.trim() ||
                      order.profiles.email
                    : "Misafir Kullanıcı"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Date(order.created_at).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {statusLabels[order.status] || order.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.payment_status ? order.payment_status.toUpperCase() : ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₺{Number(order.total_amount || 0).toLocaleString("tr-TR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/orders/${order.id}`} className="text-primary hover:text-primary-dark">
                    Görüntüle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
