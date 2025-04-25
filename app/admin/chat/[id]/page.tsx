"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Send, User, Package, AlertCircle, MessageSquare, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { createNotification } from "@/lib/notifications"
import type { Request, Message } from "@/lib/types"

export default function AdminChatPage() {
  const { id } = useParams() as { id: string }
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [request, setRequest] = useState<Request | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)

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

          // Check if conversation exists or create one
          let conversationId = requestData.conversationId

          if (!conversationId) {
            // Create a new conversation
            const conversationData = {
              itemId: requestData.itemId,
              itemTitle: requestData.itemTitle,
              participants: [requestData.ownerId, requestData.requesterId, user?.uid],
              lastMessage: "Yönetici tarafından başlatılan konuşma",
              lastMessageTimestamp: serverTimestamp(),
              lastMessageSenderId: user?.uid,
              requestId: id,
            }

            const conversationRef = await addDoc(collection(db, "conversations"), conversationData)
            conversationId = conversationRef.id

            // Update request with conversation ID
            await updateDoc(doc(db, "requests", id), {
              conversationId,
            })

            // Add first system message
            await addDoc(collection(db, "conversations", conversationId, "messages"), {
              senderId: "system",
              senderName: "Sistem",
              text: "Bu konuşma bir yönetici tarafından başlatılmıştır.",
              timestamp: serverTimestamp(),
            })
          }

          // Subscribe to messages
          const messagesQuery = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("timestamp", "asc"),
          )

          const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const messagesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Message[]

            setMessages(messagesData)
            setLoading(false)

            // Scroll to bottom when new messages arrive
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            }, 100)
          })

          return () => unsubscribe()
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
        setLoading(false)
      }
    }

    fetchRequestDetails()
  }, [id, isAdmin, router, toast, user])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !request?.conversationId || !user) return

    setSendingMessage(true)

    try {
      // Add message to conversation
      await addDoc(collection(db, "conversations", request.conversationId, "messages"), {
        senderId: user.uid,
        senderName: `${user.displayName} (Yönetici)`,
        text: newMessage,
        timestamp: serverTimestamp(),
      })

      // Update conversation last message
      await updateDoc(doc(db, "conversations", request.conversationId), {
        lastMessage: newMessage,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: user.uid,
      })

      // Send notifications to participants
      const participants = [request.ownerId, request.requesterId].filter((id) => id !== user.uid)

      for (const participantId of participants) {
        await createNotification({
          userId: participantId,
          title: "Yeni Mesaj",
          message: `Yönetici "${request.itemTitle}" ile ilgili bir mesaj gönderdi.`,
          type: "message",
          link: `/messages/${request.conversationId}`,
        })
      }

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Mesaj gönderilirken bir hata oluştu.",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return format(date, "HH:mm - d MMM", { locale: tr })
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-8 mr-2" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
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
          <div className="space-y-6">
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
      <Button variant="outline" className="mb-6" onClick={() => router.push(`/admin/requests/${id}`)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        İstek Detaylarına Dön
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mesajlar</CardTitle>
              <CardDescription>"{request.itemTitle}" ile ilgili konuşma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto p-2">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz mesaj bulunmuyor. İlk mesajı gönderin.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.senderId === user?.uid ? "justify-end" : "justify-start"}`}
                    >
                      {message.senderId !== user?.uid && (
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {message.senderId === "system" ? "S" : message.senderName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`space-y-1 max-w-[70%] ${
                          message.senderId === user?.uid ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {message.senderId === "system" ? "Sistem" : message.senderName}
                          </p>
                          <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            message.senderId === "system"
                              ? "bg-muted text-muted-foreground"
                              : message.senderId === user?.uid
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>
                      </div>
                      {message.senderId === user?.uid && (
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{user?.displayName?.charAt(0) || "A"}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="mt-4 flex gap-2">
                <Textarea
                  placeholder="Mesajınızı yazın..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sendingMessage}>
                  {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>İstek Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Ürün:</p>
                  <p className="text-sm">{request.itemTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">İsteyen:</p>
                  <p className="text-sm">{request.requesterName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Eşya Sahibi:</p>
                  <p className="text-sm">{request.ownerName || "Bilinmiyor"}</p>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => router.push(`/admin/requests/${id}`)}>
                İstek Detaylarına Git
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
