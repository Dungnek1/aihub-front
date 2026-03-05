/**
 * Calculate estimated reading time based on text content
 * Average reading speed: 200-250 words per minute
 */
export function calculateReadingTime(htmlContent: string | null | undefined): number {
  if (!htmlContent) return 0;
  
  // Remove HTML tags and get plain text
  const plainText = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Count words (split by spaces)
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  
  // Average reading speed: 225 words per minute
  const wordsPerMinute = 225;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, readingTime); // At least 1 minute
}

