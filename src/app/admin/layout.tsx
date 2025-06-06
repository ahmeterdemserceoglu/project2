"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Inter } from 'next/font/google';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          // Not logged in, redirect to login
          router.push('/login');
          return;
        }
        
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        if (!profile || !profile.is_admin) {
          // Not admin, redirect to homepage
          router.push('/');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [supabase, router]);

  // Dashboard navigation
  const dashboardNavigation: NavItem[] = [
    {
      name: "Gösterge Paneli",
      href: "/admin",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      ),
    },
  ];

  // Product management navigation
  const productNavigation: NavItem[] = [
    {
      name: "Ürünler",
      href: "/admin/products",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
        </svg>
      ),
    },
    {
      name: "Kategoriler",
      href: "/admin/categories",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      ),
    },
  ];

  // Customer management navigation
  const customerNavigation: NavItem[] = [
    {
      name: "Siparişler",
      href: "/admin/orders",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
      ),
    },
    {
      name: "Müşteriler",
      href: "/admin/customers",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
    },
  ];

  // Additional admin sections
  const siteNavigation: NavItem[] = [
    {
      name: "Site Ayarları",
      href: "/admin/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
    },
    {
      name: "Anasayfa'ya Dön",
      href: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    // If not admin, render nothing
    return null;
  }

  return (
    <div className={`${inter.className} h-full min-h-screen bg-dark text-white`}>
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
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-lighter shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center justify-between px-4 border-b border-dark">
              <Link href="/admin" className="flex items-center">
                <span className="text-lg font-bold text-primary">Admin Panel</span>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 rounded-md text-gray-300 hover:bg-dark"
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
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-200 hover:bg-dark hover:text-white"
                      }`}
                    >
                      <div className={`mr-3 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}>
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Ürün Yönetimi
                </h3>
                <div className="mt-1 space-y-1">
                  {productNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? "bg-primary text-white"
                            : "text-gray-200 hover:bg-dark hover:text-white"
                        }`}
                      >
                        <div className={`mr-3 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Müşteri Yönetimi
                </h3>
                <div className="mt-1 space-y-1">
                  {customerNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? "bg-primary text-white"
                            : "text-gray-200 hover:bg-dark hover:text-white"
                        }`}
                      >
                        <div className={`mr-3 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Site Yönetimi
                </h3>
                <div className="mt-1 space-y-1">
                  {siteNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? "bg-primary text-white"
                            : "text-gray-200 hover:bg-dark hover:text-white"
                        }`}
                      >
                        <div className={`mr-3 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col md:pl-64">
          {/* Mobile menu toggle - minimal top bar */}
          <div className="sticky top-0 z-10 flex items-center md:hidden h-12 bg-dark-lighter border-b border-dark px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-300 hover:bg-dark"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <span className="sr-only">Menüyü aç</span>
            </button>
          </div>

          {/* Main area */}
          <main className="flex-1 overflow-y-auto focus:outline-none p-4 md:p-6 bg-dark">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
