"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Admin sidebar navigation component
const AdminSidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { title: "Gösterge Paneli", href: "/admin/dashboard", icon: "chart-bar" },
    { title: "Ürünler", href: "/admin/products", icon: "tag" },
    { title: "Siparişler", href: "/admin/orders", icon: "shopping-cart" },
    { title: "Müşteriler", href: "/admin/customers", icon: "users" },
    { title: "Ayarlar", href: "/admin/settings", icon: "cog" },
  ];

  // Function to render appropriate icon
  const renderIcon = (icon: string) => {
    switch (icon) {
      case "chart-bar":
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="o.heydt"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              data-oid="3b6i0qo"
            />
          </svg>
        );

      case "tag":
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="hc-00hc"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              data-oid=".k9sw3e"
            />
          </svg>
        );

      case "shopping-cart":
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="iio1_k_"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              data-oid="fawi-bb"
            />
          </svg>
        );

      case "users":
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="8saz9br"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              data-oid="qd1sj8q"
            />
          </svg>
        );

      case "cog":
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="jai02.4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              data-oid="ys0dfa9"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              data-oid="637riv9"
            />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white h-full shadow-md" data-oid="16jwula">
      <div className="p-6 bg-primary text-white" data-oid="2tfqpb2">
        <Link
          href="/admin/dashboard"
          className="text-xl font-bold flex items-center"
          data-oid="rd1wj8o"
        >
          <svg
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="-7:spkb"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              data-oid="72ldnub"
            />
          </svg>
          Admin Panel
        </Link>
      </div>
      <nav className="p-4" data-oid="2nhnk5n">
        <ul className="space-y-2" data-oid="r5bo4cz">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href} data-oid="gkdqq.h">
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  data-oid="1j4p.kp"
                >
                  <span className="mr-3" data-oid="rh3b.67">
                    {renderIcon(item.icon)}
                  </span>
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 mt-auto border-t" data-oid="44pcuw:">
        <Link
          href="/"
          className="flex items-center text-sm text-gray-700 hover:text-primary"
          data-oid="3chy-op"
        >
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="q3ozr46"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7m-14 0l2 2m0 0l7 7 7-7m-14 0l2-2"
              data-oid="l3wu8yu"
            />
          </svg>
          Site'ye Dön
        </Link>
      </div>
    </div>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50" data-oid="fg2-jh3">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50" data-oid="734z-nc">
        <button
          type="button"
          className="p-2 rounded-md bg-white shadow-md text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-oid="vs:8wys"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-oid="-8ouz1w"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
                data-oid="wuhe:g:"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
                data-oid=".0hjdcn"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar for desktop */}
      <aside
        className="hidden md:block md:w-64 lg:w-72 shrink-0"
        data-oid="viwxlww"
      >
        <AdminSidebar data-oid="edjbma_" />
      </aside>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40" data-oid="y9-ujfx">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            data-oid="eh3pfa9"
          />

          {/* Sidebar */}
          <div
            className="fixed left-0 top-0 h-full w-64 z-50"
            data-oid="94ru.1l"
          >
            <AdminSidebar data-oid="0v5fy0:" />
          </div>
        </div>
      )}

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
        data-oid="1uulb_y"
      >
        {children}
      </main>
    </div>
  );
}
