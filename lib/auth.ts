/**
 * Auth Utilities
 * User cache management (không lưu token nữa - token được quản lý bởi NextAuth + HTTP-only cookies)
 */

const USER_KEY = 'auth_user';

export interface User {
  userId: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * ❌ DEPRECATED: Không dùng nữa - Token được quản lý bởi NextAuth + HTTP-only cookies
 * Giữ lại để backward compatibility, nhưng không làm gì cả
 */
export function saveTokens(tokens: AuthTokens): void {
  // Token giờ được quản lý bởi NextAuth JWT + HTTP-only cookies
  // Không lưu vào localStorage nữa để bảo mật
  console.warn("saveTokens() is deprecated. Tokens are now managed by NextAuth.");
}

/**
 * ❌ DEPRECATED: Không dùng nữa - Token không có trong localStorage
 * Giữ lại để backward compatibility
 */
export function getAccessToken(): string | null {
  // Token giờ ở trong NextAuth JWT (server-side) và HTTP-only cookies
  // Client không thể đọc được
  return null;
}

/**
 * ❌ DEPRECATED: Không dùng nữa - Token không có trong localStorage
 * Giữ lại để backward compatibility
 */
export function getRefreshToken(): string | null {
  // Token giờ ở trong NextAuth JWT (server-side) và HTTP-only cookies
  // Client không thể đọc được
  return null;
}

/**
 * Lưu user info vào localStorage (chỉ để cache, không phải token)
 * User info không nhạy cảm, có thể cache để tăng performance
 */
export function saveUser(user: User): void {
  if (typeof window !== 'undefined') {
    // Save to localStorage (chỉ user info, không phải token)
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
  }
}

/**
 * Lấy user info từ localStorage (cache)
 */
export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Xóa user info từ localStorage
 * ❌ KHÔNG xóa token cookies ở đây - cookies được quản lý bởi server
 */
export function clearAuth(): void {
  if (typeof window !== 'undefined') {
    // Chỉ xóa user cache, không xóa token
    localStorage.removeItem(USER_KEY);
    
    // Token cookies được quản lý hoàn toàn bởi NextAuth (HTTP-only)
    // Không thao tác trực tiếp tại đây
  }
}

/**
 * ❌ DEPRECATED: Không dùng nữa - Dùng useAuth().isAuthenticated từ AuthContext
 * Giữ lại để backward compatibility
 */
export function isAuthenticated(): boolean {
  // Function này không chính xác nữa vì token không có trong localStorage
  // Nên dùng useAuth().isAuthenticated từ AuthContext thay thế
  return false;
}
