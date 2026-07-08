import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-dark-border">
        <Skeleton className="h-6 w-20 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-12 rounded-lg" />
          <Skeleton className="h-8 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const GraphSkeleton = () => {
  return (
    <div className="border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/5" />
      </div>
      <div className="flex items-end gap-3 flex-grow h-[180px] pb-4">
        <Skeleton className="w-full h-[40%]" />
        <Skeleton className="w-full h-[70%]" />
        <Skeleton className="w-full h-[90%]" />
        <Skeleton className="w-full h-[50%]" />
        <Skeleton className="w-full h-[85%]" />
        <Skeleton className="w-full h-[60%]" />
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-50 dark:border-dark-border">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
};

export const ListSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header section skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      
      {/* Cards grids */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-4 border border-gray-100 dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card space-y-3 shadow-sm">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-7 w-2/3" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GraphSkeleton />
        </div>
        <div className="space-y-6">
          <div className="p-5 border border-gray-100 dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card shadow-sm space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <ListSkeleton count={4} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
