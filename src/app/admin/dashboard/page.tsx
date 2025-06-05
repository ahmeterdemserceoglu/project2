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
    <div className="bg-white rounded-xl p-6 shadow-sm" data-oid="kw9ej0a">
      <div
        className="flex items-center justify-between mb-4"
        data-oid="pqb6997"
      >
        <div className="text-gray-500 font-medium" data-oid="l15zy92">
          {title}
        </div>
        <div className="text-gray-400" data-oid="sgf4sh7">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-2" data-oid="vgfd41o">
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
          data-oid="g-7.e5l"
        >
          {changeType === "increase" && (
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="03qs1bc"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
                data-oid=".1pqao:"
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
              data-oid="jqq5k3w"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
                data-oid="mqsq0zl"
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
    <div className="flex space-x-3" data-oid="tp8szci">
      <div
        className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary"
        data-oid="n5w10gi"
      >
        {icon}
      </div>
      <div data-oid="m9kz_s3">
        <h4 className="text-sm font-medium text-gray-900" data-oid="-j8wfuj">
          {title}
        </h4>
        <p className="text-sm text-gray-500" data-oid="lqw5n--">
          {content}
        </p>
        <span className="text-xs text-gray-400" data-oid="i9::vw:">
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
    <div className="bg-white rounded-xl shadow-sm p-6" data-oid=".r6uxq1">
      <div
        className="flex justify-between items-center mb-6"
        data-oid="xfugnyf"
      >
        <h3 className="text-lg font-semibold" data-oid="lhdi:6h">
          Son Siparişler
        </h3>
        <Link
          href="/admin/orders"
          className="text-primary hover:text-primary-dark text-sm font-medium"
          data-oid="7xh55z_"
        >
          Tümünü Gör
        </Link>
      </div>
      <div className="overflow-x-auto" data-oid="b68b-6:">
        <table className="min-w-full" data-oid="rqulfey">
          <thead data-oid="j4n__pt">
            <tr
              className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              data-oid="9ocw1zh"
            >
              <th className="pb-3" data-oid="ge6:-r8">
                Sipariş No
              </th>
              <th className="pb-3" data-oid="4jrc3py">
                Müşteri
              </th>
              <th className="pb-3" data-oid="mj93s8.">
                Tarih
              </th>
              <th className="pb-3" data-oid="c0ja928">
                Durum
              </th>
              <th className="pb-3 text-right" data-oid="vb1cqwj">
                Toplam
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200" data-oid="bkuk_hl">
            {orders.map((order) => (
              <tr key={order.id} className="text-sm" data-oid="evyts2:">
                <td
                  className="py-3 text-primary font-medium"
                  data-oid="1j9aq96"
                >
                  <Link href={`/admin/orders/${order.id}`} data-oid="a08c:rw">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="py-3 text-gray-900" data-oid="g5eqqv.">
                  {order.customer}
                </td>
                <td className="py-3 text-gray-500" data-oid=".zq8z2g">
                  {order.date}
                </td>
                <td className="py-3" data-oid="h-wu1ys">
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
                    data-oid="6m0zquf"
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
                  data-oid=".w.b58z"
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
    <div className="bg-white rounded-xl shadow-sm p-6" data-oid="9595m4d">
      <div
        className="flex justify-between items-center mb-6"
        data-oid="awkanhp"
      >
        <h3 className="text-lg font-semibold" data-oid="13fpmh9">
          En Çok Satan Ürünler
        </h3>
        <Link
          href="/admin/products"
          className="text-primary hover:text-primary-dark text-sm font-medium"
          data-oid="x3-5h-l"
        >
          Tümünü Gör
        </Link>
      </div>
      <div className="overflow-x-auto" data-oid="fi.ai49">
        <table className="min-w-full" data-oid="a_s.kbs">
          <thead data-oid="tbebw2x">
            <tr
              className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              data-oid=":y7fky5"
            >
              <th className="pb-3" data-oid="5f0jaws">
                Ürün
              </th>
              <th className="pb-3" data-oid=".7o6hwh">
                Kategori
              </th>
              <th className="pb-3 text-right" data-oid="yai1:90">
                Satış
              </th>
              <th className="pb-3 text-right" data-oid="5dkg61w">
                Hasılat
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200" data-oid="bkslu0-">
            {products.map((product) => (
              <tr key={product.id} className="text-sm" data-oid="r2ol73u">
                <td
                  className="py-3 text-gray-900 font-medium"
                  data-oid="esslux8"
                >
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="hover:text-primary"
                    data-oid="yqs6n7y"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="py-3 text-gray-500" data-oid="a6q9e_u">
                  {product.category}
                </td>
                <td
                  className="py-3 text-right text-gray-900"
                  data-oid="am69_9w"
                >
                  {product.sold}
                </td>
                <td
                  className="py-3 text-right text-gray-900"
                  data-oid="n06a0oi"
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
    <div className="bg-white rounded-xl shadow-sm p-6" data-oid="n5te_lq">
      <div
        className="flex justify-between items-center mb-6"
        data-oid="pnra7pb"
      >
        <h3 className="text-lg font-semibold" data-oid="49a3pin">
          Satış Grafiği
        </h3>
        <div className="flex space-x-2 text-sm" data-oid="-xowxbd">
          <button
            className="px-3 py-1 rounded bg-primary text-white"
            data-oid="mjwpa-s"
          >
            Günlük
          </button>
          <button
            className="px-3 py-1 rounded hover:bg-gray-100"
            data-oid="xuqvu4g"
          >
            Haftalık
          </button>
          <button
            className="px-3 py-1 rounded hover:bg-gray-100"
            data-oid="z9mx4cr"
          >
            Aylık
          </button>
        </div>
      </div>
      <div
        className="h-64 flex flex-col justify-center items-center bg-gray-50 rounded-lg border border-dashed border-gray-300"
        data-oid="azf_ztl"
      >
        <div className="text-gray-400 mb-2" data-oid="6c630gi">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            data-oid="qze8u27"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              data-oid="f.ubm2a"
            ></path>
          </svg>
        </div>
        <p className="text-gray-500" data-oid="_dgqwod">
          Gerçek bir uygulamada burada interaktif bir grafik gösterilecektir
        </p>
        <p className="text-gray-400 text-sm mt-2" data-oid="tdnljqj">
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
    <div data-oid="5a1f.:m">
      <header
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        data-oid="ksguxkv"
      >
        <div data-oid="1:9hedy">
          <h1 className="text-2xl font-bold text-gray-900" data-oid="c6ghi7h">
            Gösterge Paneli
          </h1>
          <p className="text-gray-500" data-oid="t.6:hnd">
            Mağazanız için genel bakış ve istatistikler
          </p>
        </div>
        <div className="flex items-center space-x-3" data-oid="t6r-08x">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="3uw1ayr"
          >
            <option value="today" data-oid="va3e77d">
              Bugün
            </option>
            <option value="week" data-oid="7ofqx37">
              Bu Hafta
            </option>
            <option value="month" data-oid="tlvk8c8">
              Bu Ay
            </option>
            <option value="year" data-oid="d45lwjq">
              Bu Yıl
            </option>
          </select>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            data-oid="v9gcnwf"
          >
            Rapor İndir
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        data-oid="ui1ellh"
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
              data-oid="u4g:3:a"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                data-oid="7xj_pbx"
              ></path>
            </svg>
          }
          change="+8.2% geçen haftaya göre"
          changeType="increase"
          data-oid="2cr-p:r"
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
              data-oid="3tssy_."
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                data-oid="6ci2fyk"
              ></path>
            </svg>
          }
          change="+12.5% geçen haftaya göre"
          changeType="increase"
          data-oid="aczabzk"
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
              data-oid="t56mymr"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                data-oid="gl0fy2s"
              ></path>
            </svg>
          }
          change="+3.1% geçen haftaya göre"
          changeType="increase"
          data-oid="jirez.i"
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
              data-oid="2hir.s."
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                data-oid="xo08nas"
              ></path>
            </svg>
          }
          change="-2.5% geçen haftaya göre"
          changeType="decrease"
          data-oid="izvvxsd"
        />
      </div>

      {/* Charts Row */}
      <div className="mb-8" data-oid="lgvsot.">
        <RevenueChart data-oid="73n4uxd" />
      </div>

      {/* Two Columns Layout for Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-oid="8_r5kzf">
        <RecentOrders data-oid="8s1vu04" />
        <TopProducts data-oid="vqcch_v" />
      </div>
    </div>
  );
}
