/**
 * API route để lấy accessToken từ NextAuth JWT
 * ⚠️ DEPRECATED: Chỉ dùng để backward compatibility
 * Tốt nhất là dùng proxy route (/api/proxy/*) thay vì gọi API này
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * GET: Lấy accessToken từ NextAuth JWT
 * ⚠️ Không nên dùng endpoint này, vì token sẽ bị expose trong response
 * Tốt nhất là dùng proxy route để gọi backend
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.accessToken) {
      return NextResponse.json(
        { error: "No token found" },
        { status: 401 }
      );
    }

    // ⚠️ Trả token về client - không an toàn lắm, nhưng để backward compatibility
    return NextResponse.json({
      accessToken: token.accessToken,
      refreshToken: token.refreshToken || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get token" },
      { status: 500 }
    );
  }
}

