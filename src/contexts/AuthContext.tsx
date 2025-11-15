'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { usePathname, useRouter } from 'next/navigation';


interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any; // You might want to define a specific type for profile
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  isAdmin: boolean | null;
  refreshAuth: () => Promise<Session | null>;
  checkIfAdmin: () => Promise<boolean>;
  clearCaches: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const lastPathRef = React.useRef<string>(pathname);
  const refreshAttemptRef = React.useRef<number>(0);
  const lastRefreshTimeRef = React.useRef<number>(0);

  // Clear all localStorage caches
  const clearCaches = useCallback(() => {
    try {

      localStorage.removeItem('featuredProducts');
      localStorage.removeItem('featuredProductsTime');
      localStorage.removeItem('flashDeals');
      localStorage.removeItem('flashDealsTime');
      localStorage.removeItem('categories');
      localStorage.removeItem('categoriesTime');
      localStorage.removeItem('auth_login_success');
    } catch (e) {
    }
  }, []);





  // Oturum durumunu izle
  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);

        // Get session from Supabase without clearing cookies
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          
          setSession(null);
          setUser(null);
          return;
        }

        if (session) {
          
          setSession(session);
          setUser(session.user);
        } else {
          
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Only run if supabase client is available
    if (supabase) {
      getSession();
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
 
      if (event === 'SIGNED_IN') {
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        refreshAttemptRef.current = 0;

        // Set login success flag for other components
        if (newSession && newSession.user) {
          try {
            localStorage.setItem('auth_login_success', 'true');
          } catch (e) {
          }
        }
      } else if (event === 'SIGNED_OUT') {
        
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsAdmin(null);
        clearCaches();
        setIsSigningOut(false);
      } else if (event === 'TOKEN_REFRESHED') {
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        refreshAttemptRef.current = 0;
      } else if (event === 'USER_UPDATED') {
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }

      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, clearCaches, router]);

  // Kullanıcı profili bilgilerini getir
  useEffect(() => {
    if (user) {
      // Set loading state for admin status
      setIsAdmin(null);
      
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            // If profile fetch fails, assume not admin
            setIsAdmin(false);
            return;
          }

          if (data) {
            setProfile(data);
            setIsAdmin(data.is_admin === true); // Explicitly check for true
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          setIsAdmin(false);
        }
      };
      fetchProfile();
    } else {
      // Kullanıcı yoksa profil bilgilerini sıfırla
      setProfile(null);
      setIsAdmin(null);
    }
  }, [user, supabase]);

  // URL değişikliklerini izle - simplified
  useEffect(() => {
    if (pathname !== lastPathRef.current) {
      lastPathRef.current = pathname;

      // Check for login success flag on any navigation
      const loginSuccess = localStorage.getItem('auth_login_success');
      if (loginSuccess) {
        localStorage.removeItem('auth_login_success');
        // Profile zaten user effect'i tarafından güncelleniyor
      }
    }
  }, [pathname, user, supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Ensure session is set correctly
      setSession(data.session);
      setUser(data.session?.user ?? null);

      // Set login success flag for other components
      if (data.session && data.session.user) {
        try {
          localStorage.setItem('auth_login_success', 'true');
        } catch (e) {
        }
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsSigningOut(true);

      // First clear local state
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(null);

      // Clear caches
      clearCaches();
      
      // Clear session data

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      // Use Next.js router for better state management
      router.push('/?logout=true');
    } catch (error) {
      setIsSigningOut(false);
    }
  };

  const refreshAuth = async () => {
    // Rate limit refreshes to avoid spamming the API
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 1000) {
      return session;
    }
    lastRefreshTimeRef.current = now;

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        return null;
      }

      // Update session state
      setSession(data.session);
      setUser(data.session?.user ?? null);

      return data.session;
    } catch (error) {
      return null;
    }
  };

  const checkIfAdmin = async () => {
    if (!user) return false;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        return false;
      }
      return data?.is_admin || false;
    } catch (error) {
      return false;
    }
  };

  const value = {
    session,
    user,
    profile,
    isAuthenticated: !!user,
    loading: loading || isSigningOut,
    signIn,
    signOut,
    isAdmin,
    refreshAuth,
    checkIfAdmin,
    clearCaches,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
