import { Metadata } from "next";
import ProductGrid from "@/components/products/ProductGrid";
import { createServerComponentClient } from "@/lib/supabase";
import { Product } from "@/lib/supabase";

// Set dynamic to force dynamic rendering since we're using client components
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ürünler | E-Commerce",
  description: "Tüm ürünlerimizi keşfedin",
};

// Mock data for now - will be replaced with actual data from Supabase
export const mockProducts = [
  {
    id: "1",
    name: "Premium T-Shirt",
    slug: "premium-t-shirt",
    description: "Yüksek kaliteli pamuktan üretilmiş t-shirt",
    category_id: "1",
    category_name: "Giyim",
    base_price: 199.99,
    sale_price: 149.99,
    sku: "TS001",
    stock_quantity: 100,
    is_active: true,
    is_featured: true,
    primary_image_url:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Slim Fit Jeans",
    slug: "slim-fit-jeans",
    description: "Modern kesim kot pantolon",
    category_id: "1",
    category_name: "Giyim",
    base_price: 299.99,
    sku: "JN001",
    stock_quantity: 50,
    is_active: true,
    is_featured: false,
    primary_image_url:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Spor Ayakkabı",
    slug: "spor-ayakkabi",
    description: "Rahat ve şık spor ayakkabı",
    category_id: "2",
    category_name: "Ayakkabı",
    base_price: 499.99,
    sale_price: 399.99,
    sku: "SH001",
    stock_quantity: 30,
    is_active: true,
    is_featured: true,
    primary_image_url:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Deri Cüzdan",
    slug: "deri-cuzdan",
    description: "El yapımı deri cüzdan",
    category_id: "3",
    category_name: "Aksesuar",
    base_price: 249.99,
    sku: "WL001",
    stock_quantity: 20,
    is_active: true,
    is_featured: false,
    primary_image_url:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    name: "Akıllı Saat",
    slug: "akilli-saat",
    description: "Fitness takibi ve bildirimler için akıllı saat",
    category_id: "4",
    category_name: "Elektronik",
    base_price: 1299.99,
    sale_price: 999.99,
    sku: "SW001",
    stock_quantity: 15,
    is_active: true,
    is_featured: true,
    primary_image_url:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Bluetooth Kulaklık",
    slug: "bluetooth-kulaklik",
    description: "Gürültü önleyici kablosuz kulaklık",
    category_id: "4",
    category_name: "Elektronik",
    base_price: 899.99,
    sku: "HP001",
    stock_quantity: 25,
    is_active: true,
    is_featured: false,
    primary_image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "7",
    name: "Kahve Makinesi",
    slug: "kahve-makinesi",
    description: "Otomatik espresso ve cappuccino makinesi",
    category_id: "5",
    category_name: "Ev Aletleri",
    base_price: 2499.99,
    sale_price: 1999.99,
    sku: "CM001",
    stock_quantity: 10,
    is_active: true,
    is_featured: true,
    primary_image_url:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Yoga Matı",
    slug: "yoga-mati",
    description: "Kaymaz yüzeyli profesyonel yoga matı",
    category_id: "6",
    category_name: "Spor",
    base_price: 199.99,
    sku: "YM001",
    stock_quantity: 40,
    is_active: true,
    is_featured: false,
    primary_image_url:
      "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// This would be the actual implementation when connected to Supabase
async function getProducts() {
  // Uncomment this when ready to use real data from Supabase
  // const supabase = createServerComponentClient();
  // const { data: products, error } = await supabase
  //   .from('products')
  //   .select(`
  //     *,
  //     categories(name)
  //   `)
  //   .eq('is_active', true)
  //   .order('created_at', { ascending: false });

  // if (error) {
  //   console.error('Error fetching products:', error);
  //   return [];
  // }

  // return products.map(product => ({
  //   ...product,
  //   category_name: product.categories?.name
  // }));

  // Using mock data for now
  return mockProducts;
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto py-8 px-4" data-oid="afl_svq">
      <h1 className="text-3xl font-bold mb-8" data-oid="m9m0nzm">
        Ürünlerimiz
      </h1>

      <div className="flex flex-col md:flex-row gap-8" data-oid="k4p..ub">
        {/* Filters - Mobile */}
        <div className="md:hidden mb-4" data-oid="cau:jtu">
          <details
            className="bg-white rounded-lg shadow p-4"
            data-oid="n5ku18y"
          >
            <summary
              className="font-semibold cursor-pointer"
              data-oid="ehoseog"
            >
              Filtreler
            </summary>
            <div className="mt-4 space-y-4" data-oid="j3k4n:o">
              {/* Category Filter */}
              <div data-oid="zl2j00m">
                <h3 className="font-medium mb-2" data-oid="_krx7jo">
                  Kategoriler
                </h3>
                <div className="space-y-2" data-oid="h-l3ufm">
                  <label className="flex items-center" data-oid="2it4:.p">
                    <input
                      type="checkbox"
                      className="mr-2"
                      data-oid="_t1r5f1"
                    />

                    <span data-oid="eo4mhls">Giyim</span>
                  </label>
                  <label className="flex items-center" data-oid="-3bgg88">
                    <input
                      type="checkbox"
                      className="mr-2"
                      data-oid="lrlk2_0"
                    />

                    <span data-oid="7657cal">Ayakkabı</span>
                  </label>
                  <label className="flex items-center" data-oid="4p_hg__">
                    <input
                      type="checkbox"
                      className="mr-2"
                      data-oid="s:wig8k"
                    />

                    <span data-oid="qeru:dr">Aksesuar</span>
                  </label>
                  <label className="flex items-center" data-oid="cjsi8qt">
                    <input
                      type="checkbox"
                      className="mr-2"
                      data-oid="t0u61jf"
                    />

                    <span data-oid="07w25do">Elektronik</span>
                  </label>
                </div>
              </div>

              {/* Price Filter */}
              <div data-oid="kno76c.">
                <h3 className="font-medium mb-2" data-oid="q.ydwmn">
                  Fiyat Aralığı
                </h3>
                <div className="flex items-center" data-oid="nxn4yn9">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-24 p-2 border rounded-md"
                    data-oid="i4.5ab4"
                  />

                  <span className="mx-2" data-oid="0vd-.w0">
                    -
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-24 p-2 border rounded-md"
                    data-oid="oslejn7"
                  />
                </div>
              </div>

              {/* Other filters can be added here */}
            </div>
          </details>
        </div>

        {/* Filters - Desktop */}
        <div className="hidden md:block w-64 flex-shrink-0" data-oid="yq02is_">
          <div
            className="bg-white rounded-lg shadow p-6 sticky top-24"
            data-oid=":ttb2zr"
          >
            <h2 className="font-bold text-xl mb-4" data-oid="kc-lzfh">
              Filtreler
            </h2>

            {/* Category Filter */}
            <div className="mb-6" data-oid="3hnzh4n">
              <h3 className="font-medium mb-2" data-oid="t0_oiu4">
                Kategoriler
              </h3>
              <div className="space-y-2" data-oid="i3spax7">
                <label className="flex items-center" data-oid="0mkpvff">
                  <input type="checkbox" className="mr-2" data-oid="dzxxamm" />
                  <span data-oid="0u13zq2">Giyim</span>
                </label>
                <label className="flex items-center" data-oid="wqq8__6">
                  <input type="checkbox" className="mr-2" data-oid="r42.u6q" />
                  <span data-oid="llprjf7">Ayakkabı</span>
                </label>
                <label className="flex items-center" data-oid="t2ml9h9">
                  <input type="checkbox" className="mr-2" data-oid="04.ddnp" />
                  <span data-oid="vb_dkq.">Aksesuar</span>
                </label>
                <label className="flex items-center" data-oid=".q.si-l">
                  <input type="checkbox" className="mr-2" data-oid=".h_ffss" />
                  <span data-oid="txvhd4z">Elektronik</span>
                </label>
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6" data-oid="ko8lp.d">
              <h3 className="font-medium mb-2" data-oid="iejw1-o">
                Fiyat Aralığı
              </h3>
              <div className="flex items-center" data-oid="uymcefv">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-20 p-2 border rounded-md"
                  data-oid="lgyh:ds"
                />

                <span className="mx-2" data-oid="w13pf8.">
                  -
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-20 p-2 border rounded-md"
                  data-oid="-:cb18v"
                />
              </div>
            </div>

            {/* Availability Filter */}
            <div className="mb-6" data-oid="uz7u558">
              <h3 className="font-medium mb-2" data-oid=":bwpy12">
                Stok Durumu
              </h3>
              <label className="flex items-center" data-oid="jccvl7p">
                <input type="checkbox" className="mr-2" data-oid="h85yc-b" />
                <span data-oid="vhvdrly">Sadece stoktakileri göster</span>
              </label>
            </div>

            {/* Discount Filter */}
            <div data-oid="nhhvmpt">
              <h3 className="font-medium mb-2" data-oid="y8z-yxg">
                İndirim
              </h3>
              <label className="flex items-center" data-oid="k-9n4av">
                <input type="checkbox" className="mr-2" data-oid="qe543bx" />
                <span data-oid="5gjpmb.">İndirimdeki ürünler</span>
              </label>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="flex-grow" data-oid="hqy0qzk">
          {/* Sort options */}
          <div
            className="flex justify-between items-center mb-6"
            data-oid="xey_nov"
          >
            <p className="text-gray-600" data-oid=":cqhbq3">
              {products.length} ürün bulundu
            </p>
            <select className="border rounded-md p-2" data-oid="_abdys_">
              <option value="newest" data-oid="ih99g.h">
                En Yeniler
              </option>
              <option value="price-asc" data-oid="2kb5peq">
                Fiyat (Artan)
              </option>
              <option value="price-desc" data-oid=".4c..j0">
                Fiyat (Azalan)
              </option>
              <option value="name-asc" data-oid="afl5ij7">
                İsim (A-Z)
              </option>
              <option value="name-desc" data-oid="7rymdwt">
                İsim (Z-A)
              </option>
            </select>
          </div>

          <ProductGrid products={products} data-oid="txyspmo" />
        </div>
      </div>
    </div>
  );
}
