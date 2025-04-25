"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { EmptyState } from "@/components/ui/empty-state"
import { FavoriteButton } from "@/components/ui/favorite-button"

interface Item {
  id: string
  title: string
  description: string
  category: string
  location: string
  imageUrl: string
  status: string
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [favoriteItems, setFavoriteItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Get user's favorites
        const favoritesRef = collection(db, "users", user.uid, "favorites")
        const favoritesSnapshot = await getDocs(favoritesRef)

        if (favoritesSnapshot.empty) {
          setFavoriteItems([])
          setLoading(false)
          return
        }

        // Get item details for each favorite
        const itemsData: Item[] = []

        for (const favoriteDoc of favoritesSnapshot.docs) {
          const itemId = favoriteDoc.id
          const itemRef = doc(db, "items", itemId)
          const itemSnapshot = await getDoc(itemRef)

          if (itemSnapshot.exists()) {
            itemsData.push({
              id: itemSnapshot.id,
              ...itemSnapshot.data(),
            } as Item)
          }
        }

        setFavoriteItems(itemsData)
      } catch (error) {
        console.error("Error fetching favorites:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Favorilerim</h1>
        <Button asChild variant="outline">
          <Link href="/items">Tüm Eşyaları Gör</Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : favoriteItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {favoriteItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <Link href={`/items/${item.id}`} className="block">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={item.imageUrl || "/placeholder.svg?height=192&width=384"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    <FavoriteButton itemId={item.id} className="bg-background/80 hover:bg-background" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <Badge
                      className={
                        item.status === "available"
                          ? "bg-green-500"
                          : item.status === "borrowed"
                            ? "bg-orange-500"
                            : "bg-red-500"
                      }
                    >
                      {item.status === "available"
                        ? "Müsait"
                        : item.status === "borrowed"
                          ? "Ödünç Verildi"
                          : "Müsait Değil"}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="line-clamp-1">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <Badge variant="outline" className="mb-2">
                    {item.category}
                  </Badge>
                  <p className="line-clamp-2 text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {item.location}
                  </div>
                </CardContent>
                <CardFooter className="p-4">
                  <Button className="w-full">Detayları Gör</Button>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Henüz favoriniz yok"
          description="Beğendiğiniz eşyaları favorilere ekleyerek daha sonra kolayca bulabilirsiniz."
          actionLabel="Eşyaları Keşfet"
          actionLink="/items"
        />
      )}
    </div>
  )
}
