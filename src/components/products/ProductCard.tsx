import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  category?: string;
  isNew?: boolean;
  isOnSale?: boolean;
  salePrice?: number;
};

const ProductCard = ({
  id,
  name,
  price,
  image,
  slug,
  category,
  isNew = false,
  isOnSale = false,
  salePrice,
}: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      productId: id,
      name,
      price: isOnSale && salePrice ? salePrice : price,
      quantity: 1,
      image,
    });
  };

  // Create a URL-friendly version of the slug
  const productUrl = `/products/${encodeURIComponent(slug)}`;

  // Format price safely with null check
  const formatPrice = (value?: number) => {
    return value !== undefined && value !== null ? `₺${value.toFixed(2)}` : "₺0.00";
  };

  return (
    <div className="card group h-full flex flex-col bg-white dark:bg-dark shadow-sm hover:shadow-md transition-shadow relative">
      <div className="relative overflow-hidden rounded-t-md mb-4">
        <Link href={productUrl}>
          <div className="aspect-square relative">
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">
              Yeni
            </span>
          )}
          {isOnSale && (
            <span className="bg-accent text-white text-xs font-bold px-2 py-1 rounded">
              İndirim
            </span>
          )}
        </div>

        {/* Quick add button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          Sepete Ekle
        </button>
      </div>

      <div className="flex-grow">
        {category && (
          <span className="text-xs text-gray-500 mb-1 block">{category}</span>
        )}
        <Link href={productUrl} className="block">
          <h3 className="font-semibold text-lg hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
      </div>

      <div className="mt-2">
        {isOnSale && salePrice ? (
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{formatPrice(salePrice)}</span>
            <span className="text-gray-500 line-through text-sm">
              {formatPrice(price)}
            </span>
          </div>
        ) : (
          <span className="font-bold text-lg">{formatPrice(price)}</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
