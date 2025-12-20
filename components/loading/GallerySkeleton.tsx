import React from 'react';
import { Skeleton } from './Skeleton';

export const GallerySkeleton: React.FC = () => {
  return (
    <div className="px-6 py-10 pb-24 animate-fade-in">
      {/* Header Skeleton */}
      <Skeleton width="w-32" height="h-8" rounded="lg" className="mb-2" />
      <Skeleton width="w-48" height="h-4" rounded="md" className="mb-8" />

      {/* Gallery Items Skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-3 border border-aura-100 flex items-center gap-4"
          >
            {/* Image Skeleton */}
            <Skeleton width="w-16" height="h-16" rounded="xl" />

            {/* Content Skeleton */}
            <div className="flex-1">
              <Skeleton width="w-32" height="h-4" rounded="md" className="mb-2" />
              <Skeleton width="w-20" height="h-3" rounded="md" />
            </div>

            {/* Action Button Skeleton */}
            <Skeleton width="w-8" height="h-8" rounded="full" />
          </div>
        ))}
      </div>
    </div>
  );
};
