import { NextResponse } from 'next/server';
import httpServerClient from '@/services/http.server';
import { IApiResponse } from '@/types/api.types';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  updatedAt?: string;
  createdAt?: string;
  coverImageId?: string;
}

/**
 * GET all published blog posts for sitemap
 * Used for dynamic sitemap generation
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const take = searchParams.get('take') || '1000'; // Get up to 1000 posts per request
    const status = searchParams.get('status') || 'PUBLISHED'; // Default to PUBLISHED

    const response = await httpServerClient.get<IApiResponse<BlogPost[]>>(
      `/blog/filter?status=${status}&skip=${skip}&take=${take}`
    );

    const posts = response?.data?.data || [];

    return NextResponse.json({
      success: true,
      data: posts,
      count: posts.length,
    });
  } catch (error) {
    // SECURITY: Do not expose error details
    console.error('Failed to fetch blog posts for sitemap');
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog posts',
      },
      { status: 500 }
    );
  }
}
