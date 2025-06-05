"use client";

import Link from "next/link";
import { useState } from "react";

// Stats Card component
const StatsCard = ({
  title,
  value,
  icon,
  change,
  changeType,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm" data-oid="rp25_70">
      <div
        className="flex items-center justify-between mb-4"
        data-oid="_nk4ptk"
      >
        <div className="text-gray-500 font-medium" data-oid="yisvlw2">
          {title}
        </div>
        <div className="text-gray-400" data-oid="2oxim3.">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-2" data-oid="-72m30s">
        {value}
      </div>
      {change && (
        <div
          className={`text-sm flex items-center ${
            changeType === "increase"
              ? "text-green-600"
              : changeType === "decrease"
                ? "text-red-600"
                : "text-gray-500"
          }`}
          data-oid="fyr.su2"
        >
          {changeType === "increase" && (
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="6nlre:f"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
                data-oid="jcw8bp3"
              ></path>
            </svg>
          )}
          {changeType === "decrease" && (
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="cl:xhwk"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
                data-oid="id6_0i_"
              ></path>
            </svg>
          )}
          {change}
        </div>
      )}
    </div>
  );
};

// Recent activity item component
const ActivityItem = ({
  title,
  time,
  content,
  icon,
}: {
  title: string;
  time: string;
  content: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex space-x-3" data-oid="z:fg4.8">
      <div
        className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary"
        data-oid="5tndz9a"
      >
        {icon}
      </div>
      <div data-oid="fjd2mio">
        <h4 className="text-sm font-medium text-gray-900" data-oid="bg:lngu">
          {title}
        </h4>
        <p className="text-sm text-gray-500" data-oid="59wz_jt">
          {content}
        </p>
        <span className="text-xs text-gray-400" data-oid="ivrxwaq">
          {time}
        </span>
      </div>
    </div>
  );
};

