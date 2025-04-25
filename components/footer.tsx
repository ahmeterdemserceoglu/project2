import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Anında Ortak Yaşam
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Nadiren kullandığınız eşyaları paylaşarak ve ihtiyacınız olanları ödünç alarak sürdürülebilir bir topluluk
              oluşturun.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-4">Keşfet</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/items" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tüm Eşyalar
                </Link>
              </li>
              <li>
                <Link
                  href="/items?category=tools"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Aletler
                </Link>
              </li>
              <li>
                <Link
                  href="/items?category=home"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Ev Eşyaları
                </Link>
              </li>
              <li>
                <Link
                  href="/items?category=books"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Kitaplar
                </Link>
              </li>
              <li>
                <Link
                  href="/items?category=other"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Diğer
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-4">Hakkımızda</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Nasıl Çalışır
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-4">Yasal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Çerez Politikası
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Anında Ortak Yaşam. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Yardım Merkezi
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Topluluk Kuralları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
