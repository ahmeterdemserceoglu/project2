"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, TrendingUp, Users, Shield } from "lucide-react"
import CategoryCard from "@/components/category-card"
import HowItWorks from "@/components/how-it-works"
import RecentItems from "@/components/recent-items"
import JoinSection from "@/components/join-section"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { CategoryController } from "@/lib/controllers/category-controller"
import SearchBar from "@/components/search-bar"

export default function HomePage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true)
        const allCategories = await CategoryController.getAllCategories()
        // Only show first 4 categories on homepage
        setCategories(allCategories.slice(0, 4))
      } catch (error) {
        console.error("Error loading categories:", error)
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  return (
    <div className="flex flex-col gap-16 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-24 md:pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background -z-10" />
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%2320a779' fillOpacity='0.1' fillRule='evenodd'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-4">
              <motion.h1
                className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Nadiren Kullandığın Eşyaları <span className="text-primary">Paylaş</span>
              </motion.h1>
              <motion.p
                className="max-w-[600px] text-muted-foreground md:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Komşundan ödünç al, yeni bir şey satın almak zorunda kalma. Yerel paylaşım ağımıza katıl!
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-3 mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <SearchBar placeholder="Ne arıyorsun?" className="max-w-md mb-4 sm:mb-0" />
                <Button asChild size="lg" className="gap-1">
                  <Link href="/items">
                    Eşyaları Keşfet
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                {!user && (
                  <Button asChild variant="outline" size="lg">
                    <Link href="/auth/register">Hemen Üye Ol</Link>
                  </Button>
                )}
              </motion.div>
              <motion.div
                className="flex items-center gap-4 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <Image src={`/placeholder.svg?text=${i}`} alt={`User ${i}`} width={32} height={32} />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">1,000+</span> kullanıcı katıldı
                </div>
              </motion.div>
            </div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative aspect-square md:aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                <Image
                  src="/placeholder.svg?height=600&width=800&text=Eşya+Paylaşımı"
                  alt="Eşya Paylaşımı"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-background rounded-lg shadow-lg p-4 w-32 md:w-40">
                <div className="text-sm font-medium">Toplam Paylaşım</div>
                <div className="text-2xl font-bold">5,280+</div>
                <div className="flex items-center text-xs text-green-500 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  %12 artış
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">5,280+</div>
            <div className="text-sm text-muted-foreground mt-1">Paylaşılan Eşya</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">1,000+</div>
            <div className="text-sm text-muted-foreground mt-1">Aktif Kullanıcı</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">3,500+</div>
            <div className="text-sm text-muted-foreground mt-1">Başarılı İşlem</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">15+</div>
            <div className="text-sm text-muted-foreground mt-1">Şehir</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Kategoriler</h2>
          <p className="text-muted-foreground text-center max-w-2xl">
            İhtiyacınız olan eşyaları kategorilere göre keşfedin ve nadiren kullandığınız eşyaları paylaşın.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? // Loading skeleton
              Array(4)
                .fill(0)
                .map((_, i) => <div key={i} className="h-[180px] rounded-lg bg-muted animate-pulse" />)
            : categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  icon={category.icon}
                  title={category.name}
                  description={category.description}
                  href={`/items?category=${category.slug}`}
                />
              ))}
        </div>
        <div className="flex justify-center mt-8">
          <Button asChild variant="outline">
            <Link href="/items">
              Tüm Kategorileri Görüntüle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Features Section */}
      <section className="container px-4 md:px-6 py-12">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Neden Anında Ortak Yaşam?</h2>
          <p className="text-muted-foreground text-center max-w-2xl">
            Platformumuz, eşya paylaşımını kolaylaştırarak sürdürülebilir bir toplum oluşturmayı hedefler.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-muted/30 rounded-lg p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Güvenli Paylaşım</h3>
            <p className="text-muted-foreground">
              Kullanıcı değerlendirme sistemi ve doğrulanmış profiller ile güvenli bir paylaşım deneyimi sunuyoruz.
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Topluluk Bağları</h3>
            <p className="text-muted-foreground">
              Yerel topluluk bağlarını güçlendirerek komşuluk ilişkilerini geliştiriyoruz.
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                <path d="M19 3v4" />
                <path d="M21 5h-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Sürdürülebilirlik</h3>
            <p className="text-muted-foreground">
              Yeni eşya satın alma ihtiyacını azaltarak çevresel etkiyi minimize ediyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* Join Section - Kullanıcı giriş yapmamışsa gösterilir */}
      <JoinSection />

      {/* Recent Items */}
      <section className="container px-4 md:px-6 py-12">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Son Eklenen Eşyalar</h2>
          <p className="text-muted-foreground text-center max-w-2xl">
            Platformumuza yeni eklenen eşyaları keşfedin ve ihtiyacınız olanı bulun.
          </p>
        </div>
        <RecentItems
          fallback={
            <div className="text-center py-12">
              <p className="text-muted-foreground">Şu anda eşyalar yüklenemiyor. Lütfen daha sonra tekrar deneyin.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/items">Tüm Eşyaları Görüntüle</Link>
              </Button>
            </div>
          }
        />
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Kullanıcılarımız Ne Diyor?</h2>
            <p className="text-muted-foreground text-center max-w-2xl">
              Platformumuzda eşya paylaşan ve ödünç alan kullanıcılarımızın deneyimleri.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 mr-3">
                  <Image src="/placeholder.svg?text=A" alt="Ahmet Y." width={40} height={40} className="rounded-full" />
                </div>
                <div>
                  <div className="font-medium">Ahmet Y.</div>
                  <div className="text-sm text-muted-foreground">İstanbul</div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Matkabımı yılda sadece birkaç kez kullanıyordum. Şimdi platformda paylaşıyorum ve komşularım ihtiyaç
                duyduğunda kullanabiliyor. Harika bir sistem!"
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#16a34a"
                    stroke="none"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 mr-3">
                  <Image src="/placeholder.svg?text=M" alt="Merve K." width={40} height={40} className="rounded-full" />
                </div>
                <div>
                  <div className="font-medium">Merve K.</div>
                  <div className="text-sm text-muted-foreground">Ankara</div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Yeni taşındığımda bir elektrikli süpürgeye ihtiyacım vardı ama satın almak istemedim. Platformdan ödünç
                aldım ve çok memnun kaldım. Artık ben de eşyalarımı paylaşıyorum."
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#16a34a"
                    stroke="none"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 mr-3">
                  <Image src="/placeholder.svg?text=E" alt="Emre T." width={40} height={40} className="rounded-full" />
                </div>
                <div>
                  <div className="font-medium">Emre T.</div>
                  <div className="text-sm text-muted-foreground">İzmir</div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Kitap okumayı seviyorum ama her kitabı satın almak hem maliyetli hem de yer kaplıyor. Platformda
                kitaplarımı paylaşıyor ve yeni kitaplar ödünç alıyorum. Süper bir uygulama!"
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star, i) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={i < 4 ? "#16a34a" : "#d1d5db"}
                    stroke="none"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 md:px-6 py-16">
        <div className="bg-primary/10 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Hemen Başlayın</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Eşyalarınızı paylaşarak veya ihtiyacınız olan eşyaları ödünç alarak sürdürülebilir bir topluluk
                oluşturmaya katkıda bulunun.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link href="/items">
                    Eşyaları Keşfet
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {!user && (
                  <Button asChild variant="outline" size="lg">
                    <Link href="/auth/register">Üye Ol</Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="relative h-64 md:h-auto">
              <Image
                src="/placeholder.svg?height=300&width=500&text=Anında+Ortak+Yaşam"
                alt="Anında Ortak Yaşam"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
