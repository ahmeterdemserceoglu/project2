"use client"; // This directive is Next.js specific and might not be needed in a generic React setup, but can be kept for context.

import React, { useEffect, useRef, useState, Suspense } from "react"; // Standard React import
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";
import SearchParamsHandler from "@/components/SearchParamsHandler";
import "./anasayfa.css";

// E-commerce product data structure
const products = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 54999.99,
    originalPrice: 59999.99,
    image: "/images/iphone-15-pro.jpg",
    tag: "APPLE",
    description: "En gelişmiş iPhone deneyimi.",
    rating: 4.8,
    reviewCount: 342,
    category: "Elektronik",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 2,
    name: "Samsung Galaxy Watch 6",
    price: 3299.99,
    originalPrice: 3799.99,
    image: "/images/galaxy-watch-6.jpg",
    tag: "SAMSUNG",
    description: "Akıllı saat teknolojisinin zirvesi.",
    rating: 4.6,
    reviewCount: 189,
    category: "Elektronik",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 3,
    name: "Ergonomik Ofis Koltuğu",
    price: 2899.99,
    originalPrice: 3499.99,
    image: "/images/office-chair.jpg",
    tag: "HERMAN",
    description: "Uzun çalışma saatleri için ideal.",
    rating: 4.7,
    reviewCount: 156,
    category: "Mobilya",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 4,
    name: "MacBook Air M3",
    price: 42999.99,
    originalPrice: 47999.99,
    image: "/images/macbook-air-m3.jpg",
    tag: "APPLE",
    description: "Güçlü performans, hafif tasarım.",
    rating: 4.9,
    reviewCount: 278,
    category: "Elektronik",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 5,
    name: "Modern L Koltuk Takımı",
    price: 12999.99,
    originalPrice: 15999.99,
    image: "/images/l-sofa-set.jpg",
    tag: "IKEA",
    description: "Şık ve konforlu oturma grubu.",
    rating: 4.5,
    reviewCount: 89,
    category: "Mobilya",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 6,
    name: "Sony WH-1000XM5 Kulaklık",
    price: 4299.99,
    originalPrice: 4999.99,
    image: "/images/sony-headphones.jpg",
    tag: "SONY",
    description: "Endüstri lideri gürültü engelleme.",
    rating: 4.8,
    reviewCount: 234,
    category: "Elektronik",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 7,
    name: 'Akıllı 65" OLED TV',
    price: 24999.99,
    originalPrice: 29999.99,
    image: "/images/oled-tv-65.jpg",
    tag: "LG",
    description: "4K HDR ile sinema deneyimi.",
    rating: 4.7,
    reviewCount: 167,
    category: "Elektronik",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 8,
    name: "Yemek Masası Takımı",
    price: 5999.99,
    originalPrice: 7499.99,
    image: "/images/dining-table-set.jpg",
    tag: "BELLONA",
    description: "6 kişilik modern yemek masası.",
    rating: 4.4,
    reviewCount: 78,
    category: "Mobilya",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 9,
    name: "Gaming Mekanik Klavye",
    price: 1299.99,
    originalPrice: 1599.99,
    image: "/images/gaming-keyboard.jpg",
    tag: "RAZER",
    description: "RGB aydınlatmalı mekanik klavye.",
    rating: 4.6,
    reviewCount: 145,
    category: "Elektronik",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 10,
    name: "Kahve Makinesi Deluxe",
    price: 3499.99,
    originalPrice: 3999.99,
    image: "/images/coffee-machine.jpg",
    tag: "NESPRESSO",
    description: "Profesyonel kahve deneyimi.",
    rating: 4.5,
    reviewCount: 112,
    category: "Ev Aletleri",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 11,
    name: "Yatak Odası Takımı",
    price: 18999.99,
    originalPrice: 22999.99,
    image: "/images/bedroom-set.jpg",
    tag: "YATAŞ",
    description: "Komplet yatak odası mobilyası.",
    rating: 4.6,
    reviewCount: 67,
    category: "Mobilya",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 12,
    name: "Draadloze Oordopjes Pro",
    price: 899.99,
    originalPrice: 1199.99,
    image: "/images/wireless-earbuds.jpg",
    tag: "AIRPODS",
    description: "Kablosuz müzik deneyimi.",
    rating: 4.7,
    reviewCount: 298,
    category: "Elektronik",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 13,
    name: "Akıllı Buzdolabı",
    price: 32999.99,
    originalPrice: 37999.99,
    image: "/images/smart-fridge.jpg",
    tag: "SAMSUNG",
    description: "WiFi bağlantılı akıllı buzdolabı.",
    rating: 4.8,
    reviewCount: 89,
    category: "Ev Aletleri",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 14,
    name: "Fitness Tracker Akıllı Bileklik",
    price: 1599.99,
    originalPrice: 1999.99,
    image: "/images/fitness-tracker.jpg",
    tag: "FITBIT",
    description: "Sağlık takibi ve spor analizi.",
    rating: 4.4,
    reviewCount: 156,
    category: "Elektronik",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 15,
    name: "LED Masa Lambası",
    price: 449.99,
    originalPrice: 599.99,
    image: "/images/led-desk-lamp.jpg",
    tag: "PHILIPS",
    description: "Ayarlanabilir LED aydınlatma.",
    rating: 4.3,
    reviewCount: 234,
    category: "Ev & Yaşam",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
];

