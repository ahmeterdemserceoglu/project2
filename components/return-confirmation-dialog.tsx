"use client"

import type React from "react"

import { useState } from "react"
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
import { confirmReturnDelivery } from "@/lib/return-requests"
import { logger } from "@/lib/logger"
import type { ReturnRequest, Item } from "@/lib/types"

interface ReturnConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  returnRequest: ReturnRequest | null
  isOwner: boolean
  setItem: React.Dispatch<React.SetStateAction<Item | null>>
}

export default function ReturnConfirmationDialog({
  isOpen,
  onClose,
  returnRequest,
  isOwner,
  setItem,
}: ReturnConfirmationDialogProps) {
  const { toast } = useToast()
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!returnRequest) return null

  const handleConfirm = async () => {
    if (!returnRequest) return

    try {
      logger.info("Confirming return", { returnRequestId: returnRequest.id, isOwner })

      const result = await confirmReturnDelivery({
        returnRequestId: returnRequest.id,
        isOwner,
        notes: notes,
      })

      if (result.success) {
        toast({
          title: "İade onaylandı",
          description: "İade başarıyla onaylandı.",
        })

        // Eğer iade tamamlandıysa, eşya durumunu güncelle
        if (result.completed && setItem) {
          setItem((prevItem) => {
            if (!prevItem) return null
            return {
              ...prevItem,
              status: "available",
            }
          })
        }

        onClose()
      } else {
        throw new Error("İade onaylanamadı")
      }
    } catch (error) {
      logger.error("Error confirming return", { error, returnRequestId: returnRequest.id })
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İade onaylanırken bir hata oluştu.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>İade Onayı</DialogTitle>
          <DialogDescription>
            {isOwner ? "Eşyanızı teslim aldığınızı onaylayın." : "Eşyayı iade ettiğinizi onaylayın."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <p className="text-sm font-medium mb-2">Eşya: {returnRequest.itemTitle}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {isOwner
                ? `İade Eden: ${returnRequest.requesterName}`
                : `Eşya Sahibi: ${returnRequest.ownerName || "Kullanıcı"}`}
            </p>
          </div>
          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notlar (İsteğe bağlı)
            </label>
            <Textarea
              id="notes"
              placeholder="İade ile ilgili notlarınızı buraya yazabilirsiniz."
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
                İadeyi Onayla
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
