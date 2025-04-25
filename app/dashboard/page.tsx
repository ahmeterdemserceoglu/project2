"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  BarChart3,
  Clock,
  MessageSquare,
  Package,
  Star,
  ThumbsUp,
  Activity,
  ChevronRight,
  Calendar,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { StatsCard } from "@/components/ui/stats-card"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/components/ui/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Item, Request, Rating } from "@/lib/types"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [userItems, setUserItems] = useState<Item[]>([])
  const [pendingRequests, setPendingRequests] = useState<Request[]>([])
  const [borrowedItems, setBorrowedItems] = useState<Request[]>([])
  const [userRatings, setUserRatings] = useState<Rating[]>([])
  const [activeProcesses, setActiveProcesses] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("processes")

  // Get the tab from URL query parameters
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["processes", "items", "requests", "borrowed", "ratings"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?returnUrl=/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        // Fetch user's items
        const itemsQuery = query(
          collection(db, "items"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(4),
        )
        const itemsSnapshot = await getDocs(itemsQuery)
        const itemsData = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[]

        setUserItems(itemsData)

        // Fetch pending requests (as owner)
        const pendingRequestsQuery = query(
          collection(db, "requests"),
          where("ownerId", "==", user.uid),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc"),
        )
        const pendingRequestsSnapshot = await getDocs(pendingRequestsQuery)
        const pendingRequestsData = pendingRequestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Request[]

        setPendingRequests(pendingRequestsData)

        // Fetch borrowed items (as requester with accepted status)
        const borrowedItemsQuery = query(
          collection(db, "requests"),
          where("requesterId", "==", user.uid),
          where("status", "in", ["accepted", "completed"]),
          orderBy("createdAt", "desc"),
        )
        const borrowedItemsSnapshot = await getDocs(borrowedItemsQuery)
        const borrowedItemsData = borrowedItemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Request[]

        setBorrowedItems(borrowedItemsData)

        // Fetch user ratings
        const ratingsQuery = query(
          collection(db, "ratings"),
          where("ratedUserId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5),
        )
        const ratingsSnapshot = await getDocs(ratingsQuery)
        const ratingsData = ratingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Rating[]

        setUserRatings(ratingsData)

        // Fetch active processes (both as owner and requester)
        const activeProcessesAsOwnerQuery = query(
          collection(db, "requests"),
          where("ownerId", "==", user.uid),
          where("status", "in", ["accepted", "delivered", "return_requested", "return_approved"]),
          orderBy("createdAt", "desc"),
        )

        const activeProcessesAsRequesterQuery = query(
          collection(db, "requests"),
          where("requesterId", "==", user.uid),
          where("status", "in", ["accepted", "delivered", "return_requested", "return_approved"]),
          orderBy("createdAt", "desc"),
        )

        const [ownerSnapshot, requesterSnapshot] = await Promise.all([
          getDocs(activeProcessesAsOwnerQuery),
          getDocs(activeProcessesAsRequesterQuery),
        ])

        const ownerProcesses = ownerSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          role: "owner",
        })) as (Request & { role: string })[]

        const requesterProcesses = requesterSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          role: "requester",
        })) as (Request & { role: string })[]

        // Combine and sort by most recent
        const allActiveProcesses = [...ownerProcesses, ...requesterProcesses].sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0
          const dateB = b.createdAt?.seconds || 0
          return dateB - dateA
        })

        setActiveProcesses(allActiveProcesses)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, toast])

  const calculateAverageRating = () => {
    if (userRatings.length === 0) return "0.0"
    const sum = userRatings.reduce((acc, rating) => acc + rating.rating, 0)
    return (sum / userRatings.length).toFixed(1)
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Bekliyor</Badge>
      case "accepted":
        return <Badge className="bg-green-500">Kabul Edildi</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Reddedildi</Badge>
      case "delivered":
        return <Badge className="bg-blue-500">Teslim Edildi</Badge>
      case "return_requested":
        return <Badge className="bg-purple-500">İade İstendi</Badge>
      case "return_approved":
        return <Badge className="bg-indigo-500">İade Onaylandı</Badge>
      case "completed":
        return <Badge className="bg-green-700">Tamamlandı</Badge>
      case "cancelled":
        return <Badge className="bg-gray-500">İptal Edildi</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  // Helper function to get next action text
  const getNextActionText = (status: string, role: string) => {
    if (role === "owner") {
      switch (status) {
        case "accepted":
          return "Teslim edildiğini onaylayın"
        case "delivered":
          return "İade isteği bekleyin"
        case "return_requested":
          return "İade isteğini onaylayın"
        case "return_approved":
          return "İade tamamlandığını onaylayın"
        default:
          return "Süreci takip edin"
      }
    } else {
      switch (status) {
        case "accepted":
          return "Teslim alındığını bekleyin"
        case "delivered":
          return "İade isteği gönderin"
        case "return_requested":
          return "İade onayını bekleyin"
        case "return_approved":
          return "İade tamamlandığını bekleyin"
        default:
          return "Süreci takip edin"
      }
    }
  }

  // Helper function to get the correct conversation ID for a request
  const getConversationId = (request: Request) => {
    // If the request has a conversationId field, use that
    if (request.conversationId) {
      return request.conversationId
    }
    // Otherwise, use the request ID itself
    return request.id
  }

  // Loading state
  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // User is null, will redirect in useEffect
  if (!user) {
    return null
  }

  // Mobile tab selector component
  const MobileTabSelector = () => (
    <div className="mb-6">
      <Select value={activeTab} onValueChange={setActiveTab}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {activeTab === "processes" && "Aktif Süreçler"}
            {activeTab === "items" && "Eşyalarım"}
            {activeTab === "requests" && "İstekler"}
            {activeTab === "borrowed" && "Ödünç Aldıklarım"}
            {activeTab === "ratings" && "Değerlendirmeler"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="processes">Aktif Süreçler</SelectItem>
          <SelectItem value="items">Eşyalarım</SelectItem>
          <SelectItem value="requests">
            İstekler {pendingRequests.length > 0 && <span className="ml-1 text-red-500">•</span>}
          </SelectItem>
          <SelectItem value="borrowed">Ödünç Aldıklarım</SelectItem>
          <SelectItem value="ratings">Değerlendirmeler</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  // Desktop tab list component
  const DesktopTabList = () => (
    <TabsList className="mb-6">
      <TabsTrigger value="processes">Aktif Süreçler</TabsTrigger>
      <TabsTrigger value="items">Eşyalarım</TabsTrigger>
      <TabsTrigger value="requests" className="relative">
        İstekler
        {pendingRequests.length > 0 && activeTab !== "requests" && (
          <span className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </TabsTrigger>
      <TabsTrigger value="borrowed">Ödünç Aldıklarım</TabsTrigger>
      <TabsTrigger value="ratings">Değerlendirmeler</TabsTrigger>
    </TabsList>
  )

  // Mobile process card component
  const MobileProcessCard = ({ process }: { process: Request & { role: string } }) => (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium">{process.itemTitle}</h3>
          <p className="text-sm text-muted-foreground">
            {process.role === "owner" ? `İsteyen: ${process.requesterName}` : `Eşya Sahibi: ${process.ownerName}`}
          </p>
        </div>
        {getStatusBadge(process.status)}
      </div>
      <div className="p-4">
        <div className="flex items-center mb-3">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">
            {process.pickupDate
              ? new Date(process.pickupDate.seconds * 1000).toLocaleDateString("tr-TR")
              : "Belirtilmemiş"}
          </span>
        </div>
        <div className="flex items-center mb-4">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">{process.pickupLocation}</span>
        </div>
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/items/${process.itemId}`}>Eşya</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/messages/${getConversationId(process)}`}>Mesajlar</Link>
          </Button>
        </div>
      </div>
    </div>
  )

  // Mobile request card component
  const MobileRequestCard = ({ request }: { request: Request }) => (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium">{request.itemTitle}</h3>
          <p className="text-sm text-muted-foreground">İsteyen: {request.requesterName}</p>
        </div>
        <Badge className="bg-yellow-500">Bekliyor</Badge>
      </div>
      <div className="p-4">
        <p className="text-sm mb-3 line-clamp-2">{request.message}</p>
        <div className="flex items-center mb-2">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">
            {request.pickupDate
              ? new Date(request.pickupDate.seconds * 1000).toLocaleDateString("tr-TR")
              : "Belirtilmemiş"}
          </span>
        </div>
        <div className="flex items-center mb-4">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">{request.pickupLocation}</span>
        </div>
        <Button size="sm" className="w-full" asChild>
          <Link href={`/messages/${getConversationId(request)}`}>İsteği Yanıtla</Link>
        </Button>
      </div>
    </div>
  )

  // Mobile borrowed item card component
  const MobileBorrowedCard = ({ request }: { request: Request }) => (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">{request.itemTitle}</h3>
        <Badge className={request.status === "accepted" ? "bg-green-500" : "bg-blue-500"}>
          {request.status === "accepted" ? "Kabul Edildi" : "Tamamlandı"}
        </Badge>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">
            {request.pickupDate
              ? new Date(request.pickupDate.seconds * 1000).toLocaleDateString("tr-TR")
              : "Belirtilmemiş"}
          </span>
        </div>
        <div className="flex items-center mb-4">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">{request.pickupLocation}</span>
        </div>
        <Button size="sm" className="w-full" asChild>
          <Link href={`/messages/${getConversationId(request)}`}>Mesajlara Git</Link>
        </Button>
      </div>
    </div>
  )

  // Mobile rating card component
  const MobileRatingCard = ({ rating }: { rating: Rating }) => (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{rating.itemTitle}</h3>
            <p className="text-sm text-muted-foreground">Değerlendiren: {rating.raterName}</p>
          </div>
          <Badge variant="outline">{rating.type === "borrower" ? "Ödünç Alan" : "Eşya Sahibi"}</Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < rating.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
            />
          ))}
        </div>
        {rating.comment && <p className="text-sm text-muted-foreground">{rating.comment}</p>}
        <p className="text-xs text-muted-foreground mt-2">
          {rating.createdAt ? new Date(rating.createdAt.seconds * 1000).toLocaleDateString("tr-TR") : ""}
        </p>
      </div>
    </div>
  )

  // Mobile item card component
  const MobileItemCard = ({ item }: { item: Item }) => (
    <Link href={`/items/${item.id}`} className="block border rounded-lg mb-4 overflow-hidden">
      <div className="relative h-32 w-full">
        <Image
          src={item.imageUrl || "/placeholder.svg?height=128&width=256"}
          alt={item.title}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <Badge
            className={
              item.status === "available" ? "bg-green-500" : item.status === "borrowed" ? "bg-orange-500" : "bg-red-500"
            }
          >
            {item.status === "available" ? "Müsait" : item.status === "borrowed" ? "Ödünç Verildi" : "Müsait Değil"}
          </Badge>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium line-clamp-1">{item.title}</h3>
        <div className="flex justify-between items-center mt-2">
          <Badge variant="outline">{item.category}</Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  )

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Hoş Geldiniz, {user?.displayName}</h1>
          <p className="text-muted-foreground">Hesabınızı ve eşyalarınızı yönetin</p>
        </div>
        <Button asChild className="self-start md:self-auto">
          <Link href="/items/new">
            <Package className="mr-2 h-4 w-4" />
            Yeni Eşya Ekle
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Eşyalarım"
          value={userItems.length.toString()}
          description="Toplam paylaştığınız eşya sayısı"
          icon={Package}
        />
        <StatsCard
          title="Bekleyen İstekler"
          value={pendingRequests.length.toString()}
          description="Yanıtlamanız gereken istek sayısı"
          icon={Clock}
          trend={pendingRequests.length > 0 ? { value: pendingRequests.length * 10, isPositive: true } : undefined}
        />
        <StatsCard
          title="Değerlendirme"
          value={calculateAverageRating()}
          description={`${userRatings.length} değerlendirme`}
          icon={Star}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {isMobile ? <MobileTabSelector /> : <DesktopTabList />}

        {/* Active Processes Tab */}
        <TabsContent value="processes" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Aktif Süreçler</h2>
          </div>

          {activeProcesses.length > 0 ? (
            isMobile ? (
              <div>
                {activeProcesses.map((process) => (
                  <MobileProcessCard key={process.id} process={process} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {activeProcesses.map((process) => (
                  <Card key={process.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{process.itemTitle}</CardTitle>
                        {getStatusBadge(process.status)}
                      </div>
                      <CardDescription>
                        {process.role === "owner"
                          ? `İsteyen: ${process.requesterName}`
                          : `Eşya Sahibi: ${process.ownerName}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mt-2">
                          <div>
                            <p className="text-sm font-medium">Süreç Durumu</p>
                            <p className="text-sm text-muted-foreground">
                              {process.status === "accepted" && "Kabul edildi, teslim bekleniyor"}
                              {process.status === "delivered" && "Teslim edildi, iade bekleniyor"}
                              {process.status === "return_requested" && "İade istendi, onay bekleniyor"}
                              {process.status === "return_approved" && "İade onaylandı, tamamlanması bekleniyor"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Sonraki Adım</p>
                            <p className="text-sm text-muted-foreground">
                              {getNextActionText(process.status, process.role)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs text-muted-foreground">
                              <strong>Teslim Noktası:</strong> {process.pickupLocation}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Teslim Tarihi:</strong>{" "}
                              {process.pickupDate
                                ? new Date(process.pickupDate.seconds * 1000).toLocaleDateString("tr-TR")
                                : "Belirtilmemiş"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/items/${process.itemId}`}>Eşyayı Gör</Link>
                            </Button>
                            <Button size="sm" asChild>
                              <Link href={`/messages/${getConversationId(process)}`}>Mesajlara Git</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <EmptyState
              icon={Activity}
              title="Aktif süreç bulunmuyor"
              description="Şu anda devam eden bir ödünç verme/alma süreciniz bulunmuyor."
              actionLabel="Eşyaları Keşfet"
              actionLink="/items"
            />
          )}
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Eşyalarım</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/profile">
                Tümünü Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {userItems.length > 0 ? (
            isMobile ? (
              <div>
                {userItems.map((item) => (
                  <MobileItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {userItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden group">
                    <Link href={`/items/${item.id}`} className="block">
                      <div className="relative h-40 w-full overflow-hidden">
                        <Image
                          src={item.imageUrl || "/placeholder.svg?height=160&width=320"}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
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
                      </div>
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <Badge variant="outline">{item.category}</Badge>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button className="w-full">Detayları Gör</Button>
                      </CardFooter>
                    </Link>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <EmptyState
              icon={Package}
              title="Henüz eşya eklemediniz"
              description="Nadiren kullandığınız eşyaları paylaşarak başlayın."
              actionLabel="Eşya Ekle"
              actionLink="/items/new"
            />
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bekleyen İstekler</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/messages">
                Tüm Mesajlar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {pendingRequests.length > 0 ? (
            isMobile ? (
              <div>
                {pendingRequests.map((request) => (
                  <MobileRequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {pendingRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{request.itemTitle}</CardTitle>
                        <Badge className="bg-yellow-500">Bekliyor</Badge>
                      </div>
                      <CardDescription>İsteyen: {request.requesterName}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <strong>Mesaj:</strong> {request.message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Teslim Noktası:</strong> {request.pickupLocation}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Teslim Tarihi:</strong>{" "}
                          {request.pickupDate
                            ? new Date(request.pickupDate.seconds * 1000).toLocaleDateString("tr-TR")
                            : "Belirtilmemiş"}
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" asChild>
                            <Link href={`/items/${request.itemId}`}>Eşyayı Görüntüle</Link>
                          </Button>
                          <Button asChild>
                            <Link href={`/messages/${getConversationId(request)}`}>İsteği Yanıtla</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Bekleyen istek bulunmuyor"
              description="Şu anda yanıtlamanız gereken istek yok."
              actionLabel="Mesajlara Git"
              actionLink="/messages"
            />
          )}
        </TabsContent>

        {/* Borrowed Tab */}
        <TabsContent value="borrowed" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Ödünç Aldıklarım</h2>
          </div>

          {borrowedItems.length > 0 ? (
            isMobile ? (
              <div>
                {borrowedItems.map((request) => (
                  <MobileBorrowedCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {borrowedItems.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{request.itemTitle}</CardTitle>
                        <Badge className={request.status === "accepted" ? "bg-green-500" : "bg-blue-500"}>
                          {request.status === "accepted" ? "Kabul Edildi" : "Tamamlandı"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <strong>Teslim Noktası:</strong> {request.pickupLocation}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Teslim Tarihi:</strong>{" "}
                          {request.pickupDate
                            ? new Date(request.pickupDate.seconds * 1000).toLocaleDateString("tr-TR")
                            : "Belirtilmemiş"}
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button asChild variant="outline">
                            <Link href={`/items/${request.itemId}`}>Eşyayı Gör</Link>
                          </Button>
                          <Button asChild>
                            <Link href={`/messages/${getConversationId(request)}`}>Mesajlara Git</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <EmptyState
              icon={Package}
              title="Ödünç aldığınız eşya bulunmuyor"
              description="Henüz eşya ödünç almadınız."
              actionLabel="Eşyaları Keşfet"
              actionLink="/items"
            />
          )}
        </TabsContent>

        {/* Ratings Tab */}
        <TabsContent value="ratings" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Değerlendirmelerim</h2>
          </div>

          {userRatings.length > 0 ? (
            isMobile ? (
              <div>
                {userRatings.map((rating) => (
                  <MobileRatingCard key={rating.id} rating={rating} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {userRatings.map((rating) => (
                  <Card key={rating.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{rating.itemTitle}</CardTitle>
                          <CardDescription>Değerlendiren: {rating.raterName}</CardDescription>
                        </div>
                        <Badge variant="outline">{rating.type === "borrower" ? "Ödünç Alan" : "Eşya Sahibi"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < rating.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      {rating.comment && <p className="text-muted-foreground">{rating.comment}</p>}
                      <p className="text-xs text-muted-foreground mt-2">
                        {rating.createdAt ? new Date(rating.createdAt.seconds * 1000).toLocaleDateString("tr-TR") : ""}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <EmptyState
              icon={ThumbsUp}
              title="Henüz değerlendirme yok"
              description="Eşya paylaştıkça veya ödünç aldıkça kullanıcılar sizi değerlendirecektir."
              actionLabel="Eşyaları Keşfet"
              actionLink="/items"
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Activity Chart */}
      {!isMobile && (
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Aktivite Özeti</CardTitle>
              <CardDescription>Son 30 günlük platform aktiviteniz</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aktivite grafiği yakında burada görüntülenecek. Platformu kullanmaya devam edin!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
