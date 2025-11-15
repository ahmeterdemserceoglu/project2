'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { FaUser, FaSignOutAlt, FaCog, FaShoppingBag, FaMapMarkerAlt } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function NavUser() {
    const { isAuthenticated, user, loading, signOut } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Add click outside handler for dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="animate-pulse flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </div>
        );
    }

    // Authenticated state
    if (isAuthenticated && user) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter/50 transition-colors"
                    aria-label="User menu"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                >
                    {user.user_metadata?.avatar_url ? (
                        <Image
                            src={user.user_metadata.avatar_url}
                            alt={user.user_metadata?.full_name || user.email || 'User'}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs flex items-center justify-center shadow-sm font-medium">
                            {(user.user_metadata?.full_name || user.email || '?').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-200">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı'}
                    </span>
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark rounded-xl shadow-lg py-1 z-50 border border-gray-100 dark:border-dark-lighter">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-lighter">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.user_metadata?.full_name || 'Kullanıcı'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                            </p>
                        </div>

                        <Link
                            href="/account"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-lighter"
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            <FaUser className="mr-3 text-gray-400 dark:text-gray-500" />
                            Hesabım
                        </Link>

                        <Link
                            href="/account/orders"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-lighter"
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            <FaShoppingBag className="mr-3 text-gray-400 dark:text-gray-500" />
                            Siparişlerim
                        </Link>

                        <Link
                            href="/account/addresses"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-lighter"
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            <FaMapMarkerAlt className="mr-3 text-gray-400 dark:text-gray-500" />
                            Adreslerim
                        </Link>

     

                        <div className="border-t border-gray-100 dark:border-dark-lighter my-1"></div>

                        <button
                            onClick={() => {
                                setIsDropdownOpen(false);
                                signOut();
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-dark-lighter"
                        >
                            <FaSignOutAlt className="mr-3 text-red-400" />
                            Çıkış Yap
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Not authenticated state - use Link instead of button for better navigation
    return (
        <Link
            href="/login"
            className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
        >
            <FaUser className="h-5 w-5" />
            <span className="hidden md:inline text-sm font-medium">Giriş Yap</span>
        </Link>
    );
} 