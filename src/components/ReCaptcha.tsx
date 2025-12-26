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
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        theme?: string;
        size?: string;
        'error-callback'?: () => void;
      }) => number;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

export default function ReCaptcha({ onVerify, onExpire, theme = 'light', resetKey = 0 }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const isLoadedRef = useRef(false);

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

      // Check if grecaptcha is already loaded
      if (window.grecaptcha && window.grecaptcha.render) {
        try {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: handleVerify,
            'expired-callback': handleExpire,
            theme: theme,
            size: 'normal', // Explicitly set to normal size (shows checkbox)
            'error-callback': () => {
              onVerify(null);
            },
          });
          isLoadedRef.current = true;
        } catch (error) {
          console.error('Error rendering reCAPTCHA:', error);
        }
        return;
      }

      // Load the script if not already loaded
      const existingScript = document.querySelector('script[src*="recaptcha"]');
      if (!existingScript) {
        window.onRecaptchaLoad = () => {
          if (containerRef.current && !isLoadedRef.current) {
            try {
              widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
                sitekey: RECAPTCHA_SITE_KEY,
                callback: handleVerify,
                'expired-callback': handleExpire,
                theme: theme,
                size: 'normal', // Explicitly set to normal size (shows checkbox)
                'error-callback': () => {
                  onVerify(null);
                },
              });
              isLoadedRef.current = true;
            } catch (error) {
              console.error('Error rendering reCAPTCHA:', error);
            }
          }
        };

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      } else {
        // Script exists, wait for grecaptcha to be ready
        const checkReady = setInterval(() => {
          if (window.grecaptcha && window.grecaptcha.render && containerRef.current && !isLoadedRef.current) {
            clearInterval(checkReady);
            try {
              widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
                sitekey: RECAPTCHA_SITE_KEY,
                callback: handleVerify,
                'expired-callback': handleExpire,
                theme: theme,
                size: 'normal', // Explicitly set to normal size (shows checkbox)
                'error-callback': () => {
                  onVerify(null);
                },
              });
              isLoadedRef.current = true;
            } catch (error) {
              console.error('Error rendering reCAPTCHA:', error);
            }
          }
        }, 100);

        // Clean up interval after 10 seconds
        setTimeout(() => clearInterval(checkReady), 10000);
      }
    };

    loadRecaptcha();

    return () => {
      // Cleanup on unmount
      isLoadedRef.current = false;
    };
  }, [handleVerify, handleExpire, theme, onVerify]);

  // Reset reCAPTCHA when resetKey changes
  useEffect(() => {
    if (widgetIdRef.current !== null && window.grecaptcha && window.grecaptcha.reset) {
      window.grecaptcha.reset(widgetIdRef.current);
      onVerify(null); // Clear the token when reset
    }
  }, [resetKey, onVerify]);

  return (
    <div 
      ref={containerRef} 
      className="recaptcha-container flex justify-center"
    />
  );
}

// Export the site key for use in other components
export { RECAPTCHA_SITE_KEY };


