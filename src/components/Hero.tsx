'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Mail, Heart, ChevronDown, ChevronUp, Bell, Settings, FileText, User, Plus, Megaphone, HelpCircle, MapPin, GraduationCap, Lock, ArrowLeft, Home, Building2, Store, Factory, Trees, Hotel, Stethoscope, Building, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [specificPropertyType, setSpecificPropertyType] = useState<string>('All'); // New: specific type filter
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { suggestions, loading: suggestionsLoading } = useLocationAutocomplete(searchQuery);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const propertyTypesScrollRef = useRef<HTMLDivElement>(null);

  // Listen for login/signup triggers from Navigation
  useEffect(() => {
    const handleLoginTrigger = () => {
      setIsLoginOpen(true);
      setIsSignUpOpen(false);
    };
    const handleSignUpTrigger = () => {
      setIsSignUpOpen(true);
      setIsLoginOpen(false);
    };
    window.addEventListener('openLoginModal', handleLoginTrigger);
    window.addEventListener('openSignUpModal', handleSignUpTrigger);
    return () => {
      window.removeEventListener('openLoginModal', handleLoginTrigger);
      window.removeEventListener('openSignUpModal', handleSignUpTrigger);
    };
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
    // Pass specific property type filter (Office, Retail, etc.)
    if (specificPropertyType !== 'All') {
      params.set('specificType', specificPropertyType);
    }
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
          className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 shadow-2xl border border-white/20 relative z-20"
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

          {/* Slidable Property Type Icons - Similar to Loopnet */}
          <div className="mb-4 relative">
            {/* Desktop Arrows */}
            <div className="hidden md:block">
              <button
                onClick={() => {
                  if (propertyTypesScrollRef.current) {
                    propertyTypesScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                  }
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => {
                  if (propertyTypesScrollRef.current) {
                    propertyTypesScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                  }
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div ref={propertyTypesScrollRef} className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 justify-start md:justify-center px-1 min-w-max md:min-w-0">
              {[
                { label: 'Residential', value: 'Residential', icon: Home },
                { label: 'All Commercial', value: 'Commercial-All', icon: Building2 },
                { label: 'Office', value: 'Commercial-Office', icon: Building },
                { label: 'Retail', value: 'Commercial-Retail', icon: Store },
                { label: 'Multifamily', value: 'Commercial-Multifamily', icon: Building2 },
                { label: 'Industrial', value: 'Commercial-Industrial', icon: Factory },
                { label: 'Land', value: 'Commercial-Land', icon: Trees },
                { label: 'Hospitality', value: 'Commercial-Hospitality', icon: Hotel },
                { label: 'Healthcare', value: 'Commercial-Healthcare', icon: Stethoscope },
                { label: 'Mixed Use', value: 'Commercial-Mixed Use', icon: Building2 },
              ].map((type) => {
                const IconComponent = type.icon;
                const isActive = 
                  (type.value === 'Residential' && propertyTypeFilter === 'Residential') ||
                  (type.value === 'Commercial-All' && propertyTypeFilter === 'Commercial' && specificPropertyType === 'All') ||
                  (type.value.startsWith('Commercial-') && type.value !== 'Commercial-All' && 
                   propertyTypeFilter === 'Commercial' && specificPropertyType === type.value.replace('Commercial-', ''));
                
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      if (type.value === 'Residential') {
                        setPropertyTypeFilter('Residential');
                        setSpecificPropertyType('All');
                      } else if (type.value === 'Commercial-All') {
                        setPropertyTypeFilter('Commercial');
                        setSpecificPropertyType('All');
                      } else {
                        setPropertyTypeFilter('Commercial');
                        setSpecificPropertyType(type.value.replace('Commercial-', ''));
                      }
                    }}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-accent-yellow text-primary-black shadow-lg'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">{type.label}</span>
                  </button>
                );
              })}
              </div>
            </div>
          </div>

          {/* Search Box */}
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col sm:flex-row gap-3 sm:gap-2 md:gap-2 w-full relative z-20">
            <div className="flex-1 relative w-full z-30">
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
                  className="absolute z-[9999] w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-80 overflow-y-auto"
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
            </div>
          </form>
        </motion.div>

        {/* Trusted Partners Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="w-full max-w-7xl mx-auto mt-8 md:mt-12 relative z-10"
        >
          <TrustedPartners />
        </motion.div>

      </div>

      {/* Use LoginModal Component */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        initialMode="login"
      />
      <LoginModal 
        isOpen={isSignUpOpen} 
        onClose={() => setIsSignUpOpen(false)}
        initialMode="signup"
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
              className="fixed left-0 top-0 h-full w-[300px] bg-primary-black z-[99999] shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
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
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>

              {/* Menu Sections */}
              <div className="py-4">
                {[
                  {
                    title: 'User',
                    items: [
                      { icon: Bell, label: 'Notifications', href: '/notifications' },
                      { icon: Settings, label: 'My Preferences', href: '/preferences' },
                    ],
                  },
                  {
                    title: 'Saved',
                    items: [
                      { icon: Heart, label: 'My Favorites', href: '/favorites' },
                    ],
                  },
                  {
                    title: 'Account',
                    items: [
                      { icon: User, label: 'My Account', href: '/account' },
                    ],
                  },
                ].map((section, sectionIndex) => (
                  <div key={section.title}>
                    {section.items.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div key={item.label}>
                          <button
                            onClick={() => {
                              if (item.href && item.href.startsWith('/')) {
                                router.push(item.href);
                                setIsSidebarOpen(false);
                              }
                            }}
                            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/10 transition-colors text-white"
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={20} />
                              <span>{item.label}</span>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                    {sectionIndex < 2 && (
                      <div className="h-px bg-white/20 mx-6 my-2" />
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Buttons - Only Contact Us for Mobile */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20 bg-primary-black">
                <button
                  onClick={() => {
                    router.push('/contact');
                    setIsSidebarOpen(false);
                  }}
                  className="w-full px-6 py-3 border-2 border-accent-yellow rounded-lg font-semibold text-accent-yellow hover:bg-accent-yellow hover:text-primary-black transition-all flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  Contact Us
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

