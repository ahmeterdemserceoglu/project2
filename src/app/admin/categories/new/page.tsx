"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";
import { Database, Tables } from "@/lib/database.types";
import Link from "next/link";
import { logAdminAction } from "@/lib/utils";
import { FaArrowLeft, FaImage, FaTimes, FaFolder, FaFolderOpen, FaGripVertical } from "react-icons/fa";

type Category = Tables<'categories'>;

export default function NewCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parent');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [isSubcategory, setIsSubcategory] = useState<boolean>(!!parentId);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [path, setPath] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_category_id: parentId || "",
    image_url: "",
    sort_order: "0",
  });
  const [slug, setSlug] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCategories();
    if (parentId) {
      fetchParentCategory();
    }
  }, [parentId]);

  useEffect(() => {
    setSlug(generateSlug(formData.name));
  }, [formData.name]);

  async function fetchCategories() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function getCategoryPath(id: string | null): string {
    if (!id) return "";
    const cat = categories.find(c => c.id === id);
    if (!cat) return "";
    const parentPath = getCategoryPath(cat.parent_category_id);
    return parentPath ? `${parentPath} > ${cat.name}` : cat.name;
  }

  function getBreadcrumb() {
    const crumb: { id: string | null; name: string }[] = [{ id: null, name: 'Ana Kategoriler' }];
    const currentPath: string[] = [];
    for (const id of path) {
      currentPath.push(id);
      const cat = categories.find(c => c.id === id);
      if (cat) {
        crumb.push({ id: cat.id, name: cat.name });
      }
    }
    return crumb;
  }

  function selectParentCategory(id: string) {
    setFormData(prev => ({ ...prev, parent_category_id: id }));
    setModalOpen(false);
    setPath([]);
    setSearch("");
  }

  async function fetchParentCategory() {
    if (!parentId) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', parentId)
        .single();

      if (error) throw error;
      setParentCategory(data);
    } catch (error: any) {
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
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    const file = e.target.files[0];
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
      .replace(/[^a-z0-9\\s-]/g, '')
      .replace(/\\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError(null);

      if (!formData.name.trim()) {
        throw new Error("Kategori adı gereklidir");
      }
      if (isSubcategory && !formData.parent_category_id) {
        throw new Error("Alt kategori için bir üst kategori seçmelisiniz");
      }

      let imageUrl = formData.image_url;

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

      const { data: newCategoryId, error } = await (supabase as any).rpc('admin_create_category', {
        p_name: formData.name.trim(),
        p_slug: slug,
        p_description: formData.description.trim() || null,
        p_parent_category_id: formData.parent_category_id || null,
        p_image_url: imageUrl || null,
        p_sort_order: parseInt(formData.sort_order || "0"),
      });

      if (error) {
        throw error;
      }
      if (newCategoryId) {
        const { data: { session: logSession } } = await supabase.auth.getSession();
        if (logSession) {
          await logAdminAction(
            supabase,
            logSession.user.id,
            'create',
            'category',
            newCategoryId as string,
            { name: formData.name.trim() }
          );
        }
      }

      router.push('/admin/categories');

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  function buildCategoryOptions(categories: Category[], parentId: string | null = null, level = 0): JSX.Element[] {
    const options: JSX.Element[] = [];

    categories
      .filter(category => category.parent_category_id === parentId)
      .forEach(category => {
        if (category.id !== parentId) {
          const indent = "—".repeat(level);
          options.push(
            <option key={category.id} value={category.id}>
              {indent} {category.name}
            </option>
          );

          options.push(...buildCategoryOptions(categories, category.id, level + 1));
        }
      });

    return options;
  }

  const selectedParentName = formData.parent_category_id
    ? getCategoryPath(formData.parent_category_id) || "Üst kategori seçin"
    : "Üst kategori seçin";

  const currentCategoryId = path.length > 0 ? path[path.length - 1] : null;
  const subCategories = categories.filter(c => c.parent_category_id === currentCategoryId);
  const filteredCategories = categories.filter(c =>
    getCategoryPath(c.id).toLowerCase().includes(search.toLowerCase())
  );

  const breadcrumb = getBreadcrumb();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {parentCategory ? `${parentCategory.name} - Alt Kategori Ekle` : 'Yeni Kategori Ekle'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {parentCategory ? 'Seçili kategoriye alt kategori ekleyin' : 'Yeni bir kategori oluşturun'}
          </p>
        </div>

        <Link
          href="/admin/categories"
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <FaArrowLeft className="mr-2" size={14} />
          Geri Dön
        </Link>
      </div>

      {/* Parent Category Info */}
      {parentCategory && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FaFolder className="text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Üst Kategori</h3>
              <p className="text-blue-700 dark:text-blue-300">{parentCategory.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Hata</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Kategori adını girin"
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  placeholder="Otomatik oluşturulur"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Kategori adından otomatik oluşturulur</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Kategori açıklaması (opsiyonel)"
              />
            </div>
          </div>

          {/* Category Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Kategori Ayarları</h3>

            <div className="space-y-6">
              {/* Category Type */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Kategori Tipi
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="relative flex items-center p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      className="sr-only"
                      name="category_type"
                      checked={!isSubcategory}
                      onChange={() => {
                        setIsSubcategory(false);
                        setFormData(prev => ({ ...prev, parent_category_id: "" }));
                      }}
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${!isSubcategory ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                      {!isSubcategory && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Ana Kategori</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Üst seviye kategori oluştur</div>
                    </div>
                    <FaFolder className="text-gray-400 ml-2" />
                  </label>

                  <label className="relative flex items-center p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      className="sr-only"
                      name="category_type"
                      checked={isSubcategory}
                      onChange={() => setIsSubcategory(true)}
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${isSubcategory ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                      {isSubcategory && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Alt Kategori</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Mevcut kategorinin altında oluştur</div>
                    </div>
                    <FaFolderOpen className="text-gray-400 ml-2" />
                  </label>
                </div>
              </div>

              {/* Parent Category Selection */}
              {isSubcategory && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                    <FaFolder className="inline mr-2" />
                    Üst Kategori Seçimi
                  </label>
                  <div className="space-y-3">
                    <div className="flex rounded-lg overflow-hidden border border-blue-300 dark:border-blue-600">
                      <input
                        type="text"
                        value={selectedParentName}
                        readOnly
                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-0 focus:ring-0"
                        placeholder="Üst kategori seçin..."
                      />
                      <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="px-6 py-3 bg-primary text-white hover:bg-primary-dark transition-colors font-medium"
                      >
                        Seç
                      </button>
                    </div>
                    {formData.parent_category_id && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, parent_category_id: "" }))}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                      >
                        ✕ Seçimi temizle (Ana kategori olarak oluştur)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sort Order */}
                <div>
                  <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sıralama Önceliği
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="sort_order"
                      name="sort_order"
                      value={formData.sort_order}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0"
                      min="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FaGripVertical className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Düşük sayılar önce görünür (0 = en üstte)
                  </p>
                </div>

                {/* URL Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL Önizleme
                  </label>
                  <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm">
                    <span className="text-gray-400">/categories/</span>
                    <span className="font-medium">{slug || 'kategori-adi'}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Kategori adından otomatik oluşturulur
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Kategori Görseli</h3>

            <div className="space-y-4">
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <div className="text-center">
                    <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="image" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          Görsel yüklemek için tıklayın
                        </span>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF dosyaları desteklenir
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={imagePreview}
                          alt="Kategori görseli önizleme"
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Görsel yüklendi
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {imageFile?.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/categories"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Kaydediliyor..." : "Kategori Oluştur"}
            </button>
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
                  <FaFolder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Üst Kategori Seçin</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Yeni kategorinizin yerleştirileceği üst kategoriyi seçin</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5" />
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
                          <FaFolder className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{cat.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{getCategoryPath(cat.id)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => selectParentCategory(cat.id)}
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
                          className={`px-3 py-1 rounded-lg transition-colors ${index === breadcrumb.length - 1
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
                            <div className="font-medium text-green-900 dark:text-green-100">Bu konuma yerleştir</div>
                            <div className="text-sm text-green-700 dark:text-green-300">Mevcut kategori: {breadcrumb[breadcrumb.length - 1]?.name}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => selectParentCategory(currentCategoryId)}
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
                            <FaFolder className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{cat.name}</div>
                              {cat.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">{cat.description}</div>
                              )}
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
                          <FaFolder className="w-8 h-8 text-gray-400" />
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
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, parent_category_id: "" }));
                  setModalOpen(false);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Ana Kategori Olarak Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}