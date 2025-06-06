"use client"; // This directive is Next.js specific and might not be needed in a generic React setup, but can be kept for context.

import React, { useEffect, useRef, useState, Suspense } from "react"; // Standard React import
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";
import SearchParamsHandler from "@/components/SearchParamsHandler";
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255
import "./anasayfa.css";
import { useCartStore } from '@/lib/store';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from "@/lib/supabase";
import Link from 'next/link';

// CSS Eklemeleri
const textShadowStyle = `
  .text-shadow {
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  }
  
  .dragging-card {
    pointer-events: all !important;
    touch-action: none;
    will-change: transform;
    filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.5));
  }
`;

// Product interface
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  tag: string;
  description: string;
  rating: number;
  reviewCount: number;
  category: string;
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
  slug?: string;
}
<<<<<<< HEAD
=======
import './anasayfa.css';
>>>>>>> origin/refactor/separate-homepage-css
=======
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255

// Improved product data structure with more e-commerce related fields
const products: Product[] = [
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
    slug: "kozmik-nesne-1",
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
    slug: "kuantum-kure",
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
    slug: "boyut-kristali",
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
    slug: "nova-artefakt",
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
    slug: "sicim-heykeli",
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
    slug: "kara-delik-kalintisi",
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
    slug: "zaman-kapsuli",
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
    slug: "enerji-kristali",
  },
  {
    id: 9,
    name: "Gravite Kontrolcüsü",
    price: 349.99,
    originalPrice: 399.99,
    image: "/images/product-9.jpg",
    tag: "DM.009",
    description: "Yerçekimini manipüle eden cihaz.",
    rating: 4.7,
    reviewCount: 33,
    category: "Kuantum",
    inStock: true,
    isNew: true,
    isFeatured: true,
    slug: "gravite-kontrolcusu",
  },
  {
    id: 10,
    name: "Aurora Yansıtıcı",
    price: 199.99,
    originalPrice: 229.99,
    image: "/images/product-10.jpg",
    tag: "DM.010",
    description: "Kuzey ışıklarını yakalayan teknoloji.",
    rating: 4.5,
    reviewCount: 27,
    category: "Kozmik",
    inStock: true,
    isNew: false,
    isFeatured: true,
    slug: "aurora-yansitici",
  },
  {
    id: 11,
    name: "Nebula Esansı",
    price: 129.99,
    originalPrice: 159.99,
    image: "/images/product-11.jpg",
    tag: "DM.011",
    description: "Bir nebulanın özünden damıtılmış parfüm.",
    rating: 4.8,
    reviewCount: 42,
    category: "Kozmetik",
    inStock: true,
    isNew: true,
    isFeatured: true,
    slug: "nebula-esansi",
  },
  {
    id: 12,
    name: "Sonsuzluk Çarkı",
    price: 279.99,
    originalPrice: 329.99,
    image: "/images/product-12.jpg",
    tag: "DM.012",
    description: "Hiç bitmeyen bir dönüşe sahip mekanizma.",
    rating: 4.4,
    reviewCount: 19,
    category: "Zaman",
    inStock: false,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 13,
    name: "Düşünce Oktahedron",
    price: 449.99,
    originalPrice: 499.99,
    image: "/images/product-13.jpg",
    tag: "DM.013",
    description: "Düşünceleri kristalleştiren geometrik form.",
    rating: 4.9,
    reviewCount: 51,
    category: "Kristal",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 14,
    name: "Astral Projektör",
    price: 599.99,
    originalPrice: 649.99,
    image: "/images/product-14.jpg",
    tag: "DM.014",
    description: "Bilinci farklı düzlemlere taşıyan cihaz.",
    rating: 4.7,
    reviewCount: 38,
    category: "Artefakt",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 15,
    name: "Galaksi Modeli",
    price: 379.99,
    originalPrice: 419.99,
    image: "/images/product-15.jpg",
    tag: "DM.015",
    description: "Canlı bir galaksinin minyatür modeli.",
    rating: 4.6,
    reviewCount: 29,
    category: "Kozmik",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 16,
    name: "Kuantum Saati",
    price: 259.99,
    originalPrice: 299.99,
    image: "/images/product-16.jpg",
    tag: "DM.016",
    description: "Zamanı farklı olasılıklarla ölçen saat.",
    rating: 4.5,
    reviewCount: 23,
    category: "Zaman",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 17,
    name: "Dördüncü Boyut Anahtarı",
    price: 489.99,
    originalPrice: 549.99,
    image: "/images/product-17.jpg",
    tag: "DM.017",
    description: "Dördüncü boyuta açılan kapıların anahtarı.",
    rating: 4.8,
    reviewCount: 47,
    category: "Kuantum",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 18,
    name: "Paralel Evren Görüntüleyici",
    price: 649.99,
    originalPrice: 699.99,
    image: "/images/product-18.jpg",
    tag: "DM.018",
    description: "Paralel evrenlere pencere açan cihaz.",
    rating: 4.9,
    reviewCount: 56,
    category: "Artefakt",
    inStock: false,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 19,
    name: "Kozmik Filamanlı Lamba",
    price: 189.99,
    originalPrice: 229.99,
    image: "/images/product-19.jpg",
    tag: "DM.019",
    description: "Evrenin dokusuyla aydınlatan lamba.",
    rating: 4.4,
    reviewCount: 31,
    category: "Ev & Yaşam",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 20,
    name: "Sonsuzluk Taşı",
    price: 799.99,
    originalPrice: 899.99,
    image: "/images/product-20.jpg",
    tag: "DM.020",
    description: "Sınırsız potansiyel içeren kristal taş.",
    rating: 5.0,
    reviewCount: 78,
    category: "Kristal",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
];

// Add a property for featured mobile product
const featuredMobileProduct = {
  id: 101,
  name: "Özel Koleksiyon: Sonsuzluk Serisi",
  price: 1299.99,
  originalPrice: 1499.99,
  image: "/images/featured-special.jpg",
  tag: "DM.ÖZEL",
  description: "Limited üretim özel seri koleksiyonumuz. Yalnızca seçkin müşterilerimize sunulan bu parça, evrenden ilham alan bir tasarıma sahip.",
  rating: 5.0,
  reviewCount: 12,
  category: "Özel Koleksiyon",
  inStock: true,
  isNew: true,
  isFeatured: true,
  slug: "ozel-koleksiyon-sonsuzluk-serisi"
};

