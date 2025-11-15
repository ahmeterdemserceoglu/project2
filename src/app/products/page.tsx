import { Metadata } from "next";
import ProductGridWithFlashDeals from "@/components/products/ProductGridWithFlashDeals";
import { generateSEOMetadata } from "@/lib/seo/generateMetadata";

// Set dynamic to force dynamic rendering since we're using client components
export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
  const flashDealsOnly = typeof resolvedSearchParams.flash_deal === 'string' ? resolvedSearchParams.flash_deal : undefined;

  let title = "3D Baskı Ürünleri - HD Ticaret";
  let description = "HD Ticaret'te binlerce 3D baskı ürünü arasından seçim yapın. Filamentler, 3D yazıcılar, baskı malzemeleri ve daha fazlası uygun fiyatlarla.";
  let keywords = "3D baskı ürünleri, filament, 3D yazıcı, 3D printing malzemeleri, HD Ticaret";

  if (flashDealsOnly) {
    title = "3D Baskı Flash Fırsatlar - Sınırlı Süreli İndirimler | HD Ticaret";
    description = "HD Ticaret 3D baskı flash fırsatları ile büyük indirimler! Filament ve 3D yazıcılarda sınırlı süre özel fiyatlar.";
    keywords = "3D baskı flash fırsatlar, filament indirim, 3D yazıcı kampanya, sınırlı süre, özel fiyat, HD Ticaret";
  }

  if (category) {
    title = `${category.charAt(0).toUpperCase() + category.slice(1)} Ürünleri | HD Ticaret`;
    description = `${category} kategorisindeki en kaliteli ürünleri HD Ticaret'te keşfedin. Uygun fiyatlar, hızlı teslimat.`;
    keywords = `${category}, ${category} ürünleri, online ${category} alışveriş, HD Ticaret`;
  }

  if (search) {
    title = `"${search}" Arama Sonuçları | HD Ticaret`;
    description = `"${search}" için arama sonuçları. HD Ticaret'te aradığınız ürünleri bulun.`;
    keywords = `${search}, arama, ürün arama, HD Ticaret`;
  }

  return generateSEOMetadata({
    title,
    description,
    keywords,
    url: '/products',
    type: 'website'
  });
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await searchParams for Next.js 15 compatibility
  const resolvedSearchParams = await searchParams;
  
  // Convert searchParams to the expected format
  const params = {
    category: typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined,
    search: typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined,
    flash_deals_only: typeof resolvedSearchParams.flash_deal === 'string' ? resolvedSearchParams.flash_deal : undefined,
    page: typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : undefined,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">
        3D Baskı Ürünlerimiz
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - Mobile */}
        <div className="md:hidden mb-4">
          <details
            className="bg-white rounded-lg shadow p-4"
          >
            <summary
              className="font-semibold cursor-pointer"
            >
              Filtreler
            </summary>
            <div className="mt-4 space-y-4">
              {/* Category Filter */}
              <div>
                <h3 className="font-medium mb-2">
                  Kategoriler
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                    />

                    <span>PLA Filament</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                    />

                    <span>ABS Filament</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                    />

                    <span>PETG Filament</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                    />

                    <span>3D Yazıcılar</span>
                  </label>
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-medium mb-2">
                  Fiyat Aralığı
                </h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Filters - Desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="font-bold text-xl mb-4">
              Filtreler
            </h2>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">
                Kategoriler
              </h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                  />
                  <span>PLA Filament</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                  />
                  <span>ABS Filament</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                  />
                  <span>PETG Filament</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                  />
                  <span>3D Yazıcılar</span>
                </label>
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">
                Fiyat Aralığı
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* Sort Filter */}
            <div>
              <h3 className="font-medium mb-2">
                Sıralama
              </h3>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Önerilen</option>
                <option>Fiyat: Düşükten Yükseğe</option>
                <option>Fiyat: Yüksekten Düşüğe</option>
                <option>En Yeni</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                {params.flash_deals_only ? '3D Baskı Flash Fırsatlar' : 'Tüm 3D Baskı Ürünleri'}
              </h2>
              {params.flash_deals_only && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                  ⚡ Sınırlı Süre
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <select className="px-3 py-2 border rounded-md text-sm">
                  <option>Önerilen</option>
                  <option>Fiyat: Düşükten Yükseğe</option>
                  <option>Fiyat: Yüksekten Düşüğe</option>
                  <option>En Yeni</option>
                </select>
              </div>
            </div>
          </div>

          <ProductGridWithFlashDeals searchParams={params} />
        </div>
      </div>
    </div>
  );
}
