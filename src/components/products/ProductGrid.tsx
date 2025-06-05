import ProductCard from "./ProductCard";
import { Product } from "@/lib/supabase";

type ProductGridProps = {
  products: (Product & {
    category_name?: string;
    primary_image_url?: string;
    sale_price?: number;
  })[];
  className?: string;
};

const ProductGrid = ({ products, className = "" }: ProductGridProps) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12" data-oid="6cg2ked">
        <p className="text-gray-500" data-oid="i.02cn8">
          Ürün bulunamadı.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
      data-oid=".xcxhn3"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.base_price}
          image={product.primary_image_url || "/images/placeholder.png"}
          slug={product.slug}
          category={product.category_name}
          isNew={
            new Date(product.created_at) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
          isOnSale={
            !!product.sale_price && product.sale_price < product.base_price
          }
          salePrice={product.sale_price}
          data-oid="-kfife7"
        />
      ))}
    </div>
  );
};

export default ProductGrid;
