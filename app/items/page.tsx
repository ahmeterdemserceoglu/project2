"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Search, Package, Filter, X } from "lucide-react"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface Item {
  id: string
  title: string
  description: string
  category: string
  location: string
  imageUrl: string
  createdAt: string
  userId: string
  status: string
}

const categories = [
  { value: "all", label: "Tüm Kategoriler" },
  { value: "tools", label: "Aletler" },
  { value: "home", label: "Ev Eşyaları" },
  { value: "books", label: "Kitaplar" },
  { value: "other", label: "Diğer" },
]

const cities = [
  { value: "all", label: "Tüm Şehirler" },
  { value: "istanbul", label: "İstanbul" },
  { value: "ankara", label: "Ankara" },
  { value: "izmir", label: "İzmir" },
  { value: "bursa", label: "Bursa" },
  { value: "antalya", label: "Antalya" },
]

const sortOptions = [
  { value: "newest", label: "En Yeni" },
  { value: "oldest", label: "En Eski" },
  { value: "a-z", label: "A-Z" },
  { value: "z-a", label: "Z-A" },
]

export default function ItemsPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")

  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [activeFilters, setActiveFilters] = useState(0)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)

        // Basit bir sorgu kullanarak tüm eşyaları getir
        const itemsRef = collection(db, "items")
        let q

        if (categoryParam && categoryParam !== "all") {
          q = query(itemsRef, where("category", "==", categoryParam), orderBy("createdAt", "desc"))
        } else {
          q = query(itemsRef, orderBy("createdAt", "desc"))
        }

        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          console.log("No items found in the database")
          setItems([])
          setFilteredItems([])
        } else {
          const itemsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Item[]

          console.log(`Found ${itemsData.length} items`)
          setItems(itemsData)
          setFilteredItems(itemsData)
        }
      } catch (error) {
        console.error("Error fetching items:", error)
        setItems([])
        setFilteredItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [categoryParam])

  useEffect(() => {
    // Filter items based on search term, category, city, and status
    let filtered = items

    // Count active filters
    let filterCount = 0

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
      filterCount++
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter((item) => item.location.toLowerCase().includes(selectedCity.toLowerCase()))
      filterCount++
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((item) => item.status === selectedStatus)
      filterCount++
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.location.toLowerCase().includes(term),
      )
      filterCount++
    }

    // Sort items
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sortBy === "a-z") {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === "z-a") {
      filtered.sort((a, b) => b.title.localeCompare(a.title))
    }

    setActiveFilters(filterCount)
    setFilteredItems(filtered)
  }, [searchTerm, selectedCategory, selectedCity, selectedStatus, sortBy, items])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The filtering is already handled by the useEffect
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedCity("all")
    setSelectedStatus("all")
    setSortBy("newest")
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Eşyalar</h1>
          <p className="text-muted-foreground">Nadiren kullanılan eşyaları keşfedin ve ödünç alın</p>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrele
                {activeFilters > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">{activeFilters}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtreler</SheetTitle>
                <SheetDescription>Aradığınız eşyayı daha kolay bulmak için filtreleri kullanın</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Şehir seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.value} value={city.value}>
                          {city.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Durum</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="available">Müsait</SelectItem>
                      <SelectItem value="borrowed">Ödünç Verildi</SelectItem>
                      <SelectItem value="unavailable">Müsait Değil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Filtreleri Temizle
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8 bg-muted/40 p-4 rounded-lg">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Eşya adı, açıklama veya konum..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit">Ara</Button>
        </form>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => (
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
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Henüz eşya bulunmuyor</h3>
          <p className="text-muted-foreground mb-4">
            İlk eşyayı ekleyerek başlayabilirsiniz veya filtreleri değiştirerek tekrar arayabilirsiniz.
          </p>
          <Button asChild>
            <Link href="/items/new">Yeni Eşya Ekle</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
