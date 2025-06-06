"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";
import Link from "next/link";
import { logAdminAction } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_category_id: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const categoryId = params.id;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_category_id: "",
    image_url: "",
    sort_order: "0",
  });
  const [slug, setSlug] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCategories();
    fetchCategoryData();
  }, [categoryId]);

  useEffect(() => {
    // Generate slug from name only if it wasn't loaded from the database
    if (formData.name && !slug) {
      setSlug(generateSlug(formData.name));
    }
  }, [formData.name, slug]);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setError(error.message);
    }
  }

  async function fetchCategoryData() {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Kategori bulunamadı');
      }

      setFormData({
        name: data.name,
        description: data.description || "",
        parent_category_id: data.parent_category_id || "",
        image_url: data.image_url || "",
        sort_order: data.sort_order.toString(),
      });

      setSlug(data.slug);

      if (data.image_url) {
        setImagePreview(data.image_url);
      }

    } catch (error: any) {
      console.error('Error fetching category:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError(null);

      if (!formData.name.trim()) {
        throw new Error("Kategori adı gereklidir");
      }

      let imageUrl = formData.image_url;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('category_images')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('category_images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Update category
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: formData.name.trim(),
          slug: slug,
          description: formData.description.trim() || null,
          parent_category_id: formData.parent_category_id || null,
          image_url: imageUrl,
          sort_order: parseInt(formData.sort_order || "0"),
        })
        .eq('id', categoryId)
        .select();

      if (error) {
        throw error;
      }

      const { data: { session: logSession } } = await supabase.auth.getSession();
      if (logSession) {
        await logAdminAction(
          supabase,
          logSession.user.id,
          'update',
          'category',
          categoryId,
          { name: formData.name }
        );
      }

      // Redirect to categories page
      router.push('/admin/categories');

    } catch (error: any) {
      console.error('Error updating category:', error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      setError(null);

      // Check for products using this category
      const { data: productsUsingCategory, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', categoryId)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (productsUsingCategory && productsUsingCategory.length > 0) {
        throw new Error('Bu kategori ürünler tarafından kullanılıyor. Önce ürünleri başka bir kategoriye taşıyın.');
      }

      // Delete category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        throw error;
      }

      const { data: { session: logSession } } = await supabase.auth.getSession();
      if (logSession) {
        await logAdminAction(
          supabase,
          logSession.user.id,
          'delete',
          'category',
          categoryId,
          { name: formData.name }
        );
      }

      // Redirect to categories page
      router.push('/admin/categories');

    } catch (error: any) {
      console.error('Error deleting category:', error);
      setError(error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  // Build category hierarchy for dropdown
  function buildCategoryOptions(categories: Category[], parentId: string | null = null, level = 0): JSX.Element[] {
    const options: JSX.Element[] = [];

    categories
      .filter(category => category.parent_category_id === parentId)
      .forEach(category => {
        // Skip self and children in dropdown to avoid circular references
        if (category.id !== categoryId) {
          const indent = "—".repeat(level);
          options.push(
            <option key={category.id} value={category.id}>
              {indent} {category.name}
            </option>
          );

          // Don't include children of this category to avoid circular references
          if (category.id !== categoryId) {
            options.push(...buildCategoryOptions(categories, category.id, level + 1));
          }
        }
      });

    return options;
  }

  // Check if category is ancestor of another category
  function isAncestorOf(categoryId: string, potentialDescendantId: string): boolean {
    const descendant = categories.find(c => c.id === potentialDescendantId);
    if (!descendant) return false;

    if (descendant.parent_category_id === categoryId) return true;

    if (descendant.parent_category_id) {
      return isAncestorOf(categoryId, descendant.parent_category_id);
    }

    return false;
  }

  const filteredCategories = categories.filter(c => {
    // Filter out self and all descendants to prevent circular references
    return c.id !== categoryId && !isAncestorOf(categoryId, c.id);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Kategori Düzenle</h1>
        <Link
          href="/admin/categories"
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
        >
          Geri Dön
        </Link>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-600 bg-opacity-20 border border-red-600 rounded-md text-white">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="bg-dark-lighter rounded-md p-6 mb-6">
            {/* Category name */}
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-white">
                Kategori Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2.5 bg-dark border border-gray-600 rounded-md text-white"
              />
            </div>

            {/* Slug */}
            <div className="mb-4">
              <label htmlFor="slug" className="block mb-2 text-sm font-medium text-white">
                Slug (URL)
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={handleSlugChange}
                className="w-full p-2.5 bg-dark border border-gray-600 rounded-md text-white"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-white">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2.5 bg-dark border border-gray-600 rounded-md text-white"
              ></textarea>
            </div>

            {/* Parent category */}
            <div className="mb-4">
              <label htmlFor="parent_category_id" className="block mb-2 text-sm font-medium text-white">
                Üst Kategori
              </label>
              <select
                id="parent_category_id"
                name="parent_category_id"
                value={formData.parent_category_id}
                onChange={handleChange}
                className="w-full p-2.5 bg-dark border border-gray-600 rounded-md text-white"
              >
                <option value="">Ana Kategori (Üst yok)</option>
                {buildCategoryOptions(filteredCategories)}
              </select>
            </div>

            {/* Sort order */}
            <div className="mb-4">
              <label htmlFor="sort_order" className="block mb-2 text-sm font-medium text-white">
                Sıralama
              </label>
              <input
                type="number"
                id="sort_order"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                className="w-full p-2.5 bg-dark border border-gray-600 rounded-md text-white"
              />
            </div>

            {/* Image upload */}
            <div className="mb-6">
              <label htmlFor="image" className="block mb-2 text-sm font-medium text-white">
                Kategori Görseli
              </label>

              {imagePreview && (
                <div className="mb-3">
                  <p className="mb-1 text-sm text-gray-400">Mevcut Görsel:</p>
                  <div className="w-40 h-40 flex items-center justify-center border border-gray-600 rounded-md overflow-hidden">
                    <img src={imagePreview} alt="Category image" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              )}

              <input
                type="file"
                id="image"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full p-2.5 bg-dark border border-gray-600 rounded-md text-white"
              />
              <p className="mt-1 text-xs text-gray-400">Yeni bir görsel yüklemek için seçin</p>
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition disabled:opacity-50"
              >
                {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </form>

          {/* Delete section */}
          <div className="bg-dark-lighter rounded-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Kategoriyi Sil</h2>
            <p className="text-gray-300 mb-4">
              Bu işlem geri alınamaz. Kategoriyi silmek için aşağıdaki butona tıklayın.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Kategoriyi Sil
              </button>
            ) : (
              <div className="border border-red-600 rounded-md p-4">
                <p className="text-white mb-3">
                  <strong>Bu kategoriyi silmek istediğinize emin misiniz?</strong> Bu işlem geri alınamaz.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isDeleting ? "Siliniyor..." : "Evet, Sil"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-5 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
