"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@/lib/supabase";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orderCountFilter, setOrderCountFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, phone")
          .eq("is_admin", false);

        if (error) throw error;

        const ids = (profiles || []).map((p: any) => p.id);
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("user_id, total_amount, created_at")
          .in("user_id", ids);

        if (ordersError) throw ordersError;

        const mapped = (profiles || []).map((p: any) => {
          const userOrders = (ordersData || []).filter((o: any) => o.user_id === p.id);
          const orderCount = userOrders.length;
          const totalSpent = userOrders.reduce(
            (sum: number, o: any) => sum + (o.total_amount || 0),
            0,
          );
          const lastOrder = userOrders
            .sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            )[0]?.created_at;
          return {
            id: p.id,
            firstName: p.first_name,
            lastName: p.last_name,
            email: p.email,
            phone: p.phone,
            orderCount,
            totalSpent,
            lastOrder,
            status: orderCount > 0 ? "active" : "inactive",
          };
        });

        setCustomers(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [supabase]);

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

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, orderCountFilter, customers]);

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
        data-oid="n6z291q"
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div data-oid="p:mu51b">
      <header className="mb-8" data-oid="j6_z8wy">
        <h1 className="text-2xl font-bold text-gray-900" data-oid="iqpqzhz">
          Müşteriler
        </h1>
        <p className="text-gray-500" data-oid="i21-k2v">
          Tüm müşterileri görüntüleyin ve yönetin
        </p>
      </header>

      {/* Stats */}
      <div
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        data-oid="c3w58yz"
      >
        <div className="bg-white rounded-xl shadow-sm p-6" data-oid="emgz2-5">
          <div
            className="text-sm font-medium text-gray-500 mb-1"
            data-oid="di1b_.m"
          >
            Toplam Müşteri
          </div>
          <div className="text-2xl font-semibold" data-oid="40oghzh">
            {customers.length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6" data-oid="uq3wnp7">
          <div
            className="text-sm font-medium text-gray-500 mb-1"
            data-oid="ul9bhq7"
          >
            Aktif Müşteriler
          </div>
          <div
            className="text-2xl font-semibold text-green-600"
            data-oid="gspn-m."
          >
            {customers.filter((c) => c.status === "active").length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6" data-oid="09q47su">
          <div
            className="text-sm font-medium text-gray-500 mb-1"
            data-oid="ng:690x"
          >
            Bu Ay Yeni
          </div>
          <div
            className="text-2xl font-semibold text-blue-600"
            data-oid="qr20nq6"
          >
            3
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6" data-oid="4p2e4qe">
          <div
            className="text-sm font-medium text-gray-500 mb-1"
            data-oid="cf1ewx_"
          >
            Ortalama Sipariş
          </div>
          <div className="text-2xl font-semibold" data-oid="to2utmo">
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
        data-oid="g4v2r.q"
      >
        <div data-oid="67vkhj7">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="d559a-5"
          >
            Arama
          </label>
          <div className="relative" data-oid=":qa-ui0">
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              data-oid="zg_m:4v"
            >
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid=".3beh_7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  data-oid="k8aoofv"
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
              data-oid="jsh.je9"
            />
          </div>
        </div>

        <div data-oid="74exm:_">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="71swe4f"
          >
            Durum
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="50kjmnf"
          >
            <option value="" data-oid="kl_ijsm">
              Tüm Durumlar
            </option>
            <option value="active" data-oid="_1-82ry">
              Aktif
            </option>
            <option value="inactive" data-oid="6u1r7ey">
              Pasif
            </option>
          </select>
        </div>

        <div data-oid="wxycmpd">
          <label
            htmlFor="orderCount"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="hm:0uy:"
          >
            Sipariş Sayısı
          </label>
          <select
            id="orderCount"
            value={orderCountFilter}
            onChange={(e) => setOrderCountFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="l-54oe_"
          >
            <option value="" data-oid="7le0a29">
              Tümü
            </option>
            <option value="none" data-oid="3zt5:-u">
              Hiç sipariş vermedi
            </option>
            <option value="one" data-oid="e2yvu0f">
              Tek sipariş
            </option>
            <option value="multiple" data-oid="vh__sew">
              Birden fazla sipariş
            </option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div
        className="bg-white shadow-sm rounded-xl overflow-hidden"
        data-oid="3w20_jb"
      >
        <div className="overflow-x-auto" data-oid="anlpz5v">
          {isLoading ? (
            <div className="p-4 text-center">Yükleniyor...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">{error}</div>
          ) : paginatedCustomers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Kayıt bulunamadı</div>
          ) : (
          <table
            className="min-w-full divide-y divide-gray-200"
            data-oid="-i6hk7h"
          >
            <thead className="bg-gray-50" data-oid="k1:.7go">
              <tr data-oid="5bg3tul">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="fk4m439"
                >
                  Müşteri
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="zwje-ug"
                >
                  İletişim
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="j4vtpj7"
                >
                  Siparişler
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="mpgedn7"
                >
                  Toplam Harcama
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="rtqlfg9"
                >
                  Son Sipariş
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="v07_fvo"
                >
                  Durum
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="ivvpehl"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody
              className="bg-white divide-y divide-gray-200"
              data-oid="gbvev8."
            >
              {paginatedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50"
                  data-oid="68rduvr"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="2rdp.je"
                  >
                    <div className="flex items-center" data-oid="d-6enws">
                      <div
                        className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center"
                        data-oid="3107eil"
                      >
                        <span
                          className="font-medium text-gray-700"
                          data-oid="qp88mwi"
                        >
                          {customer.firstName[0]}
                          {customer.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4" data-oid="z79mm7w">
                        <div
                          className="text-sm font-medium text-gray-900"
                          data-oid="cfrn428"
                        >
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div
                          className="text-sm text-gray-500"
                          data-oid="bimss5f"
                        >
                          Müşteri ID: #{customer.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="0ak6y-l"
                  >
                    <div className="text-sm text-gray-900" data-oid="ib:ich1">
                      {customer.email}
                    </div>
                    <div className="text-sm text-gray-500" data-oid="o3efxxa">
                      {customer.phone}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="h_2_.5j"
                  >
                    {customer.orderCount}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-oid="yz-eal7"
                  >
                    ₺{customer.totalSpent.toLocaleString()}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    data-oid="ntuylp2"
                  >
                    {customer.lastOrder
                      ? new Date(customer.lastOrder).toLocaleDateString("tr-TR")
                      : "-"}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-oid="6rw0i9h"
                  >
                    <StatusBadge status={customer.status} data-oid="nr.8iyf" />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    data-oid="9q6.v6c"
                  >
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-primary hover:text-primary-dark mr-3"
                      data-oid="da._vmc"
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
                      data-oid="fhoq:00"
                    >
                      {customer.status === "active" ? "Pasif Yap" : "Aktif Yap"}
                    </button>
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
          data-oid="kv5k.f9"
        >
          <div className="text-sm text-gray-700" data-oid="vdsjsch">
            <span className="font-medium" data-oid="cheyshc">
              {filteredCustomers.length}
            </span>{" "}
            müşteri gösteriliyor
          </div>
          <div
            className="flex-1 flex justify-center md:justify-end"
            data-oid="ow3-w.y"
          >
            <div className="inline-flex shadow-sm" data-oid="pfv_8px">
              <button
                className="border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-l-md"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                data-oid="ovr5fnt"
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
                data-oid="qqnu-1."
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
