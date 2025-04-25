"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { CategoryController } from "@/lib/controllers/category-controller"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, X } from "lucide-react"

export default function ItemFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [locations, setLocations] = useState([
    "İstanbul",
    "Ankara",
    "İzmir",
    "Bursa",
    "Antalya",
    "Adana",
    "Konya",
    "Gaziantep",
    "Şanlıurfa",
    "Kocaeli",
  ])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [durationRange, setDurationRange] = useState([1, 30])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const allCategories = await CategoryController.getAllCategories()
        setCategories(allCategories)
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }

    loadCategories()
  }, [])

  // Initialize filters from URL
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      setSelectedCategories(categoryParam.split(","))
    }

    const locationParam = searchParams.get("location")
    if (locationParam) {
      setSelectedLocations(locationParam.split(","))
    }

    const durationParam = searchParams.get("duration")
    if (durationParam) {
      const [min, max] = durationParam.split("-").map(Number)
      setDurationRange([min, max])
    }
  }, [searchParams])

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Update category parameter
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","))
    } else {
      params.delete("category")
    }

    // Update location parameter
    if (selectedLocations.length > 0) {
      params.set("location", selectedLocations.join(","))
    } else {
      params.delete("location")
    }

    // Update duration parameter
    if (durationRange[0] !== 1 || durationRange[1] !== 30) {
      params.set("duration", `${durationRange[0]}-${durationRange[1]}`)
    } else {
      params.delete("duration")
    }

    router.push(`/items?${params.toString()}`)
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedLocations([])
    setDurationRange([1, 30])
    router.push("/items")
  }

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) => (prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]))
  }

  const toggleLocation = (location: string) => {
    setSelectedLocations((prev) => (prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]))
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtreler
          {(selectedCategories.length > 0 ||
            selectedLocations.length > 0 ||
            durationRange[0] !== 1 ||
            durationRange[1] !== 30) && (
            <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
              {selectedCategories.length +
                selectedLocations.length +
                (durationRange[0] !== 1 || durationRange[1] !== 30 ? 1 : 0)}
            </span>
          )}
        </Button>

        {(selectedCategories.length > 0 ||
          selectedLocations.length > 0 ||
          durationRange[0] !== 1 ||
          durationRange[1] !== 30) && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            Filtreleri Temizle
          </Button>
        )}
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-3">Kategoriler</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.slug}`}
                      checked={selectedCategories.includes(category.slug)}
                      onCheckedChange={() => toggleCategory(category.slug)}
                    />
                    <Label htmlFor={`category-${category.slug}`}>{category.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Konumlar</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {locations.map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={selectedLocations.includes(location)}
                      onCheckedChange={() => toggleLocation(location)}
                    />
                    <Label htmlFor={`location-${location}`}>{location}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Ödünç Alma Süresi (Gün)</h3>
              <div className="px-2">
                <Slider value={durationRange} min={1} max={30} step={1} onValueChange={setDurationRange} />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{durationRange[0]} gün</span>
                  <span>{durationRange[1]} gün</span>
                </div>
              </div>
            </div>
          </CardContent>

          <div className="p-4 border-t flex justify-end">
            <Button onClick={applyFilters}>Filtreleri Uygula</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
