"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";

interface OrderDetail {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: number;
    shipping_amount: number;
    tax_amount: number;
    discount_amount: number;
    payment_method: string;
    notes: string;
    created_at: string;
    updated_at: string;
    customer: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
    };
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [statusNote, setStatusNote] = useState("");

    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from("orders")
                    .select(`
            *,
            profiles:user_id (
              first_name,
              last_name,
              email,
              phone
            )
          `)
                    .eq("id", id)
                    .single();

                if (error) throw error;

                setOrder({
                    ...data,
                    customer: data.profiles || {
                        first_name: "",
                        last_name: "",
                        email: "",
                        phone: ""
                    }
                });
                setNewStatus(data.status);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id, supabase]);

    const handleStatusUpdate = async () => {
        if (!order || !newStatus) return;

        try {
            setIsUpdating(true);
            const { error } = await supabase
                .from("orders")
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq("id", order.id);

            if (error) throw error;

            // Sipariş geçmişine kayıt ekle (eğer order_history tablosu varsa)
            if (statusNote) {
                await supabase
                    .from("order_history")
                    .insert({
                        order_id: order.id,
                        status: newStatus,
                        comment: statusNote,
                        created_at: new Date().toISOString()
                    });
            }

            setOrder({ ...order, status: newStatus });
            setStatusNote("");
            alert("Sipariş durumu başarıyla güncellendi!");
        } catch (err: any) {
            alert("Hata: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const statusLabels: Record<string, string> = {
        pending: "Beklemede",
        processing: "Hazırlanıyor",
        shipped: "Kargoda",
        delivered: "Teslim Edildi",
        cancelled: "İptal Edildi",
        refunded: "İade Edildi"
    };

    const paymentLabels: Record<string, string> = {
        paid: "Ödendi",
        pending: "Beklemede",
        failed: "Başarısız",
        refunded: "İade Edildi"
    };

    if (isLoading) {
        return <div className="p-8">Yükleniyor...</div>;
    }

    if (error || !order) {
        return (
            <div className="p-8">
                <div className="text-red-600">Hata: {error || "Sipariş bulunamadı"}</div>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Geri Dön
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Sipariş #{order.order_number}
                    </h1>
                    <p className="text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Geri Dön
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol Kolon - Sipariş Bilgileri */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Müşteri Bilgileri */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Müşteri Bilgileri</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {order.customer.first_name} {order.customer.last_name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">E-posta</label>
                                <p className="mt-1 text-sm text-gray-900">{order.customer.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Telefon</label>
                                <p className="mt-1 text-sm text-gray-900">{order.customer.phone || "Belirtilmemiş"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sipariş İçeriği */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Sipariş İçeriği</h2>
                        {order.notes ? (
                            <div className="text-sm text-gray-600">
                                <p>{order.notes}</p>
                            </div>
                        ) : (
                            <p className="text-gray-500">Sipariş detayları mevcut değil</p>
                        )}
                    </div>

                    {/* Ödeme Bilgileri */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Ödeme Bilgileri</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ödeme Yöntemi</label>
                                <p className="mt-1 text-sm text-gray-900">{order.payment_method || "Belirtilmemiş"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ödeme Durumu</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {paymentLabels[order.payment_status] || order.payment_status}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ara Toplam</label>
                                <p className="mt-1 text-sm text-gray-900">₺{order.total_amount.toFixed(2)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kargo</label>
                                <p className="mt-1 text-sm text-gray-900">₺{(order.shipping_amount || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vergi</label>
                                <p className="mt-1 text-sm text-gray-900">₺{(order.tax_amount || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">İndirim</label>
                                <p className="mt-1 text-sm text-gray-900">₺{(order.discount_amount || 0).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Toplam:</span>
                                <span className="text-lg font-bold text-green-600">₺{order.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sağ Kolon - Durum Güncelleme */}
                <div className="space-y-6">
                    {/* Mevcut Durum */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Sipariş Durumu</h2>
                        <div className="mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {statusLabels[order.status] || order.status}
                            </span>
                        </div>

                        {/* Durum Güncelleme */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Yeni Durum
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pending">Beklemede</option>
                                    <option value="processing">Hazırlanıyor</option>
                                    <option value="shipped">Kargoda</option>
                                    <option value="delivered">Teslim Edildi</option>
                                    <option value="cancelled">İptal Edildi</option>
                                    <option value="refunded">İade Edildi</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Not (Opsiyonel)
                                </label>
                                <textarea
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Durum değişikliği hakkında not..."
                                />
                            </div>

                            <button
                                onClick={handleStatusUpdate}
                                disabled={isUpdating || newStatus === order.status}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? "Güncelleniyor..." : "Durumu Güncelle"}
                            </button>
                        </div>
                    </div>

                    {/* Hızlı İşlemler */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Hızlı İşlemler</h2>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    setNewStatus("shipped");
                                    setStatusNote("Sipariş kargoya verildi");
                                }}
                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                            >
                                Kargoya Ver
                            </button>
                            <button
                                onClick={() => {
                                    setNewStatus("delivered");
                                    setStatusNote("Sipariş teslim edildi");
                                }}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Teslim Edildi İşaretle
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm("Bu siparişi iptal etmek istediğinizden emin misiniz?")) {
                                        setNewStatus("cancelled");
                                        setStatusNote("Sipariş iptal edildi");
                                    }
                                }}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Siparişi İptal Et
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}