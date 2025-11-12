'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
      <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          className="relative h-12 w-auto cursor-pointer"
          style={{ transform: 'translateY(-60%)' }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-full h-full"
          >
            <Image
              src="/assets/logoRE.png"
              alt="Commercial RE"
              width={180}
              height={48}
              className="object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]"
              priority
            />
          </motion.div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoginClick}
            className="px-6 py-2.5 border-2 border-accent-yellow rounded-lg text-white font-semibold transition-all duration-300 hover:bg-accent-yellow hover:text-primary-black"
          >
            Log In
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/advertise')}
            className="px-6 py-2.5 bg-accent-yellow text-primary-black rounded-lg font-semibold transition-all duration-300 hover:bg-yellow-400 hover:shadow-lg hover:shadow-accent-yellow/40"
          >
            Advertise
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={handleSidebarClick}
          className="md:hidden text-white p-2"
        >
          <Menu size={24} />
        </button>
      </div>
    </motion.nav>
  );
}

