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
    <div className="container mx-auto py-8 px-4" data-oid="_s28piu">
      <h1 className="text-3xl font-bold mb-8" data-oid="3e:tp84">
        Ürünlerimiz
      </h1>

      <div className="flex flex-col md:flex-row gap-8" data-oid="78rn9ql">
        {/* Filters - Mobile */}
        <div className="md:hidden mb-4" data-oid=".a:m63o">
          <details
            className="bg-white rounded-lg shadow p-4"
            data-oid="_o9o_6z"
          >
            <summary
              className="font-semibold cursor-pointer"
              data-oid=".:ycb5x"
            >
              Filtreler
            </summary>
            <div className="mt-4 space-y-4" data-oid=":l2duny">
              {/* Category Filter */}
              <div data-oid="p2cjw0g">
                <h3 className="font-medium mb-2" data-oid="z4_yaix">
                  Kategoriler
                </h3>
                <div className="space-y-2" data-oid="1m0cqf8">
                  <label className="flex items-center" data-oid="za52-5s">
                    <input
                      type="checkbox"
                      className="mr-2"
                      data-oid="zay7iqf"
                    />

                    <span data-oid="6jj76:d">Giyim</span>
                  </label>
                  <label className="flex items-center" data-oid="cyy4ce:">
                    <input
                      type="checkbox"
                      className="mr-2"
                      data-oid="oo3.3u:"
                    />

                    <span data-oid="kn.84ea">Ayakkabı</span>
                  </label>
                  <label className="flex items-center" data-oid="_:pxiip">
                    <input
                      type="checkbox"
                      className="mr-2"
                      data-oid="nyyiscb"
                    />

                    <span data-oid="8it8_4e">Aksesuar</span>
                  </label>
                  <label className="flex items-center" data-oid="n-hywo2">
                    <input
                      type="checkbox"
                      className="mr-2"
                      data-oid="vdvwrhb"
                    />

                    <span data-oid="bxsj:es">Elektronik</span>
                  </label>
                </div>
              </div>

              {/* Price Filter */}
              <div data-oid="i52_e.m">
                <h3 className="font-medium mb-2" data-oid="gw2.k-e">
                  Fiyat Aralığı
                </h3>
                <div className="flex items-center" data-oid="fw_:t43">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-24 p-2 border rounded-md"
                    data-oid="jtmdbhv"
                  />

                  <span className="mx-2" data-oid="-1ksodf">
                    -
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-24 p-2 border rounded-md"
                    data-oid="-1af9tk"
                  />
                </div>
              </div>

              {/* Other filters can be added here */}
            </div>
          </details>
        </div>

        {/* Filters - Desktop */}
        <div className="hidden md:block w-64 flex-shrink-0" data-oid="x.cq73:">
          <div
            className="bg-white rounded-lg shadow p-6 sticky top-24"
            data-oid="1j4h-2:"
          >
            <h2 className="font-bold text-xl mb-4" data-oid="hd8m7t7">
              Filtreler
            </h2>

            {/* Category Filter */}
            <div className="mb-6" data-oid="14kbti7">
              <h3 className="font-medium mb-2" data-oid="v-6r_13">
                Kategoriler
              </h3>
              <div className="space-y-2" data-oid="1a16qr-">
                <label className="flex items-center" data-oid="q16peqw">
                  <input type="checkbox" className="mr-2" data-oid="ncmvxi2" />
                  <span data-oid="j28k._o">Giyim</span>
                </label>
                <label className="flex items-center" data-oid="xj63.ie">
                  <input type="checkbox" className="mr-2" data-oid="u01ibvz" />
                  <span data-oid="h_u567x">Ayakkabı</span>
                </label>
                <label className="flex items-center" data-oid="lj7kzlb">
                  <input type="checkbox" className="mr-2" data-oid="yuq7baz" />
                  <span data-oid="2mpdur4">Aksesuar</span>
                </label>
                <label className="flex items-center" data-oid="oxod4fi">
                  <input type="checkbox" className="mr-2" data-oid="wk39oa0" />
                  <span data-oid="ehniqrv">Elektronik</span>
                </label>
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6" data-oid="ll00d6c">
              <h3 className="font-medium mb-2" data-oid="4icup26">
                Fiyat Aralığı
              </h3>
              <div className="flex items-center" data-oid="w5btv3b">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-20 p-2 border rounded-md"
                  data-oid="l5jfb21"
                />

                <span className="mx-2" data-oid="01-h6t6">
                  -
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-20 p-2 border rounded-md"
                  data-oid="0q3wy9."
                />
              </div>
            </div>

            {/* Availability Filter */}
            <div className="mb-6" data-oid="nfrbt7v">
              <h3 className="font-medium mb-2" data-oid="l7vfi1j">
                Stok Durumu
              </h3>
              <label className="flex items-center" data-oid="qf9t6s3">
                <input type="checkbox" className="mr-2" data-oid="f-akq:4" />
                <span data-oid="4bjisvl">Sadece stoktakileri göster</span>
              </label>
            </div>

            {/* Discount Filter */}
            <div data-oid="r4wv02t">
              <h3 className="font-medium mb-2" data-oid="t314oqd">
                İndirim
              </h3>
              <label className="flex items-center" data-oid="-ojcet_">
                <input type="checkbox" className="mr-2" data-oid="4:44gzk" />
                <span data-oid="4-70vql">İndirimdeki ürünler</span>
              </label>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="flex-grow" data-oid="rgq6aut">
          {/* Sort options */}
          <div
            className="flex justify-between items-center mb-6"
            data-oid=":cwnb5."
          >
            <p className="text-gray-600" data-oid="5apw:4-">
              {products.length} ürün bulundu
            </p>
            <select className="border rounded-md p-2" data-oid="lzxqg-q">
              <option value="newest" data-oid="k7pfzq4">
                En Yeniler
              </option>
              <option value="price-asc" data-oid="pxt1zg:">
                Fiyat (Artan)
              </option>
              <option value="price-desc" data-oid="81awq.i">
                Fiyat (Azalan)
              </option>
              <option value="name-asc" data-oid="wu.cbom">
                İsim (A-Z)
              </option>
              <option value="name-desc" data-oid="17m34kx">
                İsim (Z-A)
              </option>
            </select>
          </div>

          <ProductGrid products={products} data-oid="pjorjwt" />
        </div>
      </div>
    </div>
  );
}
