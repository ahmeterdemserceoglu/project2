"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { NotificationsDropdown } from "./notifications-dropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import {
  Home,
  Package,
  Heart,
  MessageSquare,
  User,
  LogOut,
  Menu,
  Settings,
  PlusCircle,
  Bell,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { logger } from "@/lib/logger"

export default function Header() {
  const { user, signOut, isAdmin } = useAuth()
  const pathname = usePathname()
  const [pendingRequests, setPendingRequests] = useState(0)
  const [pendingReturns, setPendingReturns] = useState(0)
  const [hasPendingRequests, setHasPendingRequests] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      const fetchPendingCounts = async () => {
        try {
          // Fetch pending requests count
          const requestsQuery = query(collection(db, "requests"), where("status", "==", "pending"))
          const requestsSnapshot = await getDocs(requestsQuery)
          setPendingRequests(requestsSnapshot.size)

          // Fetch pending returns count
          const returnsQuery = query(collection(db, "returnRequests"), where("status", "==", "pending"))
          const returnsSnapshot = await getDocs(returnsQuery)
          setPendingReturns(returnsSnapshot.size)
        } catch (error) {
          logger.error("Error fetching pending counts for header", { error })
        }
      }

      fetchPendingCounts()
    }
  }, [isAdmin])

  // Fetch pending requests for the current user
  useEffect(() => {
    if (user) {
      const fetchUserPendingRequests = async () => {
        try {
          // Fetch requests where the current user is the owner and status is pending
          const requestsQuery = query(
            collection(db, "requests"),
            where("ownerId", "==", user.uid),
            where("status", "==", "pending"),
          )
          const requestsSnapshot = await getDocs(requestsQuery)

          // Set the notification indicator if there are pending requests
          setHasPendingRequests(requestsSnapshot.size > 0)
        } catch (error) {
          console.error("Error fetching user pending requests:", error)
        }
      }

      fetchUserPendingRequests()

      // Set up an interval to check for new requests every minute
      const intervalId = setInterval(fetchUserPendingRequests, 60000)

      return () => clearInterval(intervalId)
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  // Reset notification when visiting the dashboard
  useEffect(() => {
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard?")) {
      setHasPendingRequests(false)
    }
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <span className="text-xl font-bold hidden md:inline-block">Anında Ortak Yaşam</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Ana Sayfa
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
                    pathname.startsWith("/items") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Eşyalar
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/items">Tüm Eşyalar</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/items/new">Eşya Ekle</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites">Favoriler</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/how-it-works"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/how-it-works") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Nasıl Çalışır
            </Link>

            {user && (
              <>
                <Link
                  href="/messages"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname.startsWith("/messages") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Mesajlar
                </Link>

                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
                          pathname.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        Panelim
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Genel Bakış</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard?tab=requests" className="w-full">
                          İstekler
                          {hasPendingRequests && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block" />}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profilim</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">Ayarlar</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {hasPendingRequests && <span className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />}
                </div>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/items/new">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Eşya Ekle
                  </Link>
                </Button>
                <NotificationsDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {user.displayName || "Profil"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="h-4 w-4 mr-2" />
                        <span>Profil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <div className="flex w-full relative">
                        <Link href="/dashboard" className="flex w-full">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          <span>Panelim</span>
                        </Link>
                        {hasPendingRequests && (
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span>Mesajlar</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites">
                        <Heart className="h-4 w-4 mr-2" />
                        <span>Favoriler</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        <span>Ayarlar</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <ShieldAlert className="h-4 w-4 mr-2" />
                            <span>Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Çıkış Yap</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Anında Ortak Yaşam</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-6">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className={`flex items-center gap-2 px-2 py-1 rounded-md ${isActive("/") ? "bg-muted" : ""}`}
                      >
                        <Home className="h-5 w-5" />
                        Ana Sayfa
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/items"
                        className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                          pathname.startsWith("/items") ? "bg-muted" : ""
                        }`}
                      >
                        <Package className="h-5 w-5" />
                        Eşyalar
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/items/new"
                        className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                          isActive("/items/new") ? "bg-muted" : ""
                        }`}
                      >
                        <PlusCircle className="h-5 w-5" />
                        Eşya Ekle
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/favorites"
                        className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                          isActive("/favorites") ? "bg-muted" : ""
                        }`}
                      >
                        <Heart className="h-5 w-5" />
                        Favoriler
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/messages"
                        className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                          pathname.startsWith("/messages") ? "bg-muted" : ""
                        }`}
                      >
                        <MessageSquare className="h-5 w-5" />
                        Mesajlar
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <div className="relative">
                        <Link
                          href="/dashboard?tab=requests"
                          className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                            isActive("/dashboard") ? "bg-muted" : ""
                          }`}
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          Panelim
                        </Link>
                        {hasPendingRequests && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </div>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/notifications"
                        className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                          isActive("/notifications") ? "bg-muted" : ""
                        }`}
                      >
                        <Bell className="h-5 w-5" />
                        Bildirimler
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/settings"
                        className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                          isActive("/settings") ? "bg-muted" : ""
                        }`}
                      >
                        <Settings className="h-5 w-5" />
                        Ayarlar
                      </Link>
                    </SheetClose>
                    {isAdmin && (
                      <>
                        <div className="h-px bg-border my-2" />
                        <SheetClose asChild>
                          <Link
                            href="/admin"
                            className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                              pathname.startsWith("/admin") ? "bg-muted" : ""
                            }`}
                          >
                            <ShieldAlert className="h-5 w-5" />
                            Admin Panel
                          </Link>
                        </SheetClose>
                      </>
                    )}
                    <div className="h-px bg-border my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-2 py-1 rounded-md text-red-500 hover:bg-red-500/10"
                    >
                      <LogOut className="h-5 w-5" />
                      Çıkış Yap
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Giriş Yap</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register">Kayıt Ol</Link>
                </Button>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Anında Ortak Yaşam</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-6">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className={`flex items-center gap-2 px-2 py-1 rounded-md ${isActive("/") ? "bg-muted" : ""}`}
                      >
                        <Home className="h-5 w-5" />
                        Ana Sayfa
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/items"
                        className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                          pathname.startsWith("/items") ? "bg-muted" : ""
                        }`}
                      >
                        <Package className="h-5 w-5" />
                        Eşyalar
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/how-it-works"
                        className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                          isActive("/how-it-works") ? "bg-muted" : ""
                        }`}
                      >
                        <Package className="h-5 w-5" />
                        Nasıl Çalışır
                      </Link>
                    </SheetClose>
                    <div className="h-px bg-border my-2" />
                    <SheetClose asChild>
                      <Link href="/auth/login" className="flex items-center gap-2 px-2 py-1 rounded-md">
                        <User className="h-5 w-5" />
                        Giriş Yap
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/auth/register"
                        className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary text-primary-foreground"
                      >
                        <User className="h-5 w-5" />
                        Kayıt Ol
                      </Link>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
