'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();
  const hasTrackedRef = useRef<Set<string>>(new Set());
  const trackingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Track once per page/route
    if (hasTrackedRef.current.has(pathname)) return;
    hasTrackedRef.current.add(pathname);

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

    const trackVisit = async () => {
      try {
        const sessionId = getSessionId();
        const pageUrl = window.location.href;
        const pageTitle = document.title || '';
        const referrer = document.referrer || '';
        const language = navigator.language || 'en';
        const screenWidth = window.screen?.width || null;
        const screenHeight = window.screen?.height || null;

        const response = await fetch('/api/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            pageUrl,
            pageTitle,
            referrer,
            language,
            screenWidth,
            screenHeight,
          }),
        });

        if (!response.ok) {
          console.error('Failed to track visit');
        }
      } catch (error) {
        // Silently fail - don't break user experience
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error tracking visit:', error);
        }
      }
    };

    // Track with a small delay to avoid blocking page load
    trackingTimeoutRef.current = setTimeout(() => {
      trackVisit();
    }, 500);

    // Cleanup on unmount
    return () => {
      if (trackingTimeoutRef.current) {
        clearTimeout(trackingTimeoutRef.current);
      }
    };
  }, [pathname]); // Track when pathname changes

  return null; // This component doesn't render anything
}

