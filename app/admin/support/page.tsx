"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  addDoc,
} from "firebase/firestore"
import { logger } from "@/lib/logger"
import { format, differenceInDays } from "date-fns"
import { tr } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  HeadphonesIcon,
  Clock,
  MessageSquare,
  Trash2,
  MoreVertical,
  RefreshCw,
  Send,
  Loader2,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react"

type SupportSession = {
  id: string
  userId: string
  userName: string
  userEmail: string
  status: "active" | "closed"
  lastActivity: Timestamp
  createdAt: Timestamp
  unreadCount: number
}

type SupportMessage = {
  id: string
  sessionId: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  isAdmin: boolean
  timestamp: Timestamp
  read: boolean
}

export default function AdminSupportPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<SupportSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<SupportSession[]>([])
  const [selectedSession, setSelectedSession] = useState<SupportSession | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [cleanupInProgress, setCleanupInProgress] = useState(false)
  const [resetInProgress, setResetInProgress] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      logger.warn("Non-admin user attempted to access admin support page", { userId: user?.uid })
      router.push("/")
    }
  }, [user, isAdmin, router])

  // Load support sessions
  useEffect(() => {
    if (!user || !isAdmin) return

    const sessionsQuery = query(collection(db, "supportSessions"), orderBy("lastActivity", "desc"))

    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionsData: SupportSession[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        sessionsData.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName || "İsimsiz Kullanıcı",
          userEmail: data.userEmail || "E-posta yok",
          status: data.status,
          lastActivity: data.lastActivity,
          createdAt: data.createdAt,
          unreadCount: data.unreadCount || 0,
        })
      })

      setSessions(sessionsData)
      setFilteredSessions(sessionsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, isAdmin])

  // Filter sessions when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSessions(sessions)
    } else {
      const filtered = sessions.filter(
        (session) =>
          session.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.userEmail.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredSessions(filtered)
    }
  }, [searchQuery, sessions])

  // Load messages for selected session
  useEffect(() => {
    if (!selectedSession) {
      setMessages([])
      return
    }

    const messagesQuery = query(
      collection(db, "supportMessages"),
      where("sessionId", "==", selectedSession.id),
      orderBy("timestamp", "asc"),
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData: SupportMessage[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        messagesData.push({
          id: doc.id,
          sessionId: data.sessionId,
          content: data.content,
          senderId: data.senderId,
          senderName: data.senderName || "İsimsiz Kullanıcı",
          senderAvatar: data.senderAvatar,
          isAdmin: data.isAdmin || false,
          timestamp: data.timestamp,
          read: data.read || false,
        })
      })

      setMessages(messagesData)

      // Mark unread messages as read
      if (selectedSession.unreadCount > 0) {
        updateDoc(doc(db, "supportSessions", selectedSession.id), {
          unreadCount: 0,
        })
      }

      // Mark individual messages as read
      messagesData.forEach((message) => {
        if (!message.read && !message.isAdmin) {
          updateDoc(doc(db, "supportMessages", message.id), {
            read: true,
          })
        }
      })
    })

    return () => unsubscribe()
  }, [selectedSession])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSession || !user) return

    setSendingMessage(true)
    try {
      // Add message
      await addDoc(collection(db, "supportMessages"), {
        sessionId: selectedSession.id,
        content: newMessage,
        senderId: user.uid,
        senderName: "Destek Ekibi",
        isAdmin: true,
        timestamp: serverTimestamp(),
        read: true,
      })

      // Update session
      await updateDoc(doc(db, "supportSessions", selectedSession.id), {
        lastActivity: serverTimestamp(),
      })

      setNewMessage("")
    } catch (error) {
      logger.error("Error sending support message", { error })
    } finally {
      setSendingMessage(false)
    }
  }

  const handleCloseSession = async (sessionId: string) => {
    try {
      await updateDoc(doc(db, "supportSessions", sessionId), {
        status: "closed",
        lastActivity: serverTimestamp(),
      })

      // Add system message
      await addDoc(collection(db, "supportMessages"), {
        sessionId: sessionId,
        content: "Bu destek oturumu kapatılmıştır.",
        senderId: "system",
        senderName: "Sistem",
        isAdmin: true,
        timestamp: serverTimestamp(),
        read: true,
      })

      if (selectedSession?.id === sessionId) {
        setSelectedSession(null)
      }
    } catch (error) {
      logger.error("Error closing support session", { error, sessionId })
    }
  }

  const handleReopenSession = async (sessionId: string) => {
    try {
      await updateDoc(doc(db, "supportSessions", sessionId), {
        status: "active",
        lastActivity: serverTimestamp(),
      })

      // Add system message
      await addDoc(collection(db, "supportMessages"), {
        sessionId: sessionId,
        content: "Bu destek oturumu yeniden açılmıştır.",
        senderId: "system",
        senderName: "Sistem",
        isAdmin: true,
        timestamp: serverTimestamp(),
        read: true,
      })
    } catch (error) {
      logger.error("Error reopening support session", { error, sessionId })
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      // Delete all messages in the session
      const messagesQuery = query(collection(db, "supportMessages"), where("sessionId", "==", sessionId))

      const messagesSnapshot = await getDocs(messagesQuery)
      const deletePromises = messagesSnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Delete the session
      await deleteDoc(doc(db, "supportSessions", sessionId))

      if (selectedSession?.id === sessionId) {
        setSelectedSession(null)
      }
    } catch (error) {
      logger.error("Error deleting support session", { error, sessionId })
    }
  }

  const handleResetSession = async (sessionId: string) => {
    try {
      setResetInProgress(true)

      // Delete all messages in the session
      const messagesQuery = query(collection(db, "supportMessages"), where("sessionId", "==", sessionId))

      const messagesSnapshot = await getDocs(messagesQuery)
      const deletePromises = messagesSnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Add system message
      await addDoc(collection(db, "supportMessages"), {
        sessionId: sessionId,
        content: "Bu destek oturumu sıfırlanmıştır.",
        senderId: "system",
        senderName: "Sistem",
        isAdmin: true,
        timestamp: serverTimestamp(),
        read: true,
      })

      // Update session
      await updateDoc(doc(db, "supportSessions", sessionId), {
        lastActivity: serverTimestamp(),
        unreadCount: 0,
      })

      setIsResetDialogOpen(false)
    } catch (error) {
      logger.error("Error resetting support session", { error, sessionId })
    } finally {
      setResetInProgress(false)
    }
  }

  const handleCleanupOldSessions = async () => {
    try {
      setCleanupInProgress(true)

      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      // Find sessions older than 2 days
      const oldSessionsQuery = query(
        collection(db, "supportSessions"),
        where("lastActivity", "<=", Timestamp.fromDate(twoDaysAgo)),
      )

      const oldSessionsSnapshot = await getDocs(oldSessionsQuery)

      // Delete each old session and its messages
      const deletePromises = oldSessionsSnapshot.docs.map(async (sessionDoc) => {
        const sessionId = sessionDoc.id

        // Delete all messages in the session
        const messagesQuery = query(collection(db, "supportMessages"), where("sessionId", "==", sessionId))

        const messagesSnapshot = await getDocs(messagesQuery)
        const messageDeletePromises = messagesSnapshot.docs.map((doc) => deleteDoc(doc.ref))
        await Promise.all(messageDeletePromises)

        // Delete the session
        return deleteDoc(sessionDoc.ref)
      })

      await Promise.all(deletePromises)

      logger.info("Cleaned up old support sessions", {
        count: oldSessionsSnapshot.size,
      })

      setIsCleanupDialogOpen(false)
    } catch (error) {
      logger.error("Error cleaning up old sessions", { error })
    } finally {
      setCleanupInProgress(false)
    }
  }

  const formatTimestamp = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return "Belirtilmemiş"
    return format(timestamp.toDate(), "d MMM yyyy HH:mm", { locale: tr })
  }

  const getSessionAge = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 0
    return differenceInDays(new Date(), timestamp.toDate())
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="h-16 w-full rounded-md" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-16 w-full rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Destek Yönetimi</h1>
          <p className="text-muted-foreground">Kullanıcı destek görüşmelerini yönetin</p>
        </div>

        <div className="flex gap-2">
          <AlertDialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Eski Oturumları Temizle
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eski Oturumları Temizle</AlertDialogTitle>
                <AlertDialogDescription>
                  2 günden eski tüm destek oturumları ve mesajları silinecektir. Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleCleanupOldSessions} disabled={cleanupInProgress}>
                  {cleanupInProgress ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Temizleniyor...
                    </>
                  ) : (
                    "Temizle"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Destek Oturumları</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {filteredSessions.length}
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Kullanıcı ara..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <Tabs defaultValue="active">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="active" className="flex-1">
                    Aktif
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="flex-1">
                    Kapalı
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                  {filteredSessions.filter((s) => s.status === "active").length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Aktif destek oturumu bulunmuyor</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredSessions
                        .filter((session) => session.status === "active")
                        .map((session) => (
                          <div
                            key={session.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedSession?.id === session.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                            onClick={() => setSelectedSession(session)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium truncate flex-1">
                                {session.userName}
                                {session.unreadCount > 0 && (
                                  <Badge variant="destructive" className="ml-2">
                                    {session.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-7 w-7 ${
                                      selectedSession?.id === session.id
                                        ? "text-primary-foreground hover:bg-primary/90"
                                        : ""
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Oturum İşlemleri</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleCloseSession(session.id)}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Oturumu Kapat
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedSession(session)
                                      setIsResetDialogOpen(true)
                                    }}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Oturumu Sıfırla
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Oturumu Sil
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-sm truncate opacity-80">{session.userEmail}</p>
                            <div className="flex justify-between items-center mt-2 text-xs opacity-70">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTimestamp(session.lastActivity)}
                              </div>
                              {getSessionAge(session.createdAt) >= 2 && (
                                <Badge
                                  variant="outline"
                                  className={`${
                                    selectedSession?.id === session.id
                                      ? "border-primary-foreground text-primary-foreground"
                                      : ""
                                  }`}
                                >
                                  {getSessionAge(session.createdAt)} gün
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="closed">
                  {filteredSessions.filter((s) => s.status === "closed").length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Kapalı destek oturumu bulunmuyor</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredSessions
                        .filter((session) => session.status === "closed")
                        .map((session) => (
                          <div
                            key={session.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedSession?.id === session.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                            onClick={() => setSelectedSession(session)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium truncate flex-1">{session.userName}</div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-7 w-7 ${
                                      selectedSession?.id === session.id
                                        ? "text-primary-foreground hover:bg-primary/90"
                                        : ""
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Oturum İşlemleri</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleReopenSession(session.id)}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Oturumu Yeniden Aç
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Oturumu Sil
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-sm truncate opacity-80">{session.userEmail}</p>
                            <div className="flex justify-between items-center mt-2 text-xs opacity-70">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTimestamp(session.lastActivity)}
                              </div>
                              {getSessionAge(session.createdAt) >= 2 && (
                                <Badge
                                  variant="outline"
                                  className={`${
                                    selectedSession?.id === session.id
                                      ? "border-primary-foreground text-primary-foreground"
                                      : ""
                                  }`}
                                >
                                  {getSessionAge(session.createdAt)} gün
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              {selectedSession ? (
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>{selectedSession.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {selectedSession.userName}
                      <Badge variant={selectedSession.status === "active" ? "default" : "secondary"} className="ml-2">
                        {selectedSession.status === "active" ? "Aktif" : "Kapalı"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{selectedSession.userEmail}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {selectedSession.status === "active" ? (
                      <Button variant="outline" size="sm" onClick={() => handleCloseSession(selectedSession.id)}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Oturumu Kapat
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleReopenSession(selectedSession.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Oturumu Yeniden Aç
                      </Button>
                    )}

                    <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sıfırla
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Oturumu Sıfırla</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu oturumdaki tüm mesajlar silinecektir. Bu işlem geri alınamaz.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleResetSession(selectedSession.id)}
                            disabled={resetInProgress}
                          >
                            {resetInProgress ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sıfırlanıyor...
                              </>
                            ) : (
                              "Sıfırla"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                <CardTitle>Mesajlar</CardTitle>
              )}
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto">
              {!selectedSession ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <HeadphonesIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Destek Oturumu Seçilmedi</h3>
                  <p className="text-muted-foreground max-w-md">
                    Görüntülemek ve yanıtlamak için soldaki listeden bir destek oturumu seçin.
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Henüz Mesaj Yok</h3>
                  <p className="text-muted-foreground max-w-md">Bu destek oturumunda henüz mesaj bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-4 p-2">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isAdmin ? "justify-end" : "justify-start"}`}>
                      {!message.isAdmin && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {message.senderId === "system" ? "S" : message.senderName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className="max-w-[80%]">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-medium">
                            {message.senderId === "system"
                              ? "Sistem"
                              : message.isAdmin
                                ? "Destek Ekibi"
                                : message.senderName}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp && formatTimestamp(message.timestamp)}
                          </span>
                        </div>

                        <div
                          className={`p-3 rounded-lg ${
                            message.senderId === "system"
                              ? "bg-muted text-muted-foreground"
                              : message.isAdmin
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>

                      {message.isAdmin && (
                        <Avatar className="h-8 w-8 ml-2 mt-1">
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {selectedSession && selectedSession.status === "active" && (
              <CardFooter className="pt-3 border-t">
                <div className="flex w-full gap-2">
                  <Textarea
                    placeholder="Mesajınızı yazın..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={sendingMessage}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button
                    className="self-end"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                  >
                    {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