// Define Category interface
interface Category {
  id: number;
  name: string;
  image: string;
  count: number;
}

// Define CategoryFromDB interface
interface CategoryFromDB {
  id: string;
  name: string;
  image_url: string | null;
  slug: string;
  description: string | null;
  parent_category_id: string | null;
  sort_order: number;
}

// Categories for navigation
const categories: Category[] = []; // Boş array - kategoriler admin panelinden eklenecek

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
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);
  const productRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [adminMode, setAdminMode] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [selectedFeaturedProduct, setSelectedFeaturedProduct] = useState<number>(featuredMobileProduct.id);
<<<<<<< HEAD

  // Featured product card state
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductCardIndex, setSelectedProductCardIndex] = useState<number | null>(null);
=======
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255
  
  // Kategori modal state'leri
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [dbCategories, setDbCategories] = useState<CategoryFromDB[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDraggingMode, setIsDraggingMode] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [hoverCategory, setHoverCategory] = useState<number | null>(null);
  const [draggingCard, setDraggingCard] = useState<number | null>(null);
  const categoryRefs = useRef<Array<HTMLDivElement | null>>([]);
  const supabase = createClientComponentClient();

  // Kategorileri localStorage'dan yükleme veya DB'den çekme
  useEffect(() => {
    // Check if user is admin from localStorage
    const checkAdminStatus = () => {
      const adminStatus = localStorage.getItem('isAdmin') === 'true';
      setIsAdminUser(adminStatus);
    };
    
    checkAdminStatus();
    
    // Debug için düzenleme modu değişikliklerini izle
    console.log("İlk yükleme - isEditMode:", isEditMode);
    
    // Kayıtlı kategorileri localStorage'dan yükle
    const loadSavedCategories = async () => {
      const savedCategories = localStorage.getItem('displayedCategories');
      if (savedCategories) {
        try {
          const parsedCategories = JSON.parse(savedCategories);
          // Kategoriler içinde geçerli olanları filtrele
          const validCategories = parsedCategories.filter((cat: any) => cat && cat.name && cat.image);
          if (validCategories.length > 0) {
            setDisplayedCategories(validCategories);
          } else {
            // Eğer geçerli kategori yoksa, DB'den çek
            await fetchInitialCategories();
          }
        } catch (error) {
          console.error('Kaydedilmiş kategoriler yüklenemedi', error);
          await fetchInitialCategories();
        }
      } else {
        // Eğer localStorage'da kayıtlı kategori yoksa, otomatik olarak kategorileri çek
        await fetchInitialCategories();
      }
    };
    
    loadSavedCategories();
  }, []);
<<<<<<< HEAD

  // Öne çıkan ürünleri localStorage'dan yükle
  useEffect(() => {
    const savedProducts = localStorage.getItem('displayedFeaturedProducts');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        const valid = parsed.filter((p: any) => p && p.id);
        if (valid.length > 0) {
          setDisplayedProducts(valid);
          return;
        }
      } catch (error) {
        console.error('Kaydedilmiş ürünler yüklenemedi', error);
      }
    }
    fetchInitialFeaturedProducts();
  }, []);
