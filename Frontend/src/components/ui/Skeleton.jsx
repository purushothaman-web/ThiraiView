import React from 'react';

const Skeleton = ({ 
  className = '', 
  width, 
  height, 
  variant = 'rectangular',
  animation = 'pulse',
  ...props 
}) => {
  const baseClasses = 'bg-gray-200 animate-pulse';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
    button: 'rounded-lg h-10',
    card: 'rounded-lg p-4',
    avatar: 'rounded-full w-10 h-10',
    movieCard: 'rounded-lg w-full h-64',
    profileCard: 'rounded-lg p-4 w-full'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]'
  };

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height })
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      {...props}
    />
  );
};

// Pre-built skeleton components
export const MovieCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
    <Skeleton variant="movieCard" className="w-full h-64" />
    <div className="p-4 space-y-2">
      <Skeleton variant="text" className="h-5 w-3/4" />
      <Skeleton variant="text" className="h-4 w-1/2" />
      <Skeleton variant="text" className="h-4 w-2/3" />
    </div>
  </div>
);

export const ReviewSkeleton = () => (
  <div className="border p-4 rounded bg-white dark:bg-gray-900">
    <div className="flex items-center space-x-3 mb-3">
      <Skeleton variant="avatar" />
      <div className="space-y-1">
        <Skeleton variant="text" className="h-4 w-24" />
        <Skeleton variant="text" className="h-3 w-16" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-5/6" />
      <Skeleton variant="text" className="h-4 w-4/6" />
    </div>
    <div className="mt-3 flex space-x-2">
      <Skeleton variant="button" className="w-16" />
      <Skeleton variant="button" className="w-20" />
    </div>
  </div>
);

export const CommentSkeleton = () => (
  <div className="flex items-start space-x-3 mb-4">
    <Skeleton variant="avatar" />
    <div className="flex-1">
  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-1">
          <Skeleton variant="text" className="h-3 w-20" />
          <Skeleton variant="text" className="h-3 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton variant="text" className="h-3 w-full" />
          <Skeleton variant="text" className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
    <div className="flex items-center space-x-4 mb-6">
      <Skeleton variant="avatar" className="w-20 h-20" />
      <div className="space-y-2">
        <Skeleton variant="text" className="h-6 w-32" />
        <Skeleton variant="text" className="h-4 w-24" />
        <Skeleton variant="text" className="h-4 w-40" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-3/4" />
    </div>
  </div>
);

export const FeedItemSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
    <div className="flex items-center space-x-3 mb-4">
      <Skeleton variant="avatar" />
      <div className="space-y-1">
        <Skeleton variant="text" className="h-4 w-32" />
        <Skeleton variant="text" className="h-3 w-16" />
      </div>
    </div>
    <div className="flex space-x-4">
      <Skeleton variant="movieCard" className="w-20 h-30" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="h-5 w-3/4" />
        <Skeleton variant="text" className="h-4 w-1/2" />
        <Skeleton variant="text" className="h-4 w-2/3" />
      </div>
    </div>
  </div>
);

export const NotificationSkeleton = () => (
  <div className="p-4 rounded-lg border bg-white dark:bg-gray-900">
    <div className="flex items-start space-x-3">
      <Skeleton variant="circular" className="w-8 h-8" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-3 w-20" />
      </div>
    </div>
  </div>
);

export const ListSkeleton = ({ count = 3, ItemComponent, ...props }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <ItemComponent key={index} {...props} />
    ))}
  </div>
);

export default Skeleton;
