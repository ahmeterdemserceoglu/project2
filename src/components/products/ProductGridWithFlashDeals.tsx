"use client";

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Grid3X3 } from 'lucide-react';

interface ProductWithFlashDeal {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  imageUrl: string;
  categoryName?: string;
  isFeatured?: boolean;
  createdAt?: string;
  stock?: number | string;
  stock_quantity?: number | string;
  isFlashDeal: boolean;
  flashDeal?: {
    id: string;
    title: string;
    description?: string;
    discountPercent: number;
    startTime: string;
    endTime: string;
    remainingSeconds: number;
  };
}

interface ProductGridProps {
  initialProducts?: ProductWithFlashDeal[];
  searchParams?: {
    category?: string;
    search?: string;
    flash_deals_only?: string;
    page?: string;
  };
}

export default function ProductGridWithFlashDeals({
  initialProducts = [],
  searchParams = {}
}: ProductGridProps) {
  const [products, setProducts] = useState<ProductWithFlashDeal[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);

  const fetchProducts = async (pageNum: number = 1, append: boolean = false) => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        ...searchParams
      });

      const response = await fetch(`/api/products-with-flash-deals?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      if (append) {
        setProducts(prev => [...prev, ...data.data]);
      } else {
        setProducts(data.data);
      }

      setTotalPages(data.pagination.totalPages);
      setHasMore(pageNum < data.pagination.totalPages);

    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when search params change
  useEffect(() => {
    if (initialProducts.length === 0) {
      fetchProducts(1, false);
    }
  }, [searchParams]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Ürünler yükleniyor...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Gösterilecek ürün bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
 


      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => {
          const s = Number(product.stock ?? (product as any).stock_quantity ?? 0);
          const stockAvailable = Number.isFinite(s) ? s : 0;
          return (
          <div key={product.id} className="relative">
            {/* Flash Deal Badge - Dışarıda */}
            {product.isFlashDeal && product.flashDeal && (
              <div className="absolute -top-3 -right-3 z-50 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce">
                %{product.flashDeal.discountPercent} İndirim
              </div>
            )}

            <ProductCard
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              salePrice={product.salePrice}
              imageUrl={product.imageUrl || '/images/placeholder.png'}
              categoryName={product.categoryName}
              isFeatured={product.isFeatured}
              createdAt={product.createdAt}
              stock={stockAvailable}
            />
          </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="px-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Yükleniyor...
              </>
            ) : (
              'Daha Fazla Ürün Yükle'
            )}
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      <div className="text-center text-sm text-gray-500">
        Sayfa {page} / {totalPages} - Toplam {products.length} ürün
      </div>
    </div>
  );
}