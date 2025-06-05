import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import AddToCartButton from "@/components/products/AddToCartButton";
import ProductGrid from "@/components/products/ProductGrid";
import { createServerComponentClient } from "@/lib/supabase";
import { Product } from "@/lib/supabase";
import Link from "next/link";

// Set dynamic to force dynamic rendering since we're using client components
export const dynamic = "force-dynamic";

// Mock data for now - will be replaced with actual data from Supabase
import { mockProducts } from "../page";

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: "Ürün Bulunamadı | HDTicaret.com",
    };
  }

  return {
    title: `${product.name} | HDTicaret.com`,
    description: product.description,
  };
}

async function getProduct(slug: string) {
  // Uncomment this when ready to use real data from Supabase
  // const supabase = createServerComponentClient();
  // const { data: product, error } = await supabase
  //   .from('products')
  //   .select(`
  //     *,
  //     categories(name),
  //     product_images(*)
  //   `)
  //   .eq('slug', slug)
  //   .eq('is_active', true)
  //   .single();

  // if (error) {
  //   console.error('Error fetching product:', error);
  //   return null;
  // }

  // return {
  //   ...product,
  //   category_name: product.categories?.name,
  //   images: product.product_images || []
  // };

  // Using mock data for now
  const product = mockProducts.find(
    (p: Product & { slug: string }) => p.slug === slug,
  );

  if (!product) {
    return null;
  }

  return {
    ...product,
    images: [
      {
        id: "1",
        image_url: product.primary_image_url,
        alt_text: product.name,
        is_primary: true,
      },
      {
        id: "2",
        image_url:
          "https://images.unsplash.com/photo-1523381294911-8d3cead13475?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        alt_text: product.name,
        is_primary: false,
      },
      {
        id: "3",
        image_url:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        alt_text: product.name,
        is_primary: false,
      },
    ],
  };
}

