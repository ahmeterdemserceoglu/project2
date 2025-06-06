"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import Link from "next/link";
import CategoryDragDropProvider from "@/components/admin/CategoryDragDropContext";
import DraggableCategoryItem from "@/components/admin/DraggableCategoryItem";
import { useToast } from "@/contexts/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";

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
  children?: Category[];
};

type BreadcrumbItem = {
  id: string | null;
  name: string;
};

export default function CategoriesPage() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: "Ana Kategoriler" }]);
  
  const supabase = createClientComponentClient();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the categoryId from query params if available
  useEffect(() => {
    const categoryId = searchParams.get('id');
    if (categoryId) {
      setCurrentCategoryId(categoryId);
    } else {
      // If no ID in query params, reset to root
      setCurrentCategoryId(null);
      setBreadcrumbs([{ id: null, name: "Ana Kategoriler" }]);
    }
  }, [searchParams]);
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // When current category changes, update breadcrumbs
  useEffect(() => {
    if (!currentCategoryId) {
      // Reset to root level
      setBreadcrumbs([{ id: null, name: "Ana Kategoriler" }]);
      return;
    }

    if (allCategories.length === 0) return;

    // Update breadcrumbs based on the current category ID
    const newBreadcrumbs: BreadcrumbItem[] = [{ id: null, name: "Ana Kategoriler" }];
    
    // Find the path to the current category
    const findPath = (categories: Category[], targetId: string, path: BreadcrumbItem[] = []): BreadcrumbItem[] | null => {
      for (const category of categories) {
        if (category.id === targetId) {
          return [...path, { id: category.id, name: category.name }];
        }
        
        if (category.children && category.children.length > 0) {
          const childPath = findPath(
            category.children, 
            targetId, 
            [...path, { id: category.id, name: category.name }]
          );
          if (childPath) return childPath;
        }
      }
      return null;
    };
    
    const path = findPath(allCategories, currentCategoryId);
    if (path) {
      setBreadcrumbs([...newBreadcrumbs, ...path]);
    }
  }, [currentCategoryId, allCategories]);
  
  async function fetchCategories() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      // Process categories to create a hierarchical structure
      const categoriesWithHierarchy = buildCategoryHierarchy(data || []);
      setAllCategories(categoriesWithHierarchy);
      
      // Initially expand all categories
      const expanded: Record<string, boolean> = {};
      if (data) {
        data.forEach(cat => {
          expanded[cat.id] = true;
        });
      }
      setExpandedCategories(expanded);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Build hierarchical structure of categories
  function buildCategoryHierarchy(categoriesFlat: Category[]): Category[] {
    const categoriesMap: Record<string, Category> = {};
    const rootCategories: Category[] = [];
    
    // First pass: Create a map of categories by id
    categoriesFlat.forEach(category => {
      categoriesMap[category.id] = { ...category, children: [] };
    });
    
    // Second pass: Build hierarchy
    categoriesFlat.forEach(category => {
      if (category.parent_category_id && categoriesMap[category.parent_category_id]) {
        // This is a child category
        if (!categoriesMap[category.parent_category_id].children) {
          categoriesMap[category.parent_category_id].children = [];
        }
        categoriesMap[category.parent_category_id].children!.push(categoriesMap[category.id]);
      } else {
        // This is a root category
        rootCategories.push(categoriesMap[category.id]);
      }
    });
    
    return rootCategories;
  }
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Navigate into a category
  const navigateToCategory = (categoryId: string) => {
    router.push(`/admin/categories?id=${categoryId}`);
  };

  // Handle category movement (drag and drop)
  const handleCategoryMove = async (sourceId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => {
    try {
      setIsSaving(true);
      
      // Get current category
      const { data: sourceCategory } = await supabase
        .from('categories')
        .select('*')
        .eq('id', sourceId)
        .single();
        
      if (!sourceCategory) {
        throw new Error('Kategori bulunamadı');
      }
      
      let newParentId: string | null = null;
      let newSortOrder: number = 0;
      
      if (position === 'inside' && targetId) {
        // Moving as a child of target
        newParentId = targetId;
        
        // Get last child's sort order or use 0
        const { data: siblings } = await supabase
          .from('categories')
          .select('sort_order')
          .eq('parent_category_id', targetId)
          .order('sort_order', { ascending: false });
          
        newSortOrder = siblings && siblings.length > 0 ? siblings[0].sort_order + 10 : 10;
      } else if (targetId) {
        // Moving before or after a sibling
        const { data: targetCategory } = await supabase
          .from('categories')
          .select('*')
          .eq('id', targetId)
          .single();
          
        if (!targetCategory) {
          throw new Error('Hedef kategori bulunamadı');
        }
        
        // Use the target's parent
        newParentId = targetCategory.parent_category_id;
        
        // If before, use target's sort_order - 5, if after, use target's sort_order + 5
        newSortOrder = position === 'before' 
          ? targetCategory.sort_order - 5 
          : targetCategory.sort_order + 5;
      } else {
        // Moving to root (no target)
        newParentId = null;
        newSortOrder = 5; // Start of the list
      }
      
      // Update the category
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          parent_category_id: newParentId,
          sort_order: newSortOrder
        })
        .eq('id', sourceId);
        
      if (updateError) {
        throw updateError;
      }
      
      showToast('Kategori başarıyla taşındı', 'success');
      
      // Reload categories
      await fetchCategories();
    } catch (error: any) {
      console.error('Error moving category:', error);
      showToast(`Hata: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Get currently visible categories based on navigation
  const visibleCategories = useMemo(() => {
    if (!currentCategoryId) {
      return allCategories; // Root level
    }
    
    // Find the current category in the hierarchy
    const findCategory = (categories: Category[], targetId: string): Category | null => {
      for (const category of categories) {
        if (category.id === targetId) {
          return category;
        }
        
        if (category.children && category.children.length > 0) {
          const result = findCategory(category.children, targetId);
          if (result) return result;
        }
      }
      return null;
    };
    
    const currentCategory = findCategory(allCategories, currentCategoryId);
    return currentCategory?.children || [];
  }, [allCategories, currentCategoryId]);

  // Recursive component to render the category tree
  function CategoryTree({ categories, level = 0 }: { categories: Category[], level?: number }) {
    return (
      <ul className={`pl-${level > 0 ? '6' : '0'} list-none`}>
        {categories.map((category) => {
          const isExpanded = expandedCategories[category.id] ?? false;
          
          return (
            <DraggableCategoryItem
              key={category.id}
              category={category}
              level={level}
              isExpanded={isExpanded}
              onToggle={() => toggleCategory(category.id)}
              onNavigate={() => navigateToCategory(category.id)}
              renderChildren={() => 
                category.children && category.children.length > 0 
                  ? <CategoryTree categories={category.children} level={level + 1} /> 
                  : null
              }
            />
          );
        })}
      </ul>
    );
  }

  return (
    <CategoryDragDropProvider onCategoryMove={handleCategoryMove}>
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
    <div>
        <h1 className="text-2xl font-bold text-white">Kategoriler</h1>
            <p className="text-gray-400 text-sm mt-1">Ürün kategorilerini görüntüleyin ve yönetin</p>
          </div>
          <div className="flex items-center gap-2">
            {currentCategoryId && (
              <Link 
                href={`/admin/categories/new?parent=${currentCategoryId}`} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Alt Kategori Ekle
              </Link>
            )}
        <Link 
          href="/admin/categories/new" 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition flex items-center gap-2"
        >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
          Yeni Kategori Ekle
        </Link>
      </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 bg-dark-lighter p-3 rounded-md mb-4 overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id || 'root'}>
              {index > 0 && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              <button
                onClick={() => router.push(`/admin/categories${crumb.id ? `?id=${crumb.id}` : ''}`)}
                className={`text-sm px-2 py-1 rounded hover:bg-dark-light ${
                  index === breadcrumbs.length - 1 
                    ? 'font-medium text-primary' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
        
        {/* Current category info if we're inside one */}
        {currentCategoryId && breadcrumbs.length > 1 && (
          <div className="bg-gradient-to-r from-dark-lighter to-dark-light p-4 rounded-md mb-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-medium text-white">{breadcrumbs[breadcrumbs.length - 1]?.name}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <Link 
                    href={`/admin/categories/${currentCategoryId}`} 
                    className="text-xs px-2 py-1 bg-primary/20 text-primary hover:bg-primary/30 rounded transition flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Düzenle
                  </Link>
                  <span className="text-xs text-gray-400">
                    {visibleCategories.length} {visibleCategories.length === 1 ? 'alt kategori' : 'alt kategori'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-600 bg-opacity-20 border border-red-600 rounded-md text-white">
          {error}
        </div>
        ) : isSaving ? (
          <div className="fixed top-4 right-4 bg-primary text-white px-4 py-2 rounded-md z-50 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Kaydediliyor...
          </div>
        ) : visibleCategories.length === 0 ? (
          <div className="text-center py-12 bg-dark-lighter rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-lg text-gray-400 mt-4">
              {currentCategoryId 
                ? 'Bu kategoride henüz alt kategori bulunmuyor.' 
                : 'Henüz kategori bulunmuyor.'}
            </p>
            <p className="text-gray-500 mt-2 mb-4">
              {currentCategoryId 
                ? 'Bu kategoriye alt kategoriler ekleyebilirsiniz.' 
                : 'İlk kategorinizi ekleyerek başlayın.'}
            </p>
            <Link 
              href={currentCategoryId ? `/admin/categories/new?parent=${currentCategoryId}` : "/admin/categories/new"} 
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {currentCategoryId ? 'Alt Kategori Ekle' : 'Kategori Ekle'}
            </Link>
        </div>
      ) : (
          <div className="bg-dark rounded-md p-4 shadow-md">
            <p className="text-sm text-gray-400 mb-4">
              {currentCategoryId
                ? 'Alt kategorileri sürükleyip bırakarak yeniden düzenleyebilirsiniz. Kategori detaylarına girmek için kategori adına tıklayın.'
                : 'Kategorileri sürükleyip bırakarak yeniden düzenleyebilirsiniz. Bir kategorinin alt kategorilerine gitmek için kategori adına tıklayın.'}
            </p>
            <CategoryTree categories={visibleCategories} />
        </div>
      )}
    </div>
    </CategoryDragDropProvider>
  );
} 