"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"
import { storage, db } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { LocationSelector } from "@/components/location-selector"
import { Switch } from "@/components/ui/switch"
import { logger } from "@/lib/logger"
import Link from "next/link"

export default function NewItemPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [unlimitedDuration, setUnlimitedDuration] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!user)

  useEffect(() => {
    setIsLoggedIn(!!user)
  }, [user])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth/login?returnUrl=" + encodeURIComponent("/items/new"))
    }
  }, [isLoggedIn, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Geçersiz dosya",
        description: "Lütfen bir resim dosyası seçin.",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Resim çok büyük",
        description: "Maksimum resim boyutu 5MB olmalıdır.",
      })
      return
    }

    setImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        variant: "destructive",
        title: "Giriş yapmalısınız",
        description: "Eşya eklemek için lütfen giriş yapın.",
      })
      router.push("/auth/login")
      return
    }

    if (!title || !description || !category) {
      toast({
        variant: "destructive",
        title: "Eksik bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun.",
      })
      return
    }

    try {
      setUploading(true)

      let imageUrl = ""

      // Upload image if selected
      if (image) {
        const storageRef = ref(storage, `items/${Date.now()}_${image.name}`)
        const uploadTask = uploadBytesResumable(storageRef, image)

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            () => {},
            (error) => {
              reject(error)
            },
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref)
              resolve()
            },
          )
        })
      }

      // Add item to Firestore
      const itemData = {
        title,
        description,
        category,
        location,
        imageUrl: imageUrl || null,
        userId: user.uid,
        userDisplayName: user.displayName,
        status: "available",
        unlimitedDuration: unlimitedDuration,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "items"), itemData)

      logger.info("Item created", { itemId: docRef.id, userId: user.uid })

      toast({
        title: "Eşya eklendi",
        description: "Eşyanız başarıyla eklendi.",
      })

      router.push(`/items/${docRef.id}`)
    } catch (error) {
      console.error("Error adding item:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Eşya eklenirken bir hata oluştu. Lütfen tekrar deneyin.",
      })
      logger.error("Error adding item", { error, userId: user?.uid })
    } finally {
      setUploading(false)
    }
  }

  if (!isLoggedIn) {
    // Kullanıcı giriş yapmamışsa, giriş sayfasına yönlendir

    return (
      <div className="container py-8 px-4 md:px-6 flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Giriş yapmanız gerekiyor</h1>
          <p className="text-muted-foreground mb-6">Eşya eklemek için lütfen giriş yapın.</p>
          <Button asChild>
            <Link href={`/auth/login?returnUrl=${encodeURIComponent("/items/new")}`}>Giriş Yap</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Yeni Eşya Ekle</h1>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Eşya Bilgileri</CardTitle>
              <CardDescription>Paylaşmak istediğiniz eşyanın detaylarını girin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  placeholder="Eşyanın adı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  placeholder="Eşya hakkında detaylı bilgi verin"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elektronik">Elektronik</SelectItem>
                    <SelectItem value="kitap">Kitap</SelectItem>
                    <SelectItem value="giyim">Giyim</SelectItem>
                    <SelectItem value="mobilya">Mobilya</SelectItem>
                    <SelectItem value="mutfak">Mutfak</SelectItem>
                    <SelectItem value="spor">Spor</SelectItem>
                    <SelectItem value="oyuncak">Oyuncak</SelectItem>
                    <SelectItem value="bahçe">Bahçe</SelectItem>
                    <SelectItem value="diğer">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Konum</Label>
                <LocationSelector value={location} onChange={setLocation} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Resim</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image-upload")?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Resim Seç
                  </Button>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                {imagePreview && (
                  <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch id="unlimited-duration" checked={unlimitedDuration} onCheckedChange={setUnlimitedDuration} />
                <Label htmlFor="unlimited-duration" className="cursor-pointer">
                  Sınırsız Süreli Eşya
                </Label>
              </div>
              {unlimitedDuration && (
                <p className="text-sm text-muted-foreground">
                  Bu eşya sınırsız süreyle ödünç verilebilir. İade süreci başlatılmayacaktır.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  "Eşya Ekle"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
