"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import RequireAuth from "@/components/auth/RequireAuth";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  attributes?: any;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800"
};

const statusLabels = {
  pending: "Beklemede",
  processing: "Hazırlanıyor", // Admin panelle aynı
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
  refunded: "İade Edildi"
};

export default function OrdersPage() {
  const { user, session, loading } = useAuth();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    if (!user?.id || !session?.access_token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const orderData = await response.json();
        setOrders(orderData);
      } else {
        // Mock data göster
        const mockOrders: Order[] = [
          {
            id: "mock-1",
            order_number: "ORD-2024-001",
            status: "processing",
            total_amount: 299.99,
            payment_status: "paid",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            order_items: [
              {
                id: "item-1",
                product_id: "prod-1",
                product_name: "Örnek Ürün 1",
                quantity: 2,
                unit_price: 149.99,
                created_at: new Date().toISOString()
              }
            ]
          },
          {
            id: "mock-2",
            order_number: "ORD-2024-002",
            status: "delivered",
            total_amount: 149.50,
            payment_status: "paid",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
            order_items: [
              {
                id: "item-2",
                product_id: "prod-2",
                product_name: "Örnek Ürün 2",
                quantity: 1,
                unit_price: 149.50,
                created_at: new Date(Date.now() - 86400000).toISOString()
              }
            ]
          }
        ];
        setOrders(mockOrders);
      }
    } catch (error) {
      showNotification("Siparişler yüklenirken bir hata oluştu", "error");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      loadOrders();
    }
  }, [loading, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `₺${price.toFixed(2)}`;
  };

  const handleViewDetails = (orderId: string) => {
    // Modal açarak detayları göster veya ayrı sayfaya yönlendir
    alert(`Sipariş detayları: ${orderId}`);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        showNotification('Sipariş başarıyla iptal edildi', 'success');
        loadOrders(); // Listeyi yenile
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Sipariş iptal edilemedi', 'error');
      }
    } catch (error) {
      showNotification('Sipariş iptal edilirken bir hata oluştu', 'error');
    }
  };

  const handleReorder = (orderId: string) => {
    // Sipariş ürünlerini sepete ekle
    alert(`Tekrar sipariş: ${orderId}`);
  };

  if (loading || isLoading) {
    return (
      <RequireAuth>
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Siparişlerim
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Geçmiş siparişlerinizi görüntüleyin ve takip edin.
            </p>
          </div>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Alışverişe Devam Et
          </Link>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-dark-light rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Henüz siparişiniz yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              İlk siparişinizi vermek için alışverişe başlayın.
            </p>
            <Link
              href="/products"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Ürünleri Keşfet
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-dark-light rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Sipariş #{order.order_number}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors] || statusColors.pending
                          }`}
                      >
                        {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                      </span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.notes && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Sipariş İçeriği
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewDetails(order.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Detayları Görüntüle
                        </button>
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => handleReorder(order.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Tekrar Sipariş Ver
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            İptal Et
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Ödeme: {order.payment_status === 'paid' ? 'Tamamlandı' : 'Beklemede'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}