"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import { HeroSection } from "@/components/homepage/hero-section";
import { FeatureSection } from "@/components/homepage/feature-section";
import { FeaturedProducts } from "@/components/homepage/featured-products";
import { FlashDeals } from "@/components/homepage/flash-deals";
import { SpecialCollections } from "@/components/homepage/special-collections";
import { StructuredData } from "@/components/seo/StructuredData";

import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/contexts/ToastContext";

export type Product = {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    sale_price: number | null;
    primary_image_url: string;
    category_name?: string;
    is_featured: boolean;
    created_at?: string;
    isFlashDeal?: boolean;
    flashDeal?: {
        id: string;
        title: string;
        description?: string;
        discountPercent: number;
        startTime: string;
        endTime: string;
        remainingSeconds: number;
    };
};

interface SupabaseProduct {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    sale_price: number | null;
    primary_image_url: string;
    is_featured: boolean;
    categories: {
        name: string;
    };
}

export interface Collection {
    id: string;
    title: string;
    description: string;
    slug: string;
    image_url: string;
    badge?: string;
    badge_color?: string;
    icon_name?: string;
}

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [specialCollections, setSpecialCollections] = useState<Collection[]>([]);
    const [flashDeals, setFlashDeals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFlashDealsLoading, setIsFlashDealsLoading] = useState(true);
    const [likedProducts, setLikedProducts] = useState<string[]>([]);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const supabase = createClient();
                if (!supabase) return;

                // Fetch featured products with flash deals integration
                const featuredResponse = await fetch("/api/featured-products-with-flash-deals");
                if (featuredResponse.ok) {
                    const featuredResult = await featuredResponse.json();
                    setFeaturedProducts(featuredResult.data || []);
                } else {
                    // Fallback to old method if new API fails
                    const { data: products, error: productsError } = await supabase
                        .from("products")
                        .select(`
                            id, 
                            name, 
                            slug, 
                            base_price, 
                            sale_price, 
                            primary_image_url,
                            categories!inner(name),
                            is_featured
                        `)
                        .eq("is_featured", true)
                        .eq("is_active", true)
                        .limit(8);

                    if (productsError) throw productsError;

                    const formattedProducts = (products as any[])?.map((product: any) => ({
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        base_price: product.base_price,
                        sale_price: product.sale_price,
                        primary_image_url: product.primary_image_url,
                        is_featured: product.is_featured,
                        category_name: product.categories?.name || ""
                    })) || [];
                    setFeaturedProducts(formattedProducts);
                }

                // Fetch special collections
                try {
                    const collectionsResponse = await fetch("/api/special-collections");
                    if (collectionsResponse.ok) {
                        const collections = await collectionsResponse.json();
                        setSpecialCollections(collections || []);
                    } else {
                        setSpecialCollections([]);
                    }
                } catch (collectionsErr) {
                    console.error('Error fetching special collections:', collectionsErr);
                    setSpecialCollections([]);
                }

            } catch (error) {
                showToast("Veriler yüklenirken bir hata oluştu", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Flash deals'i ayrı olarak fetch et
    useEffect(() => {
        const fetchFlashDeals = async () => {
            setIsFlashDealsLoading(true);
            try {
                const response = await fetch("/api/flash-deals");
                if (response.ok) {
                    const result = await response.json();
                    const activeDeals = result.data?.filter((deal: any) =>
                        deal.is_active &&
                        (deal.status === 'active' || !deal.status)
                    ) || [];
                    setFlashDeals(activeDeals);
                }
            } catch (error) {
                setFlashDeals([]);
            } finally {
                setIsFlashDealsLoading(false);
            }
        };

        fetchFlashDeals();
    }, []);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("likedProducts");
            if (saved) {
                setLikedProducts(JSON.parse(saved));
            }
        } catch (error) {
        }
    }, []);

    const handleToggleLike = (productId: string) => {
        setLikedProducts(prev => {
            const newLiked = prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId];

            showToast(
                newLiked.includes(productId) ? "Ürün favorilere eklendi" : "Ürün favorilerden çıkarıldı",
                newLiked.includes(productId) ? "success" : "info"
            );

            try {
                localStorage.setItem("likedProducts", JSON.stringify(newLiked));
            } catch (error) {
            }

            return newLiked;
        });
    };

    return (
        <>
            <StructuredData type="website" />
            <StructuredData type="organization" />
            <main className="bg-white min-h-screen">
                <HeroSection />
                {/* Flash Deals sadece ürün varsa göster */}
                {(isFlashDealsLoading || flashDeals.length > 0) && (
                    <FlashDeals
                        flashDeals={flashDeals}
                        isLoading={isFlashDealsLoading}
                    />
                )}
                <FeaturedProducts
                    products={featuredProducts}
                    isLoading={isLoading}
                    title="Öne Çıkan 3D Baskı Ürünleri"
                    subtitle="En kaliteli filamentler, 3D yazıcılar ve baskı malzemelerini keşfedin"
                    likedProducts={likedProducts}
                    onLikeToggle={handleToggleLike}
                    limit={4}
                />
                <SpecialCollections collections={specialCollections} isLoading={isLoading} />
                <FeatureSection />
                
                {/* SEO Content Section (Refined) */}
                <section className="relative py-16 md:py-24">
                    {/* decorative background */}
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
                        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
                    </div>
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
                            {/* Text + Lists */}
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                                    3D Baskı Malzemeleri ve Profesyonel 3D Printing Çözümleri
                                </h2>
                                <p className="text-muted-foreground mt-3">
                                    Projelerinize uygun malzemeleri ve ekipmanları tek çatı altında, güvenli ve hızlı şekilde edinin.
                                </p>

                                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                                    <div className="rounded-2xl bg-white/80 backdrop-blur p-5 ring-1 ring-black/5 shadow-[0_8px_30px_rgb(2,8,23,0.06)]">
                                        <h3 className="text-base font-semibold mb-3">3D Baskı Filamentleri</h3>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-start gap-2"><FaCheckCircle className="text-primary mt-0.5" /><span>PLA — Kolay baskı, yüksek yüzey kalitesi</span></li>
                                            <li className="flex items-start gap-2"><FaCheckCircle className="text-primary mt-0.5" /><span>ABS — Dayanıklı, işlenebilir</span></li>
                                            <li className="flex items-start gap-2"><FaCheckCircle className="text-primary mt-0.5" /><span>PETG — Şeffaflık ve kimyasal dayanım</span></li>
                                            <li className="flex items-start gap-2"><FaCheckCircle className="text-primary mt-0.5" /><span>TPU — Esnek ve darbe emici</span></li>
                                            <li className="flex items-start gap-2"><FaCheckCircle className="text-primary mt-0.5" /><span>Wood/Metal Fill — Özel efektli malzemeler</span></li>
                                        </ul>
                                    </div>
                                    <div className="rounded-2xl bg-white/80 backdrop-blur p-5 ring-1 ring-black/5 shadow-[0_8px_30px_rgb(2,8,23,0.06)]">
                                        <h3 className="text-base font-semibold mb-3">3D Yazıcılar ve Ekipmanlar</h3>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-start gap-2"><FaCheckCircle className="text-primary mt-0.5" /><span>FDM ve Resin 3D Yazıcılar</span></li>
                                            <li className="flex items-start gap-2"><FaCheckCircle className="text-primary mt-0.5" /><span>Nozzle, tabla, yükseltme kitleri</span></li>
                                            <li className="flex items-start gap-2"><FaCheckCircle className="text-primary mt-0.5" /><span>Reçine ve temizleme/bakım ürünleri</span></li>
                                            <li className="flex items-start gap-2"><FaCheckCircle className="text-primary mt-0.5" /><span>Kalibrasyon ve sarf malzemeleri</span></li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-8 rounded-2xl bg-gradient-to-r from-primary/5 to-cyan-500/5 p-5 ring-1 ring-primary/10">
                                    <p className="text-sm text-muted-foreground">
                                        Güvenli ödeme, hızlı teslimat ve uzman destekle 3D printing sürecinizin her adımında yanınızdayız.
                                    </p>
                                </div>
                            </div>

                            {/* Visual */}
                            <div className="relative">
                                <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 via-cyan-400/10 to-transparent blur-2xl" />
                                <div className="overflow-hidden rounded-3xl ring-1 ring-black/5 shadow-[0_20px_60px_rgba(2,8,23,0.15)] bg-white">
                                    <Image
                                        src="/images/register-image.png"
                                        alt="3D Printing Illustration"
                                        width={1200}
                                        height={900}
                                        className="w-full h-auto object-cover"
                                        sizes="(min-width: 1024px) 540px, 100vw"
                                        priority={false}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}