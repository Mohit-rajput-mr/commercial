'use client';

import { useEffect, useRef, useCallback } from 'react';

const RECAPTCHA_SITE_KEY = '6Le5oTcsAAAAANhvkAcwoh14IzR2K-whAkgYf2TO';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  resetKey?: number; // Add reset key to force reset
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

export default function ReCaptcha({ onVerify, onExpire, theme = 'light', resetKey = 0 }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const isLoadedRef = useRef(false);
  const instanceIdRef = useRef<string>(`recaptcha-${Date.now()}-${Math.random()}`);

  const handleVerify = useCallback((token: string) => {
    onVerify(token);
  }, [onVerify]);

  const handleExpire = useCallback(() => {
    onVerify(null);
    onExpire?.();
  }, [onVerify, onExpire]);

  useEffect(() => {
    const loadRecaptcha = () => {
      if (isLoadedRef.current || !containerRef.current) return;

      const renderRecaptcha = () => {
        if (!containerRef.current || !window.grecaptcha?.render) {
          return false;
        }

        // Check if container already has reCAPTCHA rendered
        const hasRecaptcha = containerRef.current.querySelector('iframe[src*="recaptcha"]') ||
                            containerRef.current.querySelector('#rc-imageselect-target') ||
                            containerRef.current.getAttribute('data-recaptcha-rendered') === 'true';

        if (hasRecaptcha && isLoadedRef.current) {
          // Already rendered, don't try again
          return true;
        }

        try {
          // Clear container completely before rendering
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
            containerRef.current.removeAttribute('data-recaptcha-rendered');
          }

          // Clear any existing widget ID
          widgetIdRef.current = null;
          isLoadedRef.current = false;

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
          console.error('Error rendering reCAPTCHA:', error);
          // If error is about already rendered, don't retry - just mark as loaded
          if (error instanceof Error && error.message.includes('already been rendered')) {
            // Container already has reCAPTCHA, mark as loaded
            if (containerRef.current) {
              containerRef.current.setAttribute('data-recaptcha-rendered', 'true');
            }
            isLoadedRef.current = true;
            return true; // Return true to prevent further attempts
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
      // Cleanup on unmount - clear container and reset state
      const container = containerRef.current;
      if (container) {
        container.innerHTML = '';
      }
      widgetIdRef.current = null;
      isLoadedRef.current = false;
    };
  }, [handleVerify, handleExpire, theme, onVerify]);

  // Reset reCAPTCHA when resetKey changes
  useEffect(() => {
    if (resetKey > 0) {
      if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
          onVerify(null); // Clear the token when reset
        } catch (error) {
          console.error('Error resetting reCAPTCHA:', error);
        }
      }
      // If reset fails or widget doesn't exist, clear container and re-render
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        isLoadedRef.current = false;
        widgetIdRef.current = null;
        // Trigger re-render after clearing
        setTimeout(() => {
          if (containerRef.current && window.grecaptcha?.render) {
            try {
              widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
                sitekey: RECAPTCHA_SITE_KEY,
                callback: handleVerify,
                'expired-callback': handleExpire,
                theme: theme,
                size: 'normal',
                'error-callback': () => {
                  onVerify(null);
                },
              });
              isLoadedRef.current = true;
            } catch (error) {
              console.error('Error re-rendering reCAPTCHA after reset:', error);
            }
          }
        }, 100);
      }
    }
  }, [resetKey, onVerify, handleVerify, handleExpire, theme]);

  return (
    <div 
      key={instanceIdRef.current}
      ref={containerRef} 
      className="recaptcha-container flex justify-center min-h-[78px]"
      style={{ minHeight: '78px' }}
      data-recaptcha-instance={instanceIdRef.current}
    />
  );
}

// Export the site key for use in other components
export { RECAPTCHA_SITE_KEY };


