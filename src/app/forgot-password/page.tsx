"use client";

import { useState } from "react";
import Link from "next/link";
import { useNotification } from "@/contexts/NotificationContext";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

export default function ForgotPassword() {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showNotification('Lütfen email adresinizi girin', 'error');
      return;
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Geçerli bir email adresi girin', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEmailSent(true);
        showNotification('Şifre sıfırlama linki email adresinize gönderildi', 'success');
      } else {
        showNotification(data.error || 'Bir hata oluştu', 'error');
      }
    } catch (error) {
      showNotification('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark p-4">
        <div className="max-w-md w-full p-8 bg-white dark:bg-dark-light rounded-xl shadow-lg text-center">
          <div className="mb-6 p-3 rounded-full bg-green-100 dark:bg-green-900 inline-block">
            <FaEnvelope className="h-12 w-12 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Email Gönderildi!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            <strong>{email}</strong> adresine şifre sıfırlama linki gönderildi. 
            Email kutunuzu kontrol edin ve linke tıklayarak şifrenizi sıfırlayın.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Not:</strong> Email gelmezse spam/çöp kutusu klasörünüzü kontrol edin. 
              Link 1 saat içinde geçerlidir.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setIsEmailSent(false);
                setEmail("");
              }}
              className="w-full bg-secondary hover:bg-secondary-dark text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
            >
              Tekrar Gönder
            </button>
            
            <Link
              href="/login"
              className="w-full inline-block border border-gray-300 dark:border-dark-lighter text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-medium transition-colors duration-200 font-medium text-center"
            >
              Giriş Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark p-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-dark-light rounded-xl shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 p-3 rounded-full bg-secondary/10 inline-block">
            <FaEnvelope className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Şifremi Unuttum
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Email adresinizi girin, size şifre sıfırlama linki gönderelim
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Adresi
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-dark-lighter rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent dark:bg-dark-medium dark:text-white"
              placeholder="ornek@email.com"
              required
            />
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
                Gönderiliyor...
              </>
            ) : (
              "Sıfırlama Linki Gönder"
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-secondary hover:text-secondary-dark font-medium"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Giriş sayfasına dön
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-lighter">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">Hesabınız yok mu?</p>
            <Link
              href="/register"
              className="text-secondary hover:text-secondary-dark font-medium"
            >
              Hemen kayıt olun
            </Link>
          </div>
        </div>

        {/* Site Branding */}
        <div className="mt-6">
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