"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, orderBy, getDocs, doc, updateDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createNotification } from "@/lib/notifications"
import { CheckCircle, XCircle, MessageSquare, AlertCircle, Clock, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { Request } from "@/lib/types"

export default function AdminRequestsPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      router.push("/")
      return
    }

    const fetchRequests = async () => {
      try {
        const requestsQuery = query(collection(db, "requests"), orderBy("createdAt", "desc"))
        const requestsSnapshot = await getDocs(requestsQuery)

        const requestsData = await Promise.all(
          requestsSnapshot.docs.map(async (docSnapshot) => {
            const request = {
              id: docSnapshot.id,
              ...docSnapshot.data(),
            } as Request

            // Get item details if needed
            if (request.itemId) {
              const itemDoc = await getDocs(query(collection(db, "items"), where("id", "==", request.itemId)))
              if (!itemDoc.empty) {
                request.itemDetails = itemDoc.docs[0].data()
              }
            }

            return request
          }),
        )

        setRequests(requestsData)
      } catch (error) {
        console.error("Error fetching requests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [isAdmin, router])

  const handleApproveRequest = async (requestId: string) => {
    try {
      const requestRef = doc(db, "requests", requestId)
      await updateDoc(requestRef, {
        status: "accepted",
        adminReviewed: true,
      })

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === requestId ? { ...request, status: "accepted", adminReviewed: true } : request,
        ),
      )

      // Update item status if needed
      const request = requests.find((r) => r.id === requestId)
      if (request?.itemId) {
        const itemRef = doc(db, "items", request.itemId)
        await updateDoc(itemRef, {
          status: "borrowed",
        })
      }

      // Send notification to requester
      if (request) {
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
      }
    } catch (error) {
      console.error("Error approving request:", error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const requestRef = doc(db, "requests", requestId)
      await updateDoc(requestRef, {
        status: "rejected",
        adminReviewed: true,
      })

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === requestId ? { ...request, status: "rejected", adminReviewed: true } : request,
        ),
      )

      // Send notification to requester
      const request = requests.find((r) => r.id === requestId)
      if (request) {
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
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
    }
  }

  const handleInitiateChat = async (requestId: string) => {
    const request = requests.find((r) => r.id === requestId)
    if (request) {
      router.push(`/admin/chat/${request.id}`)
    }
  }

  const getFilteredRequests = () => {
    switch (activeTab) {
      case "pending":
        return requests.filter((request) => request.status === "pending")
      case "approved":
        return requests.filter((request) => request.status === "accepted")
      case "rejected":
        return requests.filter((request) => request.status === "rejected")
      case "completed":
        return requests.filter((request) => request.status === "completed")
      default:
        return requests
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
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
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ürün İstekleri Yönetimi</h1>
          <p className="text-muted-foreground">Kullanıcıların ürün isteklerini inceleyip yönetin</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Admin Paneline Dön
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="pending">Bekleyenler</TabsTrigger>
            <TabsTrigger value="approved">Onaylananlar</TabsTrigger>
            <TabsTrigger value="rejected">Reddedilenler</TabsTrigger>
            <TabsTrigger value="completed">Tamamlananlar</TabsTrigger>
          </TabsList>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrele
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sıralama</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>En Yeniler</DropdownMenuItem>
              <DropdownMenuItem>En Eskiler</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Kategori</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Tüm Kategoriler</DropdownMenuItem>
              <DropdownMenuItem>Ev Eşyaları</DropdownMenuItem>
              <DropdownMenuItem>Elektronik</DropdownMenuItem>
              <DropdownMenuItem>Kitaplar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TabsContent value="all" className="space-y-4">
          {renderRequestsList(getFilteredRequests())}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          {renderRequestsList(getFilteredRequests())}
        </TabsContent>
        <TabsContent value="approved" className="space-y-4">
          {renderRequestsList(getFilteredRequests())}
        </TabsContent>
        <TabsContent value="rejected" className="space-y-4">
          {renderRequestsList(getFilteredRequests())}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {renderRequestsList(getFilteredRequests())}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderRequestsList(requestsList: Request[]) {
    if (requestsList.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">İstek bulunamadı</p>
            <p className="text-muted-foreground text-center">Bu kategoride henüz istek bulunmamaktadır.</p>
          </CardContent>
        </Card>
      )
    }

    return requestsList.map((request) => (
      <Card key={request.id} className="overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => router.push(`/admin/requests/${request.id}`)}
                >
                  {request.itemTitle}
                </span>
              </CardTitle>
              <CardDescription>İstek ID: {request.id.substring(0, 8)}...</CardDescription>
            </div>
            {getStatusBadge(request.status)}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{request.requesterName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">İsteyen: {request.requesterName}</p>
                  <p className="text-xs text-muted-foreground">ID: {request.requesterId.substring(0, 8)}...</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{request.ownerName?.charAt(0) || "S"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Eşya Sahibi: {request.ownerName || "Bilinmiyor"}</p>
                  <p className="text-xs text-muted-foreground">ID: {request.ownerId.substring(0, 8)}...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Mesaj:</p>
              <p className="text-sm text-muted-foreground">{request.message}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Teslim Bilgileri:</p>
              <p className="text-sm text-muted-foreground">Konum: {request.pickupLocation}</p>
              <p className="text-sm text-muted-foreground">
                Tarih: {request.pickupDate ? formatTimestamp(request.pickupDate) : "Belirtilmemiş"}
              </p>
              <p className="text-sm text-muted-foreground">İstek Tarihi: {formatTimestamp(request.createdAt)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end mt-4">
            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/requests/${request.id}`)}>
              Detayları Görüntüle
            </Button>

            {request.status === "pending" && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApproveRequest(request.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Onayla
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleRejectRequest(request.id)}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Reddet
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={() => handleInitiateChat(request.id)}>
              <MessageSquare className="h-4 w-4 mr-1" />
              Mesaj Gönder
            </Button>
          </div>
        </CardContent>
      </Card>
    ))
  }
}
