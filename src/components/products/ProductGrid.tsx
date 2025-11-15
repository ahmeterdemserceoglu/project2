import { Tables } from '@/types/supabase';
import { ProductCard } from '@/components/ui/product-card';

type Product = Tables<'products'>;

// Make the interface more flexible to accept different product shapes from different components
export interface ProductWithPrice extends Partial<Product> {
  id: string;
  name: string;
  slug: string;
  price?: number;
  base_price: number;
  sale_price?: number | null;
  stock?: number;
  stock_quantity?: number;
  primary_image_url?: string | null;
  created_at?: string | null;
  // product_variants ilişkisinden gelen veriyi de dahil edebiliriz
  product_variants?: { id: string; price: number; stock: number }[] | null;
}

interface ProductGridProps {
  products: ProductWithPrice[] | any[];
  limit?: number;
}

const ProductGrid = ({ products, limit }: ProductGridProps) => {
  const displayedProducts = limit ? products.slice(0, limit) : products;

  if (!displayedProducts || displayedProducts.length === 0) {
    return <p className="text-center col-span-full">Gösterilecek ürün bulunamadı.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {displayedProducts.map((product) => {
        // Handle different product shapes
        const price = product.price ?? product.sale_price ?? product.base_price;
        const imageUrl = product.primary_image_url ?? '/images/placeholder.png';
        const stockAvailable = (product.stock ?? product.stock_quantity ?? 0) as number;

        return (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.base_price}
            salePrice={product.sale_price}
            imageUrl={imageUrl}
            createdAt={product.created_at}
            stock={stockAvailable}
          />
        );
      })}
    </div>
  );
};

export default ProductGrid;
