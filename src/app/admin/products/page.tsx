"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Mock product data
const initialProducts = [
  {
    id: "1",
    name: "iPhone 13 Pro Max",
    price: 29999,
    category: "Elektronik",
    stock: 45,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02ff9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "2",
    name: "Samsung Galaxy S21",
    price: 16999,
    category: "Elektronik",
    stock: 32,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "3",
    name: "Erkek Spor Ayakkabı",
    price: 899,
    category: "Giyim",
    stock: 110,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "4",
    name: "Kadın Deri Çanta",
    price: 1299,
    category: "Giyim",
    stock: 28,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "5",
    name: "Kahve Makinesi",
    price: 3499,
    category: "Ev",
    stock: 15,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1570286424717-86d8a0082d60?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "6",
    name: 'Akıllı TV 55"',
    price: 7999,
    category: "Elektronik",
    stock: 0,
    status: "out_of_stock",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "7",
    name: "Bluetooth Kulaklık",
    price: 299,
    category: "Elektronik",
    stock: 72,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "8",
    name: "Gaming Laptop",
    price: 18999,
    category: "Elektronik",
    stock: 5,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "9",
    name: "El Blender Seti",
    price: 599,
    category: "Ev",
    stock: 0,
    status: "out_of_stock",
    image:
      "https://images.unsplash.com/photo-1578020190125-f4a82bf8b688?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "10",
    name: "Bebek Arabası",
    price: 2499,
    category: "Bebek",
    stock: 13,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1591958057207-45a054cca810?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = categoryFilter
      ? product.category === categoryFilter
      : true;
    const matchesStatus = statusFilter ? product.status === statusFilter : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories from products for filter dropdown
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  // Handle individual selection
  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(
        selectedProducts.filter((productId) => productId !== id),
      );
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedProducts.length === 0) return;

    switch (action) {
      case "delete":
        setProducts(products.filter((p) => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
        break;
      case "activate":
        setProducts(
          products.map((p) =>
            selectedProducts.includes(p.id) ? { ...p, status: "active" } : p,
          ),
        );
        break;
      case "deactivate":
        setProducts(
          products.map((p) =>
            selectedProducts.includes(p.id)
              ? { ...p, status: "out_of_stock" }
              : p,
          ),
        );
        break;
      default:
        break;
    }
  };

  return (
    <div data-oid="q95bn0s">
      <header
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0"
        data-oid="508nswc"
      >
        <div data-oid="58vmw:f">
          <h1 className="text-2xl font-bold text-gray-900" data-oid="jjhcjst">
            Ürünler
          </h1>
          <p className="text-gray-500" data-oid="bq5c-b3">
            Toplam {products.length} ürün,{" "}
            {products.filter((p) => p.status === "active").length} aktif
          </p>
        </div>
        <div className="flex space-x-3" data-oid="mni5phy">
          <button
            onClick={() => handleBulkAction("delete")}
            disabled={selectedProducts.length === 0}
            className={`px-3 py-2 border rounded-md text-sm font-medium 
              ${selectedProducts.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
            data-oid="0af8wf_"
          >
            Seçilenleri Sil
          </button>
          <Link
            href="/admin/products/add"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            data-oid="k:o2etj"
          >
            Ürün Ekle
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div
        className="bg-white shadow-sm rounded-xl p-4 mb-6 grid gap-4 grid-cols-1 md:grid-cols-4"
        data-oid="-r225m2"
      >
        <div className="md:col-span-2" data-oid="kjg9i.5">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="rch_iop"
          >
            Ürün Ara
          </label>
          <div className="relative" data-oid="q9r7._8">
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              data-oid="pu_uclq"
            >
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="vig0kbx"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  data-oid="e6g1jr."
                />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün adına göre ara..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
              data-oid="6n17q1y"
            />
          </div>
        </div>

        <div data-oid="5plsfg4">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="xowj015"
          >
            Kategori
          </label>
          <select
            id="category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="4m.r_o7"
          >
            <option value="" data-oid=".r0vg1w">
              Tüm Kategoriler
            </option>
            {categories.map((category) => (
              <option key={category} value={category} data-oid="ktg-u17">
                {category}
              </option>
            ))}
          </select>
        </div>

        <div data-oid="ojoymgl">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
            data-oid="nri4tga"
          >
            Durum
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            data-oid="8e6..4j"
          >
            <option value="" data-oid="9gos_o5">
              Tüm Durumlar
            </option>
            <option value="active" data-oid="sucziyo">
              Aktif
            </option>
            <option value="out_of_stock" data-oid=":9kkumz">
              Stokta Yok
            </option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div
        className="bg-white shadow-sm rounded-xl overflow-hidden"
        data-oid="_5hky9l"
      >
        <div className="overflow-x-auto" data-oid="imv_g9_">
          <table
            className="min-w-full divide-y divide-gray-200"
            data-oid="krl6lai"
          >
            <thead className="bg-gray-50" data-oid="rw-x.3r">
              <tr data-oid="0wz3_q:">
                <th className="px-6 py-3 text-left" data-oid="btksfcb">
                  <div className="flex items-center" data-oid="e3g1eeo">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      data-oid="z_biri8"
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="62_6l1."
                >
                  Ürün
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="_29mbo7"
                >
                  Kategori
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="xdu_zq-"
                >
                  Stok
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="ojqwsfv"
                >
                  Fiyat
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="jwcigq2"
                >
                  Durum
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  data-oid="-sfaomt"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody
              className="bg-white divide-y divide-gray-200"
              data-oid="s36b22h"
            >
              {filteredProducts.length === 0 ? (
                <tr data-oid="hhagw9b">
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-500"
                    data-oid="s_e083-"
                  >
                    <p data-oid="80gdpqb">Sonuç bulunamadı</p>
                    <p className="text-sm mt-1" data-oid="vs8fgb7">
                      Filtreleri değiştirmeyi deneyin
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50"
                    data-oid=".c-im-9"
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap"
                      data-oid="yrz_fm5"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        data-oid="g5yb_qa"
                      />
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap"
                      data-oid="-54bkbp"
                    >
                      <div className="flex items-center" data-oid="d06uzpz">
                        <div
                          className="flex-shrink-0 h-10 w-10 relative"
                          data-oid="hfs3y.3"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover rounded-md"
                            data-oid="huvlx7c"
                          />
                        </div>
                        <div className="ml-4" data-oid="pnl0jn0">
                          <div
                            className="text-sm font-medium text-gray-900"
                            data-oid="j6sp9a2"
                          >
                            {product.name}
                          </div>
                          <div
                            className="text-sm text-gray-500"
                            data-oid="u00d8zy"
                          >
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      data-oid="gcxottu"
                    >
                      {product.category}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      data-oid="..etanc"
                    >
                      {product.stock}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      data-oid="2ew3pno"
                    >
                      ₺{product.price.toLocaleString()}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap"
                      data-oid="04o0lx."
                    >
                      {product.status === "active" ? (
                        <span
                          className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                          data-oid="qmq.ja."
                        >
                          Aktif
                        </span>
                      ) : (
                        <span
                          className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
                          data-oid="kgtbr:e"
                        >
                          Stokta Yok
                        </span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      data-oid="g4fu9sw"
                    >
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="text-primary hover:text-primary-dark mr-4"
                        data-oid="0utta2l"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() =>
                          setProducts(
                            products.filter((p) => p.id !== product.id),
                          )
                        }
                        className="text-red-600 hover:text-red-800"
                        data-oid="3ekow7a"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="px-6 py-3 flex items-center justify-between border-t"
          data-oid="yi8ntw9"
        >
          <div className="text-sm text-gray-700" data-oid="kbwwxvj">
            <span className="font-medium" data-oid="o60gtww">
              {filteredProducts.length}
            </span>{" "}
            sonuç gösteriliyor
          </div>
          <div
            className="flex-1 flex justify-center md:justify-end"
            data-oid="ij8_7nq"
          >
            <div className="inline-flex shadow-sm" data-oid="bnlj4rt">
              <button
                className="border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-l-md"
                data-oid="ut.coym"
              >
                Önceki
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="ri:j0me"
              >
                1
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-primary text-white hover:bg-primary-dark px-4 py-2 text-sm font-medium"
                data-oid="cj71_dz"
              >
                2
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                data-oid="3lr3xzz"
              >
                3
              </button>
              <button
                className="border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-r-md"
                data-oid="3.zb_sf"
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
