import { Metadata } from 'next';
import ProductGrid from '@/components/products/ProductGrid';
import { createServerComponentClient } from '@/lib/supabase';
import { Product } from '@/lib/supabase';

// Set dynamic to force dynamic rendering since we're using client components
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ürünler | E-Commerce',
  description: 'Tüm ürünlerimizi keşfedin',
};

// Mock data for now - will be replaced with actual data from Supabase
export const mockProducts = [
  {
    id: '1',
    name: 'Premium T-Shirt',
    slug: 'premium-t-shirt',
    description: 'Yüksek kaliteli pamuktan üretilmiş t-shirt',
    category_id: '1',
    category_name: 'Giyim',
    base_price: 199.99,
    sale_price: 149.99,
    sku: 'TS001',
    stock_quantity: 100,
    is_active: true,
    is_featured: true,
    primary_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Slim Fit Jeans',
    slug: 'slim-fit-jeans',
    description: 'Modern kesim kot pantolon',
    category_id: '1',
    category_name: 'Giyim',
    base_price: 299.99,
    sku: 'JN001',
    stock_quantity: 50,
    is_active: true,
    is_featured: false,
    primary_image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Spor Ayakkabı',
    slug: 'spor-ayakkabi',
    description: 'Rahat ve şık spor ayakkabı',
    category_id: '2',
    category_name: 'Ayakkabı',
    base_price: 499.99,
    sale_price: 399.99,
    sku: 'SH001',
    stock_quantity: 30,
    is_active: true,
    is_featured: true,
    primary_image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Deri Cüzdan',
    slug: 'deri-cuzdan',
    description: 'El yapımı deri cüzdan',
    category_id: '3',
    category_name: 'Aksesuar',
    base_price: 249.99,
    sku: 'WL001',
    stock_quantity: 20,
    is_active: true,
    is_featured: false,
    primary_image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'Akıllı Saat',
    slug: 'akilli-saat',
    description: 'Fitness takibi ve bildirimler için akıllı saat',
    category_id: '4',
    category_name: 'Elektronik',
    base_price: 1299.99,
    sale_price: 999.99,
    sku: 'SW001',
    stock_quantity: 15,
    is_active: true,
    is_featured: true,
    primary_image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Bluetooth Kulaklık',
    slug: 'bluetooth-kulaklik',
    description: 'Gürültü önleyici kablosuz kulaklık',
    category_id: '4',
    category_name: 'Elektronik',
    base_price: 899.99,
    sku: 'HP001',
    stock_quantity: 25,
    is_active: true,
    is_featured: false,
    primary_image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    name: 'Kahve Makinesi',
    slug: 'kahve-makinesi',
    description: 'Otomatik espresso ve cappuccino makinesi',
    category_id: '5',
    category_name: 'Ev Aletleri',
    base_price: 2499.99,
    sale_price: 1999.99,
    sku: 'CM001',
    stock_quantity: 10,
    is_active: true,
    is_featured: true,
    primary_image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Yoga Matı',
    slug: 'yoga-mati',
    description: 'Kaymaz yüzeyli profesyonel yoga matı',
    category_id: '6',
    category_name: 'Spor',
    base_price: 199.99,
    sku: 'YM001',
    stock_quantity: 40,
    is_active: true,
    is_featured: false,
    primary_image_url: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
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
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Ürünlerimiz</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - Mobile */}
        <div className="md:hidden mb-4">
          <details className="bg-white rounded-lg shadow p-4">
            <summary className="font-semibold cursor-pointer">
              Filtreler
            </summary>
            <div className="mt-4 space-y-4">
              {/* Category Filter */}
              <div>
                <h3 className="font-medium mb-2">Kategoriler</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Giyim</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Ayakkabı</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Aksesuar</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Elektronik</span>
                  </label>
                </div>
              </div>
              
              {/* Price Filter */}
              <div>
                <h3 className="font-medium mb-2">Fiyat Aralığı</h3>
                <div className="flex items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-24 p-2 border rounded-md"
                  />
                  <span className="mx-2">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-24 p-2 border rounded-md"
                  />
                </div>
              </div>
              
              {/* Other filters can be added here */}
            </div>
          </details>
        </div>
        
        {/* Filters - Desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="font-bold text-xl mb-4">Filtreler</h2>
            
            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Kategoriler</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Giyim</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Ayakkabı</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Aksesuar</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Elektronik</span>
                </label>
              </div>
            </div>
            
            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Fiyat Aralığı</h3>
              <div className="flex items-center">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-20 p-2 border rounded-md"
                />
                <span className="mx-2">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-20 p-2 border rounded-md"
                />
              </div>
            </div>
            
            {/* Availability Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Stok Durumu</h3>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Sadece stoktakileri göster</span>
              </label>
            </div>
            
            {/* Discount Filter */}
            <div>
              <h3 className="font-medium mb-2">İndirim</h3>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>İndirimdeki ürünler</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Products */}
        <div className="flex-grow">
          {/* Sort options */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">{products.length} ürün bulundu</p>
            <select className="border rounded-md p-2">
              <option value="newest">En Yeniler</option>
              <option value="price-asc">Fiyat (Artan)</option>
              <option value="price-desc">Fiyat (Azalan)</option>
              <option value="name-asc">İsim (A-Z)</option>
              <option value="name-desc">İsim (Z-A)</option>
            </select>
          </div>
          
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
} 