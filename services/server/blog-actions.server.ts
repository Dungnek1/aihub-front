'use server';

/**
 * Blog Actions Server
 * Server-side actions for blog operations
 * Handles post creation, updates, and sitemap updates
 */

import { revalidatePath } from 'next/cache';
import { revalidateSitemap } from '@/services/sitemap.service';

/**
 * Create a new blog post and update sitemap
 * This is a server action that can be called from client components
 */
export async function createBlogPostAction(formData: {
  title: string;
  bodyHtml: string;
  categoryId: string;
  tagIds?: string[];
  file?: File;
  coverImageType?: 'image' | 'audio';
}) {
  try {
    // Your API call to create the post would go here
    // This is just a placeholder showing the pattern

    // After successful creation, revalidate sitemap
    await revalidateSitemap();

    // Revalidate blog pages
    revalidatePath('/[locale]/blog');
    revalidatePath('/[locale]/blog/[slug]');

    return {
      success: true,
      message: 'Blog post created and sitemap updated',
    };
  } catch (error) {
    console.error('Error creating blog post:', error);
    return {
      success: false,
      error: 'Failed to create blog post',
    };
  }
}

/**
 * Update an existing blog post and update sitemap
 */
export async function updateBlogPostAction(
  postId: string,
  formData: {
    title?: string;
    bodyHtml?: string;
    categoryId?: string;
  }
) {
  try {
    // Your API call to update the post would go here

    // After successful update, revalidate sitemap
    await revalidateSitemap();

    // Revalidate affected blog pages
    revalidatePath('/[locale]/blog');
    revalidatePath('/[locale]/blog/[slug]');

    return {
      success: true,
      message: 'Blog post updated and sitemap refreshed',
    };
  } catch (error) {
    console.error('Error updating blog post:', error);
    return {
      success: false,
      error: 'Failed to update blog post',
    };
  }
}

/**
 * Publish a blog post and update sitemap
 */
export async function publishBlogPostAction(postId: string) {
  try {
    // Your API call to publish the post would go here

    // After successful publish, revalidate sitemap
    await revalidateSitemap();

    // Revalidate affected pages
    revalidatePath('/[locale]/blog');
    revalidatePath('/[locale]/blog/[slug]');

    return {
      success: true,
      message: 'Blog post published and sitemap updated',
    };
  } catch (error) {
    console.error('Error publishing blog post:', error);
    return {
      success: false,
      error: 'Failed to publish blog post',
    };
  }
}

/**
 * Delete a blog post and update sitemap
 */
export async function deleteBlogPostAction(postId: string) {
  try {
    // Your API call to delete the post would go here

    // After successful deletion, revalidate sitemap
    await revalidateSitemap();

    // Revalidate affected pages
    revalidatePath('/[locale]/blog');

    return {
      success: true,
      message: 'Blog post deleted and sitemap updated',
    };
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return {
      success: false,
      error: 'Failed to delete blog post',
    };
  }
}

/**
 * Revalidate pages after a view increment
 */
export async function revalidateBlogViewAction() {
  try {
    revalidatePath('/');
    revalidatePath('/[locale]');
    revalidatePath('/[locale]/blog');
    return { success: true };
  } catch (error) {
    console.error('Error revalidating blog view:', error);
    return { success: false };
  }
}
