"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ImageGallery } from "@/components/ui/image-gallery"
import RequestItemDialog from "@/components/request-item-dialog"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MapPin, Calendar, Clock, AlertTriangle, Edit, Trash2, ArrowLeft, Infinity } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { logger } from "@/lib/logger"

// Utility function to format dates
const formatDate = (date: any) => {
  if (!date) return "Belirtilmemiş"

  try {
    // Handle Firestore Timestamp
    if (date && typeof date.toDate === "function") {
      date = date.toDate()
    }

    // Check if date is valid
    const d = new Date(date)
    if (isNaN(d.getTime())) return "Geçersiz tarih"

    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d)
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Belirtilmemiş"
  }
}

export default function ItemDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        setError(null)

        const docRef = doc(db, "items", id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const itemData = { id: docSnap.id, ...docSnap.data() }
          setItem(itemData)
          setIsOwner(user?.uid === itemData.userId)
          logger.info("Item fetched successfully", { itemId: id })
        } else {
          setError("Eşya bulunamadı")
          logger.warn("Item not found", { itemId: id })

          // Redirect to items page after a short delay
          setTimeout(() => {
            router.push("/items")
          }, 2000)
        }
      } catch (error) {
        console.error("Error fetching item:", error)
        setError("Eşya bilgileri yüklenirken bir hata oluştu")
        logger.error("Error fetching item", { error, itemId: id })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchItem()
    }
  }, [id, user, router])

  const handleDelete = async () => {
    if (!isOwner || !item) return

    try {
      setIsDeleting(true)
      await deleteDoc(doc(db, "items", id))

      toast({
        title: "Eşya silindi",
        description: "Eşya başarıyla silindi.",
      })

      logger.info("Item deleted successfully", { itemId: id, userId: user?.uid })
      router.push("/items")
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Eşya silinirken bir hata oluştu.",
      })
      logger.error("Error deleting item", { error, itemId: id, userId: user?.uid })
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!isOwner || !item) return

    try {
      await updateDoc(doc(db, "items", id), {
        status: newStatus,
      })

      setItem({ ...item, status: newStatus })

      toast({
        title: "Durum güncellendi",
        description: `Eşya durumu "${newStatus === "available" ? "Müsait" : newStatus === "borrowed" ? "Ödünç Verildi" : "Müsait Değil"}" olarak güncellendi.`,
      })

      logger.info("Item status updated", { itemId: id, userId: user?.uid, newStatus })
    } catch (error) {
      console.error("Error updating item status:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu.",
      })
      logger.error("Error updating item status", { error, itemId: id, userId: user?.uid })
    }
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Eşya bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Hata
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/items">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Eşyalara Dön
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Eşya Bulunamadı
            </CardTitle>
            <CardDescription>İstediğiniz eşya bulunamadı veya kaldırılmış olabilir.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/items">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Eşyalara Dön
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column - Image */}
          <div className="lg:col-span-3">
            <div className="relative">
              <ImageGallery images={item.images && item.images.length > 0 ? item.images : [item.imageUrl]} />
              <div className="absolute top-4 right-4">
                <FavoriteButton itemId={item.id} className="bg-background/80 hover:bg-background" />
              </div>
            </div>
          </div>

          {/* Right column - Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                    <div className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                      <CardDescription>{item.location}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={
                      item.status === "available"
                        ? "bg-green-500"
                        : item.status === "borrowed"
                          ? "bg-orange-500"
                          : "bg-red-500"
                    }
                  >
                    {item.status === "available"
                      ? "Müsait"
                      : item.status === "borrowed"
                        ? "Ödünç Verildi"
                        : "Müsait Değil"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Açıklama</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Kategori</h3>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Eklenme Tarihi</h3>
                    <p className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                  </div>
                </div>

                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Ödünç Verme Süresi</h3>
                      {item.unlimitedDuration ? (
                        <div className="flex items-center">
                          <Infinity className="h-4 w-4 mr-1 text-primary" />
                          <p className="text-sm text-muted-foreground">Sınırsız Süre</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{item.duration || "Belirtilmemiş"}</p>
                      )}
                    </div>
                  </div>
                  {item.conditions && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">Şartlar</h3>
                        <p className="text-sm text-muted-foreground">{item.conditions}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-1">Eşya Sahibi</h3>
                  <p className="text-muted-foreground">{item.userDisplayName || "İsimsiz Kullanıcı"}</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {isOwner ? (
                  <div className="w-full space-y-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-medium">Durum Değiştir</h3>
                      <div className="flex gap-2">
                        <Button
                          variant={item.status === "available" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusChange("available")}
                        >
                          Müsait
                        </Button>
                        <Button
                          variant={item.status === "borrowed" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusChange("borrowed")}
                        >
                          Ödünç Verildi
                        </Button>
                        <Button
                          variant={item.status === "unavailable" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusChange("unavailable")}
                        >
                          Müsait Değil
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/items/${id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Link>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex-1">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eşyayı silmek istediğinize emin misiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu işlem geri alınamaz. Eşya kalıcı olarak silinecektir.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                              {isDeleting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Siliniyor...
                                </>
                              ) : (
                                "Evet, Sil"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <RequestItemDialog
                      itemId={item.id}
                      itemTitle={item.title}
                      ownerId={item.userId}
                      ownerName={item.userDisplayName}
                      isUnlimitedDuration={item.unlimitedDuration}
                      disabled={item.status !== "available" || !user}
                    />
                    {!user && (
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        Eşya talep etmek için{" "}
                        <Link href="/auth/login" className="text-primary hover:underline">
                          giriş yapmalısınız
                        </Link>
                        .
                      </p>
                    )}
                    {item.status !== "available" && (
                      <p className="text-sm text-muted-foreground mt-2 text-center">Bu eşya şu anda müsait değil.</p>
                    )}
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
