"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import AddToCartButton from "@/components/products/AddToCartButton";
import ProductGrid from "@/components/products/ProductGrid";
import { StructuredData } from "@/components/seo/StructuredData";
import { Heart, Share2, ShoppingCart, Package, Truck, Shield, RotateCcw } from "lucide-react";

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    base_price: number;
    sale_price: number | null;
    stock_quantity: number;
    primary_image_url: string | null;
    category_name?: string;
    category_id?: string;
    is_flash_deal?: boolean;
    flash_deal_info?: {
        id: string;
        title: string;
        description?: string;
        discountPercent: number;
        startTime: string;
        endTime: string;
        remainingSeconds: number;
    } | null;
    images: Array<{
        id: string;
        image_url: string;
        alt_text: string | null;
        is_primary: boolean | null;
    }>;
    variants: Array<{
        id: string;
        price: number;
        stock: number;
    }>;
    price: number;
    stock: number;
}

interface ProductClientProps {
    slug: string;
    initialProduct: Product;
}

async function getRelatedProducts(categoryId?: string, productId?: string) {
    if (!categoryId || !productId) return [];
    
    try {
        const response = await fetch(`/api/products?category=${categoryId}&exclude=${productId}&limit=4`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.products || [];
    } catch (error) {
        return [];
    }
}

export default function ProductClient({ slug, initialProduct }: ProductClientProps) {
    const [product, setProduct] = useState<Product>(initialProduct);
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(
        product.images.find(img => img.is_primary)?.image_url ||
        product.images[0]?.image_url ||
        product.primary_image_url
    );
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(!initialProduct);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setProduct(initialProduct);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [initialProduct]);

    useEffect(() => {
        async function loadProductData() {
            try {
                if (!product) {
                    setLoading(true);
                    return;
                }

                const related = await getRelatedProducts(product.category_id, product.id);
                setRelatedProducts(related);
            } catch (error) {
                console.error('Error loading product data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadProductData();
    }, [product]);

    if (loading) {
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="aspect-square bg-gray-200 rounded-xl"></div>
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/4 mt-4"></div>
                            <div className="h-24 bg-gray-200 rounded mt-8"></div>
                            <div className="h-10 bg-gray-200 rounded w-1/3 mt-6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return null;
    }

    const isInStock = product.stock_quantity > 0;
    
    const breadcrumbs = [
        { name: 'Ana Sayfa', url: '/' },
        { name: '3D Baskı Ürünleri', url: '/products' },
        ...(product.category_name ? [{ name: product.category_name, url: `/categories/${product.category_id}` }] : []),
        { name: product.name, url: `/products/${product.slug}` }
    ];

    return (
        <React.Fragment>
            <StructuredData type="product" product={product} />
            <StructuredData type="breadcrumb" breadcrumbs={breadcrumbs} />
            
            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <div className="bg-white border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="text-sm flex items-center text-gray-500 overflow-x-auto whitespace-nowrap">
                            <Link href="/" className="hover:text-blue-600 transition-colors">
                                Ana Sayfa
                            </Link>
                            <span className="mx-2">/</span>
                            <Link href="/products" className="hover:text-blue-600 transition-colors">
                                3D Baskı Ürünleri
                            </Link>
                            {product.category_name && (
                                <React.Fragment>
                                    <span className="mx-2">/</span>
                                    <Link
                                        href={`/categories/${product.category_id}`}
                                        className="hover:text-blue-600 transition-colors"
                                    >
                                        {product.category_name}
                                    </Link>
                                </React.Fragment>
                            )}
                            <span className="mx-2">/</span>
                            <span className="text-blue-600 font-medium truncate">
                                {product.name}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                        {/* Ürün Görselleri */}
                        <div className="space-y-6">
                            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="aspect-square relative">
                                    <Image
                                        src={selectedImage || "/placeholder.png"}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-8"
                                        priority
                                    />
                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {product.is_flash_deal && (
                                            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse">
                                                ⚡ Flaş Fırsat
                                            </Badge>
                                        )}
                                        {product.sale_price && (
                                            <Badge className="bg-red-100 text-red-600">
                                                %{Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)} İndirim
                                            </Badge>
                                        )}
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                                        <button
                                            onClick={() => setIsLiked(!isLiked)}
                                            className={`p-3 rounded-full shadow-lg transition-all ${
                                                isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                        </button>
                                        <button className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:bg-gray-50 transition-all">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Küçük Resimler */}
                            {product.images.length > 1 && (
                                <div className="flex space-x-3 overflow-x-auto pb-2">
                                    {product.images.map((image) => (
                                        <div
                                            key={image.id}
                                            className={`relative w-20 h-20 border-2 rounded-lg cursor-pointer transition-all ${
                                                selectedImage === image.image_url
                                                    ? "border-blue-500 shadow-md"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            onClick={() => setSelectedImage(image.image_url)}
                                        >
                                            <Image
                                                src={image.image_url}
                                                alt={image.alt_text || product.name}
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ürün Bilgileri */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                {/* Kategori ve Başlık */}
                                <div className="mb-6">
                                    {product.category_name && (
                                        <Badge variant="outline" className="mb-3">
                                            {product.category_name}
                                        </Badge>
                                    )}
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                                </div>

                                {/* Fiyat */}
                                <div className="mb-8">
                                    {product.sale_price ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-4">
                                                <span className="text-4xl font-bold text-red-600">
                                                    {product.sale_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                                </span>
                                                <span className="text-xl text-gray-400 line-through">
                                                    {product.base_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                                </span>
                                            </div>
                                            <p className="text-green-600 font-medium">
                                                {(product.base_price - product.sale_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ tasarruf ediyorsunuz!
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-4xl font-bold text-gray-900">
                                            {product.base_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                        </span>
                                    )}
                                </div>

                                {/* Stok Durumu */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Package className="w-5 h-5 text-gray-600" />
                                        <span className="text-gray-700">Stokda</span>
                                        <span className={`font-semibold ${isInStock ? "text-green-600" : "text-red-600"}`}>
                                            {isInStock ? `(${product.stock_quantity} adet)` : "Stokta Yok"}
                                        </span>
                                    </div>

                                    {isInStock && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <p className="text-green-800 text-sm">✓ Hemen kargoya hazır</p>
                                        </div>
                                    )}
                                </div>

                                {/* Miktar Seçici ve Sepete Ekle */}
                                {isInStock && (
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-700 font-medium">Miktar:</span>
                                            <div className="flex items-center border border-gray-300 rounded-lg">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="px-4 py-2 font-medium">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <AddToCartButton
                                            product={{
                                                id: product.id,
                                                name: product.name,
                                                price: product.sale_price || product.base_price,
                                                image: product.primary_image_url || product.images[0]?.image_url || ""
                                            }}
                                        />
                                    </div>
                                )}

                                {!isInStock && (
                                    <button
                                        disabled
                                        className="w-full py-4 flex items-center justify-center text-white bg-gray-400 rounded-xl cursor-not-allowed text-lg font-medium"
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Stokta Yok
                                    </button>
                                )}

                                {/* Güvenlik Bilgileri */}
                                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm text-gray-700">Ücretsiz Kargo</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-green-600" />
                                        <span className="text-sm text-gray-700">Güvenli Ödeme</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RotateCcw className="w-5 h-5 text-orange-600" />
                                        <span className="text-sm text-gray-700">14 Gün İade</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5 text-purple-600" />
                                        <span className="text-sm text-gray-700">Hızlı Teslimat</span>
                                    </div>
                                </div>
                            </div>

                            {/* Ürün Açıklaması */}
                            <Card className="p-8">
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">Ürün Açıklaması</h3>
                                <div className="prose max-w-none text-gray-700">
                                    {product.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                    ) : (
                                        <p className="text-gray-500">Bu 3D baskı ürünü için detaylı açıklama yakında eklenecektir.</p>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Benzer Ürünler */}
                    {relatedProducts && relatedProducts.length > 0 && (
                        <div className="mt-16">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    Benzer 3D Baskı Ürünleri
                                </h2>
                                <p className="text-gray-600">Bu ürünü beğenen müşteriler bunları da inceledi</p>
                            </div>
                            <ProductGrid products={relatedProducts} />
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
}