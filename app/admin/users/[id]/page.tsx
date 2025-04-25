"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
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
import { ArrowLeft, Ban, CheckCircle, Package, Send } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createNotification } from "@/lib/notifications"

interface UserData {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  role: string
  createdAt: string
  isBanned?: boolean
  banReason?: string
  adminNotes?: string
}

interface Item {
  id: string
  title: string
  category: string
  status: string
  createdAt: any
}

export default function AdminUserDetailPage() {
  const { id } = useParams() as { id: string }
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [userData, setUserData] = useState<UserData | null>(null)
  const [userItems, setUserItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState("")
  const [warningMessage, setWarningMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingWarning, setIsSendingWarning] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
    }
  }, [isAdmin, router])

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true)

        // Fetch user details
        const userDoc = await getDoc(doc(db, "users", id))

        if (userDoc.exists()) {
          const userInfo = {
            uid: userDoc.id,
            ...userDoc.data(),
          } as UserData

          setUserData(userInfo)
          setAdminNotes(userInfo.adminNotes || "")

          // Fetch user's items
          const itemsQuery = query(collection(db, "items"), where("userId", "==", id), orderBy("createdAt", "desc"))

          const itemsSnapshot = await getDocs(itemsQuery)
          const itemsData = itemsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Item[]

          setUserItems(itemsData)
        } else {
          toast({
            variant: "destructive",
            title: "Kullanıcı bulunamadı",
            description: "İstenen kullanıcı mevcut değil veya silinmiş olabilir.",
          })
          router.push("/admin/users")
        }
      } catch (error) {
        console.error("Error fetching user details:", error)
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Kullanıcı bilgileri yüklenirken bir hata oluştu.",
        })
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin) {
      fetchUserDetails()
    }
  }, [id, isAdmin, router, toast])

  const handleBanUser = async () => {
    if (!userData) return

    try {
      setIsSaving(true)

      await updateDoc(doc(db, "users", id), {
        isBanned: true,
        banReason: "Admin tarafından yasaklandı",
        adminNotes,
      })

      setUserData({
        ...userData,
        isBanned: true,
        banReason: "Admin tarafından yasaklandı",
        adminNotes,
      })

      toast({
        title: "Kullanıcı yasaklandı",
        description: "Kullanıcı başarıyla yasaklandı ve artık platforma erişemeyecek.",
      })
    } catch (error) {
      console.error("Error banning user:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanıcı yasaklanırken bir hata oluştu.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUnbanUser = async () => {
    if (!userData) return

    try {
      setIsSaving(true)

      await updateDoc(doc(db, "users", id), {
        isBanned: false,
        banReason: "",
        adminNotes,
      })

      setUserData({
        ...userData,
        isBanned: false,
        banReason: "",
        adminNotes,
      })

      toast({
        title: "Kullanıcı yasağı kaldırıldı",
        description: "Kullanıcının yasağı başarıyla kaldırıldı ve artık platforma erişebilecek.",
      })
    } catch (error) {
      console.error("Error unbanning user:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanıcı yasağı kaldırılırken bir hata oluştu.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!userData) return

    try {
      setIsSaving(true)

      await updateDoc(doc(db, "users", id), {
        adminNotes,
      })

      setUserData({
        ...userData,
        adminNotes,
      })

      toast({
        title: "Notlar kaydedildi",
        description: "Admin notları başarıyla kaydedildi.",
      })
    } catch (error) {
      console.error("Error saving admin notes:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Notlar kaydedilirken bir hata oluştu.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendWarning = async () => {
    if (!userData || !warningMessage.trim()) return

    try {
      setIsSendingWarning(true)

      // Create notification for the user
      await createNotification({
        userId: userData.uid,
        title: "Admin Uyarısı",
        message: warningMessage,
        type: "system",
      })

      // Add warning to admin notes
      const updatedNotes = adminNotes
        ? `${adminNotes}\n\n[UYARI - ${new Date().toLocaleString("tr-TR")}]\n${warningMessage}`
        : `[UYARI - ${new Date().toLocaleString("tr-TR")}]\n${warningMessage}`

      await updateDoc(doc(db, "users", id), {
        adminNotes: updatedNotes,
      })

      setAdminNotes(updatedNotes)
      setWarningMessage("")

      toast({
        title: "Uyarı gönderildi",
        description: "Kullanıcıya uyarı mesajı başarıyla gönderildi.",
      })
    } catch (error) {
      console.error("Error sending warning:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Uyarı gönderilirken bir hata oluştu.",
      })
    } finally {
      setIsSendingWarning(false)
    }
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/admin/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/admin/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Kullanıcı Bulunamadı</h1>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">İstenen kullanıcı mevcut değil veya silinmiş olabilir.</p>
          <Button asChild>
            <Link href="/admin/users">Kullanıcı Listesine Dön</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/admin/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Kullanıcı Detayları</h1>
        </div>

        <div className="flex items-center gap-2">
          {userData.uid !== user?.uid &&
            (userData.isBanned ? (
              <Button
                variant="outline"
                className="gap-2 bg-green-50 hover:bg-green-100 text-green-700"
                onClick={handleUnbanUser}
                disabled={isSaving}
              >
                <CheckCircle className="h-4 w-4" />
                Yasağı Kaldır
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Ban className="h-4 w-4" />
                    Kullanıcıyı Yasakla
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Kullanıcıyı yasaklamak istediğinize emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu işlem kullanıcının platforma erişimini engelleyecektir.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBanUser}>Yasakla</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ))}
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="items">Eşyaları</TabsTrigger>
          <TabsTrigger value="warnings">Uyarılar</TabsTrigger>
          <TabsTrigger value="notes">Admin Notları</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userData.photoURL || ""} alt={userData.displayName} />
                    <AvatarFallback className="text-2xl">
                      {userData.displayName?.charAt(0) || userData.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{userData.displayName}</CardTitle>
                <CardDescription>{userData.email}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Rol:</span>
                  <Badge className={userData.role === "admin" ? "bg-purple-500" : "bg-blue-500"}>
                    {userData.role === "admin" ? "Admin" : "Kullanıcı"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Durum:</span>
                  <Badge className={userData.isBanned ? "bg-red-500" : "bg-green-500"}>
                    {userData.isBanned ? "Yasaklı" : "Aktif"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Kayıt Tarihi:</span>
                  <span className="text-muted-foreground">
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString("tr-TR") : "Belirtilmemiş"}
                  </span>
                </div>

                {userData.isBanned && userData.banReason && (
                  <div className="pt-2 border-t">
                    <span className="font-medium">Yasak Sebebi:</span>
                    <p className="text-muted-foreground mt-1">{userData.banReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Kullanıcı İstatistikleri</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{userItems.length}</div>
                    <div className="text-sm text-muted-foreground mt-1">Toplam Eşya</div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {userItems.filter((item) => item.status === "borrowed").length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Ödünç Verilen</div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {userItems.filter((item) => item.status === "available").length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Müsait Eşya</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Aktivite Özeti</h3>
                  <p className="text-muted-foreground">
                    Bu kullanıcı {userItems.length} eşya paylaşmış ve platformda aktif olarak yer almaktadır.
                    {userData.isBanned && " Ancak şu anda hesabı yasaklı durumdadır."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcının Eşyaları</CardTitle>
              <CardDescription>Bu kullanıcının platformda paylaştığı tüm eşyalar</CardDescription>
            </CardHeader>

            <CardContent>
              {userItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userItems.map((item) => (
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
                        <CardDescription>Kategori: {item.category}</CardDescription>
                      </CardHeader>

                      <CardFooter className="p-4">
                        <Button asChild className="w-full">
                          <Link href={`/admin/products/${item.id}`}>
                            <Package className="h-4 w-4 mr-2" />
                            Eşya Detayları
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Bu kullanıcı henüz eşya paylaşmamış.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warnings">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcıya Uyarı Gönder</CardTitle>
              <CardDescription>
                Bu kullanıcıya bir uyarı mesajı gönderin. Uyarı, kullanıcının bildirimlerinde görünecektir.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Uyarı mesajınızı buraya yazın..."
                rows={4}
              />
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleSendWarning}
                disabled={isSendingWarning || !warningMessage.trim()}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSendingWarning ? "Gönderiliyor..." : "Uyarı Gönder"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Admin Notları</CardTitle>
              <CardDescription>
                Bu notlar sadece admin panelinde görünür ve kullanıcılar tarafından görüntülenemez.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Bu kullanıcı hakkında notlar ekleyin..."
                rows={8}
              />
            </CardContent>

            <CardFooter>
              <Button onClick={handleSaveNotes} disabled={isSaving}>
                {isSaving ? "Kaydediliyor..." : "Notları Kaydet"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
