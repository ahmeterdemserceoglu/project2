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
    <div className="container mx-auto py-12 px-4" data-oid="ukffr46">
      {/* Breadcrumb */}
      <div
        className="text-sm mb-6 flex items-center text-gray-500"
        data-oid="k8suqbb"
      >
        <Link href="/" data-oid="8myjnv0">
          Ana Sayfa
        </Link>
        <span className="mx-2" data-oid="cluoc.:">
          /
        </span>
        <Link href="/products" data-oid="5z3tyjb">
          Ürünler
        </Link>
        {product.category_name && (
          <>
            <span className="mx-2" data-oid="syfr98.">
              /
            </span>
            <Link href={`/category/${product.category_id}`} data-oid="ij6bog4">
              {product.category_name}
            </Link>
          </>
        )}
        <span className="mx-2" data-oid="eq.4f3o">
          /
        </span>
        <span className="text-gray-700 font-medium truncate" data-oid="._uxyl7">
          {product.name}
        </span>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16"
        data-oid="3tq_s27"
      >
        {/* Product Images */}
        <div className="space-y-6" data-oid="e.fxzfc">
          {/* Main Image */}
          <div
            className="relative aspect-square overflow-hidden rounded-xl shadow-md bg-white"
            data-oid="c6wmbhs"
          >
            <Image
              src={product.primary_image_url || "/images/placeholder.png"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4"
              priority
              data-oid="-qh54v9"
            />

            {product.sale_price && (
              <div
                className="absolute top-4 left-4 bg-accent text-white text-sm font-medium px-3 py-1 rounded-full"
                data-oid="mso79m2"
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
                data-oid="n0fajf4"
              >
                <span
                  className="bg-red-600 text-white px-4 py-2 rounded-md font-medium text-lg transform -rotate-12"
                  data-oid="ijlnu-m"
                >
                  Stokta Yok
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-3" data-oid="3mj8fgu">
            {product.images.map((image: any) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-md cursor-pointer border-2 border-transparent hover:border-primary transition-colors bg-white shadow-sm"
                data-oid="ri:ul40"
              >
                <Image
                  src={image.image_url}
                  alt={image.alt_text || product.name}
                  fill
                  sizes="25vw"
                  className="object-contain p-2"
                  data-oid="0hn165g"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div data-oid="ju8e_7v">
          {product.category_name && (
            <p
              className="text-sm text-primary font-medium mb-2"
              data-oid="ivvjy_b"
            >
              {product.category_name}
            </p>
          )}
          <h1 className="text-3xl font-bold mb-4" data-oid="8-vco6p">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center mb-6" data-oid="u7gpk0-">
            <div
              className="flex items-center text-yellow-400"
              data-oid="-5wj0kv"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="1pp7s9y"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="h1xj9ol"
                />
              </svg>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="xvl6m_j"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="ue22bfu"
                />
              </svg>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="fldop3r"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="dbzh5n0"
                />
              </svg>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="pmh_m4d"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="tkkcif4"
                />
              </svg>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="xg630vl"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="jhpn2.w"
                />
              </svg>
            </div>
            <p className="ml-2 text-gray-600 text-sm" data-oid="wxl6i.c">
              (24 Değerlendirme)
            </p>
          </div>

          {/* Price */}
          <div className="mb-6" data-oid="q_a.pjn">
            {product.sale_price ? (
              <div className="flex items-center gap-2" data-oid="7oulllq">
                <span className="text-3xl font-bold" data-oid="_vr-h4g">
                  ₺{product.sale_price.toFixed(2)}
                </span>
                <span
                  className="text-gray-500 line-through text-lg"
                  data-oid="r5cs317"
                >
                  ₺{product.base_price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold" data-oid="pk356qf">
                ₺{product.base_price.toFixed(2)}
              </span>
            )}

            {/* Free shipping notice */}
            <p
              className="text-sm text-green-600 mt-2 flex items-center"
              data-oid="u0a0ccv"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-oid=".2-nk5z"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  data-oid="1ls1qi0"
                />
              </svg>
              500₺ üzeri siparişlerde kargo bedava
            </p>
          </div>

          {/* Stock Status */}
          <div className="mb-6 flex items-center" data-oid="how3uxk">
            {isInStock ? (
              <>
                <span
                  className="h-3 w-3 bg-green-500 rounded-full mr-2"
                  data-oid="dd:wocv"
                ></span>
                <p className="text-green-600 font-medium" data-oid="quvnpb2">
                  Stokta Var - 24 saat içinde kargoda
                </p>
              </>
            ) : (
              <>
                <span
                  className="h-3 w-3 bg-red-500 rounded-full mr-2"
                  data-oid="fpq49_h"
                ></span>
                <p className="text-red-600 font-medium" data-oid="brdz:3e">
                  Stokta Yok
                </p>
              </>
            )}
          </div>

          {/* Description */}
          <div className="mb-8" data-oid="::9er7j">
            <h2 className="text-lg font-semibold mb-2" data-oid="2nopy4b">
              Ürün Açıklaması
            </h2>
            <p className="text-gray-700" data-oid="g8t92rk">
              {product.description}
            </p>
          </div>

          {/* Add to Cart */}
          <div
            className="flex flex-col sm:flex-row gap-4 mb-8"
            data-oid="2brmgae"
          >
            {isInStock ? (
              <>
                <div className="flex border rounded-md" data-oid="r51rqzk">
                  <button
                    className="px-4 py-2 border-r hover:bg-gray-50"
                    data-oid="r87:jdq"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-16 text-center focus:outline-none"
                    data-oid="qj:rssf"
                  />

                  <button
                    className="px-4 py-2 border-l hover:bg-gray-50"
                    data-oid="1em99c-"
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
                  data-oid="eohspzl"
                />
              </>
            ) : (
              <div className="w-full" data-oid="ktycfv0">
                <button
                  className="w-full py-3 px-4 bg-gray-200 text-gray-600 rounded-md cursor-not-allowed flex items-center justify-center"
                  disabled
                  data-oid="7n-gw1v"
                >
                  Stokta Yok
                </button>
                <p className="text-sm text-gray-600 mt-2" data-oid="03_:na1">
                  Stok durumu için lütfen bizimle iletişime geçin.
                </p>
                <a
                  href="/iletisim"
                  className="text-primary text-sm hover:underline mt-1 inline-block"
                  data-oid="68tg0ef"
                >
                  Haber ver
                </a>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="border-t pt-6" data-oid="ejds9p3">
            <div className="grid grid-cols-2 gap-4 mb-6" data-oid="rchr:_d">
              <div data-oid="xv4khd6">
                <p className="text-gray-500 text-sm" data-oid="quj94mi">
                  SKU:
                </p>
                <p data-oid="56_f67.">{product.sku || "N/A"}</p>
              </div>
              <div data-oid="o0ehb99">
                <p className="text-gray-500 text-sm" data-oid="1ap-z6k">
                  Kategori:
                </p>
                <p data-oid="azuq.f1">{product.category_name || "N/A"}</p>
              </div>
            </div>

            {/* Secure shopping */}
            <div
              className="flex items-center space-x-4 text-sm text-gray-500"
              data-oid="dktwph:"
            >
              <div className="flex items-center" data-oid="03h5588">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="u3bzpxa"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    data-oid="-0ewil-"
                  />
                </svg>
                Güvenli Ödeme
              </div>
              <div className="flex items-center" data-oid="qpvzkwc">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="16:vv07"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    data-oid="bfkc-17"
                  />
                </svg>
                14 Gün İade
              </div>
              <div className="flex items-center" data-oid="r88-jq7">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="9iq.p1k"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    data-oid="2scd077"
                  />
                </svg>
                Orijinal Ürün
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-16" data-oid="j9e3iqk">
        <div className="border-b" data-oid="-gjywzy">
          <ul className="flex flex-wrap -mb-px" data-oid="h9ga4ug">
            <li className="mr-2" data-oid="mw:fpqp">
              <button
                className="inline-block py-4 px-6 border-b-2 border-primary font-medium text-primary"
                data-oid="bouevpu"
              >
                Detaylar
              </button>
            </li>
            <li className="mr-2" data-oid="j.:q3x2">
              <button
                className="inline-block py-4 px-6 border-b-2 border-transparent hover:border-gray-300 font-medium text-gray-600"
                data-oid="qttrhty"
              >
                Özellikler
              </button>
            </li>
            <li className="mr-2" data-oid="z636dk8">
              <button
                className="inline-block py-4 px-6 border-b-2 border-transparent hover:border-gray-300 font-medium text-gray-600"
                data-oid="y7wgbol"
              >
                Değerlendirmeler (24)
              </button>
            </li>
          </ul>
        </div>

        <div className="py-6" data-oid="pbsl98e">
          <p className="text-gray-700 mb-4" data-oid="uz19m69">
            {product.description}
          </p>
          <p className="text-gray-700" data-oid="953pbch">
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
        <div data-oid="et09u38">
          <h2 className="text-2xl font-bold mb-6" data-oid="ojrq3t9">
            Benzer Ürünler
          </h2>
          <ProductGrid products={relatedProducts} data-oid="j:fja-g" />
        </div>
      )}
    </div>
  );
}
