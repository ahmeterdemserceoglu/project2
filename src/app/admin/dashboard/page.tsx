"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClientComponentClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);
=======
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255

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
          className={`text-sm flex items-center ${
            changeType === "increase"
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
  const supabase = createClientComponentClient();

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
        console.error('Error loading orders:', error);
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
  const supabase = createClientComponentClient();

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
        console.error('Error loading products:', error);
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

<<<<<<< HEAD
// Revenue Chart Component
const RevenueChart = () => {
  const supabase = createClientComponentClient();
  const [range, setRange] = useState<'week' | 'month' | 'year'>('week');
  const [chartData, setChartData] = useState<{ labels: string[]; data: number[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const now = new Date();
      let start = new Date(now);

      if (range === 'week') {
        start.setDate(now.getDate() - 6);
      } else if (range === 'month') {
        start.setDate(now.getDate() - 29);
      } else {
        start = new Date(now.getFullYear(), 0, 1);
      }

      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('status', 'delivered')
        .gte('created_at', start.toISOString());

      if (!error && data) {
        setChartData(prepareData(data, start));
      }
      setLoading(false);
    };

    const prepareData = (orders: { total_amount: number | null; created_at: string }[], startDate: Date) => {
      if (range === 'year') {
        const labels = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('tr-TR', { month: 'short' }));
        const arr = new Array(12).fill(0);
        orders.forEach((o) => {
          const d = new Date(o.created_at);
          const idx = d.getMonth();
          arr[idx] += o.total_amount || 0;
        });
        return { labels, data: arr };
      }

      const days = range === 'week' ? 7 : 30;
      const labels: string[] = [];
      const arr = new Array(days).fill(0);
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        labels.push(`${d.getDate()}.${d.getMonth() + 1}`);
      }
      orders.forEach((o) => {
        const d = new Date(o.created_at);
        const diff = Math.floor((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < days) {
          arr[diff] += o.total_amount || 0;
        }
      });
      return { labels, data: arr };
    };

    fetchData();
  }, [range, supabase]);

  return (
    <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold dark:text-white">Satış İstatistikleri</h3>
        <div className="flex space-x-2">
          {(['week', 'month', 'year'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setRange(opt)}
              className={`text-xs font-medium px-2 py-1 rounded ${range === opt ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-primary'}`}
            >
              {opt === 'week' ? 'Haftalık' : opt === 'month' ? 'Aylık' : 'Yıllık'}
            </button>
          ))}
        </div>
      </div>
      {loading || !chartData ? (
        <div className="h-64 flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 text-sm">Yükleniyor...</span>
        </div>
      ) : (
        <Line
          data={{
            labels: chartData.labels,
            datasets: [
              {
                label: 'Gelir',
                data: chartData.data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
              },
            ],
          }}
        />
      )}
