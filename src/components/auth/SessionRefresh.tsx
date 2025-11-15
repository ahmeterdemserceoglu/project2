'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

/**
 * SessionRefresh component
 * 
 * This component handles periodic session refreshing and monitors for navigation
 * events to ensure the authentication state stays in sync across the application.
 */
export default function SessionRefresh() {
    const { refreshAuth, isAuthenticated, loading } = useAuth();
    const pathname = usePathname();
    const lastPathRef = useRef<string>(pathname);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastRefreshTimeRef = useRef<number>(Date.now());
    const refreshCountRef = useRef<number>(0);
    const isRefreshingRef = useRef<boolean>(false);

    // Safe refresh function to prevent concurrent refreshes
    const safeRefresh = async () => {
        // Skip refresh if not authenticated
        if (!isAuthenticated) {
            return;
        }

        if (isRefreshingRef.current) {
            return;
        }

        // Add time-based debounce
        const now = Date.now();
        if (now - lastRefreshTimeRef.current < 10000) {
            return;
        }

        try {
            isRefreshingRef.current = true;
            lastRefreshTimeRef.current = now;
            await refreshAuth();
        } catch (err) {
        } finally {
            isRefreshingRef.current = false;
        }
    };

    // Handle periodic session refresh - with much less frequency
    useEffect(() => {
        // Only set up refresh interval if authenticated
        if (isAuthenticated && !loading) {

            // Clear any existing interval
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }

            // Set up new refresh interval - every 60 minutes instead of 30
            refreshIntervalRef.current = setInterval(() => {
                const now = Date.now();
                // Avoid refreshing too frequently
                if (now - lastRefreshTimeRef.current > 1800000) { // At least 30 minutes between refreshes
                    safeRefresh();
                }
            }, 3600000); // 60 minutes
        }

        return () => {
            // Clean up interval on unmount
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [isAuthenticated, loading]);

    // Handle path changes - with stricter rate limiting
    useEffect(() => {
        // Skip the first render
        if (lastPathRef.current === pathname) {
            return;
        }

        lastPathRef.current = pathname;

        // Check for auth_login_success flag
        const loginSuccess = localStorage.getItem('auth_login_success');

        // Only refresh auth on navigation if login success flag is present
        // or if we haven't refreshed in the last 10 minutes
        const now = Date.now();
        if (loginSuccess || (isAuthenticated && now - lastRefreshTimeRef.current > 600000)) {

            // Limit refreshes to prevent infinite loops
            if (refreshCountRef.current < 1) { // Reduce max refreshes to 1
                refreshCountRef.current++;

                // Clear login success flag if present
                if (loginSuccess) {
                    localStorage.removeItem('auth_login_success');
                }

                // Delay the refresh slightly to avoid React state update conflicts
                setTimeout(() => {
                    safeRefresh();

                    // Reset refresh count after 30 seconds
                    setTimeout(() => {
                        refreshCountRef.current = 0;
                    }, 30000); // Increase reset time to 30 seconds
                }, 1000);
            }
        }
    }, [pathname, isAuthenticated]);

    // Monitor visibility changes (tab switching) - with stricter rate limiting
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isAuthenticated) {
                const now = Date.now();
                // Only refresh if we haven't refreshed in the last 10 minutes
                if (now - lastRefreshTimeRef.current > 600000) {

                    // Delay the refresh slightly
                    setTimeout(() => {
                        safeRefresh();
                    }, 2000);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isAuthenticated]);

    // This component doesn't render anything
    return null;
}
