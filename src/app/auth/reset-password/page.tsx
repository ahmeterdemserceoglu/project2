"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/contexts/NotificationContext";
import { createClient } from "@/lib/supabase/client";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Check if we have valid reset token
  useEffect(() => {
    const checkToken = async () => {
      const token = searchParams.get('token');

      if (token) {
        try {
          // Verify custom token
          const response = await fetch('/api/auth/verify-reset-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setIsValidToken(true);
          } else {
            showNotification(data.message || 'Geçersiz veya süresi dolmuş sıfırlama linki', 'error');
            setIsValidToken(false);
          }
        } catch (error) {
          showNotification('Sıfırlama linki doğrulanamadı', 'error');
          setIsValidToken(false);
        }
      } else {
        showNotification('Geçersiz sıfırlama linki', 'error');
        setIsValidToken(false);
      }
      
      setIsCheckingToken(false);
    };

    checkToken();
  }, [searchParams, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      showNotification('Lütfen tüm alanları doldurun', 'error');
      return;
    }

    if (password.length < 6) {
      showNotification('Şifre en az 6 karakter olmalıdır', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showNotification('Şifreler eşleşmiyor', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const token = searchParams.get('token');
      
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showNotification('Şifreniz başarıyla güncellendi!', 'success');
        
        setTimeout(() => {
          router.push('/login?message=password_updated');
        }, 2000);
      } else {
        showNotification(data.message || 'Şifre güncellenirken bir hata oluştu', 'error');
      }
    } catch (error) {
      showNotification('Şifre sıfırlama işlemi başarısız', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
        <div className="max-w-md w-full p-8 bg-white dark:bg-dark-light rounded-xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Sıfırlama Linki Kontrol Ediliyor...
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Lütfen bekleyin, sıfırlama linkiniz doğrulanıyor.
          </p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark p-4">
        <div className="max-w-md w-full p-8 bg-white dark:bg-dark-light rounded-xl shadow-lg text-center">
          <div className="mb-6 p-3 rounded-full bg-red-100 dark:bg-red-900 inline-block">
            <svg className="h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Geçersiz Sıfırlama Linki
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Bu sıfırlama linki geçersiz veya süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebinde bulunun.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full inline-block bg-secondary hover:bg-secondary-dark text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium text-center"
            >
              Giriş Sayfasına Dön
            </Link>
            
            <Link
              href="/"
              className="w-full inline-block border border-gray-300 dark:border-dark-lighter text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-medium transition-colors duration-200 font-medium text-center"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark p-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-dark-light rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Yeni Şifre Belirle
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Hesabınız için yeni bir şifre belirleyin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Yeni Şifre
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-lighter rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent dark:bg-dark-medium dark:text-white pr-12"
                placeholder="En az 6 karakter"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Şifre Tekrarı
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-lighter rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent dark:bg-dark-medium dark:text-white pr-12"
                placeholder="Şifrenizi tekrar girin"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-secondary hover:bg-secondary-dark text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Şifre Güncelleniyor...
              </>
            ) : (
              "Şifreyi Güncelle"
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-secondary hover:text-secondary-dark font-medium"
          >
            Giriş sayfasına dön
          </Link>
        </div>

        {/* Site Branding */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-lighter">
          <div className="text-center">
            <span className="text-lg font-bold tracking-tighter">
              <span className="text-primary">HD</span>
              <span className="text-gray-900 dark:text-white">Ticaret</span>
              <span className="text-secondary text-sm">.com</span>
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Güvenilir E-Ticaret Platformu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
          <div className="max-w-md w-full p-8 bg-white dark:bg-dark-light rounded-xl shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Yükleniyor...
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Lütfen bekleyin, sayfa yükleniyor.
            </p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}