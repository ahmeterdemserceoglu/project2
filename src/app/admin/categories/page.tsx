"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";
import { FaFolder, FaFolderOpen, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaList, FaTh, FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Category = Database['public']['Tables']['categories']['Row'] & { children?: Category[] };

type BreadcrumbItem = {
  id: string | null;
  name: string;
};

export default function CategoriesPage() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: "Ana Kategoriler" }]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const supabase = createClientComponentClient();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const categoryId = searchParams.get('id');
    if (categoryId) {
      setCurrentCategoryId(categoryId);
    } else {
      setCurrentCategoryId(null);
      setBreadcrumbs([{ id: null, name: "Ana Kategoriler" }]);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!currentCategoryId) {
      setBreadcrumbs([{ id: null, name: "Ana Kategoriler" }]);
      return;
    }

    if (allCategories.length === 0) return;

    const newBreadcrumbs: BreadcrumbItem[] = [{ id: null, name: "Ana Kategoriler" }];

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

  // Reset pagination when current category changes
  useEffect(() => {
    setPage(1);
  }, [currentCategoryId]);

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

      const categoriesWithHierarchy = buildCategoryHierarchy(data || []);
      setAllCategories(categoriesWithHierarchy);

      const expanded: Record<string, boolean> = {};
      (categoriesWithHierarchy || []).forEach(root => { expanded[root.id] = true; });
      setExpandedCategories(expanded);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function buildCategoryHierarchy(categoriesFlat: Category[]): Category[] {
    const categoriesMap: Record<string, Category> = {};
    const rootCategories: Category[] = [];

    categoriesFlat.forEach(category => {
      categoriesMap[category.id] = { ...category, children: [] };
    });

    categoriesFlat.forEach(category => {
      if (category.parent_category_id && categoriesMap[category.parent_category_id]) {
        if (!categoriesMap[category.parent_category_id].children) {
          categoriesMap[category.parent_category_id].children = [];
        }
        categoriesMap[category.parent_category_id].children!.push(categoriesMap[category.id]);
      } else {
        rootCategories.push(categoriesMap[category.id]);
      }
    });

    return rootCategories;
  }

  const flattenCategories = useCallback((nodes: Category[]): Category[] => {
    const result: Category[] = [];
    const stack: Category[] = [...nodes];
    while (stack.length) {
      const node = stack.shift()!;
      result.push(node);
      if (node.children && node.children.length > 0) {
        stack.unshift(...node.children);
      }
    }
    return result;
  }, []);

  const allCategoriesFlat = useMemo(() => flattenCategories(allCategories), [allCategories, flattenCategories]);

  function getCategoryPathById(targetId: string): string {
    const pathNames: string[] = [];
    const dfs = (nodes: Category[], trail: string[]): boolean => {
      for (const node of nodes) {
        const nextTrail = [...trail, node.name];
        if (node.id === targetId) {
          pathNames.push(...nextTrail);
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (dfs(node.children, nextTrail)) return true;
        }
      }
      return false;
    };
    dfs(allCategories, []);
    return pathNames.join(' > ');
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    allCategoriesFlat.forEach(c => { next[c.id] = true; });
    setExpandedCategories(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    allCategories.forEach(root => { next[root.id] = true; });
    setExpandedCategories(next);
  };

  const navigateToCategory = (categoryId: string) => {
    router.push(`/admin/categories?id=${categoryId}`);
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      showToast('Kategori başarıyla silindi', 'success');
      fetchCategories();
    } catch (error: any) {
      showToast(`Hata: ${error.message}`, 'error');
    }
  };

  const visibleCategories = useMemo(() => {
    if (!currentCategoryId) {
      return allCategories;
    }

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

  // Pagination derived values
  const total = visibleCategories.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paged = visibleCategories.slice(startIndex, endIndex);

  const CategoryTreeItem = ({ category, level = 0 }: { category: Category, level?: number }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories[category.id] ?? false;
    const indent = level * 16; // 16px per level

    return (
      <div className="select-none">
        <div
          className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
          style={{ paddingLeft: `${12 + indent}px` }}
        >
          <div className="w-4 flex items-center justify-center mr-2">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category.id);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label={isExpanded ? 'Daralt' : 'Genişlet'}
              >
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <div className="w-3 h-3" />
            )}
          </div>

          <div className="w-4 h-4 mr-2 flex items-center justify-center">
            {hasChildren ? (
              isExpanded ? <FaFolderOpen className="text-blue-500" size={14} /> : <FaFolder className="text-blue-500" size={14} />
            ) : (
              <FaFolder className="text-gray-400" size={14} />
            )}
          </div>

          <button
            onClick={() => navigateToCategory(category.id)}
            className="flex-1 text-left text-sm text-gray-700 dark:text-gray-200 hover:text-primary transition-colors truncate"
            title={category.name}
          >
            {category.name}
          </button>

          {(category.children?.length ?? 0) > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-xs text-gray-600 dark:text-gray-300 rounded">
              {category.children?.length}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="overflow-hidden">
            {category.children!.map((child) => (
              <CategoryTreeItem key={child.id} category={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kategoriler</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Ürün kategorilerinizi yönetin ve düzenleyin
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {currentCategoryId && (
            <button
              onClick={() => router.push('/admin/categories')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FaArrowLeft className="mr-2" size={14} />
              Ana Kategoriler
            </button>
          )}

          <Link
            href={currentCategoryId ? `/admin/categories/new?parent=${currentCategoryId}` : "/admin/categories/new"}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <FaPlus className="mr-2" size={14} />
            {currentCategoryId ? 'Alt Kategori Ekle' : 'Yeni Kategori'}
          </Link>

          {/* Page size selector */}
          <div className="hidden sm:flex items-center ml-2">
            <label className="mr-2 text-sm text-gray-600 dark:text-gray-400">Sayfa:</label>
            <select
              className="px-2 py-1 border rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm"
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.id || 'root'} className="inline-flex items-center">
                {index > 0 && (
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <button
                  onClick={() => router.push(`/admin/categories${crumb.id ? `?id=${crumb.id}` : ''}`)}
                  className={`ml-1 text-sm font-medium transition-colors ${index === breadcrumbs.length - 1
                    ? 'text-primary cursor-default'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                  {crumb.name}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FaFolder className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Kategori</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allCategories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FaFolderOpen className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Görüntülenen</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{visibleCategories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FaEdit className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Seviye</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{breadcrumbs.length - 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Kategoriler yükleniyor...</span>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
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
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar - Tree View */}
            <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Kategori ara..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Tree Controls */}
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ağaç Görünümü</div>
                  <div className="flex space-x-1">
                    <button
                      onClick={expandAll}
                      className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Tümünü Aç
                    </button>
                    <button
                      onClick={collapseAll}
                      className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Daralt
                    </button>
                  </div>
                </div>

                {/* Tree Content */}
                <div className="max-h-[60vh] overflow-auto">
                  {searchTerm.trim() ? (
                    <div className="space-y-1">
                      {allCategoriesFlat
                        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .slice(0, 50)
                        .map(c => (
                          <button
                            key={c.id}
                            onClick={() => navigateToCategory(c.id)}
                            className="w-full text-left p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-200 hover:text-primary"
                          >
                            <div className="truncate">{getCategoryPathById(c.id)}</div>
                          </button>
                        ))}
                      {allCategoriesFlat.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                        <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                          Arama sonucu bulunamadı
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {allCategories.map(category => (
                        <CategoryTreeItem key={category.id} category={category} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6">
              {visibleCategories.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                    <FaFolder className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {currentCategoryId ? 'Alt kategori bulunmuyor' : 'Henüz kategori yok'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                    {currentCategoryId
                      ? 'Bu kategoriye alt kategoriler ekleyerek başlayın.'
                      : 'İlk kategorinizi oluşturarak e-ticaret sitenizi organize etmeye başlayın.'}
                  </p>
                  <Link
                    href={currentCategoryId ? `/admin/categories/new?parent=${currentCategoryId}` : "/admin/categories/new"}
                    className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                  >
                    <FaPlus className="mr-2" size={16} />
                    {currentCategoryId ? 'Alt Kategori Ekle' : 'İlk Kategorinizi Oluşturun'}
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* View Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{total} kategori bulundu • {total > 0 ? `${startIndex + 1}-${endIndex}` : '0-0'} gösteriliyor</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Görünüm:</span>
                      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('card')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center space-x-1 ${viewMode === 'card'
                              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                          <FaTh size={12} />
                          <span>Kart</span>
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center space-x-1 ${viewMode === 'list'
                              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                          <FaList size={12} />
                          <span>Liste</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Categories Display */}
                  {viewMode === 'card' ? (
                    /* Card View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paged.map((category) => (
                        <div key={category.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-lg">
                          {/* Category Image/Icon */}
                          <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
                            {category.image_url ? (
                              <img
                                src={category.image_url}
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm">
                                <FaFolder className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                              </div>
                            )}

                            {/* Quick Actions Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex items-center space-x-2">
                                <Link
                                  href={`/admin/categories/${category.id}`}
                                  className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg shadow-sm transition-colors"
                                  title="Düzenle"
                                >
                                  <FaEdit size={14} />
                                </Link>
                                <button
                                  onClick={() => navigateToCategory(category.id)}
                                  className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg shadow-sm transition-colors"
                                  title="Görüntüle"
                                >
                                  <FaFolder size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Sub-category count badge */}
                            {(category.children?.length ?? 0) > 0 && (
                              <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                                {category.children?.length}
                              </div>
                            )}
                          </div>

                          {/* Category Info */}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 flex-1">
                                {category.name}
                              </h3>
                            </div>

                            {category.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                {category.description}
                              </p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                              <button
                                onClick={() => navigateToCategory(category.id)}
                                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                              >
                                Görüntüle
                              </button>

                              <div className="flex items-center space-x-1">
                                <Link
                                  href={`/admin/categories/new?parent=${category.id}`}
                                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                                  title="Alt kategori ekle"
                                >
                                  <FaPlus size={12} />
                                </Link>
                                <button
                                  onClick={() => deleteCategory(category.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                  title="Sil"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* List View */
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Kategori
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Açıklama
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Alt Kategoriler
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                İşlemler
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {paged.map((category) => (
                              <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 w-10 h-10">
                                      {category.image_url ? (
                                        <img
                                          src={category.image_url}
                                          alt={category.name}
                                          className="w-10 h-10 rounded-lg object-cover"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                          <FaFolder className="w-5 h-5 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="ml-4">
                                      <button
                                        onClick={() => navigateToCategory(category.id)}
                                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
                                      >
                                        {category.name}
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                    {category.description || '-'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                    {category.children?.length ?? 0} alt kategori
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex items-center justify-end space-x-2">
                                    <Link
                                      href={`/admin/categories/${category.id}`}
                                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                      title="Düzenle"
                                    >
                                      <FaEdit size={14} />
                                    </Link>
                                    <Link
                                      href={`/admin/categories/new?parent=${category.id}`}
                                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                      title="Alt kategori ekle"
                                    >
                                      <FaPlus size={14} />
                                    </Link>
                                    <button
                                      onClick={() => deleteCategory(category.id)}
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                      title="Sil"
                                    >
                                      <FaTrash size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {total > pageSize && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{startIndex + 1}-{endIndex} / {total}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm disabled:opacity-50"
                          aria-label="Önceki sayfa"
                        >
                          <FaChevronLeft className="mr-1" /> Önceki
                        </button>
                        <div className="text-sm">{page} / {totalPages}</div>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm disabled:opacity-50"
                          aria-label="Sonraki sayfa"
                        >
                          Sonraki <FaChevronRight className="ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}