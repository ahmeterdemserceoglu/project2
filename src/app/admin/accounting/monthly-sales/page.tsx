"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaFileDownload, FaChartLine } from "react-icons/fa";

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    commission_amount: number;
    tax_amount: number;
    net_amount: number;
    status: string;
    customer_name?: string;
    customer_email?: string;
}

interface MonthlySalesData {
    orders: Order[];
    summary: {
        totalSales: number;
        totalCommission: number;
        totalTax: number;
        netIncome: number;
        orderCount: number;
    };
    monthName: string;
    year: number;
}

export default function MonthlySalesPage() {
    const [salesData, setSalesData] = useState<MonthlySalesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const supabase = useSupabase();

    // URL'den ay ve yıl parametrelerini al
    const month = searchParams?.get("month") ? parseInt(searchParams.get("month")!) : new Date().getMonth() + 1;
    const year = searchParams?.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear();

    useEffect(() => {
        if (supabase) {
            fetchMonthlySalesData();
        }
    }, [supabase, month, year]);

    const fetchMonthlySalesData = async () => {
        if (!supabase) return;

        setIsLoading(true);
        try {
            // Ay başlangıç ve bitiş tarihlerini hesapla
            const firstDayOfMonth = new Date(year, month - 1, 1).toISOString();
            const lastDayOfMonth = new Date(year, month, 0).toISOString();

            // Bu ay için siparişleri getir
            const { data: ordersData, error } = await supabase
                .from("orders")
                .select(`
          *,
          profiles:customer_id (full_name, email)
        `)
                .gte("created_at", firstDayOfMonth)
                .lte("created_at", lastDayOfMonth)
                .order("created_at", { ascending: false });

            if (error) {
                return;
            }

            // Siparişleri formatlı hale getir
            const formattedOrders: Order[] = ordersData.map(order => ({
                id: order.id,
                created_at: order.created_at || "",
                total_amount: order.total_amount || 0,
                commission_amount: order.commission_amount || 0,
                tax_amount: order.tax_amount || 0,
                net_amount: (order.total_amount || 0) - (order.commission_amount || 0) - (order.tax_amount || 0),
                status: order.status || "pending",
                customer_name: order.profiles?.full_name || undefined,
                customer_email: order.profiles?.email || undefined
            }));

            // Aylık özeti hesapla
            const totalSales = formattedOrders.reduce((sum, order) => sum + order.total_amount, 0);
            const totalCommission = formattedOrders.reduce((sum, order) => sum + order.commission_amount, 0);
            const totalTax = formattedOrders.reduce((sum, order) => sum + order.tax_amount, 0);
            const netIncome = totalSales - totalCommission - totalTax;

            // Ay adını belirle
            const monthNames = [
                'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
            ];
            const monthName = monthNames[month - 1];

            setSalesData({
                orders: formattedOrders,
                summary: {
                    totalSales,
                    totalCommission,
                    totalTax,
                    netIncome,
                    orderCount: formattedOrders.length
                },
                monthName,
                year
            });
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handleExportCSV = () => {
        if (!salesData) return;

        // CSV başlık satırı
        let csvContent = "Sipariş ID,Tarih,Müşteri,Toplam Tutar,Komisyon,Vergi,Net Tutar,Durum\n";

        // Sipariş verilerini CSV formatına dönüştür
        salesData.orders.forEach(order => {
            const row = [
                order.id,
                formatDate(order.created_at),
                `${order.customer_name || 'Bilinmiyor'} (${order.customer_email || 'E-posta yok'})`,
                order.total_amount.toFixed(2),
                order.commission_amount.toFixed(2),
                order.tax_amount.toFixed(2),
                order.net_amount.toFixed(2),
                getStatusText(order.status)
            ];

            // Hücrelerdeki virgülleri işle ve satırı ekle
            csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\n";
        });

        // CSV dosyasını indir
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `satis-raporu-${salesData.monthName}-${salesData.year}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "completed":
                return "Tamamlandı";
            case "processing":
                return "İşleniyor";
            case "pending":
                return "Beklemede";
            case "cancelled":
                return "İptal Edildi";
            default:
                return status;
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/accounting" className="inline-flex items-center text-indigo-600 hover:text-indigo-900">
                        <FaArrowLeft className="mr-2 h-4 w-4" />
                        Muhasebe Sayfasına Dön
                    </Link>
                    <h1 className="text-2xl font-bold mt-2">
                        {salesData?.monthName} {salesData?.year} Satış Raporu
                    </h1>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <FaFileDownload className="mr-2 h-4 w-4" />
                    CSV İndir
                </button>
            </div>

            {/* Özet Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <FaChartLine className="h-8 w-8 text-indigo-500" />
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">Toplam Satış</h3>
                            <p className="text-2xl font-semibold text-gray-900">
                                {salesData && formatCurrency(salesData.summary.totalSales)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-amber-800 font-bold">%</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">Toplam Komisyon</h3>
                            <p className="text-2xl font-semibold text-gray-900">
                                {salesData && formatCurrency(salesData.summary.totalCommission)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-red-800 font-bold">₺</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">Toplam Vergi</h3>
                            <p className="text-2xl font-semibold text-gray-900">
                                {salesData && formatCurrency(salesData.summary.totalTax)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-800 font-bold">₺</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">Net Kazanç</h3>
                            <p className="text-2xl font-semibold text-green-600">
                                {salesData && formatCurrency(salesData.summary.netIncome)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sipariş Tablosu */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                            Siparişler ({salesData?.orders.length || 0})
                        </h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {salesData && salesData.orders.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sipariş ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tarih
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Müşteri
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Toplam
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Komisyon
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vergi
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Net
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Durum
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {salesData.orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                            <Link href={`/admin/orders/${order.id}`}>
                                                #{order.id.substring(0, 8)}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{order.customer_name || "Bilinmiyor"}</div>
                                            <div className="text-sm text-gray-500">{order.customer_email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(order.total_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(order.commission_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(order.tax_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            {formatCurrency(order.net_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-12 text-center text-gray-500">
                            <p className="text-lg font-medium">Bu ay için sipariş bulunamadı</p>
                            <p className="mt-1">Seçilen dönem için herhangi bir sipariş kaydı yok.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
