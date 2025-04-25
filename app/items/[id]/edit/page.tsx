"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { LocationSelector } from "@/components/location-selector"
import { Switch } from "@/components/ui/switch"
import { logger } from "@/lib/logger"
import type { Item } from "@/lib/types"

export default function EditItemPage() {
  const { id } = useParams() as { id: string }
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [item, setItem] = useState<Item | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [unlimitedDuration, setUnlimitedDuration] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      if (!user) return

      try {
        setLoading(true)
        const docRef = doc(db, "items", id)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          toast({
            variant: "destructive",
            title: "Eşya bulunamadı",
            description: "Düzenlemek istediğiniz eşya bulunamadı.",
          })
          router.push("/items")
          return
        }

        const itemData = { id: docSnap.id, ...docSnap.data() } as Item

        // Check if user is the owner
        if (itemData.userId !== user.uid) {
          toast({
            variant: "destructive",
            title: "Yetkisiz erişim",
            description: "Bu eşyayı düzenleme yetkiniz yok.",
          })
          router.push("/items")
          return
        }

        setItem(itemData)
        setTitle(itemData.title)
        setDescription(itemData.description)
        setCategory(itemData.category)
        setLocation(itemData.location || "")
        setCurrentImageUrl(itemData.imageUrl || null)
        setUnlimitedDuration(itemData.unlimitedDuration || false)
      } catch (error) {
        console.error("Error fetching item:", error)
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Eşya bilgileri yüklenirken bir hata oluştu.",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchItem()
    } else {
      router.push("/auth/login")
    }
  }, [id, user, router, toast])

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

    if (!user || !item) {
      toast({
        variant: "destructive",
        title: "Giriş yapmalısınız",
        description: "Eşya düzenlemek için lütfen giriş yapın.",
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

      let imageUrl = currentImageUrl

      // Upload new image if selected
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

      // Update item in Firestore
      const itemData = {
        title,
        description,
        category,
        location,
        imageUrl,
        unlimitedDuration,
        updatedAt: new Date(),
      }

      await updateDoc(doc(db, "items", id), itemData)

      logger.info("Item updated", { itemId: id, userId: user.uid })

      toast({
        title: "Eşya güncellendi",
        description: "Eşyanız başarıyla güncellendi.",
      })

      router.push(`/items/${id}`)
    } catch (error) {
      console.error("Error updating item:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Eşya güncellenirken bir hata oluştu. Lütfen tekrar deneyin.",
      })
      logger.error("Error updating item", { error, itemId: id, userId: user?.uid })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !item) {
    return null
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Eşya Düzenle</h1>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Eşya Bilgileri</CardTitle>
              <CardDescription>Eşyanızın bilgilerini güncelleyin.</CardDescription>
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
                    Resim Değiştir
                  </Button>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                {(imagePreview || currentImageUrl) && (
                  <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                    <img
                      src={imagePreview || currentImageUrl || ""}
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
                    Güncelleniyor...
                  </>
                ) : (
                  "Eşyayı Güncelle"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
