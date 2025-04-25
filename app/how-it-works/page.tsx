"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Camera, CheckCircle, MessageSquare, Search, ThumbsUp } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function HowItWorksPage() {
  const { user } = useAuth()

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Nasıl Çalışır?</h1>
          <p className="text-xl text-muted-foreground">
            Anında Ortak Yaşam platformu, nadiren kullandığınız eşyaları paylaşmanızı ve ihtiyacınız olan eşyaları ödünç
            almanızı sağlar.
          </p>
        </div>

        <div className="space-y-16">
          {/* Step 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">1. Eşyanı Paylaş</h2>
              <p className="text-muted-foreground mb-4">
                Nadiren kullandığınız eşyaları fotoğraflayın, kategorisini seçin ve ilan verin. Eşyanızın ne kadar
                süreyle ödünç verilebileceğini ve varsa özel şartlarınızı belirtin.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Eşyanızın net fotoğraflarını çekin</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Detaylı açıklama ekleyin</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Konumunuzu belirtin</span>
                </li>
              </ul>
              <Button asChild>
                <Link href={user ? "/items/new" : "/auth/login"}>
                  {user ? "Eşya Ekle" : "Giriş Yap ve Eşya Ekle"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="bg-muted rounded-lg p-6 h-64 flex items-center justify-center">
              <Camera className="h-24 w-24 text-muted-foreground" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center md:flex-row-reverse">
            <div className="md:order-2">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">2. İhtiyacını Bul</h2>
              <p className="text-muted-foreground mb-4">
                İhtiyacınız olan eşyayı kategorilerde arayın veya konuma göre filtreleyin. Size en yakın eşyaları bulun
                ve detaylarını inceleyin.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Kategorilere göre arama yapın</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Konuma göre filtreleme yapın</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Eşya detaylarını inceleyin</span>
                </li>
              </ul>
              <Button asChild>
                <Link href="/items">
                  Eşyaları Keşfet
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="bg-muted rounded-lg p-6 h-64 flex items-center justify-center md:order-1">
              <Search className="h-24 w-24 text-muted-foreground" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">3. İletişime Geç</h2>
              <p className="text-muted-foreground mb-4">
                Eşya sahibiyle mesajlaşın, ödünç alma tarihini ve teslim noktasını belirleyin. Tüm detayları platform
                üzerinden konuşun.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>İstek gönderin</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Mesajlaşma sistemini kullanın</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Teslim noktası ve zamanı belirleyin</span>
                </li>
              </ul>
              <Button asChild>
                <Link href={user ? "/messages" : "/auth/login"}>
                  {user ? "Mesajlara Git" : "Giriş Yap ve Mesajlaş"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="bg-muted rounded-lg p-6 h-64 flex items-center justify-center">
              <MessageSquare className="h-24 w-24 text-muted-foreground" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center md:flex-row-reverse">
            <div className="md:order-2">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <ThumbsUp className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">4. Değerlendir</h2>
              <p className="text-muted-foreground mb-4">
                Eşyayı teslim ettikten sonra karşılıklı değerlendirme yapın ve puan verin. Bu sayede topluluk içinde
                güven oluşturun ve diğer kullanıcılara yardımcı olun.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Deneyiminizi paylaşın</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Puan verin</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Topluluk güvenini artırın</span>
                </li>
              </ul>
              {user ? (
                <Button asChild>
                  <Link href="/dashboard">
                    Panele Git
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/auth/register">
                    Hemen Başla
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
            <div className="bg-muted rounded-lg p-6 h-64 flex items-center justify-center md:order-1">
              <ThumbsUp className="h-24 w-24 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Sıkça Sorulan Sorular</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Platformu kullanmak ücretli mi?</h3>
              <p className="text-muted-foreground">
                Hayır, Anında Ortak Yaşam platformu tamamen ücretsizdir. Eşya paylaşımı ve ödünç alma işlemleri için
                herhangi bir komisyon veya ücret alınmaz.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Eşyam zarar görürse ne olur?</h3>
              <p className="text-muted-foreground">
                Eşya sahipleri, ödünç verme şartlarını belirleyebilir. Zarar durumunda kullanıcılar arasında anlaşma
                sağlanması beklenir. Platform, kullanıcılar arasındaki güveni artırmak için puanlama sistemi sunar.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Nasıl üye olabilirim?</h3>
              <p className="text-muted-foreground">
                E-posta adresinizle veya Google hesabınızla hızlıca üye olabilirsiniz. Üyelik işlemi sadece birkaç
                dakika sürer ve hemen eşya paylaşmaya veya ödünç almaya başlayabilirsiniz.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Hangi eşyaları paylaşabilirim?</h3>
              <p className="text-muted-foreground">
                Aletler, ev eşyaları, kitaplar, spor ekipmanları gibi nadiren kullandığınız her türlü eşyayı
                paylaşabilirsiniz. Yasadışı, tehlikeli veya sağlığa zararlı ürünlerin paylaşımı yasaktır.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action - Sadece giriş yapmamış kullanıcılara göster */}
        {!user && (
          <div className="mt-16 text-center bg-primary/10 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4">Hemen Katılın</h2>
            <p className="text-xl text-muted-foreground mb-6">
              Eşyalarınızı paylaşarak veya ihtiyacınız olan eşyaları ödünç alarak sürdürülebilir bir topluluk
              oluşturmaya katkıda bulunun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth/register">Üye Ol</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/items">Eşyaları Keşfet</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
