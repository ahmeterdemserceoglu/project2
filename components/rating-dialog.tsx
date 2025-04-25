"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createNotification } from "@/lib/notifications"
import { logger } from "@/lib/logger"

interface RatingDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
  itemTitle: string
  ratingType: "borrower" | "lender"
}

export default function RatingDialog({ isOpen, onClose, userId, userName, itemTitle, ratingType }: RatingDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!user || !rating) return

    try {
      setIsLoading(true)

      // Değerlendirmeyi kaydet
      await addDoc(collection(db, "ratings"), {
        raterId: user.uid,
        raterName: user.displayName || "İsimsiz Kullanıcı",
        ratedUserId: userId,
        rating,
        comment,
        type: ratingType,
        itemTitle,
        createdAt: serverTimestamp(),
      })

      // Bildirim gönder
      await createNotification({
        userId,
        title: "Yeni Değerlendirme",
        message: `${user.displayName || "Bir kullanıcı"} size ${rating} yıldız verdi.`,
        type: "rating",
        link: `/profile`,
      })

      toast({
        title: "Değerlendirme gönderildi",
        description: "Değerlendirmeniz başarıyla kaydedildi.",
      })

      // Formu sıfırla ve kapat
      setRating(0)
      setComment("")
      onClose()
    } catch (error) {
      logger.error("Error submitting rating", { error })
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Değerlendirme gönderilirken bir hata oluştu.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kullanıcıyı Değerlendir</DialogTitle>
          <DialogDescription>
            {ratingType === "borrower"
              ? `"${itemTitle}" eşyanızı ödünç alan ${userName} kullanıcısını değerlendirin.`
              : `"${itemTitle}" eşyasını ödünç veren ${userName} kullanıcısını değerlendirin.`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-all ${
                    star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {rating === 1 && "Kötü"}
            {rating === 2 && "Orta"}
            {rating === 3 && "��yi"}
            {rating === 4 && "Çok İyi"}
            {rating === 5 && "Mükemmel"}
          </div>
          <div className="grid gap-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Yorumunuz
            </label>
            <Textarea
              id="comment"
              placeholder="Deneyiminizi paylaşın (isteğe bağlı)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={!rating || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              "Değerlendir"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
