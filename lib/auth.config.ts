import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 🆕 helper decode JWT để lấy exp
function decodeJwt(token?: string): { exp?: number } | null {
  try {
    if (!token) {
      return null;
    }
    const parts = token.split(".");
    const payload = parts.length > 1 ? parts[1] : undefined;
    if (!payload) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
    return decoded;
  } catch {
    return null;
  }
}

const isProduction = process.env.NODE_ENV === "production";
const secureCookie = isProduction;
const hostPrefix = secureCookie ? "__Host-" : "";
const securePrefix = secureCookie ? "__Secure-" : "";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 0, // Update session on every request to trigger refresh check
  },
  cookies: {
    sessionToken: {
      name: `${hostPrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: secureCookie,
      },
    },
    callbackUrl: {
      name: `${securePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: secureCookie,
      },
    },
    csrfToken: {
      name: `${hostPrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: secureCookie,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usernameOrEmail: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.usernameOrEmail || !credentials?.password) {
          console.error("[NextAuth] Missing credentials");
          return null;
        }

        try {
          const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
          if (!BACKEND_URL) {
            console.error("[NextAuth] NEXT_PUBLIC_BACKEND_URL not configured");
            return null;
          }

          const loginUrl = `${BACKEND_URL}/auth/user/login`;

          const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              usernameOrEmail: credentials.usernameOrEmail,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            let errorData: any = {};
            try {
              errorData = await response.json();
            } catch (e) {
              const text = await response.text();
              errorData = { message: text || "Login failed" };
            }
            const errorMessage =
              errorData?.message ||
              errorData?.error ||
              `HTTP ${response.status}: ${response.statusText}`;
            console.error("[NextAuth] Login failed:", {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
              message: errorMessage,
              url: loginUrl,
            });
            return null;
          }

          const data = await response.json().catch(() => null);
          const loginData = data?.data || data;

          if (!loginData?.accessToken || !loginData?.user) {
            console.error(
              "[NextAuth] Missing accessToken or user in loginData:",
              JSON.stringify(loginData, null, 2)
            );
            return null;
          }

          const { accessToken, refreshToken, user } = loginData;

          const decoded = decodeJwt(accessToken);
          // 🆕 set hạn theo exp trong JWT
          const accessTokenExpires = decoded?.exp
            ? decoded.exp * 1000
            : Date.now() + 10 * 60 * 1000; // fallback 10 phút

          const userId = user.userId || (user as any).userld || (user as any).id;
          if (!userId) {
            console.error(
              "[NextAuth] User ID not found in user object. User:",
              JSON.stringify(user, null, 2)
            );
            return null;
          }

          return {
            id: userId,
            email: user.email || "",
            name: user.name || "",
            username: user.username || "",
            avatarUrl: user.avatarUrl,
            accessToken,
            refreshToken,
            accessTokenExpires,
          } as any;
        } catch (error: any) {
          console.error("[NextAuth] Auth error:", {
            message: error.message,
            stack: error.stack,
            error: error,
          });
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // login lần đầu
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.accessTokenExpires = (user as any).accessTokenExpires;
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          username: (user as any).username,
          avatarUrl: (user as any).avatarUrl,
        };
        return token;
      }

      const expiresAt = token.accessTokenExpires as number | undefined;
      const hasError = (token as any).error === "RefreshAccessTokenError";
      const lastRefreshAttempt = (token as any).lastRefreshAttempt || 0;
      const now = Date.now();
      
      // Nếu không có expiresAt, không thể refresh
      if (!expiresAt) {
        // Nếu có refreshToken, thử refresh ngay
        if (token.refreshToken) {
          return await refreshAccessToken(token);
        }
        return token;
      }

      // Kiểm tra token đã hết hạn chưa
      const isExpired = now >= expiresAt;
      
      // Nếu đã có error, chỉ retry sau một khoảng thời gian
      if (hasError) {
        const retryDelay = 30 * 1000; // 30 giây để retry nhanh hơn
        const timeSinceLastAttempt = now - lastRefreshAttempt;
        
        // Nếu token đã hết hạn, retry ngay lập tức
        if (isExpired && timeSinceLastAttempt >= retryDelay) {
          return await refreshAccessToken(token);
        }
        
        // Nếu chưa đến lúc retry, return token
        if (timeSinceLastAttempt < retryDelay) {
        return token;
      }
      }

      // Refresh 5 phút trước khi hết hạn để đảm bảo smooth UX
      // Buffer đủ để tránh race condition và network delay
      const refreshBufferMs = 5 * 60 * 1000; // 5 phút
      const shouldRefreshTime = expiresAt - refreshBufferMs;
      const timeUntilExpiry = expiresAt - now;
      
      // Nếu token đã hết hạn hoặc sắp hết hạn, refresh ngay
      if (isExpired || now >= shouldRefreshTime) {
      return await refreshAccessToken(token);
      }
      
      // Nếu token vẫn còn thời gian, không cần refresh
      // Nếu có error nhưng token vẫn valid, clear error
      if (hasError) {
        return {
          ...token,
          error: undefined,
          lastRefreshAttempt: undefined,
        };
      }
      
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: (token.user as any)?.id,
        email: (token.user as any)?.email,
        name: (token.user as any)?.name,
        username: (token.user as any)?.username,
        avatarUrl: (token.user as any)?.avatarUrl,
      } as any;

      // Đưa accessToken vào session để dùng được ở cả client & server
      (session as any).accessToken = (token as any).accessToken;
      (session as any).accessTokenExpires = (token as any).accessTokenExpires;
      (session.user as any).id = (token.user as any)?.id;
      (session.user as any).username = (token.user as any)?.username;

      // Chỉ set error nếu token thực sự không còn valid
      // Nếu vẫn còn accessToken và chưa hết hạn, không set error để tránh logout
      const expiresAt = (token as any).accessTokenExpires as number | undefined;
      const hasValidToken = (token as any).accessToken && expiresAt && Date.now() < expiresAt;
      
      if ((token as any).error && !hasValidToken) {
        (session as any).error = (token as any).error;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

// 🧠 refreshAccessToken dùng đúng Authorization + cập nhật exp mới
async function refreshAccessToken(token: any) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!BACKEND_URL || !token.refreshToken) {
      console.error("[NextAuth] Missing BACKEND_URL or refreshToken");
      return {
        ...token,
        error: "RefreshAccessTokenError",
        lastRefreshAttempt: Date.now(),
      };
    }

    // Kiểm tra refresh token có hết hạn không
    const refreshTokenDecoded = decodeJwt(token.refreshToken);
    if (refreshTokenDecoded?.exp) {
      const refreshTokenExpires = refreshTokenDecoded.exp * 1000;
      if (Date.now() >= refreshTokenExpires) {
        console.error("[NextAuth] Refresh token expired");
        return {
          ...token,
          accessToken: null,
          accessTokenExpires: 0,
          error: "RefreshAccessTokenError",
          lastRefreshAttempt: Date.now(),
      };
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    // Không gửi accessToken trong header nếu nó đã hết hạn
    const expiresAt = token.accessTokenExpires as number | undefined;
    if (token.accessToken && expiresAt && Date.now() < expiresAt) {
      headers.Authorization = `Bearer ${token.accessToken}`;
    }

    // Kiểm tra xem BACKEND_URL đã có /api/v1 chưa
    const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    const refreshUrl = baseUrl.includes('/api/v1') 
      ? `${baseUrl}/auth/refresh`
      : `${baseUrl}/api/v1/auth/refresh`;

    const response = await fetch(refreshUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    // Accept both 200 and 201 as success
    if (!response.ok && response.status !== 201) {
      const errorText = await response.text().catch(() => "");
      let errorData = {};
      try {
        errorData = errorText ? JSON.parse(errorText) : {};
      } catch {
        errorData = {};
      }
      console.error("[NextAuth] Token refresh failed:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText?.slice(0, 200),
        errorData,
        refreshTokenPreview: token.refreshToken
          ? `${String(token.refreshToken).slice(0, 6)}...${String(
              token.refreshToken
            ).slice(-4)}`
          : null,
      });
      
      // Nếu là 401, có thể refresh token đã hết hạn hoặc invalid
      // Giữ lại accessToken nếu còn valid để user không bị logout ngay
      if (response.status === 401) {
        const currentAccessToken = token.accessToken;
        const currentExpires = expiresAt;
        const stillValid = currentAccessToken && currentExpires && Date.now() < currentExpires;
        
        return {
          ...token,
          error: "RefreshAccessTokenError",
          lastRefreshAttempt: Date.now(),
          // Giữ lại accessToken nếu còn valid
          accessToken: stillValid ? currentAccessToken : null,
          accessTokenExpires: stillValid ? currentExpires : 0,
        };
      }
      
      // Với các lỗi khác, giữ lại token nếu còn valid
      const currentAccessToken = token.accessToken;
      const currentExpires = expiresAt;
      const stillValid = currentAccessToken && currentExpires && Date.now() < currentExpires;
      
      return {
        ...token,
        error: "RefreshAccessTokenError",
        lastRefreshAttempt: Date.now(),
        accessToken: stillValid ? currentAccessToken : null,
        accessTokenExpires: stillValid ? currentExpires : 0,
      };
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      console.error("[NextAuth] Invalid refresh response: no data");
      const currentAccessToken = token.accessToken;
      const currentExpires = expiresAt;
      const stillValid = currentAccessToken && currentExpires && Date.now() < currentExpires;
      
      return {
        ...token,
        error: "RefreshAccessTokenError",
        lastRefreshAttempt: Date.now(),
        accessToken: stillValid ? currentAccessToken : null,
        accessTokenExpires: stillValid ? currentExpires : 0,
      };
    }

    const refreshData = data?.data || data;

    if (!refreshData || !refreshData.accessToken) {
      console.error("[NextAuth] Invalid refresh response:", refreshData);
      const currentAccessToken = token.accessToken;
      const currentExpires = expiresAt;
      const stillValid = currentAccessToken && currentExpires && Date.now() < currentExpires;
      
      return {
        ...token,
        error: "RefreshAccessTokenError",
        lastRefreshAttempt: Date.now(),
        accessToken: stillValid ? currentAccessToken : null,
        accessTokenExpires: stillValid ? currentExpires : 0,
      };
    }

    const newAccessToken = refreshData.accessToken;
    const decoded = decodeJwt(newAccessToken);
    const accessTokenExpires = decoded?.exp
      ? decoded.exp * 1000
      : Date.now() + 10 * 60 * 1000;

    return {
      ...token,
      accessToken: newAccessToken,
      refreshToken: refreshData.refreshToken || token.refreshToken,
      accessTokenExpires,
      user: {
        ...token.user,
        ...(refreshData.user || {}),
      },
      error: undefined,
      lastRefreshAttempt: undefined, // Clear retry flag on success
    };
  } catch (error) {
    console.error("[NextAuth] Refresh token error:", error);
    // Giữ lại token nếu còn valid khi có network error
    const currentAccessToken = token.accessToken;
    const currentExpires = token.accessTokenExpires as number | undefined;
    const stillValid = currentAccessToken && currentExpires && Date.now() < currentExpires;
    
    return {
      ...token,
      error: "RefreshAccessTokenError",
      lastRefreshAttempt: Date.now(),
      accessToken: stillValid ? currentAccessToken : null,
      accessTokenExpires: stillValid ? currentExpires : 0,
    };
  }
}
