"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { updateReturnRequestStatus } from "@/lib/return-requests"
import { logger } from "@/lib/logger"
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
  RotateCcw,
} from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Image from "next/image"
import type { ReturnRequest, Item } from "@/lib/types"

export default function AdminReturnDetailPage() {
  const { id } = useParams() as { id: string }
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null)
  const [item, setItem] = useState<Item | null>(null)
  const [requesterDetails, setRequesterDetails] = useState<any>(null)
  const [ownerDetails, setOwnerDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      logger.warn("Non-admin user attempted to access admin return detail page", { userId: user?.uid })
      router.push("/")
      return
    }

    const fetchReturnRequestDetails = async () => {
      try {
        logger.info("Fetching return request details", { returnRequestId: id })

        const returnRequestRef = doc(db, "returnRequests", id)
        const returnRequestSnap = await getDoc(returnRequestRef)

        if (returnRequestSnap.exists()) {
          const returnRequestData = {
            id: returnRequestSnap.id,
            ...returnRequestSnap.data(),
          } as ReturnRequest

          setReturnRequest(returnRequestData)
          logger.info("Return request details fetched successfully", { returnRequestId: id })

          // Fetch item details
          if (returnRequestData.itemId) {
            const itemRef = doc(db, "items", returnRequestData.itemId)
            const itemSnap = await getDoc(itemRef)

            if (itemSnap.exists()) {
              setItem({
                id: itemSnap.id,
                ...itemSnap.data(),
              } as Item)
            }
          }

          // Fetch requester details
          if (returnRequestData.requesterId) {
            const requesterRef = doc(db, "users", returnRequestData.requesterId)
            const requesterSnap = await getDoc(requesterRef)

            if (requesterSnap.exists()) {
              setRequesterDetails(requesterSnap.data())
            }
          }

          // Fetch owner details
          if (returnRequestData.ownerId) {
            const ownerRef = doc(db, "users", returnRequestData.ownerId)
            const ownerSnap = await getDoc(ownerRef)

            if (ownerSnap.exists()) {
              setOwnerDetails(ownerSnap.data())
            }
          }
        } else {
          logger.error("Return request not found", { returnRequestId: id })

          toast({
            variant: "destructive",
            title: "İade talebi bulunamadı",
            description: "Belirtilen iade talebi mevcut değil veya silinmiş olabilir.",
          })
          router.push("/admin/returns")
        }
      } catch (error) {
        logger.error("Error fetching return request details", { error, returnRequestId: id })

        toast({
          variant: "destructive",
          title: "Hata",
          description: "İade talebi detayları yüklenirken bir hata oluştu.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReturnRequestDetails()
  }, [id, isAdmin, router, toast, user])

  const handleApproveReturn = async () => {
    if (!returnRequest) return

    try {
      logger.info("Approving return request", { returnRequestId: returnRequest.id })

      const result = await updateReturnRequestStatus({
        returnRequestId: returnRequest.id,
        status: "accepted",
        adminReviewed: true,
      })

      if (result.success) {
        // Update local state
        setReturnRequest({
          ...returnRequest,
          status: "accepted",
          adminReviewed: true,
        })

        toast({
          title: "İade talebi onaylandı",
          description: "İade talebi başarıyla onaylandı ve ilgili kullanıcılara bildirim gönderildi.",
        })

        logger.info("Return request approved successfully", { returnRequestId: returnRequest.id })
      } else {
        throw new Error("İade talebi onaylanamadı")
      }
    } catch (error) {
      logger.error("Error approving return request", { error, returnRequestId: returnRequest?.id })

      toast({
        variant: "destructive",
        title: "Hata",
        description: "İade talebi onaylanırken bir hata oluştu.",
      })
    }
  }

  const handleRejectReturn = async () => {
    if (!returnRequest) return

    try {
      logger.info("Rejecting return request", { returnRequestId: returnRequest.id })

      const result = await updateReturnRequestStatus({
        returnRequestId: returnRequest.id,
        status: "rejected",
        adminReviewed: true,
      })

      if (result.success) {
        // Update local state
        setReturnRequest({
          ...returnRequest,
          status: "rejected",
          adminReviewed: true,
        })

        toast({
          title: "İade talebi reddedildi",
          description: "İade talebi başarıyla reddedildi ve ilgili kullanıcılara bildirim gönderildi.",
        })

        logger.info("Return request rejected successfully", { returnRequestId: returnRequest.id })
      } else {
        throw new Error("İade talebi reddedilemedi")
      }
    } catch (error) {
      logger.error("Error rejecting return request", { error, returnRequestId: returnRequest?.id })

      toast({
        variant: "destructive",
        title: "Hata",
        description: "İade talebi reddedilirken bir hata oluştu.",
      })
    }
  }

  const handleInitiateChat = () => {
    if (!returnRequest) return

    if (returnRequest.conversationId) {
      router.push(`/admin/chat/${returnRequest.conversationId}`)
    } else {
      // If no conversation exists, create one or show error
      toast({
        variant: "destructive",
        title: "Konuşma bulunamadı",
        description: "Bu iade talebi için henüz bir konuşma başlatılmamış.",
      })
    }
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

  if (!returnRequest) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">İade talebi bulunamadı</h1>
          <p className="text-muted-foreground mb-6">Belirtilen iade talebi mevcut değil veya silinmiş olabilir.</p>
          <Button onClick={() => router.push("/admin/returns")}>İade Taleplerine Dön</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <Button variant="outline" className="mb-6" onClick={() => router.push("/admin/returns")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        İade Taleplerine Dön
      </Button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{returnRequest.itemTitle}</h1>
          <p className="text-muted-foreground">İade Talebi ID: {returnRequest.id}</p>
        </div>
        <div>{getStatusBadge(returnRequest.status)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">İade Detayları</TabsTrigger>
              <TabsTrigger value="item">Ürün Bilgileri</TabsTrigger>
              <TabsTrigger value="users">Kullanıcı Bilgileri</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>İade Bilgileri</CardTitle>
                  <CardDescription>İade talebi hakkında detaylı bilgiler</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">İade Durumu:</p>
                      <div className="mt-1">{getStatusBadge(returnRequest.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">İade Talebi Tarihi:</p>
                      <p className="text-sm text-muted-foreground">{formatTimestamp(returnRequest.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Mesaj:</p>
                    <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                      {returnRequest.message}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">İade Noktası:</p>
                        <p className="text-sm text-muted-foreground">{returnRequest.returnLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">İade Tarihi:</p>
                        <p className="text-sm text-muted-foreground">
                          {returnRequest.returnDate ? formatTimestamp(returnRequest.returnDate) : "Belirtilmemiş"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {returnRequest.adminReviewed && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Admin İncelemesi:</p>
                      <p className="text-sm text-muted-foreground">
                        Bu iade talebi bir yönetici tarafından incelenmiş ve
                        {returnRequest.status === "accepted"
                          ? " onaylanmıştır."
                          : returnRequest.status === "rejected"
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
                        <RotateCcw className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">İade Talebi Oluşturuldu</p>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(returnRequest.createdAt)}</p>
                        <p className="text-sm mt-1">
                          {returnRequest.requesterName} kullanıcısı "{returnRequest.itemTitle}" için iade talebi
                          oluşturdu.
                        </p>
                      </div>
                    </div>

                    {returnRequest.status !== "pending" && (
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 rounded-full ${
                            returnRequest.status === "accepted"
                              ? "bg-green-100"
                              : returnRequest.status === "rejected"
                                ? "bg-red-100"
                                : "bg-blue-100"
                          } flex items-center justify-center`}
                        >
                          {returnRequest.status === "accepted" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : returnRequest.status === "rejected" ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            İade Talebi{" "}
                            {returnRequest.status === "accepted"
                              ? "Onaylandı"
                              : returnRequest.status === "rejected"
                                ? "Reddedildi"
                                : returnRequest.status === "completed"
                                  ? "Tamamlandı"
                                  : "Güncellendi"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {/* Burada gerçek tarih olmalı */}
                            {formatTimestamp(new Date())}
                          </p>
                          <p className="text-sm mt-1">
                            {returnRequest.status === "accepted"
                              ? "İade talebi yönetici tarafından onaylandı."
                              : returnRequest.status === "rejected"
                                ? "İade talebi yönetici tarafından reddedildi."
                                : returnRequest.status === "completed"
                                  ? "İade işlemi tamamlandı ve ürün teslim edildi."
                                  : "İade talebi durumu güncellendi."}
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
                    <CardDescription>İade edilen ürün hakkında detaylar</CardDescription>
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
                      Bu iade talebi için ürün bilgisi mevcut değil veya ürün silinmiş olabilir.
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
                      <CardTitle>İade Eden Kullanıcı</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback>{returnRequest.requesterName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{returnRequest.requesterName}</h3>
                        <p className="text-sm text-muted-foreground">ID: {returnRequest.requesterId}</p>
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
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/users/${returnRequest.requesterId}`)}
                      >
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
                        <AvatarFallback>{returnRequest.ownerName?.charAt(0) || "S"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{returnRequest.ownerName || "Bilinmiyor"}</h3>
                        <p className="text-sm text-muted-foreground">ID: {returnRequest.ownerId}</p>
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
                      <Button variant="outline" onClick={() => router.push(`/admin/users/${returnRequest.ownerId}`)}>
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
              {returnRequest.status === "pending" && (
                <>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleApproveReturn}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    İade Talebini Onayla
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={handleRejectReturn}>
                    <XCircle className="h-4 w-4 mr-2" />
                    İade Talebini Reddet
                  </Button>
                </>
              )}
              {returnRequest.conversationId && (
                <Button variant="outline" className="w-full" onClick={handleInitiateChat}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mesaj Gönder
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/items/${returnRequest.itemId}`)}
              >
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
                  <span className="text-sm font-medium">İade Durumu:</span>
                  {getStatusBadge(returnRequest.status)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Admin İncelemesi:</span>
                  <Badge variant={returnRequest.adminReviewed ? "outline" : "secondary"}>
                    {returnRequest.adminReviewed ? "İncelendi" : "İncelenmedi"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Eşya Sahibi Onayı:</span>
                  <Badge variant={returnRequest.ownerConfirmed ? "outline" : "secondary"}>
                    {returnRequest.ownerConfirmed ? "Onaylandı" : "Onaylanmadı"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">İade Eden Onayı:</span>
                  <Badge variant={returnRequest.requesterConfirmed ? "outline" : "secondary"}>
                    {returnRequest.requesterConfirmed ? "Onaylandı" : "Onaylanmadı"}
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
