"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, RotateCcw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createReturnRequest } from "@/lib/return-requests"
import type { Item, Request } from "@/lib/types"

interface ReturnRequestDialogProps {
  item: Item
  request: Request
  isOpen: boolean
  onClose: () => void
}

export default function ReturnRequestDialog({ item, request, isOpen, onClose }: ReturnRequestDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [location, setLocation] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !item || !request) return

    try {
      setIsLoading(true)

      const result = await createReturnRequest({
        requestId: request.id,
        itemId: item.id,
        itemTitle: item.title,
        ownerId: item.userId,
        ownerName: item.userDisplayName,
        requesterId: user.uid,
        requesterName: user.displayName || "İsimsiz Kullanıcı",
        returnLocation: location,
        returnDate: new Date(returnDate),
        message: message.trim() || "İade talebi oluşturuldu.",
        conversationId: request.conversationId,
      })

      if (result.success) {
        toast({
          title: "İade talebi oluşturuldu",
          description: "İade talebiniz başarıyla oluşturuldu. Eşya sahibinin onayı bekleniyor.",
        })
        onClose()
      } else {
        throw new Error("İade talebi oluşturulamadı")
      }
    } catch (error) {
      console.error("Error creating return request:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İade talebi oluşturulurken bir hata oluştu.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>İade Talebi Oluştur</DialogTitle>
          <DialogDescription>"{item.title}" eşyasını iade etmek için aşağıdaki bilgileri doldurun.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="location">İade Noktası</Label>
              <Input
                id="location"
                placeholder="Eşyayı nerede iade edeceksiniz?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="returnDate">İade Tarihi</Label>
              <Input
                id="returnDate"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Mesaj (İsteğe bağlı)</Label>
              <Textarea
                id="message"
                placeholder="Eşya sahibine iletmek istediğiniz bir mesaj var mı?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  İade Talebi Oluştur
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
