"use client";

import { useState, useEffect, use } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { FaStar, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Product {
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
    description: string;
    discountPercent: number;
    startTime: string;
    endTime: string;
    remainingSeconds: number;
  };
}

interface Collection {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  image_url: string | null;
  badge: string | null;
  badge_color: string | null;
  is_active: boolean;
}

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);

  useEffect(() => {
    fetchCollectionData();
    loadLikedProducts();
  }, [slug]);

  const fetchCollectionData = async () => {
    try {
      setLoading(true);

      // Fetch collection info
      const collectionResponse = await fetch(`/api/collections/${slug}`);
      if (!collectionResponse.ok) {
        throw new Error("Collection not found");
      }
      const collectionData = await collectionResponse.json();
      setCollection(collectionData);

      // Fetch collection products
      const productsResponse = await fetch(`/api/collections/${slug}/products`);
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadLikedProducts = () => {
    try {
      const saved = localStorage.getItem("likedProducts");
      if (saved) {
        setLikedProducts(JSON.parse(saved));
      }
    } catch (error) {
    }
  };

  const handleToggleLike = (productId: string) => {
    setLikedProducts(prev => {
      const newLiked = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];

      try {
        localStorage.setItem("likedProducts", JSON.stringify(newLiked));
      } catch (error) {
      }

      return newLiked;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Koleksiyon yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Koleksiyon bulunamadı</h1>
            <p className="text-gray-600 mb-8">Aradığınız koleksiyon mevcut değil veya kaldırılmış olabilir.</p>
            <Link href="/">
              <Button>
                <FaArrowLeft className="mr-2" size={14} />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
              <span>/</span>
              <span className="text-gray-900">Koleksiyonlar</span>
              <span>/</span>
              <span className="text-gray-900">{collection.title}</span>
            </nav>

            {/* Collection Info */}
            <div className="space-y-4">
              {collection.badge && (
                <div className="inline-flex items-center">
                  <span
                    className="px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg"
                    style={{ backgroundColor: collection.badge_color || '#6B7280' }}
                  >
                    <FaStar className="inline mr-2" size={14} />
                    {collection.badge}
                  </span>
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                {collection.title}
              </h1>

              {collection.description && (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {collection.description}
                </p>
              )}

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 pt-4">
                <span>{products.length} ürün</span>
                <span>•</span>
                <span>Özel koleksiyon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaStar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bu koleksiyonda henüz ürün yok
            </h3>
            <p className="text-gray-600 mb-8">
              Yakında bu koleksiyona ürünler eklenecek
            </p>
            <Link href="/">
              <Button>
                <FaArrowLeft className="mr-2" size={14} />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Products Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Koleksiyon Ürünleri
              </h2>
              <div className="text-sm text-gray-500">
                {products.length} ürün gösteriliyor
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.base_price}
                    salePrice={product.sale_price}
                    imageUrl={product.primary_image_url || "/images/placeholder.jpg"}
                    categoryName={product.category_name}
                    isFeatured={product.is_featured}
                    isLiked={likedProducts.includes(product.id)}
                    onLikeToggle={handleToggleLike}
                    className="h-full transform hover:-translate-y-1 transition-all duration-300"
                    createdAt={product.created_at}
                    priority={index < 4}
                    isFlashDeal={product.isFlashDeal}
                    flashDeal={product.flashDeal}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}