"use client";

import './anasayfa.css';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { FaCartPlus, FaArrowRight, FaStar, FaRegHeart, FaHeart, FaShieldAlt, FaShippingFast, FaUndo, FaHeadphones, FaChevronDown } from 'react-icons/fa';

export default function HomePage() {
    const [isHeaderFixed, setIsHeaderFixed] = useState(false);
    const [visibleSections, setVisibleSections] = useState<string[]>([]);
    const [likedProducts, setLikedProducts] = useState<number[]>([]);
    const [cartItems, setCartItems] = useState<number>(0);

    // References for animation triggers
    const heroRef = useRef<HTMLDivElement>(null);
    const featureSectionRef = useRef<HTMLDivElement>(null);
    const productSectionRef = useRef<HTMLDivElement>(null);
    const categorySectionRef = useRef<HTMLDivElement>(null);
    const lifestyleSectionRef = useRef<HTMLDivElement>(null);

    // Sample featured products
    const products = [
        {
            id: 1,
            name: 'Premium Yün Palto',
            price: 2999.99,
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
            category: 'Paltolar',
            rating: 4.8,
        },
        {
            id: 2,
            name: 'Tasarım Deri Çanta',
            price: 1899.99,
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
            category: 'Aksesuarlar',
            rating: 4.9,
        },
        {
            id: 3,
            name: 'Limitli Seri Saat',
            price: 4499.99,
            image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3',
            category: 'Saatler',
            rating: 5.0,
        },
        {
            id: 4,
            name: 'Premium İpek Elbise',
            price: 2599.99,
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
            category: 'Elbiseler',
            rating: 4.7,
        },
        {
            id: 5,
            name: 'İtalyan Süet Bot',
            price: 3299.99,
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2',
            category: 'Ayakkabılar',
            rating: 4.6,
        }
    ];

    // Categories
    const categories = [
        {
            id: 1,
            name: 'Erkek Koleksiyonu',
            image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e',
        },
        {
            id: 2,
            name: 'Kadın Koleksiyonu',
            image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8',
        },
        {
            id: 3,
            name: 'Aksesuarlar',
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
        },
        {
            id: 4,
            name: 'Ayakkabılar',
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2',
        }
    ];

    // Handle scroll events for header fixed state
    useEffect(() => {
        function handleScroll() {
            if (window.scrollY > 50) {
                setIsHeaderFixed(true);
            } else {
                setIsHeaderFixed(false);
            }
        }

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial scroll position

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Setup intersection observer for animations
    useEffect(() => {
        const sections = [
            { ref: heroRef, id: 'hero' },
            { ref: featureSectionRef, id: 'features' },
            { ref: productSectionRef, id: 'featured' },
            { ref: categorySectionRef, id: 'categories' },
            { ref: lifestyleSectionRef, id: 'lifestyle' }
        ];

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setVisibleSections(prev => {
                        if (!prev.includes(entry.target.id)) {
                            return [...prev, entry.target.id];
                        }
                        return prev;
                    });
                }
            });
        }, { threshold: 0.2 });

        sections.forEach(section => {
            if (section.ref.current) {
                observer.observe(section.ref.current);
            }
        });

        return () => {
            sections.forEach(section => {
                if (section.ref.current) {
                    observer.unobserve(section.ref.current);
                }
            });
        };
    }, []);

    // Add to cart functionality
    const handleAddToCart = (productId: number, e: React.MouseEvent) => {
        e.preventDefault();
        setCartItems(prev => prev + 1);

        // Add animation effect
        const target = e.currentTarget as HTMLElement;
        target.classList.add('added');
        setTimeout(() => {
            target.classList.remove('added');
        }, 1000);
    };

    // Toggle like functionality
    const handleToggleLike = (productId: number, e: React.MouseEvent) => {
        e.preventDefault();
        setLikedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    // Scroll to section
    const scrollToSection = (sectionId: string) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="modern-container">
            {/* Hero Section */}
            <section className="hero-container" ref={heroRef} id="hero">
                <div className="hero-visual">
                    <div className="hero-image">
                        <Image
                            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop"
                            alt="Lüks moda alışveriş deneyimi"
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                            quality={90}
                        />
                    </div>
                </div>

                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="line">Premium</span>
                        <span className="line">Pazar<span className="emphasis">Yeri</span></span>
                    </h1>
                    <p className="hero-subtitle">
                        Binlerce satıcı, milyonlarca ürün. Tek bir yerde en kaliteli markaları keşfedin,
                        en iyi fiyatlarla alışverişin keyfini çıkarın.
                    </p>
                    <div className="hero-buttons">
                        <Link href="/products" className="primary-button">
                            <span>Alışverişe Başla</span>
                            <FaArrowRight />
                        </Link>
                        <button onClick={() => scrollToSection('categories')} className="secondary-button">
                            <span>Kategorileri Keşfet</span>
                        </button>
                    </div>
                </div>

                <div className="scroll-indicator" onClick={() => scrollToSection('featured')}>
                    <FaChevronDown />
                </div>
            </section>

            {/* Featured Products Section */}
            <section id="featured"
                className={`py-20 px-4 max-w-7xl mx-auto ${visibleSections.includes('featured') ? 'animate-on-scroll visible' : 'animate-on-scroll'}`}
                ref={productSectionRef}
            >
                <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Öne Çıkan Koleksiyon</h2>

                <div className="overflow-x-auto pb-8">
                    <div className="flex gap-8 min-w-max px-4 py-4 snap-x snap-mandatory">
                        {products.map((product) => (
                            <div key={product.id} className="product-card">
                                <Link href={`/products/${product.id}`} className="block">
                                    <div className="product-image-container">
                                        <Image
                                            src={`${product.image}?auto=format&fit=crop&w=800&q=80`}
                                            alt={product.name}
                                            fill
                                            className="product-image"
                                        />
                                        <div className="absolute top-4 right-4 z-10">
                                            <button
                                                onClick={(e) => handleToggleLike(product.id, e)}
                                                className="like-button p-2 bg-white bg-opacity-80 rounded-full shadow-md hover:bg-opacity-100 transition-all"
                                            >
                                                {likedProducts.includes(product.id) ? (
                                                    <FaHeart className="text-red-500 text-xl" />
                                                ) : (
                                                    <FaRegHeart className="text-gray-700 text-xl" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                                <div className="p-6 bg-white dark:bg-gray-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">{product.name}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{product.category}</p>
                                        </div>
                                        <span className="flex items-center gap-1">
                                            <FaStar className="text-yellow-400" />
                                            <span className="text-gray-800 dark:text-gray-200">{product.rating}</span>
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-5">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">₺{product.price}</span>
                                        <button
                                            onClick={(e) => handleAddToCart(product.id, e)}
                                            className="add-to-cart"
                                        >
                                            <span>Sepete Ekle</span>
                                            <FaCartPlus />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-12">
                    <Link href="/products" className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all">
                        <span>Tüm Ürünleri Gör</span>
                        <FaArrowRight />
                    </Link>
                </div>
            </section>

            {/* Categories Section */}
            <section id="categories"
                className={`py-20 px-4 max-w-7xl mx-auto ${visibleSections.includes('categories') ? 'animate-on-scroll visible' : 'animate-on-scroll'}`}
                ref={categorySectionRef}
            >
                <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Kategorilere Göz At</h2>

                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-animation ${visibleSections.includes('categories') ? 'visible' : ''}`}>
                    {categories.map((category) => (
                        <div key={category.id} className="category-card relative h-80 overflow-hidden">
                            <div className="category-bg"></div>
                            <Image
                                src={`${category.image}?auto=format&fit=crop&w=600&q=80`}
                                alt={category.name}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                            <div className="category-content absolute inset-0 flex flex-col items-center justify-end p-6">
                                <h3 className="text-xl font-semibold mb-4 text-white">{category.name}</h3>
                                <Link href={`/products?category=${category.id}`} className="category-button px-6 py-3 bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm text-white border border-white border-opacity-40 hover:bg-opacity-30 transition-all">
                                    Alışverişe Başla
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Lifestyle Section */}
            <section id="lifestyle"
                className={`lifestyle-section ${visibleSections.includes('lifestyle') ? 'animate-on-scroll visible' : 'animate-on-scroll'}`}
                ref={lifestyleSectionRef}
            >
                <div className="parallax-container">
                    <div
                        className="parallax-layer"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80')`
                        }}
                    ></div>
                    <div className="parallax-content text-center text-white p-8 max-w-3xl">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Yaşam Tarzınızı Yükseltin</h2>
                        <p className="text-xl mb-8">Eşsiz tarzınızı yansıtan ve hayatınızın her anını özel kılan özenle seçilmiş parçaları keşfedin.</p>
                        <button className="parallax-button px-10 py-5 bg-transparent border-2 border-white text-white text-lg hover:bg-white hover:bg-opacity-10 transition-all">
                            <span>Koleksiyonu Keşfet</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features"
                className="py-20 px-4"
                ref={featureSectionRef}
            >
                <div className={`max-w-7xl mx-auto stagger-animation ${visibleSections.includes('features') ? 'visible' : ''}`}>
                    <h2 className="text-3xl font-bold mb-16 text-center text-gray-900 dark:text-white">Neden Bizden Alışveriş Yapmalısınız</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        <div className="feature flex flex-col items-center text-center">
                            <div className="feature-icon-container mb-6 p-4 border border-black dark:border-white rounded-full">
                                <div className="feature-icon text-3xl">
                                    <FaShippingFast />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Ücretsiz Hızlı Kargo</h3>
                            <p className="text-gray-600 dark:text-gray-400">1000₺ üzeri tüm siparişlerde dünya çapında ücretsiz kargo</p>
                        </div>

                        <div className="feature flex flex-col items-center text-center">
                            <div className="feature-icon-container mb-6 p-4 border border-black dark:border-white rounded-full">
                                <div className="feature-icon text-3xl">
                                    <FaUndo />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Kolay İade</h3>
                            <p className="text-gray-600 dark:text-gray-400">Stressiz bir alışveriş deneyimi için 30 gün iade politikası</p>
                        </div>

                        <div className="feature flex flex-col items-center text-center">
                            <div className="feature-icon-container mb-6 p-4 border border-black dark:border-white rounded-full">
                                <div className="feature-icon text-3xl">
                                    <FaShieldAlt />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Güvenli Ödeme</h3>
                            <p className="text-gray-600 dark:text-gray-400">Ödeme bilgileriniz güvenli bir şekilde işlenir</p>
                        </div>

                        <div className="feature flex flex-col items-center text-center">
                            <div className="feature-icon-container mb-6 p-4 border border-black dark:border-white rounded-full">
                                <div className="feature-icon text-3xl">
                                    <FaHeadphones />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">7/24 Müşteri Desteği</h3>
                            <p className="text-gray-600 dark:text-gray-400">Sorularınız veya endişeleriniz için her zaman yanınızdayız</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Scroll to top button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-8 right-8 p-4 bg-black text-white dark:bg-white dark:text-black rounded-full shadow-lg transition-all transform ${isHeaderFixed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L18 11H13V19H11V11H6L12 5Z" fill="currentColor" />
                </svg>
            </button>
        </div>
    );
} 