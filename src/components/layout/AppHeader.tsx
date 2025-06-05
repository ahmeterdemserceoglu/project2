"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Import any other components you need
import NavUser from "@/components/NavUser";

const AppHeader: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30" data-oid="uj85kii">
      <div
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        data-oid="v:6ajr5"
      >
        <div
          className="flex justify-between items-center h-16"
          data-oid="3qgftbw"
        >
          {/* Logo */}
          <div className="flex-shrink-0" data-oid="2a6jndy">
            <Link href="/" className="flex items-center" data-oid="jzhdh1y">
              <span
                className="text-xl font-bold text-gray-800"
                data-oid="1eob1z9"
              >
                HDTicaret
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8" data-oid="an7i_b-">
            <Link
              href="/"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === "/"
                  ? "border-indigo-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              data-oid="nzroxuq"
            >
              Ana Sayfa
            </Link>
            <Link
              href="/products"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === "/products" || pathname.startsWith("/products/")
                  ? "border-indigo-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              data-oid="33a05wx"
            >
              Ürünler
            </Link>
          </nav>

          {/* User navigation */}
          <div className="flex items-center" data-oid="u-ozn.m">
            <NavUser data-oid="t2qy7y3" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
