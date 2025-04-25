"use client"

import type React from "react"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createNotification } from "@/lib/notifications"
import type { Request, Item } from "@/lib/types"

interface DeliveryConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  activeRequest: Request | null
  isOwner: boolean
  setItem: React.Dispatch<React.SetStateAction<Item | null>>
}

export default function DeliveryConfirmationDialog({
  isOpen,
  onClose,
  activeRequest,
  isOwner,
  setItem,
}: DeliveryConfirmationDialogProps) {
  const { toast } = useToast()
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!activeRequest) return null

  const handleConfirm = async () => {
    if (!activeRequest) return

    try {
      console.log("Confirming delivery", { requestId: activeRequest.id, isOwner })

      const requestRef = doc(db, "requests", activeRequest.id)
      const updateData: Record<string, any> = {}

      if (isOwner) {
        updateData.ownerConfirmed = true
      } else {
        updateData.requesterConfirmed = true
      }

      // Eğer her iki taraf da onayladıysa, durumu "completed" olarak güncelle
      if ((isOwner && activeRequest.requesterConfirmed) || (!isOwner && activeRequest.ownerConfirmed)) {
        updateData.status = "completed"

        // Eşya durumunu güncelle
        if (setItem) {
          setItem((prevItem) => {
            if (!prevItem) return null
            return {
              ...prevItem,
              status: "borrowed",
            }
          })
        }
      }

      await updateDoc(requestRef, updateData)

      // Karşı tarafa bildirim gönder
      const recipientId = isOwner ? activeRequest.requesterId : activeRequest.ownerId
      const bothConfirmed = (isOwner && activeRequest.requesterConfirmed) || (!isOwner && activeRequest.ownerConfirmed)

      if (!bothConfirmed) {
        await createNotification({
          userId: recipientId,
          title: "Teslimat Onayı Bekleniyor",
          message: `"${activeRequest.itemTitle}" için teslimat onayınız bekleniyor.`,
          type: "system",
          link: `/items/${activeRequest.itemId}`,
        })
      } else {
        // Her iki taraf da onayladıysa, her ikisine de bildirim gönder
        await createNotification({
          userId: activeRequest.requesterId,
          title: "Teslimat Tamamlandı",
          message: `"${activeRequest.itemTitle}" eşyasının teslimatı tamamlandı.`,
          type: "system",
          link: `/items/${activeRequest.itemId}`,
        })

        await createNotification({
          userId: activeRequest.ownerId,
          title: "Teslimat Tamamlandı",
          message: `"${activeRequest.itemTitle}" eşyanızın teslimatı tamamlandı.`,
          type: "system",
          link: `/items/${activeRequest.itemId}`,
        })
      }

      toast({
        title: "Teslimat onaylandı",
        description: "Teslimat başarıyla onaylandı.",
      })

      onClose()
    } catch (error) {
      console.error("Error confirming delivery", { error, requestId: activeRequest.id })
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Teslimat onaylanırken bir hata oluştu.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Teslimat Onayı</DialogTitle>
          <DialogDescription>
            {isOwner ? "Eşyayı teslim ettiğinizi onaylayın." : "Eşyayı teslim aldığınızı onaylayın."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <p className="text-sm font-medium mb-2">Eşya: {activeRequest.itemTitle}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {isOwner
                ? `Alıcı: ${activeRequest.requesterName}`
                : `Eşya Sahibi: ${activeRequest.ownerName || "Kullanıcı"}`}
            </p>
          </div>
          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notlar (İsteğe bağlı)
            </label>
            <Textarea
              id="notes"
              placeholder="Teslimat ile ilgili notlarınızı buraya yazabilirsiniz."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Teslimatı Onayla
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
