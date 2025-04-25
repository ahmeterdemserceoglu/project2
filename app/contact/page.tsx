"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Mail, MapPin, Phone } from "lucide-react"
import LocationSelector from "@/components/location-selector"

export default function ContactPage() {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Form doğrulama
    if (!name || !email || !subject || !message) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
      })
      setIsLoading(false)
      return
    }

    // E-posta formatı doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen geçerli bir e-posta adresi girin.",
      })
      setIsLoading(false)
      return
    }

    try {
      // Burada gerçek bir API çağrısı yapılabilir
      // Şimdilik sadece simüle ediyoruz
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Mesajınız gönderildi",
        description: "En kısa sürede size geri dönüş yapacağız.",
      })

      // Formu sıfırla
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
      setLocation("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">İletişim</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-primary" />
                E-posta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">info@anindaortakyasam.com</p>
              <p className="text-muted-foreground">destek@anindaortakyasam.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-primary" />
                Telefon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">+90 (212) 123 45 67</p>
              <p className="text-muted-foreground">+90 (212) 987 65 43</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Adres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Örnek Mahallesi, Teknoloji Caddesi</p>
              <p className="text-muted-foreground">No: 123, Kadıköy / İstanbul</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Bize Ulaşın</CardTitle>
              <CardDescription>
                Sorularınız, önerileriniz veya geri bildirimleriniz için formu doldurun.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Konu</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Mesajınızın konusu"
                  />
                </div>

                <LocationSelector onLocationChange={setLocation} />

                <div className="space-y-2">
                  <Label htmlFor="message">Mesaj</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mesajınızı buraya yazın..."
                    rows={5}
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  "Mesaj Gönder"
                )}
              </Button>
            </CardFooter>
          </Card>

          <div>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Sıkça Sorulan Sorular</CardTitle>
                <CardDescription>En çok sorulan sorular ve cevapları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Platformu kullanmak ücretli mi?</h3>
                  <p className="text-sm text-muted-foreground">
                    Hayır, Anında Ortak Yaşam platformu tamamen ücretsizdir.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Eşyam zarar görürse ne olur?</h3>
                  <p className="text-sm text-muted-foreground">
                    Eşya sahipleri, ödünç verme şartlarını belirleyebilir. Zarar durumunda kullanıcılar arasında anlaşma
                    sağlanması beklenir.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Nasıl üye olabilirim?</h3>
                  <p className="text-sm text-muted-foreground">
                    E-posta adresinizle veya Google hesabınızla hızlıca üye olabilirsiniz.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/how-it-works")}>
                  Nasıl Çalışır? sayfasını ziyaret edin
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Çalışma Saatleri</CardTitle>
                <CardDescription>Müşteri hizmetleri çalışma saatleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pazartesi - Cuma</span>
                    <span>09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cumartesi</span>
                    <span>10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pazar</span>
                    <span>Kapalı</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
