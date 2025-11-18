'use client';

import { motion } from 'framer-motion';

interface PageLoaderProps {
  message?: string;
  subMessage?: string;
}

export default function PageLoader({ 
  message = "Loading...", 
  subMessage = "Finding your perfect property" 
}: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black to-secondary-black flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Animated Logo */}
        <motion.div 
          className="relative w-24 h-24 mx-auto"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="absolute inset-0 rounded-2xl bg-accent-yellow animate-pulse" />
          <div className="absolute inset-2 rounded-xl bg-primary-black flex items-center justify-center">
            <span className="text-accent-yellow text-3xl font-bold">CR</span>
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white">{message}</h2>
          <p className="text-custom-gray">{subMessage}</p>
        </motion.div>

        {/* Loading Bar */}
        <div className="w-64 h-2 bg-secondary-black rounded-full overflow-hidden mx-auto relative">
          <motion.div 
            className="absolute h-full bg-accent-yellow rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "50%", "100%", "0%"] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-accent-yellow rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

