import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is required");
}

/**
 * Proxy route handler
 * Forwards all requests to backend API with authentication
 *
 * GET /api/proxy/tools/used -> GET {BACKEND_URL}/tools/used
 * POST /api/proxy/auth/login -> POST {BACKEND_URL}/auth/login
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, "PATCH");
}

async function handleRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  try {
    const { path } = await params;
    let backendPath = path.join("/");
    const url = new URL(request.url);

    // Build backend URL - ensure no double slashes
    if (!BACKEND_URL) {
      return NextResponse.json(
        { message: "Backend URL not configured", error: "CONFIG_ERROR" },
        { status: 500 }
      );
    }

    // Don't auto-add prefix - let client code decide the full path
    // Client should call with full path like /api/v1/tools/used or /tools/used
    // depending on what backend expects

    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const pathPart = backendPath.startsWith("/")
      ? backendPath
      : `/${backendPath}`;
    const backendUrl = `${baseUrl}${pathPart}${url.search}`;

    let accessToken: string | null = null;

    const sessionCookieName =
      process.env.NODE_ENV === "production"
        ? "__Host-next-auth.session-token"
        : "next-auth.session-token";

    try {
      let token = await getToken({
        req: request as any,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: sessionCookieName,
      });

      // Fallback to default cookie name if not found (e.g., during dev)
      if (!token && sessionCookieName !== "next-auth.session-token") {
        token = await getToken({
          req: request as any,
          secret: process.env.NEXTAUTH_SECRET,
        });
      }

      if (token?.accessToken) {
        accessToken = token.accessToken as string;
      }
    } catch (error) {
      console.warn("[Proxy] getToken failed:", error);
    }

    // Prepare headers - forward important headers from original request
    const headers: HeadersInit = {};

    // Forward Content-Type if present, otherwise default to application/json for non-multipart requests
    const requestContentType = request.headers.get("Content-Type");
    if (requestContentType) {
      headers["Content-Type"] = requestContentType;
    } else {
      // Only set default for non-FormData requests
      headers["Content-Type"] = "application/json";
    }

    // Forward Accept header if present
    const acceptHeader = request.headers.get("Accept");
    if (acceptHeader) {
      headers["Accept"] = acceptHeader;
    }

    // Forward folder-type header for media uploads
    const folderTypeHeader = request.headers.get("folder-type");
    if (folderTypeHeader) {
      headers["folder-type"] = folderTypeHeader;
    }

    // Add Authorization header if token exists
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      console.warn("[Proxy] Missing access token for request:", backendUrl);
    }

    // Forward request body for POST, PUT, PATCH
    let body: BodyInit | undefined;
    if (method === "POST" || method === "PUT" || method === "PATCH") {
      try {
        // Check if this is a FormData request (multipart/form-data)
        if (requestContentType?.includes("multipart/form-data")) {
          // For FormData, we need to forward the raw body
          // Use arrayBuffer to preserve binary data
          const arrayBuffer = await request.arrayBuffer();
          body = arrayBuffer;
        } else {
          // For JSON or other content types, use text
          body = await request.text();
        }
      } catch (error) {
        // No body
      }
    }

    // Forward request to backend
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
    });

    // Get response data
    const contentType = response.headers.get("Content-Type") || "";
    let responseData: any;

    try {
      if (contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = text;
        }
      }
    } catch (error) {
      // Silent fail - return error response
      responseData = { error: "Failed to parse response" };
    }

    // Return response with same status and headers
    // IMPORTANT: Return only the data, not the full response object
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("[Proxy] Error:", error);
    return NextResponse.json(
      {
        message: error.message || "Proxy request failed",
        error: "PROXY_ERROR",
      },
      { status: 500 }
    );
  }
}
