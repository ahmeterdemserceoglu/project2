"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addDoc, collection, serverTimestamp, doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { createNotification } from "@/lib/notifications"

interface RequestItemDialogProps {
  itemId: string
  itemTitle: string
  ownerId: string
  ownerName: string
  isUnlimitedDuration?: boolean
  disabled?: boolean
}

// Change to default export
export default function RequestItemDialog({
  itemId,
  itemTitle,
  ownerId,
  ownerName,
  isUnlimitedDuration = false,
  disabled = false,
}: RequestItemDialogProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [pickupLocation, setPickupLocation] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message || !pickupLocation || (!isUnlimitedDuration && !pickupDate)) {
      toast({
        variant: "destructive",
        title: "Eksik bilgi",
        description: "Lütfen tüm alanları doldurun.",
      })
      return
    }

    if (!user || !itemId) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İstek gönderilemedi. Lütfen sayfayı yenileyip tekrar deneyin.",
      })
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Creating request for item:", itemId, itemTitle)

      // Konuşma oluştur
      const conversationRef = doc(collection(db, "conversations"))
      await setDoc(conversationRef, {
        itemId: itemId,
        itemTitle: itemTitle,
        participants: [user.uid, ownerId],
        ownerId: ownerId,
        requesterId: user.uid,
        lastMessage: message,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: user.uid,
        createdAt: serverTimestamp(),
      })

      // İlk mesajı ekle
      await addDoc(collection(db, "conversations", conversationRef.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || "İsimsiz Kullanıcı",
        text: message,
        timestamp: serverTimestamp(),
      })

      // İstek oluştur
      const requestRef = doc(collection(db, "requests"))
      await setDoc(requestRef, {
        id: requestRef.id,
        itemId: itemId,
        itemTitle: itemTitle,
        ownerId: ownerId,
        ownerName: ownerName,
        requesterId: user.uid,
        requesterName: user.displayName || "İsimsiz Kullanıcı",
        status: "pending",
        message,
        pickupLocation,
        pickupDate,
        conversationId: conversationRef.id,
        createdAt: serverTimestamp(),
        isUnlimitedDuration: isUnlimitedDuration,
      })

      // Eşya sahibine bildirim gönder
      await createNotification({
        userId: ownerId,
        title: "Yeni Eşya İsteği",
        message: `${user.displayName || "Bir kullanıcı"} "${itemTitle}" eşyanızı ödünç almak istiyor.`,
        type: "request",
        link: `/messages/${conversationRef.id}`,
      })

      toast({
        title: "İstek gönderildi",
        description: "İsteğiniz başarıyla gönderildi. Eşya sahibinin yanıtı bekleniyor.",
      })

      setIsOpen(false)
      router.push(`/messages/${conversationRef.id}`)
    } catch (error) {
      console.error("Error sending request:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İstek oluşturulurken bir hata oluştu.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full" disabled={disabled}>
        İstek Gönder
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eşya İsteği Gönder</DialogTitle>
            <DialogDescription>"{itemTitle}" için istek gönderin. Lütfen tüm alanları doldurun.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="message">Mesaj</Label>
                <Textarea
                  id="message"
                  placeholder="Merhaba, eşyanızı ödünç alabilir miyim?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Teslim Noktası</Label>
                <Input
                  id="location"
                  placeholder="Örn: Kampüs kütüphanesi önü"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  required
                />
              </div>
              {!isUnlimitedDuration && (
                <div className="grid gap-2">
                  <Label htmlFor="date">Teslim Tarihi</Label>
                  <Input
                    id="date"
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required={!isUnlimitedDuration}
                  />
                </div>
              )}

              {isUnlimitedDuration && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    Bu eşya sınırsız süreli olarak paylaşılmaktadır. İade süreci başlatmanız gerekmeyecektir.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  "İstek Gönder"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
