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

  return (
    <div className="card group h-full flex flex-col" data-oid="ea6o098">
      <div
        className="relative overflow-hidden rounded-md mb-4"
        data-oid="nx1.8vc"
      >
        <Link href={`/products/${slug}`} data-oid="47m2yl9">
          <div className="aspect-square relative" data-oid="r:nvs.0">
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-oid="lgc0cmz"
            />
          </div>
        </Link>

        {/* Badges */}
        <div
          className="absolute top-2 left-2 flex flex-col gap-1"
          data-oid="77su9nc"
        >
          {isNew && (
            <span
              className="bg-primary text-white text-xs font-bold px-2 py-1 rounded"
              data-oid="3e88flr"
            >
              Yeni
            </span>
          )}
          {isOnSale && (
            <span
              className="bg-accent text-white text-xs font-bold px-2 py-1 rounded"
              data-oid="12b_z6o"
            >
              İndirim
            </span>
          )}
        </div>

        {/* Quick add button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          data-oid="9p9ay.t"
        >
          Sepete Ekle
        </button>
      </div>

      <div className="flex-grow" data-oid="9e--_tj">
        {category && (
          <span className="text-xs text-gray-500 mb-1 block" data-oid="su6sp61">
            {category}
          </span>
        )}
        <Link href={`/products/${slug}`} className="block" data-oid="n344fdp">
          <h3
            className="font-semibold text-lg hover:text-primary transition-colors"
            data-oid="u-9g5:e"
          >
            {name}
          </h3>
        </Link>
      </div>

      <div className="mt-2" data-oid="vb.4--r">
        {isOnSale && salePrice ? (
          <div className="flex items-center gap-2" data-oid="u84:3if">
            <span className="font-bold text-lg" data-oid=".jdwga4">
              ₺{salePrice.toFixed(2)}
            </span>
            <span
              className="text-gray-500 line-through text-sm"
              data-oid="p_3jv4u"
            >
              ₺{price.toFixed(2)}
            </span>
          </div>
        ) : (
          <span className="font-bold text-lg" data-oid="8p0.1i7">
            ₺{price.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
