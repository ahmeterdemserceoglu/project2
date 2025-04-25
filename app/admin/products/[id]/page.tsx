"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { doc, getDoc, updateDoc, deleteDoc, collection, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Trash2, Ban, ArrowLeft, User, Calendar, MapPin, Tag, AlertTriangle } from "lucide-react"
import { createNotification } from "@/lib/notifications"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ItemData {
  id: string
  title: string
  description: string
  category: string
  location: string
  duration: string
  conditions: string
  imageUrl: string
  userId: string
  userDisplayName: string
  createdAt: any
  status: string
  reportReason?: string
  reportedBy?: string
  reportedAt?: any
  approved?: boolean
  adminReviewed?: boolean
  [key: string]: any
}

interface UserData {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  isBanned?: boolean
  banReason?: string
  createdAt?: any
  [key: string]: any
}

interface ReportData {
  reporter: UserData
  reason: string
  date: any
}

export default function AdminProductDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const isRequest = searchParams.get("type") === "request"
  const [item, setItem] = useState<ItemData | null>(null)
  const [owner, setOwner] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reportDetails, setReportDetails] = useState<ReportData | null>(null)
  const [banReason, setBanReason] = useState("")
  const [warningMessage, setWarningMessage] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false)

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!loading && (!user || !user.isAdmin)) {
      router.push("/")
      return
    }

    const fetchItemDetails = async () => {
      try {
        const itemId = params.id as string
        const collectionName = isRequest ? "itemRequests" : "items"

        const itemDoc = await getDoc(doc(db, collectionName, itemId))

        if (itemDoc.exists()) {
          const itemData = { id: itemDoc.id, ...itemDoc.data() } as ItemData
          setItem(itemData)

          // Fetch owner details
          if (itemData.userId) {
            const ownerDoc = await getDoc(doc(db, "users", itemData.userId))
            if (ownerDoc.exists()) {
              setOwner({ uid: ownerDoc.id, ...ownerDoc.data() } as UserData)
            }
          }

          // Fetch report details if item is reported
          if (itemData.status === "reported" && itemData.reportedBy) {
            const reporterDoc = await getDoc(doc(db, "users", itemData.reportedBy))
            if (reporterDoc.exists()) {
              setReportDetails({
                reporter: { uid: reporterDoc.id, ...reporterDoc.data() } as UserData,
                reason: itemData.reportReason || "No reason provided",
                date: itemData.reportedAt,
              })
            }
          }
        } else {
          console.error("Item not found")
          toast({
            variant: "destructive",
            title: "Error",
            description: "Product not found",
          })
        }
      } catch (error) {
        console.error("Error fetching item details:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product details",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.isAdmin) {
      fetchItemDetails()
    }
  }, [user, loading, router, params.id, isRequest, toast])

  const handleApprove = async () => {
    if (!item) return

    try {
      const itemId = params.id as string

      if (isRequest) {
        // For item requests
        const itemRef = doc(db, "itemRequests", itemId)

        // Update request status
        await updateDoc(itemRef, {
          status: "approved",
          reviewedAt: new Date(),
          reviewedBy: user?.uid,
        })

        // Create new item in items collection
        const itemData = { ...item }
        delete itemData.id // Remove the id as it will be auto-generated

        const newItemRef = doc(collection(db, "items"))
        await setDoc(newItemRef, {
          ...itemData,
          id: newItemRef.id,
          status: "available",
          approved: true,
          adminReviewed: true,
          approvedAt: new Date(),
        })

        // Notify the owner
        if (item.userId) {
          await createNotification({
            userId: item.userId,
            title: "Ürün Onaylandı",
            message: `"${item.title}" adlı ürününüz onaylandı ve artık platformda görünür durumda.`,
            type: "system",
            link: `/items/${newItemRef.id}`,
          })
        }
      } else {
        // For existing items
        const itemRef = doc(db, "items", itemId)
        await updateDoc(itemRef, {
          approved: true,
          adminReviewed: true,
          reviewedAt: new Date(),
          reviewedBy: user?.uid,
        })

        // Notify the owner
        if (item.userId) {
          await createNotification({
            userId: item.userId,
            title: "Ürün Onaylandı",
            message: `"${item.title}" adlı ürününüz onaylandı ve artık platformda görünür durumda.`,
            type: "system",
            link: `/items/${itemId}`,
          })
        }
      }

      toast({
        title: "Success",
        description: "Product has been approved",
      })

      // Redirect to all products
      router.push("/admin/products")
    } catch (error) {
      console.error("Error approving item:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve product",
      })
    }
  }

  const handleReject = async () => {
    if (!item) return

    try {
      const itemId = params.id as string
      const collectionName = isRequest ? "itemRequests" : "items"
      const itemRef = doc(db, collectionName, itemId)

      await updateDoc(itemRef, {
        approved: false,
        adminReviewed: true,
        reviewedAt: new Date(),
        reviewedBy: user?.uid,
      })

      // Notify the owner
      if (item.userId) {
        await createNotification({
          userId: item.userId,
          title: "Ürün Reddedildi",
          message: `"${item.title}" adlı ürününüz platformumuzun kurallarına uymadığı için reddedildi.`,
          type: "system",
          link: isRequest ? "/items" : `/items/${itemId}`,
        })
      }

      toast({
        title: "Success",
        description: "Product has been rejected",
      })

      // Redirect to all products
      router.push("/admin/products")
    } catch (error) {
      console.error("Error rejecting item:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject product",
      })
    }
  }

  const handleDelete = async () => {
    if (!item) return

    try {
      const itemId = params.id as string
      const collectionName = isRequest ? "itemRequests" : "items"

      await deleteDoc(doc(db, collectionName, itemId))

      // Notify the owner
      if (item.userId) {
        await createNotification({
          userId: item.userId,
          title: "Ürün Silindi",
          message: `"${item.title}" adlı ürününüz platformdan kaldırıldı.`,
          type: "system",
          link: "/items",
        })
      }

      toast({
        title: "Success",
        description: "Product has been deleted",
      })

      // Redirect to all products
      router.push("/admin/products")
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product",
      })
    }
  }

  const handleBanUser = async () => {
    if (!owner || !owner.uid || !banReason) return

    try {
      const userRef = doc(db, "users", owner.uid)
      await updateDoc(userRef, {
        isBanned: true,
        banReason: banReason,
        bannedAt: new Date(),
        bannedBy: user?.uid,
      })

      // Notify the user
      await createNotification({
        userId: owner.uid,
        title: "Hesabınız Askıya Alındı",
        message: `Hesabınız şu sebeple askıya alındı: ${banReason}`,
        type: "system",
        link: "/settings",
      })

      toast({
        title: "Success",
        description: "User has been banned",
      })

      setIsDialogOpen(false)
      // Refresh owner data
      const ownerDoc = await getDoc(doc(db, "users", owner.uid))
      if (ownerDoc.exists()) {
        setOwner({ uid: ownerDoc.id, ...ownerDoc.data() } as UserData)
      }
    } catch (error) {
      console.error("Error banning user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to ban user",
      })
    }
  }

  const handleUnbanUser = async () => {
    if (!owner || !owner.uid) return

    try {
      const userRef = doc(db, "users", owner.uid)
      await updateDoc(userRef, {
        isBanned: false,
        banReason: null,
        unbannedAt: new Date(),
        unbannedBy: user?.uid,
      })

      // Notify the user
      await createNotification({
        userId: owner.uid,
        title: "Hesabınız Aktif",
        message: "Hesabınız tekrar aktif edildi.",
        type: "system",
        link: "/settings",
      })

      toast({
        title: "Success",
        description: "User has been unbanned",
      })

      // Refresh owner data
      const ownerDoc = await getDoc(doc(db, "users", owner.uid))
      if (ownerDoc.exists()) {
        setOwner({ uid: ownerDoc.id, ...ownerDoc.data() } as UserData)
      }
    } catch (error) {
      console.error("Error unbanning user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unban user",
      })
    }
  }

  const handleSendWarning = async () => {
    if (!owner || !owner.uid || !warningMessage) return

    try {
      // Create a warning document
      const warningRef = doc(collection(db, "warnings"))
      await setDoc(warningRef, {
        userId: owner.uid,
        message: warningMessage,
        createdAt: new Date(),
        createdBy: user?.uid,
        read: false,
      })

      // Notify the user
      await createNotification({
        userId: owner.uid,
        title: "Uyarı Mesajı",
        message: warningMessage,
        type: "warning",
        link: "/settings",
      })

      toast({
        title: "Success",
        description: "Warning has been sent to the user",
      })

      setIsWarningDialogOpen(false)
      setWarningMessage("")
    } catch (error) {
      console.error("Error sending warning:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send warning",
      })
    }
  }

  const dismissReport = async () => {
    if (!item) return

    try {
      const itemRef = doc(db, "items", item.id)
      await updateDoc(itemRef, {
        status: "available",
        reportReason: null,
        reportedBy: null,
        reportedAt: null,
      })

      toast({
        title: "Success",
        description: "Report has been dismissed",
      })

      // Update local state
      setItem({
        ...item,
        status: "available",
        reportReason: undefined,
        reportedBy: undefined,
        reportedAt: undefined,
      })
      setReportDetails(null)
    } catch (error) {
      console.error("Error dismissing report:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to dismiss report",
      })
    }
  }

  if (loading || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you are looking for does not exist or has been deleted.
          </p>
          <Button onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Button>
          <div className="flex items-center gap-2">
            <Badge
              className={
                item.status === "available" || item.status === "active"
                  ? "bg-green-500"
                  : item.status === "borrowed"
                    ? "bg-orange-500"
                    : item.status === "reported"
                      ? "bg-red-500"
                      : item.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
              }
            >
              {item.status === "available" || item.status === "active"
                ? "Active"
                : item.status === "borrowed"
                  ? "Borrowed"
                  : item.status === "reported"
                    ? "Reported"
                    : item.status === "pending"
                      ? "Pending"
                      : item.status}
            </Badge>
            {item.approved === true && <Badge className="bg-green-500">Approved</Badge>}
            {item.approved === false && <Badge className="bg-red-500">Rejected</Badge>}
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="owner">Owner Information</TabsTrigger>
            {reportDetails && <TabsTrigger value="report">Report Details</TabsTrigger>}
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>Product ID: {item.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.title}
                      className="rounded-lg max-h-96 object-contain mx-auto"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{item.category}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleString() : "Unknown"}
                      </span>
                    </div>
                  </div>

                  {item.duration && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Duration</h3>
                      <span>{item.duration}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm">{item.description}</p>
                </div>

                {item.conditions && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Conditions</h3>
                    <p className="text-sm">{item.conditions}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  {isRequest || item.approved === undefined ? (
                    <>
                      <Button onClick={handleApprove} className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                      </Button>
                      <Button variant="destructive" onClick={handleReject}>
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </>
                  ) : (
                    item.status === "reported" && (
                      <Button onClick={dismissReport} className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="mr-2 h-4 w-4" /> Dismiss Report
                      </Button>
                    )
                  )}
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Product
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the product and remove it from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="owner">
            <Card>
              <CardHeader>
                <CardTitle>Owner Information</CardTitle>
                <CardDescription>Details about the product owner</CardDescription>
              </CardHeader>
              <CardContent>
                {owner ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{owner.displayName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{owner.displayName}</h3>
                        <p className="text-sm text-muted-foreground">{owner.email}</p>
                      </div>
                      {owner.isBanned && (
                        <Badge variant="destructive" className="ml-auto">
                          Banned
                        </Badge>
                      )}
                    </div>

                    {owner.isBanned && owner.banReason && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <h4 className="text-sm font-medium text-red-800 mb-1">Ban Reason:</h4>
                        <p className="text-sm text-red-700">{owner.banReason}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">User ID</h4>
                        <p className="text-sm">{owner.uid}</p>
                      </div>
                      {owner.createdAt && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Joined</h4>
                          <p className="text-sm">
                            {owner.createdAt.toDate
                              ? new Date(owner.createdAt.toDate()).toLocaleDateString()
                              : "Unknown"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Owner information not available</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push(`/admin/users/${owner?.uid}`)}>
                  <User className="mr-2 h-4 w-4" /> View Full Profile
                </Button>

                <div className="flex gap-2">
                  <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-50">
                        <AlertTriangle className="mr-2 h-4 w-4" /> Send Warning
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Warning to User</DialogTitle>
                        <DialogDescription>
                          This warning will be sent to the user as a notification. They will be able to see it in their
                          account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="warning-message" className="mb-2 block">
                          Warning Message
                        </Label>
                        <Textarea
                          id="warning-message"
                          value={warningMessage}
                          onChange={(e) => setWarningMessage(e.target.value)}
                          placeholder="Enter your warning message here..."
                          className="min-h-[100px]"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsWarningDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSendWarning} disabled={!warningMessage}>
                          Send Warning
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {owner && !owner.isBanned ? (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <Ban className="mr-2 h-4 w-4" /> Ban User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ban User</DialogTitle>
                          <DialogDescription>
                            This will prevent the user from accessing the platform. They will be notified about this
                            action.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label htmlFor="ban-reason" className="mb-2 block">
                            Ban Reason
                          </Label>
                          <Textarea
                            id="ban-reason"
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            placeholder="Enter the reason for banning this user..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleBanUser} disabled={!banReason}>
                            Ban User
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    owner && (
                      <Button variant="outline" className="border-green-500 text-green-500" onClick={handleUnbanUser}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Unban User
                      </Button>
                    )
                  )}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {reportDetails && (
            <TabsContent value="report">
              <Card>
                <CardHeader>
                  <CardTitle>Report Details</CardTitle>
                  <CardDescription>Information about the report filed against this product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{reportDetails.reporter.displayName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Reported by: {reportDetails.reporter.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{reportDetails.reporter.email}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Report Reason</h3>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-700">{reportDetails.reason}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Report Date</h3>
                    <p className="text-sm">
                      {reportDetails.date?.toDate ? new Date(reportDetails.date.toDate()).toLocaleString() : "Unknown"}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={dismissReport} className="bg-green-500 hover:bg-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" /> Dismiss Report
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Product
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the product and remove it from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
