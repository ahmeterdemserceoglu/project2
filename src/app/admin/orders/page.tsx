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
        data-oid="rywiy9z"
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
        data-oid="nqwphmi"
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
    <div data-oid="8.9dfod">
      <header className="mb-8" data-oid="_ex164c">
        <h1 className="text-2xl font-bold text-gray-900" data-oid="2z_n493">
          Siparişler
        </h1>
        <p className="text-gray-500" data-oid="00.-yqn">
          Tüm siparişleri görüntüleyin ve yönetin
        </p>
      </header>

      {/* Filters */}
      <div
        className="bg-white shadow-sm rounded-xl p-4 mb-6 grid gap-4 grid-cols-1 md:grid-cols-3"
        data-oid="u77t5vu"
      >
        <div data-oid="gvk_h8v">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="-qzjike"
          >
            Arama
          </label>
          <div className="relative" data-oid="02sdmvb">
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              data-oid="6z8we1i"
            >
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="8sglhpw"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  data-oid="4.9x6r7"
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
              data-oid="8--4l66"
            />
          </div>
        </div>

        <div data-oid="lgckash">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="k23-rdv"
          >
            Durum
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="sun5qgk"
          >
            <option value="" data-oid="47ov:fr">
              Tüm Durumlar
            </option>
            <option value="pending" data-oid="4tkpb28">
              Bekliyor
            </option>
            <option value="processing" data-oid="5teyysb">
              Hazırlanıyor
            </option>
            <option value="shipped" data-oid="su6xgul">
              Kargoya Verildi
            </option>
            <option value="delivered" data-oid="gzpupk-">
              Teslim Edildi
            </option>
            <option value="cancelled" data-oid="-cis4sa">
              İptal Edildi
            </option>
          </select>
        </div>

        <div data-oid="_4._kjh">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="ibm749w"
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
            data-oid="ts4:3q."
          />
        </div>
      </div>

      {/* Orders Table */}
      <div
        className="bg-white shadow-sm rounded-xl overflow-hidden"
        data-oid="ricc_0s"
      >
        <div className="overflow-x-auto" data-oid="..lgb7p">
          <table
            className="min-w-full divide-y divide-gray-200"
            data-oid="0mz3nu5"
          >
            <thead className="bg-gray-50" data-oid="qjxg.hx">
              <tr data-oid="tzf70lt">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="yrflub2"
                >
                  Sipariş No
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="a3i0-l7"
                >
                  Müşteri
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="f8gx9az"
                >
                  Tarih
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="16gq10w"
                >
                  Durum
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="4577tz:"
                >
                  Ödeme
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="6gwb:l9"
                >
                  Toplam
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="pn-mq:x"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody
              className="bg-white divide-y divide-gray-200"
              data-oid="fvky_a2"
            >
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50"
                  data-oid="uhgbhl9"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary"
                    data-oid="7rfxjwv"
                  >
                    {order.orderNumber}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="9eniyq6"
                  >
                    {order.customerName}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    data-oid="l6fbrk-"
                  >
                    {order.date}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="ah3tmtt"
                  >
                    <StatusBadge status={order.status} data-oid="hhe7381" />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="kpkp7nm"
                  >
                    <PaymentBadge
                      status={order.paymentStatus}
                      data-oid="o.fypu1"
                    />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="c-ky:t3"
                  >
                    ₺{order.total.toLocaleString()}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    data-oid="4lcdxru"
                  >
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-primary hover:text-primary-dark mr-3"
                      data-oid="2d._twl"
                    >
                      Görüntüle
                    </Link>
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      data-oid="k8s-vqc"
                    >
                      <span className="sr-only" data-oid="1ik-b-t">
                        Status güncelle
                      </span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        data-oid="as7ip7t"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                          data-oid="gwr9m9v"
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
          data-oid="x2djz7d"
        >
          <div className="text-sm text-gray-700" data-oid="tk95mif">
            <span className="font-medium" data-oid="5q56upp">
              {filteredOrders.length}
            </span>{" "}
            sonuç gösteriliyor
          </div>
          <div
            className="flex-1 flex justify-center md:justify-end"
            data-oid=":-pf9jf"
          >
            <div className="inline-flex shadow-sm" data-oid="irha_zt">
              <button
                className="border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-l-md"
                data-oid="i4xfsd_"
              >
                Önceki
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="17w5x7d"
              >
                1
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-primary text-white hover:bg-primary-dark px-4 py-2 text-sm font-medium"
                data-oid="apui_tt"
              >
                2
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="_g_egaf"
              >
                3
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-r-md"
                data-oid="ccwucny"
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
        data-oid="wohj-qb"
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          data-oid="pt2ttt1"
        >
          <h3
            className="text-lg font-medium text-gray-900 mb-4"
            data-oid="20:_2x3"
          >
            Sipariş Durumunu Güncelle
          </h3>
          <div className="space-y-4" data-oid="pbh-ocq">
            <div data-oid="0tmcd-:">
              <label
                className="block text-sm font-medium text-gray-700"
                data-oid="jrhrhfb"
              >
                Yeni Durum
              </label>
              <select
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                data-oid=".2eia-1"
              >
                <option value="pending" data-oid="__sj0pi">
                  Bekliyor
                </option>
                <option value="processing" data-oid="aofknkz">
                  Hazırlanıyor
                </option>
                <option value="shipped" data-oid="b7kk7s-">
                  Kargoya Verildi
                </option>
                <option value="delivered" data-oid="h0mq42y">
                  Teslim Edildi
                </option>
                <option value="cancelled" data-oid="damfp--">
                  İptal Edildi
                </option>
              </select>
            </div>
            <div data-oid="6xeutzj">
              <label
                className="block text-sm font-medium text-gray-700"
                data-oid="_n7_.hc"
              >
                Açıklama (Opsiyonel)
              </label>
              <textarea
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                rows={3}
                data-oid="pllzscm"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3" data-oid="mvg5r7k">
              <button
                className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                data-oid="bub80wd"
              >
                İptal
              </button>
              <button
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                data-oid="k:9_rbk"
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
