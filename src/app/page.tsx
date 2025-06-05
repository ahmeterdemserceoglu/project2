"use client"; // This directive is Next.js specific and might not be needed in a generic React setup, but can be kept for context.

import React, { useEffect, useRef, useState, Suspense } from "react"; // Standard React import
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";
import SearchParamsHandler from "@/components/SearchParamsHandler";
import "./anasayfa.css";

// Improved product data structure with more e-commerce related fields
const products = [
  {
    id: 1,
    name: "Kozmik Nesne 1",
    price: 199.99,
    originalPrice: 249.99,
    image: "/images/product-1.jpg",
    tag: "DM.001",
    description: "Evrenin uzak köşelerinden bir parça.",
    rating: 4.5,
    reviewCount: 28,
    category: "Kozmik",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 2,
    name: "Kuantum Küre",
    price: 249.99,
    originalPrice: 299.99,
    image: "/images/product-2.jpg",
    tag: "DM.002",
    description: "Olasılıkları içinde barındıran küre.",
    rating: 4.7,
    reviewCount: 42,
    category: "Kuantum",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 3,
    name: "Boyut Kristali",
    price: 329.99,
    originalPrice: 399.99,
    image: "/images/product-3.jpg",
    tag: "DM.003",
    description: "Farklı boyutlara açılan bir anahtar.",
    rating: 4.3,
    reviewCount: 16,
    category: "Kristal",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 4,
    name: "Nova Artefaktı",
    price: 179.99,
    originalPrice: 219.99,
    image: "/images/product-4.jpg",
    tag: "DM.004",
    description: "Yıldız tozundan dövülmüş kadim bir obje.",
    rating: 4.8,
    reviewCount: 37,
    category: "Artefakt",
    inStock: false,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 5,
    name: "Sicim Heykeli",
    price: 499.99,
    originalPrice: 599.99,
    image: "/images/product-5.jpg",
    tag: "DM.005",
    description: "Gerçekliğin dokusunu yansıtan heykel.",
    rating: 4.9,
    reviewCount: 53,
    category: "Heykel",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 6,
    name: "Kara Delik Kalıntısı",
    price: 399.99,
    originalPrice: 449.99,
    image: "/images/product-6.jpg",
    tag: "DM.006",
    description: "Kara deliğin merkezinden alınmış parça.",
    rating: 4.6,
    reviewCount: 31,
    category: "Kozmik",
    inStock: true,
    isNew: false,
    isFeatured: false,
  },
  {
    id: 7,
    name: "Zaman Kapsülü",
    price: 299.99,
    originalPrice: 349.99,
    image: "/images/product-7.jpg",
    tag: "DM.007",
    description: "Zamanın akışını yavaşlatan bir cihaz.",
    rating: 4.4,
    reviewCount: 19,
    category: "Zaman",
    inStock: true,
    isNew: true,
    isFeatured: false,
  },
  {
    id: 8,
    name: "Enerji Kristali",
    price: 159.99,
    originalPrice: 189.99,
    image: "/images/product-8.jpg",
    tag: "DM.008",
    description: "Sonsuz enerji barındıran kristal.",
    rating: 4.2,
    reviewCount: 24,
    category: "Kristal",
    inStock: true,
    isNew: false,
    isFeatured: false,
  },
];

// Categories for navigation
const categories = [
  { id: 1, name: "Kozmik", image: "/images/category-cosmic.jpg", count: 12 },
  { id: 2, name: "Kuantum", image: "/images/category-quantum.jpg", count: 8 },
  { id: 3, name: "Kristal", image: "/images/category-crystal.jpg", count: 15 },
  { id: 4, name: "Artefakt", image: "/images/category-artefact.jpg", count: 9 },
  { id: 5, name: "Heykel", image: "/images/category-sculpture.jpg", count: 7 },
];

// Format price in Turkish Lira
const formatPrice = (price: number) => {
  return `₺${price.toFixed(2)}`;
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

      {/* Fragmented Product Gallery - UPDATED */}
      <section className="fragmented-gallery relative py-20" data-oid="savbcs1">
        <div className="container mx-auto" data-oid="710z6rj">
          <div className="gallery-label" data-oid="kf_qzkw">
            <span className="thin-line" data-oid="nox_ru8"></span>
            <h3
              className="text-xl tracking-[0.5em] uppercase"
              data-oid="pwlc6tx"
            >
              Öne Çıkanlar
            </h3>
          </div>

          <div className="fragment-container my-20" data-oid="i25.60x">
            {products.map((product, i) => (
              <div
                key={product.id}
                ref={(el) => {
                  productRefs.current[i] = el;
                  return undefined;
                }}
                className={`fragment-item fragment-${i + 1}`}
                data-oid="lfp0g6r"
              >
                <div className="fragment-image" data-oid="4mv6wc3">
                  {/* Replaced Next.js Image with standard <img> tag */}
                  <img
                    src={product.image}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="object-cover" // Ensure this class handles width/height correctly for img
                    onError={(e) => handleImageError(e, product.name)}
                    data-oid="r-._jo-"
                  />
                </div>
                <div className="fragment-overlay" data-oid="hy79:ij">
                  <span className="product-tag" data-oid="tkrto65">
                    {product.tag}
                  </span>
                  <h4 className="product-name" data-oid="5dsdtm:">
                    {product.name}
                  </h4>
                  <p className="product-price" data-oid="9:im4h_">
                    {product.price}
                  </p>
                  <a
                    href={`/products/${product.id}`}
                    className="product-details-button"
                    data-oid="7i:zztn"
                  >
                    Detayları Gör
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spiral Collection Navigator */}
      <section
        className="spiral-section h-screen relative overflow-hidden"
        data-oid="k6t64ru"
      >
        <div className="spiral-container" data-oid="ra2af_p">
          <div className="spiral-path" data-oid="-et86_6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`spiral-node node-${i + 1}`}
                data-oid="kgh:s8r"
              >
                <div className="node-content" data-oid="unu65cd">
                  <span className="node-label" data-oid="-.g9t6p">
                    {["TERRA", "NOVA", "ASTRAL", "QUANTUM", "INFINITY"][i]}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="spiral-center" data-oid="x_ai:2j">
            <div className="pulse-circle" data-oid="2522nxb"></div>
            <h3
              className="text-2xl font-light tracking-wider mt-4"
              data-oid="2a0i3ad"
            >
              BOYUTLAR
            </h3>
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
