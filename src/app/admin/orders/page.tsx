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
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    // In a real app, this would be a proper date range filter
    const matchesDate = dateFilter ? order.date.includes(dateFilter) : true;

    return matchesSearch && matchesStatus && matchesDate;
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
        data-oid="ofr2ge1"
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
        data-oid="qdou9p:"
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
    <div data-oid="zgd4sle">
      <header className="mb-8" data-oid="b61lhtp">
        <h1 className="text-2xl font-bold text-gray-900" data-oid="ytcisuo">
          Siparişler
        </h1>
        <p className="text-gray-500" data-oid="rwh57qq">
          Tüm siparişleri görüntüleyin ve yönetin
        </p>
      </header>

      {/* Filters */}
      <div
        className="bg-white shadow-sm rounded-xl p-4 mb-6 grid gap-4 grid-cols-1 md:grid-cols-3"
        data-oid="10bjy0h"
      >
        <div data-oid="t_x3awk">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="cq.a0z1"
          >
            Arama
          </label>
          <div className="relative" data-oid="1-2b:fm">
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              data-oid="9kxrcp0"
            >
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="5k6kjza"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  data-oid="yatt1jp"
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
              data-oid="xvz4e0q"
            />
          </div>
        </div>

        <div data-oid="6894f-3">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="er9g09d"
          >
            Durum
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="5vax7.q"
          >
            <option value="" data-oid="pgj1swm">
              Tüm Durumlar
            </option>
            <option value="pending" data-oid="b2z0v:8">
              Bekliyor
            </option>
            <option value="processing" data-oid="2n9y8._">
              Hazırlanıyor
            </option>
            <option value="shipped" data-oid="zdp63._">
              Kargoya Verildi
            </option>
            <option value="delivered" data-oid="4_4ac1c">
              Teslim Edildi
            </option>
            <option value="cancelled" data-oid="cii1ksm">
              İptal Edildi
            </option>
          </select>
        </div>

        <div data-oid="u2oy6hw">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="wb8fe-p"
          >
            Tarih
          </label>
          <input
            type="text"
            id="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="gg.aa.yyyy"
            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="_4d6zba"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div
        className="bg-white shadow-sm rounded-xl overflow-hidden"
        data-oid="jfdb61f"
      >
        <div className="overflow-x-auto" data-oid="d1sm07c">
          <table
            className="min-w-full divide-y divide-gray-200"
            data-oid="zufym2e"
          >
            <thead className="bg-gray-50" data-oid="tn8tp_h">
              <tr data-oid="v8-_-c2">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="vv4k:h6"
                >
                  Sipariş No
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="l-m7_83"
                >
                  Müşteri
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="jx81g9."
                >
                  Tarih
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="ge5tj9i"
                >
                  Durum
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="mm-3nox"
                >
                  Ödeme
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="seddbd1"
                >
                  Toplam
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="kd48t:f"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody
              className="bg-white divide-y divide-gray-200"
              data-oid="66fswxh"
            >
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50"
                  data-oid="8kn:4mn"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary"
                    data-oid="8220_c6"
                  >
                    {order.orderNumber}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="xmj214b"
                  >
                    {order.customerName}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    data-oid="t9k3ld9"
                  >
                    {order.date}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="37gnvvj"
                  >
                    <StatusBadge status={order.status} data-oid="ib09626" />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="p93we4n"
                  >
                    <PaymentBadge
                      status={order.paymentStatus}
                      data-oid="ekma8cl"
                    />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="48l1p31"
                  >
                    ₺{order.total.toLocaleString()}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    data-oid="3v05q-1"
                  >
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-primary hover:text-primary-dark mr-3"
                      data-oid="8ieir5b"
                    >
                      Görüntüle
                    </Link>
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      data-oid="b9t6od_"
                    >
                      <span className="sr-only" data-oid=".2m_itt">
                        Status güncelle
                      </span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        data-oid="5wxrfkk"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                          data-oid="cm5vv.m"
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
          data-oid="s3kozb7"
        >
          <div className="text-sm text-gray-700" data-oid="67jplxi">
            <span className="font-medium" data-oid="9_79xa7">
              {filteredOrders.length}
            </span>{" "}
            sonuç gösteriliyor
          </div>
          <div
            className="flex-1 flex justify-center md:justify-end"
            data-oid="nk3t7r2"
          >
            <div className="inline-flex shadow-sm" data-oid="6ttk.yu">
              <button
                className="border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-l-md"
                data-oid="nceomv7"
              >
                Önceki
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="gbu3g-h"
              >
                1
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-primary text-white hover:bg-primary-dark px-4 py-2 text-sm font-medium"
                data-oid="gf.-s.u"
              >
                2
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="ro...e9"
              >
                3
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-r-md"
                data-oid="u56mdok"
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
        data-oid=":a-3eg7"
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          data-oid="52whjn1"
        >
          <h3
            className="text-lg font-medium text-gray-900 mb-4"
            data-oid="17oucs:"
          >
            Sipariş Durumunu Güncelle
          </h3>
          <div className="space-y-4" data-oid="_78wnpn">
            <div data-oid="4yw:_8t">
              <label
                className="block text-sm font-medium text-gray-700"
                data-oid="x-iei5u"
              >
                Yeni Durum
              </label>
              <select
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                data-oid="fcbkc76"
              >
                <option value="pending" data-oid="dpin4an">
                  Bekliyor
                </option>
                <option value="processing" data-oid=":4y.6d:">
                  Hazırlanıyor
                </option>
                <option value="shipped" data-oid="8sam96d">
                  Kargoya Verildi
                </option>
                <option value="delivered" data-oid="ngs73.o">
                  Teslim Edildi
                </option>
                <option value="cancelled" data-oid="bqg10gi">
                  İptal Edildi
                </option>
              </select>
            </div>
            <div data-oid="14sn1p4">
              <label
                className="block text-sm font-medium text-gray-700"
                data-oid="ih1cblh"
              >
                Açıklama (Opsiyonel)
              </label>
              <textarea
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                rows={3}
                data-oid="vtpij7d"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3" data-oid="pg6lf_u">
              <button
                className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                data-oid="luc4.zd"
              >
                İptal
              </button>
              <button
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                data-oid=":_:.p4s"
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
