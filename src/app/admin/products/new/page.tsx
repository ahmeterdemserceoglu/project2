"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";
import Link from "next/link";
import { generateSlug, generateUniqueSlug, generateUniqueSku, logAdminAction } from "@/lib/utils";

export default function NewProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    base_price: "",
    sale_price: "",
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
        console.error("Authentication error:", error);
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
        .select("id, name")
        .order("name");

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
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
      const salePrice = formData.sale_price ? parseFloat(formData.sale_price) : null;
      const stockQuantity = parseInt(formData.stock_quantity);

      if (isNaN(basePrice) || basePrice <= 0) {
        throw new Error("Geçerli bir fiyat girin.");
      }

      if (salePrice !== null && (isNaN(salePrice) || salePrice <= 0 || salePrice >= basePrice)) {
        throw new Error("İndirimli fiyat, ana fiyattan düşük olmalıdır.");
      }

      if (isNaN(stockQuantity) || stockQuantity < 0) {
        throw new Error("Geçerli bir stok miktarı girin.");
      }

      // Use the admin_create_product RPC function to create a product with a guaranteed unique slug
      const { data: productData, error: productError } = await supabase.rpc('admin_create_product', {
        product_name: formData.name,
        product_slug: slug,
        product_sku: formData.sku || null,
        product_description: formData.description,
        product_base_price: basePrice,
        product_sale_price: salePrice,
        product_stock_quantity: stockQuantity,
        product_category_id: formData.category_id,
        product_is_active: formData.is_active,
        product_is_featured: formData.is_featured
      });

      if (productError) {
        console.error("Error creating product:", productError);
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
              console.log('RLS policy error, attempting direct SQL insert...');

              const { error: sqlError } = await supabase.rpc('admin_insert_product_image', {
                product_id_param: productData,
                image_url_param: publicUrlData.publicUrl,
                is_primary_param: i === primaryImageIndex,
                display_order_param: i,
                alt_text_param: formData.name
              });

              if (sqlError) {
                console.error('Direct SQL insert failed:', sqlError);
                throw sqlError;
              }
            } else {
              throw imageRecordError;
            }
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
      console.error("Error creating product:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kategori *
                  </label>
                  <select
                    name="category_id"
                    id="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
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

                {/* Sale Price */}
                <div>
                  <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    İndirimli Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    name="sale_price"
                    id="sale_price"
                    min="0"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={handleInputChange}
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
    </div>
  );
}
