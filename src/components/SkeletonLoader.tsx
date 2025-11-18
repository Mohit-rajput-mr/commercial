'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'text' | 'image' | 'circle';
  count?: number;
}

export function SkeletonLoader({ 
  className = '', 
  variant = 'text',
  count = 1 
}: SkeletonLoaderProps) {
  const baseClasses = 'bg-gray-200 animate-pulse rounded';
  
  const variantClasses = {
    card: 'h-64 w-full',
    text: 'h-4 w-full',
    image: 'h-48 w-full',
    circle: 'h-12 w-12 rounded-full',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <SkeletonLoader variant="image" className="h-48" />
      <div className="p-4 space-y-3">
        <SkeletonLoader variant="text" className="h-5 w-3/4" />
        <SkeletonLoader variant="text" className="h-4 w-1/2" />
        <SkeletonLoader variant="text" className="h-6 w-1/3" />
        <div className="flex gap-2 mt-4">
          <SkeletonLoader variant="text" className="h-4 w-16" />
          <SkeletonLoader variant="text" className="h-4 w-16" />
          <SkeletonLoader variant="text" className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

