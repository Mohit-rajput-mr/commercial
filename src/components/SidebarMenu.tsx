'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Settings, Heart, FileText, HelpCircle, Phone, LogOut, Home, Building2, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

export default function SidebarMenu({ isOpen, onClose, onLoginClick, onSignUpClick }: SidebarMenuProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, [isOpen]);

  const handleLoginButtonClick = () => {
    onLoginClick();
    onClose();
  };

  const handleSignUpButtonClick = () => {
    onSignUpClick();
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    onClose();
    router.push('/');
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Simplified menu items with working links
  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Building2, label: 'Commercial Properties', href: '/commercial-search' },
    { icon: MapPin, label: 'Residential Properties', href: '/residential?location=Miami' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: Settings, label: 'Preferences', href: '/preferences' },
    { icon: Heart, label: 'My Favorites', href: '/favorites' },
    { icon: FileText, label: 'Articles', href: '/articles' },
    { icon: HelpCircle, label: 'CRE Explained', href: '/cre-explained' },
    { icon: Phone, label: 'Contact Us', href: '/contact' },
  ];

  const handleItemClick = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <>
      {/* Backdrop - covers everything including navbar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999998]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - highest z-index to be on top of everything */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[280px] md:w-[300px] bg-primary-black z-[999999] shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/20">
              <div className="relative h-8 w-32">
                <Image
                  src="/assets/logoRE.png"
                  alt="Cap Rate"
                  fill
                  className="object-contain object-left"
                  sizes="128px"
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* User Info (if logged in) */}
            {currentUser && (
              <div className="px-4 md:px-6 py-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-yellow/20 flex items-center justify-center">
                    <span className="text-accent-yellow font-semibold text-lg">
                      {currentUser.name?.charAt(0)?.toUpperCase() || currentUser.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {currentUser.name || 'User'}
                    </p>
                    <p className="text-white/60 text-xs">
                      {currentUser.email || ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="py-4 pb-32">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleItemClick(item.href)}
                    className="w-full flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 hover:bg-white/10 transition-colors text-white"
                  >
                    <Icon size={20} className="text-white/80" />
                    <span className="text-sm md:text-base">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 border-t border-white/20 bg-primary-black space-y-3">
              {currentUser ? (
                <>
                  {/* Logged in - Show Contact and Logout */}
                  <button
                    onClick={() => handleItemClick('/contact')}
                    className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-accent-yellow rounded-lg font-semibold text-primary-black hover:bg-yellow-400 transition-all text-sm md:text-base flex items-center justify-center gap-2"
                  >
                    <Phone size={18} />
                    Contact Us
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 md:px-6 py-2.5 md:py-3 border-2 border-white/30 rounded-lg font-semibold text-white/80 hover:bg-white/10 transition-all text-sm md:text-base flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  {/* Not logged in - Show Login and Sign Up */}
                  <button
                    onClick={handleLoginButtonClick}
                    className="w-full px-4 md:px-6 py-2.5 md:py-3 border-2 border-accent-yellow rounded-lg font-semibold text-accent-yellow hover:bg-accent-yellow hover:text-primary-black transition-all text-sm md:text-base"
                  >
                    Log In
                  </button>
                  <button
                    onClick={handleSignUpButtonClick}
                    className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-accent-yellow rounded-lg font-semibold text-primary-black hover:bg-yellow-400 transition-all text-sm md:text-base"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

