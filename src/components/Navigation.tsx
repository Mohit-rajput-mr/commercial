'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Menu, Database, Phone, Heart, Bell, Settings, ChevronDown, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNavbarScroll } from '@/hooks/useNavbarScroll';
import logoRE from '../../assets/logoRE.png';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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
    window.location.reload();
  };

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
      } else {
        setCurrentUser(null);
      }
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-dropdown-container')) {
        setUserDropdownOpen(false);
      }
    };

    checkUser();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('storage', checkUser);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkUser);
      document.removeEventListener('click', handleClickOutside);
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
            onClick={() => router.push('/favorites')}
            className="px-3 py-1.5 md:py-[8px] bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm flex items-center gap-2"
            title="My Favorites"
          >
            <Heart className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/notifications')}
            className="px-3 py-1.5 md:py-[8px] bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm flex items-center gap-2"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/preferences')}
            className="px-3 py-1.5 md:py-[8px] bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm flex items-center gap-2"
            title="My Preferences"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/contact')}
            className="px-4 md:px-[19.2px] py-1.5 md:py-[8px] bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Contact Us
          </motion.button>
          {currentUser ? (
            <div className="relative user-dropdown-container">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="px-4 md:px-[19.2px] py-1.5 md:py-[8px] bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm flex items-center gap-2"
              >
                <span>{currentUser.full_name || 'User'}</span>
                <ChevronDown size={16} className={`transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[10000] overflow-hidden">
                  <button
                    onClick={() => {
                      handleLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
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
        <div className="md:hidden flex items-center gap-2">
          {currentUser ? (
            <div className="relative user-dropdown-container">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all text-xs flex items-center gap-1.5"
              >
                <span>{currentUser.full_name || 'User'}</span>
                <ChevronDown size={14} className={`transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-[10000] overflow-hidden">
                  <button
                    onClick={() => {
                      handleLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={handleLoginClick}
                className="px-3 py-1.5 border border-accent-yellow rounded-lg text-white text-xs font-semibold hover:bg-accent-yellow hover:text-primary-black transition-all"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openSignUpModal'));
                }}
                className="px-3 py-1.5 bg-accent-yellow rounded-lg text-primary-black text-xs font-semibold hover:bg-yellow-400 transition-all"
              >
                Sign Up
              </button>
            </>
          )}
          <button
            onClick={handleSidebarClick}
            className="text-white p-2"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

