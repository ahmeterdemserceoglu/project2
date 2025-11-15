"use client";

import { FaCartPlus, FaStar, FaRegHeart, FaHeart } from 'react-icons/fa';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/contexts/ToastContext';
import { SimplifiedImage } from '@/components/ui/simplified-image';
import React from 'react';

export interface FlashDealInfo {
    id: string;
    title: string;
    description?: string;
    discountPercent: number;
    startTime: string;
    endTime: string;
    remainingSeconds: number;
}

export interface ProductCardProps {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    imageUrl: string;
    categoryName?: string;
    rating?: string;
    isFeatured?: boolean;
    isLiked?: boolean;
    onLikeToggle?: (id: string) => void;
    className?: string;
    customBadge?: React.ReactNode;
    customFooter?: React.ReactNode;
    createdAt?: string;
    priority?: boolean;
    stock?: number;
    isFlashDeal?: boolean;
    flashDeal?: FlashDealInfo;
}

// Add a helper function to safely format prices
function formatPrice(price: number | null | undefined) {
    if (price === null || price === undefined) return "0.00";
    return price.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}



export const ProductCard = React.memo(function ProductCard({
    id,
    name,
    slug,
    price,
    salePrice,
    imageUrl,
    categoryName = "",
    rating = "4.5",
    isFeatured = false,
    isLiked = false,
    onLikeToggle,
    className,
    customBadge,
    customFooter,
    priority = false,
    createdAt,
    stock
}: ProductCardProps) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const { addItem } = useCartStore();
    const { showToast } = useToast();

    const isOutOfStock = typeof stock === 'number' ? stock <= 0 : false;

    const handleAddToCart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;

        setIsAddingToCart(true);

        addItem({
            productId: id,
            name: name,
            price: salePrice || price,
            image: imageUrl,
            quantity: 1,
        });

        showToast(`${name} sepete eklendi`, "success");

        // Animation effect
        setTimeout(() => {
            setIsAddingToCart(false);
        }, 1000);
    }, [id, name, price, salePrice, imageUrl, addItem, showToast, isOutOfStock]);

    const handleToggleLike = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onLikeToggle?.(id);
    }, [id, onLikeToggle]);

    return (
        <div className={cn(
            "product-card group h-full flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300",
            className
        )}>
            <Link href={`/products/${slug}`} className="flex flex-col h-full">
                {/* Ürün Resmi - Responsive height */}
                <div className="product-image-container relative w-full h-32 sm:h-48 md:h-56 lg:h-64 overflow-hidden">
                    <SimplifiedImage
                        src={imageUrl}
                        alt={name}
                        fill
                        className="product-image object-cover w-full h-full"
                        fallbackSrc="/images/placeholder.png"
                        priority={priority}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {/* Rozetler ve Beğeni Butonu */}
                    {customBadge ? (
                        customBadge
                    ) : (
                        <>
                            {/* Rozetler (Sol Üst) - Flash deal için boş */}
                            <div className="absolute top-1 left-3 z-10 flex flex-col items-start gap-1.5">
                                {/* Featured Badge */}
                                {isFeatured && (
                                    <div className="featured-badge-container w-24 h-24 pointer-events-auto">
                                        <img
                                            src="/images/badges/onecikan.png"
                                            alt="Öne Çıkan Ürün"
                                            width={64}
                                            height={64}
                                            className="featured-badge-icon object-contain w-full h-full"
                                            style={{
                                                background: 'transparent',
                                                backgroundColor: 'transparent',
                                                borderRadius: '0',
                                                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
                                                mixBlendMode: 'normal',
                                                objectFit: 'contain'
                                            }}
                                            loading="lazy"
                                        />
                                    </div>
                                )}


                            </div>

                            {/* Beğeni Butonu (Sağ Üst) */}
                            {onLikeToggle && (
                                <button
                                    onClick={handleToggleLike}
                                    className="absolute top-3 right-3 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-all z-20"
                                    aria-label={isLiked ? "Favorilerden çıkar" : "Favorilere ekle"}
                                >
                                    {isLiked ? (
                                        <FaHeart className="text-red-500 text-xl" />
                                    ) : (
                                        <FaRegHeart className="text-gray-700 text-xl" />
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Ürün Bilgileri */}
                <div className="p-4 flex-1 flex flex-col">
                    {/* Kategori */}
                    {categoryName && (
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{categoryName}</p>
                    )}

                    {/* Ürün Adı */}
                    <h3 className="font-medium text-lg mb-1 line-clamp-2 min-h-[3rem]">{name}</h3>

                    {/* Yıldızlar */}
                    <div className="flex items-center mb-2">
                        <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((starIndex) => (
                                <FaStar
                                    key={`star-${id}-${starIndex}`}
                                    className={cn(
                                        "text-sm",
                                        starIndex <= Math.floor(Number(rating)) ? "text-amber-400" : "text-gray-300"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground ml-1">{rating}</span>
                    </div>

                    {/* Fiyat */}
                    <div className="flex items-end gap-2 mt-auto">
                        {salePrice ? (
                            <>
                                <span className="text-xl font-bold">{formatPrice(salePrice)} ₺</span>
                                <span className="text-sm text-muted-foreground line-through">{formatPrice(price)} ₺</span>
                            </>
                        ) : (
                            <span className="text-xl font-bold">{formatPrice(price)} ₺</span>
                        )}
                    </div>

                    {/* Özel Footer */}
                    {customFooter && (
                        <div className="mt-2">{customFooter}</div>
                    )}
                </div>
            </Link>

            {/* Sepete Ekle Butonu */}
            {!customFooter && (
                <div className="p-4 pt-0 mt-auto">
                    <Button
                        onClick={handleAddToCart}
                        className={cn(
                            "w-full py-2 transition-all flex items-center justify-center gap-2",
                            isAddingToCart && "bg-green-600 hover:bg-green-700"
                        )}
                        disabled={isAddingToCart || isOutOfStock}
                    >
                        <FaCartPlus className="text-base" />
                        <span>{isOutOfStock ? "Tükendi" : isAddingToCart ? "Eklendi!" : "Sepete Ekle"}</span>
                    </Button>
                </div>
            )}
        </div>
    );
});