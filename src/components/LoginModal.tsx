'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Heart } from 'lucide-react';
import Image from 'next/image';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSignUp }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [errors, setErrors] = useState<{ email?: string }>({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto-rotate carousel
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
  }, [isOpen]);

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
      // Handle login/signup logic here
      console.log('Email submitted:', email);
      // For now, just close the modal
      onClose();
    }
  };

  const handleSocialLogin = (provider: 'google' | 'linkedin' | 'apple') => {
    console.log(`Login with ${provider}`);
    // Implement OAuth logic here
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                  onClick={onClose}
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
  );
}

