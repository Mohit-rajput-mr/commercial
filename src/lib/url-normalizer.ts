/**
 * Normalize URLs to use production domain instead of localhost
 */

const PRODUCTION_DOMAIN = 'https://www.capratecompany.com';

export function normalizeUrl(url: string): string {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    
    // If it's localhost, replace with production domain
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1' || urlObj.hostname.includes('localhost')) {
      return `${PRODUCTION_DOMAIN}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    }
    
    // If it's already the production domain or another domain, return as is
    return url;
  } catch (error) {
    // If URL parsing fails, try simple string replacement
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return url.replace(/https?:\/\/[^/]+/, PRODUCTION_DOMAIN);
    }
    return url;
  }
}

export function getNormalizedPageUrl(): string {
  if (typeof window === 'undefined') return '';
  
  const currentUrl = window.location.href;
  return normalizeUrl(currentUrl);
}

// Server-side normalization (for API routes)
export function normalizeUrlServer(url: string): string {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    
    // If it's localhost, replace with production domain
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1' || urlObj.hostname.includes('localhost')) {
      return `${PRODUCTION_DOMAIN}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    }
    
    // If it's already the production domain or another domain, return as is
    return url;
  } catch (error) {
    // If URL parsing fails, try simple string replacement
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return url.replace(/https?:\/\/[^/]+/, PRODUCTION_DOMAIN);
    }
    return url;
  }
}
