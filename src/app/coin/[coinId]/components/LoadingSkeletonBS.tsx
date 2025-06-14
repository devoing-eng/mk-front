import React from 'react';

const LoadingSkeletonBS = () => {
  return (
    <div className="space-y-4">
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-gray-700 rounded"></div>
            <div className="flex-1 h-10 bg-gray-700 rounded"></div>
          </div>
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
    </div>
  );
};

export default LoadingSkeletonBS;