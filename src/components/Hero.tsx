'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Store, Factory, Wrench, Users, Hospital, Search, X, Mail, Heart, ChevronDown, ChevronUp, Bell, Settings, FileText, User, Plus, Megaphone, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import type { TabType, PropertyType } from '@/types';
import { allProperties } from '@/data/sampleProperties';
import AddressAutocomplete from './AddressAutocomplete';
import { AddressSuggestion } from '@/lib/addressAutocomplete';

const tabs: TabType[] = ['For Lease', 'For Sale', 'Auctions', 'Businesses For Sale'];

const propertyTypes: { icon: any; label: PropertyType }[] = [
  { icon: Building2, label: 'Office' },
  { icon: Store, label: 'Retail' },
  { icon: Factory, label: 'Industrial' },
  { icon: Wrench, label: 'Flex' },
  { icon: Users, label: 'Coworking' },
  { icon: Hospital, label: 'Medical' },
];

const stats = [
  { number: '300K+', label: 'Active Listings' },
  { number: '13M+', label: 'Monthly Visitors' },
  { number: '$380B+', label: 'In Transaction Value' },
];

const companies = [
  { name: 'Adobe', logo: '/assets/adobe.png' },
  { name: 'Brookfield', logo: '/assets/brookfield.png' },
  { name: 'Disney', logo: '/assets/disney.png' },
  { name: 'eBay', logo: '/assets/ebay.png' },
  { name: 'FedEx', logo: '/assets/fedex.png' },
  { name: 'Nuveen', logo: '/assets/Nuveen.png' },
  { name: 'PepsiCo', logo: '/assets/pepsico.png' },
  { name: 'Walmart', logo: '/assets/walmart.png' },
];