async function getRelatedProducts(categoryId: string, productId: string) {
  // Uncomment this when ready to use real data from Supabase
  // const supabase = createServerComponentClient();
  // const { data: products, error } = await supabase
  //   .from('products')
  //   .select(`
  //     *,
  //     categories(name)
  //   `)
  //   .eq('category_id', categoryId)
  //   .eq('is_active', true)
  //   .neq('id', productId)
  //   .limit(4);

  // if (error) {
  //   console.error('Error fetching related products:', error);
  //   return [];
  // }

  // return products.map(product => ({
  //   ...product,
  //   category_name: product.categories?.name
  // }));

  // Using mock data for now
  return mockProducts
    .filter(
      (p: Product & { category_id: string; id: string }) =>
        p.category_id === categoryId && p.id !== productId,
    )
    .slice(0, 4);
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.category_id,
    product.id,
  );
  const isInStock = product.stock_quantity > 0;

  return (
    <div className="container mx-auto py-12 px-4" data-oid="w.avbot">
      {/* Breadcrumb */}
      <div
        className="text-sm mb-6 flex items-center text-gray-500"
        data-oid="uledsik"
      >
        <Link href="/" data-oid="y28gy7k">
          Ana Sayfa
        </Link>
        <span className="mx-2" data-oid="kz2-cgo">
          /
        </span>
        <Link href="/products" data-oid="k06-e1p">
          Ürünler
        </Link>
        {product.category_name && (
          <>
            <span className="mx-2" data-oid="mu91p2a">
              /
            </span>
            <Link href={`/category/${product.category_id}`} data-oid="1dj-x8d">
              {product.category_name}
            </Link>
          </>
        )}
        <span className="mx-2" data-oid="_:ovb.s">
          /
        </span>
        <span className="text-gray-700 font-medium truncate" data-oid="35myozq">
          {product.name}
        </span>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16"
        data-oid="2a_2c3q"
      >
        {/* Product Images */}
        <div className="space-y-6" data-oid="i19-qi_">
          {/* Main Image */}
          <div
            className="relative aspect-square overflow-hidden rounded-xl shadow-md bg-white"
            data-oid="yum80eg"
          >
            <Image
              src={product.primary_image_url || "/images/placeholder.png"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4"
              priority
              data-oid="uqymnys"
            />

            {product.sale_price && (
              <div
                className="absolute top-4 left-4 bg-accent text-white text-sm font-medium px-3 py-1 rounded-full"
                data-oid="sq3pgpe"
              >
                %
                {Math.round(
                  (1 - product.sale_price / product.base_price) * 100,
                )}{" "}
                İndirim
              </div>
            )}
            {!isInStock && (
              <div
                className="absolute inset-0 bg-black/40 flex items-center justify-center"
                data-oid="b-rwuzs"
              >
                <span
                  className="bg-red-600 text-white px-4 py-2 rounded-md font-medium text-lg transform -rotate-12"
                  data-oid="-ydtjzk"
                >
                  Stokta Yok
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-3" data-oid="w:a8osv">
            {product.images.map((image: any) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-md cursor-pointer border-2 border-transparent hover:border-primary transition-colors bg-white shadow-sm"
                data-oid="9iqdfqj"
              >
                <Image
                  src={image.image_url}
                  alt={image.alt_text || product.name}
                  fill
                  sizes="25vw"
                  className="object-contain p-2"
                  data-oid="r6o97qy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div data-oid="p6qgig:">
          {product.category_name && (
            <p
              className="text-sm text-primary font-medium mb-2"
              data-oid="oowe2j4"
            >
              {product.category_name}
            </p>
          )}
          <h1 className="text-3xl font-bold mb-4" data-oid="myeomrw">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center mb-6" data-oid="rn3jwj7">
            <div
              className="flex items-center text-yellow-400"
              data-oid="u83aof4"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="fb_-.ur"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="p85h_2a"
                />
              </svg>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="wc2dn-m"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="_dudghz"
                />
              </svg>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="qswtuhi"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="jssyt2w"
                />
              </svg>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="9md5y5x"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="xyzk5xa"
                />
              </svg>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="ndrkaho"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="takh_qv"
                />
              </svg>
            </div>
            <p className="ml-2 text-gray-600 text-sm" data-oid="or.sb4.">
              (24 Değerlendirme)
            </p>
          </div>

          {/* Price */}
          <div className="mb-6" data-oid="ktsi0tx">
            {product.sale_price ? (
              <div className="flex items-center gap-2" data-oid="n4d-q0x">
                <span className="text-3xl font-bold" data-oid="xal1kre">
                  ₺{product.sale_price.toFixed(2)}
                </span>
                <span
                  className="text-gray-500 line-through text-lg"
                  data-oid="7j76m5h"
                >
                  ₺{product.base_price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold" data-oid="rvxt.xl">
                ₺{product.base_price.toFixed(2)}
              </span>
            )}

            {/* Free shipping notice */}
            <p
              className="text-sm text-green-600 mt-2 flex items-center"
              data-oid="4j5cl-."
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-oid="r3dr2jk"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  data-oid="xsefvpz"
                />
              </svg>
              500₺ üzeri siparişlerde kargo bedava
            </p>
          </div>

          {/* Stock Status */}
          <div className="mb-6 flex items-center" data-oid="_ipmom4">
            {isInStock ? (
              <>
                <span
                  className="h-3 w-3 bg-green-500 rounded-full mr-2"
                  data-oid="jcb2epy"
                ></span>
                <p className="text-green-600 font-medium" data-oid="jd2yjk7">
                  Stokta Var - 24 saat içinde kargoda
                </p>
              </>
            ) : (
              <>
                <span
                  className="h-3 w-3 bg-red-500 rounded-full mr-2"
                  data-oid="2c.kzgj"
                ></span>
                <p className="text-red-600 font-medium" data-oid="_njjke4">
                  Stokta Yok
                </p>
              </>
            )}
          </div>

          {/* Description */}
          <div className="mb-8" data-oid="fv-o2e3">
            <h2 className="text-lg font-semibold mb-2" data-oid="-crkv:r">
              Ürün Açıklaması
            </h2>
            <p className="text-gray-700" data-oid="..mfwsx">
              {product.description}
            </p>
          </div>

          {/* Add to Cart */}
          <div
            className="flex flex-col sm:flex-row gap-4 mb-8"
            data-oid="ayb90i0"
          >
            {isInStock ? (
              <>
                <div className="flex border rounded-md" data-oid="vhhrth5">
                  <button
                    className="px-4 py-2 border-r hover:bg-gray-50"
                    data-oid="o9kzpo6"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-16 text-center focus:outline-none"
                    data-oid="1oq7.m7"
                  />

                  <button
                    className="px-4 py-2 border-l hover:bg-gray-50"
                    data-oid="i1ux-l3"
                  >
                    +
                  </button>
                </div>

                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.sale_price || product.base_price,
                    image:
                      product.primary_image_url || "/images/placeholder.png",
                  }}
                  data-oid="vqdm68c"
                />
              </>
            ) : (
              <div className="w-full" data-oid="1p4.kjp">
                <button
                  className="w-full py-3 px-4 bg-gray-200 text-gray-600 rounded-md cursor-not-allowed flex items-center justify-center"
                  disabled
                  data-oid="p6ft3t5"
                >
                  Stokta Yok
                </button>
                <p className="text-sm text-gray-600 mt-2" data-oid="q-vll58">
                  Stok durumu için lütfen bizimle iletişime geçin.
                </p>
                <a
                  href="/iletisim"
                  className="text-primary text-sm hover:underline mt-1 inline-block"
                  data-oid="8g1qjan"
                >
                  Haber ver
                </a>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="border-t pt-6" data-oid="ginasv5">
            <div className="grid grid-cols-2 gap-4 mb-6" data-oid="tcz3rju">
              <div data-oid="ws3eohv">
                <p className="text-gray-500 text-sm" data-oid="ke1cc3z">
                  SKU:
                </p>
                <p data-oid="4p.0a81">{product.sku || "N/A"}</p>
              </div>
              <div data-oid="_wgub7_">
                <p className="text-gray-500 text-sm" data-oid="as3l:zy">
                  Kategori:
                </p>
                <p data-oid="66k9m4k">{product.category_name || "N/A"}</p>
              </div>
            </div>

            {/* Secure shopping */}
            <div
              className="flex items-center space-x-4 text-sm text-gray-500"
              data-oid="yoc3hy:"
            >
              <div className="flex items-center" data-oid="fo8ama-">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="5utm7.:"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    data-oid="ufucdxa"
                  />
                </svg>
                Güvenli Ödeme
              </div>
              <div className="flex items-center" data-oid="0k.:00h">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="4ay873j"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    data-oid="qvsze1l"
                  />
                </svg>
                14 Gün İade
              </div>
              <div className="flex items-center" data-oid="4ksybz6">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="46alman"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    data-oid="lbe_8a1"
                  />
                </svg>
                Orijinal Ürün
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-16" data-oid="-frx0rz">
        <div className="border-b" data-oid="0zh1qcm">
          <ul className="flex flex-wrap -mb-px" data-oid="0uwv7sw">
            <li className="mr-2" data-oid="yb5o6w9">
              <button
                className="inline-block py-4 px-6 border-b-2 border-primary font-medium text-primary"
                data-oid="69qp87z"
              >
                Detaylar
              </button>
            </li>
            <li className="mr-2" data-oid="s2z4ihw">
              <button
                className="inline-block py-4 px-6 border-b-2 border-transparent hover:border-gray-300 font-medium text-gray-600"
                data-oid="u7kdqpy"
              >
                Özellikler
              </button>
            </li>
            <li className="mr-2" data-oid="4mktnhi">
              <button
                className="inline-block py-4 px-6 border-b-2 border-transparent hover:border-gray-300 font-medium text-gray-600"
                data-oid="l3ys6_q"
              >
                Değerlendirmeler (24)
              </button>
            </li>
          </ul>
        </div>

        <div className="py-6" data-oid="yunzjz:">
          <p className="text-gray-700 mb-4" data-oid="5gh-t47">
            {product.description}
          </p>
          <p className="text-gray-700" data-oid="so5-qlp">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
            volutpat velit id enim tincidunt, in tincidunt tellus pharetra.
            Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
            posuere cubilia curae; Etiam sapien urna, lobortis vel pretium at,
            imperdiet quis mi. Morbi sollicitudin magna non leo ullamcorper, a
            condimentum felis porta.
          </p>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div data-oid="xvbcucd">
          <h2 className="text-2xl font-bold mb-6" data-oid="vy8sc.f">
            Benzer Ürünler
          </h2>
          <ProductGrid products={relatedProducts} data-oid="gqc68z0" />
        </div>
      )}
    </div>
  );
}
