"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useCartStore } from '@/lib/store';
import Image from 'next/image';
import { createClientComponentClient } from "@/lib/supabase";
import Link from 'next/link';
import "./anasayfa.css";

// Product interface
interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image_url: string;
    description?: string;
    slug: string;
    is_featured?: boolean;
    in_stock?: boolean;
}

// Category interface
interface Category {
    id: string;
    name: string;
    image_url: string | null;
    slug: string;
    product_count?: number;
}

// Format price in Turkish Lira
const formatPrice = (price: number) => {
    return `₺${price.toFixed(2)}`;
};

export default function HomePage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { showNotification } = useNotification();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const productRefs = useRef<Array<HTMLDivElement | null>>([]);

    const supabase = createClientComponentClient();

    // Fetch featured products
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoadingProducts(true);
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_featured', true)
                    .eq('is_active', true)
                    .limit(10);

                if (error) throw error;

                setFeaturedProducts(data || []);
            } catch (error) {
                console.error('Error fetching featured products:', error);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .order('sort_order', { ascending: true })
                    .limit(5);

                if (error) throw error;

                setCategories(data || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Scroll effects
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            document.documentElement.style.setProperty("--scroll", `${scrolled}px`);

            productRefs.current.forEach((item, index) => {
                if (item) {
                    const rect = item.getBoundingClientRect();
                    const isInView = rect.top < window.innerHeight && rect.bottom > 0;

                    if (isInView) {
                        item.style.transform = `translateX(${(index % 2 === 0 ? -1 : 1) * Math.min(scrolled * 0.02, 10)}px) translateY(${Math.sin(scrolled * 0.001 + index) * 5}px)`;
                        item.style.opacity = "1";
                    }
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Initialize scroll-based animations

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Handle image error
    const handleImageError = (
        event: React.SyntheticEvent<HTMLImageElement, Event>,
        name: string,
    ) => {
        const target = event.target as HTMLImageElement;
        target.onerror = null; // Prevent infinite loop if placeholder also fails
        target.src = `https://placehold.co/500x500/1a1a1a/4a4a4a?text=${name.replace(/\s/g, "+")}`;
    };

    // Handle newsletter subscription
    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSubscribed(true);
            setEmail("");
            if (showToast) {
                showToast("Bültenimize başarıyla abone oldunuz!", "success");
            }
        }, 1500);
    };

    return (
        <main className="overflow-hidden">
            {/* Hero Section */}
            <section className="liquid-header h-screen relative overflow-hidden text-center">
                <div className="liquid-shape"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none z-5"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <div className="glitch-container">
                        <h1 className="glitch-text" data-text="DIMENSION">
                            DIMENSION
                        </h1>
                    </div>
                    <p className="text-lg md:text-xl mt-4 animate-fade-in-down">
                        Geleceğin teknolojisini keşfet
                    </p>
                    <Link
                        href="/products"
                        aria-label="Ürünlere Git"
                        className="btn btn-primary btn-lg mt-8 animate-fade-in-down"
                    >
                        Alışverişe Başla
                    </Link>
                </div>
                <div className="scroll-indicator">
                    <div className="line"></div>
                    <div className="dot"></div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-light tracking-wide">ÖNE ÇIKAN ÜRÜNLER</h2>
                        <Link
                            href="/products"
                            className="text-white hover:text-accent transition-colors text-sm font-medium px-4 py-2 bg-primary/80 hover:bg-primary rounded-md"
                        >
                            Tümünü Gör →
                        </Link>
                    </div>

                    {loadingProducts ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-800 h-64 rounded-lg"></div>
                                    <div className="mt-4 space-y-3">
                                        <div className="h-5 bg-gray-800 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                                        <div className="h-8 bg-gray-800 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product, i) => (
                                <div
                                    key={product.id}
                                    ref={(el) => { productRefs.current[i] = el; }}
                                    className="group bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <Image
                                            src={product.image_url || '/images/placeholder.jpg'}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                                            onError={(e) => handleImageError(e, product.name)}
                                        />
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% İndirim
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-medium text-white mb-1">{product.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xl font-bold text-white">{formatPrice(product.price)}</span>
                                                {product.originalPrice && product.originalPrice > product.price && (
                                                    <span className="ml-2 text-sm text-gray-400 line-through">
                                                        {formatPrice(product.originalPrice)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-sm ${product.in_stock ? 'text-green-500' : 'text-red-500'}`}>
                                                {product.in_stock ? 'Stokta' : 'Tükendi'}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/products/${product.slug}`}
                                            className="block w-full mt-4 text-center bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-md transition-colors"
                                        >
                                            Ürünü İncele
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 px-4 bg-gray-900">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-light tracking-wide">KATEGORİLER</h2>
                        <Link
                            href="/categories"
                            className="text-white hover:text-accent transition-colors text-sm font-medium px-4 py-2 bg-primary/80 hover:bg-primary rounded-md"
                        >
                            Tümünü Gör →
                        </Link>
                    </div>

                    {loadingCategories ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-800 h-48 rounded-lg"></div>
                                    <div className="mt-4 space-y-2">
                                        <div className="h-5 bg-gray-800 rounded w-2/3"></div>
                                        <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/categories/${category.slug}`}
                                    className="group relative block h-64 overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl"
                                >
                                    <div className="absolute inset-0 overflow-hidden">
                                        {category.image_url ? (
                                            <Image
                                                src={category.image_url}
                                                alt={category.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => handleImageError(e, category.name)}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                                <span className="text-xl font-bold text-primary">{category.name.charAt(0)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 transition-opacity group-hover:opacity-90"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-xl font-bold text-white">{category.name}</h3>
                                        {category.product_count !== undefined && (
                                            <p className="mt-1 text-sm text-gray-300">{category.product_count} ürün</p>
                                        )}
                                        <div className="mt-3 h-0.5 w-10 bg-primary transition-all duration-300 group-hover:w-20"></div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="bg-gradient-to-r from-gray-900 to-primary/20 w-full h-full"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-light mb-4">
                            GÜNCEL KALIN
                        </h2>
                        <p className="mb-8">
                            Yeni ürünler, özel indirimler ve kampanyalardan ilk siz haberdar olun.
                        </p>

                        {subscribed ? (
                            <div className="success-message p-4 bg-green-500/20 backdrop-blur-sm rounded-lg">
                                <p>Teşekkürler! Bültenimize başarıyla abone oldunuz.</p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubscribe}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="E-posta adresiniz"
                                    required
                                    className="flex-grow px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                />

                                <button
                                    type="submit"
                                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
                                    disabled={loading}
                                >
                                    {loading ? "GÖNDERİLİYOR..." : "ABONE OL"}
                                </button>
                            </form>
                        )}

                        <p className="text-xs text-gray-400 mt-4">
                            Abone olarak,{" "}
                            <Link href="/privacy" className="underline">
                                Gizlilik Politikamızı
                            </Link>{" "}
                            kabul etmiş olursunuz. İstediğiniz zaman abonelikten çıkabilirsiniz.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
} 