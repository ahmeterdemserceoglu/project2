"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Bell, Check, MessageSquare, Star, Trash } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import type { Notification } from "@/lib/types"

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  useEffect(() => {
    if (!user) return

    // Subscribe to notifications
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    )

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[]

      setNotifications(notificationsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read
    if (!notification.read) {
      await updateDoc(doc(db, "notifications", notification.id), {
        read: true,
      })
    }

    // Navigate to the link if provided
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((notification) => !notification.read)

    if (unreadNotifications.length === 0) {
      toast({
        description: "Okunmamış bildirim bulunmuyor.",
      })
      return
    }

    try {
      // Update each unread notification
      for (const notification of unreadNotifications) {
        await updateDoc(doc(db, "notifications", notification.id), {
          read: true,
        })
      }

      toast({
        title: "Bildirimler okundu",
        description: "Tüm bildirimler okundu olarak işaretlendi.",
      })
    } catch (error) {
      console.error("Error marking notifications as read:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Bildirimler işaretlenirken bir hata oluştu.",
      })
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, "notifications", notificationId))
      toast({
        description: "Bildirim silindi.",
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Bildirim silinirken bir hata oluştu.",
      })
    }
  }

  const deleteAllNotifications = async () => {
    try {
      // Delete each notification
      for (const notification of notifications) {
        await deleteDoc(doc(db, "notifications", notification.id))
      }

      toast({
        title: "Bildirimler silindi",
        description: "Tüm bildirimler silindi.",
      })
    } catch (error) {
      console.error("Error deleting notifications:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Bildirimler silinirken bir hata oluştu.",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "request":
        return <Bell className="h-5 w-5 text-orange-500" />
      case "rating":
        return <Star className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-primary" />
    }
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return ""

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return formatDistanceToNow(date, { addSuffix: true, locale: tr })
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    return notification.type === activeTab
  })

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Bildirimler</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Tümünü Okundu İşaretle
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Tümünü Sil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tüm bildirimleri silmek istediğinize emin misiniz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu işlem geri alınamaz. Tüm bildirimleriniz kalıcı olarak silinecektir.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllNotifications}>Sil</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="unread">Okunmamış</TabsTrigger>
            <TabsTrigger value="message">Mesajlar</TabsTrigger>
            <TabsTrigger value="request">İstekler</TabsTrigger>
            <TabsTrigger value="rating">Değerlendirmeler</TabsTrigger>
            <TabsTrigger value="system">Sistem</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      notification.read ? "" : "bg-muted/30"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <CardDescription className="text-base">{notification.message}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground">{formatTimestamp(notification.createdAt)}</p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Bildirim Bulunmuyor</h2>
                <p className="text-muted-foreground">
                  {activeTab === "all"
                    ? "Henüz hiç bildiriminiz yok."
                    : activeTab === "unread"
                      ? "Tüm bildirimleriniz okundu."
                      : `${
                          activeTab === "message"
                            ? "Mesaj"
                            : activeTab === "request"
                              ? "İstek"
                              : activeTab === "rating"
                                ? "Değerlendirme"
                                : "Sistem"
                        } bildirimi bulunmuyor.`}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
