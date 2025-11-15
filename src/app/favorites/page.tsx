'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClientComponentClient } from '@/lib/supabase';
import { ProductCard } from '@/components/ui/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaHeart, FaTrash } from 'react-icons/fa';

interface Category {
    name: string;
}

interface ProductFromDB {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    sale_price: number | null;
    primary_image_url: string;
    categories: Category | null;
    is_featured: boolean;
    created_at: string;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    sale_price: number | null;
    primary_image_url: string;
    category_name?: string;
    is_featured?: boolean;
    created_at?: string;
}

export default function FavoritesPage() {
    const { isAuthenticated, user, loading } = useAuth();
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const supabase = createClientComponentClient();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login?redirect=/favorites');
        }
    }, [isAuthenticated, loading, router]);

    // Fetch favorites from database or localStorage
    useEffect(() => {
        const fetchFavorites = async () => {
            setIsLoading(true);
            try {
                if (isAuthenticated && user) {
                    // Fetch favorites from database for authenticated users
                    const { data: userFavorites, error } = await supabase
                        .from('user_favorites')
                        .select('product_id')
                        .eq('user_id', user.id);

                    if (error) {
                        throw error;
                    }

                    if (userFavorites && userFavorites.length > 0) {
                        const productIds = userFavorites.map(fav => fav.product_id);

                        // Fetch product details
                        const { data: products, error: productsError } = await supabase
                            .from('products')
                            .select(`
                id, 
                name, 
                slug, 
                base_price, 
                sale_price, 
                primary_image_url,
                categories(name),
                is_featured,
                created_at
              `)
                            .in('id', productIds);

                        if (productsError) {
                            throw productsError;
                        }

                        // Transform products to match Product interface
                        const formattedProducts = products ? products.map((product: any) => ({
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            base_price: product.base_price,
                            sale_price: product.sale_price,
                            primary_image_url: product.primary_image_url,
                            category_name: product.categories?.name || "",
                            is_featured: product.is_featured || false,
                            created_at: product.created_at
                        })) : [];

                        setFavorites(formattedProducts);
                    } else {
                        setFavorites([]);
                    }
                } else {
                    // Use localStorage for non-authenticated users
                    const savedFavorites = localStorage.getItem('likedProducts');
                    if (savedFavorites) {
                        const favoriteIds = JSON.parse(savedFavorites);

                        if (favoriteIds.length > 0) {
                            // Fetch product details
                            const { data: products, error: productsError } = await supabase
                                .from('products')
                                .select(`
                  id, 
                  name, 
                  slug, 
                  base_price, 
                  sale_price, 
                  primary_image_url,
                  categories(name),
                  is_featured,
                  created_at
                `)
                                .in('id', favoriteIds);

                            if (productsError) {
                                throw productsError;
                            }

                            // Transform products to match Product interface
                            const formattedProducts = products ? products.map((product: any) => ({
                                id: product.id,
                                name: product.name,
                                slug: product.slug,
                                base_price: product.base_price,
                                sale_price: product.sale_price,
                                primary_image_url: product.primary_image_url,
                                category_name: product.categories?.name || "",
                                is_featured: product.is_featured || false,
                                created_at: product.created_at
                            })) : [];

                            setFavorites(formattedProducts);
                        } else {
                            setFavorites([]);
                        }
                    } else {
                        setFavorites([]);
                    }
                }
            } catch (error) {
                setFavorites([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading) {
            fetchFavorites();
        }
    }, [isAuthenticated, user, loading, supabase]);

    // Toggle favorite status
    const handleToggleFavorite = async (productId: string) => {
        try {
            if (isAuthenticated && user) {
                // Remove from database for authenticated users
                await supabase
                    .from('user_favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', productId);
            }

            // Always update localStorage regardless of authentication status
            const savedFavorites = localStorage.getItem('likedProducts');
            if (savedFavorites) {
                const favoriteIds = JSON.parse(savedFavorites);
                const updatedFavorites = favoriteIds.filter((id: string) => id !== productId);
                localStorage.setItem('likedProducts', JSON.stringify(updatedFavorites));
            }

            // Update UI
            setFavorites(prev => prev.filter(product => product.id !== productId));
        } catch (error) {
        }
    };

    // If still loading auth, show loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-64 w-full rounded-xl" />
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // If not authenticated, redirect is handled by useEffect

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold">Favorilerim</h1>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-64 w-full rounded-xl" />
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    ))}
                </div>
            ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {favorites.map(product => (
                        <div key={product.id} className="relative">
                            <ProductCard
                                id={product.id}
                                name={product.name}
                                slug={product.slug}
                                price={product.base_price}
                                salePrice={product.sale_price}
                                imageUrl={product.primary_image_url}
                                categoryName={product.category_name}
                                isFeatured={product.is_featured}
                                isLiked={true}
                                onLikeToggle={() => handleToggleFavorite(product.id)}
                                createdAt={product.created_at}
                            />
                            <button
                                onClick={() => handleToggleFavorite(product.id)}
                                className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-all z-10"
                                aria-label="Favorilerden çıkar"
                            >
                                <FaHeart className="text-red-500 text-xl" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <FaHeart className="text-gray-400 dark:text-gray-500 text-2xl" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Henüz favoriniz yok</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Beğendiğiniz ürünleri favorilerinize ekleyin</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                    >
                        Alışverişe Başla
                    </Link>
                </div>
            )}
        </div>
    );
} 