"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface ReportDialogProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemTitle: string
  ownerId: string
}

const reportReasons = [
  { value: "inappropriate", label: "Uygunsuz içerik" },
  { value: "fake", label: "Sahte ilan" },
  { value: "spam", label: "Spam veya reklam" },
  { value: "scam", label: "Dolandırıcılık" },
  { value: "other", label: "Diğer" },
]

export default function ReportDialog({ isOpen, onClose, itemId, itemTitle, ownerId }: ReportDialogProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!user) return null

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        variant: "destructive",
        title: "Sebep seçimi gerekli",
        description: "Lütfen bir rapor sebebi seçin.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create a new report in Firestore
      const reportData = {
        itemId,
        itemTitle,
        ownerId,
        reporterId: user.uid,
        reporterName: user.displayName,
        reason,
        description,
        status: "pending", // pending, resolved, dismissed
        createdAt: serverTimestamp(),
      }

      // Add report to Firestore
      await addDoc(collection(db, "reports"), reportData)

      toast({
        title: "Rapor gönderildi",
        description: "Raporunuz incelenmek üzere gönderildi.",
      })

      onClose()
    } catch (error) {
      console.error("Error sending report:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Rapor gönderilirken bir hata oluştu.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eşyayı Raporla</DialogTitle>
          <DialogDescription>Bu eşyayı neden raporlamak istediğinizi belirtin.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Rapor Sebebi</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((reportReason) => (
                <div key={reportReason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reportReason.value} id={reportReason.value} />
                  <Label htmlFor={reportReason.value}>{reportReason.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              placeholder="Lütfen daha fazla detay verin"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !reason}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              "Raporla"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
