"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, orderBy, limit, getDocs, where, getCountFromServer } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatsCard } from "@/components/ui/stats-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { logger } from "@/lib/logger"
import { Users, Package, MessageSquare, Flag, BarChart3, ShoppingBag, RotateCcw, HeadphonesIcon } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    pendingRequests: 0,
    pendingReturns: 0,
    pendingReports: 0,
    activeSupportSessions: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentItems, setRecentItems] = useState<any[]>([])

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      logger.warn("Non-admin user attempted to access admin page", { userId: user?.uid })
      router.push("/")
      return
    }

    const fetchAdminData = async () => {
      try {
        logger.info("Fetching admin dashboard data")

        // Get counts
        const usersCount = await getCountFromServer(collection(db, "users"))
        const itemsCount = await getCountFromServer(collection(db, "items"))
        const pendingRequestsCount = await getCountFromServer(
          query(collection(db, "requests"), where("status", "==", "pending")),
        )
        const pendingReturnsCount = await getCountFromServer(
          query(collection(db, "returnRequests"), where("status", "==", "pending")),
        )
        const pendingReportsCount = await getCountFromServer(
          query(collection(db, "reports"), where("status", "==", "pending")),
        )
        const activeSupportSessionsCount = await getCountFromServer(
          query(collection(db, "supportSessions"), where("status", "==", "active")),
        )

        setStats({
          totalUsers: usersCount.data().count,
          totalItems: itemsCount.data().count,
          pendingRequests: pendingRequestsCount.data().count,
          pendingReturns: pendingReturnsCount.data().count,
          pendingReports: pendingReportsCount.data().count,
          activeSupportSessions: activeSupportSessionsCount.data().count,
        })

        // Get recent users
        const recentUsersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5))
        const recentUsersSnapshot = await getDocs(recentUsersQuery)
        const recentUsersData = recentUsersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setRecentUsers(recentUsersData)

        // Get recent items
        const recentItemsQuery = query(collection(db, "items"), orderBy("createdAt", "desc"), limit(5))
        const recentItemsSnapshot = await getDocs(recentItemsQuery)
        const recentItemsData = recentItemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setRecentItems(recentItemsData)

        logger.info("Admin dashboard data fetched successfully")
      } catch (error) {
        logger.error("Error fetching admin dashboard data", { error })
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [isAdmin, router, user])

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Belirtilmemiş"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return format(date, "PPP", { locale: tr })
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Yönetici Paneli</h1>
        <p className="text-muted-foreground">Platformun tüm yönetim işlemlerini buradan gerçekleştirebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatsCard
          title="Toplam Kullanıcı"
          value={stats.totalUsers.toString()}
          description="Platformdaki toplam kullanıcı sayısı"
          icon={Users}
          href="/admin/users"
        />
        <StatsCard
          title="Toplam Eşya"
          value={stats.totalItems.toString()}
          description="Platformdaki toplam eşya sayısı"
          icon={Package}
          href="/admin/products"
        />
        <StatsCard
          title="Bekleyen İstekler"
          value={stats.pendingRequests.toString()}
          description="Onay bekleyen ödünç alma istekleri"
          icon={MessageSquare}
          href="/admin/requests"
          highlight={stats.pendingRequests > 0}
        />
        <StatsCard
          title="Bekleyen İadeler"
          value={stats.pendingReturns.toString()}
          description="Onay bekleyen iade talepleri"
          icon={RotateCcw}
          href="/admin/returns"
          highlight={stats.pendingReturns > 0}
        />
        <StatsCard
          title="Bekleyen Raporlar"
          value={stats.pendingReports.toString()}
          description="İnceleme bekleyen raporlar"
          icon={Flag}
          href="/admin/reports"
          highlight={stats.pendingReports > 0}
        />
        <StatsCard
          title="Aktif Destek"
          value={stats.activeSupportSessions.toString()}
          description="Aktif destek görüşmeleri"
          icon={HeadphonesIcon}
          href="/admin/support"
          highlight={stats.activeSupportSessions > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Tabs defaultValue="users">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="users">Son Kullanıcılar</TabsTrigger>
              <TabsTrigger value="items">Son Eşyalar</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/dashboard">
                <BarChart3 className="h-4 w-4 mr-2" />
                Detaylı İstatistikler
              </Link>
            </Button>
          </div>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Son Kaydolan Kullanıcılar</CardTitle>
                <CardDescription>Platforma en son kaydolan 5 kullanıcı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.displayName || "İsimsiz Kullanıcı"}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{formatTimestamp(user.createdAt)}</p>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/users/${user.id}`}>Görüntüle</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Henüz kullanıcı bulunmuyor.</p>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link href="/admin/users">Tüm Kullanıcıları Görüntüle</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Son Eklenen Eşyalar</CardTitle>
                <CardDescription>Platforma en son eklenen 5 eşya</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentItems.length > 0 ? (
                    recentItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{formatTimestamp(item.createdAt)}</p>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/products/${item.id}`}>Görüntüle</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Henüz eşya bulunmuyor.</p>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link href="/admin/products">Tüm Eşyaları Görüntüle</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Hızlı Erişim</CardTitle>
              <CardDescription>Sık kullanılan yönetim sayfalarına hızlıca erişin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
                  <Link href="/admin/requests">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    <span>İstek Yönetimi</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
                  <Link href="/admin/returns">
                    <RotateCcw className="h-6 w-6 mb-2" />
                    <span>İade Yönetimi</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
                  <Link href="/admin/products">
                    <ShoppingBag className="h-6 w-6 mb-2" />
                    <span>Ürün Yönetimi</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
                  <Link href="/admin/support">
                    <HeadphonesIcon className="h-6 w-6 mb-2" />
                    <span>Destek Yönetimi</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bekleyen İşlemler</CardTitle>
              <CardDescription>Dikkat gerektiren işlemler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.pendingRequests > 0 && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-orange-500" />
                      <span>{stats.pendingRequests} bekleyen ödünç alma isteği</span>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/admin/requests">İncele</Link>
                    </Button>
                  </div>
                )}

                {stats.pendingReturns > 0 && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <RotateCcw className="h-5 w-5 text-blue-500" />
                      <span>{stats.pendingReturns} bekleyen iade talebi</span>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/admin/returns">İncele</Link>
                    </Button>
                  </div>
                )}

                {stats.pendingReports > 0 && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Flag className="h-5 w-5 text-red-500" />
                      <span>{stats.pendingReports} bekleyen rapor</span>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/admin/reports">İncele</Link>
                    </Button>
                  </div>
                )}

                {stats.activeSupportSessions > 0 && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <HeadphonesIcon className="h-5 w-5 text-green-500" />
                      <span>{stats.activeSupportSessions} aktif destek görüşmesi</span>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/admin/support">İncele</Link>
                    </Button>
                  </div>
                )}

                {stats.pendingRequests === 0 &&
                  stats.pendingReturns === 0 &&
                  stats.pendingReports === 0 &&
                  stats.activeSupportSessions === 0 && (
                    <p className="text-center text-muted-foreground py-4">Şu anda bekleyen işlem bulunmuyor.</p>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
