// Utility to clear corrupted Supabase cookies
export function clearCorruptedCookies() {
  if (typeof window === 'undefined') return;

  // List of potentially corrupted cookie names
  const cookiesToClear = [
    'sb-auth-session',
    'sb-access-token', 
    'sb-refresh-token',
    'auth_verified',
    'supabase_auth_verified',
    'session_active'
  ];

  // Clear each cookie
  cookiesToClear.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });

  // Also clear any Supabase cookies that start with 'sb-'
  const allCookies = document.cookie.split(';');
  allCookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName.startsWith('sb-')) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });

}

//Bozuk cookileri bu kod temizler