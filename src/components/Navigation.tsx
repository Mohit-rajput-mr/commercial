'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import logoRE from '../../assets/logoRE.png';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  const handleLoginClick = () => {
    // Dispatch custom event to trigger login modal in Hero
    window.dispatchEvent(new CustomEvent('openLoginModal'));
  };

  const handleSidebarClick = () => {
    // Dispatch custom event to trigger sidebar menu in Hero
    window.dispatchEvent(new CustomEvent('openSidebarMenu'));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-primary-black/80 backdrop-blur-xl shadow-2xl border-b border-accent-yellow/20' 
          : 'bg-primary-black/70 backdrop-blur-lg'
      }`}
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
            onClick={() => router.push('/api-test')}
            className="px-4 md:px-[19.2px] py-1.5 md:py-[8px] border-2 border-blue-500 rounded-lg text-white font-semibold transition-all duration-300 hover:bg-blue-500 text-xs md:text-sm"
          >
            API Test
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoginClick}
            className="px-4 md:px-[19.2px] py-1.5 md:py-[8px] border-2 border-accent-yellow rounded-lg text-white font-semibold transition-all duration-300 hover:bg-accent-yellow hover:text-primary-black text-xs md:text-sm"
          >
            Log In
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/advertise')}
            className="px-4 md:px-[19.2px] py-1.5 md:py-[8px] bg-accent-yellow text-primary-black rounded-lg font-semibold transition-all duration-300 hover:bg-yellow-400 hover:shadow-lg hover:shadow-accent-yellow/40 text-xs md:text-sm"
          >
            Advertise
          </motion.button>
        </div>

        {/* Mobile Menu - API Test Button + Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/api-test')}
            className="px-3 py-1.5 border-2 border-blue-500 rounded-lg text-white font-semibold transition-all duration-300 hover:bg-blue-500 text-xs"
          >
            API Test
          </motion.button>
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

