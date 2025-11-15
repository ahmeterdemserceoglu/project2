"use client";

import { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { ProductCard } from '../ui/product-card';

interface Product {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    sale_price: number | null;
    primary_image_url: string;
    category_name?: string;
    rating?: string;
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
}

interface FeaturedProductsProps {
    products: Product[];
    isLoading: boolean;
    title?: string;
    subtitle?: string;
    limit?: number;
    likedProducts?: string[];
    onLikeToggle?: (id: string) => void;
}

export function FeaturedProducts({
    products = [],
    isLoading = false,
    title = "Trend Ürünler",
    subtitle = "En popüler ve özel seçilmiş ürünlerimizi keşfedin",
    limit = 4,
    likedProducts = [],
    onLikeToggle
}: FeaturedProductsProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    if (isLoading) {
        return (
            <section className="py-20 md:py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return (
            <section className="py-20 md:py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-xl text-gray-600">Öne çıkan ürün bulunamadı</p>
                </div>
            </section>
        );
    }

    return (
        <section
            id="featured-products"
            ref={sectionRef}
            className="py-12 md:py-16 relative"
        >
            {/* Minimal background */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-50/30 to-white"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section header - Daha minimal */}
                <div className="text-center mb-12 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full mb-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Öne Çıkanlar</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        <span className="text-purple-600">
                            {title}
                        </span>
                    </h2>

                    {subtitle && (
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    )}


                </div>

                {/* Products grid - Mobile optimized with horizontal scroll */}
                <div className="md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                    {/* Mobile: Horizontal scrolling with 2 visible items */}
                    <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                        {products.slice(0, limit).map((product, index) => (
                            <div
                                key={product.id}
                                className="flex-none w-[calc(50%-8px)] animate-fade-in-up relative snap-start"
                                style={{ animationDelay: `${index * 100}ms`, zIndex: 1000 }}
                            >
                                {/* Not showing discount badge on mobile */}

                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    slug={product.slug}
                                    price={product.base_price}
                                    salePrice={product.isFlashDeal && product.flashDeal ?
                                        product.base_price - (product.base_price * product.flashDeal.discountPercent / 100) :
                                        product.sale_price}
                                    imageUrl={product.primary_image_url || "/images/placeholder.jpg"}
                                    categoryName={product.category_name}
                                    rating={product.rating}
                                    isFeatured={product.is_featured}
                                    isLiked={likedProducts.includes(product.id)}
                                    onLikeToggle={onLikeToggle}
                                    className="h-full transform hover:-translate-y-2 transition-all duration-500"
                                    createdAt={product.created_at}
                                    priority={index === 0}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Grid layout */}
                    <div className="hidden md:contents">
                        {products.slice(0, limit).map((product, index) => (
                        <div
                            key={product.id}
                            className="animate-fade-in-up relative"
                            style={{ animationDelay: `${index * 100}ms`, zIndex: 1000 }}
                        >
                            {/* Flash Deal Badge - Dışarıda */}
                            {product.isFlashDeal && product.flashDeal && (
                                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce" style={{ zIndex: 999999, position: 'absolute' }}>
                                    %{product.flashDeal.discountPercent} İndirim
                                </div>
                            )}

                            <ProductCard
                                id={product.id}
                                name={product.name}
                                slug={product.slug}
                                price={product.base_price}
                                salePrice={product.isFlashDeal && product.flashDeal ?
                                    product.base_price - (product.base_price * product.flashDeal.discountPercent / 100) :
                                    product.sale_price}
                                imageUrl={product.primary_image_url || "/images/placeholder.jpg"}
                                categoryName={product.category_name}
                                rating={product.rating}
                                isFeatured={product.is_featured} // Show featured badge
                                isLiked={likedProducts.includes(product.id)}
                                onLikeToggle={onLikeToggle}
                                className="h-full transform hover:-translate-y-2 transition-all duration-500"
                                createdAt={product.created_at}
                                priority={index === 0} // Add priority for the first product (LCP)

                            />
                        </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
