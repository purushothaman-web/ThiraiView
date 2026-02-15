import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`bg-gray-800 animate-pulse rounded-md ${className}`}></div>
  );
};

export const MovieCardSkeleton = () => {
  return (
    <div className="bg-brand-gray rounded-xl overflow-hidden shadow-xl border border-gray-800">
       <div className="aspect-[2/3] bg-gray-800 animate-pulse"></div>
       <div className="p-4 space-y-2">
          <div className="h-6 bg-gray-800 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-800 rounded animate-pulse w-1/4"></div>
       </div>
    </div>
  );
};

export default Skeleton;
