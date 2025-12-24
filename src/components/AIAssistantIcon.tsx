'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import DraggableAIChat from './DraggableAIChat';

export default function AIAssistantIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const eyeLeftRef = useRef<HTMLDivElement>(null);
  const eyeRightRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const handleIconClick = () => {
    setIsOpen(!isOpen);
    
    // Add bounce animation
    if (iconRef.current) {
      iconRef.current.style.animation = 'bounce 0.5s ease';
      setTimeout(() => {
        if (iconRef.current) {
          iconRef.current.style.animation = '';
        }
      }, 500);
    }
  };

  return (
    <>
      {/* AI Assistant Icon Button */}
      <motion.div
        ref={iconRef}
        className="fixed bottom-[4rem] sm:bottom-[4.5rem] md:bottom-[5rem] right-4 sm:right-5 md:right-6 w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 z-[60] cursor-pointer pointer-events-auto"
        onClick={handleIconClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Main Circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-yellow via-accent-yellow to-orange-500 shadow-lg transition-shadow hover:shadow-xl hover:shadow-accent-yellow/50" />

        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Eyes Container - AI Text */}
        <div className="absolute inset-0 flex items-start justify-center gap-2 text-primary-black z-10 pointer-events-none" style={{ top: '10%', letterSpacing: '3px' }}>
          <motion.div
            ref={eyeLeftRef}
            className="text-lg font-bold transition-transform duration-100 origin-center"
            animate={{
              textShadow: [
                '0 0 5px rgba(255, 215, 0, 0.5)',
                '0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 165, 0, 0.8)',
                '0 0 5px rgba(255, 215, 0, 0.5)',
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            A
          </motion.div>
          <motion.div
            ref={eyeRightRef}
            className="text-lg font-bold transition-transform duration-100 origin-center"
            animate={{
              textShadow: [
                '0 0 5px rgba(255, 215, 0, 0.5)',
                '0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 165, 0, 0.8)',
                '0 0 5px rgba(255, 215, 0, 0.5)',
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            I
          </motion.div>
        </div>

        {/* Assistant Text as Curved Smile - Animated */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 56 56">
          <defs>
            <path id="curve-assistant-smile" d="M 3,35 Q 28,61 53,35" fill="transparent" />
          </defs>
          <motion.text
            className="text-primary-black"
            style={{ 
              fontSize: '7px', 
              textTransform: 'uppercase',
              fontWeight: '900',
              stroke: 'currentColor',
              strokeWidth: '0.3px',
              fill: 'currentColor',
            }}
            animate={{
              letterSpacing: ['0.5px', '2.5px', '0.5px'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1,
            }}
          >
            <textPath href="#curve-assistant-smile" startOffset="50%" textAnchor="middle">
              assistant
            </textPath>
          </motion.text>
        </svg>

        {/* Sparkles - Show when chat is open */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white rounded-full"
            style={{
              top: i === 1 ? '10%' : i === 2 ? '20%' : i === 3 ? '85%' : i === 4 ? '50%' : i === 5 ? '50%' : '70%',
              left: i === 1 ? '90%' : i === 2 ? '5%' : i === 3 ? '5%' : i === 4 ? '0%' : i === 5 ? '100%' : '10%',
            }}
            animate={isOpen ? {
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            } : {
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 1,
              repeat: isOpen ? Infinity : 0,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Draggable AI Chat Component */}
      <DraggableAIChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
