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
        data-oid="w6vkx:1"
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div data-oid="zi_swpu">
      <header className="mb-8" data-oid="nplshc2">
        <h1 className="text-2xl font-bold text-gray-900" data-oid="jtzn6ce">
          Müşteriler
        </h1>
        <p className="text-gray-500" data-oid="5yeph:m">
          Tüm müşterileri görüntüleyin ve yönetin
        </p>
      </header>

      {/* Stats */}
      <div
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        data-oid="25izwd_"
      >
        <div className="bg-white rounded-xl shadow-sm p-6" data-oid="663txuy">
          <div
            className="text-sm font-medium text-gray-500 mb-1"
            data-oid="-lvwlii"
          >
            Toplam Müşteri
          </div>
          <div className="text-2xl font-semibold" data-oid="5tjps3o">
            {customers.length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6" data-oid=":znaaqv">
          <div
            className="text-sm font-medium text-gray-500 mb-1"
            data-oid="42o3siz"
          >
            Aktif Müşteriler
          </div>
          <div
            className="text-2xl font-semibold text-green-600"
            data-oid="cy2bwt6"
          >
            {customers.filter((c) => c.status === "active").length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6" data-oid="ew_dmwm">
          <div
            className="text-sm font-medium text-gray-500 mb-1"
            data-oid="v492y5r"
          >
            Bu Ay Yeni
          </div>
          <div
            className="text-2xl font-semibold text-blue-600"
            data-oid="pwom..o"
          >
            3
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6" data-oid="uiqi9sl">
          <div
            className="text-sm font-medium text-gray-500 mb-1"
            data-oid="nrihqeq"
          >
            Ortalama Sipariş
          </div>
          <div className="text-2xl font-semibold" data-oid="lq0xd9h">
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
        data-oid="dz5oil6"
      >
        <div data-oid="0hnqlri">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="wnw4b:2"
          >
            Arama
          </label>
          <div className="relative" data-oid="ugrq_d6">
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              data-oid="3mxl59m"
            >
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="8cg2bvt"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  data-oid="3agogti"
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
              data-oid="xnyd9v0"
            />
          </div>
        </div>

        <div data-oid="ufqbf_p">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="-d.2thz"
          >
            Durum
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="2--5x2o"
          >
            <option value="" data-oid="x39o0e:">
              Tüm Durumlar
            </option>
            <option value="active" data-oid="id7vvow">
              Aktif
            </option>
            <option value="inactive" data-oid="v9-j5.l">
              Pasif
            </option>
          </select>
        </div>

        <div data-oid="nla2d8y">
          <label
            htmlFor="orderCount"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="y3xlwaw"
          >
            Sipariş Sayısı
          </label>
          <select
            id="orderCount"
            value={orderCountFilter}
            onChange={(e) => setOrderCountFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="j5owdyl"
          >
            <option value="" data-oid="6:4qjct">
              Tümü
            </option>
            <option value="none" data-oid="iq29xoh">
              Hiç sipariş vermedi
            </option>
            <option value="one" data-oid="im7kpxk">
              Tek sipariş
            </option>
            <option value="multiple" data-oid="mtv0kv-">
              Birden fazla sipariş
            </option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div
        className="bg-white shadow-sm rounded-xl overflow-hidden"
        data-oid="1f03pwu"
      >
        <div className="overflow-x-auto" data-oid="et3tg4s">
          <table
            className="min-w-full divide-y divide-gray-200"
            data-oid="jjvvz3x"
          >
            <thead className="bg-gray-50" data-oid=".66pwsj">
              <tr data-oid="bwd6fln">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="1ky8o5c"
                >
                  Müşteri
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="sd:zvww"
                >
                  İletişim
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="dp3fmjw"
                >
                  Siparişler
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="tmljt9u"
                >
                  Toplam Harcama
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid=".g4orlb"
                >
                  Son Sipariş
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="cx_amc."
                >
                  Durum
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="t22cgk4"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody
              className="bg-white divide-y divide-gray-200"
              data-oid="z:7iiwl"
            >
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50"
                  data-oid="td276m6"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="jykiv8l"
                  >
                    <div className="flex items-center" data-oid="k39wug2">
                      <div
                        className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center"
                        data-oid="0xryijw"
                      >
                        <span
                          className="font-medium text-gray-700"
                          data-oid="7o.e:ug"
                        >
                          {customer.firstName[0]}
                          {customer.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4" data-oid="yjk9_-e">
                        <div
                          className="text-sm font-medium text-gray-900"
                          data-oid="beb47ce"
                        >
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div
                          className="text-sm text-gray-500"
                          data-oid="jmj7bvw"
                        >
                          Müşteri ID: #{customer.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="5kc00lq"
                  >
                    <div className="text-sm text-gray-900" data-oid="6a2emij">
                      {customer.email}
                    </div>
                    <div className="text-sm text-gray-500" data-oid="1:kc_v8">
                      {customer.phone}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="f:p7d2i"
                  >
                    {customer.orderCount}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="c396jwq"
                  >
                    ₺{customer.totalSpent.toLocaleString()}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    data-oid="g8bqwod"
                  >
                    {customer.lastOrder}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="rna5bbn"
                  >
                    <StatusBadge status={customer.status} data-oid="j9bl.o6" />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    data-oid="cl.qowa"
                  >
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-primary hover:text-primary-dark mr-3"
                      data-oid="ilryw6n"
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
                      data-oid="bs25cni"
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
          data-oid="kb.t1a-"
        >
          <div className="text-sm text-gray-700" data-oid="oqjh9al">
            <span className="font-medium" data-oid="13bdmq5">
              {filteredCustomers.length}
            </span>{" "}
            müşteri gösteriliyor
          </div>
          <div
            className="flex-1 flex justify-center md:justify-end"
            data-oid="cysg2fg"
          >
            <div className="inline-flex shadow-sm" data-oid="i8ukjb2">
              <button
                className="border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-l-md"
                data-oid="tk_-:1t"
              >
                Önceki
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-primary text-white hover:bg-primary-dark px-4 py-2 text-sm font-medium"
                data-oid="ru_d9sl"
              >
                1
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="wk:brip"
              >
                2
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-r-md"
                data-oid="5_5nuyv"
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
