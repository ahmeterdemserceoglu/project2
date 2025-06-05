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
        data-oid="be_h7vz"
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
        data-oid=":xogm7e"
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
    <div data-oid="yp6fi-0">
      <header className="mb-8" data-oid="-f.5c6y">
        <h1 className="text-2xl font-bold text-gray-900" data-oid="e4df2fz">
          Siparişler
        </h1>
        <p className="text-gray-500" data-oid="79smu-u">
          Tüm siparişleri görüntüleyin ve yönetin
        </p>
      </header>

      {/* Filters */}
      <div
        className="bg-white shadow-sm rounded-xl p-4 mb-6 grid gap-4 grid-cols-1 md:grid-cols-3"
        data-oid="5a09ju-"
      >
        <div data-oid="3-v2.2q">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="_5zmt:."
          >
            Arama
          </label>
          <div className="relative" data-oid="7n631-o">
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              data-oid="whol.b6"
            >
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="-j41h3f"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  data-oid="gzmv6zg"
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
              data-oid="yhx9wox"
            />
          </div>
        </div>

        <div data-oid="hyvt:t-">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="55z4:tb"
          >
            Durum
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="5m5pa46"
          >
            <option value="" data-oid="ya8j_aa">
              Tüm Durumlar
            </option>
            <option value="pending" data-oid="907gmv7">
              Bekliyor
            </option>
            <option value="processing" data-oid="1-y9ekh">
              Hazırlanıyor
            </option>
            <option value="shipped" data-oid="njjho:m">
              Kargoya Verildi
            </option>
            <option value="delivered" data-oid="9.s98yu">
              Teslim Edildi
            </option>
            <option value="cancelled" data-oid="4uqozqn">
              İptal Edildi
            </option>
          </select>
        </div>

        <div data-oid="3--e0lz">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="dgnr1yh"
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
            data-oid="xwoth-a"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div
        className="bg-white shadow-sm rounded-xl overflow-hidden"
        data-oid="03oiuj."
      >
        <div className="overflow-x-auto" data-oid=":e46u-a">
          <table
            className="min-w-full divide-y divide-gray-200"
            data-oid="b-bmh6f"
          >
            <thead className="bg-gray-50" data-oid="eruns.8">
              <tr data-oid="h27_g-r">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="xp5kf17"
                >
                  Sipariş No
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="nce.51o"
                >
                  Müşteri
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="c2173g:"
                >
                  Tarih
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="bn9avui"
                >
                  Durum
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="3w1_t.c"
                >
                  Ödeme
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="3.uj3.l"
                >
                  Toplam
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="8xi.5yg"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody
              className="bg-white divide-y divide-gray-200"
              data-oid="o6:9mdv"
            >
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50"
                  data-oid="e4yedbo"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary"
                    data-oid="j0qlmvn"
                  >
                    {order.orderNumber}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="_1mmshq"
                  >
                    {order.customerName}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    data-oid="hf4ty6_"
                  >
                    {order.date}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="yr5429-"
                  >
                    <StatusBadge status={order.status} data-oid="38mi6-m" />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="-eivnv:"
                  >
                    <PaymentBadge
                      status={order.paymentStatus}
                      data-oid="ir86vpv"
                    />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="7lgp473"
                  >
                    ₺{order.total.toLocaleString()}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    data-oid="mzoa0_-"
                  >
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-primary hover:text-primary-dark mr-3"
                      data-oid="2cw_xs1"
                    >
                      Görüntüle
                    </Link>
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      data-oid="cmvaltr"
                    >
                      <span className="sr-only" data-oid="gb0zin3">
                        Status güncelle
                      </span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        data-oid="n0lvqt6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                          data-oid="6fbegn0"
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
          data-oid="juiuac:"
        >
          <div className="text-sm text-gray-700" data-oid="cashtpn">
            <span className="font-medium" data-oid="026_bjy">
              {filteredOrders.length}
            </span>{" "}
            sonuç gösteriliyor
          </div>
          <div
            className="flex-1 flex justify-center md:justify-end"
            data-oid="v.n.hqs"
          >
            <div className="inline-flex shadow-sm" data-oid="vy4hpge">
              <button
                className="border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-l-md"
                data-oid="ata-j44"
              >
                Önceki
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="njk:fwu"
              >
                1
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-primary text-white hover:bg-primary-dark px-4 py-2 text-sm font-medium"
                data-oid="i:ejn4e"
              >
                2
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="ft2.uk8"
              >
                3
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-r-md"
                data-oid="vz197on"
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
        data-oid="t-ns3df"
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          data-oid="trl0.f9"
        >
          <h3
            className="text-lg font-medium text-gray-900 mb-4"
            data-oid="2wg8_f6"
          >
            Sipariş Durumunu Güncelle
          </h3>
          <div className="space-y-4" data-oid="gtyouor">
            <div data-oid="oi0_k5r">
              <label
                className="block text-sm font-medium text-gray-700"
                data-oid="4jpqv6l"
              >
                Yeni Durum
              </label>
              <select
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                data-oid="3u:hb0_"
              >
                <option value="pending" data-oid="-2ujqc7">
                  Bekliyor
                </option>
                <option value="processing" data-oid="lep3_-o">
                  Hazırlanıyor
                </option>
                <option value="shipped" data-oid="287ycjf">
                  Kargoya Verildi
                </option>
                <option value="delivered" data-oid="duig724">
                  Teslim Edildi
                </option>
                <option value="cancelled" data-oid="en:ujkw">
                  İptal Edildi
                </option>
              </select>
            </div>
            <div data-oid="a3.rice">
              <label
                className="block text-sm font-medium text-gray-700"
                data-oid="4zeohva"
              >
                Açıklama (Opsiyonel)
              </label>
              <textarea
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                rows={3}
                data-oid="49kyq_x"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3" data-oid="hzb7upz">
              <button
                className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                data-oid="un9dne5"
              >
                İptal
              </button>
              <button
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                data-oid="95wz3g_"
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
