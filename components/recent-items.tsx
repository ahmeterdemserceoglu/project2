"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import Image from "next/image"
import { MapPin } from "lucide-react"

interface Item {
  id: string
  title: string
  category: string
  location: string
  imageUrl: string
  createdAt: string
}

interface RecentItemsProps {
  fallback?: React.ReactNode
}

export default function RecentItems({ fallback }: RecentItemsProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentItems = async () => {
    try {
      setLoading(true)

      // Daha basit bir sorgu kullanın
      const q = query(collection(db, "items"), orderBy("createdAt", "desc"), limit(4))

      const querySnapshot = await getDocs(q)
      const itemsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[]

      setItems(itemsData)
    } catch (error) {
      console.error("Error fetching recent items:", error)
      // Hata durumunda boş dizi ayarla
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentItems()

    // Add a cleanup function
    return () => {
      // Cleanup if needed
    }
  }, [])

  return (
    <section className="container px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Son Eklenen Eşyalar</h2>
        <Button asChild variant="outline">
          <Link href="/items">Tümünü Gör</Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter className="p-4">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={item.imageUrl || "/placeholder.svg?height=192&width=384"}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="line-clamp-1">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Badge className="mb-2">{item.category}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  {item.location}
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <Button asChild className="w-full">
                  <Link href={`/items/${item.id}`}>Detayları Gör</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : fallback ? (
        fallback
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Henüz eşya eklenmemiş.</p>
        </div>
      )}
    </section>
  )
}
