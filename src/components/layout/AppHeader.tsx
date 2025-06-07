'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@/lib/supabase';

// Simple shopping cart icon component
const CartIcon = () => {
  const { items } = useCartStore();
  const itemCount = items.length;

  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {itemCount}
        </span>
      )}
    </div>
  );
};

const AppHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  // Check auth status and get user info
  useEffect(() => {
    const checkAuth = async () => {
      try {
        let sessionFound = false;

        // Try multiple storage mechanisms for session retrieval
        // 1. First check localStorage
        const storedSession = localStorage.getItem('supabase.auth.token');
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            if (parsedSession?.currentSession?.user) {
              setIsLoggedIn(true);
              sessionFound = true;

              // Get user initial from stored session
              const email = parsedSession.currentSession.user.email;
              if (email) {
                setUserInitial(email.charAt(0).toUpperCase());
              }

              // Try to manually refresh the session
              try {
                const { error: refreshError } = await supabase.auth.refreshSession({
                  refresh_token: parsedSession.currentSession.refresh_token
                });

                if (refreshError) {
                  console.error('Error refreshing session in header:', refreshError);
                }
              } catch (refreshError) {
                console.error('Exception during session refresh in header:', refreshError);
              }
            }
          } catch (error) {
            console.error('Error parsing localStorage session:', error);
          }
        }

        // 2. Check sessionStorage if not found in localStorage
        if (!sessionFound && typeof sessionStorage !== 'undefined') {
          const sessionData = sessionStorage.getItem('supabase.auth.token');
          if (sessionData) {
            try {
              const parsedSession = JSON.parse(sessionData);
              if (parsedSession?.currentSession?.user) {
                setIsLoggedIn(true);
                sessionFound = true;

                // Get user initial
                const email = parsedSession.currentSession.user.email;
                if (email) {
                  setUserInitial(email.charAt(0).toUpperCase());
                }
              }
            } catch (error) {
              console.error('Error parsing sessionStorage session:', error);
            }
          }
        }

        // 3. Check cookies
        if (!sessionFound && document.cookie) {
          const cookies = document.cookie.split('; ');
          const sessionCookie = cookies.find(c => c.startsWith('supabase.auth.token='));
          if (sessionCookie) {
            try {
              const cookieValue = decodeURIComponent(sessionCookie.split('=')[1]);
              const parsedCookie = JSON.parse(cookieValue);
              if (parsedCookie?.currentSession?.user) {
                setIsLoggedIn(true);
                sessionFound = true;

                // Get user initial
                const email = parsedCookie.currentSession.user.email;
                if (email) {
                  setUserInitial(email.charAt(0).toUpperCase());
                }
              }
            } catch (error) {
              console.error('Error parsing cookie session:', error);
            }
          }
        }

        // 4. Then verify with Supabase API
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking session with Supabase:', error);
        }

        // If we got a session from the API but not from storage, update our state
        if (session) {
          setIsLoggedIn(true);

          // If we found a session via API but not in storage, save it to all storage
          if (!sessionFound) {
            try {
              const sessionData = {
                currentSession: session,
                expiresAt: Math.floor(Date.now() / 1000) + (session.expires_in || 3600)
              };
              const sessionString = JSON.stringify(sessionData);

              // Store in all storage mechanisms
              localStorage.setItem('supabase.auth.token', sessionString);
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('supabase.auth.token', sessionString);
              }

              // Store in cookies for better cross-domain support
              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + 7);
              document.cookie = `supabase.auth.token=${encodeURIComponent(sessionString)};expires=${expiryDate.toUTCString()};path=/;SameSite=Strict`;
            } catch (storageError) {
              console.error('Error storing session:', storageError);
            }
          }

          if (session?.user) {
            // Fetch user profile to get name information
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name, email, is_admin')
              .eq('id', session.user.id)
              .single();

            if (!profileError && profileData) {
              if (profileData.first_name) {
                setUserInitial(profileData.first_name.charAt(0).toUpperCase());
              } else if (profileData.email) {
                setUserInitial(profileData.email.charAt(0).toUpperCase());
              }
              // Set admin status based on the is_admin field
              setIsAdmin(!!profileData.is_admin);
            } else {
              // Fallback to email from auth if profile not found
              setUserInitial(session.user.email?.charAt(0).toUpperCase() || '?');
              setIsAdmin(false);
            }
          }
        } else if (!sessionFound) {
          // Only set to not logged in if we didn't find a session in any storage
          setIsLoggedIn(false);
          setUserInitial('');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change in header:', event);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsLoggedIn(!!session);

          if (session?.user) {
            try {
              // Store the session in all storage mechanisms for redundancy
              try {
                const sessionData = {
                  currentSession: session,
                  expiresAt: Math.floor(Date.now() / 1000) + (session.expires_in || 3600)
                };
                const sessionString = JSON.stringify(sessionData);

                localStorage.setItem('supabase.auth.token', sessionString);
                if (typeof sessionStorage !== 'undefined') {
                  sessionStorage.setItem('supabase.auth.token', sessionString);
                }

                // Store in cookies
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 7);
                document.cookie = `supabase.auth.token=${encodeURIComponent(sessionString)};expires=${expiryDate.toUTCString()};path=/;SameSite=Strict`;
              } catch (storageError) {
                console.error('Error storing session during auth change:', storageError);
              }

              // Fetch user profile to get name information
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('first_name, last_name, email, is_admin')
                .eq('id', session.user.id)
                .single();

              if (!profileError && profileData) {
                if (profileData.first_name) {
                  setUserInitial(profileData.first_name.charAt(0).toUpperCase());
                } else if (profileData.email) {
                  setUserInitial(profileData.email.charAt(0).toUpperCase());
                }
                // Set admin status
                setIsAdmin(!!profileData.is_admin);
              } else {
                // Fallback to email from auth
                setUserInitial(session.user.email?.charAt(0).toUpperCase() || '?');
                setIsAdmin(false);
              }
            } catch (error) {
              console.error('Error fetching profile after auth change:', error);
              setUserInitial(session.user.email?.charAt(0).toUpperCase() || '?');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setUserInitial('');
          setIsAdmin(false);

          // Clear all session storage
          try {
            localStorage.removeItem('supabase.auth.token');
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.removeItem('supabase.auth.token');
            }
            document.cookie = 'supabase.auth.token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict';
          } catch (error) {
            console.error('Error clearing session storage:', error);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth, supabase]);

  // Handle dark mode from localStorage
  useEffect(() => {
    const darkModePreference = localStorage.getItem('theme') === 'dark';
    setDarkMode(darkModePreference);

    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      // Clear auth data from both storage locations
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('authSuccess');
      sessionStorage.removeItem('authSuccess');

      // Explicitly update state
      setIsLoggedIn(false);
      setUserInitial('');
      setIsAdmin(false);

      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-dark shadow-soft backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold tracking-tighter relative group">
              <span className="text-primary group-hover:text-accent transition-colors duration-300">HD</span>
              <span className="text-gray-800 dark:text-white transition-colors">Ticaret</span>
              <span className="text-xs text-secondary ml-1 absolute -right-4 top-0">.com</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/products"
              className={`font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 ${pathname === '/products' ? 'text-primary dark:text-accent' : 'text-gray-700 dark:text-gray-100'}`}
            >
              Ürünler
            </Link>
            <div className="relative group">
              <button className={`font-medium flex items-center px-2 py-1 rounded-md group-hover:bg-gray-100/50 dark:group-hover:bg-dark-lighter/50 text-gray-700 dark:text-gray-100`}>
                Kategoriler
                <svg
                  className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="absolute left-0 mt-1 w-56 origin-top-right rounded-xl bg-white dark:bg-dark shadow-hover overflow-hidden p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 transform scale-95 group-hover:scale-100">
                {['Elektronik', 'Giyim', 'Ev & Yaşam', 'Kozmetik'].map((category, i) => (
                  <Link
                    key={i}
                    href={`/category/${category.toLowerCase().replace(' & ', '-')}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                  >
                    <span className="bg-primary/10 dark:bg-primary/20 p-2 rounded-md mr-3">
                      <svg className="h-4 w-4 text-primary dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                    {category}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/kampanyalar"
              className={`font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 ${pathname === '/kampanyalar' ? 'text-primary dark:text-accent' : 'text-gray-700 dark:text-gray-100'}`}
            >
              Kampanyalar
            </Link>
            <Link
              href="/iletisim"
              className={`font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 ${pathname === '/iletisim' ? 'text-primary dark:text-accent' : 'text-gray-700 dark:text-gray-100'}`}
            >
              İletişim
            </Link>
          </nav>

          {/* User actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search button */}
            <button
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
              aria-label="Search"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
              aria-label={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* User profile */}
            {isLoggedIn ? (
              <div className="relative group">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-dark hover:to-secondary-dark transition-colors shadow-md text-sm font-medium"
                  aria-label="Hesabım"
                >
                  {userInitial || '?'}
                </button>
                <div className="absolute right-0 mt-1 w-56 origin-top-right rounded-xl bg-white dark:bg-dark shadow-hover overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 transform scale-95 group-hover:scale-100 border border-gray-100 dark:border-dark-lighter max-h-[calc(100vh-10rem)]">
                  <div className="py-2 px-4 border-b border-gray-200 dark:border-dark-lighter">
                    <p className="font-medium text-sm text-gray-800 dark:text-white">Kullanıcı Menüsü</p>
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Hesabım
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Siparişlerim
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-primary dark:text-accent hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Çıkış Yap
                  </button>
                </div>
              </div>
            ) : (
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
            )}

            {/* Shopping cart */}
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
              aria-label="Sepetim"
            >
              <CartIcon />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-dark-lighter/50 transition-colors text-gray-700 dark:text-gray-200"
              aria-label="Sepetim"
            >
              <CartIcon />
            </Link>

            <button
              className="p-2 rounded-md text-gray-700 dark:text-gray-200"
              onClick={toggleMenu}
              aria-label="Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 bg-white dark:bg-dark shadow-xl rounded-b-2xl animate-fade-in-down">
            <nav className="flex flex-col space-y-3 mb-6">
              <Link
                href="/products"
                className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Ürünler
              </Link>
              <details className="group px-4">
                <summary className="list-none flex justify-between cursor-pointer py-2">
                  Kategoriler
                  <svg
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </summary>
                <div className="pl-4 mt-2 space-y-2">
                  {['Elektronik', 'Giyim', 'Ev & Yaşam', 'Kozmetik'].map((category, i) => (
                    <Link
                      key={i}
                      href={`/category/${category.toLowerCase().replace(' & ', '-')}`}
                      className="flex items-center rounded-md py-2 hover:text-primary dark:hover:text-accent"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="mr-2">→</span> {category}
                    </Link>
                  ))}
                </div>
              </details>
              <Link
                href="/kampanyalar"
                className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Kampanyalar
              </Link>
              <Link
                href="/iletisim"
                className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                İletişim
              </Link>
            </nav>

            <div className="grid grid-cols-3 gap-2 px-4 pt-2 border-t border-gray-200 dark:border-dark-lighter">
              <button
                onClick={() => {
                  toggleDarkMode();
                  setMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center p-3 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
              >
                {darkMode ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Aydınlık
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Karanlık
                  </>
                )}
              </button>
              {isLoggedIn ? (
                <Link
                  href="/account"
                  className="flex flex-col items-center justify-center p-3 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="w-6 h-6 mb-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs flex items-center justify-center shadow-sm font-medium">
                    {userInitial || '?'}
                  </div>
                  Hesabım
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex flex-col items-center justify-center p-3 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Giriş Yap
                </Link>
              )}
              <Link
                href="/search"
                className="flex flex-col items-center justify-center p-3 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Ara
              </Link>
              {isLoggedIn && (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="flex flex-col items-center justify-center p-3 text-xs text-primary rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors col-span-3"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-3 text-xs text-red-500 rounded-md hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors col-span-3 mt-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Çıkış Yap
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;