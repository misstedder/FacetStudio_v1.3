import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = 'w-full',
  height = 'h-4',
  rounded = 'md',
  className = '',
}) => {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={`${width} ${height} ${roundedClasses[rounded]} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:1000px_100%] animate-shimmer ${className}`}
      aria-hidden="true"
    />
  );
};
