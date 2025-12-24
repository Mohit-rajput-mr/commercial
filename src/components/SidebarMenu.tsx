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
    setShowLoginPrompt(false);
    onLoginClick(); // Use the prop callback to trigger login modal
  };

  const handleSignUpButtonClick = () => {
    setShowLoginPrompt(false);
    onSignUpClick(); // Use the prop callback to trigger signup modal
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

            {/* Menu Sections */}
            <div className="py-4">
              {menuSections.map((section, sectionIndex) => (
                <div key={section.title}>
                  {section.items.map((item) => {
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
                          className={`w-full flex items-center justify-between px-4 md:px-6 py-3 md:py-4 hover:bg-white/10 transition-colors ${
                            isHighlight ? 'text-accent-yellow font-semibold' : 'text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={20} />
                            <span className="text-sm md:text-base">{item.label}</span>
                          </div>
                          {isExpandable && (
                            isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                  {sectionIndex < menuSections.length - 1 && (
                    <div className="h-px bg-white/20 mx-4 md:mx-6 my-2" />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 border-t border-white/20 bg-primary-black space-y-3">
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
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999998]"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 flex items-center justify-center z-[9999999] p-4"
                  >
                    <div className="bg-primary-black rounded-lg shadow-2xl max-w-sm w-full p-5 md:p-6 text-center border border-white/20">
                      <div className="mb-4">
                        <User size={48} className="mx-auto text-accent-yellow mb-3" />
                        <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                          Login Required
                        </h3>
                        <p className="text-white/70 text-sm">
                          Please log in or sign up to access your account.
                        </p>
                      </div>
                      <div className="space-y-3">
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
                        <button
                          onClick={() => setShowLoginPrompt(false)}
                          className="w-full px-4 md:px-6 py-2.5 md:py-3 text-white/60 hover:text-white transition-colors text-sm"
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

