'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Menu, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNavbarScroll } from '@/hooks/useNavbarScroll';
import logoRE from '../../assets/logoRE.png';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
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
        <div className="hidden md:flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/database-properties')}
            className="px-4 md:px-[19.2px] py-1.5 md:py-[8px] bg-accent-yellow hover:bg-yellow-400 text-primary-black rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Database Properties
          </motion.button>
          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="text-white font-medium text-sm">
                Welcome, {currentUser.full_name || 'User'}
              </span>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 md:px-[19.2px] py-1.5 md:py-[8px] border-2 border-red-500 rounded-lg text-white font-semibold transition-all duration-300 hover:bg-red-500 hover:text-white text-xs md:text-sm"
              >
                Log Out
              </motion.button>
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
          <button
            onClick={() => router.push('/database-properties')}
            className="text-primary-black p-2 bg-accent-yellow hover:bg-yellow-400 rounded-lg transition-colors"
            title="Database Properties"
          >
            <Database size={20} />
          </button>
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

