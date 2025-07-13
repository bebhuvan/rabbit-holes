// Shared utility functions to eliminate code duplication
// This file consolidates common functions used across multiple components

/**
 * Share functionality using native Web Share API with clipboard fallback
 * @param title - The title of the content to share
 * @param url - The URL path to share (will be combined with origin)
 */
export function sharePost(title: string, url: string): void {
  const fullUrl = window.location.origin + url;
  
  if (navigator.share) {
    // Use native sharing if available (mobile devices, some desktop browsers)
    navigator.share({
      title: title,
      url: fullUrl
    }).catch(err => {
      console.log('Error sharing:', err);
      // Fallback to clipboard
      copyToClipboard(fullUrl);
    });
  } else {
    // Fallback to clipboard copy
    copyToClipboard(fullUrl);
  }
}

/**
 * Copy text to clipboard with proper error handling
 * @param text - The text to copy to clipboard
 */
export function copyToClipboard(text: string): void {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Link copied to clipboard');
      // Could trigger a toast notification here in the future
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      // Could show error message to user
    });
  } else {
    // Legacy fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      console.log('Link copied to clipboard (legacy method)');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
    document.body.removeChild(textArea);
  }
}

/**
 * Format date consistently across the application
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options (optional)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Format date for short display (e.g., in archives)
 * @param date - Date to format
 * @returns Short formatted date string
 */
export function formatDateShort(date: Date): string {
  return formatDate(date, {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date for RSS feeds (ISO format)
 * @param date - Date to format
 * @returns ISO formatted date string
 */
export function formatDateISO(date: Date): string {
  return date.toISOString();
}

/**
 * Calculate reading time estimate for content
 * @param content - The text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200 WPM)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): number {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Generate a URL-friendly slug from text
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars except spaces and hyphens
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
}

/**
 * Debounce function to limit rapid function calls
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit function calls to once per interval
 * @param func - Function to throttle
 * @param limit - Time interval in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}