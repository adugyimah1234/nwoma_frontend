// BlobsLoader.tsx
import React from "react";

export function BlobsLoader({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative w-24 h-24 ${className}`}
      aria-label="Loading"
      role="status"
    >
      <div className="absolute inset-0 animate-pulse bg-indigo-500 rounded-full blur-xl opacity-70"></div>
      <div className="absolute inset-2 animate-[wiggle_1.5s_infinite] bg-indigo-600 rounded-full blur-lg"></div>
      <div className="absolute inset-6 bg-indigo-700 rounded-full blur-md animate-[wiggle_2s_infinite]"></div>
    </div>
  );
}

