"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Inter } from 'next/font/google';
import { FaBox, FaLayerGroup, FaShoppingBag, FaUsers, FaBolt, FaCog, FaHome, FaChartBar, FaCalculator, FaFileInvoiceDollar, FaEnvelope } from "react-icons/fa";
import { Sparkles } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  // Check authentication and admin status
  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!isAuthenticated) {
      try {
        localStorage.setItem('login_redirect', '/admin');
      } catch {}
      router.push("/login?redirect=/admin");
      return;
    }

    // Only redirect if we're sure the user is not admin (not just loading)
    if (isAuthenticated && isAdmin === false) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  // Dashboard navigation
  const dashboardNavigation: NavItem[] = [
    {
      name: "Gösterge Paneli",
      href: "/admin",
      icon: <FaChartBar className="w-5 h-5" />,
    },
  ];

  // Contact/messages navigation
  const contactNavigation: NavItem[] = [
    {
      name: "Mesajlar",
      href: "/admin/contact-messages",
      icon: <FaEnvelope className="w-5 h-5" />,
    },
  ];

  // Product management navigation
  const productNavigation: NavItem[] = [
    {
      name: "Ürünler",
      href: "/admin/products",
      icon: <FaBox className="w-5 h-5" />,
    },
    {
      name: "Kategoriler",
      href: "/admin/categories",
      icon: <FaLayerGroup className="w-5 h-5" />,
    },
    {
      name: "Özel Koleksiyonlar",
      href: "/admin/special-collections",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      name: "Günün Fırsatları",
      href: "/admin/flash-deals",
      icon: <FaBolt className="w-5 h-5" />,
    }
  ];

  // Customer management navigation
  const customerNavigation: NavItem[] = [
    {
      name: "Siparişler",
      href: "/admin/orders",
      icon: <FaShoppingBag className="w-5 h-5" />,
    },
    {
      name: "Müşteriler",
      href: "/admin/customers",
      icon: <FaUsers className="w-5 h-5" />,
    },
  ];

  // Helper function to get main site URL
  const getMainSiteUrl = () => {
    // Artık subdomain kullanmıyoruz, doğrudan anasayfaya yönlendir
    return '/';
  };

  // Additional admin sections
  const siteNavigation: NavItem[] = [
    {
      name: "Muhasebe",
      href: "/admin/accounting",
      icon: <FaCalculator className="w-5 h-5" />,
    },
    {
      name: "Vergi Raporları",
      href: "/admin/accounting/tax-reports",
      icon: <FaFileInvoiceDollar className="w-5 h-5" />,
    },
    {
      name: "Finansal Gösterge",
      href: "/admin/dashboard/financial",
      icon: <FaChartBar className="w-5 h-5" />,
    },
    {
      name: "Site Ayarları",
      href: "/admin/settings",
      icon: <FaCog className="w-5 h-5" />,
    },
  ];
  
  // Separate navigation for external links
  const externalNavigation: NavItem[] = [
    {
      name: "Anasayfa'ya Dön",
      href: getMainSiteUrl(),
      icon: <FaHome className="w-5 h-5" />,
    },
  ];

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show loading if not authenticated or admin status is unknown
  if (!isAuthenticated || isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show access denied only if we're sure user is not admin
  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erişim Reddedildi</h1>
          <p className="mb-6 text-gray-600">Admin alanına erişim izniniz bulunmamaktadır.</p>
          <Link href="/" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            Anasayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-screen bg-gray-50 text-gray-800">
      <div className="h-full flex">
        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <Link href="/admin" className="flex items-center">
                <span className="text-lg font-bold text-indigo-600">Yönetim Paneli</span>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 overflow-y-auto">
              <div className="space-y-1">
                {dashboardNavigation.map((item) => {
                  const isActive = pathname && pathname === item.href || pathname && pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                        }`}
                    >
                      <div className={`mr-3 ${isActive ? "text-indigo-700" : "text-gray-500 group-hover:text-indigo-600"}`}>
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ürün Yönetimi
                </h3>
                <div className="mt-2 space-y-1">
                  {productNavigation.map((item) => {
                    const isActive = pathname && pathname === item.href || pathname && pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                          }`}
                      >
                        <div className={`mr-3 ${isActive ? "text-indigo-700" : "text-gray-500 group-hover:text-indigo-600"}`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Müşteri Yönetimi
                </h3>
                <div className="mt-2 space-y-1">
                  {customerNavigation.map((item) => {
                    const isActive = pathname && pathname === item.href || pathname && pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                          }`}
                      >
                        <div className={`mr-3 ${isActive ? "text-indigo-700" : "text-gray-500 group-hover:text-indigo-600"}`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  İletişim
                </h3>
                <div className="mt-2 space-y-1">
                  {contactNavigation.map((item) => {
                    const isActive = pathname && pathname === item.href || pathname && pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                          }`}
                      >
                        <div className={`mr-3 ${isActive ? "text-indigo-700" : "text-gray-500 group-hover:text-indigo-600"}`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Site Yönetimi
                </h3>
                <div className="mt-2 space-y-1">
                  {siteNavigation.map((item) => {
                    const isActive = pathname && pathname === item.href || pathname && pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                          }`}
                      >
                        <div className={`mr-3 ${isActive ? "text-indigo-700" : "text-gray-500 group-hover:text-indigo-600"}`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dış Bağlantılar
                </h3>
                <div className="mt-2 space-y-1">
                  {externalNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                    >
                      <div className="mr-3 text-gray-500 group-hover:text-indigo-600">
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col md:pl-64">
          {/* Mobile menu toggle - top bar */}
          <div className="sticky top-0 z-10 flex items-center md:hidden h-16 bg-white border-b border-gray-200 px-4 shadow-sm">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <span className="sr-only">Menüyü aç</span>
            </button>
            <div className="ml-4 text-lg font-semibold text-indigo-600">Yönetim Paneli</div>
          </div>

          {/* Main area */}
          <main className="flex-1 overflow-y-auto focus:outline-none p-4 md:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white shadow rounded-lg p-4 md:p-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
