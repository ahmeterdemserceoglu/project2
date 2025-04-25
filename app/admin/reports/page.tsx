"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, orderBy, getDocs, doc, updateDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createNotification } from "@/lib/notifications"
import { CheckCircle, XCircle, MessageSquare, AlertCircle, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { logger } from "@/lib/logger"

export default function AdminReportsPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin && !loading) {
      logger.warn("Unauthorized access attempt to admin reports page", { userId: user?.uid })
      router.push("/")
      return
    }

    const fetchReports = async () => {
      try {
        logger.info("Fetching reports data", { userId: user?.uid })
        const reportsQuery = query(collection(db, "reports"), orderBy("createdAt", "desc"))
        const reportsSnapshot = await getDocs(reportsQuery)

        const reportsData = await Promise.all(
          reportsSnapshot.docs.map(async (docSnapshot) => {
            const report = {
              id: docSnapshot.id,
              ...docSnapshot.data(),
            }

            // Get item details if needed
            if (report.itemId) {
              const itemDoc = await getDocs(query(collection(db, "items"), where("id", "==", report.itemId)))
              if (!itemDoc.empty) {
                report.itemDetails = itemDoc.docs[0].data()
              }
            }

            return report
          }),
        )

        setReports(reportsData)
        logger.info("Reports data fetched successfully", { count: reportsData.length })
      } catch (error) {
        logger.error("Error fetching reports:", error, { userId: user?.uid })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchReports()
    }
  }, [isAdmin, router, user])

  const handleResolveReport = async (reportId) => {
    try {
      logger.info("Resolving report", { reportId })
      const reportRef = doc(db, "reports", reportId)
      await updateDoc(reportRef, {
        status: "resolved",
        adminReviewed: true,
        resolvedBy: user?.uid,
        resolvedAt: new Date(),
      })

      // Update local state
      setReports(
        reports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: "resolved",
                adminReviewed: true,
                resolvedBy: user?.uid,
                resolvedAt: new Date(),
              }
            : report,
        ),
      )

      // Send notification to reporter
      const report = reports.find((r) => r.id === reportId)
      if (report) {
        await createNotification({
          userId: report.reporterId,
          title: "Raporunuz İncelendi",
          message: `"${report.itemTitle || "İçerik"}" hakkındaki raporunuz incelendi ve çözüldü.`,
          type: "system",
          link: `/items/${report.itemId}`,
        })

        // Send notification to reported user if applicable
        if (report.reportedUserId) {
          await createNotification({
            userId: report.reportedUserId,
            title: "Hakkınızda Rapor Çözüldü",
            message: `Hakkınızda yapılan bir rapor yönetici tarafından incelendi ve çözüldü.`,
            type: "system",
            link: `/items/${report.itemId}`,
          })
        }
      }

      logger.info("Report resolved successfully", { reportId })
    } catch (error) {
      logger.error("Error resolving report:", error, { reportId })
    }
  }

  const handleDismissReport = async (reportId) => {
    try {
      logger.info("Dismissing report", { reportId })
      const reportRef = doc(db, "reports", reportId)
      await updateDoc(reportRef, {
        status: "dismissed",
        adminReviewed: true,
        resolvedBy: user?.uid,
        resolvedAt: new Date(),
      })

      // Update local state
      setReports(
        reports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: "dismissed",
                adminReviewed: true,
                resolvedBy: user?.uid,
                resolvedAt: new Date(),
              }
            : report,
        ),
      )

      // Send notification to reporter
      const report = reports.find((r) => r.id === reportId)
      if (report) {
        await createNotification({
          userId: report.reporterId,
          title: "Raporunuz İncelendi",
          message: `"${report.itemTitle || "İçerik"}" hakkındaki raporunuz incelendi fakat herhangi bir işlem yapılmadı.`,
          type: "system",
          link: `/items/${report.itemId}`,
        })
      }

      logger.info("Report dismissed successfully", { reportId })
    } catch (error) {
      logger.error("Error dismissing report:", error, { reportId })
    }
  }

  const getFilteredReports = () => {
    switch (activeTab) {
      case "active":
        return reports.filter((report) => report.status === "active" || report.status === "pending")
      case "resolved":
        return reports.filter((report) => report.status === "resolved")
      case "dismissed":
        return reports.filter((report) => report.status === "dismissed")
      default:
        return reports
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Aktif
          </Badge>
        )
      case "resolved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Çözüldü
          </Badge>
        )
      case "dismissed":
        return (
          <Badge className="bg-gray-500">
            <XCircle className="h-3 w-3 mr-1" />
            Reddedildi
          </Badge>
        )
      default:
        return <Badge className="bg-gray-500">Bilinmiyor</Badge>
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Belirtilmemiş"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return format(date, "PPP", { locale: tr })
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Raporlar Yönetimi</h1>
          <p className="text-muted-foreground">Kullanıcıların raporlarını inceleyip yönetin</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Admin Paneline Dön
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="active">Aktif</TabsTrigger>
            <TabsTrigger value="resolved">Çözülenler</TabsTrigger>
            <TabsTrigger value="dismissed">Reddedilenler</TabsTrigger>
          </TabsList>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrele
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sıralama</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>En Yeniler</DropdownMenuItem>
              <DropdownMenuItem>En Eskiler</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Rapor Türü</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Tüm Türler</DropdownMenuItem>
              <DropdownMenuItem>Ürün Raporları</DropdownMenuItem>
              <DropdownMenuItem>Kullanıcı Raporları</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TabsContent value="all" className="space-y-4">
          {renderReportsList(getFilteredReports())}
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          {renderReportsList(getFilteredReports())}
        </TabsContent>
        <TabsContent value="resolved" className="space-y-4">
          {renderReportsList(getFilteredReports())}
        </TabsContent>
        <TabsContent value="dismissed" className="space-y-4">
          {renderReportsList(getFilteredReports())}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderReportsList(reportsList) {
    if (reportsList.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Rapor bulunamadı</p>
            <p className="text-muted-foreground text-center">Bu kategoride henüz rapor bulunmamaktadır.</p>
          </CardContent>
        </Card>
      )
    }

    return reportsList.map((report) => (
      <Card key={report.id} className="overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => router.push(`/admin/reports/${report.id}`)}
                >
                  {report.itemTitle || "İçerik Raporu"}
                </span>
              </CardTitle>
              <CardDescription>Rapor ID: {report.id.substring(0, 8)}...</CardDescription>
            </div>
            {getStatusBadge(report.status)}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{report.reporterName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Raporlayan: {report.reporterName}</p>
                  <p className="text-xs text-muted-foreground">ID: {report.reporterId.substring(0, 8)}...</p>
                </div>
              </div>
            </div>
            {report.reportedUserId && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{report.reportedUserName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Raporlanan: {report.reportedUserName || "Bilinmiyor"}</p>
                    <p className="text-xs text-muted-foreground">ID: {report.reportedUserId.substring(0, 8)}...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Rapor Sebebi:</p>
              <p className="text-sm text-muted-foreground">{report.reason}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Açıklama:</p>
              <p className="text-sm text-muted-foreground">{report.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end mt-4">
            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/reports/${report.id}`)}>
              Detayları Görüntüle
            </Button>

            {(report.status === "active" || report.status === "pending") && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleResolveReport(report.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Çözüldü Olarak İşaretle
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDismissReport(report.id)}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Reddet
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/chat/${report.reporterId}`)}>
              <MessageSquare className="h-4 w-4 mr-1" />
              Raporlayana Mesaj Gönder
            </Button>
          </div>
        </CardContent>
      </Card>
    ))
  }
}
