"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { FaArrowLeft, FaPlus, FaTrash, FaSearch, FaFilter } from "react-icons/fa";
import { toast } from "sonner";

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
}

interface Collection {
  id: string;
  title: string;
  description: string | null;
  slug: string;
}

export default function CollectionProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: collectionId } = use(params);
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [collectionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch collection info
      const collectionResponse = await fetch(`/api/admin/special-collections/${collectionId}`);
      if (collectionResponse.ok) {
        const collectionData = await collectionResponse.json();
        setCollection(collectionData);
      }

      // Fetch collection products
      const collectionProductsResponse = await fetch(`/api/admin/special-collections/${collectionId}/products`);
      if (collectionProductsResponse.ok) {
        const collectionProductsData = await collectionProductsResponse.json();
        setCollectionProducts(collectionProductsData);
      }

      // Fetch all available products
      const productsResponse = await fetch("/api/admin/products");
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setAvailableProducts(productsData);
      }

      // Fetch categories
      const categoriesResponse = await fetch("/api/categories");
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.data || []);
      }
    } catch (error) {
      toast.error("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const addProductToCollection = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/special-collections/${collectionId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });

      if (!response.ok) throw new Error("Failed to add product");
      
      toast.success("Ürün koleksiyona eklendi");
      fetchData(); // Refresh data
    } catch (error) {
      toast.error("Ürün eklenirken hata oluştu");
    }
  };

  const removeProductFromCollection = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/special-collections/${collectionId}/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove product");
      
      toast.success("Ürün koleksiyondan çıkarıldı");
      fetchData(); // Refresh data
    } catch (error) {
      toast.error("Ürün çıkarılırken hata oluştu");
    }
  };

  const filteredAvailableProducts = availableProducts.filter(product => {
    // Exclude products already in collection
    const isInCollection = collectionProducts.some(cp => cp.id === product.id);
    if (isInCollection) return false;

    // Filter by search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by category
    if (selectedCategory && product.category_name !== selectedCategory) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/special-collections">
            <Button variant="outline" size="sm">
              <FaArrowLeft className="mr-2" size={14} />
              Geri Dön
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {collection?.title} - Ürünler
            </h1>
            <p className="text-gray-600">
              Koleksiyondaki ürünleri yönetin
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaPlus className="text-blue-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Koleksiyondaki Ürünler</p>
              <p className="text-2xl font-bold text-gray-900">{collectionProducts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaSearch className="text-green-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Eklenebilir Ürünler</p>
              <p className="text-2xl font-bold text-gray-900">{filteredAvailableProducts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaFilter className="text-purple-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
              <p className="text-2xl font-bold text-gray-900">{availableProducts.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Collection Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Koleksiyondaki Ürünler ({collectionProducts.length})
          </h2>
          
          {collectionProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPlus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Bu koleksiyonda henüz ürün yok</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collectionProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.base_price}
                    salePrice={product.sale_price}
                    imageUrl={product.primary_image_url || "/images/placeholder.jpg"}
                    categoryName={product.category_name}
                    isFeatured={product.is_featured}
                    className="h-full"
                    createdAt={product.created_at}
                  />
                  <button
                    onClick={() => removeProductFromCollection(product.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Koleksiyondan Çıkar"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Eklenebilir Ürünler ({filteredAvailableProducts.length})
            </h2>
          </div>

          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {filteredAvailableProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                {searchTerm || selectedCategory ? "Filtreye uygun ürün bulunamadı" : "Eklenebilir ürün yok"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredAvailableProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.base_price}
                    salePrice={product.sale_price}
                    imageUrl={product.primary_image_url || "/images/placeholder.jpg"}
                    categoryName={product.category_name}
                    isFeatured={product.is_featured}
                    className="h-full"
                    createdAt={product.created_at}
                  />
                  <button
                    onClick={() => addProductToCollection(product.id)}
                    className="absolute top-2 right-2 p-2 bg-green-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-600"
                    title="Koleksiyona Ekle"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}