// Recent Orders component
const RecentOrders = () => {
  const orders = [
    {
      id: "1",
      orderNumber: "HD-1007",
      customer: "Mehmet Can",
      date: "28.05.2023",
      status: "delivered",
      total: 1250,
    },
    {
      id: "2",
      orderNumber: "HD-1006",
      customer: "Ayşe Demir",
      date: "29.05.2023",
      status: "cancelled",
      total: 750,
    },
    {
      id: "3",
      orderNumber: "HD-1005",
      customer: "Ali Yıldız",
      date: "30.05.2023",
      status: "delivered",
      total: 1200,
    },
    {
      id: "4",
      orderNumber: "HD-1004",
      customer: "Fatma Aydın",
      date: "31.05.2023",
      status: "pending",
      total: 3450,
    },
    {
      id: "5",
      orderNumber: "HD-1003",
      customer: "Mustafa Demir",
      date: "01.06.2023",
      status: "processing",
      total: 1650,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" data-oid="sc0goik">
      <div
        className="flex justify-between items-center mb-6"
        data-oid="hc.g476"
      >
        <h3 className="text-lg font-semibold" data-oid="tud97mg">
          Son Siparişler
        </h3>
        <Link
          href="/admin/orders"
          className="text-primary hover:text-primary-dark text-sm font-medium"
          data-oid="dsj.rv7"
        >
          Tümünü Gör
        </Link>
      </div>
      <div className="overflow-x-auto" data-oid="99w1du:">
        <table className="min-w-full" data-oid="isbry:o">
          <thead data-oid="l6d_9gh">
            <tr
              className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              data-oid="v.n-hko"
            >
              <th className="pb-3" data-oid="31fu0yo">
                Sipariş No
              </th>
              <th className="pb-3" data-oid="hhhx6t.">
                Müşteri
              </th>
              <th className="pb-3" data-oid="0g1oj2z">
                Tarih
              </th>
              <th className="pb-3" data-oid="l76cewz">
                Durum
              </th>
              <th className="pb-3 text-right" data-oid=":2ap.7l">
                Toplam
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200" data-oid="6zy3zn1">
            {orders.map((order) => (
              <tr key={order.id} className="text-sm" data-oid="1:p4g5m">
                <td
                  className="py-3 text-primary font-medium"
                  data-oid="x67nkob"
                >
                  <Link href={`/admin/orders/${order.id}`} data-oid="we93hok">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="py-3 text-gray-900" data-oid="2a6m1i9">
                  {order.customer}
                </td>
                <td className="py-3 text-gray-500" data-oid="apz6:w_">
                  {order.date}
                </td>
                <td className="py-3" data-oid="7:s32m6">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                    }`}
                    data-oid="v5p33-s"
                  >
                    {order.status === "delivered"
                      ? "Teslim Edildi"
                      : order.status === "processing"
                        ? "Hazırlanıyor"
                        : order.status === "pending"
                          ? "Bekliyor"
                          : "İptal Edildi"}
                  </span>
                </td>
                <td
                  className="py-3 text-right text-gray-900"
                  data-oid=":bojgjd"
                >
                  ₺{order.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Top Products component
const TopProducts = () => {
  const products = [
    {
      id: "1",
      name: "iPhone 13 Pro Max",
      category: "Elektronik",
      sold: 45,
      revenue: 1259955,
    },
    {
      id: "2",
      name: "Samsung Galaxy S21",
      category: "Elektronik",
      sold: 32,
      revenue: 543997,
    },
    {
      id: "3",
      name: 'MacBook Pro 16"',
      category: "Bilgisayarlar",
      sold: 15,
      revenue: 584998,
    },
    {
      id: "4",
      name: "Bluetooth Kulaklık",
      category: "Elektronik",
      sold: 72,
      revenue: 21593,
    },
    {
      id: "5",
      name: "Erkek Spor Ayakkabı",
      category: "Giyim",
      sold: 68,
      revenue: 61173,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" data-oid="u.o3390">
      <div
        className="flex justify-between items-center mb-6"
        data-oid="_vq0p-j"
      >
        <h3 className="text-lg font-semibold" data-oid="2skwhhv">
          En Çok Satan Ürünler
        </h3>
        <Link
          href="/admin/products"
          className="text-primary hover:text-primary-dark text-sm font-medium"
          data-oid="rlv.tjg"
        >
          Tümünü Gör
        </Link>
      </div>
      <div className="overflow-x-auto" data-oid="835xul8">
        <table className="min-w-full" data-oid="o6_4l0-">
          <thead data-oid="736:ff7">
            <tr
              className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              data-oid="tkr_m6x"
            >
              <th className="pb-3" data-oid="dg3p5-9">
                Ürün
              </th>
              <th className="pb-3" data-oid="-a0coww">
                Kategori
              </th>
              <th className="pb-3 text-right" data-oid="isc4_6r">
                Satış
              </th>
              <th className="pb-3 text-right" data-oid="zb5p5rs">
                Hasılat
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200" data-oid="24xeycz">
            {products.map((product) => (
              <tr key={product.id} className="text-sm" data-oid="8y-4hrx">
                <td
                  className="py-3 text-gray-900 font-medium"
                  data-oid="hhdc14t"
                >
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="hover:text-primary"
                    data-oid="9:5.f5q"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="py-3 text-gray-500" data-oid="veahb96">
                  {product.category}
                </td>
                <td
                  className="py-3 text-right text-gray-900"
                  data-oid="bq2z_kp"
                >
                  {product.sold}
                </td>
                <td
                  className="py-3 text-right text-gray-900"
                  data-oid="b31ok75"
                >
                  ₺{product.revenue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Revenue Chart component (placeholder - would be a real chart in a real app)
const RevenueChart = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6" data-oid=".y60slu">
      <div
        className="flex justify-between items-center mb-6"
        data-oid="oi0ny20"
      >
        <h3 className="text-lg font-semibold" data-oid="1ljcp2i">
          Satış Grafiği
        </h3>
        <div className="flex space-x-2 text-sm" data-oid="wqznjke">
          <button
            className="px-3 py-1 rounded bg-primary text-white"
            data-oid="mbz6crr"
          >
            Günlük
          </button>
          <button
            className="px-3 py-1 rounded hover:bg-gray-100"
            data-oid="vo6486t"
          >
            Haftalık
          </button>
          <button
            className="px-3 py-1 rounded hover:bg-gray-100"
            data-oid="9txzl4q"
          >
            Aylık
          </button>
        </div>
      </div>
      <div
        className="h-64 flex flex-col justify-center items-center bg-gray-50 rounded-lg border border-dashed border-gray-300"
        data-oid="3ub0byr"
      >
        <div className="text-gray-400 mb-2" data-oid="i63y8u4">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            data-oid="-hixckt"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              data-oid="0rrppcy"
            ></path>
          </svg>
        </div>
        <p className="text-gray-500" data-oid="61rr3-n">
          Gerçek bir uygulamada burada interaktif bir grafik gösterilecektir
        </p>
        <p className="text-gray-400 text-sm mt-2" data-oid="79d-djo">
          Örneğin: Chart.js, Recharts veya Nivo kullanılabilir
        </p>
      </div>
    </div>
  );
};

// Main Dashboard component
export default function AdminDashboardPage() {
  // Time period for filtering data
  const [period, setPeriod] = useState("week");

  return (
    <div data-oid="a8c-efz">
      <header
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        data-oid="2gemqh."
      >
        <div data-oid="k7l9oeh">
          <h1 className="text-2xl font-bold text-gray-900" data-oid="kubr-75">
            Gösterge Paneli
          </h1>
          <p className="text-gray-500" data-oid="6eg4a6i">
            Mağazanız için genel bakış ve istatistikler
          </p>
        </div>
        <div className="flex items-center space-x-3" data-oid="zq7blcs">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="qemzuy3"
          >
            <option value="today" data-oid="pfg6fts">
              Bugün
            </option>
            <option value="week" data-oid="prn2gbb">
              Bu Hafta
            </option>
            <option value="month" data-oid="zvy0fct">
              Bu Ay
            </option>
            <option value="year" data-oid="ihf59d1">
              Bu Yıl
            </option>
          </select>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            data-oid="x-3iy_9"
          >
            Rapor İndir
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        data-oid="54f73mz"
      >
        <StatsCard
          title="Toplam Satış"
          value="₺42,249.50"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="109swfb"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                data-oid="d5-tmc."
              ></path>
            </svg>
          }
          change="+8.2% geçen haftaya göre"
          changeType="increase"
          data-oid="wgcu-ha"
        />

        <StatsCard
          title="Siparişler"
          value="125"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="i0qbv8z"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                data-oid="jednp6j"
              ></path>
            </svg>
          }
          change="+12.5% geçen haftaya göre"
          changeType="increase"
          data-oid="knvuflb"
        />

        <StatsCard
          title="Müşteriler"
          value="1,240"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="lr9k1bu"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                data-oid="m9izn7g"
              ></path>
            </svg>
          }
          change="+3.1% geçen haftaya göre"
          changeType="increase"
          data-oid="lq6xftm"
        />

        <StatsCard
          title="Ortalama Sipariş"
          value="₺338.00"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="6dowqwg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                data-oid="uihhsq5"
              ></path>
            </svg>
          }
          change="-2.5% geçen haftaya göre"
          changeType="decrease"
          data-oid="nrhxgc5"
        />
      </div>

      {/* Charts Row */}
      <div className="mb-8" data-oid="hu0_yti">
        <RevenueChart data-oid="0n9sk.d" />
      </div>

      {/* Two Columns Layout for Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-oid="s5onx__">
        <RecentOrders data-oid="bvqreet" />
        <TopProducts data-oid="z-7qxei" />
      </div>
    </div>
  );
}
