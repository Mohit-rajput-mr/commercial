'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { normalizeUrl, getNormalizedPageUrl } from '@/lib/url-normalizer';

export default function VisitorTracker() {
  const pathname = usePathname();
  const pageStartTimeRef = useRef<number>(Date.now());
  const timeSpentIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPageUrlRef = useRef<string>('');

  // Generate or get session ID (persists for browser session)
  const getSessionId = () => {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('visitor_session_id', sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    const sessionId = getSessionId();
    const currentPageUrl = getNormalizedPageUrl(); // Use normalized URL with production domain
    const currentPageTitle = document.title || '';
    const currentReferrer = lastPageUrlRef.current || normalizeUrl(document.referrer || '');

    // Track time spent on previous page before navigating away
    const trackPreviousPageTime = async () => {
      if (lastPageUrlRef.current && lastPageUrlRef.current !== currentPageUrl && pageStartTimeRef.current) {
        const timeSpent = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
        if (timeSpent > 0) {
          try {
            await fetch('/api/track-page-visit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionId,
                pageUrl: normalizeUrl(lastPageUrlRef.current),
                pageTitle: document.title || '',
                referrer: normalizeUrl(document.referrer || ''),
                timeSpent,
              }),
            });
          } catch (error) {
            // Silently fail
          }
        }
      }
    };

    // Track current page visit
    const trackCurrentPage = async () => {
      try {
        const language = navigator.language || 'en';
        const screenWidth = window.screen?.width || null;
        const screenHeight = window.screen?.height || null;

        // First, ensure visitor record exists/updated
        await fetch('/api/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            pageUrl: currentPageUrl,
            pageTitle: currentPageTitle,
            referrer: currentReferrer,
            language,
            screenWidth,
            screenHeight,
          }),
        });

        // Then track this page visit (new entry for each page visit)
        await fetch('/api/track-page-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            pageUrl: currentPageUrl,
            pageTitle: currentPageTitle,
            referrer: currentReferrer,
            timeSpent: 0, // Initial visit, will be updated when leaving
          }),
        });

        // Update tracking references
        lastPageUrlRef.current = currentPageUrl;
        pageStartTimeRef.current = Date.now();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error tracking page:', error);
        }
      }
    };

    // Track time spent periodically (every 10 seconds)
    const updateTimeSpent = async () => {
      const timeSpent = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
      if (timeSpent > 0) {
        try {
          await fetch('/api/track-page-visit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              pageUrl: currentPageUrl,
              pageTitle: currentPageTitle,
              referrer: normalizeUrl(document.referrer || ''),
              timeSpent,
            }),
          });
        } catch (error) {
          // Silently fail
        }
      }
    };

    // Track link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const linkUrl = link.href;
        const linkText = link.textContent?.trim() || '';
        
        // Only track external links or internal navigation (not javascript: or #)
        const normalizedLinkUrl = normalizeUrl(linkUrl);
        if (linkUrl && !linkUrl.startsWith('javascript:') && !linkUrl.startsWith('#') && normalizedLinkUrl !== currentPageUrl) {
          fetch('/api/track-link-click', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              linkUrl: normalizedLinkUrl,
              linkText,
            }),
          }).catch(() => {
            // Silently fail
          });
        }
      }
    };

    // Track previous page time before navigating to new page
    trackPreviousPageTime();

    // Track current page after a short delay
    const trackTimeout = setTimeout(() => {
      trackCurrentPage();
    }, 500);

    // Set up time tracking interval (update every 10 seconds)
    timeSpentIntervalRef.current = setInterval(updateTimeSpent, 10000);

    // Track link clicks
    document.addEventListener('click', handleLinkClick, true);

    // Track final time when leaving page
    const handleBeforeUnload = () => {
      const timeSpent = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
      if (timeSpent > 0) {
        const blob = new Blob([JSON.stringify({
          sessionId,
          pageUrl: currentPageUrl,
          pageTitle: currentPageTitle,
          referrer: normalizeUrl(document.referrer || ''),
          timeSpent,
        })], { type: 'application/json' });
        
        navigator.sendBeacon('/api/track-page-visit', blob);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      clearTimeout(trackTimeout);
      if (timeSpentIntervalRef.current) {
        clearInterval(timeSpentIntervalRef.current);
      }
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Track final time spent on this page
      const timeSpent = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
      if (timeSpent > 0) {
        trackPreviousPageTime();
      }
    };
  }, [pathname]); // Track when pathname changes

  return null; // This component doesn't render anything
}

