"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"
import { Search, Ban, Eye, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface User {
  uid: string
  email: string
  displayName: string
  role: "user" | "admin"
  createdAt: string
  isBanned?: boolean
  banReason?: string
}

export default function AdminUsersPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
    }
  }, [isAdmin, router])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)

        // Create base query
        const usersRef = collection(db, "users")
        const q = query(usersRef, orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const usersData = querySnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as User[]

        setUsers(usersData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching users:", error)
        setLoading(false)
      }
    }

    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled in the filtered arrays below
  }

  const handleBanUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isBanned: true,
        banReason: "Admin tarafından yasaklandı",
      })

      // Update local state
      setUsers(
        users.map((user) =>
          user.uid === userId ? { ...user, isBanned: true, banReason: "Admin tarafından yasaklandı" } : user,
        ),
      )

      toast({
        title: "Kullanıcı yasaklandı",
        description: "Kullanıcı başarıyla yasaklandı ve artık platforma erişemeyecek.",
      })
    } catch (error) {
      console.error("Error banning user:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanıcı yasaklanırken bir hata oluştu.",
      })
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isBanned: false,
        banReason: "",
      })

      // Update local state
      setUsers(users.map((user) => (user.uid === userId ? { ...user, isBanned: false, banReason: "" } : user)))

      toast({
        title: "Kullanıcı yasağı kaldırıldı",
        description: "Kullanıcının yasağı başarıyla kaldırıldı ve artık platforma erişebilecek.",
      })
    } catch (error) {
      console.error("Error unbanning user:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanıcı yasağı kaldırılırken bir hata oluştu.",
      })
    }
  }

  // Filter based on search term and filters
  const filteredUsers = users.filter((user) => {
    // Search term filter
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())

    // Role filter
    const matchesRole = filterRole === "all" || user.role === filterRole

    // Status filter
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "banned" && user.isBanned === true) ||
      (filterStatus === "active" && user.isBanned !== true)

    return matchesSearch && matchesRole && matchesStatus
  })

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
        <Button asChild variant="outline">
          <Link href="/admin">Admin Paneline Dön</Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Ad, soyad veya e-posta ara..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        <div className="flex gap-2">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rol Filtresi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Roller</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">Kullanıcı</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum Filtresi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="banned">Yasaklı</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((userData) => (
                <TableRow key={userData.uid}>
                  <TableCell className="font-medium">{userData.displayName}</TableCell>
                  <TableCell>{userData.email}</TableCell>
                  <TableCell>
                    <Badge className={userData.role === "admin" ? "bg-purple-500" : "bg-blue-500"}>
                      {userData.role === "admin" ? "Admin" : "Kullanıcı"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={userData.isBanned ? "bg-red-500" : "bg-green-500"}>
                      {userData.isBanned ? "Yasaklı" : "Aktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString("tr-TR") : "Belirtilmemiş"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/users/${userData.uid}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      {userData.uid !== user?.uid &&
                        (userData.isBanned ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50"
                            onClick={() => handleUnbanUser(userData.uid)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Ban className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Kullanıcıyı yasaklamak istediğinize emin misiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu işlem kullanıcının platforma erişimini engelleyecektir.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleBanUser(userData.uid)}>
                                  Yasakla
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Kullanıcı bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
