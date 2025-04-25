"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { logger } from "@/lib/logger"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { CheckCircle, XCircle, AlertCircle, Search, RotateCcw } from "lucide-react"
import type { ReturnRequest } from "@/lib/types"

export default function AdminReturnsPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      logger.warn("Non-admin user attempted to access admin returns page", { userId: user?.uid })
      router.push("/")
      return
    }

    const fetchReturnRequests = async () => {
      try {
        logger.info("Fetching return requests")

        const returnRequestsQuery = query(collection(db, "returnRequests"), orderBy("createdAt", "desc"))

        const returnRequestsSnapshot = await getDocs(returnRequestsQuery)
        const returnRequestsData = returnRequestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ReturnRequest[]

        setReturnRequests(returnRequestsData)
        setFilteredRequests(returnRequestsData)
        logger.info("Return requests fetched successfully", { count: returnRequestsData.length })
      } catch (error) {
        logger.error("Error fetching return requests", { error })
      } finally {
        setLoading(false)
      }
    }

    fetchReturnRequests()
  }, [isAdmin, router, user])

  useEffect(() => {
    // Apply filters
    let filtered = returnRequests

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter)
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (request) =>
          request.itemTitle.toLowerCase().includes(term) ||
          request.requesterName.toLowerCase().includes(term) ||
          (request.ownerName && request.ownerName.toLowerCase().includes(term)),
      )
    }

    setFilteredRequests(filtered)
  }, [returnRequests, statusFilter, searchTerm])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Bekliyor
          </Badge>
        )
      case "accepted":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Onaylandı
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500">
            <XCircle className="h-3 w-3 mr-1" />
            Reddedildi
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-blue-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Tamamlandı
          </Badge>
        )
      default:
        return <Badge className="bg-gray-500">Bilinmiyor</Badge>
    }
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Belirtilmemiş"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return format(date, "PPP", { locale: tr })
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">İade Talepleri</h1>
        <p className="text-muted-foreground">Kullanıcıların iade taleplerini yönetin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="İade talebi ara..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Tüm Durumlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="pending">Bekleyen</SelectItem>
            <SelectItem value="accepted">Onaylanan</SelectItem>
            <SelectItem value="rejected">Reddedilen</SelectItem>
            <SelectItem value="completed">Tamamlanan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İade Talepleri</CardTitle>
          <CardDescription>
            Toplam {filteredRequests.length} iade talebi {statusFilter !== "all" ? `(${statusFilter} durumunda)` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Eşya</TableHead>
                    <TableHead>İade Eden</TableHead>
                    <TableHead>Eşya Sahibi</TableHead>
                    <TableHead>İade Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Oluşturulma</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.itemTitle}</TableCell>
                      <TableCell>{request.requesterName}</TableCell>
                      <TableCell>{request.ownerName || "Bilinmiyor"}</TableCell>
                      <TableCell>{formatTimestamp(request.returnDate)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{formatTimestamp(request.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/returns/${request.id}`)}>
                          Detaylar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={RotateCcw}
              title="İade talebi bulunamadı"
              description={
                searchTerm || statusFilter !== "all"
                  ? "Arama kriterlerinize uygun iade talebi bulunamadı. Filtreleri değiştirmeyi deneyin."
                  : "Henüz hiç iade talebi oluşturulmamış."
              }
              actionLabel={searchTerm || statusFilter !== "all" ? "Filtreleri Temizle" : undefined}
              actionLink={searchTerm || statusFilter !== "all" ? handleClearFilters : undefined}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
