"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, Grid, List } from "lucide-react";
import ProductGridWithFlashDeals from "@/components/products/ProductGridWithFlashDeals";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const currentSearchParams = {
    search: searchQuery,
    category: category || undefined,
    sortBy,
    sortOrder: 'desc'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            3D Baskı Malzemeleri ve Ürünler
          </h1>
          <p className="text-lg opacity-90 mb-6">
            Profesyonel 3D printing çözümleri, filamentler ve 3D yazıcılar
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="3D baskı malzemeleri, filament, PLA, ABS ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtreler
              </h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tüm Kategoriler</option>
                  <option value="filament">Filamentler</option>
                  <option value="3d-yazici">3D Yazıcılar</option>
                  <option value="malzeme">Baskı Malzemeleri</option>
                  <option value="aksesuar">Aksesuarlar</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sıralama
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="created_at">En Yeni</option>
                  <option value="base_price">Fiyat (Düşük-Yüksek)</option>
                  <option value="name">İsim (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div>
                {searchQuery && (
                  <h2 className="text-xl font-semibold text-gray-900">
                    "{searchQuery}" için sonuçlar
                  </h2>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            <ProductGridWithFlashDeals
              searchParams={currentSearchParams}
              initialProducts={[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}