'use client';

import { useEffect, useRef, useCallback, memo, useState } from 'react';

const RECAPTCHA_SITE_KEY = '6Le5oTcsAAAAANhvkAcwoh14IzR2K-whAkgYf2TO';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  resetKey?: number; // Add reset key to force reset
  showVerificationStatus?: boolean; // Show checkmark when verified
}

declare global {
  interface Window {
    grecaptcha?: {
      ready?: (callback: () => void) => void;
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        theme?: string;
        size?: string;
        'error-callback'?: () => void;
      }) => number;
      reset?: (widgetId?: number) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

function ReCaptcha({ onVerify, onExpire, theme = 'light', resetKey = 0, showVerificationStatus = true }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const isLoadedRef = useRef(false);
  const instanceIdRef = useRef<string>(`recaptcha-${Date.now()}-${Math.random()}`);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = useCallback((token: string | null) => {
    setIsVerified(!!token);
    onVerify(token);
  }, [onVerify]);

  const handleExpire = useCallback(() => {
    setIsVerified(false);
    onVerify(null);
    onExpire?.();
  }, [onVerify, onExpire]);

  useEffect(() => {
    const loadRecaptcha = () => {
      if (!containerRef.current) return;

      // Check if container already has reCAPTCHA rendered - do this first
      const hasRecaptcha = containerRef.current.querySelector('iframe[src*="recaptcha"]') ||
                          containerRef.current.querySelector('#rc-imageselect-target') ||
                          containerRef.current.querySelector('.g-recaptcha') ||
                          containerRef.current.getAttribute('data-recaptcha-rendered') === 'true';

      if (hasRecaptcha && isLoadedRef.current) {
        // Already rendered and loaded, don't try again
        return;
      }

      // If we have a widget ID but container was cleared, reset the state
      if (hasRecaptcha && widgetIdRef.current === null) {
        // reCAPTCHA exists but we lost track of widget ID - mark as loaded
        isLoadedRef.current = true;
        return;
      }

      if (isLoadedRef.current && !hasRecaptcha) {
        // Was loaded but container was cleared - reset state
        isLoadedRef.current = false;
        widgetIdRef.current = null;
      }

      if (isLoadedRef.current) return;

      const renderRecaptcha = () => {
        if (!containerRef.current || !window.grecaptcha?.render) {
          return false;
        }

        // Double-check before rendering
        const stillHasRecaptcha = containerRef.current.querySelector('iframe[src*="recaptcha"]') ||
                                  containerRef.current.querySelector('#rc-imageselect-target') ||
                                  containerRef.current.querySelector('.g-recaptcha');

        if (stillHasRecaptcha) {
          // reCAPTCHA already exists, just mark as loaded
          isLoadedRef.current = true;
          if (containerRef.current) {
            containerRef.current.setAttribute('data-recaptcha-rendered', 'true');
          }
          return true;
        }

        try {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: handleVerify,
            'expired-callback': handleExpire,
            theme: theme,
            size: 'normal',
            'error-callback': () => {
              console.error('reCAPTCHA error callback triggered');
              onVerify(null);
            },
          });
          
          // Mark as rendered
          if (containerRef.current) {
            containerRef.current.setAttribute('data-recaptcha-rendered', 'true');
          }
          
          isLoadedRef.current = true;
          return true;
        } catch (error) {
          // If error is about already rendered, check if it actually exists
          if (error instanceof Error && error.message.includes('already been rendered')) {
            const actuallyHasRecaptcha = containerRef.current?.querySelector('iframe[src*="recaptcha"]') ||
                                        containerRef.current?.querySelector('#rc-imageselect-target');
            
            if (actuallyHasRecaptcha) {
              // It actually exists, just mark as loaded
              isLoadedRef.current = true;
              if (containerRef.current) {
                containerRef.current.setAttribute('data-recaptcha-rendered', 'true');
              }
              return true;
            }
            // Doesn't actually exist, clear and try to recover
            if (containerRef.current) {
              containerRef.current.innerHTML = '';
              containerRef.current.removeAttribute('data-recaptcha-rendered');
            }
          }
          // Don't log error if it's the "already rendered" case and we handled it
          if (!(error instanceof Error && error.message.includes('already been rendered'))) {
            console.error('Error rendering reCAPTCHA:', error);
          }
          return false;
        }
      };

      // Check if grecaptcha is already loaded
      if (window.grecaptcha?.render) {
        if (window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            if (!isLoadedRef.current && containerRef.current) {
              renderRecaptcha();
            }
          });
        } else {
          // If ready is not available, render directly
          if (!isLoadedRef.current && containerRef.current) {
            renderRecaptcha();
          }
        }
        return;
      }

      // Load the script if not already loaded
      const existingScript = document.querySelector('script[src*="recaptcha"]');
      if (!existingScript) {
        const uniqueId = `onRecaptchaLoad_${Date.now()}`;
        (window as any)[uniqueId] = () => {
          if (containerRef.current && !isLoadedRef.current) {
            if (window.grecaptcha?.ready) {
              window.grecaptcha.ready(() => {
                renderRecaptcha();
              });
            } else {
              renderRecaptcha();
            }
          }
          delete (window as any)[uniqueId];
        };

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?onload=${uniqueId}&render=explicit`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          console.error('Failed to load reCAPTCHA script');
          delete (window as any)[uniqueId];
        };
        document.head.appendChild(script);
      } else {
        // Script exists, wait for grecaptcha to be ready
        const checkReady = setInterval(() => {
          if (window.grecaptcha?.render && containerRef.current && !isLoadedRef.current) {
            clearInterval(checkReady);
            if (window.grecaptcha.ready) {
              window.grecaptcha.ready(() => {
                renderRecaptcha();
              });
            } else {
              renderRecaptcha();
            }
          }
        }, 100);

        // Clean up interval after 10 seconds
        setTimeout(() => {
          clearInterval(checkReady);
          if (!isLoadedRef.current) {
            console.warn('reCAPTCHA failed to load within timeout');
          }
        }, 10000);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      loadRecaptcha();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Don't clear on unmount if component is just re-rendering
      // Only reset the loaded flag, but keep the widget if it exists
      // This prevents reCAPTCHA from disappearing during form interactions
    };
  }, [handleVerify, handleExpire, theme]);

  // Reset reCAPTCHA when resetKey changes
  useEffect(() => {
    if (resetKey > 0 && containerRef.current) {
      setIsVerified(false); // Clear verification status
      // Only reset if we have a valid widget ID
      if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
          onVerify(null); // Clear the token when reset
        } catch (error) {
          // If reset fails, try to find the widget by checking the container
          const hasRecaptcha = containerRef.current.querySelector('iframe[src*="recaptcha"]');
          if (hasRecaptcha) {
            // reCAPTCHA still exists, just clear the token
            onVerify(null);
          } else {
            // reCAPTCHA was removed, need to re-render
            isLoadedRef.current = false;
            widgetIdRef.current = null;
            containerRef.current.removeAttribute('data-recaptcha-rendered');
          }
        }
      } else {
        // No widget ID but might have reCAPTCHA - check and reset if needed
        const hasRecaptcha = containerRef.current.querySelector('iframe[src*="recaptcha"]');
        if (hasRecaptcha) {
          // Clear token but keep widget
          onVerify(null);
        }
      }
    }
  }, [resetKey, onVerify, handleVerify, handleExpire, theme]);

  return (
    <div className="relative">
      <div 
        key={instanceIdRef.current}
        ref={containerRef} 
        className="recaptcha-container flex justify-center min-h-[78px]"
        style={{ minHeight: '78px' }}
        data-recaptcha-instance={instanceIdRef.current}
      />
      {showVerificationStatus && isVerified && (
        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg" title="reCAPTCHA verified">
          <svg 
            className="w-4 h-4 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// Export the site key for use in other components
export { RECAPTCHA_SITE_KEY };

// Memoize to prevent unnecessary re-renders that cause reCAPTCHA to disappear
export default memo(ReCaptcha, (prevProps, nextProps) => {
  // Only re-render if resetKey changes (for reset functionality)
  // or theme changes (for theme switching)
  // Don't re-render for onVerify/onExpire changes as they're callbacks
  return prevProps.resetKey === nextProps.resetKey && 
         prevProps.theme === nextProps.theme;
});


