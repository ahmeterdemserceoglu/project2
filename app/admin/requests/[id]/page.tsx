"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createNotification } from "@/lib/notifications"
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertCircle,
  ArrowLeft,
  User,
  Package,
  Calendar,
  MapPin,
} from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Image from "next/image"
import type { Request, Item } from "@/lib/types"

export default function AdminRequestDetailPage() {
  const { id } = useParams() as { id: string }
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [request, setRequest] = useState<Request | null>(null)
  const [item, setItem] = useState<Item | null>(null)
  const [requesterDetails, setRequesterDetails] = useState<any>(null)
  const [ownerDetails, setOwnerDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      router.push("/")
      return
    }

    const fetchRequestDetails = async () => {
      try {
        const requestRef = doc(db, "requests", id)
        const requestSnap = await getDoc(requestRef)

        if (requestSnap.exists()) {
          const requestData = {
            id: requestSnap.id,
            ...requestSnap.data(),
          } as Request

          setRequest(requestData)

          // Fetch item details
          if (requestData.itemId) {
            const itemRef = doc(db, "items", requestData.itemId)
            const itemSnap = await getDoc(itemRef)

            if (itemSnap.exists()) {
              setItem({
                id: itemSnap.id,
                ...itemSnap.data(),
              } as Item)
            }
          }

          // Fetch requester details
          if (requestData.requesterId) {
            const requesterRef = doc(db, "users", requestData.requesterId)
            const requesterSnap = await getDoc(requesterRef)

            if (requesterSnap.exists()) {
              setRequesterDetails(requesterSnap.data())
            }
          }

          // Fetch owner details
          if (requestData.ownerId) {
            const ownerRef = doc(db, "users", requestData.ownerId)
            const ownerSnap = await getDoc(ownerRef)

            if (ownerSnap.exists()) {
              setOwnerDetails(ownerSnap.data())
            }
          }
        } else {
          toast({
            variant: "destructive",
            title: "İstek bulunamadı",
            description: "Belirtilen istek mevcut değil veya silinmiş olabilir.",
          })
          router.push("/admin/requests")
        }
      } catch (error) {
        console.error("Error fetching request details:", error)
        toast({
          variant: "destructive",
          title: "Hata",
          description: "İstek detayları yüklenirken bir hata oluştu.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRequestDetails()
  }, [id, isAdmin, router, toast])

  const handleApproveRequest = async () => {
    if (!request) return

    try {
      const requestRef = doc(db, "requests", request.id)
      await updateDoc(requestRef, {
        status: "accepted",
        adminReviewed: true,
      })

      // Update item status if needed
      if (item) {
        const itemRef = doc(db, "items", item.id)
        await updateDoc(itemRef, {
          status: "borrowed",
        })
      }

      // Update local state
      setRequest({
        ...request,
        status: "accepted",
        adminReviewed: true,
      })

      // Send notification to requester
      await createNotification({
        userId: request.requesterId,
        title: "İsteğiniz Onaylandı",
        message: `"${request.itemTitle}" için yaptığınız istek onaylandı.`,
        type: "system",
        link: `/messages`,
      })

      // Send notification to owner
      await createNotification({
        userId: request.ownerId,
        title: "İstek Onaylandı",
        message: `"${request.itemTitle}" için yapılan istek yönetici tarafından onaylandı.`,
        type: "system",
        link: `/messages`,
      })

      toast({
        title: "İstek onaylandı",
        description: "İstek başarıyla onaylandı ve ilgili kullanıcılara bildirim gönderildi.",
      })
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İstek onaylanırken bir hata oluştu.",
      })
    }
  }

  const handleRejectRequest = async () => {
    if (!request) return

    try {
      const requestRef = doc(db, "requests", request.id)
      await updateDoc(requestRef, {
        status: "rejected",
        adminReviewed: true,
      })

      // Update local state
      setRequest({
        ...request,
        status: "rejected",
        adminReviewed: true,
      })

      // Send notification to requester
      await createNotification({
        userId: request.requesterId,
        title: "İsteğiniz Reddedildi",
        message: `"${request.itemTitle}" için yaptığınız istek reddedildi.`,
        type: "system",
        link: `/messages`,
      })

      // Send notification to owner
      await createNotification({
        userId: request.ownerId,
        title: "İstek Reddedildi",
        message: `"${request.itemTitle}" için yapılan istek yönetici tarafından reddedildi.`,
        type: "system",
        link: `/messages`,
      })

      toast({
        title: "İstek reddedildi",
        description: "İstek başarıyla reddedildi ve ilgili kullanıcılara bildirim gönderildi.",
      })
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İstek reddedilirken bir hata oluştu.",
      })
    }
  }

  const handleInitiateChat = () => {
    if (!request) return
    router.push(`/admin/chat/${request.id}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Bekliyor
          </Badge>
        )
      case "accepted":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Onaylandı
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500">
            <XCircle className="h-3 w-3 mr-1" />
            Reddedildi
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-blue-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Tamamlandı
          </Badge>
        )
      case "awaiting_approval":
        return (
          <Badge className="bg-orange-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Onay Bekliyor
          </Badge>
        )
      default:
        return <Badge className="bg-gray-500">Bilinmiyor</Badge>
    }
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Belirtilmemiş"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return format(date, "PPP", { locale: tr })
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-8 mr-2" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">İstek bulunamadı</h1>
          <p className="text-muted-foreground mb-6">Belirtilen istek mevcut değil veya silinmiş olabilir.</p>
          <Button onClick={() => router.push("/admin/requests")}>İsteklere Dön</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <Button variant="outline" className="mb-6" onClick={() => router.push("/admin/requests")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        İsteklere Dön
      </Button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{request.itemTitle}</h1>
          <p className="text-muted-foreground">İstek ID: {request.id}</p>
        </div>
        <div>{getStatusBadge(request.status)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">İstek Detayları</TabsTrigger>
              <TabsTrigger value="item">Ürün Bilgileri</TabsTrigger>
              <TabsTrigger value="users">Kullanıcı Bilgileri</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>İstek Bilgileri</CardTitle>
                  <CardDescription>İstek hakkında detaylı bilgiler</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">İstek Durumu:</p>
                      <div className="mt-1">{getStatusBadge(request.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">İstek Tarihi:</p>
                      <p className="text-sm text-muted-foreground">{formatTimestamp(request.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Mesaj:</p>
                    <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">{request.message}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Teslim Noktası:</p>
                        <p className="text-sm text-muted-foreground">{request.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Teslim Tarihi:</p>
                        <p className="text-sm text-muted-foreground">
                          {request.pickupDate ? formatTimestamp(request.pickupDate) : "Belirtilmemiş"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {request.adminReviewed && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Admin İncelemesi:</p>
                      <p className="text-sm text-muted-foreground">
                        Bu istek bir yönetici tarafından incelenmiş ve
                        {request.status === "accepted"
                          ? " onaylanmıştır."
                          : request.status === "rejected"
                            ? " reddedilmiştir."
                            : " işlem yapılmıştır."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>İşlem Geçmişi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">İstek Oluşturuldu</p>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(request.createdAt)}</p>
                        <p className="text-sm mt-1">
                          {request.requesterName} kullanıcısı "{request.itemTitle}" için istek oluşturdu.
                        </p>
                      </div>
                    </div>

                    {request.status !== "pending" && (
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 rounded-full ${
                            request.status === "accepted"
                              ? "bg-green-100"
                              : request.status === "rejected"
                                ? "bg-red-100"
                                : "bg-blue-100"
                          } flex items-center justify-center`}
                        >
                          {request.status === "accepted" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : request.status === "rejected" ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            İstek{" "}
                            {request.status === "accepted"
                              ? "Onaylandı"
                              : request.status === "rejected"
                                ? "Reddedildi"
                                : request.status === "completed"
                                  ? "Tamamlandı"
                                  : "Güncellendi"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {/* Burada gerçek tarih olmalı */}
                            {formatTimestamp(new Date())}
                          </p>
                          <p className="text-sm mt-1">
                            {request.status === "accepted"
                              ? "İstek yönetici tarafından onaylandı."
                              : request.status === "rejected"
                                ? "İstek yönetici tarafından reddedildi."
                                : request.status === "completed"
                                  ? "İşlem tamamlandı ve ürün teslim edildi."
                                  : "İstek durumu güncellendi."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="item" className="space-y-6">
              {item ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Ürün Bilgileri</CardTitle>
                    <CardDescription>İstek yapılan ürün hakkında detaylar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative aspect-square rounded-md overflow-hidden">
                        <Image
                          src={item.imageUrl || "/placeholder.svg?height=300&width=300"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">{item.title}</h3>
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
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm font-medium">Kategori:</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Konum:</p>
                            <p className="text-sm text-muted-foreground">{item.location}</p>
                          </div>
                          {item.duration && (
                            <div>
                              <p className="text-sm font-medium">Ödünç Verme Süresi:</p>
                              <p className="text-sm text-muted-foreground">{item.duration}</p>
                            </div>
                          )}
                          {item.conditions && (
                            <div>
                              <p className="text-sm font-medium">Şartlar:</p>
                              <p className="text-sm text-muted-foreground">{item.conditions}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">Oluşturulma Tarihi:</p>
                          <p className="text-sm text-muted-foreground">{formatTimestamp(item.createdAt)}</p>
                        </div>
                        <Button variant="outline" onClick={() => router.push(`/admin/products/${item.id}`)}>
                          Ürün Yönetim Sayfasına Git
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Ürün bilgisi bulunamadı</p>
                    <p className="text-muted-foreground">
                      Bu istek için ürün bilgisi mevcut değil veya ürün silinmiş olabilir.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>İsteyen Kullanıcı</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback>{request.requesterName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{request.requesterName}</h3>
                        <p className="text-sm text-muted-foreground">ID: {request.requesterId}</p>
                      </div>
                    </div>
                    {requesterDetails && (
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">E-posta:</p>
                          <p className="text-sm text-muted-foreground">{requesterDetails.email || "Belirtilmemiş"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Kayıt Tarihi:</p>
                          <p className="text-sm text-muted-foreground">
                            {requesterDetails.createdAt ? formatTimestamp(requesterDetails.createdAt) : "Belirtilmemiş"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Rol:</p>
                          <Badge variant="outline">
                            {requesterDetails.role === "admin" ? "Yönetici" : "Kullanıcı"}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <Button variant="outline" onClick={() => router.push(`/admin/users/${request.requesterId}`)}>
                        Kullanıcı Profilini Görüntüle
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>Eşya Sahibi</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback>{request.ownerName?.charAt(0) || "S"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{request.ownerName || "Bilinmiyor"}</h3>
                        <p className="text-sm text-muted-foreground">ID: {request.ownerId}</p>
                      </div>
                    </div>
                    {ownerDetails && (
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">E-posta:</p>
                          <p className="text-sm text-muted-foreground">{ownerDetails.email || "Belirtilmemiş"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Kayıt Tarihi:</p>
                          <p className="text-sm text-muted-foreground">
                            {ownerDetails.createdAt ? formatTimestamp(ownerDetails.createdAt) : "Belirtilmemiş"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Rol:</p>
                          <Badge variant="outline">{ownerDetails.role === "admin" ? "Yönetici" : "Kullanıcı"}</Badge>
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <Button variant="outline" onClick={() => router.push(`/admin/users/${request.ownerId}`)}>
                        Kullanıcı Profilini Görüntüle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.status === "pending" && (
                <>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleApproveRequest}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    İsteği Onayla
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={handleRejectRequest}>
                    <XCircle className="h-4 w-4 mr-2" />
                    İsteği Reddet
                  </Button>
                </>
              )}
              <Button variant="outline" className="w-full" onClick={handleInitiateChat}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Mesaj Gönder
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push(`/items/${request.itemId}`)}>
                <Package className="h-4 w-4 mr-2" />
                Ürün Sayfasına Git
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Durum Bilgisi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">İstek Durumu:</span>
                  {getStatusBadge(request.status)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Admin İncelemesi:</span>
                  <Badge variant={request.adminReviewed ? "outline" : "secondary"}>
                    {request.adminReviewed ? "İncelendi" : "İncelenmedi"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Eşya Sahibi Onayı:</span>
                  <Badge variant={request.ownerConfirmed ? "outline" : "secondary"}>
                    {request.ownerConfirmed ? "Onaylandı" : "Onaylanmadı"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">İsteyen Onayı:</span>
                  <Badge variant={request.requesterConfirmed ? "outline" : "secondary"}>
                    {request.requesterConfirmed ? "Onaylandı" : "Onaylanmadı"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
