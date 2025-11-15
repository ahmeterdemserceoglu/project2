"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";
import Link from "next/link";
import { generateSlug, generateUniqueSlug, generateUniqueSku, logAdminAction } from "@/lib/utils";
import { ProductCard } from "@/components/ui/product-card";

export default function NewProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    base_price: "",
    stock_quantity: "0",
    category_id: "",
    is_active: true,
    is_featured: false,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [path, setPath] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        // Check if user is admin
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          // Not logged in, redirect to login
          router.push("/login");
          return;
        }
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
        if (profileError || !profile || !profile.is_admin) {
          // Not admin, redirect to homepage
          router.push("/");
          return;
        }
        fetchCategories();
      } catch (error) {
        router.push("/");
      }
    };
    checkAdminAndFetchData();
  }, [supabase, router]);

  useEffect(() => {
    // Generate slug from name
    if (formData.name) {
      setSlug(generateSlug(formData.name));
    }
  }, [formData.name]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, parent_category_id")
        .order("sort_order")
        .order("name");
      if (error) {
        throw error;
      }
      const list = data || [];
      setCategories(list);
      // Expand root by default
      const expanded: Record<string, boolean> = {};
      list.filter((c) => !c.parent_category_id).forEach((c) => (expanded[c.id] = true));
      setExpandedCategories(expanded);
    } catch (error) {
    }
  };

  const getCategoryPath = (id: string | null): string => {
    if (!id) return '';
    const cat = categories.find(c => c.id === id);
    if (!cat) return '';
    const parentPath = getCategoryPath(cat.parent_category_id);
    return parentPath ? `${parentPath} > ${cat.name}` : cat.name;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);
      // Generate preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      // Revoke the URL to avoid memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    // Update primary image index if necessary
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
  };

  const selectCategory = (id: string) => {
    setFormData(prev => ({ ...prev, category_id: id }));
    setModalOpen(false);
    setPath([]);
    setSearch("");
  };

  const getBreadcrumb = () => {
    const crumb = [{ id: null, name: 'Ana Kategoriler' }];
    let currentPath = [];
    for (const id of path) {
      currentPath.push(id);
      const cat = categories.find(c => c.id === id);
      if (cat) {
        crumb.push({ id: cat.id, name: cat.name });
      }
    }
    return crumb;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);
    try {
      // Validate form data
      if (!formData.name || !formData.description || !formData.base_price || !formData.category_id) {
        throw new Error("Lütfen gerekli alanları doldurun.");
      }
      // Convert price values to numbers
      const basePrice = parseFloat(formData.base_price);
      const stockQuantity = parseInt(formData.stock_quantity || '0');
      if (isNaN(basePrice) || basePrice <= 0) {
        throw new Error("Geçerli bir fiyat girin.");
      }
      if (isNaN(stockQuantity) || stockQuantity < 0) {
        throw new Error("Geçerli bir stok miktarı girin.");
      }
      // Use the admin_create_product RPC function to create a product with a guaranteed unique slug
      const { data: productData, error: productError } = await supabase.rpc('admin_create_product', {
        product_name: formData.name,
        product_slug: slug,
        product_sku: formData.sku ?? '',
        product_description: formData.description ?? '',
        product_base_price: basePrice,
        product_sale_price: null,
        product_stock_quantity: stockQuantity,
        product_category_id: formData.category_id ?? '',
        product_is_active: formData.is_active,
        product_is_featured: formData.is_featured
      });
      if (productError) {
        throw new Error(`Ürün oluşturulurken hata oluştu: ${productError.message}`);
      }
      if (!productData) {
        throw new Error("Ürün kaydedilemedi.");
      }
      const { data: { session: logSession } } = await supabase.auth.getSession();
      if (logSession) {
        await logAdminAction(
          supabase,
          logSession.user.id,
          'create',
          'product',
          productData,
          { name: formData.name }
        );
      }
      // Upload images if available
      if (imageFiles.length > 0) {
        let primaryImageUrl = null;
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${i}.${fileExt}`;
          const filePath = `${productData}/${fileName}`;  // productData is now the UUID
          // Upload image to storage
          const { error: uploadError } = await supabase
            .storage
            .from("product_images")
            .upload(filePath, file);
          if (uploadError) {
            throw uploadError;
          }
          // Get public URL
          const { data: publicUrlData } = supabase
            .storage
            .from("product_images")
            .getPublicUrl(filePath);
          // Save primary image URL
          if (i === primaryImageIndex) {
            primaryImageUrl = publicUrlData.publicUrl;
          }
          // Insert image record
          const { error: imageRecordError } = await supabase
            .from("product_images")
            .insert({
              product_id: productData,
              image_url: publicUrlData.publicUrl,
              is_primary: i === primaryImageIndex,
              display_order: i,
              alt_text: formData.name
            });
          if (imageRecordError) {
            // Handle RLS policy error by trying with a direct SQL query
            if (imageRecordError.message.includes('policy')) {
              const { error: sqlError } = await supabase.rpc('admin_insert_product_image', {
                product_id_param: productData,
                image_url_param: publicUrlData.publicUrl,
                is_primary_param: i === primaryImageIndex,
                display_order_param: i,
                alt_text_param: formData.name
              });
              if (sqlError) {
                throw sqlError;
              }
            } else {
              throw imageRecordError;
            }
          }
        }
        // Update product with primary image URL
        if (primaryImageUrl) {
          const { error: updateError } = await supabase
            .from("products")
            .update({ primary_image_url: primaryImageUrl })
            .eq("id", productData);
          if (updateError) {
            // Continue execution even if this fails
          } else {
          }
        }
      }
      setSuccess(true);
      // Redirect to products page after a short delay
      setTimeout(() => {
        router.push("/admin/products");
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategoryName = formData.category_id
    ? getCategoryPath(formData.category_id) || "Kategori Seçin"
    : "Kategori Seçin";

  const currentCategoryId = path.length > 0 ? path[path.length - 1] : null;

  const subCategories = categories.filter(c => c.parent_category_id === currentCategoryId);

  const filteredCategories = categories.filter(c =>
    getCategoryPath(c.id).toLowerCase().includes(search.toLowerCase())
  );

  const breadcrumb = getBreadcrumb();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md dark:bg-dark p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Yeni Ürün Ekle</h1>
          <div className="space-x-2">
            <Link
              href="/admin/products"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              İptal
            </Link>
            <button
              type="submit"
              form="product-form"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-md">
            Ürün başarıyla kaydedildi! Yönlendiriliyorsunuz...
          </div>
        )}
        {/* Product Preview */}
        {(formData.name || imagePreviewUrls.length > 0) && (
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Ürün Kartı Önizleme</h3>
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <ProductCard
                  id="preview"
                  name={formData.name || 'Ürün Adı'}
                  slug="preview"
                  price={formData.base_price ? parseFloat(formData.base_price) : 0}
                  salePrice={null}
                  imageUrl={imagePreviewUrls.length > 0 ? imagePreviewUrls[primaryImageIndex] : '/images/placeholder.png'}
                  categoryName={categories.find(c => c.id === formData.category_id)?.name}
                  isFeatured={formData.is_featured}
                  createdAt={new Date().toISOString()}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mt-4">
              Bu, ürününüzün sitede nasıl görüneceğinin önizlemesidir
            </p>
          </div>
        )}

        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Temel Bilgiler</h2>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                {/* Slug */}
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    SEO URL
                  </label>
                  <input
                    type="text"
                    id="slug"
                    value={slug}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Otomatik oluşturulur</p>
                </div>
                {/* SKU */}
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    id="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kategori *
                  </label>
                  <div className="mt-1 flex">
                    <input
                      type="text"
                      id="category"
                      value={selectedCategoryName}
                      readOnly
                      className="flex-1 block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark transition-colors"
                    >
                      Seç
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Pricing & Inventory */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Fiyat & Stok</h2>
              <div className="space-y-4">
                {/* Regular Price */}
                <div>
                  <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    name="base_price"
                    id="base_price"
                    min="0"
                    step="0.01"
                    value={formData.base_price}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stok Miktarı
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    id="stock_quantity"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                {/* Status Toggles */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Aktif (Satışta)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_featured"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Öne Çıkan Ürün
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Ürün Açıklaması</h2>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Açıklama *
              </label>
              <textarea
                name="description"
                id="description"
                rows={5}
                value={formData.description}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          {/* Product Images */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Ürün Görselleri</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Görsel Yükle
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                PNG, JPG, WEBP veya GIF formatında görseller yükleyebilirsiniz.
              </p>
            </div>
            {imagePreviewUrls.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yüklenen Görseller (Ana görseli seçmek için tıklayın)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square border-2 rounded-md overflow-hidden ${index === primaryImageIndex ? "border-primary" : "border-transparent"
                        }`}
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                        onClick={() => setPrimaryImage(index)}
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        onClick={() => removeImage(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {index === primaryImageIndex && (
                        <span className="absolute bottom-2 left-2 bg-primary text-white text-xs py-1 px-2 rounded">Ana Görsel</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kategori Seçin</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ürününüzün yerleştirileceği kategoriyi seçin</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Kategori ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {search ? (
                /* Search Results */
                <div className="space-y-3">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-center space-x-3">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{cat.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{getCategoryPath(cat.id)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => selectCategory(cat.id)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                        >
                          Seç
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.08 2.33" />
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Arama sonucu bulunamadı</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Farklı anahtar kelimeler deneyin</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Category Navigation */
                <div className="space-y-6">
                  {/* Breadcrumb */}
                  <nav className="flex items-center space-x-2 text-sm">
                    {breadcrumb.map((item, index) => (
                      <div key={index} className="flex items-center">
                        {index > 0 && (
                          <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                        <button
                          onClick={() => setPath(path.slice(0, index))}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            index === breadcrumb.length - 1
                              ? 'bg-primary text-white'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {item.name}
                        </button>
                      </div>
                    ))}
                  </nav>

                  {/* Current Location Selection */}
                  {currentCategoryId && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-green-900 dark:text-green-100">Bu kategoriyi seç</div>
                            <div className="text-sm text-green-700 dark:text-green-300">Mevcut kategori: {breadcrumb[breadcrumb.length - 1]?.name}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => selectCategory(currentCategoryId)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Seç
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Subcategories */}
                  <div className="space-y-2">
                    {subCategories.length > 0 ? (
                      subCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setPath([...path, cat.id])}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                        >
                          <div className="flex items-center space-x-3">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{cat.name}</div>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Alt kategori bulunamadı</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Bu kategorinin altında henüz kategori yok</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Seçili: <span className="font-medium">{formData.category_id ? getCategoryPath(formData.category_id) : 'Henüz seçilmedi'}</span>
              </div>
              <div className="flex items-center space-x-3">
                {formData.category_id && (
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, category_id: "" }))}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                  >
                    Seçimi Temizle
                  </button>
                )}
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}