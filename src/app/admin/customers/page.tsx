"use client";

import { useState } from "react";
import Link from "next/link";

// Mock customer data
const initialCustomers = [
  {
    id: "1",
    firstName: "Ahmet",
    lastName: "Yılmaz",
    email: "ahmet@example.com",
    phone: "+90 555 111 2222",
    orderCount: 3,
    totalSpent: 2300,
    lastOrder: "02.06.2023",
    status: "active",
  },
  {
    id: "2",
    firstName: "Ayşe",
    lastName: "Demir",
    email: "ayse@example.com",
    phone: "+90 555 333 4444",
    orderCount: 1,
    totalSpent: 750,
    lastOrder: "29.05.2023",
    status: "active",
  },
  {
    id: "3",
    firstName: "Mehmet",
    lastName: "Can",
    email: "mehmet@example.com",
    phone: "+90 555 555 6666",
    orderCount: 2,
    totalSpent: 1250,
    lastOrder: "28.05.2023",
    status: "active",
  },
  {
    id: "4",
    firstName: "Zeynep",
    lastName: "Kaya",
    email: "zeynep@example.com",
    phone: "+90 555 777 8888",
    orderCount: 1,
    totalSpent: 860,
    lastOrder: "01.06.2023",
    status: "active",
  },
  {
    id: "5",
    firstName: "Mustafa",
    lastName: "Demir",
    email: "mustafa@example.com",
    phone: "+90 555 999 0000",
    orderCount: 1,
    totalSpent: 1650,
    lastOrder: "01.06.2023",
    status: "active",
  },
  {
    id: "6",
    firstName: "Fatma",
    lastName: "Aydın",
    email: "fatma@example.com",
    phone: "+90 555 121 2323",
    orderCount: 1,
    totalSpent: 3450,
    lastOrder: "31.05.2023",
    status: "inactive",
  },
  {
    id: "7",
    firstName: "Ali",
    lastName: "Yıldız",
    email: "ali@example.com",
    phone: "+90 555 343 4545",
    orderCount: 1,
    totalSpent: 1200,
    lastOrder: "30.05.2023",
    status: "active",
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orderCountFilter, setOrderCountFilter] = useState("");

  // Filter customers based on search and filters
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      (customer.firstName + " " + customer.lastName)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search);

    const matchesStatus = statusFilter
      ? customer.status === statusFilter
      : true;

    let matchesOrderCount = true;
    if (orderCountFilter === "none") {
      matchesOrderCount = customer.orderCount === 0;
    } else if (orderCountFilter === "one") {
      matchesOrderCount = customer.orderCount === 1;
    } else if (orderCountFilter === "multiple") {
      matchesOrderCount = customer.orderCount > 1;
    }

    return matchesSearch && matchesStatus && matchesOrderCount;
  });

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
    };

    const statusLabels: Record<string, string> = {
      active: "Aktif",
      inactive: "Pasif",
    };

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}
        data-oid="p2rmcxf"
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div data-oid=".7c04m2">
      <header className="mb-8" data-oid="fwwhx_n">
        <h1 className="text-2xl font-bold text-gray-900" data-oid="niz1eh8">
          Müşteriler
        </h1>
        <p className="text-gray-500" data-oid="yvuo7xl">
          Tüm müşterileri görüntüleyin ve yönetin
        </p>
      </header>

      {/* Stats */}
      <div
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        data-oid="eu9oxai"
      >
        <div className="bg-white rounded-xl shadow-sm p-6" data-oid="owweo5t">
          <div
            className="text-sm font-medium text-gray-500 mb-1"
            data-oid="eh-jnx6"
          >
            Toplam Müşteri
          </div>
          <div className="text-2xl font-semibold" data-oid="ie1_n:2">
            {customers.length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6" data-oid=".p:u7lf">
          <div
            className="text-sm font-medium text-gray-500 mb-1"
            data-oid="j1okkj9"
          >
            Aktif Müşteriler
          </div>
          <div
            className="text-2xl font-semibold text-green-600"
            data-oid="lv-x.ps"
          >
            {customers.filter((c) => c.status === "active").length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6" data-oid="vso_8a5">
          <div
            className="text-sm font-medium text-gray-500 mb-1"
            data-oid="0hkgthw"
          >
            Bu Ay Yeni
          </div>
          <div
            className="text-2xl font-semibold text-blue-600"
            data-oid="eb72of4"
          >
            3
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6" data-oid="5nwhd_n">
          <div
            className="text-sm font-medium text-gray-500 mb-1"
            data-oid="vo3:hoe"
          >
            Ortalama Sipariş
          </div>
          <div className="text-2xl font-semibold" data-oid="0k.re59">
            ₺
            {Math.round(
              customers.reduce((acc, c) => acc + c.totalSpent, 0) /
                customers.reduce((acc, c) => acc + c.orderCount, 0),
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="bg-white shadow-sm rounded-xl p-4 mb-6 grid gap-4 grid-cols-1 md:grid-cols-3"
        data-oid="n8mpx:v"
      >
        <div data-oid="gsj.7og">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="69oxccj"
          >
            Arama
          </label>
          <div className="relative" data-oid="-1.z1u7">
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              data-oid="st31sn:"
            >
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="of_e_c3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  data-oid="wwhk56w"
                />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İsim, e-posta veya telefon"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
              data-oid="mzvld2u"
            />
          </div>
        </div>

        <div data-oid="c4weazu">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="odas_1:"
          >
            Durum
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="k9bo5v_"
          >
            <option value="" data-oid=":c37tb1">
              Tüm Durumlar
            </option>
            <option value="active" data-oid="it02m-t">
              Aktif
            </option>
            <option value="inactive" data-oid="w3ua_nz">
              Pasif
            </option>
          </select>
        </div>

        <div data-oid="8y5ueo7">
          <label
            htmlFor="orderCount"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="n8-w:.k"
          >
            Sipariş Sayısı
          </label>
          <select
            id="orderCount"
            value={orderCountFilter}
            onChange={(e) => setOrderCountFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="9ra86e3"
          >
            <option value="" data-oid="o-1:cec">
              Tümü
            </option>
            <option value="none" data-oid="r8wv-a4">
              Hiç sipariş vermedi
            </option>
            <option value="one" data-oid="hofb.4-">
              Tek sipariş
            </option>
            <option value="multiple" data-oid="tqa_xqm">
              Birden fazla sipariş
            </option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div
        className="bg-white shadow-sm rounded-xl overflow-hidden"
        data-oid="lvx3hxx"
      >
        <div className="overflow-x-auto" data-oid="q8.ezg3">
          <table
            className="min-w-full divide-y divide-gray-200"
            data-oid="ezf47az"
          >
            <thead className="bg-gray-50" data-oid="gg7fqi2">
              <tr data-oid="i6uk-6w">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="k01xwj_"
                >
                  Müşteri
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="twhwg1e"
                >
                  İletişim
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="ir2a0kh"
                >
                  Siparişler
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="jpmbay5"
                >
                  Toplam Harcama
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="4pitj.r"
                >
                  Son Sipariş
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="3w3:qmk"
                >
                  Durum
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="l0tmv7o"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody
              className="bg-white divide-y divide-gray-200"
              data-oid="zxalz7-"
            >
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50"
                  data-oid="gy6a:._"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="se9e-fu"
                  >
                    <div className="flex items-center" data-oid="3hco2_b">
                      <div
                        className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center"
                        data-oid="_3cx-:e"
                      >
                        <span
                          className="font-medium text-gray-700"
                          data-oid="crj.cye"
                        >
                          {customer.firstName[0]}
                          {customer.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4" data-oid="nqso7uc">
                        <div
                          className="text-sm font-medium text-gray-900"
                          data-oid="ibbfho2"
                        >
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div
                          className="text-sm text-gray-500"
                          data-oid="9i7-.6n"
                        >
                          Müşteri ID: #{customer.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="po10d9."
                  >
                    <div className="text-sm text-gray-900" data-oid="h6s_dtf">
                      {customer.email}
                    </div>
                    <div className="text-sm text-gray-500" data-oid="7h32ezt">
                      {customer.phone}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="dh6mtks"
                  >
                    {customer.orderCount}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="nm9bz0r"
                  >
                    ₺{customer.totalSpent.toLocaleString()}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    data-oid="_novjt-"
                  >
                    {customer.lastOrder}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="7ieyz2q"
                  >
                    <StatusBadge status={customer.status} data-oid="_ob8tea" />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    data-oid="rh4du08"
                  >
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-primary hover:text-primary-dark mr-3"
                      data-oid="xjr9r3k"
                    >
                      Görüntüle
                    </Link>
                    <button
                      onClick={() => {
                        const newStatus =
                          customer.status === "active" ? "inactive" : "active";
                        setCustomers(
                          customers.map((c) =>
                            c.id === customer.id
                              ? { ...c, status: newStatus }
                              : c,
                          ),
                        );
                      }}
                      className={
                        customer.status === "active"
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      }
                      data-oid="omolhar"
                    >
                      {customer.status === "active" ? "Pasif Yap" : "Aktif Yap"}
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
          data-oid="y76z3.w"
        >
          <div className="text-sm text-gray-700" data-oid="2hcyu7o">
            <span className="font-medium" data-oid="snjqq87">
              {filteredCustomers.length}
            </span>{" "}
            müşteri gösteriliyor
          </div>
          <div
            className="flex-1 flex justify-center md:justify-end"
            data-oid="3jdxbxe"
          >
            <div className="inline-flex shadow-sm" data-oid="a.jy3_u">
              <button
                className="border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-l-md"
                data-oid="yxu-c7e"
              >
                Önceki
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-primary text-white hover:bg-primary-dark px-4 py-2 text-sm font-medium"
                data-oid="7xh38k6"
              >
                1
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="nfgglqs"
              >
                2
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-r-md"
                data-oid="rhc:77o"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
