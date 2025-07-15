"use client";

import { useEffect, useState } from 'react';
import { ThreeDCardDemo } from './3d-card';

export function ThreeDCardClientOnly() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with similar dimensions during SSR
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="animate-pulse">
          <div className="bg-gray-300 h-60 w-full rounded-xl mb-4"></div>
          <div className="bg-gray-300 h-6 w-3/4 rounded mb-2"></div>
          <div className="bg-gray-300 h-4 w-1/2 rounded"></div>
        </div>
      </div>
    );
  }

  return <ThreeDCardDemo />;
}
