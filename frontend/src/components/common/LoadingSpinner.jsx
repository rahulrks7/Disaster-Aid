import React from 'react';

export const LoadingSpinner = ({ text = 'Loading data...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[160px]">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-t-red-500 border-r-transparent border-b-red-500 border-l-transparent animate-spin`}
      />
      {text && <p className="mt-3 text-sm text-slate-400 font-medium">{text}</p>}
    </div>
  );
};
