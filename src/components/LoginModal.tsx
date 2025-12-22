'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Heart, User, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { setAdminAuthenticated } from '@/lib/admin-storage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp?: () => void;
  initialMode?: 'login' | 'signup';
}

export default function LoginModal({ isOpen, onClose, onSignUp, initialMode = 'login' }: LoginModalProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; name?: string; phone?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
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
  }, [isOpen, initialMode]);

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
    // Allow "admin" as a special case for admin login
    if (email.trim().toLowerCase() === 'admin') {
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newErrors: { email?: string; password?: string; name?: string; phone?: string; confirmPassword?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (email.trim().toLowerCase() !== 'admin' && password.length < 6) {
      // Allow admin password to be shorter (just "admin")
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!name) {
        newErrors.name = 'Name is required';
      } else if (name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      if (!phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!validatePhone(phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        // Check for admin login
        if (isLogin && trimmedEmail === 'admin' && trimmedPassword === 'admin') {
          // Admin login via API
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setAdminAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(data.user));
            onClose();
            router.push('/admin/dashboard');
            setLoading(false);
            return;
          } else {
            setErrors({ email: data.error || 'Login failed' });
            setLoading(false);
            return;
          }
        }

        if (isLogin) {
          // Regular user login
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setSuccessMessage('Login successful!');
            setTimeout(() => {
              onClose();
              window.location.reload();
            }, 1500);
          } else {
            setErrors({ email: data.error || 'Login failed' });
          }
        } else {
          // Signup
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name: name, phone }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            // Auto-login after successful signup
            localStorage.setItem('user', JSON.stringify(data.user));
            setSuccessMessage('Account created successfully! You are now logged in.');
            setTimeout(() => {
              onClose();
              window.location.reload();
            }, 2000);
          } else {
            setErrors({ email: data.error || 'Signup failed' });
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        setErrors({ email: 'An error occurred. Please try again.' });
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: 'Please enter your email address first' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    try {
      // TODO: Implement Supabase password reset
      // const { error } = await supabase.auth.resetPasswordForEmail(email);
      alert(`Password reset link will be sent to ${email}. (This will be fully implemented with Supabase email service)`);
    } catch (error) {
      console.error('Password reset error:', error);
      alert('An error occurred. Please try again.');
    }
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
              className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[900px] xl:max-w-[1000px] overflow-hidden pointer-events-auto my-auto"
              style={{
                position: 'relative',
                maxHeight: '90vh',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary-black">
                    {isLogin ? 'Log In' : 'Sign Up'}
                  </h2>
                  <p className="text-xs text-custom-gray mt-1">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setErrors({});
                        setPassword('');
                        setSuccessMessage('');
                        if (isLogin) {
                          setName('');
                          setPhone('');
                        }
                      }}
                      className={`${isLogin ? 'text-primary-black' : 'text-accent-yellow'} hover:underline font-semibold`}
                    >
                      {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 md:p-2 hover:bg-gray-100 rounded-lg transition-colors w-11 h-11 flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <X size={24} className="text-primary-black" />
                </button>
              </div>

              {/* Success Message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mx-4 md:mx-6 mt-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-800 font-semibold text-sm md:text-base">{successMessage}</p>
                </motion.div>
              )}

              <div className="flex flex-col md:flex-row overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                {/* Left Column - Carousel */}
                <div className="w-full md:w-1/2 lg:w-[45%] bg-light-gray p-4 md:p-6 lg:p-8 relative overflow-hidden min-h-[200px] sm:min-h-[250px] md:min-h-[400px] lg:min-h-[450px] flex-shrink-0">
                  <div className="relative h-44 sm:h-56 md:h-72 lg:h-80">
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
                <div className="w-full md:w-1/2 lg:w-[55%] p-4 md:p-6 lg:p-8 flex flex-col justify-center">
                  <p className="text-sm text-custom-gray mb-4 md:mb-6">
                    {isLogin ? 'Enter your credentials to log in' : 'Create a free account to get started'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-primary-black mb-2">
                          Full Name*
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-gray" size={20} />
                          <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            placeholder="Enter your full name"
                            className={`w-full pl-10 pr-4 py-3 md:py-3 min-h-[48px] border-2 rounded-lg focus:outline-none transition-all text-base ${
                              errors.name
                                ? 'border-red-500'
                                : 'border-gray-300 focus:border-accent-yellow'
                            }`}
                          />
                        </div>
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                      </div>
                    )}

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
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: undefined });
                          }}
                          placeholder="email"
                          className={`w-full pl-10 pr-4 py-3 md:py-3 min-h-[48px] border-2 rounded-lg focus:outline-none transition-all text-base ${
                            errors.email
                              ? 'border-red-500'
                              : 'border-gray-300 focus:border-accent-yellow'
                          }`}
                        />
                      </div>
                      <p className="text-xs text-custom-gray mt-1">
                        VIP access from email (or enter &apos;admin&apos; for admin access)
                      </p>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    {!isLogin && (
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-primary-black mb-2">
                          Phone Number*
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-gray" size={20} />
                          <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (errors.phone) setErrors({ ...errors, phone: undefined });
                            }}
                            placeholder="+1 (917) 209-6200"
                            className={`w-full pl-10 pr-4 py-3 md:py-3 min-h-[48px] border-2 rounded-lg focus:outline-none transition-all text-base ${
                              errors.phone
                                ? 'border-red-500'
                                : 'border-gray-300 focus:border-accent-yellow'
                            }`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-primary-black mb-2">
                        Password*
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-gray" size={20} />
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: undefined });
                          }}
                          placeholder="Enter password"
                          className={`w-full pl-10 pr-12 py-3 md:py-3 min-h-[48px] border-2 rounded-lg focus:outline-none transition-all text-base ${
                            errors.password
                              ? 'border-red-500'
                              : 'border-gray-300 focus:border-accent-yellow'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-gray hover:text-primary-black transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>

                    {!isLogin && (
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-primary-black mb-2">
                          Confirm Password*
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-gray" size={20} />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                            }}
                            placeholder="Confirm password"
                            className={`w-full pl-10 pr-12 py-3 md:py-3 min-h-[48px] border-2 rounded-lg focus:outline-none transition-all text-base ${
                              errors.confirmPassword
                                ? 'border-red-500'
                                : 'border-gray-300 focus:border-accent-yellow'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-gray hover:text-primary-black transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    )}

                    {isLogin && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-accent-yellow hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 md:py-4 bg-accent-yellow rounded-lg font-semibold text-primary-black hover:bg-yellow-400 transition-all min-h-[48px] text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                  </form>

                  {!isLogin && (
                    <p className="text-xs text-custom-gray mt-4 text-center">
                      By signing up, you agree to our Terms of Service and Privacy Policy
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