// Categories for navigation
const categories = [
  {
    id: 1,
    name: "Elektronik",
    image: "/images/category-electronics.jpg",
    count: 1250,
  },
  {
    id: 2,
    name: "Mobilya",
    image: "/images/category-furniture.jpg",
    count: 890,
  },
  {
    id: 3,
    name: "Ev Aletleri",
    image: "/images/category-appliances.jpg",
    count: 567,
  },
  { id: 4, name: "Ev & Yaşam", image: "/images/category-home.jpg", count: 423 },
  {
    id: 5,
    name: "Spor & Outdoor",
    image: "/images/category-sports.jpg",
    count: 334,
  },
];

// Format price in Turkish Lira
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(price);
};

export default function Home() {
  const router = useRouter();
  const { showToast } = useToast();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const productRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // Parallax scroll effect & product animation
    const handleScroll = () => {
      const scrolled = window.scrollY;
      document.documentElement.style.setProperty("--scroll", `${scrolled}px`);

      productRefs.current.forEach((item, index) => {
        if (item) {
          const rect = item.getBoundingClientRect();
          const isInView = rect.top < window.innerHeight && rect.bottom > 0;

          if (isInView) {
            item.style.transform = `translateX(${(index % 2 === 0 ? -1 : 1) * Math.min(scrolled * 0.02, 10)}px) translateY(${Math.sin(scrolled * 0.001 + index) * 5}px) rotateZ(${Math.cos(scrolled * 0.0005 + index) * 1}deg)`;
            item.style.opacity = "1";
          } else {
            // item.style.opacity = '0'; // Optional: Fade out when scrolled past
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll(); // Initialize scroll-based animations

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Function to handle image errors - uses standard img tag properties
  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
    productName: string,
  ) => {
    const target = event.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop if placeholder also fails
    target.src = `https://placehold.co/500x500/1a1a1a/4a4a4a?text=${productName.replace(/\s/g, "+")}`;
  };

  // Handle newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
    }, 1500);
  };

  return (
    <main className="overflow-hidden" data-oid="swbyhh4">
      <Suspense fallback={null} data-oid="-.wa6sh">
        <SearchParamsHandler data-oid=":-uqdu_" />
      </Suspense>

      {/* Liquid Header Section */}
      <section
        className="liquid-header h-screen relative overflow-hidden"
        data-oid="3:.7l4r"
      >
        <div className="liquid-shape" data-oid="2sjhzf7"></div>
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          data-oid="mjt2137"
        >
          <div className="glitch-container" data-oid=":g8emyc">
            <h1
              className="glitch-text"
              data-text="DIMENSION"
              data-oid="chnj9yp"
            >
              DIMENSION
            </h1>
          </div>
          <div className="mt-32 transform -rotate-90" data-oid=":t7hg5l">
            <p className="vertical-text" data-oid="kpkyeo3">
              ALIŞKANLIKLARINIZI DEĞİŞTİRİN
            </p>
          </div>
        </div>
        <div className="scroll-indicator" data-oid="8nuoia7">
          <div className="line" data-oid="h35ndu-"></div>
          <div className="dot" data-oid="dayk:ho"></div>
        </div>
      </section>

      {/* Diagonal Split Section */}
      <section
        className="diagonal-split relative h-screen overflow-hidden"
        data-oid="e2w0dvo"
      >
        <div className="split-left" data-oid="whofom8"></div>
        <div className="split-right" data-oid="0p1lbt6">
          <div
            className="content-container ml-auto w-1/2 p-12"
            data-oid="0rac86_"
          >
            <h2 className="distortion-text text-5xl mb-6" data-oid="p4t-ukv">
              BOYUTUN ÖTESİNDE
            </h2>
            <p className="max-w-md fade-in-text" data-oid="xfmrdw5">
              Alışılmışın dışında, yerçekimine meydan okuyan bir alışveriş
              deneyimi. Nesnelerin sadece üç boyutlu olmadığı, duyguları ve
              hikayeleri içinde barındırdığı bir dünya keşfedin.
            </p>
            <div className="mt-8" data-oid="5n7ik8y">
              {/* Replaced Next.js Link with standard <a> tag */}
              <a
                href="/collections"
                className="hover-button"
                data-oid="d8s16mc"
              >
                KOLEKSİYONLARI KEŞFET
              </a>
            </div>
          </div>
        </div>
        <div className="floating-cube" data-oid="-56h3_8"></div>
      </section>

      {/* Featured Products Section - Modern Design */}
      <section className="py-16 bg-white dark:bg-gray-900" data-oid="savbcs1">
        <div className="container mx-auto px-4" data-oid="710z6rj">
          <div className="text-center mb-12" data-oid="kf_qzkw">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-wide"
              data-oid="myzoxh:"
            >
              ÖNE ÇIKANLAR
            </h2>
            <p
              className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto"
              data-oid="y_8gfie"
            >
              En popüler ve en çok tercih edilen ürünlerimizi keşfedin
            </p>
          </div>

          {/* Mobile: Horizontal Scroll */}
          <div className="block md:hidden mb-8" data-oid="gqakzd:">
            <div
              className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
              data-oid="dl4s2ek"
            >
              {products.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-64 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md"
                  data-oid="jo.2y:j"
                >
                  <div
                    className="aspect-square bg-gray-200 dark:bg-gray-700"
                    data-oid="ah6:kh7"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, product.name)}
                      data-oid="p2kgigg"
                    />
                  </div>
                  <div className="p-4" data-oid="ftf1axc">
                    <h3
                      className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2"
                      data-oid="leoeil8"
                    >
                      {product.name}
                    </h3>
                    <div
                      className="flex items-center justify-between"
                      data-oid="nvbniq4"
                    >
                      <span
                        className="text-blue-600 font-bold text-lg"
                        data-oid="bwx:3ar"
                      >
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span
                          className="text-gray-500 line-through text-sm"
                          data-oid="4qnx5-k"
                        >
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div
            className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6"
            data-oid="i25.60x"
          >
            {products.slice(0, 8).map((product) => (
              <div
                key={product.id}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                data-oid="lfp0g6r"
              >
                <div
                  className="relative aspect-square bg-gray-100 dark:bg-gray-700"
                  data-oid="4mv6wc3"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => handleImageError(e, product.name)}
                    data-oid="r-._jo-"
                  />

                  {product.isNew && (
                    <div
                      className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold"
                      data-oid="pun1wws"
                    >
                      Yeni
                    </div>
                  )}
                  {product.originalPrice > product.price && (
                    <div
                      className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold"
                      data-oid="vinj7t5"
                    >
                      %
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100,
                      )}{" "}
                      İndirim
                    </div>
                  )}
                </div>
                <div className="p-4" data-oid="hy79:ij">
                  <div
                    className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide"
                    data-oid="tkrto65"
                  >
                    {product.category}
                  </div>
                  <h3
                    className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2"
                    data-oid="5dsdtm:"
                  >
                    {product.name}
                  </h3>

                  <div className="flex items-center mb-3" data-oid="e6txrmd">
                    <div className="flex text-yellow-400" data-oid="gij0arg">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-current" : "text-gray-300"}`}
                          viewBox="0 0 20 20"
                          data-oid="x1k2y:g"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            data-oid="fu5o_2g"
                          />
                        </svg>
                      ))}
                    </div>
                    <span
                      className="text-sm text-gray-500 dark:text-gray-400 ml-2"
                      data-oid="1rk2q2s"
                    >
                      ({product.reviewCount})
                    </span>
                  </div>

                  <div
                    className="flex items-center justify-between mb-4"
                    data-oid="9:im4h_"
                  >
                    <div data-oid="d0knbl5">
                      <span
                        className="text-xl font-bold text-gray-900 dark:text-white"
                        data-oid="fku9n4z"
                      >
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span
                          className="text-sm text-gray-500 line-through ml-2"
                          data-oid="6r_hohs"
                        >
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={`/products/${product.id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block font-medium"
                    data-oid="7i:zztn"
                  >
                    İncele
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12" data-oid="3zik-9k">
            <a
              href="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-block"
              data-oid="6ktfw5l"
            >
              Tüm Ürünleri Gör
            </a>
          </div>
        </div>
      </section>

      {/* Categories Showcase Section */}
      <section
        className="categories-showcase py-20 bg-gray-50 dark:bg-gray-900"
        data-oid="k6t64ru"
      >
        <div className="container mx-auto px-4" data-oid="ra2af_p">
          <div className="text-center mb-16" data-oid="-et86_6">
            <h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              data-oid="vwqoogs"
            >
              Kategorilerimizi Keşfedin
            </h2>
            <p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              data-oid="j6p_rln"
            >
              Her ihtiyacınız için geniş ürün yelpazesi. Kaliteli markalar,
              uygun fiyatlar.
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            data-oid="kgh:s8r"
          >
            {categories.map((category, i) => (
              <div
                key={category.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                data-oid="unu65cd"
              >
                <div
                  className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-500 to-purple-600 p-8"
                  data-oid="rz_-2dm"
                >
                  <div
                    className="flex items-center justify-center h-full"
                    data-oid="0b7fmqd"
                  >
                    <div className="text-center text-white" data-oid="lzkzh7:">
                      <div className="text-6xl mb-4" data-oid="-wyphz8">
                        {["📱", "🪑", "🏠", "💡", "⚽"][i]}
                      </div>
                      <h3
                        className="text-2xl font-bold mb-2"
                        data-oid="rp4l6n2"
                      >
                        {category.name}
                      </h3>
                      <p className="text-blue-100" data-oid="3..qy.n">
                        {category.count} ürün
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6" data-oid="ktkuwho">
                  <div
                    className="flex items-center justify-between"
                    data-oid="5.u8lci"
                  >
                    <div data-oid=":dt6b-:">
                      <h4
                        className="font-semibold text-gray-900 dark:text-white mb-2"
                        data-oid="4yjy56q"
                      >
                        Popüler Ürünler
                      </h4>
                      <p
                        className="text-sm text-gray-600 dark:text-gray-400"
                        data-oid="l3appg0"
                      >
                        En çok tercih edilen ürünleri keşfedin
                      </p>
                    </div>
                    <a
                      href={`/category/${category.name.toLowerCase()}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      data-oid="-.g9t6p"
                    >
                      Görüntüle
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Special Offers Grid */}
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            data-oid="x_ai:2j"
          >
            <div
              className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-8 text-white"
              data-oid="s3vywjw"
            >
              <h3 className="text-3xl font-bold mb-4" data-oid="65.b5sy">
                Süper Fırsatlar
              </h3>
              <p className="text-lg mb-6 text-red-100" data-oid="l:42-7g">
                Seçili ürünlerde %70'e varan indirimler
              </p>
              <a
                href="/deals"
                className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                data-oid="r0amz7d"
              >
                Fırsatları Gör
              </a>
            </div>

            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white"
              data-oid=":lwb8n9"
            >
              <h3 className="text-3xl font-bold mb-4" data-oid="xtfxzum">
                Ücretsiz Kargo
              </h3>
              <p className="text-lg mb-6 text-green-100" data-oid="kqjh4sf">
                500₺ ve üzeri alışverişlerde kargo bizden
              </p>
              <a
                href="/shipping"
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                data-oid="syuiecr"
              >
                Detayları Öğren
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Perspective Tunnel */}
      <section
        className="perspective-tunnel relative h-screen overflow-hidden"
        data-oid="dhdtcct"
      >
        <div className="tunnel-container" data-oid="3y:ojh7">
          <div className="tunnel-walls" data-oid="2iy5nmx">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`tunnel-segment segment-${i + 1}`}
                data-oid="sdeltf8"
              ></div>
            ))}
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            data-oid="7.tnx_w"
          >
            <div
              className="text-content max-w-md text-center"
              data-oid="e86jmzr"
            >
              <h2
                className="text-4xl mb-6 font-light tracking-widest"
                data-oid="qki:o92"
              >
                HİÇ OLMADIĞI GİBİ
              </h2>
              <p className="mb-8 blur-text" data-oid="ymf-jlo">
                Algılarınızın sınırlarını zorlayan, mekanın ve zamanın ötesinde
                bir keşif. Alışkanlıklarınızı bırakın, yeniden tanımlanan bir
                deneyime adım atın.
              </p>
              <a href="/explore" className="cipher-button" data-oid="v4hiji9">
                OLASILIĞI KEŞFETMEYİ DENE
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section
        className="newsletter-section py-24 relative overflow-hidden"
        data-oid="gl6-2h7"
      >
        <div className="absolute inset-0 z-0" data-oid="cdhimfv">
          <div className="newsletter-bg" data-oid="dw6lk78"></div>
        </div>

        <div
          className="container mx-auto px-4 relative z-10"
          data-oid="jz.u..m"
        >
          <div className="max-w-xl mx-auto text-center" data-oid="1tblx0q">
            <h2
              className="text-3xl md:text-4xl font-light mb-4"
              data-oid="qtow48h"
            >
              GÜNCEL KALIN
            </h2>
            <p className="mb-8" data-oid=".o_e:6j">
              Yeni ürünler, özel indirimler ve kampanyalardan ilk siz haberdar
              olun.
            </p>

            {subscribed ? (
              <div
                className="success-message p-4 bg-green-500/20 backdrop-blur-sm rounded-lg"
                data-oid="upbhc.8"
              >
                <p data-oid="de_oz5t">
                  Teşekkürler! Bültenimize başarıyla abone oldunuz.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-4"
                data-oid="b9bn3mv"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  required
                  className="flex-grow px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  data-oid="-7hgk4x"
                />

                <button
                  type="submit"
                  className="primary-button px-6 py-3 whitespace-nowrap"
                  disabled={loading}
                  data-oid="agu5sb8"
                >
                  {loading ? "GÖNDERİLİYOR..." : "ABONE OL"}
                </button>
              </form>
            )}

            <p className="text-xs text-gray-400 mt-4" data-oid="dsw:-.8">
              Abone olarak,{" "}
              <a href="/privacy" className="underline" data-oid="zvy8q8.">
                Gizlilik Politikamızı
              </a>{" "}
              kabul etmiş olursunuz. İstediğiniz zaman abonelikten
              çıkabilirsiniz.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
