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
  const router = useRouter();

  const handleLoginButtonClick = () => {
    // Dispatch event to trigger login modal in Hero section
    window.dispatchEvent(new CustomEvent('openLoginModal'));
    onClose(); // Close sidebar when opening login modal
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
        { icon: Plus, label: 'Add a Listing', href: '/advertise', expandable: true },
        { icon: Megaphone, label: 'Marketing Center', href: '/advertise' },
        { icon: HelpCircle, label: 'Help Center', href: '#' },
        { icon: Megaphone, label: 'Advertise', href: '/advertise', highlight: true },
      ],
    },
  ];

  const handleItemClick = (href: string) => {
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
              <div className="relative h-8 w-32">
                <Image
                  src="/assets/logoRE.png"
                  alt="Commercial RE"
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
                    const isExpandable = item.expandable;
                    const isExpanded = expandedSection === item.label;
                    const isHighlight = item.highlight;

                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => {
                            if (isExpandable) {
                              toggleSection(item.label);
                            } else {
                              handleItemClick(item.href);
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
                        {isExpandable && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-14 pr-6 pb-2 space-y-2">
                              <a href="/advertise" className="block py-2 text-sm text-custom-gray hover:text-primary-black">
                                List Property
                              </a>
                              <a href="/advertise" className="block py-2 text-sm text-custom-gray hover:text-primary-black">
                                Manage Listings
                              </a>
                            </div>
                          </motion.div>
                        )}
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
                onClick={handleLoginButtonClick}
                className="w-full px-6 py-3 bg-accent-yellow rounded-lg font-semibold text-primary-black hover:bg-yellow-400 transition-all"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

