import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import AddToCartButton from "@/components/products/AddToCartButton";
import ProductGrid from "@/components/products/ProductGrid";
import { createServerComponentClient } from "@/lib/supabase";
import { Product } from "@/lib/supabase";
import Link from "next/link";
import { normalizeSlug } from "@/lib/utils";

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
      description: "Aradığınız ürün bulunamadı.",
    };
  }

  return {
    title: `${product.name} | HDTicaret.com`,
    description: product.description || `${product.name} - HDTicaret.com'da satın alın`,
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} - HDTicaret.com'da satın alın`,
      images: [
        {
          url: product.primary_image_url || '/images/placeholder.png',
          width: 800,
          height: 600,
          alt: product.name,
        }
      ],
      type: 'website',
    },
  };
}

// Generate static params for common products to improve performance
export async function generateStaticParams() {
  // In production, you would fetch this from your database
  // For now, using mock data
  return mockProducts.map((product) => ({
    slug: product.slug,
  }));
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
  //   .eq('slug', normalizeSlug(slug))
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
  // Use the normalizeSlug utility function
  const normalizedSlug = normalizeSlug(slug);
  const product = mockProducts.find(
    (p: Product & { slug: string }) => normalizeSlug(p.slug) === normalizedSlug,
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
    <div className="container mx-auto py-12 px-4" data-oid=".w-4.yi">
      {/* Breadcrumb */}
      <div
        className="text-sm mb-6 flex items-center text-gray-500 overflow-x-auto whitespace-nowrap"
        data-oid="_-y7clz"
      >
        <Link href="/" className="hover:text-primary transition-colors" data-oid="cr.gpa.">
          Ana Sayfa
        </Link>
        <span className="mx-2" data-oid="hsiq.vk">
          /
        </span>
        <Link href="/products" className="hover:text-primary transition-colors" data-oid="t69:s.v">
          Ürünler
        </Link>
        {product.category_name && (
          <>
            <span className="mx-2" data-oid="gkwdnj7">
              /
            </span>
            <Link 
              href={`/category/${product.category_id}`} 
              className="hover:text-primary transition-colors"
              data-oid="s__o.2j"
            >
              {product.category_name}
            </Link>
          </>
        )}
        <span className="mx-2" data-oid="vc1d97d">
          /
        </span>
        <span className="text-primary font-medium truncate" data-oid="mqmok22">
          {product.name}
        </span>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16"
        data-oid="y:0ssbd"
      >
        {/* Product Images */}
        <div className="space-y-6" data-oid="z_f6mbh">
          {/* Main Image */}
          <div
            className="relative aspect-square overflow-hidden rounded-xl shadow-md bg-white"
            data-oid="2stc1zq"
          >
            <Image
              src={product.primary_image_url || "/images/placeholder.png"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4"
              priority
              data-oid="f163.w1"
            />

            {product.sale_price && (
              <div
                className="absolute top-4 left-4 bg-accent text-white text-sm font-medium px-3 py-1 rounded-full"
                data-oid="jgfgc0c"
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
                data-oid="knx:m-y"
              >
                <span
                  className="bg-red-600 text-white px-4 py-2 rounded-md font-medium text-lg transform -rotate-12"
                  data-oid="v15:4te"
                >
                  Stokta Yok
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-3" data-oid="l07xujd">
            {product.images.map((image: any) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-md cursor-pointer border-2 border-transparent hover:border-primary transition-colors bg-white shadow-sm"
                data-oid="9c5ck:n"
              >
                <Image
                  src={image.image_url}
                  alt={image.alt_text || product.name}
                  fill
                  sizes="25vw"
                  className="object-contain p-2"
                  data-oid="qhf6u5y"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div data-oid="x2dp4vv">
          {product.category_name && (
            <p
              className="text-sm text-primary font-medium mb-2"
              data-oid=":cvf0la"
            >
              {product.category_name}
            </p>
          )}
          <h1 className="text-3xl font-bold mb-4" data-oid=".5ak2v:">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center mb-6" data-oid="8quzrtn">
            <div
              className="flex items-center text-yellow-400"
              data-oid="81sfdgz"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="1g0xp9z"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="012s_us"
                />
              </svg>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="t_ft16c"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="f16..f4"
                />
              </svg>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="iqx371v"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="ngelrq1"
                />
              </svg>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="aeqwy.u"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="_6t1ev7"
                />
              </svg>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                data-oid="lo1jan4"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  data-oid="2.rs4dt"
                />
              </svg>
            </div>
            <p className="ml-2 text-gray-600 text-sm" data-oid="j86wupn">
              (24 Değerlendirme)
            </p>
          </div>

          {/* Price */}
          <div className="mb-6" data-oid="2hzxf7d">
            {product.sale_price ? (
              <div className="flex items-center gap-2" data-oid="aw8tn.d">
                <span className="text-3xl font-bold" data-oid="ur_1et8">
                  ₺{product.sale_price.toFixed(2)}
                </span>
                <span
                  className="text-gray-500 line-through text-lg"
                  data-oid=":l.j0cc"
                >
                  ₺{product.base_price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold" data-oid="m:xvzi1">
                ₺{product.base_price.toFixed(2)}
              </span>
            )}

            {/* Free shipping notice */}
            <p
              className="text-sm text-green-600 mt-2 flex items-center"
              data-oid="6:32h9q"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-oid="e3i0jzh"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  data-oid=".:xqtmu"
                />
              </svg>
              500₺ üzeri siparişlerde kargo bedava
            </p>
          </div>

          {/* Stock Status */}
          <div className="mb-6 flex items-center" data-oid="ia_pbxy">
            {isInStock ? (
              <>
                <span
                  className="h-3 w-3 bg-green-500 rounded-full mr-2"
                  data-oid="r.9fnyv"
                ></span>
                <p className="text-green-600 font-medium" data-oid="t4ugjr9">
                  Stokta Var - 24 saat içinde kargoda
                </p>
              </>
            ) : (
              <>
                <span
                  className="h-3 w-3 bg-red-500 rounded-full mr-2"
                  data-oid="zkxoshv"
                ></span>
                <p className="text-red-600 font-medium" data-oid="pp5vgfa">
                  Stokta Yok
                </p>
              </>
            )}
          </div>

          {/* Description */}
          <div className="mb-8" data-oid="b6lbztb">
            <h2 className="text-lg font-semibold mb-2" data-oid="_57aldy">
              Ürün Açıklaması
            </h2>
            <p className="text-gray-700" data-oid="k:.u9eu">
              {product.description}
            </p>
          </div>

          {/* Add to Cart */}
          <div
            className="flex flex-col sm:flex-row gap-4 mb-8"
            data-oid="47.sktw"
          >
            {isInStock ? (
              <>
                <div className="flex border rounded-md" data-oid="srn-ydg">
                  <button
                    className="px-4 py-2 border-r hover:bg-gray-50"
                    data-oid=":7lquut"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-16 text-center focus:outline-none"
                    data-oid="-kc1h11"
                  />

                  <button
                    className="px-4 py-2 border-l hover:bg-gray-50"
                    data-oid="4ojehas"
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
                  data-oid="3jh-2ua"
                />
              </>
            ) : (
              <div className="w-full" data-oid="9eo6cx6">
                <button
                  className="w-full py-3 px-4 bg-gray-200 text-gray-600 rounded-md cursor-not-allowed flex items-center justify-center"
                  disabled
                  data-oid="i8wcgjr"
                >
                  Stokta Yok
                </button>
                <p className="text-sm text-gray-600 mt-2" data-oid="9b52mdy">
                  Stok durumu için lütfen bizimle iletişime geçin.
                </p>
                <a
                  href="/iletisim"
                  className="text-primary text-sm hover:underline mt-1 inline-block"
                  data-oid=":92-7-b"
                >
                  Haber ver
                </a>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="border-t pt-6" data-oid="olqfip2">
            <div className="grid grid-cols-2 gap-4 mb-6" data-oid="orhba.v">
              <div data-oid="o_0t.4n">
                <p className="text-gray-500 text-sm" data-oid="3v6x-9e">
                  SKU:
                </p>
                <p data-oid="ir5_mou">{product.sku || "N/A"}</p>
              </div>
              <div data-oid="yuftq2k">
                <p className="text-gray-500 text-sm" data-oid="7v1emx7">
                  Kategori:
                </p>
                <p data-oid="owqxdr4">{product.category_name || "N/A"}</p>
              </div>
            </div>

            {/* Secure shopping */}
            <div
              className="flex items-center space-x-4 text-sm text-gray-500"
              data-oid="itwc:xq"
            >
              <div className="flex items-center" data-oid="ewoqlmq">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="t:vxun0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    data-oid="zfrn3h0"
                  />
                </svg>
                Güvenli Ödeme
              </div>
              <div className="flex items-center" data-oid="kz2upqv">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="kaag-61"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    data-oid="8-zklxz"
                  />
                </svg>
                14 Gün İade
              </div>
              <div className="flex items-center" data-oid="d3nyq.b">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="g6a.g9h"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    data-oid="edjzpx5"
                  />
                </svg>
                Orijinal Ürün
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-16" data-oid="7-td4qd">
        <div className="border-b" data-oid="j:51msq">
          <ul className="flex flex-wrap -mb-px" data-oid="q3chfe9">
            <li className="mr-2" data-oid="26e1:h7">
              <button
                className="inline-block py-4 px-6 border-b-2 border-primary font-medium text-primary"
                data-oid="x2rmhm9"
              >
                Detaylar
              </button>
            </li>
            <li className="mr-2" data-oid="ft71jip">
              <button
                className="inline-block py-4 px-6 border-b-2 border-transparent hover:border-gray-300 font-medium text-gray-600"
                data-oid="5lip93s"
              >
                Özellikler
              </button>
            </li>
            <li className="mr-2" data-oid="8o_u.5n">
              <button
                className="inline-block py-4 px-6 border-b-2 border-transparent hover:border-gray-300 font-medium text-gray-600"
                data-oid="by:fe0e"
              >
                Değerlendirmeler (24)
              </button>
            </li>
          </ul>
        </div>

        <div className="py-6" data-oid="0mnmuch">
          <p className="text-gray-700 mb-4" data-oid="cyl7mti">
            {product.description}
          </p>
          <p className="text-gray-700" data-oid="g14nend">
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
        <div data-oid="3bcxiih">
          <h2 className="text-2xl font-bold mb-6" data-oid="ude1h79">
            Benzer Ürünler
          </h2>
          <ProductGrid products={relatedProducts} data-oid="szcqpcs" />
        </div>
      )}
    </div>
  );
}
