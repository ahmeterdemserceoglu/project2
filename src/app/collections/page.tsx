"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaStar, FaArrowRight } from "react-icons/fa";
import { SimplifiedImage } from "@/components/ui/simplified-image";

interface Collection {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  image_url: string | null;
  badge: string | null;
  badge_color: string | null;
  is_active: boolean;
  sort_order: number | null;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/special-collections");
      
      if (!response.ok) {
        throw new Error("Failed to fetch collections");
      }
      
      const data = await response.json();
      setCollections(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Koleksiyonlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Özel Koleksiyonlar
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Özenle seçilmiş ürün koleksiyonlarımızı keşfedin
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FaStar className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Henüz koleksiyon yok
          </h3>
          <p className="text-gray-500 mb-8">
            Yakında özel koleksiyonlarımızı burada bulabileceksiniz
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/${collection.slug}`}
              className="group block"
            >
              <div className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg overflow-hidden">
                {/* Collection Image */}
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                  {collection.image_url ? (
                    <SimplifiedImage
                      src={collection.image_url}
                      alt={collection.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <FaStar className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                  )}
                  
                  {/* Badge */}
                  {collection.badge && (
                    <div 
                      className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-bold shadow-lg"
                      style={{ backgroundColor: collection.badge_color || '#6B7280' }}
                    >
                      {collection.badge}
                    </div>
                  )}
                </div>

                {/* Collection Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {collection.title}
                  </h3>
                  
                  {collection.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Koleksiyonu Keşfet
                    </span>
                    <FaArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}