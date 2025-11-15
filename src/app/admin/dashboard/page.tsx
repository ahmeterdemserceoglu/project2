"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '@/contexts/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// Define dashboard stats interface
interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  salesChange: string;
  ordersChange: string;
  productsChange: string;
  customersChange: string;
}

// Stats Card component
const StatsCard = ({
  title,
  value,
  icon,
  change,
  changeType,
  isLoading = false,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  isLoading?: boolean;
}) => {
  return (
    <div className="bg-white dark:bg-dark-lighter rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-500 dark:text-gray-400 font-medium">
          {title}
        </div>
        <div className="text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      </div>
      {isLoading ? (
        <div className="h-8 bg-gray-200 dark:bg-dark animate-pulse rounded"></div>
      ) : (
        <div className="text-2xl font-bold mb-2 dark:text-white">
          {value}
        </div>
      )}
      {change && !isLoading && (
        <div
          className={`text-sm flex items-center ${changeType === "increase"
            ? "text-green-600"
            : changeType === "decrease"
              ? "text-red-600"
              : "text-gray-500"
            }`}
        >
          {changeType === "increase" && (
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
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
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
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
    <div className="flex space-x-3">
      <div
        className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary"
      >
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {content}
        </p>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {time}
        </span>
      </div>
    </div>
  );
};

// Recent Orders component
const RecentOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            total_amount,
            status,
            created_at,
            profiles(first_name, last_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          throw error;
        }

        setOrders(data || []);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [supabase]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Teslim Edildi';
      case 'processing':
        return 'Hazırlanıyor';
      case 'pending':
        return 'Bekliyor';
      case 'paid':
        return 'Ödendi';
      case 'shipped':
        return 'Kargoda';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return `₺${Number(price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold dark:text-white">
          Son Siparişler
        </h3>
        <Link
          href="/admin/orders"
          className="text-primary hover:text-primary-dark text-sm font-medium"
        >
          Tümünü Gör
        </Link>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-dark rounded"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Henüz sipariş bulunmuyor.
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr
                className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                <th className="pb-3">
                  Sipariş No
                </th>
                <th className="pb-3">
                  Müşteri
                </th>
                <th className="pb-3">
                  Tarih
                </th>
                <th className="pb-3">
                  Durum
                </th>
                <th className="pb-3 text-right">
                  Toplam
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark">
              {orders.map((order) => (
                <tr key={order.id} className="text-sm">
                  <td className="py-3 text-primary font-medium">
                    <Link href={`/admin/orders/${order.id}`}>
                      {order.order_number || `#${order.id.substring(0, 8)}`}
                    </Link>
                  </td>
                  <td className="py-3 text-gray-900 dark:text-gray-200">
                    {order.profiles
                      ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || order.profiles.email
                      : 'Misafir Kullanıcı'}
                  </td>
                  <td className="py-3 text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium dark:text-gray-300">
                    {formatPrice(order.total_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Top Products component
const TopProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setIsLoading(true);

        // Get products with their images, ordered by stock quantity
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            sku,
            base_price,
            sale_price,
            stock_quantity,
            is_active,
            categories(name),
            product_images(image_url, is_primary)
          `)
          .order('stock_quantity', { ascending: false })
          .limit(5);

        if (error) {
          throw error;
        }

        setProducts(data || []);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopProducts();
  }, [supabase]);

  const formatPrice = (price: number) => {
    return `₺${Number(price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getProductImage = (product: any) => {
    if (!product.product_images || product.product_images.length === 0) {
      return '/images/placeholder.png'; // Default placeholder image
    }

    // Find primary image or use first available
    const primaryImage = product.product_images.find((img: any) => img.is_primary);
    return primaryImage ? primaryImage.image_url : product.product_images[0].image_url;
  };

  return (
    <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold dark:text-white">
          En Çok Satan Ürünler
        </h3>
        <Link
          href="/admin/products"
          className="text-primary hover:text-primary-dark text-sm font-medium"
        >
          Tüm Ürünler
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex animate-pulse">
              <div className="w-12 h-12 bg-gray-200 dark:bg-dark rounded-md"></div>
              <div className="ml-4 flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-dark rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-dark rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Henüz ürün bulunmuyor.
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center py-2 border-b border-gray-100 dark:border-dark last:border-0">
              <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-dark">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder.png';
                  }}
                />
              </div>
              <div className="ml-4 flex-1">
                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="font-medium text-gray-900 dark:text-white hover:text-primary block truncate"
                >
                  {product.name}
                </Link>
                <div className="flex text-sm items-center justify-between mt-1">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {product.categories && product.categories.name ? product.categories.name : 'Kategorisiz'}
                    </span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Stok: {product.stock_quantity}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-200">
                    {formatPrice(product.sale_price || product.base_price)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Revenue Chart Component
const RevenueChart = () => {
  const supabase = createClientComponentClient<Database>();
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState('week'); // 'week', 'month', 'year'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Calculate date range based on selected range
        const endDate = new Date();
        let startDate = new Date();

        if (range === 'week') {
          startDate.setDate(endDate.getDate() - 7);
        } else if (range === 'month') {
          startDate.setMonth(endDate.getMonth() - 1);
        } else if (range === 'year') {
          startDate.setFullYear(endDate.getFullYear() - 1);
        }

        // Fetch orders within date range
        const { data, error } = await supabase
          .from('orders')
          .select('total_amount, created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        // Prepare data for chart
        const preparedData = prepareData(data || [], startDate);
        setChartData(preparedData);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    const prepareData = (orders: { total_amount: number | null; created_at: string | null }[], startDate: Date) => {
      const validOrders = orders.filter(order => order.created_at);

      if (range === 'year') {
        // For yearly view, group by months
        const labels = Array.from({ length: 12 }, (_, i) =>
          new Date(0, i).toLocaleString('tr-TR', { month: 'short' })
        );
        const data = new Array(12).fill(0);

        validOrders.forEach((order) => {
          const date = new Date(order.created_at!);
          const monthIndex = date.getMonth();
          data[monthIndex] += Number(order.total_amount) || 0;
        });

        return {
          labels,
          datasets: [{
            label: 'Gelir',
            data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
          }]
        };
      } else if (range === 'month') {
        // For monthly view, group by days
        const days = 30;
        const labels = [];
        const data = new Array(days).fill(0);

        for (let i = 0; i < days; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          labels.push(`${date.getDate()}.${date.getMonth() + 1}`);
        }

        validOrders.forEach((order) => {
          const date = new Date(order.created_at!);
          const diffDays = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < days) {
            data[diffDays] += Number(order.total_amount) || 0;
          }
        });

        return {
          labels,
          datasets: [{
            label: 'Gelir',
            data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
          }]
        };
      } else {
        // For weekly view
        const days = 7;
        const labels = [];
        const data = new Array(days).fill(0);

        for (let i = 0; i < days; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          labels.push(`${date.getDate()}.${date.getMonth() + 1}`);
        }

        validOrders.forEach((order) => {
          const date = new Date(order.created_at!);
          const diffDays = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < days) {
            data[diffDays] += Number(order.total_amount) || 0;
          }
        });

        return {
          labels,
          datasets: [{
            label: 'Gelir',
            data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
          }]
        };
      }
    };

    fetchData();
  }, [range, supabase]);

  return (
    <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold dark:text-white">Satış İstatistikleri</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setRange('week')}
            className={`px-3 py-1 text-sm rounded-md ${range === 'week'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-dark text-gray-600 dark:text-gray-300'
              }`}
          >
            Haftalık
          </button>
          <button
            onClick={() => setRange('month')}
            className={`px-3 py-1 text-sm rounded-md ${range === 'month'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-dark text-gray-600 dark:text-gray-300'
              }`}
          >
            Aylık
          </button>
          <button
            onClick={() => setRange('year')}
            className={`px-3 py-1 text-sm rounded-md ${range === 'year'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-dark text-gray-600 dark:text-gray-300'
              }`}
          >
            Yıllık
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : chartData ? (
        <div className="h-64">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function (value) {
                      return '₺' + value;
                    }
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      return '₺' + context.raw;
                    }
                  }
                }
              }
            }}
          />
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          Veri bulunamadı
        </div>
      )}
    </div>
  );
};

