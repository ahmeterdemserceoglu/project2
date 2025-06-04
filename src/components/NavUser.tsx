'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { useNotification } from '@/contexts/NotificationContext';

interface NavUserProps {
  mobileView?: boolean;
  onMobileClick?: () => void;
}

export default function NavUser({ mobileView = false, onMobileClick }: NavUserProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { showToast } = useToast();
  const { showNotification } = useNotification();
  
  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error checking authentication status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user || null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
      showToast(`${userName}, başarıyla çıkış yapıldı`, 'success');
      showNotification('Oturumunuz güvenli bir şekilde sonlandırıldı', 'info');
      router.refresh();
    } catch (error) {
      console.error('Çıkış yaparken hata oluştu:', error);
      showToast('Çıkış yapılırken bir hata oluştu', 'error');
      showNotification('Çıkış işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin.', 'error');
    }
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  if (loading) {
    // Render a minimal skeleton loader while checking auth status
    if (mobileView) {
      return (
        <div className="flex flex-col items-center justify-center p-3 text-xs rounded-md">
          <div className="h-5 w-5 mb-1 bg-gray-200 dark:bg-dark-lighter rounded-full animate-pulse"></div>
          <span className="mt-1">Yükleniyor...</span>
        </div>
      );
    }
    
    return (
      <div className="p-2 rounded-full bg-gray-100 dark:bg-dark-lighter animate-pulse w-9 h-9"></div>
    );
  }
  
  if (!user) {
    // If not logged in, show login link
    if (mobileView) {
      return (
        <Link 
          href="/login" 
          className="flex flex-col items-center justify-center p-3 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
          onClick={onMobileClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Giriş Yap
        </Link>
      );
    }
    
    return (
      <Link 
        href="/login" 
        className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
        aria-label="Giriş Yap"
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </Link>
    );
  }
  
  // If logged in and on mobile view, show simplified user menu
  if (mobileView) {
    return (
      <div className="flex flex-col items-center justify-center p-3 text-xs">
        <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs mb-1">
          {user.email?.charAt(0).toUpperCase() || user.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex flex-col mt-1">
          <Link 
            href="/account" 
            className="text-center hover:text-primary dark:hover:text-accent transition-colors"
            onClick={onMobileClick}
          >
            Hesabım
          </Link>
          <button
            onClick={() => {
              handleSignOut();
              if (onMobileClick) onMobileClick();
            }}
            className="text-red-600 dark:text-red-400 mt-2"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    );
  }
  
  // Default desktop view with dropdown
  return (
    <div className="relative">
      <button 
        className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200 flex items-center"
        onClick={toggleDropdown}
        aria-label="Hesabım"
        aria-expanded={isDropdownOpen}
      >
        <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs">
          {user.email?.charAt(0).toUpperCase() || user.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </button>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-light rounded-lg shadow-lg py-1 z-50 border dark:border-dark-lighter">
          <div className="px-4 py-2 border-b dark:border-dark-lighter">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.user_metadata?.full_name || user.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
          <Link
            href="/account"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-lighter"
            onClick={() => setIsDropdownOpen(false)}
          >
            Hesabım
          </Link>
          <Link
            href="/orders"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-lighter"
            onClick={() => setIsDropdownOpen(false)}
          >
            Siparişlerim
          </Link>
          <button
            onClick={() => {
              handleSignOut();
              setIsDropdownOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-lighter"
          >
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
} 