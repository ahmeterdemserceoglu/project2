'use client';

import Link from 'next/link';
import { useState } from 'react';

// Stats Card component
const StatsCard = ({ title, value, icon, change, changeType }: {
  title: string,
  value: string | number,
  icon: React.ReactNode,
  change?: string,
  changeType?: 'increase' | 'decrease' | 'neutral'
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-500 font-medium">{title}</div>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="text-2xl font-bold mb-2">{value}</div>
      {change && (
        <div className={`text-sm flex items-center ${
          changeType === 'increase' ? 'text-green-600' :
          changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
        }`}>
          {changeType === 'increase' && (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
            </svg>
          )}
          {changeType === 'decrease' && (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          )}
          {change}
        </div>
      )}
    </div>
  );
};

// Recent activity item component
const ActivityItem = ({ title, time, content, icon }: {
  title: string,
  time: string,
  content: string,
  icon: React.ReactNode
}) => {
  return (
    <div className="flex space-x-3">
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{content}</p>
        <span className="text-xs text-gray-400">{time}</span>
      </div>
    </div>
  );
};

// Recent Orders component
const RecentOrders = () => {
  const orders = [
    { id: '1', orderNumber: 'HD-1007', customer: 'Mehmet Can', date: '28.05.2023', status: 'delivered', total: 1250 },
    { id: '2', orderNumber: 'HD-1006', customer: 'Ayşe Demir', date: '29.05.2023', status: 'cancelled', total: 750 },
    { id: '3', orderNumber: 'HD-1005', customer: 'Ali Yıldız', date: '30.05.2023', status: 'delivered', total: 1200 },
    { id: '4', orderNumber: 'HD-1004', customer: 'Fatma Aydın', date: '31.05.2023', status: 'pending', total: 3450 },
    { id: '5', orderNumber: 'HD-1003', customer: 'Mustafa Demir', date: '01.06.2023', status: 'processing', total: 1650 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Son Siparişler</h3>
        <Link href="/admin/orders" className="text-primary hover:text-primary-dark text-sm font-medium">
          Tümünü Gör
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="pb-3">Sipariş No</th>
              <th className="pb-3">Müşteri</th>
              <th className="pb-3">Tarih</th>
              <th className="pb-3">Durum</th>
              <th className="pb-3 text-right">Toplam</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map(order => (
              <tr key={order.id} className="text-sm">
                <td className="py-3 text-primary font-medium">
                  <Link href={`/admin/orders/${order.id}`}>
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="py-3 text-gray-900">{order.customer}</td>
                <td className="py-3 text-gray-500">{order.date}</td>
                <td className="py-3">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                    {order.status === 'delivered' ? 'Teslim Edildi' : 
                     order.status === 'processing' ? 'Hazırlanıyor' :
                     order.status === 'pending' ? 'Bekliyor' : 'İptal Edildi'}
                  </span>
                </td>
                <td className="py-3 text-right text-gray-900">
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
    { id: '1', name: 'iPhone 13 Pro Max', category: 'Elektronik', sold: 45, revenue: 1259955 },
    { id: '2', name: 'Samsung Galaxy S21', category: 'Elektronik', sold: 32, revenue: 543997 },
    { id: '3', name: 'MacBook Pro 16"', category: 'Bilgisayarlar', sold: 15, revenue: 584998 },
    { id: '4', name: 'Bluetooth Kulaklık', category: 'Elektronik', sold: 72, revenue: 21593 },
    { id: '5', name: 'Erkek Spor Ayakkabı', category: 'Giyim', sold: 68, revenue: 61173 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">En Çok Satan Ürünler</h3>
        <Link href="/admin/products" className="text-primary hover:text-primary-dark text-sm font-medium">
          Tümünü Gör
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="pb-3">Ürün</th>
              <th className="pb-3">Kategori</th>
              <th className="pb-3 text-right">Satış</th>
              <th className="pb-3 text-right">Hasılat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id} className="text-sm">
                <td className="py-3 text-gray-900 font-medium">
                  <Link href={`/admin/products/edit/${product.id}`} className="hover:text-primary">
                    {product.name}
                  </Link>
                </td>
                <td className="py-3 text-gray-500">{product.category}</td>
                <td className="py-3 text-right text-gray-900">{product.sold}</td>
                <td className="py-3 text-right text-gray-900">
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
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Satış Grafiği</h3>
        <div className="flex space-x-2 text-sm">
          <button className="px-3 py-1 rounded bg-primary text-white">Günlük</button>
          <button className="px-3 py-1 rounded hover:bg-gray-100">Haftalık</button>
          <button className="px-3 py-1 rounded hover:bg-gray-100">Aylık</button>
        </div>
      </div>
      <div className="h-64 flex flex-col justify-center items-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <p className="text-gray-500">Gerçek bir uygulamada burada interaktif bir grafik gösterilecektir</p>
        <p className="text-gray-400 text-sm mt-2">Örneğin: Chart.js, Recharts veya Nivo kullanılabilir</p>
      </div>
    </div>
  );
};

// Main Dashboard component
export default function AdminDashboardPage() {
  // Time period for filtering data
  const [period, setPeriod] = useState('week');

  return (
    <div>
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gösterge Paneli</h1>
          <p className="text-gray-500">Mağazanız için genel bakış ve istatistikler</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
          >
            <option value="today">Bugün</option>
            <option value="week">Bu Hafta</option>
            <option value="month">Bu Ay</option>
            <option value="year">Bu Yıl</option>
          </select>
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
            Rapor İndir
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Toplam Satış"
          value="₺42,249.50"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          }
          change="+8.2% geçen haftaya göre"
          changeType="increase"
        />
        <StatsCard
          title="Siparişler"
          value="125"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          }
          change="+12.5% geçen haftaya göre"
          changeType="increase"
        />
        <StatsCard
          title="Müşteriler"
          value="1,240"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          }
          change="+3.1% geçen haftaya göre"
          changeType="increase"
        />
        <StatsCard
          title="Ortalama Sipariş"
          value="₺338.00"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          }
          change="-2.5% geçen haftaya göre"
          changeType="decrease"
        />
      </div>

      {/* Charts Row */}
      <div className="mb-8">
        <RevenueChart />
      </div>

      {/* Two Columns Layout for Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  );
} 