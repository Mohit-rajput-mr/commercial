'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Mail, Heart, ChevronDown, ChevronUp, Bell, Settings, FileText, User, Plus, Megaphone, HelpCircle, MapPin, GraduationCap, Lock, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import WhatsAppButton from './WhatsAppButton';
import AIAssistantIcon from './AIAssistantIcon';
import TrustedPartners from './TrustedPartners';
import { setAdminAuthenticated } from '@/lib/admin-storage';
import { useLocationAutocomplete, LocationSuggestion } from '@/hooks/useLocationAutocomplete';

// Only Lease and Sale tabs
const tabs = ['Lease', 'Sale'] as const;

export default function Hero() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Lease' | 'Sale'>('Lease');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { suggestions, loading: suggestionsLoading } = useLocationAutocomplete(searchQuery);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginStep, setLoginStep] = useState<'email' | 'password'>('email');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

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
  useEffect(() => {
    if (!isLoginOpen) {
      setLoginStep('email');
      setEmail('');
      setPassword('');
      setErrors({});
    }
  }, [isLoginOpen]);

  // Auto-rotate carousel
  useEffect(() => {
    if (isLoginOpen) {
      document.body.style.overflow = 'hidden';
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % 4);
      }, 4000);
      return () => {
        clearInterval(interval);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isLoginOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLoginOpen) {
        setIsLoginOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isLoginOpen]);

  const carouselSlides = [
    {
      title: 'Follow your favorite listings',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
      description: 'Get instant alerts when your saved properties are updated',
    },
    {
      title: 'Save your searches',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
      description: 'Never miss a deal with personalized search alerts',
    },
    {
      title: 'Compare properties',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
      description: 'Side-by-side comparison of your top choices',
    },
    {
      title: 'Access exclusive listings',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
      description: 'Get early access to premium commercial properties',
    },
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    
    // If email is "admin", skip validation and go to password step
    if (trimmedEmail === 'admin') {
      setLoginStep('password');
      setErrors({});
      return;
    }

    const newErrors: { email?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Email submitted:', email);
      setLoginStep('password');
      setErrors({});
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Check if admin login
    if (trimmedEmail === 'admin' && trimmedPassword === 'admin') {
      // Set admin authentication and redirect to admin panel
      setAdminAuthenticated(true);
      setIsLoginOpen(false);
      setLoginStep('email');
      setEmail('');
      setPassword('');
      setErrors({});
      router.push('/admin/dashboard');
      return;
    }

    const newErrors: { password?: string } = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Login successful:', { email, password });
      setIsLoginOpen(false);
      setLoginStep('email');
      setEmail('');
      setPassword('');
      setErrors({});
    }
  };

  const handleBackToEmail = () => {
    setLoginStep('email');
    setPassword('');
    setErrors({});
  };

  const handleSocialLogin = (provider: 'google' | 'linkedin' | 'apple') => {
    console.log(`Login with ${provider}`);
  };

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
    setDropdownOpen(false);
    setSelectedIndex(-1);
    window.location.href = `/unified-search?${params.toString()}`;
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
          <div className="flex gap-2 mb-6 sm:mb-6 md:mb-4 pb-3 sm:pb-3 md:pb-2 border-b border-white/20 justify-center">
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

      {/* Login Modal - Inside Hero Section */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[99999]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Container - Centered */}
            <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] md:max-w-[500px] overflow-hidden pointer-events-auto my-auto"
                style={{
                  position: 'relative',
                  maxHeight: '90vh',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                  <h2 className="text-xl md:text-2xl font-bold text-primary-black">Log In/Sign Up</h2>
                  <button
                    onClick={() => setIsLoginOpen(false)}
                    className="p-2 md:p-2 hover:bg-gray-100 rounded-lg transition-colors w-11 h-11 flex items-center justify-center"
                    aria-label="Close modal"
                  >
                    <X size={24} className="text-primary-black" />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                  {/* Left Column - Carousel */}
                  <div className="w-full md:w-1/2 bg-light-gray p-4 md:p-6 relative overflow-hidden min-h-[250px] md:min-h-[400px] flex-shrink-0">
                    <div className="relative h-56 md:h-80">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentSlide}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="absolute inset-0"
                        >
                          <div className="relative h-full">
                            <Image
                              src={carouselSlides[currentSlide].image}
                              alt={carouselSlides[currentSlide].title}
                              fill
                              className="object-cover rounded-lg"
                            />
                            <div className="absolute top-4 right-4">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <Heart size={20} className="text-red-500 fill-red-500" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-primary-black mb-2">
                        {carouselSlides[currentSlide].title}
                      </h3>
                      <p className="text-sm text-custom-gray">
                        {carouselSlides[currentSlide].description}
                      </p>
                    </div>
                    {/* Carousel Dots */}
                    <div className="flex gap-2 mt-4 justify-center">
                      {carouselSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentSlide
                              ? 'bg-accent-yellow w-6'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right Column - Form */}
                  <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      {loginStep === 'email' ? (
                        <motion.div
                          key="email-step"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-sm text-custom-gray mb-4 md:mb-6">
                            Enter your email to login or create a free account
                          </p>

                          <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                              <label htmlFor="email" className="block text-sm font-semibold text-primary-black mb-2">
                                Email*
                              </label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-gray" size={20} />
                                <input
                                  type="text"
                                  id="email"
                                  value={email}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setEmail(value);
                                    if (errors.email) setErrors({});
                                    // Auto-continue if user types "admin"
                                    if (value.trim().toLowerCase() === 'admin') {
                                      setTimeout(() => {
                                        setLoginStep('password');
                                        setErrors({});
                                      }, 300);
                                    }
                                  }}
                                  placeholder="text"
                                  className={`w-full pl-10 pr-4 py-3 md:py-3 min-h-[48px] border-2 rounded-lg focus:outline-none transition-all text-base ${
                                    errors.email
                                      ? 'border-red-500'
                                      : 'border-gray-300 focus:border-accent-yellow'
                                  }`}
                                />
                              </div>
                              {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                              )}
                            </div>

                            <button
                              type="submit"
                              className="w-full px-6 py-3 md:py-4 bg-accent-yellow rounded-lg font-semibold text-primary-black hover:bg-yellow-400 transition-all min-h-[48px] text-base"
                            >
                              Continue
                            </button>
                          </form>

                          <div className="mt-4 md:mt-6">
                            <p className="text-center text-sm text-custom-gray mb-4">or continue with</p>
                            <div className="flex gap-3 justify-center">
                              <button
                                onClick={() => handleSocialLogin('google')}
                                className="w-12 h-12 md:w-12 md:h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-all font-bold text-lg min-w-[48px] min-h-[48px]"
                                aria-label="Login with Google"
                              >
                                G
                              </button>
                              <button
                                onClick={() => handleSocialLogin('linkedin')}
                                className="w-12 h-12 md:w-12 md:h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all font-bold text-sm min-w-[48px] min-h-[48px]"
                                aria-label="Login with LinkedIn"
                              >
                                in
                              </button>
                              <button
                                onClick={() => handleSocialLogin('apple')}
                                className="w-12 h-12 md:w-12 md:h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all min-w-[48px] min-h-[48px]"
                                aria-label="Login with Apple"
                              >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="password-step"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="mb-4">
                            <button
                              onClick={handleBackToEmail}
                              className="flex items-center gap-2 text-sm text-custom-gray hover:text-primary-black transition-colors mb-2"
                            >
                              <ArrowLeft size={16} />
                              Back to email
                            </button>
                            <p className="text-sm text-custom-gray">
                              Enter password for <span className="font-semibold text-primary-black">{email}</span>
                            </p>
                          </div>

                          <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                              <label htmlFor="password" className="block text-sm font-semibold text-primary-black mb-2">
                                Password*
                              </label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-gray" size={20} />
                                <input
                                  type="password"
                                  id="password"
                                  value={password}
                                  onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors({});
                                  }}
                                  placeholder="Enter password"
                                  className={`w-full pl-10 pr-4 py-3 md:py-3 min-h-[48px] border-2 rounded-lg focus:outline-none transition-all text-base ${
                                    errors.password
                                      ? 'border-red-500'
                                      : 'border-gray-300 focus:border-accent-yellow'
                                  }`}
                                />
                              </div>
                              {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                              )}
                            </div>

                            <button
                              type="submit"
                              className="w-full px-6 py-3 md:py-4 bg-accent-yellow rounded-lg font-semibold text-primary-black hover:bg-yellow-400 transition-all min-h-[48px] text-base"
                            >
                              Log In
                            </button>
                          </form>

                          <div className="mt-4 text-center">
                            <a href="#" className="text-sm text-custom-gray hover:text-primary-black transition-colors">
                              Forgot password?
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

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

      {/* WhatsApp Button */}
      <WhatsAppButton phoneNumber="+1 (917) 209-6200" message="Hello! I'm interested in your properties." />

      {/* AI Assistant Icon - Above WhatsApp */}
      <AIAssistantIcon />
    </div>
  );
}