=======
// Revenue Chart Component (simplified for this example)
const RevenueChart = () => {
  return (
    <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold dark:text-white">
          Satış İstatistikleri
        </h3>
        <div className="flex space-x-2">
          <button className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
            Haftalık
          </button>
          <button className="text-xs font-medium text-gray-500 hover:text-primary px-2 py-1 rounded">
            Aylık
          </button>
          <button className="text-xs font-medium text-gray-500 hover:text-primary px-2 py-1 rounded">
            Yıllık
          </button>
        </div>
      </div>
      
      {/* Placeholder for chart - in a real app, you would use a chart library like Chart.js or Recharts */}
      <div className="h-64 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Grafik kütüphanesi entegrasyonu gerekiyor (Chart.js veya ReCharts)
        </p>
      </div>
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255
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
  const [stats, setStats] = useState({
    totalOrders: '0',
    totalRevenue: '₺0',
    productCount: '0',
    customerCount: '0',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          // Not logged in, redirect to login
          router.push('/login');
          return;
        }
        
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (profileError || !profile || !profile.is_admin) {
          // Not admin, redirect to homepage
          router.push('/');
          return;
        }
        
        // User is admin, fetch dashboard data
        fetchDashboardData();
        
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };
    
    checkAdminStatus();
  }, [supabase, router]);

  // Fetch dashboard statistics
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get orders count
      const { count: orderCount, error: orderError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      // Get total revenue
      const { data: revenue, error: revenueError } = await supabase
        .from('orders')
        .select('total_amount')
        .match({ status: 'delivered' });
      
      // Get product count
      const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      // Get customer count
      const { count: customerCount, error: customerError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', false);
      
      // If no errors, update stats
      if (!orderError && !revenueError && !productError && !customerError) {
        // Calculate total revenue
        const totalRevenue = revenue?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        
        setStats({
          totalOrders: String(orderCount || 0),
          totalRevenue: `₺${totalRevenue.toLocaleString('tr-TR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}`,
          productCount: String(productCount || 0),
          customerCount: String(customerCount || 0),
        });
      }
      
<<<<<<< HEAD
      // Fetch recent admin activity
      const { data: logs, error: activityError } = await supabase
        .from('admin_logs')
        .select(`
          id,
          action,
          entity,
          entity_id,
          details,
          created_at,
          profiles!admin_id(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!activityError && logs) {
        const activities = logs.map((log: any) => {
          const profile = log.profiles;
          let adminText = 'Admin';
          if (profile) {
            if (profile.first_name && profile.last_name) {
              adminText = `${profile.first_name} ${profile.last_name}`;
            } else if (profile.email) {
              adminText = profile.email;
            }
          }

          let content = `${adminText} ${log.action}`;
          if (log.details?.name) {
            content += ` ${log.details.name}`;
          }

          return {
            id: log.id,
            title: log.action,
            content,
            time: formatTimeAgo(new Date(log.created_at)),
            type: log.entity
          };
        });

=======
      // Fetch recent activity (simplified example - could be from orders, products updates, etc.)
      const { data: recentOrders, error: activityError } = await supabase
        .from('orders')
        .select(`
          id, 
          status, 
          created_at, 
          user_id,
          profiles!user_id(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (!activityError && recentOrders) {
        // Cast data to any to help with TypeScript
        const ordersData: any[] = recentOrders;
        
        const activities = ordersData.map(order => {
          // Get profile from the order
          const profile = order.profiles;
          
          // Build user name/email text
          let userText = 'Misafir Kullanıcı';
          if (profile) {
            if (profile.first_name && profile.last_name) {
              userText = `${profile.first_name} ${profile.last_name}`;
            } else if (profile.email) {
              userText = profile.email;
            }
          }
          
          return {
            id: order.id,
            title: `Yeni Sipariş`,
            content: `${userText} bir sipariş verdi`,
            time: formatTimeAgo(new Date(order.created_at)),
            type: 'order'
          };
        });
        
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255
        setActivities(activities);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format time
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} dakika önce`;
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else {
      return `${diffDays} gün önce`;
    }
  };

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'product':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
<<<<<<< HEAD
      case 'category':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      case 'user':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
=======
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-bold dark:text-white">
          Yönetim Paneli
          </h1>
        <div className="mt-4 md:mt-0">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Son güncelleme: {new Date().toLocaleString('tr-TR')}
          </span>
        </div>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Toplam Sipariş"
          value={isLoading ? '...' : stats.totalOrders}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          }
          changeType="increase"
          change="24% Artış"
          isLoading={isLoading}
        />
        <StatsCard
          title="Toplam Gelir"
          value={isLoading ? '...' : stats.totalRevenue}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          }
          changeType="increase"
          change="12% Artış"
          isLoading={isLoading}
        />
        <StatsCard
          title="Toplam Ürün"
          value={isLoading ? '...' : stats.productCount}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
            </svg>
          }
          isLoading={isLoading}
        />
        <StatsCard
          title="Müşteri Sayısı"
          value={isLoading ? '...' : stats.customerCount}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          }
          changeType="increase"
          change="7% Artış"
          isLoading={isLoading}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-sm p-6 h-full">
            <h3 className="text-lg font-semibold mb-6 dark:text-white">Son Aktiviteler</h3>
            {isLoading ? (
              <div className="animate-pulse space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-dark rounded-full"></div>
                    <div className="ml-3 space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-dark rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-dark rounded w-full"></div>
                      <div className="h-3 bg-gray-200 dark:bg-dark rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Henüz aktivite bulunmuyor.
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    title={activity.title}
                    content={activity.content}
                    time={activity.time}
                    icon={getActivityIcon(activity.type)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Columns Layout for Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  );
}
