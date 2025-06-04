'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import NavUser from '@/components/NavUser';

// Simple shopping cart icon component
const CartIcon = () => {
  const { items } = useCartStore();
  const itemCount = items.length;
  
  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
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
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
      localStorage.setItem('darkMode', 'false');
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
      localStorage.setItem('darkMode', 'true');
    }
  };

  // Handle dark mode from localStorage
  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setDarkMode(darkModePreference);
    
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-dark shadow-soft backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold tracking-tighter relative group">
              <span className="text-primary group-hover:text-accent transition-colors duration-300">HD</span>
              <span className="text-gray-800 dark:text-white transition-colors">Ticaret</span>
              <span className="text-xs text-secondary ml-1 absolute -right-4 top-0">.com</span>
            </span>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/products" 
              className={`font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 ${pathname === '/products' ? 'text-primary dark:text-accent' : 'text-gray-700 dark:text-gray-100'}`}
            >
              Ürünler
            </Link>
            <div className="relative group">
              <button className={`font-medium flex items-center px-2 py-1 rounded-md group-hover:bg-gray-100/50 dark:group-hover:bg-dark-lighter/50 text-gray-700 dark:text-gray-100`}>
                Kategoriler
                <svg
                  className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="absolute left-0 mt-1 w-56 origin-top-right rounded-xl bg-white dark:bg-dark shadow-hover overflow-hidden p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 transform scale-95 group-hover:scale-100">
                {['Elektronik', 'Giyim', 'Ev & Yaşam', 'Kozmetik'].map((category, i) => (
                  <Link
                    key={i}
                    href={`/category/${category.toLowerCase().replace(' & ', '-')}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                  >
                    <span className="bg-primary/10 dark:bg-primary/20 p-2 rounded-md mr-3">
                      <svg className="h-4 w-4 text-primary dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                    {category}
                  </Link>
                ))}
              </div>
            </div>
            <Link 
              href="/kampanyalar" 
              className={`font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 ${pathname === '/kampanyalar' ? 'text-primary dark:text-accent' : 'text-gray-700 dark:text-gray-100'}`}
            >
              Kampanyalar
            </Link>
            <Link 
              href="/iletisim" 
              className={`font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 ${pathname === '/iletisim' ? 'text-primary dark:text-accent' : 'text-gray-700 dark:text-gray-100'}`}
            >
              İletişim
            </Link>
          </nav>
          
          {/* User actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search button */}
            <button 
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200" 
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
              aria-label={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* User profile */}
            <NavUser />
            
            {/* Shopping cart */}
            <Link 
              href="/cart" 
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
              aria-label="Sepetim"
            >
              <CartIcon />
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <Link 
              href="/cart" 
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
              aria-label="Sepetim"
            >
              <CartIcon />
            </Link>
            
            <button 
              className="p-2 rounded-md text-gray-700 dark:text-gray-200" 
              onClick={toggleMenu}
              aria-label="Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 bg-white dark:bg-dark shadow-xl rounded-b-2xl animate-fade-in-down">
            <nav className="flex flex-col space-y-3 mb-6">
              <Link 
                href="/products" 
                className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Ürünler
              </Link>
              <details className="group px-4">
                <summary className="list-none flex justify-between cursor-pointer py-2">
                  Kategoriler
                  <svg
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </summary>
                <div className="pl-4 mt-2 space-y-2">
                  {['Elektronik', 'Giyim', 'Ev & Yaşam', 'Kozmetik'].map((category, i) => (
                    <Link 
                      key={i}
                      href={`/category/${category.toLowerCase().replace(' & ', '-')}`} 
                      className="flex items-center rounded-md py-2 hover:text-primary dark:hover:text-accent"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="mr-2">→</span> {category}
                    </Link>
                  ))}
                </div>
              </details>
              <Link 
                href="/kampanyalar" 
                className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Kampanyalar
              </Link>
              <Link 
                href="/iletisim" 
                className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                İletişim
              </Link>
            </nav>
            
            <div className="grid grid-cols-3 gap-2 px-4 pt-2 border-t border-gray-200 dark:border-dark-lighter">
              <button 
                onClick={() => {
                  toggleDarkMode();
                  setMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center p-3 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
              >
                {darkMode ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Aydınlık
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Karanlık
                  </>
                )}
              </button>
              <NavUser mobileView onMobileClick={() => setMenuOpen(false)} />
              <Link 
                href="/search" 
                className="flex flex-col items-center justify-center p-3 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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