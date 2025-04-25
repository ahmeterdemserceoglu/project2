"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface FavoriteButtonProps {
  itemId: string
  className?: string
}

export function FavoriteButton({ itemId, className = "" }: FavoriteButtonProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkIfFavorite = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const favoriteRef = doc(db, "users", user.uid, "favorites", itemId)
        const docSnap = await getDoc(favoriteRef)
        setIsFavorite(docSnap.exists())
      } catch (error) {
        console.error("Error checking favorite status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkIfFavorite()
  }, [user, itemId])

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Giriş yapmanız gerekiyor",
        description: "Favorilere eklemek için lütfen giriş yapın.",
      })
      return
    }

    try {
      const favoriteRef = doc(db, "users", user.uid, "favorites", itemId)

      if (isFavorite) {
        await deleteDoc(favoriteRef)
        setIsFavorite(false)
        toast({
          title: "Favorilerden çıkarıldı",
          description: "Eşya favorilerinizden çıkarıldı.",
        })
      } else {
        await setDoc(favoriteRef, {
          itemId,
          addedAt: new Date(),
        })
        setIsFavorite(true)
        toast({
          title: "Favorilere eklendi",
          description: "Eşya favorilerinize eklendi.",
        })
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu.",
      })
    }
  }

  return (
    <Button variant="ghost" size="icon" className={className} onClick={toggleFavorite} disabled={isLoading}>
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
    </Button>
  )
}
