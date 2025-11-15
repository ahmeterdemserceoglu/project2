"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/auth";
import Link from "next/link";
import { FaBox, FaLayerGroup, FaShoppingBag, FaUsers, FaBolt, FaChartLine, FaEye } from "react-icons/fa";

interface OrderType {
  id: string;
  total_amount?: number;
  status?: string;
  profiles?: {
    email?: string;
  } | null;
}

interface ProductType {
  id: string;
  name?: string;
  base_price?: number;
  sale_price?: number | null;
  views_count?: number;
}

interface StatsType {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalCustomers: number;
  totalFlashDeals: number;
  recentOrders: OrderType[];
  topProducts: ProductType[];
  monthlySales: number;
  monthlyCommission: number;
  monthlyTax: number;
  netIncome: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsType>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalFlashDeals: 0,
    recentOrders: [],
    topProducts: [],
    monthlySales: 0,
    monthlyCommission: 0,
    monthlyTax: 0,
    netIncome: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!supabase) return;

      setIsLoading(true);
      try {
        // Fetch total products count
        const { count: productsCount, error: productsError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        // Fetch total categories count
        const { count: categoriesCount, error: categoriesError } = await supabase
          .from("categories")
          .select("*", { count: "exact", head: true });

        // Fetch total orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        // Fetch total customers count
        const { count: customersCount, error: customersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_admin", false);

        // Fetch total flash deals count
        const { count: flashDealsCount, error: flashDealsError } = await supabase
          .from("flash_deals")
          .select("*", { count: "exact", head: true });

        // Fetch recent orders
        const { data: recentOrders, error: recentOrdersError } = await supabase
          .from("orders")
          .select("*, profiles(email)")
          .order("created_at", { ascending: false })
          .limit(5);

        // Fetch top products
        const { data: topProducts, error: topProductsError } = await supabase
          .from("products")
          .select("id, name, base_price, sale_price")
          .order("created_at", { ascending: false })
          .limit(5);

        // Fetch monthly sales data
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        const { data: monthlySalesData, error: monthlySalesError } = await supabase
          .from("orders")
          .select("total_amount, commission_amount, tax_amount")
          .gte("created_at", firstDayOfMonth)
          .lte("created_at", lastDayOfMonth);

        // Calculate monthly sales metrics
        let totalSales = 0;
        let totalCommission = 0;
        let totalTax = 0;

        if (monthlySalesData) {
          monthlySalesData.forEach(order => {
            totalSales += order.total_amount || 0;
            totalCommission += order.commission_amount || 0;
            totalTax += order.tax_amount || 0;
          });
        }

        const netIncome = totalSales - totalCommission - totalTax;

        setStats({
          totalProducts: productsCount || 0,
          totalCategories: categoriesCount || 0,
          totalOrders: ordersCount || 0,
          totalCustomers: customersCount || 0,
          totalFlashDeals: flashDealsCount || 0,
          recentOrders: recentOrders as OrderType[] || [],
          topProducts: topProducts as ProductType[] || [],
          monthlySales: totalSales,
          monthlyCommission: totalCommission,
          monthlyTax: totalTax,
          netIncome: netIncome
        });
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-6">Yönetim Paneli</h1>
        <p className="text-gray-600 mb-8">Mağazanızın genel durumuna hoş geldiniz. İşte genel bir bakış.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                <FaBox className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-100 truncate">Toplam Ürün</dt>
                  <dd>
                    <div className="text-lg font-semibold text-white">{stats.totalProducts}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/products" className="font-medium text-indigo-600 hover:text-indigo-500">
                Tüm ürünleri görüntüle
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-green-500 to-emerald-600">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                <FaLayerGroup className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-100 truncate">Toplam Kategori</dt>
                  <dd>
                    <div className="text-lg font-semibold text-white">{stats.totalCategories}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/categories" className="font-medium text-green-600 hover:text-green-500">
                Kategorileri yönet
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-purple-500 to-violet-600">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                <FaShoppingBag className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-purple-100 truncate">Toplam Sipariş</dt>
                  <dd>
                    <div className="text-lg font-semibold text-white">{stats.totalOrders}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/orders" className="font-medium text-purple-600 hover:text-purple-500">
                Tüm siparişleri görüntüle
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-600">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                <FaUsers className="h-6 w-6 text-amber-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-amber-100 truncate">Toplam Müşteri</dt>
                  <dd>
                    <div className="text-lg font-semibold text-white">{stats.totalCustomers}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/customers" className="font-medium text-amber-600 hover:text-amber-500">
                Müşterileri yönet
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-red-500 to-rose-600">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                <FaBolt className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-red-100 truncate">Günün Fırsatları</dt>
                  <dd>
                    <div className="text-lg font-semibold text-white">{stats.totalFlashDeals}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/flash-deals" className="font-medium text-red-600 hover:text-red-500">
                Fırsatları yönet
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-sky-500 to-cyan-600">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                <FaChartLine className="h-6 w-6 text-sky-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-sky-100 truncate">Aylık Satış</dt>
                  <dd>
                    <div className="text-lg font-semibold text-white">₺{stats.monthlySales.toFixed(2)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/accounting/monthly-sales" className="font-medium text-sky-600 hover:text-sky-500">
                Detaylı raporu görüntüle
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Finansal Özet */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Bu Ayın Finansal Özeti</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Toplam Satış</p>
              <p className="text-xl font-semibold">₺{stats.monthlySales.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Komisyon</p>
              <p className="text-xl font-semibold">₺{stats.monthlyCommission.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Vergi</p>
              <p className="text-xl font-semibold">₺{stats.monthlyTax.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-500">Net Kazanç</p>
              <p className="text-xl font-semibold text-blue-600">₺{stats.netIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="text-sm flex space-x-6">
            <Link href="/admin/accounting" className="font-medium text-indigo-600 hover:text-indigo-500">
              Muhasebe sayfasına git
            </Link>
            <Link href="/admin/dashboard/financial" className="font-medium text-green-600 hover:text-green-500">
              Finansal gösterge paneli
            </Link>
            <Link href="/admin/accounting/tax-reports" className="font-medium text-amber-600 hover:text-amber-500">
              Vergi raporları
            </Link>
          </div>
        </div>
      </div>

     


        {/* Top Products */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">Popüler Ürünler</h3>
              <FaEye className="ml-2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="bg-white overflow-hidden">
            {stats.topProducts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {stats.topProducts.map((product) => (
                  <li key={product.id}>
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              {product.sale_price ? (
                                <>
                                  <span className="line-through text-gray-400">₺{product.base_price}</span>{" "}
                                  <span className="text-green-600">₺{product.sale_price}</span>
                                </>
                              ) : (
                                <span>₺{product.base_price}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center text-sm text-gray-500">
                            <FaEye className="mr-1 h-4 w-4 text-gray-400" />
                            {product.views_count || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">Henüz ürün bulunmamaktadır.</div>
            )}
            <div className="bg-gray-50 px-6 py-3">
              <div className="text-sm">
                <Link href="/admin/products" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Tüm ürünleri görüntüle
                </Link>
              </div>
            </div>
          </div>
        </div>
     

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Hızlı İşlemler</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Yeni Ürün Ekle
          </Link>
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Yeni Kategori Ekle
          </Link>
          <Link
            href="/admin/flash-deals"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Fırsat Oluştur
          </Link>
        </div>
      </div>
    </div>
  );
} 