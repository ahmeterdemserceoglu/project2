"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/contexts/ToastContext";
import { FaEdit, FaTrash } from "react-icons/fa";

type Product = Pick<Database["public"]["Tables"]["products"]["Row"], "id" | "name" | "base_price">;

type FlashDeal = {
    id: string;
    product_id: string;
    title: string;
    description: string | null;
    discount_percent: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
    products?: {
        name: string;
        base_price: number;
        primary_image_url?: string;
    } | null;
    status?: 'active' | 'expired' | 'upcoming';
};

export default function FlashDealsPage() {
    const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingDeal, setEditingDeal] = useState<FlashDeal | null>(null);
    const [formData, setFormData] = useState({
        product_id: "",
        title: "",
        description: "",
        discount_percent: 20,
        start_time: new Date().toISOString().slice(0, 16),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        is_active: true
    });

    const supabase = createClientComponentClient();
    const { showToast } = useToast();

    // Fetch flash deals and products
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                // Fetch all flash deals, including expired and upcoming ones
                const { data: dealsData, error: dealsError } = await supabase
                    .from("flash_deals")
                    .select(`
                        *,
                        products (
                            name,
                            base_price,
                            primary_image_url
                        )
                    `)
                    .order("created_at", { ascending: false });

                if (dealsError) throw dealsError;

                // Process deals and add status information
                const now = new Date().getTime();
                const processedDeals = dealsData?.map(deal => {
                    const startTime = new Date(deal.start_time).getTime();
                    const endTime = new Date(deal.end_time).getTime();

                    let status = 'active';
                    let shouldBeActive = deal.is_active;

                    if (now > endTime) {
                        status = 'expired';
                        // Süresi dolmuş fırsatları otomatik olarak pasif yap
                        if (deal.is_active) {
                            shouldBeActive = false;
                            // Database'de güncelle
                            supabase
                                .from("flash_deals")
                                .update({ is_active: false })
                                .eq("id", deal.id);
                        }
                    } else if (now < startTime) {
                        status = 'upcoming';
                    }

                    return { ...deal, status: status as 'active' | 'expired' | 'upcoming', is_active: shouldBeActive };
                }) || [];

                setFlashDeals(processedDeals as FlashDeal[]);

                // Fetch active products for the dropdown
                const { data: productsData, error: productsError } = await supabase
                    .from("products")
                    .select("id, name, base_price")
                    .eq("is_active", true)
                    .order("name");

                if (productsError) throw productsError;
                setProducts(productsData || []);
            } catch (error) {
                showToast("Veri yüklenirken bir hata oluştu", "error");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [supabase, showToast]);

    // Handle form input changes
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            product_id: "",
            title: "",
            description: "",
            discount_percent: 20,
            start_time: new Date().toISOString().slice(0, 16),
            end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            is_active: true
        });
        setEditingDeal(null);
    };

    // Handle edit
    const handleEdit = (deal: FlashDeal) => {
        setEditingDeal(deal);
        setFormData({
            product_id: deal.product_id,
            title: deal.title,
            description: deal.description || "",
            discount_percent: deal.discount_percent,
            start_time: new Date(deal.start_time).toISOString().slice(0, 16),
            end_time: new Date(deal.end_time).toISOString().slice(0, 16),
            is_active: deal.is_active ?? false
        });
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Tarih formatını düzeltme
            const startTime = new Date(formData.start_time);
            const endTime = new Date(formData.end_time);

            // Bitiş tarihi başlangıç tarihinden önce mi kontrol et
            if (endTime <= startTime) {
                showToast("Bitiş tarihi başlangıç tarihinden sonra olmalıdır", "error");
                return;
            }

            // İndirim yüzdesi kontrolü
            if (formData.discount_percent <= 0 || formData.discount_percent >= 100) {
                showToast("İndirim yüzdesi 1-99 arasında olmalıdır", "error");
                return;
            }

            if (editingDeal) {
                // Update existing deal
                const { error } = await supabase
                    .from("flash_deals")
                    .update({
                        product_id: formData.product_id,
                        title: formData.title,
                        description: formData.description || null,
                        discount_percent: formData.discount_percent,
                        start_time: startTime.toISOString(),
                        end_time: endTime.toISOString(),
                        is_active: formData.is_active,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", editingDeal.id);

                if (error) {
                    throw error;
                }
                showToast("Fırsat başarıyla güncellendi", "success");
            } else {
                // Create new deal
                const { error } = await supabase
                    .from("flash_deals")
                    .insert({
                        product_id: formData.product_id,
                        title: formData.title,
                        description: formData.description || null,
                        discount_percent: formData.discount_percent,
                        start_time: startTime.toISOString(),
                        end_time: endTime.toISOString(),
                        is_active: formData.is_active
                    });

                if (error) {
                    throw error;
                }
                showToast("Fırsat başarıyla eklendi", "success");
            }

            // Refresh data
            const { data, error } = await supabase
                .from("flash_deals")
                .select(`
          *,
          products (
            name,
            base_price
          )
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setFlashDeals(data || []);
            resetForm();
        } catch (error: any) {
            showToast(`Bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`, "error");
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm("Bu fırsatı silmek istediğinizden emin misiniz?")) return;

        try {
            const { error } = await supabase
                .from("flash_deals")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setFlashDeals(prev => prev.filter(deal => deal.id !== id));
            showToast("Fırsat başarıyla silindi", "success");
        } catch (error) {
            showToast("Silme işlemi sırasında bir hata oluştu", "error");
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("tr-TR");
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Günün Fırsatları Yönetimi</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {editingDeal ? "Fırsatı Düzenle" : "Yeni Fırsat Ekle"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="product_id">Ürün</Label>
                                    <select
                                        id="product_id"
                                        name="product_id"
                                        value={formData.product_id}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Ürün Seçin</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} - {product.base_price.toLocaleString('tr-TR')} ₺
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title">Başlık</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Açıklama</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="discount_percent">İndirim Yüzdesi (%)</Label>
                                    <Input
                                        id="discount_percent"
                                        name="discount_percent"
                                        type="number"
                                        min="1"
                                        max="99"
                                        value={formData.discount_percent}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_time">Başlangıç</Label>
                                        <Input
                                            id="start_time"
                                            name="start_time"
                                            type="datetime-local"
                                            value={formData.start_time}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_time">Bitiş</Label>
                                        <Input
                                            id="end_time"
                                            name="end_time"
                                            type="datetime-local"
                                            value={formData.end_time}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        id="is_active"
                                        name="is_active"
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="is_active">Aktif</Label>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={resetForm}
                                    >
                                        İptal
                                    </Button>
                                    <Button type="submit">
                                        {editingDeal ? "Güncelle" : "Ekle"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mevcut Fırsatlar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-4">Yükleniyor...</div>
                            ) : flashDeals.length === 0 ? (
                                <div className="text-center py-4">Henüz fırsat eklenmemiş</div>
                            ) : (
                                <div className="space-y-4">
                                    {flashDeals.map(deal => (
                                        <div
                                            key={deal.id}
                                            className={`border rounded-lg p-4 hover:bg-gray-50 ${deal.status === 'expired' ? 'border-red-200 bg-red-50' :
                                                deal.status === 'upcoming' ? 'border-blue-200 bg-blue-50' :
                                                    'border-green-200 bg-green-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{deal.title}</h3>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${deal.status === 'expired' ? 'bg-red-100 text-red-700' :
                                                            deal.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                            {deal.status === 'expired' ? 'Süresi Dolmuş' :
                                                                deal.status === 'upcoming' ? 'Yaklaşan' : 'Aktif'}
                                                        </span>
                                                        {!deal.is_active &&
                                                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                                                                Devre Dışı
                                                            </span>
                                                        }
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Ürün: {deal.products?.name}
                                                    </p>
                                                    <p className="text-sm">
                                                        İndirim: <span className="font-bold">%{deal.discount_percent}</span>
                                                    </p>
                                                    {deal.description && (
                                                        <p className="text-sm mt-1">{deal.description}</p>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        {formatDate(deal.start_time)} - {formatDate(deal.end_time)}
                                                    </p>
                                                    <p className="text-sm mt-1">
                                                        Durum: <span className={deal.is_active ? "text-green-600" : "text-gray-500"}>
                                                            {deal.is_active ? "Aktif" : "Pasif"}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(deal)}
                                                    >
                                                        <FaEdit className="mr-1" /> Düzenle
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(deal.id)}
                                                    >
                                                        <FaTrash className="mr-1" /> Sil
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 