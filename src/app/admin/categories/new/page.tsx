"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_category_id: string | null;
  image_url: string | null;
  sort_order: number;
};

export default function NewCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parent');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
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
  }, []);
  
  useEffect(() => {
    // Generate slug from name
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
      console.error('Error fetching categories:', error);
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
      setImageFile(null);
      setImagePreview(null);
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
      
      // Create category
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name: formData.name.trim(),
            slug: slug,
            description: formData.description.trim() || null,
            parent_category_id: formData.parent_category_id || null,
            image_url: imageUrl,
            sort_order: parseInt(formData.sort_order || "0"),
          },
        ])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Redirect to categories page
      router.push('/admin/categories');
      
    } catch (error: any) {
      console.error('Error creating category:', error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }
  
  // Build category hierarchy for dropdown
  function buildCategoryOptions(categories: Category[], parentId: string | null = null, level = 0): JSX.Element[] {
    const options: JSX.Element[] = [];
    
    categories
      .filter(category => category.parent_category_id === parentId)
      .forEach(category => {
        // Skip self in dropdown to avoid circular references
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Yeni Kategori Ekle</h1>
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
      
      <form onSubmit={handleSubmit} className="bg-dark-lighter rounded-md p-6">
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
            readOnly
            className="w-full p-2.5 bg-dark-lighter border border-gray-600 rounded-md text-gray-400"
          />
          <p className="mt-1 text-xs text-gray-400">Otomatik oluşturulur</p>
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
            {buildCategoryOptions(categories)}
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
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full p-2.5 bg-dark border border-gray-600 rounded-md text-white"
          />
          
          {imagePreview && (
            <div className="mt-2">
              <p className="mb-1 text-sm text-gray-400">Önizleme:</p>
              <div className="w-40 h-40 flex items-center justify-center border border-gray-600 rounded-md overflow-hidden">
                <img src={imagePreview} alt="Category preview" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          )}
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition disabled:opacity-50"
          >
            {isSaving ? "Kaydediliyor..." : "Kategori Oluştur"}
          </button>
        </div>
      </form>
    </div>
  );
} 