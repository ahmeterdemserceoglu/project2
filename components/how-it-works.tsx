import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, MessageSquare, Search, ThumbsUp } from "lucide-react"

export default function HowItWorks() {
  return (
    <section className="container px-4 md:px-6">
      <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">Nasıl Çalışır?</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <Camera className="h-8 w-8 text-primary" />
            <CardTitle className="text-xl">1. Eşyanı Paylaş</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Nadiren kullandığın eşyaları fotoğrafla, kategorisini seç ve ilan ver.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Search className="h-8 w-8 text-primary" />
            <CardTitle className="text-xl">2. İhtiyacını Bul</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>İhtiyacın olan eşyayı kategorilerde ara veya konuma göre filtrele.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <CardTitle className="text-xl">3. İletişime Geç</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Eşya sahibiyle mesajlaş, ödünç alma tarihini ve teslim noktasını belirle.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <ThumbsUp className="h-8 w-8 text-primary" />
            <CardTitle className="text-xl">4. Değerlendir</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Eşyayı teslim ettikten sonra karşılıklı değerlendirme yap ve puan ver.</CardDescription>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
