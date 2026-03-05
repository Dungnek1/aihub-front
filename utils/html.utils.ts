/**
 * HTML Utilities
 * Helper functions for HTML processing
 */

/**
 * Strip HTML tags from a string
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string | null | undefined): string {
    if (!html) return '';

    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");

    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
}

/**
 * Truncate text to a specific length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add if truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + suffix;
}

/**
 * Strip HTML and truncate
 * @param html - HTML string
 * @param maxLength - Maximum length
 * @returns Plain text, truncated
 */
export function stripAndTruncate(html: string | null | undefined, maxLength: number): string {
    const plain = stripHtml(html);
    return truncateText(plain, maxLength);
}
