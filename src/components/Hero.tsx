'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Mail, Heart, ChevronDown, ChevronUp, Bell, Settings, FileText, User, Plus, Megaphone, HelpCircle, MapPin, GraduationCap, Lock, ArrowLeft, Database } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import TrustedPartners from './TrustedPartners';
import LoginModal from './LoginModal';
import { setAdminAuthenticated } from '@/lib/admin-storage';
import { useLocationAutocomplete, LocationSuggestion } from '@/hooks/useLocationAutocomplete';

// Sale and Lease tabs (Sale first, Lease second)
const tabs = ['Sale', 'Lease'] as const;

export default function Hero() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Lease' | 'Sale'>('Sale');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'Residential' | 'Commercial'>('Residential');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { suggestions, loading: suggestionsLoading } = useLocationAutocomplete(searchQuery);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Listen for login trigger from Navigation
  useEffect(() => {
    const handleLoginTrigger = () => {
      setIsLoginOpen(true);
    };
    window.addEventListener('openLoginModal', handleLoginTrigger);
    return () => window.removeEventListener('openLoginModal', handleLoginTrigger);
  }, []);

  // Listen for sidebar trigger from Navigation
  useEffect(() => {
    const handleSidebarTrigger = () => {
      setIsSidebarOpen(true);
    };
    window.addEventListener('openSidebarMenu', handleSidebarTrigger);
    return () => window.removeEventListener('openSidebarMenu', handleSidebarTrigger);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  // Reset login step when modal closes
  // Login modal state is now managed by LoginModal component

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleSearch = (location?: string) => {
    const query = (location || searchQuery.trim());
    if (!query) return;
    const params = new URLSearchParams();
    params.set('location', query);
    // Pass activeTab (Lease/Sale) to search
    const status = activeTab === 'Sale' ? 'ForSale' : 'ForRent';
    params.set('status', status);
    // Pass property type filter
    params.set('propertyType', propertyTypeFilter);
    setDropdownOpen(false);
    setSelectedIndex(-1);
    
    // Route to different pages based on property type filter
    if (propertyTypeFilter === 'Commercial') {
      // Commercial properties go to commercial-search page
      window.location.href = `/commercial-search?${params.toString()}`;
    } else {
      // Residential goes to unified-search page
      window.location.href = `/unified-search?${params.toString()}`;
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    let location = '';
    switch (suggestion.area_type) {
      case 'city':
        location = `${suggestion.city || ''}, ${suggestion.state_code || ''}`.trim();
        break;
      case 'neighborhood':
        location = `${suggestion.name || ''}, ${suggestion.city || ''}, ${suggestion.state_code || ''}`.trim();
        break;
      case 'school':
        location = `${suggestion.name || ''}, ${suggestion.city || ''}, ${suggestion.state_code || ''}`.trim();
        break;
      case 'postal_code':
        location = `${suggestion.postal_code || ''}, ${suggestion.city || ''}, ${suggestion.state_code || ''}`.trim();
        break;
      case 'address':
        location = suggestion.full_address || '';
        break;
      case 'county':
        location = `${suggestion.county || ''}, ${suggestion.state_code || ''}`.trim();
        break;
      default:
        location = suggestion.full_address || suggestion.name || '';
    }
    setSearchQuery(location);
    handleSearch(location);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDropdownOpen(true);
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="min-h-screen pb-16 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center hero-bg-image"
        style={{
          backgroundImage: 'url(https://media.timeout.com/images/103782812/image.jpg)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-black/70 via-primary-black/60 to-secondary-black/70" />
      
      {/* Animated Overlay Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, #ffd700 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'scroll 20s linear infinite'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-5 md:px-6 pt-[70px] flex flex-col justify-center items-center min-h-[calc(100vh-70px)]">
        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white mb-6 sm:mb-8 md:mb-8 leading-tight w-full max-w-4xl mx-auto"
        >
          Trusted Commercial <span className="text-accent-yellow">Real Estate</span> Deal Management Professional.
        </motion.h1>

        {/* Search Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 shadow-2xl border border-white/20"
        >
          {/* Tabs - Only Lease and Sale, centered */}
          <div className="flex gap-2 mb-4 pb-3 border-b border-white/20 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'Lease' | 'Sale')}
                className={`px-6 sm:px-8 md:px-10 py-2 sm:py-2.5 md:py-2 font-semibold text-sm sm:text-base md:text-base transition-all relative rounded-md ${
                  activeTab === tab
                    ? 'text-primary-black bg-accent-yellow'
                    : 'text-white bg-white/10 hover:bg-white/20'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-[-13px] sm:bottom-[-13px] md:bottom-[-17px] left-0 right-0 h-0.5 sm:h-0.5 md:h-1 bg-accent-yellow shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Property Type Filters - Residential, Commercial */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {(['Residential', 'Commercial'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setPropertyTypeFilter(type)}
                className={`px-4 sm:px-5 md:px-6 py-2 font-semibold text-xs sm:text-sm md:text-sm transition-all rounded-md ${
                  propertyTypeFilter === type
                    ? 'text-primary-black bg-accent-yellow shadow-lg'
                    : 'text-white bg-white/10 hover:bg-white/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col sm:flex-row gap-3 sm:gap-2 md:gap-2 w-full">
            <div className="flex-1 relative w-full">
              <input
                ref={inputRef}
                className="w-full px-4 sm:px-4 md:px-4 py-3 sm:py-3 md:py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-sm sm:text-sm md:text-base text-white placeholder-gray-300 focus:outline-none focus:border-accent-yellow focus:bg-white/15 transition-all pr-10"
                placeholder="Enter a location (City, State, or ZIP)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDropdownOpen(e.target.value.length >= 2);
                  setSelectedIndex(-1);
                }}
                onFocus={() => {
                  if (searchQuery.length >= 2 && suggestions.length > 0) {
                    setDropdownOpen(true);
                  }
                }}
                onKeyDown={handleKeyPress}
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDropdownOpen(false);
                    setSelectedIndex(-1);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-20"
                  tabIndex={-1}
                >
                  <X size={16} />
                </button>
              )}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                {suggestionsLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-yellow"></div>
                ) : (
                  <Search size={18} className="sm:w-5 sm:h-5 md:w-5 md:h-5" />
                )}
              </span>
              
              {/* Autocomplete Dropdown */}
              {dropdownOpen && suggestions.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-80 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => {
                    let displayText = '';
                    switch (suggestion.area_type) {
                      case 'city':
                        displayText = `${suggestion.city || ''}, ${suggestion.state_code || ''}`.trim();
                        break;
                      case 'neighborhood':
                        displayText = `${suggestion.name || ''}, ${suggestion.city || ''}, ${suggestion.state_code || ''}`.trim();
                        break;
                      case 'school':
                        displayText = `${suggestion.name || ''}, ${suggestion.city || ''}, ${suggestion.state_code || ''}`.trim();
                        break;
                      case 'postal_code':
                        displayText = `${suggestion.postal_code || ''}, ${suggestion.city || ''}, ${suggestion.state_code || ''}`.trim();
                        break;
                      case 'address':
                        displayText = suggestion.full_address || '';
                        break;
                      case 'county':
                        displayText = `${suggestion.county || ''}, ${suggestion.state_code || ''}`.trim();
                        break;
                      default:
                        displayText = suggestion.full_address || suggestion.name || '';
                    }
                    
                    return (
                      <button
                        key={suggestion.slug_id || index}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                          selectedIndex === index ? 'bg-accent-yellow/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary-black truncate">{displayText}</p>
                            <p className="text-xs text-gray-500 capitalize">{suggestion.area_type.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-6 sm:px-5 md:px-5 py-3 sm:py-3 md:py-2.5 bg-accent-yellow text-primary-black rounded-lg font-bold text-sm sm:text-sm md:text-base flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all shadow-lg shadow-accent-yellow/30"
              >
                <Search size={18} className="sm:w-5 sm:h-5 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Search Properties</span>
                <span className="sm:hidden">Search</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => router.push('/database-properties')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-4 sm:px-4 md:px-4 py-3 sm:py-3 md:py-2.5 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg font-semibold text-sm sm:text-sm md:text-base flex items-center justify-center gap-2 hover:bg-white/30 transition-all"
              >
                <Database size={18} className="sm:w-5 sm:h-5 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Database Properties</span>
                <span className="sm:hidden">Database</span>
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Trusted Partners Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="w-full max-w-7xl mx-auto mt-8 md:mt-12"
        >
          <TrustedPartners />
        </motion.div>

      </div>

      {/* Use LoginModal Component */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />

      {/* Sidebar Menu - Inside Hero Section */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998] md:hidden"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[99998] hidden md:block"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[300px] bg-white z-[99999] shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="relative h-8 w-32">
                  <Image
                    src="/assets/logoRE.png"
                    alt="Cap Rate"
                    fill
                    className="object-contain object-left"
                  />
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-primary-black" />
                </button>
              </div>

              {/* Menu Sections */}
              <div className="py-4">
                {[
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
                      { icon: Search, label: 'Search Auctions', href: '/?tab=Auctions' },
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
                      { icon: Search, label: 'Zillow API 2.0', href: '/zillow' },
                    ],
                  },
                ].map((section, sectionIndex) => (
                  <div key={section.title}>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isExpandable = false;
                      const isExpanded = false;

                      return (
                        <div key={item.label}>
                          <button
                            onClick={() => {
                              if (item.href && item.href.startsWith('/')) {
                                window.location.href = item.href;
                                setIsSidebarOpen(false);
                              }
                            }}
                            className="w-full flex items-center justify-between px-6 py-4 hover:bg-light-gray transition-colors text-primary-black"
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={20} />
                              <span>{item.label}</span>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                    {sectionIndex < 4 && (
                      <div className="h-px bg-gray-200 mx-6 my-2" />
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Buttons */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white space-y-3">
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsLoginOpen(true);
                  }}
                  className="w-full px-6 py-3 border-2 border-primary-black rounded-lg font-semibold text-primary-black hover:bg-primary-black hover:text-white transition-all"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsLoginOpen(true);
                  }}
                  className="w-full px-6 py-3 bg-accent-yellow rounded-lg font-semibold text-primary-black hover:bg-yellow-400 transition-all"
                >
                  Sign Up
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

