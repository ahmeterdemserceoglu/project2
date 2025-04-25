"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, X, Send, Loader2, MinusCircle, Bell, BellOff } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  limit,
  getDocs,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

type Message = {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  isAdmin: boolean
  timestamp: Date
  read: boolean
}

type SupportSession = {
  id: string
  userId: string
  userName: string
  userEmail: string
  status: "active" | "closed"
  lastActivity: Date
  unreadCount: number
}

export function LiveSupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [supportSessionId, setSupportSessionId] = useState<string | null>(null)
  const [activeSessions, setActiveSessions] = useState<SupportSession[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState(true)
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()

  // Check if user is admin
  useEffect(() => {
    if (user) {
      const checkAdminStatus = async () => {
        try {
          const userRef = doc(db, "users", user.uid)
          const userSnap = await getDoc(userRef)

          if (userSnap.exists()) {
            const userData = userSnap.data()
            setIsAdmin(userData.role === "admin")
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
          setIsAdmin(false)
        }
      }

      checkAdminStatus()
    } else {
      setIsAdmin(false)
    }
  }, [user])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Create or load support session
  useEffect(() => {
    if (!user || !isOpen) return

    const createOrLoadSession = async () => {
      try {
        // First check for any active sessions
        const activeSessionsQuery = query(
          collection(db, "supportSessions"),
          where("userId", "==", user.uid),
          where("status", "==", "active"),
        )

        const activeSnapshot = await getDocs(activeSessionsQuery)

        if (!activeSnapshot.empty) {
          // Use existing active session
          const sessionDoc = activeSnapshot.docs[0]
          setSupportSessionId(sessionDoc.id)

          // If user is opening the chat, mark messages as read
          if (!isAdmin) {
            await updateDoc(doc(db, "supportSessions", sessionDoc.id), {
              unreadCount: 0,
              lastActivity: serverTimestamp(),
            })
          }
          return
        }

        // If no active session, check for closed sessions
        const closedSessionsQuery = query(
          collection(db, "supportSessions"),
          where("userId", "==", user.uid),
          where("status", "==", "closed"),
          orderBy("lastActivity", "desc"),
          limit(1),
        )

        const closedSnapshot = await getDocs(closedSessionsQuery)

        if (!closedSnapshot.empty && !isAdmin) {
          // Reopen the most recent closed session
          const sessionDoc = closedSnapshot.docs[0]
          const sessionId = sessionDoc.id

          await updateDoc(doc(db, "supportSessions", sessionId), {
            status: "active",
            lastActivity: serverTimestamp(),
            unreadCount: 0,
          })

          // Add system message about reopening
          await addDoc(collection(db, "supportMessages"), {
            sessionId: sessionId,
            content: "Destek oturumu yeniden açıldı.",
            senderId: "system",
            senderName: "Sistem",
            isAdmin: true,
            timestamp: serverTimestamp(),
            read: true,
          })

          setSupportSessionId(sessionId)
          return
        }

        // Create new session if no existing sessions found and user is not admin
        if (!isAdmin) {
          const newSession = await addDoc(collection(db, "supportSessions"), {
            userId: user.uid,
            userName: user.displayName || "Misafir Kullanıcı",
            userEmail: user.email,
            status: "active",
            createdAt: serverTimestamp(),
            lastActivity: serverTimestamp(),
            unreadCount: 0,
          })

          // Add welcome message
          await addDoc(collection(db, "supportMessages"), {
            sessionId: newSession.id,
            content: "Merhaba! Size nasıl yardımcı olabiliriz?",
            senderId: "system",
            senderName: "Sistem",
            isAdmin: true,
            timestamp: serverTimestamp(),
            read: true,
          })

          setSupportSessionId(newSession.id)
        }
      } catch (error) {
        console.error("Error creating/loading support session:", error)
      }
    }

    createOrLoadSession()
  }, [user, isOpen, isAdmin])

  // Load messages for the current session
  useEffect(() => {
    if (!supportSessionId) return

    const messagesQuery = query(
      collection(db, "supportMessages"),
      where("sessionId", "==", supportSessionId),
      orderBy("timestamp", "asc"),
      limit(100), // Limit to last 100 messages for performance
    )

    const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      const newMessages: Message[] = []
      let hasUnread = false

      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data()
        const message = {
          id: docSnapshot.id,
          content: data.content,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          isAdmin: data.isAdmin,
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
        }

        newMessages.push(message)

        // Mark messages as read if the user is viewing them
        if (isOpen && !message.read && ((isAdmin && !message.isAdmin) || (!isAdmin && message.isAdmin))) {
          try {
            updateDoc(doc(db, "supportMessages", docSnapshot.id), { read: true })
          } catch (error) {
            console.error("Error updating message read status:", error)
          }
        }

        // Check for unread messages
        if (!message.read && ((isAdmin && !message.isAdmin) || (!isAdmin && message.isAdmin))) {
          hasUnread = true
        }
      })

      setMessages(newMessages)

      // Update session unread count
      if (hasUnread && supportSessionId) {
        const sessionRef = doc(db, "supportSessions", supportSessionId)
        const sessionSnap = await getDoc(sessionRef)

        if (sessionSnap.exists()) {
          const unreadCount = newMessages.filter(
            (m) => !m.read && ((isAdmin && !m.isAdmin) || (!isAdmin && m.isAdmin)),
          ).length

          if (isOpen) {
            // If chat is open, mark as read
            await updateDoc(sessionRef, { unreadCount: 0 })
          } else {
            // Otherwise update the unread count
            await updateDoc(sessionRef, { unreadCount })

            // Show notification for new messages if enabled
            if (notifications && !isAdmin && unreadCount > 0) {
              const lastUnreadMessage = newMessages
                .filter((m) => m.isAdmin && !m.read)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]

              if (lastUnreadMessage) {
                toast({
                  title: "Yeni destek mesajı",
                  description:
                    lastUnreadMessage.content.length > 50
                      ? lastUnreadMessage.content.substring(0, 50) + "..."
                      : lastUnreadMessage.content,
                  action: (
                    <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                      Görüntüle
                    </Button>
                  ),
                })
              }
            }
          }
        }
      }
    })

    return unsubscribe
  }, [supportSessionId, isOpen, isAdmin, notifications, toast])

  // Load all active sessions for admins
  useEffect(() => {
    if (!isAdmin) return

    const sessionsQuery = query(
      collection(db, "supportSessions"),
      where("status", "==", "active"),
      orderBy("lastActivity", "desc"),
    )

    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const sessions: SupportSession[] = []
      let totalUnread = 0

      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data()
        const session = {
          id: docSnapshot.id,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          status: data.status,
          lastActivity: data.lastActivity?.toDate() || new Date(),
          unreadCount: data.unreadCount || 0,
        }

        sessions.push(session)
        totalUnread += session.unreadCount
      })

      setActiveSessions(sessions)
      setUnreadCount(totalUnread)

      // If admin doesn't have a session selected, select the most recent one
      if (isAdmin && isOpen && !supportSessionId && sessions.length > 0) {
        setSupportSessionId(sessions[0].id)
      }
    })

    return unsubscribe
  }, [isAdmin, isOpen, supportSessionId])

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !supportSessionId) return

    setIsLoading(true)
    try {
      await addDoc(collection(db, "supportMessages"), {
        sessionId: supportSessionId,
        content: message,
        senderId: user.uid,
        senderName: user.displayName || "Misafir Kullanıcı",
        senderAvatar: user.photoURL,
        isAdmin: isAdmin,
        timestamp: serverTimestamp(),
        read: false,
      })

      // Update last activity timestamp and unread count
      const sessionRef = doc(db, "supportSessions", supportSessionId)
      const sessionSnap = await getDoc(sessionRef)

      if (sessionSnap.exists()) {
        const sessionData = sessionSnap.data()
        const currentUnreadCount = sessionData.unreadCount || 0

        await updateDoc(sessionRef, {
          lastActivity: serverTimestamp(),
          unreadCount: isAdmin ? currentUnreadCount : currentUnreadCount + 1,
        })
      }

      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectSession = (sessionId: string) => {
    setSupportSessionId(sessionId)

    // Mark messages as read when admin selects a session
    if (isAdmin) {
      const sessionRef = doc(db, "supportSessions", sessionId)
      updateDoc(sessionRef, { unreadCount: 0 })
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)

    // Mark messages as read when opening chat
    if (!isOpen && supportSessionId) {
      const sessionRef = doc(db, "supportSessions", supportSessionId)
      updateDoc(sessionRef, { unreadCount: 0 })

      // Also mark individual messages as read
      messages.forEach((message) => {
        if (!message.read && ((isAdmin && !message.isAdmin) || (!isAdmin && message.isAdmin))) {
          try {
            const messageRef = doc(db, "supportMessages", message.id)
            updateDoc(messageRef, { read: true })
          } catch (error) {
            console.error("Error updating message read status:", error)
          }
        }
      })
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const toggleNotifications = () => {
    setNotifications(!notifications)
  }

  // Don't render the component for admin users
  if (!user || isAdmin) return null

  return (
    <>
      {/* Chat button */}
      <Button onClick={toggleChat} className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg" size="icon">
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-5 w-5" />
            {messages.some((m) => !m.read && m.isAdmin) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {messages.filter((m) => !m.read && m.isAdmin).length}
              </span>
            )}
          </div>
        )}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card
          className={`fixed bottom-20 right-4 w-80 md:w-96 shadow-xl transition-all duration-300 ${
            isMinimized ? "h-14" : "h-[500px]"
          }`}
        >
          <CardHeader className="p-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Canlı Destek</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleNotifications}
                className="h-8 w-8"
                title={notifications ? "Bildirimleri kapat" : "Bildirimleri aç"}
              >
                {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8">
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              <CardContent className="p-3 overflow-y-auto h-[380px] flex flex-col gap-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Merhaba! Size nasıl yardımcı olabiliriz? Lütfen sorunuzu yazın ve bir yönetici en kısa sürede size
                    yardımcı olacaktır.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user?.uid ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${msg.senderId === user?.uid ? "flex-row-reverse" : ""}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.senderAvatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {msg.senderId === "system" ? "S" : msg.isAdmin ? "A" : msg.senderName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg px-3 py-2 text-sm ${
                            msg.senderId === "system"
                              ? "bg-muted/50 text-muted-foreground"
                              : msg.senderId === user?.uid
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                          }`}
                        >
                          <div className="font-medium text-xs mb-1">
                            {msg.senderId === "system" ? "Sistem" : msg.isAdmin ? "Destek Ekibi" : msg.senderName}
                          </div>
                          {msg.content}
                          <div className="text-xs opacity-70 mt-1 text-right flex items-center justify-end gap-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {msg.senderId === user?.uid && (
                              <span
                                className={`w-2 h-2 rounded-full ${msg.read ? "bg-green-500" : "bg-gray-300"}`}
                              ></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <CardFooter className="p-3 border-t">
                <div className="flex w-full gap-2">
                  <Textarea
                    placeholder="Mesajınızı yazın..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[40px] max-h-[120px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !message.trim()}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </>
  )
}

export default LiveSupport
