import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductGrid from "@/components/products/ProductGrid";
import { createServerComponentClient } from "@/lib/supabase";
import { generateSEOMetadata } from "@/lib/seo/generateMetadata";
import { StructuredData } from "@/components/seo/StructuredData";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerComponentClient();
  
  const { data: category, error } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !category) {
    return generateSEOMetadata({
      title: 'Kategori Bulunamadı',
      description: 'Aradığınız kategori bulunamadı.',
      noIndex: true
    });
  }

  return generateSEOMetadata({
    title: `${category.name} Ürünleri - En İyi ${category.name} Modelleri`,
    description: category.description || `${category.name} kategorisindeki en kaliteli ürünleri HD Ticaret'te keşfedin. Uygun fiyatlar, hızlı teslimat ve güvenli ödeme seçenekleri.`,
    keywords: `${category.name}, ${category.name} ürünleri, online ${category.name} alışveriş, ${category.name} modelleri, HD Ticaret`,
    url: `/categories/${slug}`,
    type: 'website'
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerComponentClient();

  // Kategori bul
  const { data: category, error: catErr } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (catErr || !category) {
    return notFound();
  }

  // Bu kategori ve tüm alt kategorilerinden ürünleri getir
  // Önce tüm kategorileri çekip, bu kategorinin altlarını toplayalım
  const { data: allCats } = await supabase
    .from('categories')
    .select('id, parent_category_id');

  const collectIds = (rootId: string): string[] => {
    const result: string[] = [rootId];
    const map = new Map<string, string | null>();
    (allCats || []).forEach(c => map.set(c.id as string, c.parent_category_id as string | null));
    const queue: string[] = [rootId];
    while (queue.length) {
      const current = queue.shift()!;
      for (const [id, parent] of map.entries()) {
        if (parent === current && !result.includes(id)) {
          result.push(id);
          queue.push(id);
        }
      }
    }
    return result;
  };

  const categoryIds = collectIds(category.id);

  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('*')
    .in('category_id', categoryIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (prodErr) {
  }

  const breadcrumbs = [
    { name: 'Ana Sayfa', url: '/' },
    { name: 'Kategoriler', url: '/categories' },
    { name: category.name, url: `/categories/${category.slug}` }
  ];

  return (
    <>
      <StructuredData type="breadcrumb" breadcrumbs={breadcrumbs} />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{category.name} Ürünleri</h1>
          {category.description && (
            <p className="text-gray-600 text-lg mb-4 max-w-3xl">{category.description}</p>
          )}
          <p className="text-gray-500">
            {(products as any)?.length || 0} ürün bulundu
          </p>
        </div>
        <ProductGrid products={(products as any) || []} />
      </div>
    </>
  );
}


