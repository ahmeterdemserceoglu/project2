"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function RequireAuth({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, loading, refreshAuth } = useAuth();
    const router = useRouter();
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
    const [directSessionFound, setDirectSessionFound] = useState(false);
    // Use global supabase client from context

    // First, try to directly check for cookie/storage auth
    useEffect(() => {
        const quickCheck = async () => {
            // Check cookies directly (fastest method)
            if (typeof document !== 'undefined') {
                const hasAuthCookie = document.cookie.includes('auth_verified=true') ||
                    document.cookie.includes('sb-access-token=');
                if (hasAuthCookie) {
                    setDirectSessionFound(true);
                    setIsPageLoading(false);
                    return;
                }
            }

            // Quick localStorage check (next fastest)
            if (typeof localStorage !== 'undefined') {
                const hasToken = localStorage.getItem('supabase.auth.token') ||
                    localStorage.getItem('auth_login_success');

                if (hasToken) {
                    setDirectSessionFound(true);
                    setIsPageLoading(false);
                    return;
                }
            }

            // If no quick auth found, check context
            if (!loading && isAuthenticated) {
                setIsPageLoading(false);
            } else if (!loading) {
                // Try one direct session check
                try {
                    const supabase = createClient();
                    const { data } = await supabase.auth.getSession();
                    if (data.session) {
                        setDirectSessionFound(true);
                        setIsPageLoading(false);
                        // Trigger a refresh of auth context
                        refreshAuth();
                        return;
                    }
                } catch (err) {
                }

                // If still here, redirect to login
                redirectToLogin();
            }
        };

        quickCheck();
    }, [loading, isAuthenticated]);

    // Helper function to handle redirection
    const redirectToLogin = () => {
        // Store the current path for redirect after login
        if (typeof localStorage !== 'undefined' && window.location.pathname !== '/login') {
            localStorage.setItem('login_redirect', window.location.pathname);
        }

        router.push('/login');
    };

    if (loading && !directSessionFound) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
            </div>
        );
    }

    if (!isAuthenticated && !directSessionFound) {
        return null;
    }

    return <>{children}</>;
}