=======
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255
  
  // Düzenleme modu değişikliklerini izle
  useEffect(() => {
    if (isEditMode) {
      console.log('Düzenleme modu açıldı');
      // Düzenleme modu açıldığında bir bildirim göster
      if (typeof showToast === 'function') {
        showToast("Düzenleme modu aktif");
      }
    } else {
      console.log('Düzenleme modu kapatıldı');
    }
  }, [isEditMode, showToast]);
  
  // Sürükleme modunun değişimini izle
  useEffect(() => {
    if (isDraggingMode) {
      // CSS'e sürükleme modu için gerekli değişkenleri ekle
      document.documentElement.style.setProperty("--drag-mode", "1");
      document.body.classList.add("drag-mode");
    } else {
      // Sürükleme modu kapatıldığında temizle
      document.documentElement.style.setProperty("--drag-mode", "0");
      document.body.classList.remove("drag-mode");
      setDraggingCard(null);
    }
    
    return () => {
      // Component unmount olduğunda temizle
      document.body.classList.remove("drag-mode");
    };
  }, [isDraggingMode]);
  
  // Scroll efektleri
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

  // Function to handle product click - bring to front
  const handleProductClick = (productId: number) => {
    setActiveProduct(productId);
  };
  
  // Handle mouse hover on products
  const handleProductMouseEnter = (productId: number) => {
    setHoveredProductId(productId);
    // Ensure smooth transition by adding a small delay
    setTimeout(() => {
      setActiveProduct(productId);
    }, 50);
  };
  
  const handleProductMouseLeave = () => {
    // Add a small delay before removing the active state for smoother transitions
    setTimeout(() => {
      setHoveredProductId(null);
    }, 100);
  };
  
  const getActiveProduct = (productId: number) => {
    return activeProduct === productId;
  };

  // Handle product selection for feature spot (admin only)
  const handleSelectFeaturedProduct = (productId: number) => {
    if (isAdminUser) {
      setSelectedFeaturedProduct(productId);
      
      // Save to localStorage for demo purposes
      localStorage.setItem('featuredProductId', productId.toString());
      
      if (typeof showToast === 'function') {
        showToast("Ürün başarıyla öne çıkarıldı");
      }
    }
  };

  // Find the current featured product for mobile display
  const currentFeaturedMobileProduct = products.find(p => p.id === selectedFeaturedProduct) || featuredMobileProduct;

  // Toggle admin product selection mode
  const toggleAdminMode = () => {
    if (isAdminUser) {
      setAdminMode(!adminMode);
    } else {
      if (typeof showToast === 'function') {
        showToast("Bu işlemi gerçekleştirmek için admin yetkisine sahip olmanız gerekiyor");
      }
    }
  };
  
  // Toggle admin status (for demo purposes)
  const toggleAdminStatus = () => {
    const newStatus = !isAdminUser;
    setIsAdminUser(newStatus);
    localStorage.setItem('isAdmin', newStatus.toString());
    
    if (typeof showToast === 'function') {
      showToast(newStatus ? "Admin modu aktif" : "Admin modu devre dışı");
    }
    
    // Exit admin mode if turning off admin status
    if (!newStatus && adminMode) {
      setAdminMode(false);
    }
  };

  // Kategorileri veritabanından çekme fonksiyonu
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      setDbCategories(data || []);
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
      if (typeof showToast === 'function') {
        showToast("Kategoriler yüklenirken bir hata oluştu");
      }
    } finally {
      setLoadingCategories(false);
    }
  };
  
  // Modal açıldığında kategorileri çek
  useEffect(() => {
    if (showCategoryModal) {
      fetchCategories();
    } else {
      // Modal kapandığında yükleme durumunu sıfırla
      setLoadingCategories(false);
    }
  }, [showCategoryModal]);

  // Kategori seçme fonksiyonu
  const assignCategory = (category: CategoryFromDB, cardIndex: number) => {
    const newCategory: Category = {
      id: parseInt(category.id), // UUID'yi number'a dönüştür
      name: category.name,
      image: category.image_url || `https://placehold.co/500x500/1a1a1a/4a4a4a?text=${category.name.replace(/\s/g, "+")}`,
      count: 0
    };
    
    // Yeni kategoriyi görüntülenen kategorilere ekle
    const newDisplayedCategories = [...displayedCategories];
    newDisplayedCategories[cardIndex] = newCategory;
    setDisplayedCategories(newDisplayedCategories);
    
    // Kategorileri localStorage'a kaydet
    localStorage.setItem('displayedCategories', JSON.stringify(newDisplayedCategories));
    
    if (typeof showToast === 'function') {
      showToast(`${category.name} kategorisi başarıyla atandı`);
    }
    
    // Modal'ı kapat
    setShowCategoryModal(false);
  };
  
  // Tüm kategorileri yerleştirme fonksiyonu
  const assignAllCategories = async () => {
    try {
      setLoadingCategories(true);
      // Kategorileri çek
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .limit(5); // İlk 5 kategoriyi al
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Kategorileri dönüştür
        const newDisplayedCategories: Category[] = data.map((cat: CategoryFromDB) => ({
          id: parseInt(cat.id),
          name: cat.name,
          image: cat.image_url || `https://placehold.co/500x500/1a1a1a/4a4a4a?text=${cat.name.replace(/\s/g, "+")}`,
          count: 0
        }));
        
        // State'i güncelle
        setDisplayedCategories(newDisplayedCategories);
        
        // Kategorileri localStorage'a kaydet
        localStorage.setItem('displayedCategories', JSON.stringify(newDisplayedCategories));
        
        if (typeof showToast === 'function') {
          showToast("Tüm kategoriler başarıyla yerleştirildi");
        }
      } else {
        if (typeof showToast === 'function') {
          showToast("Yerleştirilecek kategori bulunamadı", "error");
        }
      }
    } catch (error: any) {
      console.error('Kategoriler yerleştirilirken bir hata oluştu:', error);
      if (typeof showToast === 'function') {
        showToast("Kategoriler yerleştirilirken bir hata oluştu", "error");
      }
    } finally {
      setLoadingCategories(false);
    }
  };
  
  // Kategori modal'ını açma fonksiyonu
  const openCategoryModal = (cardIndex: number) => {
    setSelectedCardIndex(cardIndex);
    setShowCategoryModal(true);
  };

  // Sayfa ilk yüklendiğinde kategorileri otomatik olarak çekme
  const fetchInitialCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .limit(5);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Kategorileri dönüştür
        const initialCategories: Category[] = data.map((cat: CategoryFromDB) => ({
          id: parseInt(cat.id),
          name: cat.name,
          image: cat.image_url || `https://placehold.co/500x500/1a1a1a/4a4a4a?text=${cat.name.replace(/\s/g, "+")}`,
          count: 0
        }));
        
        // State'i güncelle
        setDisplayedCategories(initialCategories);
        
        // Kategorileri localStorage'a kaydet
        localStorage.setItem('displayedCategories', JSON.stringify(initialCategories));
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken bir hata oluştu:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

<<<<<<< HEAD
  // Öne çıkan ürünleri başlat
  const fetchInitialFeaturedProducts = () => {
    const initial = products.filter(p => p.isFeatured).slice(0, 5);
    setDisplayedProducts(initial);
    localStorage.setItem('displayedFeaturedProducts', JSON.stringify(initial));
  };

  const openProductModal = (cardIndex: number) => {
    setSelectedProductCardIndex(cardIndex);
    setShowProductModal(true);
  };

  const assignProduct = (product: Product, cardIndex: number) => {
    const newDisplayed = [...displayedProducts];
    newDisplayed[cardIndex] = product;
    setDisplayedProducts(newDisplayed);
    localStorage.setItem('displayedFeaturedProducts', JSON.stringify(newDisplayed));
    if (typeof showToast === 'function') {
      showToast(`${product.name} ürünü başarıyla atandı`);
    }
    setShowProductModal(false);
  };

