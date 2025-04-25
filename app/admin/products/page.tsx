"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { collection, query, getDocs, orderBy, doc, updateDoc, deleteDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { CheckCircle, XCircle, AlertCircle, Clock, Trash2, Eye } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export default function AdminProductsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState([])
  const [pendingItems, setPendingItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!loading && (!user || !user.isAdmin)) {
      router.push("/")
      return
    }

    const fetchItems = async () => {
      try {
        // Fetch all items
        const itemsQuery = query(collection(db, "items"), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(itemsQuery)
        const itemsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Fetch pending approval items
        const pendingQuery = query(
          collection(db, "itemRequests"),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc"),
        )

        const pendingSnapshot = await getDocs(pendingQuery)
        const pendingData = pendingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setItems(itemsData)
        setPendingItems(pendingData)
      } catch (error) {
        console.error("Error fetching items:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.isAdmin) {
      fetchItems()
    }
  }, [user, loading, router])

  const handleApprove = async (itemId) => {
    try {
      const itemRef = doc(db, "itemRequests", itemId)
      await updateDoc(itemRef, {
        status: "approved",
        reviewedAt: new Date(),
        reviewedBy: user.uid,
      })

      // Move to items collection
      const itemSnapshot = await getDocs(query(collection(db, "itemRequests"), where("id", "==", itemId)))
      if (!itemSnapshot.empty) {
        const itemData = itemSnapshot.docs[0].data()

        // Create new item in items collection
        const newItemRef = doc(collection(db, "items"))
        await updateDoc(newItemRef, {
          ...itemData,
          id: newItemRef.id,
          status: "active",
          approvedAt: new Date(),
        })

        // Update local state
        setPendingItems(pendingItems.filter((item) => item.id !== itemId))

        // Notify user
        // This would typically be done with a notification system
      }
    } catch (error) {
      console.error("Error approving item:", error)
    }
  }

  const handleReject = async (itemId) => {
    try {
      const itemRef = doc(db, "itemRequests", itemId)
      await updateDoc(itemRef, {
        status: "rejected",
        reviewedAt: new Date(),
        reviewedBy: user.uid,
      })

      // Update local state
      setPendingItems(pendingItems.filter((item) => item.id !== itemId))

      // Notify user
      // This would typically be done with a notification system
    } catch (error) {
      console.error("Error rejecting item:", error)
    }
  }

  const handleDelete = async (itemId) => {
    try {
      await deleteDoc(doc(db, "items", itemId))

      // Update local state
      setItems(items.filter((item) => item.id !== itemId))
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" /> Active
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "borrowed":
        return <Badge className="bg-blue-500">Borrowed</Badge>
      case "unavailable":
        return <Badge className="bg-gray-500">Unavailable</Badge>
      case "reported":
        return (
          <Badge className="bg-red-500">
            <AlertCircle className="h-3 w-3 mr-1" /> Reported
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading || (isLoading && user?.isAdmin)) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <EmptyState
          title="Access Denied"
          description="You don't have permission to access this page."
          action={<Button onClick={() => router.push("/")}>Go Home</Button>}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Products ({items.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approval ({pendingItems.length})
            {pendingItems.length > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {pendingItems.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reported">Reported</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {items.length === 0 ? (
            <EmptyState title="No products found" description="There are no products in the system yet." />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.ownerName || "Unknown"}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/products/${item.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the product and remove it
                                    from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingItems.length === 0 ? (
            <EmptyState title="No pending approvals" description="There are no products waiting for approval." />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.ownerName || "Unknown"}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/products/${item.id}?type=request`)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>

                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleApprove(item.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>

                            <Button variant="destructive" size="sm" onClick={() => handleReject(item.id)}>
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reported">
          <Card>
            <CardHeader>
              <CardTitle>Reported Products</CardTitle>
            </CardHeader>
            <CardContent>
              {items.filter((item) => item.status === "reported").length === 0 ? (
                <EmptyState title="No reported products" description="There are no products that have been reported." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reported Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items
                      .filter((item) => item.status === "reported")
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{item.ownerName || "Unknown"}</TableCell>
                          <TableCell>{item.reportedBy || "Unknown"}</TableCell>
                          <TableCell>{item.reportReason || "Not specified"}</TableCell>
                          <TableCell>
                            {item.reportedAt?.toDate
                              ? new Date(item.reportedAt.toDate()).toLocaleDateString()
                              : "Unknown"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/admin/products/${item.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button>

                              <Button
                                variant="default"
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => {
                                  // Handle dismiss report
                                  const itemRef = doc(db, "items", item.id)
                                  updateDoc(itemRef, {
                                    status: "active",
                                    reportReason: null,
                                    reportedBy: null,
                                    reportedAt: null,
                                  })

                                  // Update local state
                                  setItems(
                                    items.map((i) =>
                                      i.id === item.id
                                        ? {
                                            ...i,
                                            status: "active",
                                            reportReason: null,
                                            reportedBy: null,
                                            reportedAt: null,
                                          }
                                        : i,
                                    ),
                                  )
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Dismiss
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the product and remove
                                      it from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
