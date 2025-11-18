import { useState, useEffect, useRef } from 'react';

interface UseNavbarScrollOptions {
  hideOnScrollDown?: boolean;
  showOnScrollUp?: boolean;
  scrollUpDelay?: number; // Delay in milliseconds before showing navbar on scroll up
  threshold?: number; // Scroll position threshold for always showing navbar
}

export function useNavbarScroll({
  hideOnScrollDown = true,
  showOnScrollUp = true,
  scrollUpDelay = 3000, // 3 seconds default
  threshold = 100, // Always show navbar when scroll < 100px
}: UseNavbarScrollOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollPositionRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always show navbar when at top of page
          if (currentScrollY < threshold) {
            setIsVisible(true);
            setLastScrollY(currentScrollY);
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
              scrollTimeoutRef.current = null;
            }
            lastScrollPositionRef.current = currentScrollY;
            ticking = false;
            return;
          }

          // Determine scroll direction
          const scrollingDown = currentScrollY > lastScrollPositionRef.current;
          const scrollingUp = currentScrollY < lastScrollPositionRef.current;
          const scrollDifference = Math.abs(currentScrollY - lastScrollPositionRef.current);

          // Only process if scroll difference is significant (> 5px to avoid jitter)
          if (scrollDifference < 5) {
            ticking = false;
            return;
          }

          // Hide navbar immediately on any scroll (up or down)
          if ((scrollingDown && hideOnScrollDown) || (scrollingUp && showOnScrollUp)) {
            setIsVisible(false);
            // Cancel any pending show timer
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
              scrollTimeoutRef.current = null;
            }
            // Show navbar again after 2 seconds (2000ms)
            scrollTimeoutRef.current = setTimeout(() => {
              setIsVisible(true);
            }, 2000);
          }

          lastScrollPositionRef.current = currentScrollY;
          setLastScrollY(currentScrollY);
          ticking = false;
        });

        ticking = true;
      }
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [hideOnScrollDown, showOnScrollUp, scrollUpDelay, threshold]);

  return isVisible;
}

