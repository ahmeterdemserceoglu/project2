"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createNotification } from "@/lib/notifications"
import { CheckCircle, XCircle, MessageSquare, AlertCircle, ArrowLeft, Eye, Trash2, Package } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { logger } from "@/lib/logger"

export default function ReportDetailPage({ params }) {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [report, setReport] = useState(null)
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin && !loading) {
      logger.warn("Unauthorized access attempt to report detail page", {
        userId: user?.uid,
        reportId: params.id,
      })
      router.push("/")
      return
    }

    const fetchReportData = async () => {
      try {
        logger.info("Fetching report data", { reportId: params.id })
        const reportRef = doc(db, "reports", params.id)
        const reportSnap = await getDoc(reportRef)

        if (reportSnap.exists()) {
          const reportData = {
            id: reportSnap.id,
            ...reportSnap.data(),
          }
          setReport(reportData)

          // Fetch item data if available
          if (reportData.itemId) {
            const itemRef = doc(db, "items", reportData.itemId)
            const itemSnap = await getDoc(itemRef)
            if (itemSnap.exists()) {
              setItem({
                id: itemSnap.id,
                ...itemSnap.data(),
              })
            }
          }

          logger.info("Report data fetched successfully", { reportId: params.id })
        } else {
          logger.warn("Report not found", { reportId: params.id })
          router.push("/admin/reports")
        }
      } catch (error) {
        logger.error("Error fetching report data:", error, { reportId: params.id })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchReportData()
    }
  }, [isAdmin, params.id, router, user])

  const handleResolveReport = async () => {
    try {
      logger.info("Resolving report", { reportId: params.id })
      const reportRef = doc(db, "reports", params.id)
      await updateDoc(reportRef, {
        status: "resolved",
        adminReviewed: true,
        resolvedBy: user?.uid,
        resolvedAt: new Date(),
      })

      // Update local state
      setReport({
        ...report,
        status: "resolved",
        adminReviewed: true,
        resolvedBy: user?.uid,
        resolvedAt: new Date(),
      })

      // Send notification to reporter
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

      logger.info("Report resolved successfully", { reportId: params.id })
    } catch (error) {
      logger.error("Error resolving report:", error, { reportId: params.id })
    }
  }

  const handleDismissReport = async () => {
    try {
      logger.info("Dismissing report", { reportId: params.id })
      const reportRef = doc(db, "reports", params.id)
      await updateDoc(reportRef, {
        status: "dismissed",
        adminReviewed: true,
        resolvedBy: user?.uid,
        resolvedAt: new Date(),
      })

      // Update local state
      setReport({
        ...report,
        status: "dismissed",
        adminReviewed: true,
        resolvedBy: user?.uid,
        resolvedAt: new Date(),
      })

      // Send notification to reporter
      await createNotification({
        userId: report.reporterId,
        title: "Raporunuz İncelendi",
        message: `"${report.itemTitle || "İçerik"}" hakkındaki raporunuz incelendi fakat herhangi bir işlem yapılmadı.`,
        type: "system",
        link: `/items/${report.itemId}`,
      })

      logger.info("Report dismissed successfully", { reportId: params.id })
    } catch (error) {
      logger.error("Error dismissing report:", error, { reportId: params.id })
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Belirtilmemiş"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return format(date, "PPP", { locale: tr })
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

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Rapor bulunamadı</p>
            <p className="text-muted-foreground text-center mb-4">
              İstediğiniz rapor bulunamadı veya erişim izniniz yok.
            </p>
            <Button variant="outline" onClick={() => router.push("/admin/reports")}>
              Raporlar Sayfasına Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.push("/admin/reports")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Rapor Detayı</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{report.itemTitle || "İçerik Raporu"}</CardTitle>
                  <CardDescription>Rapor ID: {report.id}</CardDescription>
                </div>
                {getStatusBadge(report.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Raporlayan</h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{report.reporterName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{report.reporterName}</p>
                      <p className="text-xs text-muted-foreground">ID: {report.reporterId}</p>
                    </div>
                  </div>
                </div>

                {report.reportedUserId && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Raporlanan</h3>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{report.reportedUserName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{report.reportedUserName || "Bilinmiyor"}</p>
                        <p className="text-xs text-muted-foreground">ID: {report.reportedUserId}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Rapor Sebebi</h3>
                <p>{report.reason}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Açıklama</h3>
                <p className="text-muted-foreground">{report.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Rapor Tarihi</h3>
                  <p className="text-muted-foreground">{formatTimestamp(report.createdAt)}</p>
                </div>

                {report.resolvedAt && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Çözüm Tarihi</h3>
                    <p className="text-muted-foreground">{formatTimestamp(report.resolvedAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/admin/reports")}>
                Geri Dön
              </Button>
              <div className="flex gap-2">
                {(report.status === "active" || report.status === "pending") && (
                  <>
                    <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleResolveReport}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Çözüldü Olarak İşaretle
                    </Button>
                    <Button variant="destructive" onClick={handleDismissReport}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reddet
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => router.push(`/admin/chat/${report.reporterId}`)}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Raporlayana Mesaj Gönder
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          {item && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Raporlanan Ürün</CardTitle>
                <CardDescription>Ürün ID: {item.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.imageUrl && (
                  <div className="relative w-full h-48 rounded-md overflow-hidden">
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex items-center gap-2">
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
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/items/${item.id}`)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ürünü Görüntüle
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/admin/users/${report.reporterId}`)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                </svg>
                Raporlayanın Profilini Görüntüle
              </Button>

              {report.reportedUserId && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/admin/users/${report.reportedUserId}`)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                    <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
                  </svg>
                  Raporlananın Profilini Görüntüle
                </Button>
              )}

              {report.itemId && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/admin/products/${report.itemId}`)}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Ürün Detaylarını Görüntüle
                </Button>
              )}

              {report.status === "active" && (
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Ürünü Kaldır
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
