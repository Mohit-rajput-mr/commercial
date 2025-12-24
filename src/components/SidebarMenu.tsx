'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Bell, Settings, Search, Heart, FileText, User, Plus, Megaphone, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

export default function SidebarMenu({ isOpen, onClose, onLoginClick, onSignUpClick }: SidebarMenuProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
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
    // Dispatch event to trigger login modal in Hero section
    window.dispatchEvent(new CustomEvent('openLoginModal'));
    onClose(); // Close sidebar when opening login modal
    setShowLoginPrompt(false);
  };

  const handleSignUpClick = () => {
    // Dispatch event to trigger signup modal in Hero section
    window.dispatchEvent(new CustomEvent('openSignUpModal'));
    onClose(); // Close sidebar when opening signup modal
    setShowLoginPrompt(false);
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

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const menuSections = [
    {
      title: 'User',
      items: [
        { icon: Bell, label: 'Notifications', href: '#' },
        { icon: Settings, label: 'My Preferences', href: '#' },
      ],
    },
    {
      title: 'Search',
      items: [
        { icon: Search, label: 'Search For Sale', href: '/?tab=For Sale' },
        { icon: Search, label: 'Search For Lease', href: '/?tab=For Lease' },
        { icon: Search, label: 'Search Auctions', href: '/?tab=Auctions' },
        { icon: Search, label: 'Search For Businesses', href: '#' },
        { icon: Search, label: 'Find a Broker', href: '#' },
      ],
    },
    {
      title: 'Saved',
      items: [
        { icon: Heart, label: 'Saved Searches', href: '#' },
        { icon: Heart, label: 'My Favorites', href: '#' },
        { icon: FileText, label: 'My Reports', href: '#' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: User, label: 'My Leads', href: '#' },
        { icon: User, label: 'My Account', href: '#' },
      ],
    },
    {
      title: 'Tools',
      items: [
        { icon: HelpCircle, label: 'Help Center', href: '#' },
      ],
    },
  ];

  const handleItemClick = (href: string, label: string) => {
    // Check if "My Account" is clicked and user is not logged in
    if (label === 'My Account' && !currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (href.startsWith('/')) {
      router.push(href);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 hidden md:block"
            />
          </>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[300px] bg-white z-50 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="relative h-8 w-32 bg-black/80 backdrop-blur-md rounded-lg px-3 py-2 flex items-center justify-center">
                <Image
                  src="/assets/logoRE.png"
                  alt="Cap Rate"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-primary-black" />
              </button>
            </div>

            {/* Menu Sections */}
            <div className="py-4">
              {menuSections.map((section, sectionIndex) => (
                <div key={section.title}>
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    const isExpandable = (item as any).expandable || false;
                    const isExpanded = expandedSection === item.label;
                    const isHighlight = (item as any).highlight || false;

                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => {
                            if (isExpandable) {
                              toggleSection(item.label);
                            } else {
                              handleItemClick(item.href, item.label);
                            }
                          }}
                          className={`w-full flex items-center justify-between px-6 py-4 hover:bg-light-gray transition-colors ${
                            isHighlight ? 'text-accent-yellow font-semibold' : 'text-primary-black'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={20} />
                            <span>{item.label}</span>
                          </div>
                          {isExpandable && (
                            isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                  {sectionIndex < menuSections.length - 1 && (
                    <div className="h-px bg-gray-200 mx-6 my-2" />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white space-y-3">
              <button
                onClick={handleLoginButtonClick}
                className="w-full px-6 py-3 border-2 border-primary-black rounded-lg font-semibold text-primary-black hover:bg-primary-black hover:text-white transition-all"
              >
                Log In
              </button>
              <button
                onClick={handleSignUpClick}
                className="w-full px-6 py-3 bg-accent-yellow rounded-lg font-semibold text-primary-black hover:bg-yellow-400 transition-all"
              >
                Sign Up
              </button>
            </div>
            
            {/* Login/Signup Prompt Modal */}
            <AnimatePresence>
              {showLoginPrompt && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowLoginPrompt(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 flex items-center justify-center z-[70] p-4"
                  >
                    <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 text-center">
                      <div className="mb-4">
                        <User size={48} className="mx-auto text-primary-black mb-3" />
                        <h3 className="text-xl font-semibold text-primary-black mb-2">
                          Login Required
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Please log in or sign up to access your account.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={handleLoginButtonClick}
                          className="w-full px-6 py-3 border-2 border-primary-black rounded-lg font-semibold text-primary-black hover:bg-primary-black hover:text-white transition-all"
                        >
                          Log In
                        </button>
                        <button
                          onClick={handleSignUpClick}
                          className="w-full px-6 py-3 bg-accent-yellow rounded-lg font-semibold text-primary-black hover:bg-yellow-400 transition-all"
                        >
                          Sign Up
                        </button>
                        <button
                          onClick={() => setShowLoginPrompt(false)}
                          className="w-full px-6 py-3 text-gray-600 hover:text-primary-black transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

