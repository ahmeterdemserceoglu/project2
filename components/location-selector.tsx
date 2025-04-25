"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface LocationSelectorProps {
  value: string
  onChange: (location: string) => void
}

// TurkiyeAPI endpoints
const API_BASE_URL = "https://turkiyeapi.dev/api/v1"
const PROVINCES_API_URL = `${API_BASE_URL}/provinces`
const DISTRICTS_API_URL = `${API_BASE_URL}/districts`

type City = {
  id: number
  name: string
}

type District = {
  id: number
  name: string
  province_id: number
}

// Fallback data for when API is unavailable
const FALLBACK_CITIES = [
  { id: 34, name: "İstanbul" },
  { id: 6, name: "Ankara" },
  { id: 35, name: "İzmir" },
  { id: 1, name: "Adana" },
  { id: 16, name: "Bursa" },
  { id: 7, name: "Antalya" },
  { id: 42, name: "Konya" },
  { id: 27, name: "Gaziantep" },
  { id: 31, name: "Hatay" },
  { id: 21, name: "Diyarbakır" },
  { id: 55, name: "Samsun" },
  { id: 33, name: "Mersin" },
  { id: 26, name: "Eskişehir" },
  { id: 41, name: "Kocaeli" },
  { id: 44, name: "Malatya" },
]

