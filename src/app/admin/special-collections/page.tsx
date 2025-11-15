"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SimplifiedImage } from "@/components/ui/simplified-image";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTh, FaList, FaStar, FaEye, FaEyeSlash, FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { toast } from "sonner";

interface SpecialCollection {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  image_url: string | null;
  badge: string | null;
  badge_color: string | null;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export default function SpecialCollectionsPage() {
  const [collections, setCollections] = useState<SpecialCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/admin/special-collections");
      if (!response.ok) throw new Error("Failed to fetch collections");
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      toast.error("Koleksiyonlar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Derived list: filter + sort
  const displayed = (() => {
    let list = [...collections];
    // filter by status
    if (statusFilter === 'active') list = list.filter(c => c.is_active);
    if (statusFilter === 'inactive') list = list.filter(c => !c.is_active);
    // filter by query
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      );
    }
    // sort
    list.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
    });
    return list;
  })();

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, sortBy]);

  // Pagination calculations
  const total = displayed.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paged = displayed.slice(startIndex, endIndex);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/special-collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update collection");
      
      toast.success("Koleksiyon durumu güncellendi");
      fetchCollections();
    } catch (error) {
      toast.error("Durum güncellenirken hata oluştu");
    }
  };

  const deleteCollection = async (id: string) => {
    if (!confirm("Bu koleksiyonu silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/admin/special-collections/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete collection");
      
      toast.success("Koleksiyon silindi");
      fetchCollections();
    } catch (error) {
      toast.error("Koleksiyon silinirken hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Koleksiyonlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Özel Koleksiyonlar</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Özel koleksiyonlarınızı yönetin ve düzenleyin</p>
          </div>
          <Link href="/admin/special-collections/new">
            <Button className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              <FaPlus className="mr-2" size={14} />
              Yeni Koleksiyon
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-max">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ara</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Başlık, slug, açıklama"
                  className="w-full pl-8 pr-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Durum</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Tümü</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sırala</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="title">Ada göre</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sayfa Boyutu</label>
                <select
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm"
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                >
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Görünüm</label>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                  <button 
                    onClick={() => setViewMode('card')}
                    className={`flex-1 px-2 py-1 text-xs rounded ${viewMode === 'card' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    Kart
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-2 py-1 text-xs rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    Liste
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="lg:col-span-9">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FaStar className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam (Filtreli)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayed.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FaEye className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayed.filter(c => c.is_active).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <FaEyeSlash className="text-gray-600 dark:text-gray-400" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pasif</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayed.filter(c => !c.is_active).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {displayed.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                  <FaStar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz koleksiyon yok
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                  İlk özel koleksiyonunuzu oluşturarak başlayın
                </p>
                <Link href="/admin/special-collections/new">
                  <Button className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium">
                    <FaPlus className="mr-2" size={16} />
                    İlk Koleksiyonunuzu Oluşturun
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-6">
                {/* Top Row: Count and View Toggle */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400">{total} koleksiyon bulundu • {startIndex + 1}-{endIndex} gösteriliyor</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Görünüm:</span>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      <button 
                        onClick={() => setViewMode('card')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center space-x-1 ${viewMode === 'card' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                      >
                        <FaTh size={12} />
                        <span>Kart</span>
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center space-x-1 ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                      >
                        <FaList size={12} />
                        <span>Liste</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collections Display */}
                {viewMode === 'card' ? (
                  /* Card View */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paged.map((collection) => (
                      <div key={collection.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-lg">
                        {/* Collection Image */}
                        <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
                          {collection.image_url ? (
                            <SimplifiedImage
                              src={collection.image_url}
                              alt={collection.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm">
                              <FaStar className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                          
                          {/* Badge */}
                          {collection.badge && (
                            <div 
                              className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg"
                              style={{ backgroundColor: collection.badge_color || '#6B7280' }}
                            >
                              {collection.badge}
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                            collection.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {collection.is_active ? 'Aktif' : 'Pasif'}
                          </div>

                          {/* Quick Actions Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/admin/special-collections/${collection.id}`}
                                className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg shadow-sm transition-colors"
                                title="Düzenle"
                              >
                                <FaEdit size={14} />
                              </Link>
                              <button
                                onClick={() => toggleActive(collection.id, collection.is_active)}
                                className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg shadow-sm transition-colors"
                                title={collection.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                              >
                                {collection.is_active ? <FaToggleOn size={14} /> : <FaToggleOff size={14} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Collection Info */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 flex-1">
                              {collection.title}
                            </h3>
                          </div>
                          
                          {collection.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                              {collection.description}
                            </p>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/${collection.slug}`}
                                target="_blank"
                                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                              >
                                Görüntüle
                              </Link>
                              <Link
                                href={`/admin/special-collections/${collection.id}/products`}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                Ürünler
                              </Link>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => deleteCollection(collection.id)}
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
                              Koleksiyon
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Açıklama
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Badge
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Durum
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              İşlemler
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {paged.map((collection) => (
                            <tr key={collection.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 w-12 h-12">
                                    {collection.image_url ? (
                                      <SimplifiedImage 
                                        src={collection.image_url} 
                                        alt={collection.title}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                        <FaStar className="w-5 h-5 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {collection.title}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      /{collection.slug}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                  {collection.description || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {collection.badge ? (
                                  <span 
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: collection.badge_color || '#6B7280' }}
                                  >
                                    {collection.badge}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => toggleActive(collection.id, collection.is_active)}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                    collection.is_active
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                  }`}
                                >
                                  {collection.is_active ? (
                                    <>
                                      <FaToggleOn className="mr-1" size={12} />
                                      Aktif
                                    </>
                                  ) : (
                                    <>
                                      <FaToggleOff className="mr-1" size={12} />
                                      Pasif
                                    </>
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <Link
                                    href={`/admin/special-collections/${collection.id}`}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Düzenle"
                                  >
                                    <FaEdit size={14} />
                                  </Link>
                                  <Link
                                    href={`/admin/special-collections/${collection.id}/products`}
                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                    title="Ürünleri Yönet"
                                  >
                                    <FaPlus size={14} />
                                  </Link>
                                  <Link
                                    href={`/${collection.slug}`}
                                    target="_blank"
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                    title="Görüntüle"
                                  >
                                    <FaEye size={14} />
                                  </Link>
                                  <button
                                    onClick={() => deleteCollection(collection.id)}
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
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {startIndex + 1}-{endIndex} / {total}
                    </div>
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
          </div>
        </section>
      </div>
    </div>
  );
}