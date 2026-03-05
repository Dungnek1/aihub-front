/**
 * Storage Utilities
 * Helper functions to manage localStorage and sessionStorage cleanup
 */

/**
 * Clear stale authentication data from localStorage and sessionStorage
 * This helps resolve conflicts from old/cached authentication data
 */
export function clearStaleAuthData(): void {
  if (typeof window === 'undefined') return;

  try {
    // ✅ Clear sessionStorage items (temporary data)
    sessionStorage.removeItem('nextauth.callbackUrl');
    sessionStorage.removeItem('__Secure-nextauth.callbackUrl');
    sessionStorage.removeItem('auth_401_errors');
    sessionStorage.removeItem('auth_401_errors_timestamp');
    
    // ✅ Clear any stale auth-related localStorage items (except remember me)
    // Don't clear auth.remember and auth.remember.credentials - user wants to remember login
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('nextauth.') ||
        key.startsWith('__Secure-nextauth.') ||
        key.startsWith('__Host-nextauth.') ||
        key === 'continueAsGuest' ||
        key.startsWith('auth_') && key !== 'auth.remember' && !key.startsWith('auth.remember.')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore errors
      }
    });

    // Silent cleanup - no logging needed
  } catch (error) {
    // Silent fail - ignore cleanup errors
  }
}

/**
 * Clear all cookies (client-side only, for development/testing)
 * Note: httpOnly cookies cannot be cleared from client-side JavaScript
 */
export function clearCookies(): void {
  if (typeof document === 'undefined') return;

  try {
    // Get all cookies
    const cookies = document.cookie.split(';');
    
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Clear cookie by setting it to expire in the past
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[clearCookies] Cleared all cookies");
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[clearCookies] Error clearing cookies:", error);
    }
  }
}

/**
 * Clear all authentication-related data (storage + cookies)
 * Use this when user is experiencing authentication issues
 */
export function clearAllAuthData(): void {
  clearStaleAuthData();
  clearCookies();
  
  if (process.env.NODE_ENV === "development") {
    // Silent cleanup - no logging needed
  }
}

