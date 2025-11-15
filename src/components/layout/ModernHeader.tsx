'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/lib/store';
import { usePathname } from 'next/navigation';
import NavUser from '@/components/NavUser';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ShoppingCart, Search, Heart, Grid3X3, Tag, Mail, Home, Package, User, Star } from 'lucide-react';

const ModernHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { items } = useCartStore();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const cartCount = items.length;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navItems = [
    { href: '/', label: 'Ana Sayfa', icon: Home, showOn: 'mobile' },
    { href: '/products', label: 'Ürünler', icon: Package, showOn: 'all' },
    { href: '/categories', label: 'Kategoriler', icon: Grid3X3, showOn: 'all' },
    { href: '/collections', label: 'Koleksiyonlar', icon: Star, showOn: 'all' },
    { href: '/kampanyalar', label: 'Kampanyalar', icon: Tag, showOn: 'desktop' },
    { href: '/iletisim', label: 'İletişim', icon: Mail, showOn: 'desktop' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg dark:bg-gray-900/95'
            : 'bg-white dark:bg-gray-900'
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 z-10">
              <div className="text-2xl md:text-3xl font-bold">
                <span className="text-blue-600 dark:text-blue-400">HD</span>
                <span className="text-gray-900 dark:text-white">Ticaret</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems
                .filter(item => item.showOn === 'all' || item.showOn === 'desktop')
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${pathname === item.href
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              {isAdmin === true && (
                <Link
                  href="/admin"
                  className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Search - Desktop */}
              <button className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              {/* Favorites - Desktop */}
              <Link
                href="/favorites"
                className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Link>

              {/* User Menu - Desktop */}
              <div className="hidden md:block">
                <NavUser />
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`fixed inset-0 z-[90] transition-all duration-300 lg:hidden ${isMenuOpen ? 'visible' : 'invisible'
          }`}
      >
        {/* Background Overlay */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${isMenuOpen ? 'opacity-50' : 'opacity-0'
            }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-full sm:w-80 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menü</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex flex-col h-[calc(100%-73px)]">
            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${pathname === item.href
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {isAdmin === true && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-3 px-6 py-3 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Admin Panel</span>
                </Link>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 my-4 mx-6" />

              {/* Mobile Only Actions */}
              <Link
                href="/search"
                className="flex items-center space-x-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Search className="w-5 h-5" />
                <span className="font-medium">Ara</span>
              </Link>

              <Link
                href="/favorites"
                className="flex items-center space-x-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span className="font-medium">Favorilerim</span>
              </Link>
            </nav>

            {/* User Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              {isAuthenticated ? (
                <Link
                  href="/account"
                  className="flex items-center space-x-3 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Hesabım</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Giriş Yap</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16 md:h-20" />
    </>
  );
};

export default ModernHeader;