interface ProfileType {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface OrderType {
  id: string;
  status: string;
  created_at: string;
  user_id: string | null;
  profiles: ProfileType | null;
}

// Main Dashboard component
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const hasAttemptedRefresh = useRef(false);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        setIsLoading(true);

        // Try to ensure we have the latest auth state
        

        // Check admin status
        const { data: adminCheckData } = await supabase.rpc('is_admin');
        const isAdminFromRpc = adminCheckData === true;

        if (!isAdminFromRpc) {
          router.push('/login?redirect=/admin/dashboard');
          return;
        }

        // Fetch dashboard stats only if admin
        fetchDashboardStats();
      } catch (error) {
        router.push('/login?redirect=/admin/dashboard');
      }
    };

    checkAdminAndFetchData();
  }, [router, supabase]);



  async function fetchDashboardStats() {
    try {
      // Verify admin status before fetching data
      const { data: checkAdminResult } = await supabase.rpc('is_admin');
      if (!checkAdminResult) {
        router.push('/login?redirect=/admin/dashboard');
        return;
      }

      // ... existing dashboard data fetching code ...

      // For now just fake some stats
      setStats({
        totalSales: 25650,
        totalOrders: 142,
        totalProducts: 47,
        totalCustomers: 89,
        salesChange: '+12%',
        ordersChange: '+8%',
        productsChange: '+4%',
        customersChange: '+15%'
      });

    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-dark rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-dark rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>

        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-dark-lighter p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-white">Genel Bakış</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Toplam Satış</span>
              <span className="text-white font-medium">₺12,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Toplam Sipariş</span>
              <span className="text-white font-medium">48</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Toplam Ürün</span>
              <span className="text-white font-medium">120</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Toplam Müşteri</span>
              <span className="text-white font-medium">85</span>
            </div>
          </div>
        </div>

        <div className="bg-dark-lighter p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-white">Son Siparişler</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">#OD12345</span>
              <span className="text-green-500">₺450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">#OD12346</span>
              <span className="text-green-500">₺890</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">#OD12347</span>
              <span className="text-green-500">₺320</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">#OD12348</span>
              <span className="text-green-500">₺1,240</span>
            </div>
          </div>
        </div>

        <div className="bg-dark-lighter p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-white">En Çok Satan Ürünler</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Ürün A</span>
              <span className="text-white font-medium">24 Adet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ürün B</span>
              <span className="text-white font-medium">16 Adet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ürün C</span>
              <span className="text-white font-medium">12 Adet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ürün D</span>
              <span className="text-white font-medium">8 Adet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
