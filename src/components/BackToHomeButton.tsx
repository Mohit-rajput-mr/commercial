'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function BackToHomeButton() {
  const router = useRouter();
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => router.back()}
      className="fixed bottom-4 sm:bottom-5 md:bottom-6 right-4 sm:right-5 md:right-6 z-50 bg-accent-yellow text-primary-black px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3 rounded-full shadow-2xl hover:shadow-accent-yellow/50 transition-all flex items-center gap-2 font-bold group text-sm sm:text-base"
      title="Go Back"
    >
      <ArrowLeft size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
      <span className="hidden sm:inline">Go Back</span>
    </motion.button>
  );
}

