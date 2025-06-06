"use client";

import { useState } from "react";
import Link from "next/link";

// Mock order data
const initialOrders = [
  {
    id: "1",
    orderNumber: "HD-1001",
    customerName: "Ahmet Yılmaz",
    date: "02.06.2023",
    status: "delivered",
    paymentStatus: "paid",
    total: 2300,
  },
  {
    id: "2",
    orderNumber: "HD-1002",
    customerName: "Zeynep Kaya",
    date: "01.06.2023",
    status: "shipped",
    paymentStatus: "paid",
    total: 860,
  },
  {
    id: "3",
    orderNumber: "HD-1003",
    customerName: "Mustafa Demir",
    date: "01.06.2023",
    status: "processing",
    paymentStatus: "paid",
    total: 1650,
  },
  {
    id: "4",
    orderNumber: "HD-1004",
    customerName: "Fatma Aydın",
    date: "31.05.2023",
    status: "pending",
    paymentStatus: "pending",
    total: 3450,
  },
  {
    id: "5",
    orderNumber: "HD-1005",
    customerName: "Ali Yıldız",
    date: "30.05.2023",
    status: "delivered",
    paymentStatus: "paid",
    total: 1200,
  },
  {
    id: "6",
    orderNumber: "HD-1006",
    customerName: "Ayşe Demir",
    date: "29.05.2023",
    status: "cancelled",
    paymentStatus: "refunded",
    total: 750,
  },
  {
    id: "7",
    orderNumber: "HD-1007",
    customerName: "Mehmet Can",
    date: "28.05.2023",
    status: "delivered",
    paymentStatus: "paid",
    total: 1250,
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [shippingStatusFilter, setShippingStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Helper to parse dd.mm.yyyy formatted dates
  const parseDate = (str: string) => {
    const [day, month, year] = str.split(".");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

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

    const orderDate = parseDate(order.date);
    const matchesStartDate = startDate ? orderDate >= new Date(startDate) : true;
    const matchesEndDate = endDate ? orderDate <= new Date(endDate) : true;

    return (
      matchesSearch &&
      matchesShippingStatus &&
      matchesPaymentStatus &&
      matchesStartDate &&
      matchesEndDate
    );
  });

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

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    // In a real app, this would make an API call to update the status
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
  };

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
            htmlFor="shippingStatus"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="j10iwtj"
          >
            Kargo Durumu
          </label>
          <select
            id="shippingStatus"
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
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="j2p4:l:"
          >
            Tarih Aralığı
          </label>
          <div className="flex space-x-2">
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            />
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div
        className="bg-white shadow-sm rounded-xl overflow-hidden"
        data-oid="abwcr:2"
      >
        <div className="overflow-x-auto" data-oid="pkrq__f">
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
              {filteredOrders.map((order) => (
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
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      data-oid="5ej1:h:"
                    >
                      <span className="sr-only" data-oid="lk6gswe">
                        Status güncelle
                      </span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        data-oid="utfd2rf"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                          data-oid="rb6ppxo"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                data-oid="2scaz-c"
              >
                Önceki
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="sm4er5g"
              >
                1
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-primary text-white hover:bg-primary-dark px-4 py-2 text-sm font-medium"
                data-oid="hxq45:."
              >
                2
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="_91-h3s"
              >
                3
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-r-md"
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
