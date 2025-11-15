"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Zap, Timer, RefreshCw } from "lucide-react";
import { cn } from '@/lib/utils';
import { ProductCard } from "@/components/ui/product-card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";

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
    created_at?: string;
    is_featured?: boolean;
}

// Format time for display
function formatTime(totalSeconds: number) {
    if (totalSeconds <= 0) return { hours: 0, minutes: 0, seconds: 0 };

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
}

// Calculate discounted price
function calculateDiscountedPrice(basePrice: number, discountPercent: number) {
    return basePrice - (basePrice * discountPercent / 100);
}

// Timer display component with modern design
function TimerDisplay({ hours, minutes, seconds }: { hours: number, minutes: number, seconds: number }) {
    return (
        <div className="flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg text-white font-bold w-full">
            <div className="flex items-center justify-center gap-1 w-full">
                <Timer className="w-3 h-3 animate-pulse flex-shrink-0" />
                <div className="flex items-center justify-center gap-0.5 text-xs">
                    <div className="bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm min-w-[20px] text-center">
                        {hours.toString().padStart(2, '0')}
                    </div>
                    <span className="text-white/80">:</span>
                    <div className="bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm min-w-[20px] text-center">
                        {minutes.toString().padStart(2, '0')}
                    </div>
                    <span className="text-white/80">:</span>
                    <div className="bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm min-w-[20px] text-center">
                        {seconds.toString().padStart(2, '0')}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Placeholder data for initial loading state
const placeholderDeals: FlashDeal[] = [
    {
        id: 'placeholder-1',
        product_id: 'placeholder-1',
        title: 'Yükleniyor...',
        description: null,
        discount_percent: 20,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 86400000).toISOString(),
        remaining_seconds: 3600,
        product_name: 'Yükleniyor...',
        product_slug: '#',
        base_price: 100,
        sale_price: 80,
        primary_image_url: '/images/placeholder.jpg'
    },
    {
        id: 'placeholder-2',
        product_id: 'placeholder-2',
        title: 'Yükleniyor...',
        description: null,
        discount_percent: 15,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 86400000).toISOString(),
        remaining_seconds: 7200,
        product_name: 'Yükleniyor...',
        product_slug: '#',
        base_price: 150,
        sale_price: 127.5,
        primary_image_url: '/images/placeholder.jpg'
    },
    {
        id: 'placeholder-3',
        product_id: 'placeholder-3',
        title: 'Yükleniyor...',
        description: null,
        discount_percent: 25,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 86400000).toISOString(),
        remaining_seconds: 5400,
        product_name: 'Yükleniyor...',
        product_slug: '#',
        base_price: 200,
        sale_price: 150,
        primary_image_url: '/images/placeholder.jpg'
    },
    {
        id: 'placeholder-4',
        product_id: 'placeholder-4',
        title: 'Yükleniyor...',
        description: null,
        discount_percent: 30,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 86400000).toISOString(),
        remaining_seconds: 10800,
        product_name: 'Yükleniyor...',
        product_slug: '#',
        base_price: 300,
        sale_price: 210,
        primary_image_url: '/images/placeholder.jpg'
    }
];

interface FlashDealsProps {
    flashDeals?: FlashDeal[];
    isLoading?: boolean;
    title?: string;
    subtitle?: string;
    limit?: number;
}

