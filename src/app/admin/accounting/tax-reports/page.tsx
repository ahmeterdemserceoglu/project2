"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/auth";
import Link from "next/link";
import { FaArrowLeft, FaFileDownload, FaChartLine, FaExclamationTriangle, FaCalendarAlt } from "react-icons/fa";

interface TaxPayment {
    id: string;
    month: number;
    year: number;
    payment_date: string;
    amount: number;
}

interface TaxSummary {
    month: string;
    year: number;
    totalTax: number;
    isPaid: boolean;
    paymentDate?: string;
    paymentId?: string;
}

export default function TaxReportsPage() {
    const [taxSummaries, setTaxSummaries] = useState<TaxSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
    const [totalUnpaidTax, setTotalUnpaidTax] = useState(0);
    const supabase = useSupabase();

    useEffect(() => {
        if (supabase) {
            fetchTaxData();
        }
    }, [supabase, yearFilter]);

    const fetchTaxData = async () => {
        if (!supabase) return;

        setIsLoading(true);
        try {
            // Tüm aylar için vergi verilerini getir
            const months = [];

            for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                const date = new Date(yearFilter, monthIndex, 1);
                const monthName = date.toLocaleString('tr-TR', { month: 'long' });
                const year = date.getFullYear();
                const firstDayOfMonth = new Date(year, date.getMonth(), 1).toISOString();
                const lastDayOfMonth = new Date(year, date.getMonth() + 1, 0).toISOString();

                // Bu ay için siparişleri getir
                const { data: monthlyOrders, error } = await supabase
                    .from("orders")
                    .select("tax_amount")
                    .gte("created_at", firstDayOfMonth)
                    .lte("created_at", lastDayOfMonth);

                if (error) {
                    continue;
                }

                // Aylık vergi tutarını hesapla
                let totalTax = 0;

                if (monthlyOrders && monthlyOrders.length > 0) {
                    monthlyOrders.forEach(order => {
                        totalTax += order.tax_amount || 0;
                    });
                }

                // Vergi ödemesi yapılıp yapılmadığını kontrol et
                let paymentRecord = null;
                try {
                    const { data, error: paymentError } = await supabase
                        .from("tax_payments")
                        .select("*")
                        .eq("month", monthIndex + 1)
                        .eq("year", year)
                        .maybeSingle();

                    if (!paymentError) {
                        paymentRecord = data;
                    } else {
                    }
                } catch (err) {
                }

                const isPaid = !!paymentRecord;

                months.push({
                    month: monthName,
                    year: year,
                    totalTax,
                    isPaid,
                    paymentDate: paymentRecord?.payment_date,
                    paymentId: paymentRecord?.id
                });
            }

            // Ödenmemiş toplam vergiyi hesapla
            const unpaidTax = months.reduce((sum, month) => {
                if (!month.isPaid && month.totalTax > 0) {
                    return sum + month.totalTax;
                }
                return sum;
            }, 0);

            setTotalUnpaidTax(unpaidTax);
            setTaxSummaries(months);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsPaid = async (month: number, year: number, amount: number) => {
        if (!supabase) return;

        try {
            // Vergi ödemesi kaydı ekle
            const { error } = await supabase
                .from("tax_payments")
                .insert({
                    month,
                    year,
                    payment_date: new Date().toISOString(),
                    amount
                });

            if (error) {
                alert("Ödeme kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
                return;
            }

            // Verileri yeniden yükle
            fetchTaxData();
        } catch (error) {
            alert("Ödeme işaretlenirken bir hata oluştu. Lütfen tekrar deneyin.");
        }
    };

    const handleDeletePayment = async (paymentId: string) => {
        if (!supabase || !paymentId) return;

        try {
            const { error } = await supabase
                .from("tax_payments")
                .delete()
                .eq("id", paymentId);

            if (error) {
                alert("Ödeme kaydı silinirken bir hata oluştu. Lütfen tekrar deneyin.");
                return;
            }

            // Verileri yeniden yükle
            fetchTaxData();
        } catch (error) {
            alert("Ödeme silinirken bir hata oluştu. Lütfen tekrar deneyin.");
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

    const getMonthNumber = (monthName: string) => {
        const months = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];
        return months.indexOf(monthName) + 1;
    };

    const handleExportCSV = () => {
        // CSV başlık satırı
        let csvContent = "Dönem,Vergi Tutarı,Durum,Ödeme Tarihi\n";

        // Vergi verilerini CSV formatına dönüştür
        taxSummaries.forEach(summary => {
            const row = [
                `${summary.month} ${summary.year}`,
                summary.totalTax.toFixed(2),
                summary.isPaid ? "Ödendi" : "Ödenmedi",
                summary.paymentDate ? formatDate(summary.paymentDate) : "-"
            ];

            // Hücrelerdeki virgülleri işle ve satırı ekle
            csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\n";
        });

        // CSV dosyasını indir
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `vergi-raporu-${yearFilter}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    <h1 className="text-2xl font-bold mt-2">Vergi Raporları</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <label htmlFor="year-filter" className="mr-2 text-sm font-medium text-gray-700">Yıl:</label>
                        <select
                            id="year-filter"
                            value={yearFilter}
                            onChange={(e) => setYearFilter(Number(e.target.value))}
                            className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {[...Array(5)].map((_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <FaFileDownload className="mr-2 h-4 w-4" />
                        CSV İndir
                    </button>
                </div>
            </div>

            {/* Özet Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Yıllık Toplam Vergi */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-blue-500 to-indigo-600">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-white p-3 rounded-lg">
                                <FaCalendarAlt className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-blue-100 truncate">{yearFilter} Yılı Toplam Vergi</dt>
                                    <dd>
                                        <div className="text-lg font-semibold text-white">
                                            {formatCurrency(taxSummaries.reduce((sum, item) => sum + item.totalTax, 0))}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vergi Tablosu */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">Aylık Vergi Özeti</h3>
                        <FaChartLine className="ml-2 h-5 w-5 text-gray-400" />
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
                                    Vergi Tutarı
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Durum
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ödeme Tarihi
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {taxSummaries.map((summary) => (
                                <tr key={`${summary.month}-${summary.year}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link href={`/admin/accounting/monthly-sales?month=${getMonthNumber(summary.month)}&year=${summary.year}`} className="text-indigo-600 hover:text-indigo-900">
                                            {summary.month} {summary.year}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(summary.totalTax)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${summary.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {summary.isPaid ? 'Ödendi' : 'Ödenmedi'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {summary.paymentDate ? formatDate(summary.paymentDate) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {!summary.isPaid && summary.totalTax > 0 ? (
                                            <button
                                                onClick={() => handleMarkAsPaid(getMonthNumber(summary.month), summary.year, summary.totalTax)}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md"
                                            >
                                                Ödendi İşaretle
                                            </button>
                                        ) : summary.isPaid && summary.paymentId ? (
                                            <button
                                                onClick={() => handleDeletePayment(summary.paymentId!)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md"
                                            >
                                                Ödemeyi İptal Et
                                            </button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vergi Bilgilendirme */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">Vergi Bilgilendirme</h3>
                        <FaExclamationTriangle className="ml-2 h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <div className="p-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Vergi ödemelerinizi zamanında yapmanız gerekmektedir. Gecikme durumunda cezai işlem uygulanabilir.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 space-y-4">
                        <p className="text-gray-600">
                            <strong>Vergi Ödeme Prosedürü:</strong>
                        </p>
                        <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                            <li>Her ayın vergi tutarını ilgili vergi dairesine ödemeniz gerekmektedir.</li>
                            <li>Ödeme yapıldıktan sonra "Ödendi İşaretle" butonuna tıklayarak sistemi güncelleyiniz.</li>
                            <li>Vergi beyannamelerini her ayın 25'ine kadar vermeniz gerekmektedir.</li>
                            <li>Ödemeler her ayın son gününe kadar yapılmalıdır.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
} 