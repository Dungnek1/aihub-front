/**
 * Media Service (Server-side)
 * Business logic for media operations
 */

import httpClient from '@/services/http';

export interface UploadImageInput {
  accessToken: string;
  file: File;
  type?: 'avatar' | 'blog' | 'general';
}

export interface UploadPublicImageInput {
  file: File;
  type?: 'avatar' | 'blog' | 'general';
  folderType?: 'user' | 'blog' | 'general';
}

/**
 * Upload image file (requires authentication)
 */
export async function uploadImage(input: UploadImageInput) {
  if (!input.accessToken) {
    throw new Error('Access token is required');
  }

  if (!input.file) {
    throw new Error('File is required');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(input.file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (input.file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit');
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', input.file);
  if (input.type) {
    formData.append('type', input.type);
  }

  const response = await httpClient.post('/api/v1/media/upload/image', formData, {
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Upload public image file (no authentication required)
 * Used for signup avatar upload
 * NOTE: This endpoint calls backend directly (not through proxy) to avoid FormData issues
 */
export async function uploadPublicImage(input: UploadPublicImageInput) {
  // Create FormData
  const formData = new FormData();
  formData.append('file', input.file);
  if (input.type) {
    formData.append('type', input.type);
  }

  // Get backend URL from environment
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL is not configured');
  }

  const headers: Record<string, string> = {};

  // Add folder-type header if specified
  if (input.folderType) {
    headers['folder-type'] = input.folderType;
  }

  // NOTE: Do NOT set 'Content-Type' manually for FormData
  // Axios needs to set it automatically with boundary parameter

  // Call backend directly (not through proxy) to avoid FormData boundary issues
  const axios = (await import('axios')).default;
  const response = await axios.post(
    `${backendUrl}/media/upload/public-image`,
    formData,
    { headers }
  );

  return response.data;
}
