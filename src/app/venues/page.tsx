'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

// SSR（サーバーサイドレンダリング）を無効にしてMapContentを読み込む
const MapContentDynamic = dynamic(
  () => import('../../components/venues/MapContent').then((mod) => mod.MapContent),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <MapPin className="w-8 h-8 animate-bounce mb-3 text-blue-300" />
        <p className="text-sm font-bold">マップを読み込み中...</p>
      </div>
    ) 
  }
);

export default function VenuesMapPage() {
  return (
    <div className="max-w-5xl mx-auto w-full bg-white relative">
      <MapContentDynamic />
    </div>
  );
}