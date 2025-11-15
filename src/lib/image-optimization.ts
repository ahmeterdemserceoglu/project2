// Gelişmiş resim optimizasyon ve yükleme sistemi
import { useState, useEffect, useRef, useCallback } from 'react';

// Image caching için interface
interface ImageCache {
  [key: string]: {
    url: string;
    timestamp: number;
    status: 'loading' | 'loaded' | 'error';
    retryCount: number;
    blob?: Blob;
  };
}

// Resim preload için queue sistemi
interface PreloadQueue {
  url: string;
  priority: number;
  callback?: (success: boolean) => void;
}

class ImageOptimizationManager {
  private cache: ImageCache = {};
  private preloadQueue: PreloadQueue[] = [];
  private isProcessingQueue = false;
  private observer?: IntersectionObserver;
  private maxCacheSize = 100; // Maksimum cache edilecek resim sayısı
  private maxRetries = 3;
  private retryDelay = 1000; // 1 saniye
  
  constructor() {
    this.setupIntersectionObserver();
    this.cleanup(); // Periyodik temizlik başlat
  }

  // Intersection Observer kurulumu - lazy loading için
  private setupIntersectionObserver() {
    if (typeof window === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              this.loadImage(src).then((url) => {
                if (url) {
                  img.src = url;
                  img.classList.remove('lazy-loading');
                  img.classList.add('lazy-loaded');
                }
              });
              this.observer?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px', // 50px önceden yükle
        threshold: 0.1
      }
    );
  }

  // Resim yükleme ve cache sistemi
  async loadImage(url: string, priority = 0): Promise<string | null> {
    if (!url) return null;

    // Cache kontrolü
    const cached = this.cache[url];
    if (cached) {
      if (cached.status === 'loaded') {
        return cached.url;
      } else if (cached.status === 'loading') {
        // Yükleme devam ediyor, bekle
        return this.waitForLoad(url);
      } else if (cached.status === 'error' && cached.retryCount < this.maxRetries) {
        // Retry et
        return this.retryLoad(url);
      }
      return null;
    }

    // Cache'e ekle
    this.cache[url] = {
      url,
      timestamp: Date.now(),
      status: 'loading',
      retryCount: 0
    };

    try {
      // Resmi yükle
      const optimizedUrl = await this.fetchOptimizedImage(url);
      
      this.cache[url] = {
        ...this.cache[url],
        url: optimizedUrl,
        status: 'loaded'
      };

      return optimizedUrl;
    } catch (error) {
      
      
      this.cache[url] = {
        ...this.cache[url],
        status: 'error',
        retryCount: this.cache[url].retryCount + 1
      };

      return null;
    }
  }

  // Resmi fetch et ve optimize et
  private async fetchOptimizedImage(url: string): Promise<string> {
    // URL doğrulama
    if (!this.isValidImageUrl(url)) {
      throw new Error('Invalid image URL');
    }

    const originalUrl = url;

    // WebP desteği kontrolü
    const supportsWebP = await this.checkWebPSupport();

    // Eğer Supabase storage URL'i ise, transform eklemeyi dene
    let requestUrl = originalUrl;
    if (originalUrl.includes('supabase') && originalUrl.includes('storage')) {
      requestUrl = this.addSupabaseTransforms(originalUrl, supportsWebP);
    }

    // Önce (varsa) transform edilmiş URL ile dene, hata alırsak orijinale geri dön
    let response = await fetch(requestUrl, {
      method: 'GET',
      cache: 'force-cache',
      headers: {
        Accept: supportsWebP ? 'image/webp,image/*' : 'image/*',
      },
    });

    if (!response.ok && requestUrl !== originalUrl) {
      // Render endpoint 400/403/404 vb. verdi; orijinal object URL'i ile tekrar dene
      try {
        response = await fetch(originalUrl, {
          method: 'GET',
          cache: 'force-cache',
          headers: {
            Accept: supportsWebP ? 'image/webp,image/*' : 'image/*',
          },
        });
      } catch (_) {
        // no-op, alttaki kontrol hata fırlatacak
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Blob oluştur ve object URL döndür
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    // Cache'e blob'u, orijinal anahtar altında kaydet
    if (this.cache[originalUrl]) {
      this.cache[originalUrl].blob = blob;
    }

    return objectUrl;
  }

  // Supabase transforms ekle
  private addSupabaseTransforms(url: string, supportsWebP: boolean): string {
    try {
      const u = new URL(url);

      // Path'i render endpointine çevir
      if (u.pathname.includes('/object/public/')) {
        u.pathname = u.pathname.replace('/object/public/', '/render/image/public/');
      }

      // format/quality gibi parametreleri query string olarak ekle
      if (supportsWebP) {
        u.searchParams.set('format', 'webp');
      }
      // Supabase image transform destekli parametreler
      u.searchParams.set('quality', '85');
      // Genişlik/yükseklik bilgimiz yok; sorun yaşanırsa orijinale geri döneceğiz

      return u.toString();
    } catch {
      // Her ihtimale karşı eski URL'i döndür
      return url;
    }
  }

  // WebP desteği kontrolü
  private async checkWebPSupport(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    // Cache'den kontrol et
    const cached = localStorage.getItem('webp-support');
    if (cached !== null) {
      return cached === 'true';
    }

    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        const result = webP.height === 2;
        localStorage.setItem('webp-support', result.toString());
        resolve(result);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // URL doğrulama
  private isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const parsedUrl = new URL(url, window.location.origin);
      
      // Protocol kontrolü
      if (!['http:', 'https:', 'data:', 'blob:'].includes(parsedUrl.protocol)) {
        return false;
      }
      
      // Resim formatı kontrolü
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp'];
      const pathname = parsedUrl.pathname.toLowerCase();
      
      // Supabase storage URL'leri her zaman geçerli
      if (url.includes('supabase') && url.includes('storage')) {
        return true;
      }
      
      // Extension kontrolü
      return imageExtensions.some(ext => pathname.endsWith(ext)) || 
             pathname.includes('/image/') ||
             parsedUrl.protocol === 'data:' ||
             parsedUrl.protocol === 'blob:';
    } catch {
      return false;
    }
  }

  // Retry mekanizması
  private async retryLoad(url: string): Promise<string | null> {
    const cached = this.cache[url];
    if (!cached || cached.retryCount >= this.maxRetries) {
      return null;
    }

    // Exponential backoff
    const delay = this.retryDelay * Math.pow(2, cached.retryCount);
    await new Promise(resolve => setTimeout(resolve, delay));

    cached.retryCount++;
    cached.status = 'loading';

    return this.loadImage(url);
  }

  // Loading bekle
  private async waitForLoad(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const cached = this.cache[url];
        if (!cached || cached.status !== 'loading') {
          clearInterval(checkInterval);
          resolve(cached?.status === 'loaded' ? cached.url : null);
        }
      }, 100);

      // 10 saniye timeout
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(null);
      }, 10000);
    });
  }

  // Preload sistemi
  preloadImage(url: string, priority = 0, callback?: (success: boolean) => void) {
    this.preloadQueue.push({ url, priority, callback });
    this.preloadQueue.sort((a, b) => b.priority - a.priority);
    this.processPreloadQueue();
  }

  // Preload queue işleme
  private async processPreloadQueue() {
    if (this.isProcessingQueue || this.preloadQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.preloadQueue.length > 0) {
      const item = this.preloadQueue.shift()!;
      try {
        const result = await this.loadImage(item.url, item.priority);
        item.callback?.(!!result);
      } catch (error) {
        item.callback?.(false);
      }
    }
    
    this.isProcessingQueue = false;
  }

  // Cache temizleme
  private cleanup() {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      // 1 saatten eski cache'leri temizle
      Object.keys(this.cache).forEach(key => {
        const item = this.cache[key];
        if (now - item.timestamp > oneHour) {
          // Object URL'i serbest bırak
          if (item.url.startsWith('blob:')) {
            URL.revokeObjectURL(item.url);
          }
          delete this.cache[key];
        }
      });

      // Cache boyutu kontrolü
      const cacheKeys = Object.keys(this.cache);
      if (cacheKeys.length > this.maxCacheSize) {
        // En eski %20'yi sil
        const toDelete = Math.floor(cacheKeys.length * 0.2);
        const sortedByTime = cacheKeys
          .sort((a, b) => this.cache[a].timestamp - this.cache[b].timestamp)
          .slice(0, toDelete);
        
        sortedByTime.forEach(key => {
          const item = this.cache[key];
          if (item.url.startsWith('blob:')) {
            URL.revokeObjectURL(item.url);
          }
          delete this.cache[key];
        });
      }
    }, 5 * 60 * 1000); // 5 dakikada bir
  }

  // Lazy loading setup
  setupLazyLoading(img: HTMLImageElement, src: string) {
    img.dataset.src = src;
    img.classList.add('lazy-loading');
    img.src = this.generatePlaceholder();
    this.observer?.observe(img);
  }

  // Placeholder oluştur
  private generatePlaceholder(width = 400, height = 400): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Gradient arka plan
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Loading animation için shimmer efekti
    const shimmer = ctx.createLinearGradient(0, 0, width, 0);
    shimmer.addColorStop(0, 'rgba(255,255,255,0)');
    shimmer.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    shimmer.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = shimmer;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL('image/png');
  }

  // Cache istatistikleri
  getCacheStats() {
    const total = Object.keys(this.cache).length;
    const loaded = Object.values(this.cache).filter(item => item.status === 'loaded').length;
    const loading = Object.values(this.cache).filter(item => item.status === 'loading').length;
    const errors = Object.values(this.cache).filter(item => item.status === 'error').length;
    
    return { total, loaded, loading, errors };
  }

  // Cache temizle
  clearCache() {
    Object.values(this.cache).forEach(item => {
      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
    });
    this.cache = {};
  }
}

