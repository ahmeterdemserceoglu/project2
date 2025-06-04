'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useNotification } from '@/contexts/NotificationContext';

export default function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { showNotification } = useNotification();
  
  useEffect(() => {
    // Check for auth success message
    const authStatus = searchParams.get('auth');
    if (authStatus === 'success') {
      showToast('Giriş başarılı!', 'success');
      showNotification('Hoş geldiniz! Hesabınıza başarıyla giriş yapıldı.', 'success');
      
      // Remove the query parameter from URL after showing the message
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, showToast, showNotification]);
  
  return null;
} 