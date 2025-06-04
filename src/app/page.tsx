'use client'; // This directive is Next.js specific and might not be needed in a generic React setup, but can be kept for context.

import React, { useEffect, useRef, useState, Suspense } from 'react'; // Standard React import
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useNotification } from '@/contexts/NotificationContext';
import SearchParamsHandler from '@/components/SearchParamsHandler';

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
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const productRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // Parallax scroll effect & product animation
    const handleScroll = () => {
      const scrolled = window.scrollY;
      document.documentElement.style.setProperty('--scroll', `${scrolled}px`);
      
      productRefs.current.forEach((item, index) => {
        if (item) {
          const rect = item.getBoundingClientRect();
          const isInView = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (isInView) {
            item.style.transform = `translateX(${(index % 2 === 0 ? -1 : 1) * Math.min(scrolled * 0.02, 10)}px) translateY(${Math.sin(scrolled * 0.001 + index) * 5}px) rotateZ(${Math.cos(scrolled * 0.0005 + index) * 1}deg)`;
            item.style.opacity = '1';
          } else {
            // item.style.opacity = '0'; // Optional: Fade out when scrolled past
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    
    handleScroll(); // Initialize scroll-based animations

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Function to handle image errors - uses standard img tag properties
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, productName: string) => {
    const target = event.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop if placeholder also fails
    target.src = `https://placehold.co/500x500/1a1a1a/4a4a4a?text=${productName.replace(/\s/g,'+')}`;
  };

  // Handle newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail('');
    }, 1500);
  };

  return (
    <main className="overflow-hidden">
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      
      {/* Liquid Header Section */}
      <section className="liquid-header h-screen relative overflow-hidden">
        <div className="liquid-shape"></div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="glitch-container">
            <h1 className="glitch-text" data-text="DIMENSION">DIMENSION</h1>
          </div>
          <div className="mt-32 transform -rotate-90">
            <p className="vertical-text">ALIŞKANLIKLARINIZI DEĞİŞTİRİN</p>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="line"></div>
          <div className="dot"></div>
        </div>
      </section>

      {/* Diagonal Split Section */}
      <section className="diagonal-split relative h-screen overflow-hidden">
        <div className="split-left"></div>
        <div className="split-right">
          <div className="content-container ml-auto w-1/2 p-12">
            <h2 className="distortion-text text-5xl mb-6">BOYUTUN ÖTESİNDE</h2>
            <p className="max-w-md fade-in-text">
              Alışılmışın dışında, yerçekimine meydan okuyan bir alışveriş deneyimi. 
              Nesnelerin sadece üç boyutlu olmadığı, duyguları ve hikayeleri içinde 
              barındırdığı bir dünya keşfedin.
            </p>
            <div className="mt-8">
              {/* Replaced Next.js Link with standard <a> tag */}
              <a href="/collections" className="hover-button">
                KOLEKSİYONLARI KEŞFET
              </a>
            </div>
          </div>
        </div>
        <div className="floating-cube"></div>
      </section>

      {/* Fragmented Product Gallery - UPDATED */}
      <section className="fragmented-gallery relative py-20">
        <div className="container mx-auto">
          <div className="gallery-label">
            <span className="thin-line"></span>
            <h3 className="text-xl tracking-[0.5em] uppercase">Öne Çıkanlar</h3>
          </div>
          
          <div className="fragment-container my-20">
            {products.map((product, i) => (
              <div 
                key={product.id}
                ref={(el) => {
                  productRefs.current[i] = el;
                  return undefined;
                }}
                className={`fragment-item fragment-${i+1}`}
              >
                <div className="fragment-image">
                  {/* Replaced Next.js Image with standard <img> tag */}
                  <img 
                    src={product.image}
                    alt={product.name}
                    width={500} 
                    height={500}
                    className="object-cover" // Ensure this class handles width/height correctly for img
                    onError={(e) => handleImageError(e, product.name)}
                  />
                </div>
                <div className="fragment-overlay">
                  <span className="product-tag">{product.tag}</span>
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-price">{product.price}</p>
                  <a href={`/products/${product.id}`} className="product-details-button">
                    Detayları Gör
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spiral Collection Navigator */}
      <section className="spiral-section h-screen relative overflow-hidden">
        <div className="spiral-container">
          <div className="spiral-path">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`spiral-node node-${i+1}`}>
                <div className="node-content">
                  <span className="node-label">{['TERRA', 'NOVA', 'ASTRAL', 'QUANTUM', 'INFINITY'][i]}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="spiral-center">
            <div className="pulse-circle"></div>
            <h3 className="text-2xl font-light tracking-wider mt-4">BOYUTLAR</h3>
          </div>
        </div>
      </section>

      {/* Perspective Tunnel */}
      <section className="perspective-tunnel relative h-screen overflow-hidden">
        <div className="tunnel-container">
          <div className="tunnel-walls">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`tunnel-segment segment-${i+1}`}></div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-content max-w-md text-center">
              <h2 className="text-4xl mb-6 font-light tracking-widest">HİÇ OLMADIĞI GİBİ</h2>
              <p className="mb-8 blur-text">
                Algılarınızın sınırlarını zorlayan, mekanın ve zamanın ötesinde bir keşif. 
                Alışkanlıklarınızı bırakın, yeniden tanımlanan bir deneyime adım atın.
              </p>
              <a href="/explore" className="cipher-button">
                OLASILIĞI KEŞFETMEYİ DENE
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="newsletter-bg"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light mb-4">GÜNCEL KALIN</h2>
            <p className="mb-8">
              Yeni ürünler, özel indirimler ve kampanyalardan ilk siz haberdar olun.
            </p>
            
            {subscribed ? (
              <div className="success-message p-4 bg-green-500/20 backdrop-blur-sm rounded-lg">
                <p>Teşekkürler! Bültenimize başarıyla abone oldunuz.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz" 
                  required
                  className="flex-grow px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <button 
                  type="submit" 
                  className="primary-button px-6 py-3 whitespace-nowrap"
                  disabled={loading}
                >
                  {loading ? 'GÖNDERİLİYOR...' : 'ABONE OL'}
                </button>
              </form>
            )}
            
            <p className="text-xs text-gray-400 mt-4">
              Abone olarak, <a href="/privacy" className="underline">Gizlilik Politikamızı</a> kabul etmiş olursunuz.
              İstediğiniz zaman abonelikten çıkabilirsiniz.
            </p>
          </div>
        </div>
      </section>

      {/* CSS for custom effects - Styles remain largely the same */}
      <style jsx global>{`
        :root {
          --scroll: 0px;
        }
        
        body {
          background: #080808;
          color: #f0f0f0;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }
        
        /* Liquid header */
        .liquid-header {
          background: #080808;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .liquid-shape {
          position: absolute;
          width: 500px;
          height: 500px;
          background: linear-gradient(45deg, #ff3366, #5533ff);
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          animation: liquid-morph 8s ease-in-out infinite;
          opacity: 0.8;
          filter: blur(12px);
          z-index: 1;
        }
        
        @keyframes liquid-morph {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg) scale(1); }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: rotate(180deg) scale(1.1); }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(360deg) scale(1); }
        }
        
        .glitch-container {
          position: relative;
          z-index: 10;
        }
        
        .glitch-text {
          font-size: 8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5em; 
          margin-left: 0.25em; 
          position: relative;
          color: white;
          animation: glitch 5s infinite;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.8;
        }
        
        .glitch-text::before {
          animation: glitch-effect 3s infinite;
          color: #0ff; 
          z-index: -1;
        }
        
        .glitch-text::after {
          animation: glitch-effect 2s infinite reverse;
          color: #f0f; 
          z-index: -2;
        }
        
        @keyframes glitch-effect {
          0% { transform: translate(0,0); opacity: 1; clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
          5% { transform: translate(2px, -1px); clip-path: polygon(0 20%, 100% 0, 100% 75%, 0 90%); }
          10% { transform: translate(-2px, 1px); clip-path: polygon(0 50%, 100% 30%, 100% 100%, 0 80%); }
          15% { transform: translate(0,0); clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
          20% { transform: translate(3px, -2px) skewX(-5deg); opacity: 0.8; clip-path: polygon(0 0, 100% 20%, 100% 80%, 0% 100%); }
          25% { transform: translate(-3px, 2px) skewX(5deg); opacity: 1; clip-path: polygon(0 20%, 100% 0, 100% 100%, 0 80%); }
          100% { transform: translate(0,0); opacity: 1; clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
        }
        
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.8rem;
        }
        
        .scroll-indicator {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }
        
        .line {
          width: 1px;
          height: 60px;
          background: white;
          margin: 0 auto;
          position: relative;
        }
        
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: white;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          animation: scroll-dot 2s ease-in-out infinite;
        }
        
        @keyframes scroll-dot {
          0% { top: 0; opacity: 1; }
          90% { top: 54px; opacity: 1; }
          100% { top: 54px; opacity: 0; }
        }
        
        /* Diagonal split section */
        .diagonal-split {
          position: relative;
        }
        
        .split-left {
          position: absolute;
          top: 0;
          left: 0;
          width: 55%;
          height: 100%;
          background: #0c0c0c;
          transform: skewX(-10deg) translateX(-5%); 
          transform-origin: top left;
        }
        
        .split-right {
          position: absolute;
          top: 0;
          right: 0;
          width: 55%; 
          height: 100%;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: flex-end; 
        }

        .split-right .content-container {
            position: relative; 
            z-index: 2;
            margin-right: 5%; 
        }
        
        .distortion-text {
          position: relative;
          display: inline-block;
          overflow: hidden;
        }
        
        .distortion-text::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
          animation: distortion-scan 3s ease-in-out infinite 0.5s; 
        }
        
        @keyframes distortion-scan {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); } 
        }
        
        .fade-in-text {
          opacity: 0;
          animation: fade-in 1s ease-out forwards;
          animation-delay: 0.5s;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .hover-button {
          position: relative;
          display: inline-block;
          padding: 12px 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #f0f0f0;
          text-decoration: none;
        }
        
        .hover-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(-100%) skewX(-15deg);
          transition: transform 0.5s ease;
          z-index: -1; 
        }
        
        .hover-button:hover::before {
          transform: translateX(0) skewX(-15deg);
        }
        
        .hover-button:hover {
          border-color: rgba(255, 255, 255, 0.4);
          color: #fff; 
        }
        
        .floating-cube {
          position: absolute;
          width: 100px;
          height: 100px;
          top: 30%;
          left: 35%;
          background: linear-gradient(45deg, #ff3366, #5533ff);
          animation: rotate-float 15s linear infinite;
          z-index: 1; 
          opacity: 0.7;
        }
        
        @keyframes rotate-float {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(0px) scale(1); }
          25% { transform: rotateX(45deg) rotateY(45deg) rotateZ(90deg) translateY(-20px) scale(1.05); }
          50% { transform: rotateX(90deg) rotateY(90deg) rotateZ(180deg) translateY(0px) scale(1); }
          75% { transform: rotateX(135deg) rotateY(135deg) rotateZ(270deg) translateY(20px) scale(0.95); }
          100% { transform: rotateX(180deg) rotateY(180deg) rotateZ(360deg) translateY(0px) scale(1); }
        }
        
        /* Fragmented Gallery */
        .fragmented-gallery {
          background: #0c0c0c;
          min-height: 100vh;
          padding: 80px 0;
        }
        
        .gallery-label {
          display: flex;
          align-items: center;
          margin-left: 1rem; 
        }
        
        .thin-line {
          width: 60px;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
          margin-right: 20px;
        }
        
        .fragment-container {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: minmax(150px, auto); 
          grid-gap: 20px;
          position: relative;
          padding: 0 1rem; 
        }
        
        .fragment-item {
          position: relative;
          overflow: hidden;
          opacity: 0; 
          transition: transform 1s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 1s ease-out, box-shadow 0.3s ease;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          background-color: #1a1a1a; 
          border-radius: 4px; 
        }

        .fragment-item:hover {
          box-shadow: 0 15px 40px rgba(0,0,0,0.5), 0 0 20px rgba(85, 51, 255, 0.3); 
        }
        
        .fragment-1 { grid-column: 1 / span 7; grid-row: 1 / span 4; transform: translateX(-50px); }
        .fragment-2 { grid-column: 8 / span 5; grid-row: 1 / span 2; transform: translateX(50px); }
        .fragment-3 { grid-column: 8 / span 5; grid-row: 3 / span 3; transform: translateX(50px); }
        .fragment-4 { grid-column: 1 / span 4; grid-row: 5 / span 3; transform: translateX(-50px); }
        .fragment-5 { grid-column: 5 / span 8; grid-row: 6 / span 2; transform: translateX(50px); }
        
        .fragment-image {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .fragment-image img { /* Style for standard img tag */
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block; /* Remove extra space below image */
          transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), filter 0.5s ease; 
        }
        
        .fragment-item:hover .fragment-image img {
          transform: scale(1.05);
          filter: brightness(0.8); 
        }
        
        .fragment-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%; 
          padding: 20px; 
          z-index: 2;
          opacity: 0;
          transform: translateY(30px); 
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 60%, transparent 100%); 
        }
        
        .fragment-item:hover .fragment-overlay {
          opacity: 1;
          transform: translateY(0);
        }
        
        .product-tag {
          display: inline-block;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 8px; 
          text-transform: uppercase;
        }
        
        .product-name {
          font-size: 1.4rem; 
          letter-spacing: 0.05em; 
          font-weight: 500;
          margin-bottom: 8px;
          color: #f0f0f0;
        }

        .product-price {
          font-size: 1.1rem;
          color: #7f7fff; 
          font-weight: 600;
          margin-bottom: 16px;
        }

        .product-details-button {
          display: inline-block;
          padding: 8px 16px;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f0f0f0;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          text-decoration: none;
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }

        .product-details-button:hover {
          background-color: rgba(85, 51, 255, 0.7); 
          color: #fff;
          border-color: rgba(85, 51, 255, 0.9);
        }
        
        /* Spiral Section */
        .spiral-section {
          background: #080808;
          position: relative;
          overflow: hidden;
        }
        
        .spiral-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100vw; 
          height: 100vh;
        }
        
        .spiral-path {
          position: absolute;
          width: 100%;
          height: 100%;
          animation: path-rotate calc(var(--scroll) * -0.01deg + 360deg) linear infinite; 
        }
        
        .spiral-node {
          position: absolute;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .node-1 { top: 20%; left: 30%; animation: spiral-rotate 20s linear infinite 0s; }
        .node-2 { top: 60%; left: 20%; animation: spiral-rotate 25s linear infinite reverse 1s; }
        .node-3 { top: 30%; left: 70%; animation: spiral-rotate 30s linear infinite 2s; }
        .node-4 { top: 70%; left: 65%; animation: spiral-rotate 22s linear infinite reverse 3s; }
        .node-5 { top: 50%; left: 45%; animation: spiral-rotate 28s linear infinite 4s; } 
        
        @keyframes spiral-rotate {
          0% { transform: rotate(0deg) translateX(calc(20vw + var(--scroll) * 0.05px)) translateY(calc(var(--scroll) * 0.02px)) rotate(0deg) scale(0.8); opacity: 0.7; }
          50% { transform: rotate(180deg) translateX(calc(25vw + var(--scroll) * 0.03px)) translateY(calc(var(--scroll) * -0.02px)) rotate(-180deg) scale(1.1); opacity: 1; }
          100% { transform: rotate(360deg) translateX(calc(20vw + var(--scroll) * 0.05px)) translateY(calc(var(--scroll) * 0.02px)) rotate(-360deg) scale(0.8); opacity: 0.7; }
        }
        
        .node-content {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          backdrop-filter: blur(5px);
          transition: transform 0.3s ease, background-color 0.3s ease;
        }

        .spiral-node:hover .node-content {
            transform: scale(1.1);
            background-color: rgba(85, 51, 255, 0.2);
        }
        
        .node-label {
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
        }
        
        .spiral-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 5; 
        }
        
        .pulse-circle {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin: 0 auto;
          position: relative;
          animation: pulse 3s ease-in-out infinite;
        }
        
        .pulse-circle::after {
          content: '';
          position: absolute;
          width: 15px;
          height: 15px;
          background: white;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px white, 0 0 20px white; 
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4), 0 0 0 0 rgba(85, 51, 255, 0.3); transform: scale(1); }
          70% { box-shadow: 0 0 0 30px rgba(255, 255, 255, 0), 0 0 0 40px rgba(85, 51, 255, 0); transform: scale(1.05); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0), 0 0 0 0 rgba(85, 51, 255, 0); transform: scale(1); }
        }
        
        /* Perspective Tunnel */
        .perspective-tunnel {
          background: black;
          perspective: 1000px; 
        }
        
        .tunnel-container {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: tunnel-move calc(var(--scroll) * -0.1px) linear forwards; 
        }

        @keyframes tunnel-move {
            to { transform: translateZ(var(--scroll-depth, 0px)); }
        }
        
        .tunnel-walls {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: tunnel-rotate 40s linear infinite; 
        }
        
        @keyframes tunnel-rotate {
          from { transform: rotateZ(0deg) rotateX(calc(var(--scroll) * 0.005deg)); }
          to { transform: rotateZ(360deg) rotateX(calc(var(--scroll) * 0.005deg + 5deg)); }
        }
        
        .tunnel-segment {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 700px; 
          height: 700px;
          border: 1px solid rgba(255, 255, 255, 0.15); 
          transform: translate(-50%, -50%);
          border-radius: 2px; 
          box-shadow: 0 0 15px rgba(85, 51, 255, 0.2); 
        }
        
        .segment-1 { transform: translate(-50%, -50%) translateZ(0px) scale(1.5); opacity: 0.9; }
        .segment-2 { transform: translate(-50%, -50%) translateZ(-150px) scale(1.35); opacity: 0.8; }
        .segment-3 { transform: translate(-50%, -50%) translateZ(-300px) scale(1.2); opacity: 0.7; }
        .segment-4 { transform: translate(-50%, -50%) translateZ(-450px) scale(1.05); opacity: 0.6; }
        .segment-5 { transform: translate(-50%, -50%) translateZ(-600px) scale(0.9); opacity: 0.5; }
        .segment-6 { transform: translate(-50%, -50%) translateZ(-750px) scale(0.75); opacity: 0.4; }
        .segment-7 { transform: translate(-50%, -50%) translateZ(-900px) scale(0.6); opacity: 0.3; }
        .segment-8 { transform: translate(-50%, -50%) translateZ(-1050px) scale(0.45); opacity: 0.2; }
        .segment-9 { transform: translate(-50%, -50%) translateZ(-1200px) scale(0.3); opacity: 0.1; }
        .segment-10 { transform: translate(-50%, -50%) translateZ(-1350px) scale(0.15); opacity: 0.05; }
        
        .blur-text {
          color: rgba(255, 255, 255, 0.7);
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(85, 51, 255, 0.3); 
          letter-spacing: 0.05em;
          line-height: 1.8;
        }
        
        .cipher-button {
          position: relative;
          display: inline-block;
          padding: 12px 24px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          letter-spacing: 0.3em;
          font-size: 0.8rem;
          overflow: hidden;
          color: #f0f0f0;
          text-decoration: none;
          text-transform: uppercase;
          background: rgba(0,0,0,0.2);
        }
        
        .cipher-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -10px;
          width: 5px;
          height: 100%;
          background: rgba(85, 51, 255, 0.6); 
          transform: skewX(-20deg);
          animation: cipher-scan 3s ease-in-out infinite 1s; 
        }

        .cipher-button:hover {
            border-color: rgba(85, 51, 255, 0.7);
            box-shadow: 0 0 15px rgba(85, 51, 255, 0.4);
        }
        
        @keyframes cipher-scan {
          0% { left: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
        
        /* Liquid Contact */
        .liquid-contact {
          background: #080808;
          position: relative;
          overflow: hidden;
        }
        
        .liquid-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.2;
          z-index: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(255, 51, 102, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(85, 51, 255, 0.3) 0%, transparent 50%);
          filter: blur(80px);
          animation: liquid-bg-animate 20s ease-in-out infinite alternate;
        }

        @keyframes liquid-bg-animate {
            0% { transform: scale(1) rotate(0deg); }
            100% { transform: scale(1.2) rotate(15deg); }
        }
        
        .glitch-text-small {
          font-weight: 300;
          letter-spacing: 0.3em;
          position: relative;
        }
        
        .form-container {
          position: relative;
          z-index: 2;
          backdrop-filter: blur(10px) saturate(150%); 
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px; 
          background: rgba(0, 0, 0, 0.4); 
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        .form-field {
          position: relative;
          margin-bottom: 30px;
        }
        
        .liquid-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 10px 2px;
          color: white;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          transition: all 0.3s ease;
        }
        
        .liquid-input:focus {
          outline: none;
          border-bottom: 1px solid rgba(85, 51, 255, 0.8); 
        }
        
        .liquid-input-effect {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #ff3366, #5533ff);
          transition: width 0.4s cubic-bezier(0.23, 1, 0.32, 1); 
        }
        
        .liquid-input:focus + .liquid-input-effect {
          width: 100%;
        }
        
        .liquid-button {
          position: relative;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3); 
          padding: 12px 30px;
          color: white;
          font-size: 0.9rem;
          letter-spacing: 0.2em;
          overflow: hidden;
          cursor: pointer;
          margin-top: 10px;
          text-transform: uppercase;
          transition: border-color 0.3s ease;
        }
        
        .liquid-button-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #ff3366, #5533ff);
          z-index: -1;
          transform: translateY(100%);
          transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .liquid-button:hover .liquid-button-effect {
          transform: translateY(0);
        }
        .liquid-button:hover {
          border-color: transparent; 
        }
        
        /* Media Queries */
        @media (max-width: 1024px) { 
            .glitch-text {
                font-size: 6rem;
            }
            .fragment-container {
                grid-template-columns: repeat(6, 1fr); 
            }
            .fragment-1 { grid-column: 1 / span 6; grid-row: auto; aspect-ratio: 16/10; }
            .fragment-2 { grid-column: 1 / span 3; grid-row: auto; aspect-ratio: 4/3; }
            .fragment-3 { grid-column: 4 / span 3; grid-row: auto; aspect-ratio: 4/3; }
            .fragment-4 { grid-column: 1 / span 3; grid-row: auto; aspect-ratio: 4/3; }
            .fragment-5 { grid-column: 4 / span 3; grid-row: auto; aspect-ratio: 16/9; }

            .split-left, .split-right {
                width: 100%;
                transform: skewX(0);
            }
            .split-right .content-container {
                width: 80%;
                margin-left: auto;
                margin-right: auto;
                text-align: center;
            }
            .floating-cube {
                top: 10%; left: 50%; transform: translateX(-50%) scale(0.8);
            }
        }

        @media (max-width: 768px) { 
          .glitch-text {
            font-size: 3.5rem; 
            letter-spacing: 0.2em;
          }
          
          .fragment-container {
            grid-template-columns: repeat(1, 1fr); 
            height: auto;
            grid-gap: 30px; 
          }
          
          .fragment-1, .fragment-2, .fragment-3, .fragment-4, .fragment-5 {
            grid-column: 1 / span 1;
            grid-row: auto; 
            aspect-ratio: 4/3; 
            transform: translateX(0); 
          }
          
          .floating-cube {
            display: none; 
          }

          .spiral-node {
            width: 80px; height: 80px;
          }
          @keyframes spiral-rotate { 
            0% { transform: rotate(0deg) translateX(30vw) rotate(0deg) scale(0.7); }
            100% { transform: rotate(360deg) translateX(30vw) rotate(-360deg) scale(0.7); }
          }
          .pulse-circle { width: 100px; height: 100px; }
          .tunnel-segment { width: 90vw; height: 90vw; } 
          .perspective-tunnel .text-content h2 { font-size: 2.5rem; }
        }
      `}</style>
    </main>
  );
}
