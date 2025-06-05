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
        data-oid="satl9yd"
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
        data-oid="m99j:6h"
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
    <div data-oid="o.3_4rk">
      <header className="mb-8" data-oid="jmz.7n0">
        <h1 className="text-2xl font-bold text-gray-900" data-oid="z64tm5p">
          Siparişler
        </h1>
        <p className="text-gray-500" data-oid="4:ii5:o">
          Tüm siparişleri görüntüleyin ve yönetin
        </p>
      </header>

      {/* Filters */}
      <div
        className="bg-white shadow-sm rounded-xl p-4 mb-6 grid gap-4 grid-cols-1 md:grid-cols-3"
        data-oid="x11x74_"
      >
        <div data-oid="8qhnssb">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid=":akqmya"
          >
            Arama
          </label>
          <div className="relative" data-oid="wbt72f-">
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              data-oid="dn42_e-"
            >
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="y2:4ug5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  data-oid="7n55gw9"
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
              data-oid="dyt7.9k"
            />
          </div>
        </div>

        <div data-oid="_:28.uv">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="zjgit1m"
          >
            Durum
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="ok7ffoe"
          >
            <option value="" data-oid="4wnu02:">
              Tüm Durumlar
            </option>
            <option value="pending" data-oid="y15x9cj">
              Bekliyor
            </option>
            <option value="processing" data-oid=".inj14z">
              Hazırlanıyor
            </option>
            <option value="shipped" data-oid="wyc2r3h">
              Kargoya Verildi
            </option>
            <option value="delivered" data-oid="yaan1p7">
              Teslim Edildi
            </option>
            <option value="cancelled" data-oid="lu:rxni">
              İptal Edildi
            </option>
          </select>
        </div>

        <div data-oid="nopokyi">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="fh4e813"
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
            data-oid="m-zznav"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div
        className="bg-white shadow-sm rounded-xl overflow-hidden"
        data-oid="iteo6hy"
      >
        <div className="overflow-x-auto" data-oid="frsdga6">
          <table
            className="min-w-full divide-y divide-gray-200"
            data-oid="h20tw71"
          >
            <thead className="bg-gray-50" data-oid="6p5y4c.">
              <tr data-oid=".4q8g.i">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="2u1:9x7"
                >
                  Sipariş No
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="2w8y-fm"
                >
                  Müşteri
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="aziist_"
                >
                  Tarih
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="qy88dp9"
                >
                  Durum
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="244a6xv"
                >
                  Ödeme
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="8bb6q-y"
                >
                  Toplam
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="37e374d"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody
              className="bg-white divide-y divide-gray-200"
              data-oid="rt51.8s"
            >
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50"
                  data-oid="gd7637h"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary"
                    data-oid="jyqt4n9"
                  >
                    {order.orderNumber}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="t8gjisk"
                  >
                    {order.customerName}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    data-oid="55ji0vu"
                  >
                    {order.date}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="ofdfmib"
                  >
                    <StatusBadge status={order.status} data-oid="b4yfuz0" />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="u.yn4uu"
                  >
                    <PaymentBadge
                      status={order.paymentStatus}
                      data-oid="p.mk6oy"
                    />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="nduwbe4"
                  >
                    ₺{order.total.toLocaleString()}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    data-oid="39mbwt5"
                  >
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-primary hover:text-primary-dark mr-3"
                      data-oid="0-nshk8"
                    >
                      Görüntüle
                    </Link>
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      data-oid="nvq6wah"
                    >
                      <span className="sr-only" data-oid="krwj7ao">
                        Status güncelle
                      </span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        data-oid="5g1.s0j"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                          data-oid="ny00cfg"
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
          data-oid="ydc-f69"
        >
          <div className="text-sm text-gray-700" data-oid="ez7:gaz">
            <span className="font-medium" data-oid="cplweb8">
              {filteredOrders.length}
            </span>{" "}
            sonuç gösteriliyor
          </div>
          <div
            className="flex-1 flex justify-center md:justify-end"
            data-oid="iryd2vd"
          >
            <div className="inline-flex shadow-sm" data-oid="bqtmwx_">
              <button
                className="border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-l-md"
                data-oid="w:bt192"
              >
                Önceki
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="h_cf.6_"
              >
                1
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-primary text-white hover:bg-primary-dark px-4 py-2 text-sm font-medium"
                data-oid="ot2rj4h"
              >
                2
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="c7bes6t"
              >
                3
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-r-md"
                data-oid="c6mthqf"
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
        data-oid="97vadxz"
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          data-oid="w1rug4s"
        >
          <h3
            className="text-lg font-medium text-gray-900 mb-4"
            data-oid="nof7prv"
          >
            Sipariş Durumunu Güncelle
          </h3>
          <div className="space-y-4" data-oid="rsl8aue">
            <div data-oid="eo2eypo">
              <label
                className="block text-sm font-medium text-gray-700"
                data-oid="l150h2_"
              >
                Yeni Durum
              </label>
              <select
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                data-oid="d1rg97p"
              >
                <option value="pending" data-oid="x0h0:96">
                  Bekliyor
                </option>
                <option value="processing" data-oid="_1rtpgy">
                  Hazırlanıyor
                </option>
                <option value="shipped" data-oid="pjsih-f">
                  Kargoya Verildi
                </option>
                <option value="delivered" data-oid="94dliw.">
                  Teslim Edildi
                </option>
                <option value="cancelled" data-oid="zdb:aiy">
                  İptal Edildi
                </option>
              </select>
            </div>
            <div data-oid="eh_1:cm">
              <label
                className="block text-sm font-medium text-gray-700"
                data-oid="ai4srar"
              >
                Açıklama (Opsiyonel)
              </label>
              <textarea
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                rows={3}
                data-oid="nuixa2a"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3" data-oid="liu_k3.">
              <button
                className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                data-oid="ah.:5m9"
              >
                İptal
              </button>
              <button
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                data-oid="i8l7-02"
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
