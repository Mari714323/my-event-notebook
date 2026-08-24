import React from 'react';
import Link from 'next/link';
import { Venue } from '../../types';
import { Map, History, X, MapPin } from 'lucide-react';

interface Props {
  venue: Venue | null;
  onClose: () => void;
}

export const VenueBottomSheet = ({ venue, onClose }: Props) => {
  if (!venue) return null;

  // Google Mapsの検索URLを生成（会場名と緯度経度を渡して正確にピンを立てる）
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name)}+${venue.location.lat},${venue.location.lng}`;

  return (
    <>
      {/* 背景の半透明オーバーレイ（タップで閉じる） */}
      <div 
        className="fixed inset-0 bg-black/20 z-[1000] transition-opacity"
        onClick={onClose}
      />

      {/* ボトムシート本体 */}
      <div className="fixed bottom-16 left-0 right-0 z-[1001] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 max-w-5xl mx-auto transform transition-transform duration-300">
        
        {/* 閉じるボタン */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 会場ヘッダー情報 */}
        <div className="pr-8 mb-6">
          <h2 className="text-xl font-black text-gray-900 leading-tight mb-2">
            {venue.name}
          </h2>
          <div className="flex flex-col gap-1.5 text-sm font-bold text-gray-500">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-500" />
              {venue.location.address}
            </p>
            <p className="flex items-start gap-1.5">
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 mt-0.5">最寄</span>
              <span className="leading-snug">{venue.location.nearestStation}</span>
            </p>
          </div>
        </div>

        {/* アクションボタン群 */}
        <div className="flex flex-col gap-3">
          <a 
            href={googleMapsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            <Map className="w-5 h-5" />
            Google Mapで見る
          </a>
          
          <Link 
            href={`/venues/${venue.id}`}
            className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3.5 rounded-xl font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <History className="w-5 h-5" />
            この会場のアーカイブを見る
          </Link>
        </div>
      </div>
    </>
  );
};