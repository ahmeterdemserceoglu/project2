import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { createServerComponentClient } from "@/lib/supabase";
import { generateSEOMetadata } from "@/lib/seo/generateMetadata";
import { StructuredData } from "@/components/seo/StructuredData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = generateSEOMetadata({
  title: "3D Baskı Kategorileri - Filamentler, 3D Yazıcılar ve Malzemeler",
  description: "HD Ticaret'te 3D baskı filamentleri, 3D yazıcılar, baskı malzemeleri ve aksesuarları. PLA, ABS, PETG filamentler ve daha fazlası.",
  keywords: "3D baskı kategorileri, filament türleri, 3D yazıcı modelleri, PLA filament, ABS filament, PETG, 3D baskı malzemeleri, HD Ticaret",
  url: "/categories"
});

export default async function CategoriesIndexPage() {
  const supabase = await createServerComponentClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, image_url, description, parent_category_id')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const roots = (categories || []).filter(c => !c.parent_category_id);

  const breadcrumbs = [
    { name: 'Ana Sayfa', url: '/' },
    { name: 'Kategoriler', url: '/categories' }
  ];

  return (
    <>
      <StructuredData type="breadcrumb" breadcrumbs={breadcrumbs} />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">3D Baskı Kategorileri</h1>
          <p className="text-gray-600 text-lg">
            HD Ticaret'te 3D baskı dünyasının tüm ihtiyaçlarını bulabilirsiniz. Filamentlerden 3D yazıcılara, aksesuarlardan özel baskı hizmetlerine kadar her şey burada.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {roots.map(cat => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className="group">
              <div className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800">
                <Image 
                  src={cat.image_url || '/images/placeholder.png'} 
                  alt={`${cat.name} kategorisi`} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <div className="mt-2 text-sm font-medium group-hover:text-primary truncate">{cat.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}