export default function Hero() {
  const [activeTab, setActiveTab] = useState<TabType>('For Lease');
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [errors, setErrors] = useState<{ email?: string }>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Email submitted:', email);
      setIsLoginOpen(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'linkedin' | 'apple') => {
    console.log(`Login with ${provider}`);
  };

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;

    // Navigate to search results
    const params = new URLSearchParams();
    params.set('location', query);
    if (selectedType) {
      params.set('type', selectedType);
    }
    window.location.href = `/search-results?${params.toString()}`;
  };

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    // If it's a property ID (not a Google Places result), navigate to property detail
    if (suggestion.id && !suggestion.id.startsWith('place-')) {
      window.location.href = `/property/${suggestion.id}`;
    } else {
      // Navigate to search results with the selected address
      const params = new URLSearchParams();
      params.set('location', suggestion.fullAddress);
      if (selectedType) {
        params.set('type', selectedType);
      }
      window.location.href = `/search-results?${params.toString()}`;
    }
  };

  return (
    <div className="min-h-screen pt-[40px] md:pt-24 pb-16 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center hero-bg-image"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80)',
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

      <div className="relative z-10 max-w-7xl mx-auto px-5">
        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white mb-8 md:mb-8 leading-tight px-1 sm:px-2 md:px-4"
        >
          The World&apos;s <span className="text-accent-yellow drop-shadow-[0_0_25px_rgba(255,215,0,0.5)]">#1</span> Commercial
          <br />
          Real Estate Marketplace
        </motion.h1>

        {/* Search Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-lg md:rounded-xl p-4 md:p-4 shadow-2xl border border-white/20"
        >
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 md:gap-2 mb-6 md:mb-4 pb-3 md:pb-2 border-b border-white/20">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 md:px-3 py-2 md:py-1.5 font-semibold text-xs md:text-xs transition-all relative rounded-md ${
                  activeTab === tab
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-[-13px] md:bottom-[-17px] left-0 right-0 h-0.5 md:h-1 bg-accent-yellow shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Property Types */}
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide mb-6 md:mb-4 -mx-4 md:mx-0 px-4 md:px-0 touch-pan-x">
            <div className="flex md:grid md:grid-cols-6 gap-2 md:gap-2 min-w-max md:min-w-0">
              {propertyTypes.map(({ label, icon: Icon }) => (
                <motion.button
                  key={label}
                  onClick={() => setSelectedType(label)}
                  className={`flex flex-col items-center gap-1.5 md:gap-1 p-2.5 md:p-2 rounded-lg border transition-all group flex-shrink-0 w-[calc(33.333%-0.5rem)] md:w-auto ${
                    selectedType === label
                      ? 'border-accent-yellow bg-accent-yellow/20 shadow-lg shadow-accent-yellow/20'
                      : 'border-white/20'
                  }`}
                >
                  <div className={`w-8 h-8 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-all ${
                    selectedType === label
                      ? 'bg-accent-yellow text-primary-black'
                      : 'bg-transparent text-accent-yellow'
                  }`}>
                    <Icon size={16} className="md:w-3.5 md:h-3.5" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-white">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-2">
            <div className="flex-1 relative">
              <AddressAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSelect={handleAddressSelect}
                placeholder="Enter a location (City, State, or ZIP)"
                className="w-full"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              className="px-6 md:px-5 py-3 md:py-2.5 bg-accent-yellow text-primary-black rounded-lg font-bold text-sm md:text-xs flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all shadow-lg shadow-accent-yellow/30"
            >
              <Search size={18} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">Search Properties</span>
              <span className="sm:hidden">Search</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-12 md:mt-8"
        >
          <p className="text-center text-white text-base md:text-base lg:text-lg font-semibold mb-6 md:mb-6 px-4">
            For over 30 years, Cap Rate has been the trusted brand for Commercial Real Estate
          </p>

          <div className="flex md:grid md:grid-cols-3 gap-2 md:gap-3 lg:gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0 touch-pan-x">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-accent-yellow/30 rounded-lg md:rounded-lg p-3 md:p-4 lg:p-6 text-center transition-all flex-shrink-0 w-[calc(33.333vw-1rem)] md:min-w-0 md:w-auto"
              >
                <div className="text-[14px] md:text-3xl lg:text-4xl font-extrabold text-accent-yellow mb-1 md:mb-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] leading-tight">
                  {stat.number}
                </div>
                <div className="text-[8.4px] md:text-sm lg:text-base text-white font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Companies Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 md:mt-8 text-center"
        >
          <h3 className="text-lg md:text-lg lg:text-xl font-semibold text-white mb-6 md:mb-4 px-4">
            Trusted by Industry Leaders Worldwide
          </h3>

          <div className="relative overflow-hidden py-4">
            <div className="flex gap-8 md:gap-12 animate-scroll">
              {[...companies, ...companies].map((company, index) => (
                <div
                  key={`${company.name}-${index}`}
                  className="min-w-[120px] md:min-w-[120px] h-16 md:h-14 flex items-center justify-center group transition-all duration-300"
                >
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={120}
                    height={60}
                    className="object-contain w-full h-full transition-all duration-300"
                    unoptimized
                    onError={(e) => {
                      // Fallback: hide image and show text
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-text')) {
                        const fallback = document.createElement('span');
                        fallback.className = 'fallback-text font-bold text-base md:text-xl text-white';
                        fallback.textContent = company.name;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
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
                    <p className="text-sm text-custom-gray mb-4 md:mb-6">
                      Enter your email to login or create a free account
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-primary-black mb-2">
                          Email*
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-gray" size={20} />
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors({});
                            }}
                            placeholder="Enter email address"
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
                ].map((section, sectionIndex) => (
                  <div key={section.title}>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isExpandable = item.expandable;
                      const isExpanded = expandedSection === item.label;
                      const isHighlight = item.highlight;

                      return (
                        <div key={item.label}>
                          <button
                            onClick={() => {
                              if (isExpandable) {
                                setExpandedSection(expandedSection === item.label ? null : item.label);
                              } else if (item.href.startsWith('/')) {
                                window.location.href = item.href;
                                setIsSidebarOpen(false);
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

