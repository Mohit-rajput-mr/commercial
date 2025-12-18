'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Database, Building2, BookOpen, ChevronDown, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNavbarScroll } from '@/hooks/useNavbarScroll';
import logoRE from '../../assets/logoRE.png';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isVisible = useNavbarScroll({
    hideOnScrollDown: true,
    showOnScrollUp: true,
    scrollUpDelay: 3000, // 3 seconds
    threshold: 100,
  });

  const handleLoginClick = () => {
    // Dispatch custom event to trigger login modal in Hero
    window.dispatchEvent(new CustomEvent('openLoginModal'));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setShowUserDropdown(false);
    window.location.reload();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSidebarClick = () => {
    // Dispatch custom event to trigger sidebar menu in Hero
    window.dispatchEvent(new CustomEvent('openSidebarMenu'));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Check for logged in user
    const checkUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    };

    checkUser();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('storage', checkUser);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1], // Custom ease for smooth fly up animation
      }}
      className={`fixed top-0 left-0 right-0 w-full z-[9999] ${
        isScrolled 
          ? 'shadow-xl' 
          : ''
      } ${!isVisible ? 'pointer-events-none' : ''}`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="max-w-7xl 2xl:max-w-[90%] 3xl:max-w-[85%] 4xl:max-w-[80%] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-20 h-[40px] md:h-[68px] flex justify-between items-center">
        {/* Logo */}
        <div
          className="relative h-[28px] md:h-[48px] w-auto cursor-pointer flex items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-full h-full flex items-center"
          >
            <Image
              src={logoRE}
              alt="Cap Rate"
              width={112}
              height={28}
              className="md:w-[144px] md:h-[48px] object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]"
              priority
            />
          </motion.div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/commercial-search')}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all duration-300 text-xs flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            Commercial
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/cre-explained')}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-all duration-300 text-xs flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Learn
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/database-properties')}
            className="px-3 py-1.5 bg-accent-yellow hover:bg-yellow-400 text-primary-black rounded-lg font-semibold transition-all duration-300 text-xs flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            Database
          </motion.button>
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
              >
                <div className="w-8 h-8 bg-accent-yellow rounded-full flex items-center justify-center">
                  <User size={16} className="text-primary-black" />
                </div>
                <span className="text-white font-medium text-sm max-w-[120px] truncate">
                  {currentUser.full_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown size={16} className={`text-white transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* User Dropdown */}
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[9999]"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-primary-black truncate">
                        {currentUser.full_name || currentUser.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser.email || ''}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLoginClick}
              className="px-4 md:px-[19.2px] py-1.5 md:py-[8px] border-2 border-accent-yellow rounded-lg text-white font-semibold transition-all duration-300 hover:bg-accent-yellow hover:text-primary-black text-xs md:text-sm"
            >
              Log In
            </motion.button>
          )}
        </div>

        {/* Mobile Menu - Hamburger */}
        <div className="md:hidden flex items-center gap-1.5">
          <button
            onClick={() => router.push('/commercial-search')}
            className="text-white p-1.5 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
            title="Commercial Properties"
          >
            <Building2 size={18} />
          </button>
          <button
            onClick={() => router.push('/database-properties')}
            className="text-primary-black p-1.5 bg-accent-yellow hover:bg-yellow-400 rounded-lg transition-colors"
            title="Database Properties"
          >
            <Database size={18} />
          </button>
          <button
            onClick={handleSidebarClick}
            className="text-white p-1.5"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

