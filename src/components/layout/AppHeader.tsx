"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { usePathname } from "next/navigation";
import Image from "next/image";
import NavUser from "@/components/NavUser";

// Simple shopping cart icon component
const CartIcon = () => {
  const { items } = useCartStore();
  const itemCount = items.length;

  return (
    <div className="relative" data-oid="zvmxf3g">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        data-oid="k2gvsur"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          data-oid="lg9nu6-"
        />
      </svg>
      {itemCount > 0 && (
        <span
          className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
          data-oid="hjqn:5e"
        >
          {itemCount}
        </span>
      )}
    </div>
  );
};

const AppHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
      localStorage.setItem("darkMode", "false");
    } else {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
      localStorage.setItem("darkMode", "true");
    }
  };

  // Handle dark mode from localStorage
  useEffect(() => {
    const darkModePreference = localStorage.getItem("darkMode") === "true";
    setDarkMode(darkModePreference);

    if (darkModePreference) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <header
      className="sticky top-0 z-30 bg-white dark:bg-dark shadow-soft backdrop-blur-md"
      data-oid="hz3inbu"
    >
      <div className="container mx-auto px-4" data-oid="af97xza">
        <div
          className="flex items-center justify-between py-4"
          data-oid="lmz-f8k"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center" data-oid=":w.n-wk">
            <span
              className="text-2xl font-bold tracking-tighter relative group"
              data-oid="jooat:9"
            >
              <span
                className="text-primary group-hover:text-accent transition-colors duration-300"
                data-oid=".:d-gnp"
              >
                HD
              </span>
              <span
                className="text-gray-800 dark:text-white transition-colors"
                data-oid="zrx1g7e"
              >
                Ticaret
              </span>
              <span
                className="text-xs text-secondary ml-1 absolute -right-4 top-0"
                data-oid="h-stl9y"
              >
                .com
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            className="hidden md:flex items-center space-x-6"
            data-oid="p3xl3gb"
          >
            <Link
              href="/products"
              className={`font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 ${pathname === "/products" ? "text-primary dark:text-accent" : "text-gray-700 dark:text-gray-100"}`}
              data-oid="wx1p9th"
            >
              Ürünler
            </Link>
            <div className="relative group" data-oid="s_ts32q">
              <button
                className={`font-medium flex items-center px-2 py-1 rounded-md group-hover:bg-gray-100/50 dark:group-hover:bg-dark-lighter/50 text-gray-700 dark:text-gray-100`}
                data-oid="_h7-:dc"
              >
                Kategoriler
                <svg
                  className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  data-oid="avz-l1t"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                    data-oid="1muoe6w"
                  />
                </svg>
              </button>
              <div
                className="absolute left-0 mt-1 w-56 origin-top-right rounded-xl bg-white dark:bg-dark shadow-hover overflow-hidden p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 transform scale-95 group-hover:scale-100"
                data-oid="3g0yt0t"
              >
                {["Elektronik", "Giyim", "Ev & Yaşam", "Kozmetik"].map(
                  (category, i) => (
                    <Link
                      key={i}
                      href={`/category/${category.toLowerCase().replace(" & ", "-")}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                      data-oid="y..9-wa"
                    >
                      <span
                        className="bg-primary/10 dark:bg-primary/20 p-2 rounded-md mr-3"
                        data-oid="3ep6ply"
                      >
                        <svg
                          className="h-4 w-4 text-primary dark:text-accent"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          data-oid="667yfti"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                            data-oid=":ezsfeh"
                          />
                        </svg>
                      </span>
                      {category}
                    </Link>
                  ),
                )}
              </div>
            </div>
            <Link
              href="/kampanyalar"
              className={`font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 ${pathname === "/kampanyalar" ? "text-primary dark:text-accent" : "text-gray-700 dark:text-gray-100"}`}
              data-oid="utna_de"
            >
              Kampanyalar
            </Link>
            <Link
              href="/iletisim"
              className={`font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 ${pathname === "/iletisim" ? "text-primary dark:text-accent" : "text-gray-700 dark:text-gray-100"}`}
              data-oid="ln.g3t:"
            >
              İletişim
            </Link>
          </nav>

          {/* User actions */}
          <div
            className="hidden md:flex items-center space-x-4"
            data-oid="xxh-.6a"
          >
            {/* Search button */}
            <button
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
              aria-label="Search"
              data-oid="-pcyo-z"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="zf1aulr"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  data-oid="i27o11x"
                />
              </svg>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
              aria-label={darkMode ? "Light Mode" : "Dark Mode"}
              data-oid="-0d_rv1"
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="4lzer_c"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    data-oid="ymft_64"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="46m2ex6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    data-oid="jkai1ry"
                  />
                </svg>
              )}
            </button>

            {/* User profile */}
            <NavUser data-oid="luw0zi1" />

            {/* Shopping cart */}
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
              aria-label="Sepetim"
              data-oid="ikor45_"
            >
              <CartIcon data-oid="ctj1u:j" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div
            className="flex items-center space-x-2 md:hidden"
            data-oid="-6ieio."
          >
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
              aria-label="Sepetim"
              data-oid="u9vh1ic"
            >
              <CartIcon data-oid="2rst0ny" />
            </Link>

            <button
              className="p-2 rounded-md text-gray-700 dark:text-gray-200"
              onClick={toggleMenu}
              aria-label="Menu"
              data-oid="z1z16iq"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid="cj07xq1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    menuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                  data-oid="k8sd11k"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden py-4 bg-white dark:bg-dark shadow-xl rounded-b-2xl animate-fade-in-down"
            data-oid="ijct_jn"
          >
            <nav className="flex flex-col space-y-3 mb-6" data-oid="pwq.u8n">
              <Link
                href="/products"
                className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                onClick={() => setMenuOpen(false)}
                data-oid="2ecll.9"
              >
                Ürünler
              </Link>
              <details className="group px-4" data-oid="j.9qoir">
                <summary
                  className="list-none flex justify-between cursor-pointer py-2"
                  data-oid="s0dzwkr"
                >
                  Kategoriler
                  <svg
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    data-oid="si4nima"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                      data-oid="2:t_bl8"
                    />
                  </svg>
                </summary>
                <div className="pl-4 mt-2 space-y-2" data-oid="u5l.4i:">
                  {["Elektronik", "Giyim", "Ev & Yaşam", "Kozmetik"].map(
                    (category, i) => (
                      <Link
                        key={i}
                        href={`/category/${category.toLowerCase().replace(" & ", "-")}`}
                        className="flex items-center rounded-md py-2 hover:text-primary dark:hover:text-accent"
                        onClick={() => setMenuOpen(false)}
                        data-oid="d5ym_fn"
                      >
                        <span className="mr-2" data-oid="ap:2221">
                          →
                        </span>{" "}
                        {category}
                      </Link>
                    ),
                  )}
                </div>
              </details>
              <Link
                href="/kampanyalar"
                className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                onClick={() => setMenuOpen(false)}
                data-oid="muw8wz8"
              >
                Kampanyalar
              </Link>
              <Link
                href="/iletisim"
                className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                onClick={() => setMenuOpen(false)}
                data-oid="bxag-a3"
              >
                İletişim
              </Link>
            </nav>

            <div
              className="grid grid-cols-3 gap-2 px-4 pt-2 border-t border-gray-200 dark:border-dark-lighter"
              data-oid="p4k6gur"
            >
              <button
                onClick={() => {
                  toggleDarkMode();
                  setMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center p-3 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                data-oid="jbksf6b"
              >
                {darkMode ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      data-oid="7r5dgwd"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        data-oid="85hk53:"
                      />
                    </svg>
                    Aydınlık
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      data-oid="c3wlrq0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        data-oid="d4oc1_3"
                      />
                    </svg>
                    Karanlık
                  </>
                )}
              </button>
              <NavUser
                mobileView
                onMobileClick={() => setMenuOpen(false)}
                data-oid=".nz9dfo"
              />
              <Link
                href="/search"
                className="flex flex-col items-center justify-center p-3 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                onClick={() => setMenuOpen(false)}
                data-oid=":v4zfvc"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="2bviqoy"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    data-oid="6f:mxgs"
                  />
                </svg>
                Ara
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