=======
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255
  // Bir kategorinin hover edilmesi durumunda
  const handleCategoryHover = (index: number) => {
    setHoverCategory(index);
  };

  // Bir kategorinin hover'dan çıkması durumunda
  const handleCategoryLeave = () => {
    setHoverCategory(null);
  };

  // Düzenleme modunu aç/kapat
  const toggleEditMode = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    console.log("Düzenleme modu:", newEditMode ? "açık" : "kapalı");
    
    if (newEditMode) {
      // Düzenleme modu açılırken, sürükleme modunu kapat
      setIsDraggingMode(false);
    }
  };

  // Yeni bir kategori yuvası ekler
  const addCategorySlot = () => {
    const newDisplayedCategories = [...displayedCategories];
    // Yeni boş kategori yerleştiricisi ekle
    newDisplayedCategories.push({
      id: Date.now(), // Geçici ID
      name: "",
      image: "",
      count: 0
    });
    setDisplayedCategories(newDisplayedCategories);
    localStorage.setItem('displayedCategories', JSON.stringify(newDisplayedCategories));
  };

  // Sürükleme modunu aç/kapat
  const toggleDraggingMode = () => {
    const newDraggingMode = !isDraggingMode;
    setIsDraggingMode(newDraggingMode);
    
    if (newDraggingMode) {
      // Sürükleme modu açıldığında düzenleme modunu kapat
      setIsEditMode(false);
      if (typeof showToast === 'function') {
        showToast("Sürükleme modu aktif - Kategorileri sürükleyerek yerlerini değiştirebilirsiniz");
      }
    } else {
      // Sürükleme modunu kapatırken sıfırla
      setDraggingCard(null);
    }
  };
  
  // HTML5 Drag-and-Drop API ile sürükleme işlemleri
  const handleDragStart = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    if (!isDraggingMode) return;
    
    // Taşınan kategori bilgisini sakla
    e.dataTransfer.setData('text/plain', index.toString());
    
    // Sürüklenen kartı state'e kaydet
    setDraggingCard(index);
    
    // Sürükleme görüntüsünü ayarla
    const category = displayedCategories[index];
    if (category && category.image) {
      try {
        const img = document.createElement('img');
        img.src = category.image;
        e.dataTransfer.setDragImage(img, 50, 50);
      } catch (error) {
        console.error("Drag image could not be set:", error);
      }
    }
    
    if (typeof showToast === 'function') {
      showToast("Kategoriyi istediğiniz konuma taşıyın");
    }
    
    console.log("Sürükleme başladı:", index);
  };
  
  // Sürükleme bittikten sonra hedef üzerine bırakıldığında
  const handleDrop = (targetIndex: number, e: React.DragEvent<HTMLDivElement>) => {
    if (!isDraggingMode) return;
    
    e.preventDefault();
    
    // Taşınan kategorinin indeksini al
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    // Aynı yere bırakıldıysa işlem yapma
    if (sourceIndex === targetIndex || isNaN(sourceIndex)) {
      setDraggingCard(null);
      return;
    }
    
    // Kategorileri yeniden sırala
    const newCategories = [...displayedCategories];
    const [draggedCategory] = newCategories.splice(sourceIndex, 1);
    newCategories.splice(targetIndex, 0, draggedCategory);
    
    // State'i ve localStorage'ı güncelle
    setDisplayedCategories(newCategories);
    localStorage.setItem('displayedCategories', JSON.stringify(newCategories));
    
    // Sürükleme işlemini sonlandır
    setDraggingCard(null);
    
    if (typeof showToast === 'function') {
      showToast("Kategori pozisyonu güncellendi");
    }
    
    console.log(`${sourceIndex}. kategori → ${targetIndex}. pozisyona taşındı`);
  };

  // Sürükleme alanına girildiğinde
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isDraggingMode) return;
    
    e.preventDefault(); // Drop'a izin vermek için preventDefault gerekli
    e.dataTransfer.dropEffect = "move"; // Taşıma efektini belirt
  };

  // Sürükleme işlemi bittiğinde
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Sürükleme işlemi tamamlandı, state'i temizle
    setDraggingCard(null);
  };

  // Kategori menüsünü aç/kapat
  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen(!isCategoryMenuOpen);
  };

  return (
    <main className="overflow-hidden" data-oid=":43_n76">
      <style jsx global>{textShadowStyle}</style>
      
      <Suspense fallback={null} data-oid="sc0swxu">
        <SearchParamsHandler data-oid="3cnk_r-" />
      </Suspense>

      {/* Liquid Header Section */}
      <section
        className="liquid-header h-screen relative overflow-hidden"
        data-oid=".epli6n"
      >
        <div className="liquid-shape" data-oid="_1w2brz"></div>
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          data-oid="-oqt74w"
        >
          <div className="glitch-container" data-oid="85.co_r">
            <h1
              className="glitch-text"
              data-text="DIMENSION"
              data-oid="1p11cx8"
            >
              DIMENSION
            </h1>
          </div>
          <div className="mt-32 transform -rotate-90" data-oid="sm:bgu1">
            <p className="vertical-text" data-oid="9dmxxoo">
              ALIŞKANLIKLARINIZI DEĞİŞTİRİN
            </p>
          </div>
        </div>
        <div className="scroll-indicator" data-oid="lejfyo8">
          <div className="line" data-oid="h4k3ts0"></div>
          <div className="dot" data-oid="ggbk:sw"></div>
        </div>
      </section>

      {/* Diagonal Split Section */}
      <section
        className="diagonal-split relative h-screen overflow-hidden"
        data-oid="z7efmmi"
      >
        <div className="split-left" data-oid="m27e17z"></div>
        <div className="split-right" data-oid="38idc47">
          <div
            className="content-container ml-auto w-1/2 p-12"
            data-oid="ds37brc"
          >
            <h2 className="distortion-text text-5xl mb-6" data-oid="-3xn_m0">
              BOYUTUN ÖTESİNDE
            </h2>
            <p className="max-w-md fade-in-text" data-oid="xes8jeg">
              Alışılmışın dışında, yerçekimine meydan okuyan bir alışveriş
              deneyimi. Nesnelerin sadece üç boyutlu olmadığı, duyguları ve
              hikayeleri içinde barındırdığı bir dünya keşfedin.
            </p>
            <div className="mt-8" data-oid="pv_q-h4">
              {/* Replaced Next.js Link with standard <a> tag */}
              <a
                href="/collections"
                className="hover-button"
                data-oid="115saa:"
              >
                KOLEKSİYONLARI KEŞFET
              </a>
            </div>
          </div>
        </div>
        <div className="floating-cube" data-oid="zq5-1ir"></div>
      </section>

      {/* Fragmented Product Gallery - UPDATED */}
      <section className="fragmented-gallery relative py-20" data-oid="bx:r0oh">
        <div className="container mx-auto" data-oid="25f2mnl">
          <div className="gallery-label flex items-center justify-between mb-6" data-oid="rhb14wx">
            <div className="flex items-center">
            <span className="thin-line" data-oid="2hqvecl"></span>
            <h3
              className="text-xl tracking-[0.5em] uppercase"
              data-oid="mkkn::r"
            >
              Öne Çıkanlar
            </h3>
            </div>
            <a href="/products" className="text-white hover:text-accent transition-colors text-sm font-medium px-4 py-2 bg-primary/80 hover:bg-primary rounded-md">
              Tümünü Gör →
            </a>
          </div>

          <div className="fragment-container my-20 relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" data-oid="gw6jt-c">
<<<<<<< HEAD
            {displayedProducts.map((product, i) => (
=======
            {products.filter(product => product.isFeatured).map((product, i) => (
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255
              <div
                key={product.id}
                ref={(el) => {
                  productRefs.current[i] = el;
                  return undefined;
                }}
                className={`fragment-item fragment-${i + 1} transition-all duration-300 cursor-pointer ${getActiveProduct(product.id) ? 'z-10 scale-105 shadow-xl' : ''} ${adminMode && 'admin-select-mode'}`}
                style={{ 
                  zIndex: getActiveProduct(product.id) ? 10 : 1, 
                  transform: `translateY(${Math.sin(i * 0.3) * 10}px)`,
                  maxHeight: getActiveProduct(product.id) ? 'auto' : '100%',
                  overflow: 'hidden'
                }}
                onClick={() => adminMode ? handleSelectFeaturedProduct(product.id) : handleProductClick(product.id)}
                onMouseEnter={() => handleProductMouseEnter(product.id)}
                onMouseLeave={handleProductMouseLeave}
                data-oid="_q868.f"
              >
                <div className="fragment-image relative" data-oid="smh90:4">
                  {/* Replaced Next.js Image with standard <img> tag */}
                  <img
                    src={product.image}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="object-cover h-64 w-full rounded-lg" // Standardized image height
                    onError={(e) => handleImageError(e, product.name)}
                    data-oid="u5_.:ny"
                  />
                  {adminMode && selectedFeaturedProduct === product.id && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
<<<<<<< HEAD
                    </div>
                  )}
                  {isAdminUser && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openProductModal(i);
                      }}
                      className="absolute top-2 left-2 bg-primary/80 text-white p-1 rounded-full hover:bg-primary transition-colors"
                      title="Ürün Ata"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
=======
                </div>
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255
                  )}
                </div>
                <div className="fragment-overlay p-4 bg-white/10 backdrop-blur-sm rounded-lg mt-2" data-oid="chf8t3l">
                  <span className="product-tag text-xs text-primary" data-oid="vnpo0b1">
                    {product.tag}
                  </span>
                  <h4 className="product-name text-lg font-medium mt-1" data-oid="7-o9lf8">
                    {product.name}
                  </h4>
                  <div className="flex justify-between items-center mt-1">
                    <p className="product-price font-medium" data-oid="w2i1bab">
                      {formatPrice(product.price)}
                    </p>
                    {product.originalPrice > product.price && (
                      <p className="text-sm text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </p>
                    )}
                  </div>
                  {product.inStock ? (
                    <span className="text-xs text-green-500 mt-1 block">Stokta</span>
                  ) : (
                    <span className="text-xs text-red-400 mt-1 block">Tükendi</span>
                  )}
                  <a
                    href={`/products/${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="product-details-button mt-3 inline-block px-4 py-2 bg-primary/80 hover:bg-primary text-white text-sm rounded-md transition-colors w-full text-center"
                    data-oid="77f6xjv"
                  >
                    Detayları Gör
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 md:hidden">
            <a 
              href="/products" 
              className="inline-block px-6 py-3 bg-transparent border border-primary/30 hover:border-primary text-primary hover:text-white hover:bg-primary rounded-lg transition-all duration-300"
            >
              Tüm Ürünleri Gör
            </a>
          </div>
        </div>
        
        {/* Mobile view: Single featured product */}
        <div className="md:hidden mt-12 px-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium">Özel Ürün</h4>
            {isAdminUser && (
              <button 
                onClick={toggleAdminMode} 
                className="text-xs px-3 py-1 rounded bg-gray-800 text-white"
              >
                {adminMode ? 'Seçim Modu: Açık' : 'Ürün Seç'}
              </button>
            )}
          </div>
          
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-primary/20 to-primary/5 p-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
            
            <div className="relative z-10">
              <img 
                src={currentFeaturedMobileProduct.image} 
                alt={currentFeaturedMobileProduct.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
                onError={(e) => handleImageError(e, currentFeaturedMobileProduct.name)}
              />
              
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 -mt-20 relative z-20 mx-4">
                <span className="inline-block px-2 py-1 text-xs bg-primary/80 text-white rounded mb-2">
                  {currentFeaturedMobileProduct.tag}
                </span>
                <h3 className="text-xl font-medium text-white mb-2">{currentFeaturedMobileProduct.name}</h3>
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">{currentFeaturedMobileProduct.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white font-bold text-xl">{formatPrice(currentFeaturedMobileProduct.price)}</span>
                    {currentFeaturedMobileProduct.originalPrice > currentFeaturedMobileProduct.price && (
                      <span className="text-gray-400 line-through text-sm ml-2">
                        {formatPrice(currentFeaturedMobileProduct.originalPrice)}
                      </span>
                    )}
                  </div>
                  <a 
                    href={`/products/${currentFeaturedMobileProduct.slug || currentFeaturedMobileProduct.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-4 py-2 bg-white text-primary font-medium text-sm rounded-lg"
                  >
                    İncele
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="fragmented-gallery relative py-20" data-oid="gcpnjby">
        <div className="container mx-auto" data-oid="dha01uc">
          <div className="gallery-label flex items-center justify-between mb-6" data-oid="rhb14wx">
            <div className="flex items-center">
              <span className="thin-line" data-oid="2hqvecl"></span>
              <h3
                className="text-xl tracking-[0.5em] uppercase"
                data-oid="mkkn::r"
              >
                KATEGORİLER
              </h3>
            </div>
            <div className="flex gap-2">
              {isAdminUser && (
                <div className="relative">
                  <button 
                    onClick={toggleCategoryMenu}
                    className="text-white hover:text-accent transition-colors text-sm font-medium px-4 py-2 bg-dark hover:bg-dark-lighter rounded-md flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Seçenekler
                  </button>
                  {isCategoryMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-dark-lighter rounded-md shadow-lg overflow-hidden z-20">
                      <button 
                        onClick={() => {
                          addCategorySlot();
                          setIsCategoryMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-primary hover:text-white border-b border-dark flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Kategori Yuvası Ekle
                      </button>
                                              <button 
                          onClick={() => {
                            toggleEditMode();
                            setIsCategoryMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-primary hover:text-white border-b border-dark flex items-center gap-2 ${isEditMode ? 'bg-primary/20' : ''}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          {isEditMode ? "Düzenleme Modunu Kapat" : "Düzenleme Modunu Aç"}
                        </button>
                      <button 
                        onClick={() => {
                          toggleDraggingMode();
                          setIsCategoryMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-primary hover:text-white flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                        </svg>
                        {isDraggingMode ? "Sürüklemeyi Kapat" : "Konumları Değiştir"}
                      </button>
                    </div>
                  )}
                </div>
              )}
              <a href="/categories" className="text-white hover:text-accent transition-colors text-sm font-medium px-4 py-2 bg-primary/80 hover:bg-primary rounded-md">
                Tümünü Gör →
              </a>
            </div>
          </div>

          {isEditMode && (
            <div className="mb-4 p-4 bg-primary/10 backdrop-blur-sm rounded-lg text-center">
              <p className="text-sm font-semibold flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Düzenleme modu aktif - Kategorileri düzenleyebilir veya yeni kategori yuvaları ekleyebilirsiniz
              </p>
            </div>
          )}
          
          {isDraggingMode && (
            <div className="mb-4 p-4 bg-blue-500/10 backdrop-blur-sm rounded-lg text-center">
              <p className="text-sm font-semibold flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
                Sürükleme modu aktif - Kategorilere basıp sürükleyerek yerlerini değiştirebilirsiniz
              </p>
              <p className="text-xs text-blue-400 mt-2">
                İpucu: Kategori kartına tıklayıp basılı tutarak istediğiniz konuma sürükleyin, sonra bırakın.
              </p>
            </div>
          )}

          <div className={`fragment-container my-20 relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${isEditMode ? 'border-2 border-dashed border-primary/30 p-4 rounded-lg' : ''}`} data-oid="gw6jt-c">
            {displayedCategories.length > 0 ? (
              displayedCategories.map((category, i) => {
                const hasCategory = category && category.name && category.image;
                const isHovered = hoverCategory === i;
                
                return (
              <div
                key={i}
                    ref={(el) => { categoryRefs.current[i] = el; }}
                    className={`fragment-item fragment-${i + 1} transition-all duration-300 
                      ${hasCategory && !isEditMode && !isDraggingMode ? 'cursor-pointer' : ''} 
                      ${isHovered ? 'z-10' : ''} 
                      ${isEditMode ? 'ring-2 ring-primary/30 rounded-lg' : ''}
                      ${isDraggingMode ? 'cursor-move' : ''}
                      ${draggingCard === i ? 'opacity-90 scale-105 shadow-xl z-50' : ''}
                    `}
                    style={{ 
                      transform: `translateY(${Math.sin(i * 0.3) * 10}px)`,
                      maxHeight: 'auto',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={(e) => {
                      if (isEditMode || isDraggingMode) {
                        e.preventDefault();
                        console.log(isDraggingMode ? "Sürükleme modunda" : "Düzenleme modunda", "tıklama engellendi");
                        return;
                      }
                      if (hasCategory) {
                        router.push(`/category/${category.id}`);
                      }
                    }}
                    // HTML5 Drag-and-Drop API
                    draggable={isDraggingMode}
                    onDragStart={(e) => isDraggingMode && handleDragStart(i, e)}
                    onDragOver={(e) => isDraggingMode && handleDragOver(e)}
                    onDrop={(e) => isDraggingMode && handleDrop(i, e)}
                    onDragEnd={(e) => isDraggingMode && handleDragEnd(e)}
                    onMouseEnter={() => handleCategoryHover(i)}
                    onMouseLeave={handleCategoryLeave}
                    data-oid="_q868.f"
                  >
                    <div className="fragment-image relative" data-oid="smh90:4">
                      {hasCategory ? (
                        <div className={`relative 
                          ${isHovered && !isDraggingMode ? 'ring-2 ring-primary ring-offset-2 ring-offset-dark' : ''} 
                          ${isDraggingMode && draggingCard !== i ? 'ring-1 ring-blue-400 cursor-grab' : ''}
                          ${draggingCard === i ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-dark shadow-2xl' : ''}
                        `}>
                          <img
                            src={category.image}
                            alt={category.name}
                            width={500}
                            height={500}
                            className="object-cover h-64 w-full rounded-lg"
                            onError={(e) => handleImageError(e, category.name)}
                            data-oid="u5_.:ny"
                          />
                          {/* Admin kullanıcılar için düzenleme butonları */}
                          {(isAdminUser && (isEditMode || isHovered)) && (
                            <div className="absolute top-2 right-2 flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openCategoryModal(i);
                                }}
                                className={`${isEditMode ? 'bg-primary' : 'bg-primary/80'} text-white p-2 rounded-full hover:bg-primary transition-colors`}
                                title="Kategori Değiştir"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              
                              {isDraggingMode && (
                                <>
                                  {i > 0 && (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const newCategories = [...displayedCategories];
                                        const temp = newCategories[i];
                                        newCategories[i] = newCategories[i-1];
                                        newCategories[i-1] = temp;
                                        setDisplayedCategories(newCategories);
                                        localStorage.setItem('displayedCategories', JSON.stringify(newCategories));
                                      }}
                                      className="bg-blue-500/80 text-white p-2 rounded-full hover:bg-blue-500 transition-colors"
                                      title="Sola Kaydır"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                      </svg>
                                    </button>
                                  )}
                                  
                                  {i < displayedCategories.length - 1 && (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const newCategories = [...displayedCategories];
                                        const temp = newCategories[i];
                                        newCategories[i] = newCategories[i+1];
                                        newCategories[i+1] = temp;
                                        setDisplayedCategories(newCategories);
                                        localStorage.setItem('displayedCategories', JSON.stringify(newCategories));
                                      }}
                                      className="bg-blue-500/80 text-white p-2 rounded-full hover:bg-blue-500 transition-colors"
                                      title="Sağa Kaydır"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                  )}
                                </>
                              )}
                </div>
                          )}
                          
                          {isHovered && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg flex items-end justify-center pb-10">
                              <p className="text-white font-medium text-lg text-shadow">
                                {category.name}
                              </p>
              </div>
                          )}
          </div>
                      ) : (
                        <div className={`bg-primary/10 h-64 w-full rounded-lg flex items-center justify-center ${isHovered ? 'ring-2 ring-primary' : ''}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {isAdminUser && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openCategoryModal(i);
                              }}
                              className="absolute top-2 right-2 bg-primary/80 text-white p-2 rounded-full hover:bg-primary transition-colors"
                              title="Kategori Ata"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`fragment-overlay p-4 bg-white/10 backdrop-blur-sm rounded-lg mt-2 ${isHovered ? 'bg-white/20' : ''}`} data-oid="chf8t3l">
                      {hasCategory ? (
                        <>
                          <h4 className="product-name text-lg font-medium mt-1" data-oid="7-o9lf8">
                            {category.name}
                          </h4>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-gray-400">
                              {category.count} Ürün
                            </p>
                          </div>
                          <a
                            href={`/category/${category.id}`}
                            onClick={(e) => {
                              if (isDraggingMode || isEditMode) {
                                e.preventDefault();
                              }
                            }}
                            className="product-details-button mt-3 inline-block px-4 py-2 bg-primary/80 hover:bg-primary text-white text-sm rounded-md transition-colors w-full text-center"
                            data-oid="77f6xjv"
                          >
                            Keşfet
                          </a>
                        </>
                      ) : (
                        <>
                          <div className="h-6 bg-primary/10 rounded-md w-24 mb-2"></div>
                          <div className="h-4 bg-primary/10 rounded-md w-16 mb-3"></div>
                          <div className="h-10 bg-primary/10 rounded-md w-full"></div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : loadingCategories ? (
              // Kategoriler yükleniyorsa loading göster
              [...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-primary/10 h-64 w-full rounded-lg"></div>
                  <div className="mt-2 p-4 space-y-3">
                    <div className="h-6 bg-primary/10 rounded-md w-24"></div>
                    <div className="h-4 bg-primary/10 rounded-md w-16"></div>
                    <div className="h-10 bg-primary/10 rounded-md w-full"></div>
                  </div>
                </div>
              ))
            ) : (
              // Boş durum
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`fragment-item fragment-${i + 1} transition-all duration-300`}
                  style={{ 
                    transform: `translateY(${Math.sin(i * 0.3) * 10}px)`,
                    maxHeight: 'auto',
                    overflow: 'hidden'
                  }}
                  data-oid="_q868.f"
                >
                  <div className="fragment-image relative" data-oid="smh90:4">
                    <div className="bg-primary/10 h-64 w-full rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {isAdminUser && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            openCategoryModal(i);
                          }}
                          className="absolute top-2 right-2 bg-primary/80 text-white p-2 rounded-full hover:bg-primary transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="fragment-overlay p-4 bg-white/10 backdrop-blur-sm rounded-lg mt-2" data-oid="chf8t3l">
                    <div className="h-6 bg-primary/10 rounded-md w-24 mb-2"></div>
                    <div className="h-4 bg-primary/10 rounded-md w-16 mb-3"></div>
                    <div className="h-10 bg-primary/10 rounded-md w-full"></div>
                  </div>
                </div>
              ))
            )}
            
            {isAdminUser && isEditMode && (
              <div
                className="fragment-item border-2 border-dashed border-primary/50 h-64 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 flex-col p-6"
                onClick={addCategorySlot}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="mt-4 text-center text-primary/80">Yeni Kategori Yuvası Ekle</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-8 md:hidden">
            {isAdminUser ? (
              <a 
                href="/admin/categories"
                className="inline-block px-6 py-3 bg-transparent border border-primary/30 hover:border-primary text-primary hover:text-white hover:bg-primary rounded-lg transition-all duration-300"
              >
                Kategorileri Yönet
              </a>
            ) : (
              <a 
                href="/categories" 
                className="inline-block px-6 py-3 bg-transparent border border-primary/30 hover:border-primary text-primary hover:text-white hover:bg-primary rounded-lg transition-all duration-300"
              >
                Tüm Kategorileri Gör
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Perspective Tunnel */}
      <section
        className="perspective-tunnel relative h-screen overflow-hidden"
        data-oid="epfb6m2"
      >
        <div className="tunnel-container" data-oid="2kyv7rp">
          <div className="tunnel-walls" data-oid="aur0oyw">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`tunnel-segment segment-${i + 1}`}
                data-oid="cyuk_zn"
              ></div>
            ))}
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            data-oid="gsv4elg"
          >
            <div
              className="text-content max-w-md text-center"
              data-oid="lfmot5j"
            >
              <h2
                className="text-4xl mb-6 font-light tracking-widest"
                data-oid="x926_ho"
              >
                HİÇ OLMADIĞI GİBİ
              </h2>
              <p className="mb-8 blur-text" data-oid="bowswwb">
                Algılarınızın sınırlarını zorlayan, mekanın ve zamanın ötesinde
                bir keşif. Alışkanlıklarınızı bırakın, yeniden tanımlanan bir
                deneyime adım atın.
              </p>
              <a href="/explore" className="cipher-button" data-oid="uyx7_pq">
                OLASILIĞI KEŞFETMEYİ DENE
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section
        className="newsletter-section py-24 relative overflow-hidden"
        data-oid="37u3-15"
      >
        <div className="absolute inset-0 z-0" data-oid="5o5ou53">
          <div className="newsletter-bg" data-oid="7q4c7tu"></div>
        </div>

        <div
          className="container mx-auto px-4 relative z-10"
          data-oid="4h638i-"
        >
          <div className="max-w-xl mx-auto text-center" data-oid="yes6toi">
            <h2
              className="text-3xl md:text-4xl font-light mb-4"
              data-oid="_b7go9h"
            >
              GÜNCEL KALIN
            </h2>
            <p className="mb-8" data-oid="ka62tk7">
              Yeni ürünler, özel indirimler ve kampanyalardan ilk siz haberdar
              olun.
            </p>

            {subscribed ? (
              <div
                className="success-message p-4 bg-green-500/20 backdrop-blur-sm rounded-lg"
                data-oid="mu2j_1d"
              >
                <p data-oid="9zb9ms7">
                  Teşekkürler! Bültenimize başarıyla abone oldunuz.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-4"
                data-oid="3m0798k"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  required
                  className="flex-grow px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  data-oid="3um0:qh"
                />

                <button
                  type="submit"
                  className="primary-button px-6 py-3 whitespace-nowrap"
                  disabled={loading}
                  data-oid=":75m6c1"
                >
                  {loading ? "GÖNDERİLİYOR..." : "ABONE OL"}
                </button>
              </form>
            )}

            <p className="text-xs text-gray-400 mt-4" data-oid="m3zu21g">
              Abone olarak,{" "}
              <a href="/privacy" className="underline" data-oid="mmnrxbr">
                Gizlilik Politikamızı
              </a>{" "}
              kabul etmiş olursunuz. İstediğiniz zaman abonelikten
              çıkabilirsiniz.
            </p>
          </div>
        </div>
      </section>

<<<<<<< HEAD
<<<<<<< HEAD
      {/* Ürün Atama Modal */}
      {showProductModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
            onClick={() => setShowProductModal(false)}
          ></div>
          <div className="bg-dark-lighter relative z-10 rounded-lg shadow-xl max-w-xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">
                {selectedProductCardIndex !== null && displayedProducts[selectedProductCardIndex]?.name
                  ? `"${displayedProducts[selectedProductCardIndex].name}" Ürününü Değiştir`
                  : 'Ürün Seçin'}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => {
                const isCurrent =
                  selectedProductCardIndex !== null &&
                  displayedProducts[selectedProductCardIndex]?.id === product.id;

                return (
                  <div
                    key={product.id}
                    className={`p-3 bg-dark rounded-lg cursor-pointer group transition-all duration-300 transform hover:scale-105 ${isCurrent ? 'ring-2 ring-primary' : 'hover:bg-dark-lighter'}`}
                    onClick={() => selectedProductCardIndex !== null && assignProduct(product, selectedProductCardIndex)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => handleImageError(e, product.name)}
                      />
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-400">{product.tag}</p>
                      </div>
                    </div>
                    <div className={`mt-3 flex items-center justify-end ${isCurrent ? 'text-primary' : ''}`}>
                      {isCurrent ? (
                        <span className="text-xs text-primary mr-2">Bu ürün şu anda seçili</span>
                      ) : (
                        <span className="text-xs text-gray-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Ürünü seçmek için tıklayın</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectedProductCardIndex !== null && assignProduct(product, selectedProductCardIndex);
                        }}
                        className={`${isCurrent ? 'bg-green-600' : 'bg-primary'} text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-dark transition`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

=======
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255
      {/* Kategori Atama Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
            onClick={() => setShowCategoryModal(false)}
          ></div>
          
          <div className="bg-dark-lighter relative z-10 rounded-lg shadow-xl max-w-xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">
                {selectedCardIndex !== null && displayedCategories[selectedCardIndex]?.name 
                  ? `"${displayedCategories[selectedCardIndex].name}" Kategorisini Değiştir` 
                  : "Kategori Seçin"}
              </h2>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Arama alanı */}
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Kategori ara..."
                className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => {
                  // Burada gerçek bir arama fonksiyonu olabilir
                  // Şimdilik sadece görsel olarak eklenmiştir
                }}
              />
            </div>
            
            {loadingCategories ? (
              <div className="flex justify-center my-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : dbCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-400">Henüz kategori bulunmuyor.</p>
                <p className="text-gray-500 mt-2">
                  <Link href="/admin/categories/new" className="text-primary hover:underline">
                    Yeni bir kategori ekleyin
                  </Link>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {dbCategories.map((category) => {
                  // Eğer bu kategori halihazırda seçili kartın kategorisi ise vurgula
                  const isCurrentCategory = 
                    selectedCardIndex !== null && 
                    displayedCategories[selectedCardIndex]?.id === parseInt(category.id);
                  
                  return (
                    <div 
                      key={category.id} 
                      className={`p-3 bg-dark rounded-lg cursor-pointer group transition-all duration-300 transform hover:scale-105 ${isCurrentCategory ? 'ring-2 ring-primary' : 'hover:bg-dark-lighter'}`}
                      onClick={() => selectedCardIndex !== null && assignCategory(category, selectedCardIndex)}
                    >
                      <div className="flex items-center gap-3">
                        {category.image_url ? (
                          <img 
                            src={category.image_url} 
                            alt={category.name} 
                            className="w-16 h-16 object-cover rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = `https://placehold.co/100x100/1a1a1a/4a4a4a?text=${category.name.replace(/\s/g, "+")}`;
                            }} 
                          />
                        ) : (
                          <div className="w-16 h-16 bg-primary/10 rounded-md flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-gray-400">{category.slug}</p>
                        </div>
                      </div>
                      <div className={`mt-3 flex items-center justify-end ${isCurrentCategory ? 'text-primary' : ''}`}>
                        {isCurrentCategory ? (
                          <span className="text-xs text-primary mr-2">Bu kategori şu anda seçili</span>
                        ) : (
                          <span className="text-xs text-gray-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Kategoriyi seçmek için tıklayın</span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectedCardIndex !== null && assignCategory(category, selectedCardIndex);
                          }}
                          className={`${isCurrentCategory ? 'bg-green-600' : 'bg-primary'} text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-dark transition`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
<<<<<<< HEAD
=======
>>>>>>> origin/refactor/separate-homepage-css
=======
>>>>>>> c017cf20e76ba26ad97ab21e98a23f8aebfcd255
    </main>
  );
}
