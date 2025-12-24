'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Mail, MessageCircle, Facebook, Twitter, Instagram, Copy, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  className?: string;
  iconSize?: number;
  variant?: 'button' | 'icon';
}

export default function ShareButton({ 
  url, 
  title = 'Property',
  text = '',
  className = '',
  iconSize = 18,
  variant = 'icon'
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect OS for native share
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = typeof window !== 'undefined' && /Android/i.test(navigator.userAgent);
  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (hasNativeShare) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url,
        });
        setIsOpen(false);
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled or failed');
      }
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text || title);
    const encodedTitle = encodeURIComponent(title);

    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        // WhatsApp share with sample number (not a real person's number)
        const sampleWhatsAppNumber = '1234567890'; // Sample number
        shareUrl = `https://wa.me/${sampleWhatsAppNumber}?text=${encodedText}%20${encodedUrl}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`;
        window.location.href = shareUrl;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        break;
      case 'instagram':
        // Instagram doesn't support direct link sharing, so copy link
        handleCopyLink();
        alert('Link copied! You can paste it in your Instagram story or post.');
        return;
      default:
        break;
    }

    setIsOpen(false);
  };

  const shareOptions = [
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
    { id: 'email', label: 'Email', icon: Mail, color: 'text-blue-500' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'text-sky-500' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  ];

  if (variant === 'button') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => {
            if (hasNativeShare && isMobile) {
              handleNativeShare();
            } else {
              setIsOpen(!isOpen);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Share property"
        >
          <Share2 size={iconSize} className="text-gray-700" />
          <span className="text-sm font-medium text-gray-700">Share</span>
        </button>

        <AnimatePresence>
          {isOpen && !isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2"
            >
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Share via</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="py-1">
                {shareOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleShare(option.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Icon size={20} className={option.color} />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </button>
                  );
                })}

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  {copied ? (
                    <>
                      <Check size={20} className="text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Link copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={20} className="text-gray-500" />
                      <span className="text-sm text-gray-700">Copy link</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Icon variant (for overlays on images)
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => {
          if (hasNativeShare && isMobile) {
            handleNativeShare();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all backdrop-blur-sm"
        aria-label="Share property"
      >
        <Share2 size={iconSize} className="text-gray-700" />
      </button>

      <AnimatePresence>
        {isOpen && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2"
          >
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Share via</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-1">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleShare(option.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Icon size={20} className={option.color} />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </button>
                );
              })}

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                {copied ? (
                  <>
                    <Check size={20} className="text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Link copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={20} className="text-gray-500" />
                    <span className="text-sm text-gray-700">Copy link</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




