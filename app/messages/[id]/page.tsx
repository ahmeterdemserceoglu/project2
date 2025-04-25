"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  collection,
  doc,
  getDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Package,
  RotateCcw,
  AlertCircle,
  MoreVertical,
  Trash2,
  Loader2,
  MessageSquare,
  Activity,
  Clock,
  Star,
  Info,
  Calendar,
  MapPin,
  User,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { createNotification } from "@/lib/notifications"
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
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { logger } from "@/lib/logger"
import type { Conversation, Message, Request, Item } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import MessageItem from "@/components/message-item"
import RatingDialog from "@/components/rating-dialog"
import UserStatusBadge from "@/components/user-status-badge"
import MessageInput from "@/components/message-input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ConversationPage() {
  const { id } = useParams() as { id: string }
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [requestLoading, setRequestLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [isUserInConversation, setIsUserInConversation] = useState(false)
  const [otherUserId, setOtherUserId] = useState<string | null>(null)
  const [otherUserName, setOtherUserName] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const [request, setRequest] = useState<Request | null>(null)
  const [item, setItem] = useState<Item | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isRequester, setIsRequester] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRequestDetailsDialog, setShowRequestDetailsDialog] = useState(false)
  const [dialogAction, setDialogAction] = useState<
    | "approve"
    | "reject"
    | "confirm_delivery"
    | "confirm_return"
    | "initiate_return"
    | "owner_confirm_delivery"
    | "requester_confirm_return"
    | "delete_conversation"
    | null
  >(null)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [ratingType, setRatingType] = useState<"borrower" | "lender">("borrower")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !redirecting) {
      setRedirecting(true)
      router.push("/auth/login?returnUrl=" + encodeURIComponent(`/messages/${id}`))
    }
  }, [user, router, redirecting, id])

  useEffect(() => {
    const fetchConversation = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // First check if this is a request ID
        const requestRef = doc(db, "requests", id)
        const requestSnap = await getDoc(requestRef)

        if (requestSnap.exists()) {
          // This is a request ID
          const requestData = {
            id: requestSnap.id,
            ...requestSnap.data(),
          } as Request

          // Check if user is a participant in this request
          const userIsParticipant = requestData.ownerId === user.uid || requestData.requesterId === user.uid

          if (!userIsParticipant) {
            setError("Bu konuşmaya erişim izniniz yok")
            setLoading(false)
            logger.warn("Unauthorized access attempt to conversation", {
              userId: user.uid,
              conversationId: id,
            })
            return
          }

          // If request has a conversationId, redirect to that conversation
          if (requestData.conversationId && requestData.conversationId !== id) {
            router.replace(`/messages/${requestData.conversationId}`)
            return
          }

          // Otherwise, try to find or create a conversation for this request
          let conversationId = id
          let conversationData: Conversation | null = null

          // Check if a conversation exists for this request
          const conversationsQuery = query(collection(db, "conversations"), where("requestId", "==", id))

          const conversationsSnapshot = await getDocs(conversationsQuery)

          if (!conversationsSnapshot.empty) {
            // Use the existing conversation
            const conversationDoc = conversationsSnapshot.docs[0]
            conversationId = conversationDoc.id
            conversationData = {
              id: conversationDoc.id,
              ...conversationDoc.data(),
            } as Conversation

            // Update the request with the conversationId if needed
            if (!requestData.conversationId) {
              await updateDoc(requestRef, {
                conversationId: conversationId,
              })
            }

            // If this is not the current URL, redirect
            if (conversationId !== id) {
              router.replace(`/messages/${conversationId}`)
              return
            }
          } else {
            // No conversation found, create one
            const newConversation = {
              participants: [requestData.ownerId, requestData.requesterId],
              requestId: id,
              itemId: requestData.itemId,
              itemTitle: requestData.itemTitle,
              createdAt: serverTimestamp(),
              lastMessage: "Konuşma başlatıldı",
              lastMessageTimestamp: serverTimestamp(),
              lastMessageSenderId: "system",
            }

            const conversationRef = await addDoc(collection(db, "conversations"), newConversation)
            conversationId = conversationRef.id
            conversationData = {
              id: conversationRef.id,
              ...newConversation,
            } as Conversation

            // Update the request with the conversationId
            await updateDoc(requestRef, {
              conversationId: conversationId,
            })

            // Add initial system message
            await addDoc(collection(db, "conversations", conversationId, "messages"), {
              senderId: "system",
              senderName: "Sistem",
              text: `"${requestData.itemTitle}" için istek oluşturuldu.`,
              timestamp: serverTimestamp(),
            })

            // If this is not the current URL, redirect
            if (conversationId !== id) {
              router.replace(`/messages/${conversationId}`)
              return
            }
          }

          // Set conversation data
          setConversation(conversationData)
          setRequest(requestData)
          setIsOwner(requestData.ownerId === user.uid)
          setIsRequester(requestData.requesterId === user.uid)
          setIsUserInConversation(true)

          // Set other user info
          const otherUserID = user.uid === requestData.ownerId ? requestData.requesterId : requestData.ownerId
          setOtherUserId(otherUserID)
          // Diğer kullanıcı adını doğru şekilde ayarlayalım
          setOtherUserName(user.uid === requestData.ownerId ? requestData.requesterName : requestData.ownerName || "")

          // Fetch item details
          if (requestData.itemId) {
            try {
              const itemRef = doc(db, "items", requestData.itemId)
              const itemSnap = await getDoc(itemRef)

              if (itemSnap.exists()) {
                setItem({
                  id: itemSnap.id,
                  ...itemSnap.data(),
                } as Item)
              }
            } catch (itemErr) {
              console.error("Error fetching item:", itemErr)
            }
          }
        } else {
          // This is a conversation ID
          const docRef = doc(db, "conversations", id)
          const docSnap = await getDoc(docRef)

          if (!docSnap.exists()) {
            setError("Konuşma bulunamadı")
            setLoading(false)
            return
          }

          const conversationData = {
            id: docSnap.id,
            ...docSnap.data(),
          } as Conversation

          // Check if user is a participant
          const userIsParticipant = conversationData.participants.includes(user.uid)
          setIsUserInConversation(userIsParticipant)

          if (!userIsParticipant) {
            setError("Bu konuşmaya erişim izniniz yok")
            setLoading(false)
            logger.warn("Unauthorized access attempt to conversation", {
              userId: user.uid,
              conversationId: id,
            })
            return
          }

          // Find the other user ID
          const otherUserIdValue = conversationData.participants.find((participantId) => participantId !== user.uid)
          setOtherUserId(otherUserIdValue || null)

          setConversation(conversationData)

          // Fetch associated request
          if (conversationData.requestId) {
            try {
              setRequestLoading(true)
              setRequestError(null)

              const requestDoc = await getDoc(doc(db, "requests", conversationData.requestId))

              if (requestDoc.exists()) {
                const requestData = {
                  id: requestDoc.id,
                  ...requestDoc.data(),
                } as Request

                setRequest(requestData)

                // Determine if user is owner or requester
                setIsOwner(requestData.ownerId === user.uid)
                setIsRequester(requestData.requesterId === user.uid)

                // Set other user name
                setOtherUserName(
                  user.uid === requestData.ownerId ? requestData.requesterName : requestData.ownerName || "",
                )

                // Fetch item details
                if (requestData.itemId) {
                  try {
                    const itemRef = doc(db, "items", requestData.itemId)
                    const itemSnap = await getDoc(itemRef)

                    if (itemSnap.exists()) {
                      setItem({
                        id: itemSnap.id,
                        ...itemSnap.data(),
                      } as Item)
                    }
                  } catch (itemErr) {
                    console.error("Error fetching item:", itemErr)
                  }
                }
              } else {
                // If the request doesn't exist directly, try to find it by querying for requests with this conversation ID
                const requestsQuery = query(
                  collection(db, "requests"),
                  where("conversationId", "==", conversationData.id),
                )

                const requestsSnapshot = await getDocs(requestsQuery)

                if (!requestsSnapshot.empty) {
                  // Use the first matching request
                  const requestDoc = requestsSnapshot.docs[0]
                  const requestData = {
                    id: requestDoc.id,
                    ...requestDoc.data(),
                  } as Request

                  setRequest(requestData)

                  // Update the conversation with the correct requestId
                  await updateDoc(doc(db, "conversations", conversationData.id), {
                    requestId: requestData.id,
                  })

                  // Determine if user is owner or requester
                  setIsOwner(requestData.ownerId === user.uid)
                  setIsRequester(requestData.requesterId === user.uid)

                  // Set other user name
                  setOtherUserName(
                    user.uid === requestData.ownerId ? requestData.requesterName : requestData.ownerName || "",
                  )

                  // Fetch item details
                  if (requestData.itemId) {
                    try {
                      const itemRef = doc(db, "items", requestData.itemId)
                      const itemSnap = await getDoc(itemRef)

                      if (itemSnap.exists()) {
                        setItem({
                          id: itemSnap.id,
                          ...itemSnap.data(),
                        } as Item)
                      }
                    } catch (itemErr) {
                      console.error("Error fetching item:", itemErr)
                    }
                  }
                } else {
                  setRequestError("İstek bilgisi bulunamadı")
                }
              }
            } catch (requestErr) {
              console.error("Error fetching request:", requestErr)
              setRequestError("İstek bilgisi yüklenirken bir hata oluştu")
            } finally {
              setRequestLoading(false)
            }
          } else {
            // If there's no requestId, try to find a request with this conversation ID
            try {
              setRequestLoading(true)
              setRequestError(null)

              const requestsQuery = query(
                collection(db, "requests"),
                where("conversationId", "==", conversationData.id),
              )

              const requestsSnapshot = await getDocs(requestsQuery)

              if (!requestsSnapshot.empty) {
                // Use the first matching request
                const requestDoc = requestsSnapshot.docs[0]
                const requestData = {
                  id: requestDoc.id,
                  ...requestDoc.data(),
                } as Request

                setRequest(requestData)

                // Update the conversation with the correct requestId
                await updateDoc(doc(db, "conversations", conversationData.id), {
                  requestId: requestData.id,
                })

                // Determine if user is owner or requester
                setIsOwner(requestData.ownerId === user.uid)
                setIsRequester(requestData.requesterId === user.uid)

                // Set other user name
                setOtherUserName(
                  user.uid === requestData.ownerId ? requestData.requesterName : requestData.ownerName || "",
                )

                // Fetch item details
                if (requestData.itemId) {
                  try {
                    const itemRef = doc(db, "items", requestData.itemId)
                    const itemSnap = await getDoc(itemRef)

                    if (itemSnap.exists()) {
                      setItem({
                        id: itemSnap.id,
                        ...itemSnap.data(),
                      } as Item)
                    }
                  } catch (itemErr) {
                    console.error("Error fetching item:", itemErr)
                  }
                }
              } else {
                setRequestError("Bu konuşma için istek bilgisi bulunamadı")
              }
            } catch (requestErr) {
              console.error("Error fetching request:", requestErr)
              setRequestError("İstek bilgisi yüklenirken bir hata oluştu")
            } finally {
              setRequestLoading(false)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching conversation:", error)
        setError("Konuşma yüklenirken bir hata oluştu")
        logger.error("Error fetching conversation", { error, conversationId: id })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchConversation()
    } else {
      setLoading(false)
    }
  }, [id, user, router])

  // Diğer kullanıcının bilgilerini almak için
  useEffect(() => {
    const fetchOtherUserDetails = async () => {
      if (!otherUserId || !conversation) return

      try {
        const userDoc = await getDoc(doc(db, "users", otherUserId))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setOtherUserName(userData.displayName || "İsimsiz Kullanıcı")
        }
      } catch (error) {
        console.error("Error fetching other user details:", error)
      }
    }

    if (otherUserId && !otherUserName) {
      fetchOtherUserDetails()
    }
  }, [otherUserId, conversation, otherUserName])

  useEffect(() => {
    if (!conversation || !user || !isUserInConversation) return

    try {
      // Subscribe to messages
      const q = query(collection(db, "conversations", conversation.id, "messages"), orderBy("timestamp", "asc"))

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messagesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[]

          setMessages(messagesData)
        },
        (err) => {
          console.error("Error listening to messages:", err)
          setError("Mesajlar yüklenirken bir hata oluştu")
        },
      )

      return () => unsubscribe()
    } catch (err) {
      console.error("Error setting up messages listener:", err)
      setError("Mesajlar yüklenirken bir hata oluştu")
    }
  }, [conversation, user, isUserInConversation])

  // Subscribe to request changes
  useEffect(() => {
    if (!request?.id || !user) return

    try {
      const unsubscribe = onSnapshot(
        doc(db, "requests", request.id),
        (doc) => {
          if (doc.exists()) {
            setRequest({
              id: doc.id,
              ...doc.data(),
            } as Request)
          }
        },
        (err) => {
          console.error("Error listening to request changes:", err)
        },
      )

      return () => unsubscribe()
    } catch (err) {
      console.error("Error setting up request listener:", err)
    }
  }, [request?.id, user])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !conversation || !otherUserId || !user) return

    try {
      // Add message to conversation
      await addDoc(collection(db, "conversations", conversation.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName,
        text: newMessage,
        timestamp: serverTimestamp(),
      })

      // Update conversation with last message
      const conversationRef = doc(db, "conversations", conversation.id)
      await updateDoc(conversationRef, {
        lastMessage: newMessage,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: user.uid,
      })

      // Create notification for the other user
      await createNotification({
        userId: otherUserId,
        title: "Yeni Mesaj",
        message: `${user.displayName}: ${newMessage}`,
        type: "message",
        link: `/messages/${conversation.id}`,
      })

      setNewMessage("")

      // Focus the input field after sending
      inputRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Mesaj gönderilirken bir hata oluştu.",
      })
    }
  }

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native)
    inputRef.current?.focus()
  }

  const handleFileUpload = async (fileUrl: string, fileName: string, fileType: string) => {
    if (!conversation || !otherUserId || !user) return

    try {
      // Add file message to conversation
      await addDoc(collection(db, "conversations", conversation.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName,
        text: "",
        fileUrl: fileUrl,
        fileName: fileName,
        fileType: fileType,
        timestamp: serverTimestamp(),
      })

      // Update conversation with last message
      const conversationRef = doc(db, "conversations", conversation.id)
      await updateDoc(conversationRef, {
        lastMessage: `Dosya: ${fileName}`,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: user.uid,
      })

      // Create notification for the other user
      await createNotification({
        userId: otherUserId,
        title: "Yeni Dosya",
        message: `${user.displayName} bir dosya gönderdi: ${fileName}`,
        type: "message",
        link: `/messages/${conversation.id}`,
      })

      toast({
        title: "Dosya gönderildi",
        description: "Dosya başarıyla gönderildi.",
      })
    } catch (error) {
      console.error("Error sending file:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Dosya gönderilirken bir hata oluştu.",
      })
    }
  }

  const handleImageUpload = async (imageUrl: string, fileName: string) => {
    if (!conversation || !otherUserId || !user) return

    try {
      // Add image message to conversation
      await addDoc(collection(db, "conversations", conversation.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName,
        text: "",
        imageUrl: imageUrl,
        fileName: fileName,
        timestamp: serverTimestamp(),
      })

      // Update conversation with last message
      const conversationRef = doc(db, "conversations", conversation.id)
      await updateDoc(conversationRef, {
        lastMessage: `Resim gönderildi`,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: user.uid,
      })

      // Create notification for the other user
      await createNotification({
        userId: otherUserId,
        title: "Yeni Resim",
        message: `${user.displayName} bir resim gönderdi`,
        type: "message",
        link: `/messages/${conversation.id}`,
      })

      toast({
        title: "Resim gönderildi",
        description: "Resim başarıyla gönderildi.",
      })
    } catch (error) {
      console.error("Error sending image:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Resim gönderilirken bir hata oluştu.",
      })
    }
  }

  // İstek onaylama işlemi
  const handleApproveRequest = async () => {
    if (!request || !conversation || !user) return

    setDialogAction("approve")
    setShowConfirmDialog(true)
  }

  const confirmApproveRequest = async () => {
    if (!request || !conversation || !user) return

    try {
      setIsProcessing(true)

      // İstek durumunu güncelle
      const requestRef = doc(db, "requests", request.id)
      await updateDoc(requestRef, {
        status: "accepted",
        ownerConfirmed: true,
      })

      // Eşya durumunu güncelle
      if (item) {
        const itemRef = doc(db, "items", item.id)
        await updateDoc(itemRef, {
          status: "borrowed",
        })
      }

      // İstek sahibine bildirim gönder
      await createNotification({
        userId: request.requesterId,
        title: "İsteğiniz Onaylandı",
        message: `"${conversation.itemTitle}" için isteğiniz onaylandı. Lütfen teslimatı onaylayın.`,
        type: "request",
        link: `/messages/${conversation.id}`,
      })

      // Sistem mesajı ekle
      await addDoc(collection(db, "conversations", conversation.id, "messages"), {
        senderId: "system",
        senderName: "Sistem",
        text: `İstek onaylandı. Eşya sahibi "${conversation.itemTitle}" eşyasını ödünç vermeyi kabul etti.`,
        timestamp: serverTimestamp(),
      })

      // Konuşmayı güncelle
      await updateDoc(doc(db, "conversations", conversation.id), {
        lastMessage: `İstek onaylandı. Eşya sahibi "${conversation.itemTitle}" eşyasını ödünç vermeyi kabul etti.`,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: "system",
      })

      toast({
        title: "İstek onaylandı",
        description: "İstek başarıyla onaylandı.",
      })
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İstek onaylanırken bir hata oluştu.",
      })
    } finally {
      setIsProcessing(false)
      setShowConfirmDialog(false)
    }
  }

  // İstek reddetme işlemi
  const handleRejectRequest = async () => {
    if (!request || !conversation || !user) return

    setDialogAction("reject")
    setShowConfirmDialog(true)
  }

  const confirmRejectRequest = async () => {
    if (!request || !conversation || !user) return

    try {
      setIsProcessing(true)

      // İstek durumunu güncelle
      const requestRef = doc(db, "requests", request.id)
      await updateDoc(requestRef, {
        status: "rejected",
      })

      // İstek sahibine bildirim gönder
      await createNotification({
        userId: request.requesterId,
        title: "İsteğiniz Reddedildi",
        message: `"${conversation.itemTitle}" için isteğiniz reddedildi.`,
        type: "request",
        link: `/messages/${conversation.id}`,
      })

      // Sistem mesajı ekle
      await addDoc(collection(db, "conversations", conversation.id, "messages"), {
        senderId: "system",
        senderName: "Sistem",
        text: `İstek reddedildi. Eşya sahibi "${conversation.itemTitle}" eşyasını ödünç vermeyi kabul etmedi.`,
        timestamp: serverTimestamp(),
      })

      // Konuşmayı güncelle
      await updateDoc(doc(db, "conversations", conversation.id), {
        lastMessage: `İstek reddedildi. Eşya sahibi "${conversation.itemTitle}" eşyasını ödünç vermeyi kabul etmedi.`,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: "system",
      })

      toast({
        title: "İstek reddedildi",
        description: "İstek başarıyla reddedildi.",
      })
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İstek reddedilirken bir hata oluştu.",
      })
    } finally {
      setIsProcessing(false)
      setShowConfirmDialog(false)
    }
  }

  // İstek sahibi teslimatı onaylama işlemi
  const handleConfirmDelivery = async () => {
    if (!request || !conversation || !user) return

    setDialogAction("confirm_delivery")
    setShowConfirmDialog(true)
  }

  const confirmDelivery = async () => {
    if (!request || !conversation || !user) return

    try {
      setIsProcessing(true)

      // İstek durumunu güncelle
      const requestRef = doc(db, "requests", request.id)
      await updateDoc(requestRef, {
        requesterConfirmed: true,
        deliveryStatus: "requester_confirmed",
      })

      // Eşya sahibine bildirim gönder
      await createNotification({
        userId: request.ownerId,
        title: "Teslimat Onayı Bekleniyor",
        message: `"${conversation.itemTitle}" eşyasının teslimatı için onayınız bekleniyor.`,
        type: "request",
        link: `/messages/${conversation.id}`,
      })

      // Sistem mesajı ekle
      await addDoc(collection(db, "conversations", conversation.id, "messages"), {
        senderId: "system",
        senderName: "Sistem",
        text: `İsteyen kişi teslimatı onayladı. Eşya sahibinin onayı bekleniyor.`,
        timestamp: serverTimestamp(),
      })

      // Konuşmayı güncelle
      await updateDoc(doc(db, "conversations", conversation.id), {
        lastMessage: `İsteyen kişi teslimatı onayladı. Eşya sahibinin onayı bekleniyor.`,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: "system",
      })

      toast({
        title: "Teslimat onaylandı",
        description: "Teslimatı başarıyla onayladınız. Eşya sahibininin onayı bekleniyor.",
      })
    } catch (error) {
      console.error("Error confirming delivery:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Teslimat onaylanırken bir hata oluştu.",
      })
    } finally {
      setIsProcessing(false)
      setShowConfirmDialog(false)
    }
  }

  // Eşya sahibi teslimatı onaylama işlemi
  const handleOwnerConfirmDelivery = async () => {
    if (!request || !conversation || !user) return

    setDialogAction("owner_confirm_delivery")
    setShowConfirmDialog(true)
  }

  const confirmOwnerDelivery = async () => {
    if (!request || !conversation || !user) return

    try {
      setIsProcessing(true)

      // İstek durumunu güncelle
      const requestRef = doc(db, "requests", request.id)
      await updateDoc(requestRef, {
        ownerDeliveryConfirmed: true,
        deliveryStatus: "completed",
      })

      if (item?.unlimitedDuration) {
        // For unlimited duration items, delete the item when delivery is confirmed
        if (item) {
          const itemRef = doc(db, "items", item.id)
          await deleteDoc(itemRef)

          // Add system message about permanent transfer
          await addDoc(collection(db, "conversations", conversation.id, "messages"), {
            senderId: "system",
            senderName: "Sistem",
            text: `Sınırsız süreli eşya "${conversation.itemTitle}" kalıcı olarak transfer edildi.`,
            timestamp: serverTimestamp(),
          })

          // Update conversation
          await updateDoc(doc(db, "conversations", conversation.id), {
            lastMessage: `Sınırsız süreli eşya "${conversation.itemTitle}" kalıcı olarak transfer edildi.`,
            lastMessageTimestamp: serverTimestamp(),
            lastMessageSenderId: "system",
          })

          toast({
            title: "Transfer tamamlandı",
            description: "Sınırsız süreli eşya kalıcı olarak transfer edildi.",
          })
        }
      } else {
        // For regular items, just update the delivery status
        // This is the existing code for regular items
        await createNotification({
          userId: request.requesterId,
          title: "Teslimat Tamamlandı",
          message: `"${conversation.itemTitle}" eşyasının teslimatı tamamlandı.`,
          type: "request",
          link: `/messages/${conversation.id}`,
        })

        // Sistem mesajı ekle
        await addDoc(collection(db, "conversations", conversation.id, "messages"), {
          senderId: "system",
          senderName: "Sistem",
          text: `Teslimat tamamlandı. "${conversation.itemTitle}" eşyası başarıyla teslim edildi.`,
          timestamp: serverTimestamp(),
        })

        // Konuşmayı güncelle
        await updateDoc(doc(db, "conversations", conversation.id), {
          lastMessage: `Teslimat tamamlandı. "${conversation.itemTitle}" eşyası başarıyla teslim edildi.`,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: "system",
        })

        toast({
          title: "Teslimat tamamlandı",
          description: "Teslimat başarıyla tamamlandı.",
        })
      }
    } catch (error) {
      console.error("Error confirming owner delivery:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Teslimat onaylanırken bir hata oluştu.",
      })
    } finally {
      setIsProcessing(false)
      setShowConfirmDialog(false)
    }
  }

  // İade işlemi başlatma
  const handleInitiateReturn = async () => {
    if (!request || !conversation || !user) return

    // Sınırsız süreli ürünler için iade işlemi başlatılmaz
    if (item?.unlimitedDuration) {
      toast({
        title: "İade işlemi başlatılamaz",
        description: "Bu eşya sınırsız süreli olarak paylaşılmıştır. İade işlemi başlatılamaz.",
      })
      return
    }

    setDialogAction("initiate_return")
    setShowReturnDialog(true)
  }

  const confirmInitiateReturn = async () => {
    if (!request || !conversation || !user) return

    try {
      setIsProcessing(true)

      // İstek durumunu güncelle
      const requestRef = doc(db, "requests", request.id)
      await updateDoc(requestRef, {
        status: "returning",
        requesterReturnConfirmed: true,
        returnStatus: "requester_confirmed",
      })

      // Eşya sahibine bildirim gönder
      await createNotification({
        userId: request.ownerId,
        title: "İade Talebi",
        message: `"${conversation.itemTitle}" eşyası için iade talebi oluşturuldu.`,
        type: "return",
        link: `/messages/${conversation.id}`,
      })

      // Sistem mesajı ekle
      await addDoc(collection(db, "conversations", conversation.id, "messages"), {
        senderId: "system",
        senderName: "Sistem",
        text: `İade talebi oluşturuldu. "${conversation.itemTitle}" eşyası için iade süreci başlatıldı.`,
        timestamp: serverTimestamp(),
      })

      // Konuşmayı güncelle
      await updateDoc(doc(db, "conversations", conversation.id), {
        lastMessage: `İade talebi oluşturuldu. "${conversation.itemTitle}" eşyası için iade süreci başlatıldı.`,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: "system",
      })

      toast({
        title: "İade talebi oluşturuldu",
        description: "İade talebi başarıyla oluşturuldu.",
      })
    } catch (error) {
      console.error("Error initiating return:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İade talebi oluşturulurken bir hata oluştu.",
      })
    } finally {
      setIsProcessing(false)
      setShowReturnDialog(false)
    }
  }

  // Eşya sahibi iade onaylama işlemi
  const handleConfirmReturn = async () => {
    if (!request || !conversation || !user) return

    setDialogAction("confirm_return")
    setShowConfirmDialog(true)
  }

  const confirmReturn = async () => {
    if (!request || !conversation || !user) return

    try {
      setIsProcessing(true)

      // İstek durumunu güncelle
      const requestRef = doc(db, "requests", request.id)
      await updateDoc(requestRef, {
        ownerReturnConfirmed: true,
        returnStatus: "owner_confirmed",
      })

      // İstek sahibine bildirim gönder
      await createNotification({
        userId: request.requesterId,
        title: "İade Onayı",
        message: `"${conversation.itemTitle}" eşyasının iadesi için onayınız bekleniyor.`,
        type: "return",
        link: `/messages/${conversation.id}`,
      })

      // Sistem mesajı ekle
      await addDoc(collection(db, "conversations", conversation.id, "messages"), {
        senderId: "system",
        senderName: "Sistem",
        text: `Eşya sahibi iadeyi onayladı. İsteyen kişinin son onayı bekleniyor.`,
        timestamp: serverTimestamp(),
      })

      // Konuşmayı güncelle
      await updateDoc(doc(db, "conversations", conversation.id), {
        lastMessage: `Eşya sahibi iadeyi onayladı. İsteyen kişinin son onayı bekleniyor.`,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: "system",
      })

      toast({
        title: "İade onaylandı",
        description: "İadeyi başarıyla onayladınız. İsteyen kişinin son onayı bekleniyor.",
      })
    } catch (error) {
      console.error("Error confirming return:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İade onaylanırken bir hata oluştu.",
      })
    } finally {
      setIsProcessing(false)
      setShowConfirmDialog(false)
    }
  }

  // İsteyen kişi son iade onayı
  const handleRequesterConfirmReturn = async () => {
    if (!request || !conversation || !user) return

    setDialogAction("requester_confirm_return")
    setShowConfirmDialog(true)
  }

  const confirmRequesterReturn = async () => {
    if (!request || !conversation || !user) return

    try {
      setIsProcessing(true)

      // İstek durumunu güncelle
      const requestRef = doc(db, "requests", request.id)
      await updateDoc(requestRef, {
        status: "completed",
        requesterFinalConfirmed: true,
        returnStatus: "completed",
      })

      // Eşya durumunu güncelle
      if (item) {
        const itemRef = doc(db, "items", item.id)
        await updateDoc(itemRef, {
          status: "available",
        })
      }

      // Eşya sahibine bildirim gönder
      await createNotification({
        userId: request.ownerId,
        title: "İade Tamamlandı",
        message: `"${conversation.itemTitle}" eşyasının iadesi tamamlandı.`,
        type: "return",
        link: `/messages/${conversation.id}`,
      })

      // Sistem mesajı ekle
      await addDoc(collection(db, "conversations", conversation.id, "messages"), {
        senderId: "system",
        senderName: "Sistem",
        text: `İade tamamlandı. "${conversation.itemTitle}" eşyası başarıyla iade edildi. Lütfen birbirinizi değerlendirin.`,
        timestamp: serverTimestamp(),
      })

      // Konuşmayı güncelle
      await updateDoc(doc(db, "conversations", conversation.id), {
        lastMessage: `İade tamamlandı. "${conversation.itemTitle}" eşyası başarıyla iade edildi.`,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: "system",
      })

      toast({
        title: "İade tamamlandı",
        description: "İade işlemi başarıyla tamamlandı. Şimdi karşı tarafı değerlendirebilirsiniz.",
      })

      // Değerlendirme diyaloğunu aç
      setTimeout(() => {
        handleOpenRatingDialog(isOwner ? "borrower" : "lender")
      }, 1000)
    } catch (error) {
      console.error("Error confirming requester return:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İade onaylanırken bir hata oluştu.",
      })
    } finally {
      setIsProcessing(false)
      setShowConfirmDialog(false)
    }
  }

  // Konuşma silme işlemi
  const handleDeleteConversation = () => {
    setDialogAction("delete_conversation")
    setShowDeleteDialog(true)
  }

  const confirmDeleteConversation = async () => {
    if (!conversation || !user) return

    try {
      setIsProcessing(true)

      // Konuşmayı sil
      await deleteDoc(doc(db, "conversations", conversation.id))

      // Konuşmaya ait mesajları sil
      const messagesQuery = query(collection(db, "conversations", conversation.id, "messages"))
      // Konuşmayı sil
      await deleteDoc(doc(db, "conversations", conversation.id))

      // Konuşmaya ait mesajları sil
      const messagesQueryToDelete = query(collection(db, "conversations", conversation.id, "messages"))
      const messagesSnapshot = await getDocs(messagesQueryToDelete)

      const deletePromises = messagesSnapshot.docs.map((doc) => deleteDoc(doc.ref))

      await Promise.all(deletePromises)

      toast({
        title: "Konuşma silindi",
        description: "Konuşma başarıyla silindi.",
      })

      // Mesajlar sayfasına yönlendir
      router.push("/messages")
    } catch (error) {
      console.error("Error deleting conversation:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Konuşma silinirken bir hata oluştu.",
      })
    } finally {
      setIsProcessing(false)
      setShowDeleteDialog(false)
    }
  }

  // İstek bilgilerini yeniden yükleme
  const handleRefreshRequest = async () => {
    if (!conversation || !user) return

    try {
      setRequestLoading(true)
      setRequestError(null)

      if (conversation.requestId) {
        const requestDoc = await getDoc(doc(db, "requests", conversation.requestId))

        if (requestDoc.exists()) {
          const requestData = {
            id: requestDoc.id,
            ...requestDoc.data(),
          } as Request

          setRequest(requestData)

          // Determine if user is owner or requester
          setIsOwner(requestData.ownerId === user.uid)
          setIsRequester(requestData.requesterId === user.uid)

          // Set other user name
          setOtherUserName(
            user.uid === requestData.ownerId ? requestData.requesterName : requestData.ownerName || "İsimsiz Kullanıcı",
          )

          // Fetch item details
          if (requestData.itemId) {
            try {
              const itemRef = doc(db, "items", requestData.itemId)
              const itemSnap = await getDoc(itemRef)

              if (itemSnap.exists()) {
                setItem({
                  id: itemSnap.id,
                  ...itemSnap.data(),
                } as Item)
              }
            } catch (itemErr) {
              console.error("Error fetching item:", itemErr)
            }
          }

          toast({
            title: "Bilgiler güncellendi",
            description: "İstek bilgileri başarıyla güncellendi.",
          })
        } else {
          setRequestError("İstek bilgisi bulunamadı")
        }
      } else {
        setRequestError("Bu konuşma için istek bilgisi bulunamadı")
      }
    } catch (error) {
      console.error("Error refreshing request:", error)
      setRequestError("İstek bilgisi yüklenirken bir hata oluştu")
    } finally {
      setRequestLoading(false)
    }
  }

  // Değerlendirme diyaloğunu açma fonksiyonunu ekleyin:
  const handleOpenRatingDialog = (type: "borrower" | "lender") => {
    setRatingType(type)
    setShowRatingDialog(true)
  }

  // Kullanıcı giriş yapmamışsa ve yönlendirme yapılıyorsa yükleniyor göster
  if (redirecting) {
    return (
      <div className="container py-8 px-4 md:px-6 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-8 rounded-full mx-auto mb-4" />
          <p>Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-40 ml-2" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <Skeleton className={`h-12 w-2/3 rounded-lg`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/messages">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Hata</h1>
          </div>
          <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <p className="text-center mb-4">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Sayfayı Yenile
              </Button>
              <Button asChild>
                <Link href="/messages">Mesajlara Dön</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Giriş yapmanız gerekiyor</h1>
          <p className="text-muted-foreground mb-6">Mesajları görüntülemek için lütfen giriş yapın.</p>
          <Button asChild>
            <Link href={`/auth/login?returnUrl=${encodeURIComponent(`/messages/${id}`)}`}>Giriş Yap</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!conversation || !isUserInConversation) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Konuşma bulunamadı</h1>
          <p className="text-muted-foreground mb-6">Aradığınız konuşma mevcut değil veya erişim izniniz yok.</p>
          <Button asChild>
            <Link href="/messages">Mesajlara Dön</Link>
          </Button>
        </div>
      </div>
    )
  }

  // İstek durumuna göre gösterilecek butonları belirle
  const renderActionButton = () => {
    if (!request) return null

    // Eşya sahibi için butonlar
    if (isOwner) {
      if (request.status === "pending") {
        return (
          <div className="flex gap-2">
            <Button
              onClick={handleApproveRequest}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              İsteği Onayla
            </Button>
            <Button variant="destructive" onClick={handleRejectRequest} disabled={isProcessing} className="flex-1">
              <XCircle className="mr-2 h-4 w-4" />
              İsteği Reddet
            </Button>
          </div>
        )
      } else if (request.status === "accepted" && request.deliveryStatus === "requester_confirmed") {
        return (
          <Button
            onClick={handleOwnerConfirmDelivery}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Teslimatı Onayla
          </Button>
        )
      } else if (request.status === "returning" && request.returnStatus === "requester_confirmed") {
        return (
          <Button
            onClick={handleConfirmReturn}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            İadeyi Onayla
          </Button>
        )
      }
    }

    // İsteyen kişi için butonlar
    if (isRequester) {
      if (request.status === "accepted" && (!request.deliveryStatus || request.deliveryStatus === "")) {
        return (
          <Button
            onClick={handleConfirmDelivery}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Package className="mr-2 h-4 w-4" />
            Teslimatı Onayla
          </Button>
        )
      } else if (request.status === "accepted" && request.deliveryStatus === "completed" && !item?.unlimitedDuration) {
        return (
          <Button
            onClick={handleInitiateReturn}
            disabled={isProcessing || request.status === "returning"}
            className="w-full"
            variant="outline"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {request.status === "returning" ? "İade Süreci Başlatıldı" : "İade Sürecini Başlat"}
          </Button>
        )
      } else if (request.status === "returning" && request.returnStatus === "owner_confirmed") {
        return (
          <Button
            onClick={handleRequesterConfirmReturn}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            İade İşlemini Tamamla
          </Button>
        )
      }
    }

    // Tamamlanmış işlemler için değerlendirme butonu
    if (request.status === "completed") {
      return (
        <Button
          onClick={() => handleOpenRatingDialog(isOwner ? "borrower" : "lender")}
          className="w-full"
          variant="outline"
        >
          <Star className="mr-2 h-4 w-4" />
          Değerlendirme Yap
        </Button>
      )
    }

    return null
  }

  // İstek durumunu gösteren badge
  const getStatusBadge = () => {
    if (!request) return null

    return (
      <Badge
        className={`
          ${request.status === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
          ${request.status === "accepted" ? "bg-green-500 hover:bg-green-600" : ""}
          ${request.status === "rejected" ? "bg-red-500 hover:bg-red-600" : ""}
          ${request.status === "returning" ? "bg-blue-500 hover:bg-blue-600" : ""}
          ${request.status === "completed" ? "bg-green-700 hover:bg-green-800" : ""}
        `}
      >
        {request.status === "pending" && "Onay Bekliyor"}
        {request.status === "accepted" && "Onaylandı"}
        {request.status === "rejected" && "Reddedildi"}
        {request.status === "returning" && "İade Süreci"}
        {request.status === "completed" && "Tamamlandı"}
      </Badge>
    )
  }

  return (
    <div className="container py-4 px-0 md:px-6 md:py-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-full bg-background rounded-lg border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2 md:mr-3">
              <Link href="/messages">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Avatar className="h-10 w-10 mr-3 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary">{otherUserName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-medium">{otherUserName || "İsimsiz Kullanıcı"}</h1>
                {otherUserId && <UserStatusBadge userId={otherUserId} />}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Package className="h-3 w-3" />
                <span>{conversation.itemTitle}</span>
                {request && getStatusBadge()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {request && (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex"
                onClick={() => setShowRequestDetailsDialog(true)}
              >
                <Info className="h-4 w-4 mr-2" />
                İstek Detayları
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {request && (
                  <DropdownMenuItem onClick={() => setShowRequestDetailsDialog(true)} className="md:hidden">
                    <Info className="h-4 w-4 mr-2" />
                    İstek Detayları
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/items/${conversation.itemId}`} className="w-full cursor-pointer">
                    <Package className="h-4 w-4 mr-2" />
                    Eşyayı Görüntüle
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteConversation} className="text-red-600 cursor-pointer">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Konuşmayı Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]"
            style={{ backgroundImage: "url('/assets/chat-bg-light.png')" }}
          >
            {messages.length > 0 ? (
              messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isCurrentUser={message.senderId === user.uid}
                  userName={user.displayName || ""}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground text-center">Henüz mesaj yok. Konuşmaya başlayın!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Action Button */}
          {renderActionButton() && <div className="p-3 border-t bg-muted/10">{renderActionButton()}</div>}

          {/* Message Input */}
          <div className="p-3 border-t bg-background">
            <MessageInput
              onSendMessage={async (text) => {
                if (!conversation || !otherUserId || !user) return

                try {
                  // Add message to conversation
                  await addDoc(collection(db, "conversations", conversation.id, "messages"), {
                    senderId: user.uid,
                    senderName: user.displayName,
                    text: text,
                    timestamp: serverTimestamp(),
                  })

                  // Update conversation with last message
                  const conversationRef = doc(db, "conversations", conversation.id)
                  await updateDoc(conversationRef, {
                    lastMessage: text,
                    lastMessageTimestamp: serverTimestamp(),
                    lastMessageSenderId: user.uid,
                  })

                  // Create notification for the other user
                  await createNotification({
                    userId: otherUserId,
                    title: "Yeni Mesaj",
                    message: `${user.displayName}: ${text}`,
                    type: "message",
                    link: `/messages/${conversation.id}`,
                  })
                } catch (error) {
                  console.error("Error sending message:", error)
                  toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "Mesaj gönderilirken bir hata oluştu.",
                  })
                }
              }}
              onSendFile={handleFileUpload}
              onSendImage={handleImageUpload}
              disabled={!conversation || !isUserInConversation || loading}
              placeholder="Mesajınızı yazın..."
            />
          </div>
        </div>
      </div>

      {/* Request Details Dialog */}
      <Dialog open={showRequestDetailsDialog} onOpenChange={setShowRequestDetailsDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary" />
              İstek Detayları
            </DialogTitle>
            <DialogDescription>"{conversation.itemTitle}" için istek bilgileri</DialogDescription>
          </DialogHeader>

          {requestLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">İstek bilgileri yükleniyor...</p>
            </div>
          ) : requestError ? (
            <div className="text-center py-8 flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mb-2" />
              <p className="text-muted-foreground mb-4">{requestError}</p>
              <Button variant="outline" onClick={handleRefreshRequest} className="mt-2">
                <RotateCcw className="h-4 w-4 mr-2" />
                Yeniden Dene
              </Button>
            </div>
          ) : request ? (
            <div className="space-y-6">
              {/* Item Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{conversation.itemTitle}</span>
                    {getStatusBadge()}
                  </CardTitle>
                  <CardDescription>
                    <Link href={`/items/${request.itemId}`} className="text-primary hover:underline flex items-center">
                      <Package className="h-3 w-3 mr-1" />
                      Eşyayı görüntüle
                    </Link>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-muted-foreground">İsteyen:</p>
                      <p className="font-medium">{request.requesterName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-muted-foreground">Eşya Sahibi:</p>
                      <p className="font-medium">{request.ownerName}</p>
                    </div>
                  </div>

                  {request.pickupLocation && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-muted-foreground">Teslim Yeri:</p>
                        <p className="font-medium">{request.pickupLocation}</p>
                      </div>
                    </div>
                  )}

                  {request.pickupDate && !item?.unlimitedDuration && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-muted-foreground">Teslim Tarihi:</p>
                        <p className="font-medium">
                          {new Date(request.pickupDate.seconds * 1000).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-muted-foreground">Süre:</p>
                      {item?.unlimitedDuration ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Sınırsız Süreli Eşya
                        </Badge>
                      ) : request.duration ? (
                        <p className="font-medium">{request.duration} Gün</p>
                      ) : (
                        <p className="text-muted-foreground">Belirtilmemiş</p>
                      )}
                    </div>
                  </div>

                  {request.message && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-muted-foreground">Mesaj:</p>
                        <div className="bg-muted/30 p-3 rounded-md border mt-1">{request.message}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Process Status */}
              <div>
                <h3 className="text-lg font-semibold flex items-center mb-3">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Süreç Durumu
                </h3>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {/* Delivery Status */}
                    {(request.status === "accepted" ||
                      request.status === "returning" ||
                      request.status === "completed") && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium flex items-center">
                          <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                          Teslimat:
                        </span>
                        <Badge
                          className={`
                            ${!request.deliveryStatus ? "bg-yellow-500" : ""}
                            ${request.deliveryStatus === "requester_confirmed" ? "bg-blue-500" : ""}
                            ${request.deliveryStatus === "completed" ? "bg-green-500" : ""}
                          `}
                        >
                          {!request.deliveryStatus && "Bekliyor"}
                          {request.deliveryStatus === "requester_confirmed" && "Kısmen Onaylandı"}
                          {request.deliveryStatus === "completed" && "Tamamlandı"}
                        </Badge>
                      </div>
                    )}

                    {/* Return Status */}
                    {(request.status === "returning" || request.status === "completed") && !item?.unlimitedDuration && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium flex items-center">
                          <RotateCcw className="h-4 w-4 mr-2 text-muted-foreground" />
                          İade:
                        </span>
                        <Badge
                          className={`
                            ${request.returnStatus === "requester_confirmed" ? "bg-yellow-500" : ""}
                            ${request.returnStatus === "owner_confirmed" ? "bg-blue-500" : ""}
                            ${request.returnStatus === "completed" ? "bg-green-500" : ""}
                          `}
                        >
                          {request.returnStatus === "requester_confirmed" && "İade Başlatıldı"}
                          {request.returnStatus === "owner_confirmed" && "Kısmen Onaylandı"}
                          {request.returnStatus === "completed" && "Tamamlandı"}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Process Steps */}
              {(request.status === "accepted" || request.status === "returning" || request.status === "completed") && (
                <div>
                  <h3 className="text-lg font-semibold flex items-center mb-3">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    Süreç Adımları
                  </h3>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Delivery Steps */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center 
                              ${request.requesterConfirmed ? "bg-green-500 text-white" : "bg-muted border"}`}
                          >
                            {request.requesterConfirmed ? "✓" : "1"}
                          </div>
                          <span className={`${request.requesterConfirmed ? "text-green-600 font-medium" : ""}`}>
                            İsteyen kişi teslimatı onayladı
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center 
                              ${request.ownerDeliveryConfirmed ? "bg-green-500 text-white" : "bg-muted border"}`}
                          >
                            {request.ownerDeliveryConfirmed ? "✓" : "2"}
                          </div>
                          <span className={`${request.ownerDeliveryConfirmed ? "text-green-600 font-medium" : ""}`}>
                            Eşya sahibi teslimatı onayladı
                          </span>
                        </div>

                        {/* Return Steps - for non-unlimited duration items */}
                        {!item?.unlimitedDuration && (
                          <>
                            <Separator className="my-2" />
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center 
                                  ${request.requesterReturnConfirmed ? "bg-green-500 text-white" : "bg-muted border"}`}
                              >
                                {request.requesterReturnConfirmed ? "✓" : "3"}
                              </div>
                              <span
                                className={`${request.requesterReturnConfirmed ? "text-green-600 font-medium" : ""}`}
                              >
                                İsteyen kişi iade sürecini başlattı
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center 
                                  ${request.ownerReturnConfirmed ? "bg-green-500 text-white" : "bg-muted border"}`}
                              >
                                {request.ownerReturnConfirmed ? "✓" : "4"}
                              </div>
                              <span className={`${request.ownerReturnConfirmed ? "text-green-600 font-medium" : ""}`}>
                                Eşya sahibi iadeyi onayladı
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center 
                                  ${request.requesterFinalConfirmed ? "bg-green-500 text-white" : "bg-muted border"}`}
                              >
                                {request.requesterFinalConfirmed ? "✓" : "5"}
                              </div>
                              <span
                                className={`${request.requesterFinalConfirmed ? "text-green-600 font-medium" : ""}`}
                              >
                                İsteyen kişi iade işlemini tamamladı
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Action Button */}
              <CardFooter className="px-0 pt-2">{renderActionButton()}</CardFooter>
            </div>
          ) : (
            <div className="text-center py-8 flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mb-2" />
              <p className="text-muted-foreground">İstek bilgisi bulunamadı.</p>
              <Button variant="outline" onClick={handleRefreshRequest} className="mt-4">
                <RotateCcw className="h-4 w-4 mr-2" />
                Yeniden Dene
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "approve" && "İsteği Onaylama"}
              {dialogAction === "reject" && "İsteği Reddetme"}
              {dialogAction === "confirm_delivery" && "Teslimatı Onaylama"}
              {dialogAction === "owner_confirm_delivery" && "Teslimatı Onaylama"}
              {dialogAction === "confirm_return" && "İadeyi Onaylama"}
              {dialogAction === "requester_confirm_return" && "İade İşlemini Tamamlama"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "approve" &&
                "Bu isteği onaylamak istediğinizden emin misiniz? Eşya ödünç verilecek olarak işaretlenecektir."}
              {dialogAction === "reject" && "Bu isteği reddetmek istediğinizden emin misiniz? Bu işlem geri alınamaz."}
              {dialogAction === "confirm_delivery" && "Eşyayı teslim aldığınızı onaylamak istediğinizden emin misiniz?"}
              {dialogAction === "owner_confirm_delivery" &&
                "Eşyayı teslim ettiğinizi onaylamak istediğinizden emin misiniz?"}
              {dialogAction === "confirm_return" && "İadeyi onaylamak istediğinizden emin misiniz?"}
              {dialogAction === "requester_confirm_return" &&
                "İade işlemini tamamlamak istediğinizden emin misiniz? Bu işlem geri alınamaz."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dialogAction === "approve") confirmApproveRequest()
                else if (dialogAction === "reject") confirmRejectRequest()
                else if (dialogAction === "confirm_delivery") confirmDelivery()
                else if (dialogAction === "owner_confirm_delivery") confirmOwnerDelivery()
                else if (dialogAction === "confirm_return") confirmReturn()
                else if (dialogAction === "requester_confirm_return") confirmRequesterReturn()
              }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                "Onaylıyorum"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İade Sürecini Başlat</AlertDialogTitle>
            <AlertDialogDescription>
              Eşyayı iade etmek istediğinizden emin misiniz? İade süreci başlatıldıktan sonra eşya sahibinin onayı
              gerekecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmInitiateReturn} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                "İade Sürecini Başlat"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Conversation Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konuşmayı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu konuşmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm mesajlar silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteConversation}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                "Konuşmayı Sil"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rating Dialog */}
      <RatingDialog
        isOpen={showRatingDialog}
        onClose={() => setShowRatingDialog(false)}
        userId={otherUserId || ""}
        userName={otherUserName || "Kullanıcı"}
        itemTitle={conversation?.itemTitle || ""}
        ratingType={ratingType}
      />
    </div>
  )
}