// Singleton instance
export const imageOptimizer = new ImageOptimizationManager();

// React hook
export function useOptimizedImage(src: string, options: { 
  lazy?: boolean; 
  priority?: number; 
  preload?: boolean;
} = {}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const { lazy = true, priority = 0, preload = false } = options;

  const loadImage = useCallback(async () => {
    if (!src) {
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const optimizedSrc = await imageOptimizer.loadImage(src, priority);
      if (optimizedSrc) {
        setImageSrc(optimizedSrc);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [src, priority]);

  useEffect(() => {
    if (preload) {
      imageOptimizer.preloadImage(src, priority);
    }
  }, [src, priority, preload]);

  useEffect(() => {
    if (!lazy) {
      loadImage();
    } else if (imgRef.current) {
      imageOptimizer.setupLazyLoading(imgRef.current, src);
    } else {
      // Next.js Image gibi ref'i gerçek <img>'e iletmeyen durumlarda,
      // geriye dönük uyumluluk için hemen yükle
      loadImage();
    }
  }, [src, lazy, loadImage]);

  return {
    imageSrc,
    loading,
    error,
    imgRef,
    retry: loadImage
  };
}

// Utility functions
export function preloadImages(urls: string[], priority = 0): Promise<boolean[]> {
  return Promise.all(
    urls.map(url => 
      new Promise<boolean>(resolve => 
        imageOptimizer.preloadImage(url, priority, resolve)
      )
    )
  );
}

export function clearImageCache() {
  imageOptimizer.clearCache();
}

export function getImageCacheStats() {
  return imageOptimizer.getCacheStats();
}
