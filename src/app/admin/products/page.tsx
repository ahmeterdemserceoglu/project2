"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClientComponentClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { logAdminAction } from "@/lib/utils";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useToast } from "@/contexts/ToastContext";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        // Check if user is admin
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // Not logged in, redirect to login
          router.push('/login');
          return;
        }

        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile || !profile.is_admin) {
          // Not admin, redirect to homepage
          router.push('/');
          return;
        }

        fetchProducts();
        fetchCategories();
      } catch (error) {
        router.push('/');
      }
    };

    checkAdminAndFetchData();
  }, [supabase, router]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, 
          name, 
          slug, 
          description, 
          base_price, 
          sale_price, 
          stock_quantity, 
          is_active,
          is_featured,
          sku,
          category_id,
          primary_image_url,
          categories(id, name),
          product_images(id, image_url, is_primary)
        `);

      if (error) {
        throw error;
      }

      setProducts(data || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');

      if (error) {
        throw error;
      }

      const categoryNames = data?.map(category => category.name) || [];
      setCategories(categoryNames);
    } catch (error) {
    }
  };

  // Toggle featured status for a product
  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(products.map(product =>
        product.id === productId
          ? { ...product, is_featured: !currentStatus }
          : product
      ));

      showToast(
        currentStatus
          ? "Ürün öne çıkanlardan kaldırıldı"
          : "Ürün öne çıkanlara eklendi",
        "success"
      );

      // Log admin action
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await logAdminAction(
          supabase,
          session.user.id,
          currentStatus ? 'unfeature' : 'feature',
          'product',
          productId,
          { product_id: productId }
        );
      }
    } catch (error) {
      showToast("İşlem sırasında bir hata oluştu", "error");
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = categoryFilter
      ? (product.categories?.name || '').toLowerCase() === categoryFilter.toLowerCase()
      : true;
    const matchesStatus = statusFilter
      ? (statusFilter === "active" && product.is_active) ||
      (statusFilter === "out_of_stock" && !product.is_active)
      : true;
    const matchesFeatured = featuredFilter
      ? (featuredFilter === "featured" && product.is_featured) ||
      (featuredFilter === "not_featured" && !product.is_featured)
      : true;

    return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
  });

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  // Handle individual selection
  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(
        selectedProducts.filter((productId) => productId !== id),
      );
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // Handle single product deletion
  const deleteProduct = async (productId: string) => {
    try {
      // Get product images before deletion to handle storage cleanup if needed
      const { data: productImages, error: imagesError } = await supabase
        .from('product_images')
        .select('id, image_url')
        .eq('product_id', productId);

      if (imagesError) {
      }

      // Delete product images from the database
      const { error: deleteImagesError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      if (deleteImagesError) {
        throw deleteImagesError;
      }

      // Then delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(products.filter((p) => p.id !== productId));
      
      // Remove from selected products if it was selected
      setSelectedProducts(selectedProducts.filter(id => id !== productId));

      const { data: { session: delSession } } = await supabase.auth.getSession();
      if (delSession) {
        await logAdminAction(
          supabase,
          delSession.user.id,
          'delete',
          'product',
          productId,
          { product_id: productId }
        );
      }

      showToast("Ürün başarıyla silindi", "success");
    } catch (error) {
      showToast("Ürün silinirken bir hata oluştu", "error");
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) return;

    try {
      switch (action) {
        case "delete":
          // First check if product_images table has storage_path column
          const { data: columnCheck, error: columnError } = await supabase
            .from('information_schema.columns' as any)
            .select('column_name')
            .eq('table_name', 'product_images')
            .eq('column_name', 'storage_path');

          if (columnError) {
          }

          // Get product images before deletion to handle storage cleanup if needed
          const { data: productImages, error: imagesError } = await supabase
            .from('product_images')
            .select('id, image_url')
            .in('product_id', selectedProducts);

          if (imagesError) {
          }

          // Delete product images from the database
          const { error: deleteImagesError } = await supabase
            .from('product_images')
            .delete()
            .in('product_id', selectedProducts);

          if (deleteImagesError) {
            throw deleteImagesError;
          }

          // Then delete the products
          const { error } = await supabase
            .from('products')
            .delete()
            .in('id', selectedProducts);

          if (error) throw error;

          setProducts(products.filter((p) => !selectedProducts.includes(p.id)));
          setSelectedProducts([]);

          const { data: { session: delSession } } = await supabase.auth.getSession();
          if (delSession) {
            await logAdminAction(
              supabase,
              delSession.user.id,
              'delete',
              'product',
              null,
              { ids: selectedProducts }
            );
          }

          showToast("Ürünler başarıyla silindi", "success");
          break;

        case "activate":
          const { error: activateError } = await supabase
            .from('products')
            .update({ is_active: true })
            .in('id', selectedProducts);

          if (activateError) throw activateError;

          setProducts(
            products.map((p) =>
              selectedProducts.includes(p.id) ? { ...p, is_active: true } : p,
            ),
          );
          {
            const { data: { session: actSession } } = await supabase.auth.getSession();
            if (actSession) {
              await logAdminAction(
                supabase,
                actSession.user.id,
                'activate',
                'product',
                null,
                { ids: selectedProducts }
              );
            }
          }
          break;

        case "deactivate":
          const { error: deactivateError } = await supabase
            .from('products')
            .update({ is_active: false })
            .in('id', selectedProducts);

          if (deactivateError) throw deactivateError;

          setProducts(
            products.map((p) =>
              selectedProducts.includes(p.id) ? { ...p, is_active: false } : p,
            ),
          );
          {
            const { data: { session: deactSession } } = await supabase.auth.getSession();
            if (deactSession) {
              await logAdminAction(
                supabase,
                deactSession.user.id,
                'deactivate',
                'product',
                null,
                { ids: selectedProducts }
              );
            }
          }
          break;

        case "feature":
          const { error: featureError } = await supabase
            .from('products')
            .update({ is_featured: true })
            .in('id', selectedProducts);

          if (featureError) throw featureError;

          setProducts(
            products.map((p) =>
              selectedProducts.includes(p.id) ? { ...p, is_featured: true } : p,
            ),
          );
          showToast("Seçili ürünler öne çıkanlara eklendi", "success");
          {
            const { data: { session: featSession } } = await supabase.auth.getSession();
            if (featSession) {
              await logAdminAction(
                supabase,
                featSession.user.id,
                'feature',
                'product',
                null,
                { ids: selectedProducts }
              );
            }
          }
          break;

        case "unfeature":
          const { error: unfeatureError } = await supabase
            .from('products')
            .update({ is_featured: false })
            .in('id', selectedProducts);

          if (unfeatureError) throw unfeatureError;

          setProducts(
            products.map((p) =>
              selectedProducts.includes(p.id) ? { ...p, is_featured: false } : p,
            ),
          );
          showToast("Seçili ürünler öne çıkanlardan kaldırıldı", "success");
          {
            const { data: { session: unfeatSession } } = await supabase.auth.getSession();
            if (unfeatSession) {
              await logAdminAction(
                supabase,
                unfeatSession.user.id,
                'unfeature',
                'product',
                null,
                { ids: selectedProducts }
              );
            }
          }
          break;
      }
    } catch (error) {
      showToast("İşlem sırasında bir hata oluştu", "error");
    }
  };

  const getProductImage = (product: any) => {
    // First check if there's a valid primary_image_url
    if (product.primary_image_url && (
      product.primary_image_url.startsWith('http') ||
      product.primary_image_url.startsWith('/')
    )) {
      return product.primary_image_url;
    }

    // If no valid primary_image_url, check product_images
    if (product.product_images && product.product_images.length > 0) {
      // Find primary image or use first available
      const primaryImage = product.product_images.find((img: any) => img.is_primary);
      const imageUrl = primaryImage ? primaryImage.image_url : product.product_images[0].image_url;

      // Validate URL format
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
        return imageUrl;
      }
    }

    // Fallback to placeholder
    return '/images/placeholder.png';
  };

  const formatPrice = (price: number) => {
    return `₺${Number(price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div>
      <header
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ürünler
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Toplam {products.length} ürün,{" "}
            {products.filter((p) => p.is_active).length} aktif
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Yeni Ürün
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-sm p-5 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="search" className="sr-only">
              Ara
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark rounded-md leading-5 bg-white dark:bg-dark placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Ürün ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <label htmlFor="category" className="sr-only">
              Kategori
            </label>
            <select
              id="category"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark rounded-md focus:ring-primary focus:border-primary sm:text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <label htmlFor="status" className="sr-only">
              Durum
            </label>
            <select
              id="status"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark rounded-md focus:ring-primary focus:border-primary sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="out_of_stock">Stokta Değil</option>
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <label htmlFor="featured" className="sr-only">
              Öne Çıkan
            </label>
            <select
              id="featured"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark rounded-md focus:ring-primary focus:border-primary sm:text-sm"
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
            >
              <option value="">Tüm Durumlar</option>
              <option value="featured">Öne Çıkan</option>
              <option value="not_featured">Öne Çıkan Olmayan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex justify-between items-center bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-3 mb-6">
          <div className="text-sm font-medium">
            {selectedProducts.length} ürün seçildi
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkAction("activate")}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Aktifleştir
            </button>
            <button
              onClick={() => handleBulkAction("deactivate")}
              className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
            >
              Deaktifleştir
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Sil
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white dark:bg-dark-lighter shadow-sm rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-dark rounded mb-6"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4 py-3 border-b dark:border-dark">
                <div className="w-6 h-6 bg-gray-200 dark:bg-dark rounded"></div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-dark rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-dark rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-dark rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {search || categoryFilter || statusFilter || featuredFilter
              ? "Arama kriterlerine uygun ürün bulunamadı."
              : "Henüz ürün bulunmuyor."}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark">
            <thead className="bg-gray-50 dark:bg-dark-lighter">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedProducts.length === filteredProducts.length
                      }
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Ürün
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Kategori
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Fiyat
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Stok
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Durum
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Öne Çıkan
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-lighter divide-y divide-gray-200 dark:divide-dark">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-dark">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={getProductImage(product)}
                          alt={product.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.png';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          SKU: {product.sku || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-200">
                      {product.categories?.name || 'Kategorisiz'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatPrice(product.sale_price || product.base_price)}
                    </div>
                    {product.sale_price && (
                      <div className="text-xs line-through text-gray-500">
                        {formatPrice(product.base_price)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {product.stock_quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {product.is_active ? "Aktif" : "Stokta Değil"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_featured
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {product.is_featured ? "Öne Çıkan" : "Öne Çıkan Olmayan"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="text-primary hover:text-primary-dark mr-3"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => toggleFeatured(product.id, product.is_featured)}
                      className="text-yellow-600 hover:text-yellow-800 mr-3"
                      title={product.is_featured ? "Öne çıkardan kaldır" : "Öne çıkanlara ekle"}
                    >
                      {product.is_featured ? <FaStar className="inline" /> : <FaRegStar className="inline" />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bulk Actions Selector */}
      <div className="mt-6 flex justify-center">
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleBulkAction(e.target.value);
              e.target.value = "";
            }
          }}
          className="ml-2 block pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-dark-lighter dark:bg-dark rounded-md focus:ring-primary focus:border-primary"
        >
          <option value="">Toplu İşlemler</option>
          <optgroup label="Durum İşlemleri">
            <option value="activate">Aktif Et</option>
            <option value="deactivate">Pasif Et</option>
          </optgroup>
          <optgroup label="Öne Çıkan İşlemleri">
            <option value="feature">Öne Çıkanlara Ekle</option>
            <option value="unfeature">Öne Çıkanlardan Kaldır</option>
          </optgroup>
          <optgroup label="Tehlikeli İşlemler">
            <option value="delete">Sil</option>
          </optgroup>
        </select>
      </div>
    </div>
  );
}
