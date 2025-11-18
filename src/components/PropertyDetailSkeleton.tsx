'use client';

import { SkeletonLoader } from './SkeletonLoader';

export default function PropertyDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-[50px] w-full"></div>
      <div className="max-w-6xl mx-auto py-10 px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image Gallery Skeleton */}
          <div className="md:w-1/2">
            <SkeletonLoader variant="image" className="h-96 w-full rounded-lg mb-4" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonLoader key={i} variant="image" className="h-20 w-20 rounded" />
              ))}
            </div>
          </div>

          {/* Property Info Skeleton */}
          <div className="md:w-1/2 space-y-6">
            <div>
              <SkeletonLoader variant="text" className="h-8 w-3/4 mb-2" />
              <SkeletonLoader variant="text" className="h-4 w-1/2 mb-4" />
              <SkeletonLoader variant="text" className="h-10 w-1/3" />
            </div>
            
            <div className="space-y-3">
              <SkeletonLoader variant="text" className="h-4 w-full" />
              <SkeletonLoader variant="text" className="h-4 w-full" />
              <SkeletonLoader variant="text" className="h-4 w-3/4" />
            </div>

            <div className="flex gap-4">
              <SkeletonLoader variant="text" className="h-12 w-32" />
              <SkeletonLoader variant="text" className="h-12 w-32" />
            </div>
          </div>
        </div>

        {/* Details Section Skeleton */}
        <div className="mt-12 space-y-6">
          <SkeletonLoader variant="text" className="h-6 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <SkeletonLoader variant="text" className="h-4 w-16" />
                <SkeletonLoader variant="text" className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

