"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/auth";
import Link from "next/link";
import { FaFileInvoiceDollar, FaChartBar, FaCalendarAlt, FaMoneyBillWave, FaPercentage, FaExclamationTriangle } from "react-icons/fa";

interface MonthlySummary {
    month: string;
    year: number;
    totalSales: number;
    totalCommission: number;
    totalTax: number;
    netIncome: number;
    orderCount: number;
    isPaid: boolean;
}

export default function AccountingPage() {
    const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalUnpaidTax, setTotalUnpaidTax] = useState(0);
    const supabase = useSupabase();

    useEffect(() => {
        if (supabase) {
            fetchAccountingData();
        }
    }, [supabase]);

    const fetchAccountingData = async () => {
        if (!supabase) return;

        setIsLoading(true);
        try {
            // Son 12 ayın verilerini getir
            const months = [];
            const today = new Date();

            for (let i = 0; i < 12; i++) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthName = date.toLocaleString('tr-TR', { month: 'long' });
                const year = date.getFullYear();
                const firstDayOfMonth = new Date(year, date.getMonth(), 1).toISOString();
                const lastDayOfMonth = new Date(year, date.getMonth() + 1, 0).toISOString();

                // Bu ay için siparişleri getir
                const { data: monthlyOrders, error } = await supabase
                    .from("orders")
                    .select("total_amount, commission_amount, tax_amount, created_at")
                    .gte("created_at", firstDayOfMonth)
                    .lte("created_at", lastDayOfMonth);

                if (error) {
                    continue;
                }

                // Aylık özeti hesapla
                let totalSales = 0;
                let totalCommission = 0;
                let totalTax = 0;

                if (monthlyOrders && monthlyOrders.length > 0) {
                    monthlyOrders.forEach(order => {
                        totalSales += order.total_amount || 0;
                        totalCommission += order.commission_amount || 0;
                        totalTax += order.tax_amount || 0;
                    });
                }

                // Vergi ödemesi yapılıp yapılmadığını kontrol et
                const { data: paymentRecord } = await supabase
                    .from("tax_payments")
                    .select("*")
                    .eq("month", date.getMonth() + 1)
                    .eq("year", year)
                    .maybeSingle();

                const isPaid = !!paymentRecord;

                months.push({
                    month: monthName,
                    year: year,
                    totalSales,
                    totalCommission,
                    totalTax,
                    netIncome: totalSales - totalCommission - totalTax,
                    orderCount: monthlyOrders?.length || 0,
                    isPaid
                });
            }

            // Ödenmemiş toplam vergiyi hesapla
            const unpaidTax = months.reduce((sum, month) => {
                if (!month.isPaid) {
                    return sum + month.totalTax;
                }
                return sum;
            }, 0);

            setTotalUnpaidTax(unpaidTax);
            setMonthlySummaries(months);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsPaid = async (month: number, year: number) => {
        if (!supabase) return;

        try {
            // Vergi tutarını bul
            const taxAmount = monthlySummaries.find(m =>
                m.year === year &&
                m.month === new Date(year, month - 1, 1).toLocaleString('tr-TR', { month: 'long' })
            )?.totalTax || 0;

            // Vergi ödemesi kaydı ekle
            const { error } = await supabase
                .from("tax_payments")
                .insert({
                    month,
                    year,
                    payment_date: new Date().toISOString(),
                    amount: taxAmount
                });

            if (error) {
                alert("Ödeme kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
                return;
            }

            // Verileri yeniden yükle
            fetchAccountingData();
        } catch (error) {
            alert("Ödeme işaretlenirken bir hata oluştu. Lütfen tekrar deneyin.");
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const getMonthNumber = (monthName: string) => {
        const months = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];
        return months.indexOf(monthName) + 1;
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
            <div>
                <h1 className="text-2xl font-bold mb-2">Muhasebe</h1>
                <p className="text-gray-600">
                    Satış, komisyon ve vergi ödemelerinizi yönetin.
                </p>
            </div>

            {/* Özet Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Toplam Ödenmemiş Vergi */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-red-500 to-pink-600">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                                <FaExclamationTriangle className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-red-100 truncate">Ödenmemiş Vergi</dt>
                                    <dd>
                                        <div className="text-lg font-semibold text-white">{formatCurrency(totalUnpaidTax)}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bu Ayki Satışlar */}
                {monthlySummaries.length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-5 bg-gradient-to-r from-blue-500 to-indigo-600">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                                    <FaChartBar className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-blue-100 truncate">Bu Ay Satışlar</dt>
                                        <dd>
                                            <div className="text-lg font-semibold text-white">{formatCurrency(monthlySummaries[0].totalSales)}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bu Ayki Net Kazanç */}
                {monthlySummaries.length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-5 bg-gradient-to-r from-green-500 to-emerald-600">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                                    <FaMoneyBillWave className="h-6 w-6 text-green-500" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-green-100 truncate">Bu Ay Net Kazanç</dt>
                                        <dd>
                                            <div className="text-lg font-semibold text-white">{formatCurrency(monthlySummaries[0].netIncome)}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Aylık Özet Tablosu */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">Aylık Özet</h3>
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
                                    Durum
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {monthlySummaries.map((summary, index) => (
                                <tr key={`${summary.month}-${summary.year}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link href={`/admin/accounting/monthly-sales?month=${getMonthNumber(summary.month)}&year=${summary.year}`} className="text-indigo-600 hover:text-indigo-900">
                                            {summary.month} {summary.year}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(summary.totalSales)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center text-gray-900">
                                            <FaPercentage className="mr-1 h-3 w-3 text-gray-500" />
                                            {formatCurrency(summary.totalCommission)}
                                        </div>
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${summary.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {summary.isPaid ? 'Ödendi' : 'Ödenmedi'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {!summary.isPaid && summary.totalTax > 0 && (
                                            <button
                                                onClick={() => handleMarkAsPaid(getMonthNumber(summary.month), summary.year)}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md"
                                            >
                                                Ödendi İşaretle
                                            </button>
                                        )}
                                        <Link
                                            href={`/admin/accounting/monthly-sales?month=${getMonthNumber(summary.month)}&year=${summary.year}`}
                                            className="ml-2 text-blue-600 hover:text-blue-900"
                                        >
                                            Detaylar
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vergi Beyannamesi */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">Vergi Beyannamesi</h3>
                        <FaFileInvoiceDollar className="ml-2 h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Vergi beyannamesi her ayın sonunda otomatik olarak hazırlanır. Ödenmemiş vergi tutarınız: <span className="font-semibold text-red-600">{formatCurrency(totalUnpaidTax)}</span>
                    </p>
                    <p className="text-gray-600 mb-4">
                        Vergi ödemelerinizi zamanında yapmanız gerekmektedir. Ödeme yaptıktan sonra "Ödendi İşaretle" butonuna tıklayarak kaydınızı güncelleyebilirsiniz.
                    </p>
                    <div className="mt-4 flex space-x-4">
                        <Link
                            href="/admin/accounting/tax-reports"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Vergi Raporlarını Görüntüle
                        </Link>
                        <Link
                            href="/admin/dashboard/financial"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Finansal Gösterge Paneli
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
