"use client";

import { useEffect, useState } from "react";
import { FlashDeals } from "@/components/homepage/flash-deals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface FlashDeal {
    id: string;
    product_id: string;
    title: string;
    description: string | null;
    discount_percent: number;
    start_time: string;
    end_time: string;
    remaining_seconds: number;
    product_name: string;
    product_slug: string;
    base_price: number;
    sale_price: number | null;
    primary_image_url: string;
    is_active?: boolean;
    status?: 'active' | 'expired' | 'upcoming';
}

export default function KampanyalarPage() {
    const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active");

    useEffect(() => {
        async function fetchFlashDeals() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/all-flash-deals?force=true`, {
                    cache: "no-store"
                });

                if (!response.ok) {
                    throw new Error(`Error fetching flash deals: ${response.statusText}`);
                }

                const data = await response.json();
                setFlashDeals(data.data || []);
            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        }

        fetchFlashDeals();
    }, []);

    // Filter deals based on active tab
    const filteredDeals = flashDeals.filter(deal => {
        if (activeTab === "active") {
            return deal.is_active && deal.status === "active";
        } else if (activeTab === "upcoming") {
            return deal.is_active && deal.status === "upcoming";
        } else if (activeTab === "expired") {
            return deal.status === "expired";
        } else if (activeTab === "all") {
            return true;
        }
        return false;
    });

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Calculate time remaining
    const getTimeRemaining = (endTimeStr: string) => {
        const endTime = new Date(endTimeStr).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { days, hours, minutes };
    };

    // Calculate discounted price
    const calculateDiscountedPrice = (basePrice: number, discountPercent: number) => {
        return basePrice - (basePrice * discountPercent / 100);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                        <span className="text-sm font-medium text-purple-700">Özel Kampanyalar</span>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        <span className="text-purple-600">Kampanyalar</span> ve Günün Fırsatları
                    </h1>
                    
                    <p className="text-base text-gray-600 max-w-2xl mx-auto">
                        Size özel hazırladığımız kampanyalarla büyük tasarruf fırsatlarını kaçırmayın
                    </p>
                </div>

                <Tabs defaultValue="active" onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
                        <TabsTrigger value="active" className="text-xs md:text-sm">
                            <span className="hidden md:inline">Aktif Fırsatlar</span>
                            <span className="md:hidden">Aktif</span>
                            <Badge variant="outline" className="ml-1 md:ml-2 bg-green-50 text-xs">
                                {flashDeals.filter(deal => deal.is_active && deal.status === "active").length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="upcoming" className="text-xs md:text-sm">
                            <span className="hidden md:inline">Yaklaşan Fırsatlar</span>
                            <span className="md:hidden">Yakında</span>
                            <Badge variant="outline" className="ml-1 md:ml-2 bg-blue-50 text-xs">
                                {flashDeals.filter(deal => deal.is_active && deal.status === "upcoming").length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="expired" className="text-xs md:text-sm">
                            <span className="hidden md:inline">Süresi Bitenler</span>
                            <span className="md:hidden">Biten</span>
                            <Badge variant="outline" className="ml-1 md:ml-2 bg-red-50 text-xs">
                                {flashDeals.filter(deal => deal.status === "expired").length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="all" className="text-xs md:text-sm">
                            Tümü
                            <Badge variant="outline" className="ml-1 md:ml-2 text-xs">
                                {flashDeals.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="mt-6">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Devam Eden Fırsatlar</h2>
                        <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">Şu anda aktif olan ve alışveriş yapabileceğiniz fırsatlar.</p>
                    </TabsContent>

                    <TabsContent value="upcoming" className="mt-6">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Yaklaşan Fırsatlar</h2>
                        <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">Yakında başlayacak olan fırsatlar. Bu ürünleri şimdiden listenize ekleyebilirsiniz.</p>
                    </TabsContent>

                    <TabsContent value="expired" className="mt-6">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Süresi Biten Fırsatlar</h2>
                        <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">Kaçırdığınız fırsatlar. Yeni fırsatlar için sayfamızı takip etmeye devam edin.</p>
                    </TabsContent>

                    <TabsContent value="all" className="mt-6">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Tüm Fırsatlar</h2>
                        <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">Tüm fırsatlarımızı görebilirsiniz.</p>
                    </TabsContent>
                </Tabs>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="h-32 sm:h-40 bg-gray-200"></CardHeader>
                                <CardContent className="py-3 md:py-4">
                                    <div className="h-5 md:h-6 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4 mb-3 md:mb-4"></div>
                                    <div className="h-3 md:h-4 bg-gray-200 rounded w-1/2"></div>
                                </CardContent>
                                <CardFooter className="bg-gray-100 h-10 md:h-12"></CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : filteredDeals.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredDeals.map(deal => {
                            const timeRemaining = getTimeRemaining(deal.end_time);
                            const discountedPrice = calculateDiscountedPrice(deal.base_price, deal.discount_percent);

                            return (
                                <Card
                                    key={deal.id}
                                    className={`overflow-hidden transition-all hover:shadow-md transform hover:-translate-y-1 ${deal.status === 'expired' ? 'border-red-200' :
                                        deal.status === 'upcoming' ? 'border-blue-200' :
                                            'border-green-200'
                                        }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={deal.primary_image_url || "/images/placeholder.jpg"}
                                            alt={deal.product_name}
                                            className="w-full h-32 sm:h-48 object-cover"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <Badge className={`text-xs ${
                                                deal.status === 'expired' ? 'bg-red-100 text-red-800' :
                                                deal.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                                <span className="hidden sm:inline">
                                                    {deal.status === 'expired' ? 'Süresi Doldu' :
                                                     deal.status === 'upcoming' ? 'Yakında Başlayacak' :
                                                     'Aktif'}
                                                </span>
                                                <span className="sm:hidden">
                                                    {deal.status === 'expired' ? 'Doldu' :
                                                     deal.status === 'upcoming' ? 'Yakında' :
                                                     'Aktif'}
                                                </span>
                                            </Badge>
                                        </div>
                                        <div className="absolute top-2 left-2">
                                            <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold">
                                                %{deal.discount_percent}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardHeader className="pb-2 md:pb-4">
                                        <CardTitle className="line-clamp-2 text-base md:text-lg">{deal.title || deal.product_name}</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-2 md:space-y-3 pt-0">
                                        {deal.description && (
                                            <p className="text-gray-600 text-xs md:text-sm line-clamp-2">{deal.description}</p>
                                        )}

                                        <div className="flex justify-between items-center">
                                            <div className="text-base md:text-lg font-semibold">
                                                {discountedPrice.toLocaleString('tr-TR')} ₺
                                                <span className="text-xs md:text-sm text-gray-500 line-through ml-1 md:ml-2">
                                                    {deal.base_price.toLocaleString('tr-TR')} ₺
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-xs md:text-sm text-gray-500 space-y-1">
                                            <p className="hidden md:block">Başlangıç: {formatDate(deal.start_time)}</p>
                                            <p className="hidden md:block">Bitiş: {formatDate(deal.end_time)}</p>
                                            <p className="md:hidden">Bitiş: {new Date(deal.end_time).toLocaleDateString('tr-TR')}</p>
                                        </div>

                                        {deal.status === 'active' && (
                                            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-2 md:p-3 rounded-lg text-center border border-red-100">
                                                <p className="text-xs md:text-sm font-medium text-red-700">Kalan Süre:</p>
                                                <p className="font-mono text-sm md:text-base font-bold text-red-600">
                                                    {timeRemaining.days > 0 ? `${timeRemaining.days}g ` : ''}
                                                    {String(timeRemaining.hours).padStart(2, '0')}:
                                                    {String(timeRemaining.minutes).padStart(2, '0')}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="border-t pt-3 md:pt-4">
                                        <Link href={`/products/${deal.product_slug}`} className="w-full">
                                            <Button className={`w-full text-sm md:text-base py-2 md:py-3 ${
                                                deal.status === 'active' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' :
                                                deal.status === 'upcoming' ? 'bg-blue-600 hover:bg-blue-700' :
                                                    'bg-gray-600 hover:bg-gray-700'
                                            }`}>
                                                {deal.status === 'expired' ? 'Ürüne Git' :
                                                 deal.status === 'upcoming' ? 'Ürünü İncele' :
                                                 'Hemen Al'}
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 md:py-16">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🎯</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-medium text-gray-700 mb-2">Bu kategoride fırsat bulunamadı</h3>
                        <p className="text-gray-600 mb-6 text-sm md:text-base px-4">Lütfen daha sonra tekrar kontrol ediniz veya diğer kategorilere göz atınız.</p>
                        <Button asChild className="bg-purple-600 hover:bg-purple-700">
                            <Link href="/">Ana Sayfaya Dön</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}