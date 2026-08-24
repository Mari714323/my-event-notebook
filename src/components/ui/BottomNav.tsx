'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map as MapIcon } from 'lucide-react';

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="max-w-5xl mx-auto flex justify-around items-center h-16 px-4">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">ホーム</span>
        </Link>
        <Link 
          href="/venues" 
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/venues' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <MapIcon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">マップ</span>
        </Link>
      </div>
    </nav>
  );
};