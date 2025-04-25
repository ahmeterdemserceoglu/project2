"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, getDocs, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Package, AlertTriangle, BarChart3, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { StatsCard } from "@/components/ui/stats-card"

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  const [pendingRequests, setPendingRequests] = useState([])
  const [recentItems, setRecentItems] = useState([])
  const [recentReports, setRecentReports] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    pendingRequests: 0,
    activeReports: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      router.push("/")
      return
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch pending requests
        const requestsQuery = query(
          collection(db, "requests"),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc"),
          limit(5),
        )
        const requestsSnapshot = await getDocs(requestsQuery)
        const requestsData = requestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setPendingRequests(requestsData)

        // Fetch recent items
        const itemsQuery = query(collection(db, "items"), orderBy("createdAt", "desc"), limit(5))
        const itemsSnapshot = await getDocs(itemsQuery)
        const itemsData = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setRecentItems(itemsData)

        // Fetch recent reports
        const reportsQuery = query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(5))
        const reportsSnapshot = await getDocs(reportsQuery)
        const reportsData = reportsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setRecentReports(reportsData)

        // Get stats
        const usersSnapshot = await getDocs(collection(db, "users"))
        const allItemsSnapshot = await getDocs(collection(db, "items"))
        const allRequestsSnapshot = await getDocs(query(collection(db, "requests"), where("status", "==", "pending")))
        const allReportsSnapshot = await getDocs(query(collection(db, "reports"), where("status", "==", "active")))

        setStats({
          totalUsers: usersSnapshot.size,
          totalItems: allItemsSnapshot.size,
          pendingRequests: allRequestsSnapshot.size,
          activeReports: allReportsSnapshot.size,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAdmin, router])

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
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

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Yönetici Paneli</h1>
          <p className="text-muted-foreground">Platform verilerini görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Toplam Kullanıcı"
          value={stats.totalUsers.toString()}
          description="Platformdaki toplam kullanıcı sayısı"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Toplam Ürün"
          value={stats.totalItems.toString()}
          description="Platformdaki toplam ürün sayısı"
          icon={Package}
        />
        <StatsCard
          title="Bekleyen İstekler"
          value={stats.pendingRequests.toString()}
          description="İncelemeniz gereken istek sayısı"
          icon={Clock}
          trend={stats.pendingRequests > 0 ? { value: stats.pendingRequests, isPositive: false } : undefined}
        />
        <StatsCard
          title="Aktif Raporlar"
          value={stats.activeReports.toString()}
          description="İncelemeniz gereken rapor sayısı"
          icon={AlertTriangle}
          trend={stats.activeReports > 0 ? { value: stats.activeReports, isPositive: false } : undefined}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Bekleyen İstekler</TabsTrigger>
          <TabsTrigger value="items">Son Eklenen Ürünler</TabsTrigger>
          <TabsTrigger value="reports">Son Raporlar</TabsTrigger>
        </TabsList>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Bekleyen İstekler</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/requests">
                Tüm İstekleri Görüntüle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
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
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/requests/${request.id}`)}
                        >
                          Detayları Görüntüle
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Onayla
                        </Button>
                        <Button variant="destructive" size="sm">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reddet
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Bekleyen istek bulunmuyor</p>
                <p className="text-muted-foreground text-center">
                  Şu anda incelemeniz gereken bekleyen istek bulunmamaktadır.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Son Eklenen Ürünler</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/products">
                Tüm Ürünleri Görüntüle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recentItems.length > 0 ? (
            <div className="space-y-4">
              {recentItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
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
                    <CardDescription>Ekleyen: {item.userDisplayName}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Kategori:</strong> {item.category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Konum:</strong> {item.location}
                      </p>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/products/${item.id}`)}>
                          Detayları Görüntüle
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Henüz ürün eklenmemiş</p>
                <p className="text-muted-foreground text-center">Platformda henüz ürün bulunmamaktadır.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Son Raporlar</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/reports">
                Tüm Raporları Görüntüle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recentReports.length > 0 ? (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{report.itemTitle || "Rapor"}</CardTitle>
                      <Badge className="bg-red-500">Rapor</Badge>
                    </div>
                    <CardDescription>Raporlayan: {report.reporterName}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Sebep:</strong> {report.reason}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Açıklama:</strong> {report.description}
                      </p>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/reports/${report.id}`)}>
                          Detayları Görüntüle
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Rapor bulunmuyor</p>
                <p className="text-muted-foreground text-center">Şu anda incelemeniz gereken rapor bulunmamaktadır.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Activity Chart */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Platform Aktivitesi</CardTitle>
            <CardDescription>Son 30 günlük platform aktivitesi</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aktivite grafiği yakında burada görüntülenecek.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