const FALLBACK_DISTRICTS: Record<number, District[]> = {
  34: [
    { id: 1, name: "Kadıköy", province_id: 34 },
    { id: 2, name: "Beşiktaş", province_id: 34 },
    { id: 3, name: "Üsküdar", province_id: 34 },
    { id: 4, name: "Fatih", province_id: 34 },
    { id: 5, name: "Beyoğlu", province_id: 34 },
    { id: 6, name: "Bakırköy", province_id: 34 },
    { id: 7, name: "Şişli", province_id: 34 },
    { id: 8, name: "Maltepe", province_id: 34 },
    { id: 9, name: "Ataşehir", province_id: 34 },
    { id: 10, name: "Pendik", province_id: 34 },
  ],
  6: [
    { id: 11, name: "Çankaya", province_id: 6 },
    { id: 12, name: "Keçiören", province_id: 6 },
    { id: 13, name: "Yenimahalle", province_id: 6 },
    { id: 14, name: "Mamak", province_id: 6 },
    { id: 15, name: "Etimesgut", province_id: 6 },
    { id: 16, name: "Sincan", province_id: 6 },
    { id: 17, name: "Altındağ", province_id: 6 },
    { id: 18, name: "Pursaklar", province_id: 6 },
    { id: 19, name: "Gölbaşı", province_id: 6 },
    { id: 20, name: "Polatlı", province_id: 6 },
  ],
  35: [
    { id: 21, name: "Konak", province_id: 35 },
    { id: 22, name: "Karşıyaka", province_id: 35 },
    { id: 23, name: "Bornova", province_id: 35 },
    { id: 24, name: "Buca", province_id: 35 },
    { id: 25, name: "Karabağlar", province_id: 35 },
    { id: 26, name: "Bayraklı", province_id: 35 },
    { id: 27, name: "Çiğli", province_id: 35 },
    { id: 28, name: "Gaziemir", province_id: 35 },
    { id: 29, name: "Menemen", province_id: 35 },
    { id: 30, name: "Torbalı", province_id: 35 },
  ],
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [step, setStep] = useState<"city" | "district" | "address">("city")
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([])
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [address, setAddress] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)

  // Parse existing value if any
  useEffect(() => {
    if (value) {
      const parts = value.split(", ")
      if (parts.length >= 3) {
        // Format: "İl, İlçe, Adres"
        const cityName = parts[0]
        const districtName = parts[1]
        const addressText = parts.slice(2).join(", ")

        setAddress(addressText)

        // Find city and district in our lists
        const city = cities.find((c) => c.name === cityName)
        if (city) {
          setSelectedCity(city)
          setStep("district")

          // Load districts for this city
          fetchDistricts(city.id).then(() => {
            const district = districts.find((d) => d.name === districtName)
            if (district) {
              setSelectedDistrict(district)
              setStep("address")
            }
          })
        }
      }
    }
  }, [value, cities, districts])

  // Fetch cities on component mount
  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    if (useFallback) {
      setCities(FALLBACK_CITIES)
      setFilteredCities(FALLBACK_CITIES)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(PROVINCES_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      if (data && data.data && Array.isArray(data.data)) {
        setCities(data.data)
        setFilteredCities(data.data)
      } else {
        throw new Error("Invalid API response format")
      }
    } catch (err) {
      console.error("Error fetching cities:", err)
      setError("Şehirler yüklenirken bir hata oluştu. Varsayılan şehir listesi kullanılıyor.")
      setUseFallback(true)
      setCities(FALLBACK_CITIES)
      setFilteredCities(FALLBACK_CITIES)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch districts for a city
  const fetchDistricts = async (cityId: number) => {
    if (useFallback) {
      const fallbackDistrictsForCity = FALLBACK_DISTRICTS[cityId] || []
      setDistricts(fallbackDistrictsForCity)
      setFilteredDistricts(fallbackDistrictsForCity)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // Using the correct parameter name 'provinceId' instead of 'province'
      const response = await fetch(`${DISTRICTS_API_URL}?provinceId=${cityId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      if (data && data.data && Array.isArray(data.data)) {
        setDistricts(data.data)
        setFilteredDistricts(data.data)
      } else {
        throw new Error("Invalid API response format")
      }
    } catch (err) {
      console.error("Error fetching districts:", err)
      setError("İlçeler yüklenirken bir hata oluştu. Varsayılan ilçe listesi kullanılıyor.")

      // Use fallback districts if available, otherwise empty array
      const fallbackDistrictsForCity = FALLBACK_DISTRICTS[cityId] || []
      setDistricts(fallbackDistrictsForCity)
      setFilteredDistricts(fallbackDistrictsForCity)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (step === "city") {
      const filtered = cities.filter((city) => city.name.toLowerCase().includes(value.toLowerCase()))
      setFilteredCities(filtered)
    } else if (step === "district") {
      const filtered = districts.filter((district) => district.name.toLowerCase().includes(value.toLowerCase()))
      setFilteredDistricts(filtered)
    }
  }

  // Handle city selection
  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    setSearchTerm("")
    setStep("district")
    fetchDistricts(city.id)
  }

  // Handle district selection
  const handleDistrictSelect = (district: District) => {
    setSelectedDistrict(district)
    setSearchTerm("")
    setStep("address")
  }

  // Handle address input
  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddress(e.target.value)
    updateFullLocation(selectedCity?.name, selectedDistrict?.name, e.target.value)
  }

  // Update the full location string
  const updateFullLocation = (city?: string, district?: string, addressText?: string) => {
    if (!city) return

    let fullLocation = city
    if (district) fullLocation += `, ${district}`
    if (addressText) fullLocation += `, ${addressText}`

    onChange(fullLocation)
  }

  // Go back to previous step
  const handleBack = () => {
    if (step === "district") {
      setStep("city")
      setSelectedCity(null)
      setSearchTerm("")
    } else if (step === "address") {
      setStep("district")
      setSelectedDistrict(null)
      setSearchTerm("")
    }
  }

  // Retry fetching data
  const handleRetry = () => {
    setUseFallback(false)
    if (step === "city") {
      fetchCities()
    } else if (step === "district" && selectedCity) {
      fetchDistricts(selectedCity.id)
    }
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="location">Konum</Label>

      {/* Step indicator */}
      <div className="flex items-center text-sm text-muted-foreground mb-2">
        <span className={step === "city" ? "font-medium text-primary" : ""}>Şehir</span>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className={step === "district" ? "font-medium text-primary" : ""}>İlçe</span>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className={step === "address" ? "font-medium text-primary" : ""}>Adres</span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-2 flex justify-between items-center">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2">
            Tekrar Dene
          </Button>
        </div>
      )}

      {/* City selection step */}
      {step === "city" && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              {isLoading && (
                <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Input placeholder="Şehir ara..." value={searchTerm} onChange={handleSearchChange} className="pl-8" />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <Button
                    key={city.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleCitySelect(city)}
                  >
                    {city.name}
                  </Button>
                ))
              ) : (
                <div className="text-center py-2 text-muted-foreground">
                  {searchTerm ? "Sonuç bulunamadı" : "Şehir listesi yüklenemedi"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* District selection step */}
      {step === "district" && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{selectedCity?.name}</div>
              <Button variant="ghost" size="sm" onClick={handleBack}>
                Şehir Değiştir
              </Button>
            </div>

            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              {isLoading && (
                <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Input placeholder="İlçe ara..." value={searchTerm} onChange={handleSearchChange} className="pl-8" />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredDistricts.length > 0 ? (
                filteredDistricts.map((district) => (
                  <Button
                    key={district.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleDistrictSelect(district)}
                  >
                    {district.name}
                  </Button>
                ))
              ) : (
                <div className="text-center py-2 text-muted-foreground">
                  {searchTerm ? "Sonuç bulunamadı" : "İlçe listesi yüklenemedi"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address input step */}
      {step === "address" && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {selectedCity?.name}, {selectedDistrict?.name}
              </div>
              <Button variant="ghost" size="sm" onClick={handleBack}>
                İlçe Değiştir
              </Button>
            </div>

            <div>
              <Label htmlFor="address">Açık Adres</Label>
              <Textarea
                id="address"
                placeholder="Mahalle, sokak, bina no, daire no gibi detayları girin"
                value={address}
                onChange={handleAddressChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LocationSelector
