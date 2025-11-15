import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  profile: any;
  isAdmin: boolean | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  
  // Internal actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  profile: null,
  isAdmin: null,
  loading: true,
  error: null,

  // Actions
  signIn: async (email: string, password: string) => {
    const supabase = createClient();
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      set({ 
        session: data.session, 
        user: data.session?.user ?? null,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    const supabase = createClient();
    set({ loading: true });
    
    try {
      await supabase.auth.signOut();
      set({ 
        user: null, 
        session: null, 
        profile: null, 
        isAdmin: null, 
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  refreshAuth: async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    
    set({ 
      session: data.session, 
      user: data.session?.user ?? null 
    });
  },

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));