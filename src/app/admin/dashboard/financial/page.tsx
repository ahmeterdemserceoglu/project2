"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/auth";
import Link from "next/link";
import { FaArrowLeft, FaChartLine, FaMoneyBillWave, FaPercentage, FaShoppingCart, FaExclamationTriangle, FaCalendarAlt } from "react-icons/fa";

interface FinancialSummary {
    totalSales: number;
    totalCommission: number;
    totalTax: number;
    netIncome: number;
    orderCount: number;
    averageOrderValue: number;
}

interface MonthlySummary {
    month: string;
    year: number;
    totalSales: number;
    totalCommission: number;
    totalTax: number;
    netIncome: number;
    orderCount: number;
}

export default function FinancialDashboardPage() {
    const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
    const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState<'7days' | '30days' | '90days' | '12months'>('30days');
    const supabase = useSupabase();

    useEffect(() => {
        fetchFinancialData();
    }, [timeframe]);

    const fetchFinancialData = async () => {
        if (!supabase) return;

        setIsLoading(true);
        try {
            // Zaman aralığını belirle
            const endDate = new Date();
            let startDate = new Date();

            switch (timeframe) {
                case '7days':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case '30days':
                    startDate.setDate(endDate.getDate() - 30);
                    break;
                case '90days':
                    startDate.setDate(endDate.getDate() - 90);
                    break;
                case '12months':
                    startDate.setMonth(endDate.getMonth() - 12);
                    break;
            }

            const startDateISO = startDate.toISOString();
            const endDateISO = endDate.toISOString();

            // Toplam satış verilerini getir
            const { data: orders, error } = await supabase
                .from("orders")
                .select("total_amount, commission_amount, tax_amount, created_at")
                .gte("created_at", startDateISO)
                .lte("created_at", endDateISO);

            if (error) {
                return;
            }

            // Finansal özeti hesapla
            let totalSales = 0;
            let totalCommission = 0;
            let totalTax = 0;

            if (orders && orders.length > 0) {
                orders.forEach(order => {
                    totalSales += order.total_amount || 0;
                    totalCommission += order.commission_amount || 0;
                    totalTax += order.tax_amount || 0;
                });
            }

            const netIncome = totalSales - totalCommission - totalTax;
            const orderCount = orders?.length || 0;
            const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

            setFinancialSummary({
                totalSales,
                totalCommission,
                totalTax,
                netIncome,
                orderCount,
                averageOrderValue
            });

            // Aylık verileri getir (son 12 ay için)
            const monthlyData = [];
            const today = new Date();
            const monthCount = timeframe === '12months' ? 12 : 6;

            for (let i = 0; i < monthCount; i++) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthName = date.toLocaleString('tr-TR', { month: 'long' });
                const year = date.getFullYear();
                const firstDayOfMonth = new Date(year, date.getMonth(), 1).toISOString();
                const lastDayOfMonth = new Date(year, date.getMonth() + 1, 0).toISOString();

                // Bu ay için siparişleri getir
                const { data: monthlyOrders, error: monthlyError } = await supabase
                    .from("orders")
                    .select("total_amount, commission_amount, tax_amount, created_at")
                    .gte("created_at", firstDayOfMonth)
                    .lte("created_at", lastDayOfMonth);

                if (monthlyError) {
                    continue;
                }

                // Aylık özeti hesapla
                let monthTotalSales = 0;
                let monthTotalCommission = 0;
                let monthTotalTax = 0;

                if (monthlyOrders && monthlyOrders.length > 0) {
                    monthlyOrders.forEach(order => {
                        monthTotalSales += order.total_amount || 0;
                        monthTotalCommission += order.commission_amount || 0;
                        monthTotalTax += order.tax_amount || 0;
                    });
                }

                monthlyData.push({
                    month: monthName,
                    year: year,
                    totalSales: monthTotalSales,
                    totalCommission: monthTotalCommission,
                    totalTax: monthTotalTax,
                    netIncome: monthTotalSales - monthTotalCommission - monthTotalTax,
                    orderCount: monthlyOrders?.length || 0
                });
            }

            setMonthlySummaries(monthlyData.reverse());
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${(value * 100).toFixed(2)}%`;
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
                    <Link href="/admin" className="inline-flex items-center text-indigo-600 hover:text-indigo-900">
                        <FaArrowLeft className="mr-2 h-4 w-4" />
                        Gösterge Paneline Dön
                    </Link>
                    <h1 className="text-2xl font-bold mt-2">Finansal Gösterge Paneli</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Zaman Aralığı:</span>
                    <div className="flex rounded-md shadow-sm">
                        <button
                            onClick={() => setTimeframe('7days')}
                            className={`px-4 py-2 text-sm font-medium ${timeframe === '7days' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                } border border-gray-300 first:rounded-l-md last:rounded-r-md`}
                        >
                            7 Gün
                        </button>
                        <button
                            onClick={() => setTimeframe('30days')}
                            className={`px-4 py-2 text-sm font-medium ${timeframe === '30days' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                } border-t border-b border-r border-gray-300`}
                        >
                            30 Gün
                        </button>
                        <button
                            onClick={() => setTimeframe('90days')}
                            className={`px-4 py-2 text-sm font-medium ${timeframe === '90days' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                } border-t border-b border-r border-gray-300`}
                        >
                            90 Gün
                        </button>
                        <button
                            onClick={() => setTimeframe('12months')}
                            className={`px-4 py-2 text-sm font-medium ${timeframe === '12months' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                } border-t border-b border-r border-gray-300 rounded-r-md`}
                        >
                            12 Ay
                        </button>
                    </div>
                </div>
            </div>

            {/* Ana Metrikler */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Toplam Satış */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-blue-500 to-indigo-600">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                                <FaMoneyBillWave className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-blue-100 truncate">Toplam Satış</dt>
                                    <dd>
                                        <div className="text-lg font-semibold text-white">
                                            {financialSummary && formatCurrency(financialSummary.totalSales)}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link href="/admin/accounting" className="font-medium text-indigo-600 hover:text-indigo-900">
                                Detaylı Rapor
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Net Kazanç */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-green-500 to-emerald-600">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                                <FaChartLine className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-green-100 truncate">Net Kazanç</dt>
                                    <dd>
                                        <div className="text-lg font-semibold text-white">
                                            {financialSummary && formatCurrency(financialSummary.netIncome)}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <div className="font-medium text-gray-500">
                                Kar Marjı: {financialSummary && formatPercentage(financialSummary.netIncome / financialSummary.totalSales)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toplam Komisyon */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-amber-500 to-yellow-600">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                                <FaPercentage className="h-6 w-6 text-amber-500" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-amber-100 truncate">Toplam Komisyon</dt>
                                    <dd>
                                        <div className="text-lg font-semibold text-white">
                                            {financialSummary && formatCurrency(financialSummary.totalCommission)}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <div className="font-medium text-gray-500">
                                Komisyon Oranı: {financialSummary && formatPercentage(financialSummary.totalCommission / financialSummary.totalSales)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sipariş Sayısı */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-purple-500 to-violet-600">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                                <FaShoppingCart className="h-6 w-6 text-purple-500" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-purple-100 truncate">Sipariş Sayısı</dt>
                                    <dd>
                                        <div className="text-lg font-semibold text-white">
                                            {financialSummary && financialSummary.orderCount}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <div className="font-medium text-gray-500">
                                Ortalama Sipariş: {financialSummary && formatCurrency(financialSummary.averageOrderValue)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aylık Özet Tablosu */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">Aylık Finansal Özet</h3>
                        <FaCalendarAlt className="ml-2 h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dönem
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Satış
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Komisyon
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vergi
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Net Kazanç
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sipariş Sayısı
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ort. Sipariş
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {monthlySummaries.map((summary, index) => (
                                <tr key={`${summary.month}-${summary.year}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link href={`/admin/accounting/monthly-sales?month=${index + 1}&year=${summary.year}`} className="text-indigo-600 hover:text-indigo-900">
                                            {summary.month} {summary.year}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(summary.totalSales)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(summary.totalCommission)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(summary.totalTax)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                        {formatCurrency(summary.netIncome)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {summary.orderCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(summary.orderCount > 0 ? summary.totalSales / summary.orderCount : 0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Finansal Bilgilendirme */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">Finansal Performans Analizi</h3>
                        <FaExclamationTriangle className="ml-2 h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <div className="p-6">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FaChartLine className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    {financialSummary && (
                                        <>
                                            {timeframe === '7days' && 'Son 7 gün içinde '}
                                            {timeframe === '30days' && 'Son 30 gün içinde '}
                                            {timeframe === '90days' && 'Son 90 gün içinde '}
                                            {timeframe === '12months' && 'Son 12 ay içinde '}
                                            toplam <strong>{formatCurrency(financialSummary.totalSales)}</strong> satış gerçekleşti.
                                            Bu satışlardan <strong>{formatCurrency(financialSummary.netIncome)}</strong> net kazanç elde edildi.
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-base font-medium text-gray-900">Finansal Göstergeler</h4>
                            <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                                    <dt className="truncate text-sm font-medium text-gray-500">Ortalama Sipariş Değeri</dt>
                                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                                        {financialSummary && formatCurrency(financialSummary.averageOrderValue)}
                                    </dd>
                                </div>
                                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                                    <dt className="truncate text-sm font-medium text-gray-500">Kar Marjı</dt>
                                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                                        {financialSummary && formatPercentage(financialSummary.netIncome / financialSummary.totalSales)}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div>
                            <h4 className="text-base font-medium text-gray-900">Öneriler</h4>
                            <ul className="mt-2 space-y-2 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>
                                        {financialSummary && financialSummary.averageOrderValue < 500 ? (
                                            "Ortalama sipariş değerini artırmak için çapraz satış ve üst satış stratejileri uygulayın."
                                        ) : (
                                            "Yüksek ortalama sipariş değerinizi korumak için müşteri sadakat programları oluşturun."
                                        )}
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>
                                        {financialSummary && (financialSummary.totalCommission / financialSummary.totalSales) > 0.15 ? (
                                            "Komisyon oranlarınızı gözden geçirerek satıcılarla daha uygun anlaşmalar yapabilirsiniz."
                                        ) : (
                                            "Mevcut komisyon oranlarınız rekabetçi görünüyor. Satıcı sayısını artırmak için bu avantajı kullanabilirsiniz."
                                        )}
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>
                                        Düzenli vergi ödemelerinizi yaparak cezalardan kaçının ve finansal planlamanızı optimize edin.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}