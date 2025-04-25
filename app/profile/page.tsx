"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Package, MessageSquare, Settings, Users, BarChart3, AlertCircle, RotateCcw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { Item, Rating } from "@/lib/types"

export default function ProfilePage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  const [userItems, setUserItems] = useState<Item[]>([])
  const [userRatings, setUserRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("items")

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return

      try {
        // Fetch user's items
        const itemsQuery = query(collection(db, "items"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))
        const itemsSnapshot = await getDocs(itemsQuery)
        const itemsData = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[]

        setUserItems(itemsData)

        // Fetch user ratings
        const ratingsQuery = query(
          collection(db, "ratings"),
          where("ratedUserId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )
        const ratingsSnapshot = await getDocs(ratingsQuery)
        const ratingsData = ratingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Rating[]

        setUserRatings(ratingsData)
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  const calculateAverageRating = () => {
    if (userRatings.length === 0) return 0
    const sum = userRatings.reduce((acc, rating) => acc + rating.rating, 0)
    return sum / userRatings.length
  }

  // Loading state
  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-12 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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

  return (
    <div className="container py-8 px-4 md:px-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Avatar className="h-32 w-32">
          <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
          <AvatarFallback className="text-4xl">{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{user.displayName}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(calculateAverageRating())
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({calculateAverageRating().toFixed(1)}) • {userRatings.length} değerlendirme
            </span>
          </div>
          <div className="flex gap-2 mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-1" />
                Profil Düzenle
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="items">Eşyalarım</TabsTrigger>
          <TabsTrigger value="ratings">Değerlendirmeler</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Eşyalarım</h2>
            <Button asChild>
              <Link href="/items/new">
                <Package className="mr-2 h-4 w-4" />
                Yeni Eşya Ekle
              </Link>
            </Button>
          </div>

          {userItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={item.imageUrl || "/placeholder.svg?height=192&width=384"}
                      alt={item.title}
                      fill
                      className="object-cover"
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
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full">
                      <Link href={`/items/${item.id}`}>Detayları Gör</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Henüz eşya eklemediniz</h3>
              <p className="text-muted-foreground mb-6">Nadiren kullandığınız eşyaları paylaşarak başlayın.</p>
              <Button asChild>
                <Link href="/items/new">Eşya Ekle</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Ratings Tab */}
        <TabsContent value="ratings" className="space-y-6">
          <h2 className="text-xl font-semibold">Değerlendirmeler</h2>

          {userRatings.length > 0 ? (
            <div className="space-y-4">
              {userRatings.map((rating) => (
                <Card key={rating.id}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{rating.raterName}</CardTitle>
                        <CardDescription>
                          {format(rating.createdAt ? new Date(rating.createdAt.seconds * 1000) : new Date(), "PPP", {
                            locale: tr,
                          })}
                        </CardDescription>
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
                    <p className="text-muted-foreground">{rating.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Henüz değerlendirme yok</h3>
              <p className="text-muted-foreground">
                Eşya paylaştıkça veya ödünç aldıkça kullanıcılar sizi değerlendirecektir.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Admin Tab - Only visible for admins */}
        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <h2 className="text-xl font-semibold">Admin Paneli</h2>
            <p className="text-muted-foreground mb-6">Sistem yönetimi için aşağıdaki bölümlere erişebilirsiniz.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Yönetim Paneli
                  </CardTitle>
                  <CardDescription>Genel sistem durumunu görüntüleyin</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcı istatistikleri, eşya durumları ve sistem performansını izleyin.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/admin">Panele Git</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Dashboard
                  </CardTitle>
                  <CardDescription>Sistem istatistiklerini görüntüleyin</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Detaylı istatistikler, grafikler ve sistem performans göstergeleri.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/admin/dashboard">Dashboard'a Git</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Kullanıcılar
                  </CardTitle>
                  <CardDescription>Kullanıcı yönetimi</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Kullanıcıları görüntüleyin, düzenleyin veya yönetin.</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/admin/users">Kullanıcılara Git</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Ürünler
                  </CardTitle>
                  <CardDescription>Ürün yönetimi</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sistemdeki tüm eşyaları görüntüleyin, düzenleyin veya yönetin.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/admin/products">Ürünlere Git</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    İstek Onaylama
                  </CardTitle>
                  <CardDescription>İstek yönetimi</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcılar arasındaki istekleri görüntüleyin ve gerektiğinde müdahale edin.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/admin/requests">İsteklere Git</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RotateCcw className="h-5 w-5 mr-2" />
                    İadeler
                  </CardTitle>
                  <CardDescription>İade yönetimi</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcılar arasındaki iade işlemlerini görüntüleyin ve gerektiğinde müdahale edin.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/admin/returns">İadelere Git</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Raporlar
                  </CardTitle>
                  <CardDescription>Rapor yönetimi</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcılar tarafından bildirilen sorunları ve raporları görüntüleyin.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/admin/reports">Raporlara Git</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