export function FlashDeals({
    flashDeals: initialFlashDeals = [],
    isLoading: initialLoading = false,
    title = "⚡ Flaş Fırsatlar",
    subtitle = "Sınırlı süreli muhteşem indirimler",
    limit = 4,
}: FlashDealsProps) {
    // Start with placeholder data for better UX
    const [flashDeals, setFlashDeals] = useState<FlashDeal[]>(initialFlashDeals.length > 0 ? initialFlashDeals : []);
    const [isLoading, setIsLoading] = useState<boolean>(initialLoading || true);
    const [remainingTime, setRemainingTime] = useState<Record<string, number>>({});
    const dataFetchedRef = useRef<boolean>(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const retryCountRef = useRef(0);
    const { isAuthenticated, user } = useAuth();
    const lastVisibleTimeRef = useRef<number>(Date.now());
    const pathname = usePathname();
    const lastPathRef = useRef<string>(pathname);
    const [hasError, setHasError] = useState(false);
    const lastFetchTimeRef = useRef<number>(Date.now());

    // Create refs to store current state values for use in event handlers
    const flashDealsRef = useRef<FlashDeal[]>(flashDeals);
    const hasErrorRef = useRef<boolean>(hasError);

    // Update refs when state changes
    useEffect(() => {
        flashDealsRef.current = flashDeals;
    }, [flashDeals]);

    useEffect(() => {
        hasErrorRef.current = hasError;
    }, [hasError]);

    // Intersection Observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    // Update state when props change
    useEffect(() => {
        if (initialFlashDeals.length > 0) {
            setFlashDeals(initialFlashDeals);

            const timeObj: Record<string, number> = {};
            initialFlashDeals.forEach(deal => {
                timeObj[deal.id] = deal.remaining_seconds > 0 ? deal.remaining_seconds : 0;
            });
            setRemainingTime(timeObj);

            dataFetchedRef.current = true;

            // Prop'lardan gelen fırsatları da localStorage'a kaydet
            try {
                localStorage.setItem('flashDeals', JSON.stringify(initialFlashDeals));
                localStorage.setItem('flashDealsTime', Date.now().toString());
            } catch (e) {
            }
        }
        setIsLoading(initialLoading);
    }, [initialFlashDeals, initialLoading]);

    // Sayfa ilk yüklendiğinde localStorage'dan veri yükle
    useEffect(() => {
        try {
            const cachedData = localStorage.getItem('flashDeals');
            if (cachedData && flashDeals.length === 0) {
                const parsedData = JSON.parse(cachedData);
                if (parsedData.length > 0) {
                    setFlashDeals(parsedData);

                    const timeObj: Record<string, number> = {};
                    parsedData.forEach((deal: FlashDeal) => {
                        timeObj[deal.id] = deal.remaining_seconds > 0 ? deal.remaining_seconds : 0;
                    });
                    setRemainingTime(timeObj);

                    setIsLoading(false);
                }
            }
        } catch (e) {
        }
    }, []);

    // Fetch flash deals function
    const fetchFlashDeals = useCallback(async (forceRefresh = false) => {
        if (dataFetchedRef.current && !forceRefresh) return;

        // Update last fetch time at the start
        const now = Date.now();
        // Implement debouncing - skip if we fetched too recently
        if (now - lastFetchTimeRef.current < 5000) { // 5 second debounce
            return;
        }
        lastFetchTimeRef.current = now;

        // Önce localStorage'dan veri yüklemeyi deneyelim
        if (!forceRefresh) {
            try {
                const cachedData = localStorage.getItem('flashDeals');
                const cachedTime = localStorage.getItem('flashDealsTime');

                if (cachedData && cachedTime) {
                    const parsedData = JSON.parse(cachedData);
                    const timestamp = parseInt(cachedTime);
                    const now = Date.now();

                    // 2 dakikadan daha yeni önbellek varsa kullan (1 dakikadan 2 dakikaya çıkarıldı)
                    if (now - timestamp < 120 * 1000 && parsedData.length > 0) {
                        setFlashDeals(parsedData);

                        const timeObj: Record<string, number> = {};
                        parsedData.forEach((deal: FlashDeal) => {
                            // Kalan süreyi güncelle (önbellekten beri geçen süreyi çıkar)
                            const secondsPassed = Math.floor((now - timestamp) / 1000);
                            timeObj[deal.id] = Math.max(0, deal.remaining_seconds - secondsPassed);
                        });
                        setRemainingTime(timeObj);

                        setIsLoading(false);
                        dataFetchedRef.current = true;
                        return;
                    }
                }
            } catch (e) {
                // localStorage hatası olsa bile devam et
            }
        }

        setIsLoading(true);
        setHasError(false);

        try {
            // For homepage, we only want active deals that haven't expired
            const url = "/api/flash-deals";
            // No need to include_all parameter for homepage - we want active deals only

            // Add cache strategy with stale-while-revalidate approach
            const response = await fetch(url, {
                next: { revalidate: 60 }, // Revalidate every 60 seconds
                cache: forceRefresh ? 'no-store' : 'default',
                headers: {
                    'Cache-Control': forceRefresh ? 'no-cache' : 'max-age=60'
                }
            });

            if (!response.ok) throw new Error(`Failed to fetch flash deals: ${response.statusText}`);

            const result = await response.json();

            if (result.data && result.data.length > 0) {

                // For homepage, filter to only show active deals that haven't expired
                const activeDeals = result.data.filter((deal: FlashDeal) =>
                    deal.is_active &&
                    (deal.status === 'active' || !deal.status) // Include deals without status for backward compatibility
                );

                setFlashDeals(activeDeals);

                const timeObj: Record<string, number> = {};
                activeDeals.forEach((deal: FlashDeal) => {
                    timeObj[deal.id] = deal.remaining_seconds > 0 ? deal.remaining_seconds : 0;
                });
                setRemainingTime(timeObj);
                dataFetchedRef.current = true;
                retryCountRef.current = 0;
                setHasError(false);

                // Veriyi localStorage'a kaydet
                try {
                    localStorage.setItem('flashDeals', JSON.stringify(activeDeals));
                    localStorage.setItem('flashDealsTime', now.toString());
                } catch (e) {
                    // localStorage hatası olsa bile devam et
                }
            } else {
                setFlashDeals([]); // No deals found
                dataFetchedRef.current = true; // Mark as fetched to prevent retries
            }
        } catch (error) {
            setHasError(true);

            // Hata durumunda önbelleği kontrol et
            try {
                const cachedData = localStorage.getItem('flashDeals');
                if (cachedData) {
                    const parsedData = JSON.parse(cachedData);
                    if (parsedData.length > 0) {
                        setFlashDeals(parsedData);

                        const timeObj: Record<string, number> = {};
                        parsedData.forEach((deal: FlashDeal) => {
                            // Update remaining time based on end_time
                            const endTime = new Date(deal.end_time).getTime();
                            const now = Date.now();
                            const remainingMs = Math.max(0, endTime - now);
                            timeObj[deal.id] = Math.floor(remainingMs / 1000);
                        });
                        setRemainingTime(timeObj);

                        dataFetchedRef.current = true;
                        setHasError(false);
                        return;
                    }
                }
            } catch (e) {
            }

            // If we have no data at all, show placeholders
            if (flashDeals.length === 0) {
                setFlashDeals(placeholderDeals.slice(0, limit));
            }
            // Otherwise keep showing the existing data

            // Retry logic with longer intervals
            if (retryCountRef.current < 2) { // Reduce from 3 to 2 retries
                retryCountRef.current += 1;
                setTimeout(() => fetchFlashDeals(true), 5000 * retryCountRef.current); // Increased from 2s to 5s
            } else {
                dataFetchedRef.current = true; // Stop retrying after 2 attempts
            }

        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    // Initial fetch when component is mounted
    useEffect(() => {
        if (!dataFetchedRef.current) {
            fetchFlashDeals();
        }
    }, [fetchFlashDeals]);

    // Re-fetch when auth state changes
    useEffect(() => {
        if (isAuthenticated && user) {
            // Add debounce to prevent multiple refreshes in quick succession
            const now = Date.now();
            if (now - lastFetchTimeRef.current > 10000) { // Only refresh if last fetch was > 10 seconds ago
                fetchFlashDeals(true);
            }
        }
    }, [isAuthenticated, user, fetchFlashDeals]);

    // Monitor URL path changes
    useEffect(() => {
        if (pathname !== lastPathRef.current) {
            lastPathRef.current = pathname;

            // If we navigated to the homepage, refresh the data
            if (pathname === '/') {
                // Add debounce to prevent multiple refreshes in quick succession
                const now = Date.now();
                if (now - lastFetchTimeRef.current > 10000) { // Only refresh if last fetch was > 10 seconds ago
                    fetchFlashDeals(true);
                }
            }
        }
    }, [pathname, fetchFlashDeals]);

    // Countdown timer
    useEffect(() => {
        if (flashDeals.length === 0) return;

        const timer = setInterval(() => {
            setRemainingTime(prev => {
                const updated = { ...prev };
                let hasActive = false;

                Object.keys(updated).forEach(id => {
                    if (updated[id] > 0) {
                        updated[id] -= 1;
                        hasActive = true;
                    } else {
                        updated[id] = 0; // Ensure it doesn't go below zero
                    }
                });

                if (!hasActive) {
                    clearInterval(timer);
                }
                return updated;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [flashDeals]); // Rerunning when flashDeals change

    // Sayfa görünürlüğünü izle (sekme değişikliklerini algılamak için)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                const timeSinceLastVisible = now - lastVisibleTimeRef.current;
                lastVisibleTimeRef.current = now;

                // Sayfa görünür olduğunda verileri yeniden yükle

                // Reduce refresh frequency by only refreshing after longer periods
                // Placeholder ürünler varsa veya son görünürlükten bu yana 2 dakikadan fazla zaman geçtiyse yenile
                if ((flashDealsRef.current.length === 0 ||
                    (flashDealsRef.current.length > 0 && flashDealsRef.current[0]?.id?.startsWith('placeholder-')) ||
                    timeSinceLastVisible > 120000 || // Increase from 30s to 120s (2 min)
                    hasErrorRef.current) &&
                    now - lastFetchTimeRef.current > 10000) { // Add debounce
                    fetchFlashDeals(true);
                } else {
                    // Önbellekten yükle ve süreleri güncelle
                    try {
                        const cachedData = localStorage.getItem('flashDeals');
                        const cachedTime = localStorage.getItem('flashDealsTime');

                        if (cachedData && cachedTime) {
                            const parsedData = JSON.parse(cachedData);
                            const timestamp = parseInt(cachedTime);
                            const now = Date.now();

                            // Increase cache lifetime from 2 to 5 minutes
                            // Önbellek 5 dakikadan eski değilse kullan
                            if (now - timestamp < 5 * 60 * 1000 && parsedData.length > 0) {
                                setFlashDeals(parsedData);

                                // Kalan süreleri güncelle
                                const timeObj: Record<string, number> = {};
                                parsedData.forEach((deal: FlashDeal) => {
                                    // Şu anki zamandan son tarih çıkarılarak kalan süre hesaplanır
                                    const endTime = new Date(deal.end_time).getTime();
                                    const now = Date.now();
                                    const remainingMs = Math.max(0, endTime - now);
                                    timeObj[deal.id] = Math.floor(remainingMs / 1000);
                                });
                                setRemainingTime(timeObj);
                                dataFetchedRef.current = true;
                            } else {
                                // Only refresh if our debounce period has passed
                                if (now - lastFetchTimeRef.current > 10000) {
                                    // Önbellek eski ise yenile
                                    fetchFlashDeals(true);
                                } else {
                                }
                            }
                        }
                    } catch (e) {
                        const now = Date.now();
                        if (now - lastFetchTimeRef.current > 10000) {
                            fetchFlashDeals(true);
                        }
                    }
                }
            } else {
                // Sayfa görünmez olduğunda son görünür zamanı kaydet
                lastVisibleTimeRef.current = Date.now();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchFlashDeals]);

    return (
        <section
            id="flash-deals"
            ref={sectionRef}
            className={cn(
                "py-12 md:py-16 relative transition-all duration-1000",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
        >
            {/* Minimal background */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-50/30 to-white"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section header - Daha minimal */}
                <div className="text-center mb-12 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full mb-2">
                        <Zap className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">Sınırlı Süre</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        <span className="text-red-600">
                            {title}
                        </span>
                    </h2>

                    {subtitle && (
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    )}

                    <div className="mt-6">
                        <Link href="/products?flash_deal=true">
                            <Button
                                className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded-lg font-medium group"
                            >
                                Tüm Fırsatları Gör
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Flash deals grid - Mobile optimized with horizontal scroll */}
                <div className="lg:grid lg:grid-cols-4 lg:gap-6">
                    {/* Mobile: Horizontal scrolling with 2 visible items */}
                    <div className="lg:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                        {isLoading
                            ? Array.from({ length: limit }).map((_, index) => (
                                <div
                                    key={`flash-skeleton-${index}`}
                                    className="flex-none w-[calc(50%-8px)] animate-fade-in-up snap-start"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-red-100 h-full">
                                        <div className="h-32 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-3 w-16 bg-gray-300 animate-pulse rounded-full"></div>
                                            <div className="h-5 w-3/4 bg-gray-300 animate-pulse rounded-lg"></div>
                                            <div className="h-3 w-full bg-gray-200 animate-pulse rounded"></div>
                                            <div className="flex justify-between items-center pt-2">
                                                <div className="h-6 w-20 bg-gray-300 animate-pulse rounded-lg"></div>
                                                <div className="h-8 w-8 bg-gray-300 animate-pulse rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                            : flashDeals.length > 0 ? (
                                flashDeals.slice(0, limit).map((deal, index) => {
                                    if (!deal || !deal.product_id || !deal.product_name || !deal.product_slug) {
                                        return null;
                                    }

                                    const time = formatTime(remainingTime[deal.id] || 0);

                                    return (
                                        <div
                                            key={deal.id}
                                            className="flex-none w-[calc(50%-8px)] animate-fade-in-up snap-start relative z-[1000]"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            {/* Not showing discount badge on mobile */}

                                            <ProductCard
                                                id={deal.product_id}
                                                name={deal.product_name || "Ürün Adı Yok"}
                                                slug={deal.product_slug || "#"}
                                                price={deal.base_price || 0}
                                                salePrice={calculateDiscountedPrice(deal.base_price, deal.discount_percent)}
                                                imageUrl={deal.primary_image_url || "/images/placeholder.jpg"}
                                                createdAt={deal.created_at}
                                                isFeatured={deal.is_featured || false}
                                                customFooter={
                                                    (remainingTime[deal.id] || 0) > 0 ? (
                                                        <TimerDisplay
                                                            hours={time.hours}
                                                            minutes={time.minutes}
                                                            seconds={time.seconds}
                                                        />
                                                    ) : (
                                                        <div className="text-center text-sm text-red-500 font-semibold py-2 bg-red-50 rounded-lg">
                                                            Fırsat Bitti!
                                                        </div>
                                                    )
                                                }
                                                className="h-full transform hover:-translate-y-2 transition-all duration-500"
                                            />
                                        </div>
                                    );
                                }).filter(Boolean)
                            ) : (
                                <div className="col-span-full text-center py-20">
                                    <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-xl font-semibold">Şu anda aktif fırsat bulunmamaktadır</p>
                                    <p className="text-gray-400 mt-2">Yeni fırsatları kaçırmamak için takipte kalın!</p>
                                </div>
                            )
                        }
                    </div>

                    {/* Desktop: Grid layout */}
                    <div className="hidden lg:contents">
                        {isLoading
                            ? Array.from({ length: limit }).map((_, index) => (
                                <div
                                    key={`flash-skeleton-${index}`}
                                    className="group animate-fade-in-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-red-100">
                                        <div className="h-64 md:h-72 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                                        <div className="p-6 space-y-4">
                                            <div className="h-3 w-20 bg-gray-300 animate-pulse rounded-full"></div>
                                            <div className="h-6 w-3/4 bg-gray-300 animate-pulse rounded-lg"></div>
                                            <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                                            <div className="flex justify-between items-center pt-4">
                                                <div className="h-8 w-24 bg-gray-300 animate-pulse rounded-lg"></div>
                                                <div className="h-10 w-10 bg-gray-300 animate-pulse rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                            : flashDeals.length > 0 ? (
                                flashDeals.slice(0, limit).map((deal, index) => {
                                // Veri doğrulama kontrolü ekle
                                if (!deal || !deal.product_id || !deal.product_name || !deal.product_slug) {
                                    return null; // Geçersiz verileri atla
                                }

                                const time = formatTime(remainingTime[deal.id] || 0);

                                return (
                                    <div
                                        key={deal.id}
                                        className="animate-fade-in-up relative z-[1000]"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="relative">
                                            {/* Discount badge */}
                                            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce" style={{ zIndex: 999999, position: 'absolute' }}>
                                                %{deal.discount_percent} İndirim
                                            </div>

                                            <ProductCard
                                                id={deal.product_id}
                                                name={deal.product_name || "Ürün Adı Yok"}
                                                slug={deal.product_slug || "#"}
                                                price={deal.base_price || 0}
                                                salePrice={calculateDiscountedPrice(deal.base_price, deal.discount_percent)}
                                                imageUrl={deal.primary_image_url || "/images/placeholder.jpg"}
                                                createdAt={deal.created_at}
                                                isFeatured={deal.is_featured || false}
                                                customFooter={
                                                    (remainingTime[deal.id] || 0) > 0 ? (
                                                        <TimerDisplay
                                                            hours={time.hours}
                                                            minutes={time.minutes}
                                                            seconds={time.seconds}
                                                        />
                                                    ) : (
                                                        <div className="text-center text-sm text-red-500 font-semibold py-2 bg-red-50 rounded-lg">
                                                            Fırsat Bitti!
                                                        </div>
                                                    )
                                                }
                                                className="h-full transform hover:-translate-y-2 transition-all duration-500 border-2 border-red-100 hover:border-red-200"
                                            />
                                        </div>
                                    </div>
                                );
                            }).filter(Boolean)
                        ) : (
                            <div className="col-span-full text-center py-20">
                                <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-xl font-semibold">Şu anda aktif fırsat bulunmamaktadır</p>
                                <p className="text-gray-400 mt-2">Yeni fırsatları kaçırmamak için takipte kalın!</p>
                            </div>
                        )
                    }
                    </div>
                </div>

                {/* Error state with retry */}
                {hasError && !isLoading && (
                    <div className="text-center mt-12 p-8 bg-red-50 rounded-2xl">
                        <div className="text-red-600 mb-4">
                            <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-semibold">Fırsatlar yüklenirken bir hata oluştu</p>
                        </div>
                        <Button
                            onClick={() => fetchFlashDeals(true)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Tekrar Dene
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
