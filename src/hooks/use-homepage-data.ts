import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product, Collection } from '@/app/page';

interface HomepageData {
  featuredProducts: Product[];
  specialCollections: Collection[];
  flashDeals: any[];
}

interface UseHomepageDataReturn {
  data: HomepageData;
  loading: {
    featured: boolean;
    collections: boolean;
    flashDeals: boolean;
  };
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHomepageData(): UseHomepageDataReturn {
  const [data, setData] = useState<HomepageData>({
    featuredProducts: [],
    specialCollections: [],
    flashDeals: []
  });
  
  const [loading, setLoading] = useState({
    featured: true,
    collections: true,
    flashDeals: true
  });
  
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(prev => ({ ...prev, featured: true }));
      
      const response = await fetch("/api/featured-products-with-flash-deals");
      if (!response.ok) throw new Error('Failed to fetch featured products');
      
      const result = await response.json();
      setData(prev => ({ ...prev, featuredProducts: result.data || [] }));
    } catch (err) {
      
      // Fallback to direct Supabase query
      try {
        const supabase = createClient();
        const { data: products, error } = await supabase
          .from("products")
          .select(`
            id, name, slug, base_price, sale_price, primary_image_url,
            categories!inner(name), is_featured
          `)
          .eq("is_featured", true)
          .eq("is_active", true)
          .limit(8);

        if (error) throw error;
        
        const formattedProducts = products?.map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          base_price: product.base_price,
          sale_price: product.sale_price,
          primary_image_url: product.primary_image_url,
          is_featured: product.is_featured,
          category_name: product.categories?.name || ""
        })) || [];
        
        setData(prev => ({ ...prev, featuredProducts: formattedProducts }));
      } catch (fallbackErr) {
        setError('Failed to load featured products');
      }
    } finally {
      setLoading(prev => ({ ...prev, featured: false }));
    }
  };

  const fetchSpecialCollections = async () => {
    try {
      setLoading(prev => ({ ...prev, collections: true }));
      
      const response = await fetch("/api/special-collections");
      if (!response.ok) throw new Error('Failed to fetch special collections');
      
      const collections = await response.json();
      setData(prev => ({ ...prev, specialCollections: collections || [] }));
    } catch (err) {
      console.error('Error fetching special collections:', err);
      setData(prev => ({ ...prev, specialCollections: [] }));
    } finally {
      setLoading(prev => ({ ...prev, collections: false }));
    }
  };

  const fetchFlashDeals = async () => {
    try {
      setLoading(prev => ({ ...prev, flashDeals: true }));
      
      const response = await fetch("/api/flash-deals");
      if (!response.ok) throw new Error('Failed to fetch flash deals');
      
      const result = await response.json();
      const activeDeals = result.data?.filter((deal: any) =>
        deal.is_active && (deal.status === 'active' || !deal.status)
      ) || [];
      
      setData(prev => ({ ...prev, flashDeals: activeDeals }));
    } catch (err) {
      
      setData(prev => ({ ...prev, flashDeals: [] }));
    } finally {
      setLoading(prev => ({ ...prev, flashDeals: false }));
    }
  };

  const refetch = async () => {
    setError(null);
    await Promise.all([
      fetchFeaturedProducts(),
      fetchSpecialCollections(),
      fetchFlashDeals()
    ]);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, error, refetch };
}