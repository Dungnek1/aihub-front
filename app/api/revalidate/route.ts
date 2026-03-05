import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint để revalidate cache theo yêu cầu
 * 
 * Sử dụng:
 * POST /api/revalidate
 * Headers: { "x-revalidate-secret": "your-secret-key" }
 * Body: { "path": "all" } hoặc { "path": "/vi/news" }
 */
export async function POST(request: NextRequest) {
  try {
    // Kiểm tra secret key
    const secret = request.headers.get('x-revalidate-secret');
    const expectedSecret = process.env.REVALIDATE_SECRET || 'dev-secret-key';
    
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing secret key' },
        { status: 401 }
      );
    }

    // Parse body
    const body = await request.json();
    const { path, locale } = body;

    if (!path) {
      return NextResponse.json(
        { success: false, message: 'Missing path parameter' },
        { status: 400 }
      );
    }

    // Revalidate paths
    const revalidatedPaths: string[] = [];

    if (path === 'all' || path === 'blog') {
      // Revalidate tất cả các trang blog/news cho cả 2 locale
      const locales = locale ? [locale] : ['vi', 'en'];
      
      for (const loc of locales) {
        const paths = [
          `/${loc}`,
          `/${loc}/news`,
          `/${loc}/landing/news`,
          `/${loc}/blog`,
        ];
        
        for (const p of paths) {
          revalidatePath(p, 'page');
          revalidatedPaths.push(p);
        }
      }
    } else {
      // Revalidate một path cụ thể
      revalidatePath(path, 'page');
      revalidatedPaths.push(path);
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      paths: revalidatedPaths,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error revalidating',
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint để kiểm tra health
 */
export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  const expectedSecret = process.env.REVALIDATE_SECRET || 'dev-secret-key';
  
  if (secret !== expectedSecret) {
    return NextResponse.json(
      { message: 'Invalid or missing secret key' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Revalidation API is ready',
    usage: {
      method: 'POST',
      headers: { 'x-revalidate-secret': 'your-secret-key' },
      body: {
        path: 'all | blog | /vi/news | any-specific-path',
        locale: 'vi | en (optional, only for path=all)',
      },
    },
  });
}

