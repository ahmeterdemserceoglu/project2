"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@/lib/supabase";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [shippingStatusFilter, setShippingStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const supabase = createClientComponentClient();

  // Helper to parse dd.mm.yyyy formatted dates
  const parseDate = (str: string) => {
    const [day, month, year] = str.split(".");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("orders")
          .select(
            `id, order_number, status, payment_status, total_amount, created_at, profiles(first_name, last_name, email)`,
          )
          .order("created_at", { ascending: false });
        if (error) throw error;

        const mapped = (data || []).map((o: any) => ({
          id: o.id,
          orderNumber: o.order_number || `#${o.id.substring(0, 8)}`,
          customerName: o.profiles
            ? `${o.profiles.first_name || ""} ${o.profiles.last_name || ""}`.trim() ||
            o.profiles.email
            : "Misafir",
          date: new Date(o.created_at).toLocaleDateString("tr-TR"),
          status: o.status,
          paymentStatus: o.payment_status,
          total: o.total_amount,
        }));
        setOrders(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [supabase]);

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase());

    const matchesShippingStatus = shippingStatusFilter
      ? order.status === shippingStatusFilter
      : true;

    const matchesPaymentStatus = paymentStatusFilter
      ? order.paymentStatus === paymentStatusFilter
      : true;

    let matchesStartDate = true;
    let matchesEndDate = true;

    if (startDate || endDate) {
      const orderDate = parseDate(order.date);
      matchesStartDate = startDate ? orderDate >= new Date(startDate) : true;
      matchesEndDate = endDate ? orderDate <= new Date(endDate) : true;
    }

    return (
      matchesSearch &&
      matchesShippingStatus &&
      matchesPaymentStatus &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, shippingStatusFilter, paymentStatusFilter, startDate, endDate, orders]);

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };

    const statusLabels: Record<string, string> = {
      pending: "Bekliyor",
      processing: "Hazırlanıyor",
      shipped: "Kargoya Verildi",
      delivered: "Teslim Edildi",
      cancelled: "İptal Edildi",
      refunded: "İade Edildi",
    };

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}
        data-oid="68t6b6."
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  // Payment status badge component
  const PaymentBadge = ({ status }: { status: string }) => {
    const statusStyles: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };

    const statusLabels: Record<string, string> = {
      paid: "Ödendi",
      pending: "Bekliyor",
      failed: "Başarısız",
      refunded: "İade",
    };

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}
        data-oid="hm97bn9"
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (error) throw error;

      // Local state'i güncelle
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );

      alert("Sipariş durumu başarıyla güncellendi!");
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  const handleQuickStatusUpdate = (orderId: string, currentStatus: string) => {
    const statusOptions = [
      { value: "pending", label: "Beklemede" },
      { value: "processing", label: "Hazırlanıyor" },
      { value: "shipped", label: "Kargoda" },
      { value: "delivered", label: "Teslim Edildi" },
      { value: "cancelled", label: "İptal Edildi" }
    ];

    const nextStatus = statusOptions.find(s => s.value !== currentStatus);
    if (!nextStatus) return;

    const newStatus = prompt(
      `Yeni durum seçin:\n${statusOptions.map((s, i) => `${i + 1}. ${s.label}`).join('\n')}\n\nNumara girin (1-${statusOptions.length}):`,
      "2"
    );

    if (newStatus) {
      const selectedIndex = parseInt(newStatus) - 1;
      if (selectedIndex >= 0 && selectedIndex < statusOptions.length) {
        const selectedStatus = statusOptions[selectedIndex];
        if (confirm(`Sipariş durumunu "${selectedStatus.label}" olarak güncellemek istediğinizden emin misiniz?`)) {
          handleUpdateStatus(orderId, selectedStatus.value);
        }
      }
    }
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
    <div data-oid="7j76r1g">
      <header className="mb-8" data-oid="eyzt2yd">
        <h1 className="text-2xl font-bold text-gray-900" data-oid="kx4.i-7">
          Siparişler
        </h1>
        <p className="text-gray-500" data-oid="wbbr5g:">
          Tüm siparişleri görüntüleyin ve yönetin
        </p>
      </header>

      {/* Filters */}
      <div
        className="bg-white shadow-sm rounded-xl p-4 mb-6 grid gap-4 grid-cols-1 md:grid-cols-4"
        data-oid="26aegnz"
      >
        <div data-oid="-4r5g-2">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="rn.9.v4"
          >
            Arama
          </label>
          <div className="relative" data-oid="9062mv-">
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              data-oid="h58fbtm"
            >
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="craaqwf"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  data-oid="tmleqpe"
                />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sipariş no veya müşteri adı"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
              data-oid="b0x7ht3"
            />
          </div>
        </div>

        <div data-oid="-sqseyk">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="j10iwtj"
          >
            Durum
          </label>
          <select
            id="status"
            value={shippingStatusFilter}
            onChange={(e) => setShippingStatusFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="s8c:pp9"
          >
            <option value="" data-oid="iuj8b6t">
              Tüm Durumlar
            </option>
            <option value="pending" data-oid="if4_h91">
              Bekliyor
            </option>
            <option value="processing" data-oid="7jdkuz6">
              Hazırlanıyor
            </option>
            <option value="shipped" data-oid="68xutrh">
              Kargoya Verildi
            </option>
            <option value="delivered" data-oid="6ke:7l5">
              Teslim Edildi
            </option>
            <option value="cancelled" data-oid=":vrdk4p">
              İptal Edildi
            </option>
          </select>
        </div>

        <div data-oid="payment-filter">
          <label
            htmlFor="paymentStatus"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ödeme Durumu
          </label>
          <select
            id="paymentStatus"
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
          >
            <option value="">Tüm Ödemeler</option>
            <option value="paid">Ödendi</option>
            <option value="pending">Bekliyor</option>
            <option value="failed">Başarısız</option>
            <option value="refunded">İade</option>
          </select>
        </div>

        <div data-oid="-nl_cbl">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="j2p4:l:"
          >
            Tarih
          </label>
          <input
            type="text"
            id="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="gg.aa.yyyy"
            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="t3-vj7:"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div
        className="bg-white shadow-sm rounded-xl overflow-hidden"
        data-oid="abwcr:2"
      >
        <div className="overflow-x-auto" data-oid="pkrq__f">
          {isLoading ? (
            <div className="p-4 text-center">Yükleniyor...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">{error}</div>
          ) : paginatedOrders.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Kayıt bulunamadı</div>
          ) : (
            <table
              className="min-w-full divide-y divide-gray-200"
              data-oid="n-.-.gg"
            >
              <thead className="bg-gray-50" data-oid="yxnu5o-">
                <tr data-oid="vjkir:e">
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    data-oid="5qc_l7f"
                  >
                    Sipariş No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    data-oid="nztrmsn"
                  >
                    Müşteri
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    data-oid="6glg0g9"
                  >
                    Tarih
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    data-oid="ootrxa_"
                  >
                    Durum
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    data-oid="wvec.p1"
                  >
                    Ödeme
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    data-oid="n3.n:9d"
                  >
                    Toplam
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    data-oid="s8x8da2"
                  >
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody
                className="bg-white divide-y divide-gray-200"
                data-oid="lb1pwr8"
              >
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50"
                    data-oid="1ziwef."
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary"
                      data-oid="iuo1ldk"
                    >
                      {order.orderNumber}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      data-oid="lhpho-w"
                    >
                      {order.customerName}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      data-oid=":je1cw."
                    >
                      {order.date}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap"
                      data-oid="gm:02v7"
                    >
                      <StatusBadge status={order.status} data-oid="znou6oz" />
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap"
                      data-oid="tq9g0:8"
                    >
                      <PaymentBadge
                        status={order.paymentStatus}
                        data-oid="i:3_iet"
                      />
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      data-oid="qbq5u_n"
                    >
                      ₺{order.total.toLocaleString()}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      data-oid="2chkfel"
                    >
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary hover:text-primary-dark mr-3"
                        data-oid="kkhblyh"
                      >
                        Görüntüle
                      </Link>
                   
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div
          className="px-6 py-3 flex items-center justify-between border-t"
          data-oid="a2b4lnb"
        >
          <div className="text-sm text-gray-700" data-oid=".2p6g1t">
            <span className="font-medium" data-oid="5cqc-4z">
              {filteredOrders.length}
            </span>{" "}
            sonuç gösteriliyor
          </div>
          <div
            className="flex-1 flex justify-center md:justify-end"
            data-oid="jx8p35n"
          >
            <div className="inline-flex shadow-sm" data-oid="meg.cq2">
              <button
                className="border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-l-md"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                data-oid="2scaz-c"
              >
                Önceki
              </button>
              <span className="border-t border-b bg-white px-4 py-2 text-sm font-medium text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                className="border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-r-md"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                data-oid="ec85zvi"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal (simplified, would use a proper modal component in a real app) */}
      <div
        className="hidden fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4"
        data-oid="tsmt_ub"
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          data-oid="5ubrxy7"
        >
          <h3
            className="text-lg font-medium text-gray-900 mb-4"
            data-oid=".4lgfkz"
          >
            Sipariş Durumunu Güncelle
          </h3>
          <div className="space-y-4" data-oid=".-51per">
            <div data-oid="dskjlgb">
              <label
                className="block text-sm font-medium text-gray-700"
                data-oid="tswsnoy"
              >
                Yeni Durum
              </label>
              <select
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                data-oid="4k.vweg"
              >
                <option value="pending" data-oid="scn7db.">
                  Bekliyor
                </option>
                <option value="processing" data-oid="ntb7-a9">
                  Hazırlanıyor
                </option>
                <option value="shipped" data-oid="pypatk_">
                  Kargoya Verildi
                </option>
                <option value="delivered" data-oid="jb9f7d7">
                  Teslim Edildi
                </option>
                <option value="cancelled" data-oid="yy9xlyq">
                  İptal Edildi
                </option>
              </select>
            </div>
            <div data-oid="p59v5lo">
              <label
                className="block text-sm font-medium text-gray-700"
                data-oid="3vpjyou"
              >
                Açıklama (Opsiyonel)
              </label>
              <textarea
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                rows={3}
                data-oid="88oy_0r"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3" data-oid="xh66jmo">
              <button
                className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                data-oid="h2bwhh7"
              >
                İptal
              </button>
              <button
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                data-oid="h_4dyox"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
